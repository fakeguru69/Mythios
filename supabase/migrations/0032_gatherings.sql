-- The Gathering online (build step 5; Core Rules §1 "The Gathering", §4 "The Gathering Battle", §5 "United Effort",
-- §11 "How a session runs", §12a "The Gathering"). One shared place in the script for the whole party, kept by the
-- server: every die is rolled here, shared buttons count the first tap only, and every timer runs on the server's clock.
-- Phones poll gathering_tick() every two seconds; a tick also moves the night on when a wait has run out.
-- The scripts are canon's Day 7, as the demo plays them (scripts/gen-gathering-sql.ts). A phone only ever receives the
-- steps already reached, so nothing later in the night (or the season) reaches it early.
-- Additive: new tables and new functions only.

create table public.gathering_scripts (
  series_id text not null references public.series (id),
  season_number int not null,
  week int not null,
  data jsonb not null, -- { meta, steps, ue }
  primary key (series_id, season_number, week)
);
alter table public.gathering_scripts enable row level security;
revoke all on public.gathering_scripts from anon, authenticated;

-- One Gathering per party per week. opens_at: when the lobby opens (the time the host pinned; 8:00pm by default).
create table public.gatherings (
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null check (week between 1 and 6),
  opens_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  cursor int not null default 0,       -- the step the night is on
  wait_until timestamptz,              -- when the step's wait runs out
  version int not null default 0,      -- bumped on every change, so a phone reloads only when something changed
  state jsonb not null default '{}'::jsonb,
  primary key (party_id, week)
);
alter table public.gatherings enable row level security;
revoke all on public.gatherings from anon, authenticated;

-- Who has the Gathering open ("here", Core Rules §12a): last_at is refreshed by every tick.
create table public.gathering_present (
  party_id uuid not null,
  week int not null,
  user_id uuid not null,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (party_id, week, user_id),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);
alter table public.gathering_present enable row level security;
revoke all on public.gathering_present from anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_word(p_n int) returns text language sql immutable set search_path = '' as $$
  select coalesce((array['one', 'two', 'three', 'four', 'five', 'six'])[p_n], p_n::text);
$$;

-- The party list (Core Rules §12a): the host, then friends in the order they finished Session Zero.
create function public.g_party_order(p_party uuid) returns uuid[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(m.user_id order by (m.user_id = p.host_id) desc, m.session_zero_done_at, m.joined_at), '{}')
  from public.party_members m join public.parties p on p.id = m.party_id
  where m.party_id = p_party and m.status = 'approved' and m.session_zero_done_at is not null;
$$;

create function public.g_name(p_party uuid, p_user uuid) returns text language sql stable security definer set search_path = '' as $$
  select character_name from public.party_members where party_id = p_party and user_id = p_user;
$$;

-- "Mei", "Mei and Jo", "Mei, Jo and Dev", in party-list order.
create function public.g_names(p_party uuid, p_users uuid[]) returns text language sql stable security definer set search_path = '' as $$
  select case when cardinality(a) = 0 then '' when cardinality(a) = 1 then a[1]
              else array_to_string(a[1:cardinality(a) - 1], ', ') || ' and ' || a[cardinality(a)] end
  from (select coalesce(array_agg(public.g_name(p_party, o.u) order by o.ord) filter (where o.u = any(p_users)), '{}') a
        from unnest(public.g_party_order(p_party)) with ordinality o(u, ord)) x;
$$;

-- Friends here now (the Gathering open in the last 30 seconds), in party-list order.
create function public.g_here(p_party uuid, p_week int) returns uuid[] language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(o.u order by o.ord), '{}')
  from unnest(public.g_party_order(p_party)) with ordinality o(u, ord)
  where exists (select 1 from public.gathering_present gp where gp.party_id = p_party and gp.week = p_week
                and gp.user_id = o.u and gp.last_at > now() - interval '30 seconds');
$$;

create function public.g_script(p_party uuid, p_week int) returns jsonb language sql stable security definer set search_path = '' as $$
  select gs.data from public.gathering_scripts gs join public.parties p on p.series_id = gs.series_id and p.season_number = gs.season_number
  where p.id = p_party and gs.week = p_week;
$$;

-- Which Gathering the caller may open: one still running (it carries on past 5:00am, §12a), or today's on Day 7.
create function public.g_week(p_party uuid) returns int language plpgsql stable security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid()
                 and status = 'approved' and session_zero_done_at is not null) then
    raise exception 'not in this party';
  end if;
  select week into v_week from public.gatherings where party_id = p_party and started_at is not null and ended_at is null
  order by week desc limit 1;
  if v_week is not null then return v_week; end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_day = 7 then return v_week; end if;
  return null;
end;
$$;

-- The Gathering's row, made on first use: the lobby opens at 8:00pm on Day 7 on the party's clock until the host pins a time.
create function public.g_row(p_party uuid, p_week int) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.gatherings (party_id, week, opens_at)
  values (p_party, p_week, public.party_day_start(p_party, p_week, 7) + interval '15 hours')
  on conflict do nothing;
end;
$$;

-- Fill a line's stand-ins: {N} the party's size tonight as a word (capitalised at a sentence's start), {RISK} Gathering 1's
-- friend in the drop, {TAPPER} the friend who tapped the button before it, {CHOSEN} the friend the light lets go of.
create function public.g_fill(p_party uuid, p_text text, s jsonb) returns text language plpgsql stable security definer set search_path = '' as $$
declare v text := p_text; w text := public.g_word(coalesce((s ->> 'n')::int, 1));
begin
  if v is null then return null; end if;
  v := regexp_replace(v, '(^|[.!?]\s+|\n)\{N\}', '\1' || upper(left(w, 1)) || substr(w, 2), 'g');
  v := replace(v, '{N}', w);
  if s ? 'risk' then v := replace(v, '{RISK}', public.g_name(p_party, (s ->> 'risk')::uuid)); end if;
  v := replace(v, '{TAPPER}', coalesce(s ->> 'tapper', 'One of you'));
  if s ? 'chosen' then v := replace(v, '{CHOSEN}', public.g_name(p_party, (s ->> 'chosen')::uuid)); end if;
  return v;
end;
$$;

-- Gold to one friend (never below 0), noted for their summary card.
create function public.g_earn(p_party uuid, p_user uuid, p_gold int, s jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform public.ensure_progress(p_party, p_user);
  update public.member_progress set gold = greatest(0, gold + p_gold) where party_id = p_party and user_id = p_user;
  return jsonb_set(s, array['earned', p_user::text],
    coalesce(s -> 'earned' -> p_user::text, '{}'::jsonb)
    || jsonb_build_object('gold', coalesce((s -> 'earned' -> p_user::text ->> 'gold')::int, 0) + p_gold));
end;
$$;

-- Spend one Relic of a friend's (not only the caller's): true if they had one.
create function public.g_spend(p_party uuid, p_user uuid, p_kind text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.member_progress set relics = jsonb_set(relics, array[p_kind], to_jsonb((relics ->> p_kind)::int - 1))
  where party_id = p_party and user_id = p_user and coalesce((relics ->> p_kind)::int, 0) >= 1;
  return found;
end;
$$;

create function public.g_relics(p_party uuid, p_user uuid, p_kind text) returns int language sql stable security definer set search_path = '' as $$
  select coalesce((relics ->> p_kind)::int, 0) from public.member_progress where party_id = p_party and user_id = p_user;
$$;

create function public.g_score(p_party uuid, p_user uuid, p_attr text) returns int language sql stable security definer set search_path = '' as $$
  select coalesce((attrs ->> p_attr)::int, 10) from public.member_progress where party_id = p_party and user_id = p_user;
$$;

-- A friend's highest Attribute among those a notice has lines for (ties: Might, Craft, Intellect, Charm, Agility, Aim).
create function public.g_top_attr(p_party uuid, p_user uuid, p_lines jsonb) returns text language sql stable security definer set search_path = '' as $$
  select a from unnest(array['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim']) with ordinality x(a, ord)
  where p_lines ? a order by public.g_score(p_party, p_user, a) desc, ord limit 1;
$$;

-- Append one entry to the night's log.
create function public.g_log(s jsonb, p_entry jsonb) returns jsonb language sql stable set search_path = '' as $$
  select jsonb_set(s, '{log}', coalesce(s -> 'log', '[]'::jsonb) || (p_entry || jsonb_build_object('at', now())));
$$;

-- Seconds a passage stays before the next follows by itself ("after a few seconds, or at once on [GO ON]", §11).
create function public.g_pace(p_text text) returns interval language sql immutable set search_path = '' as $$
  select make_interval(secs => least(20, greatest(5, ceil(char_length(coalesce(p_text, '')) / 25.0))));
$$;

-- Does a step's condition hold?
create function public.g_cond(p_cond jsonb, s jsonb) returns boolean language sql immutable set search_path = '' as $$
  select case p_cond ->> 'on'
    when 'approach' then (s -> 'approach' -> 'roll' ->> 'pass')::boolean is not distinct from (p_cond ->> 'pass')::boolean
                         and s -> 'approach' -> 'roll' is not null
    when 'ue' then s -> 'ue' ->> 'outcome' in ('won', 'lost') and ((s -> 'ue' ->> 'outcome') = 'won') = (p_cond ->> 'won')::boolean
    when 'pick' then (s ->> 'lastPick')::int is not distinct from (p_cond ->> 'option')::int
    when 'alone' then coalesce((s ->> 'n')::int, 1) <= 1
    else false end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- The Battle (Core Rules §4): every friend fights their own enemy, all fights in lockstep, one round every 10 seconds.
-- The same rules as src/data/gatheringEngine.ts (playBattleRound): the conditions of §12 (Week 2 the chant, Week 3
-- blade and torch, Week 4 knee-deep, Week 5 the hollowed, Week 6 half faithful and half hollowed), the Combat Relic
-- from the next round, reinforcement of the fight that most needs it, and the help-call below 50 HP.
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_battle_round(p_party uuid, p_week int, b jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  f jsonb[]; e jsonb[]; nf int; k int; h int; t int; r int; standing int; chant boolean;
  lines jsonb := '{}'::jsonb; reinforcers int[] := '{}'; helps jsonb := '[]'::jsonb; outcome text := 'ongoing';
  roll int; att int; def int; margin int; hit boolean; dmg int; before int; ln jsonb; best int; need int; bestneed int;
  phase int;
begin
  select array_agg(x order by o) into f from jsonb_array_elements(b -> 'fighters') with ordinality a(x, o);
  select array_agg(x order by o) into e from jsonb_array_elements(b -> 'foes') with ordinality a(x, o);
  nf := coalesce(array_length(f, 1), 0);
  r := coalesce((b ->> 'round')::int, 0) + 1;
  for k in 1..nf loop lines := lines || jsonb_build_object(f[k] ->> 'id', '[]'::jsonb); end loop;

  -- The round's start: Relics armed last round take effect; the torch's burn lands.
  for k in 1..nf loop
    if f[k] ->> 'relicPending' is not null then
      f[k] := f[k] || jsonb_build_object('relicFrom', f[k] ->> 'relicPending', 'relicPending', null);
    end if;
    if (f[k] ->> 'burn')::boolean then
      f[k] := f[k] || '{"burn": false}';
      if not (f[k] ->> 'fallen')::boolean then
        before := (f[k] ->> 'hp')::int;
        f[k] := f[k] || jsonb_build_object('hp', greatest(0, before - 2), 'fallen', before - 2 <= 0);
        lines := jsonb_set(lines, array[f[k] ->> 'id'], (lines -> (f[k] ->> 'id')) || jsonb_build_object(
          'attacker', 'The burn', 'target', f[k] ->> 'name', 'side', 'enemy', 'damage', 2, 'hpBefore', before,
          'hpAfter', (f[k] ->> 'hp')::int, 'note', 'Blade and torch: 2 more HP.'));
      end if;
    end if;
  end loop;

  -- The chant: DEF +1 while more than half of the enemies stand (judged at the round's start).
  select count(*) into standing from unnest(e) x where not coalesce((x ->> 'none')::boolean, false) and (x ->> 'hp')::int > 0;
  select standing > count(*) / 2.0 into chant from unnest(e) x where not coalesce((x ->> 'none')::boolean, false);
  -- Friends who had already won fight beside another friend.
  for k in 1..nf loop
    if not (f[k] ->> 'fallen')::boolean and (e[k] ->> 'hp')::int <= 0 then reinforcers := reinforcers || k; end if;
  end loop;

  for phase in 1..2 loop
    if (phase = 1) = (b ->> 'partyFirst')::boolean then
      -- The party strikes: each friend at their own enemy, then each reinforcer at the fight most in need.
      for k in 1..nf + coalesce(array_length(reinforcers, 1), 0) loop
        if k <= nf then
          h := k; t := k;
          if (f[h] ->> 'fallen')::boolean or (e[t] ->> 'hp')::int <= 0 then continue; end if;
        else
          h := reinforcers[k - nf];
          best := null; bestneed := null;
          for t in 1..nf loop
            if (e[t] ->> 'hp')::int <= 0 then continue; end if;
            need := case when (f[t] ->> 'fallen')::boolean then 0 else (f[t] ->> 'hp')::int end;
            if best is null or need < bestneed then best := t; bestneed := need; end if;
          end loop;
          if best is null then continue; end if;
          t := best;
        end if;
        if (f[h] ->> 'lose')::boolean then
          f[h] := f[h] || '{"lose": false}';
          ln := jsonb_build_object('attacker', f[h] ->> 'name', 'target', e[t] ->> 'name', 'side', 'party', 'lost', 'knee-deep');
        else
          roll := public.d20();
          att := (f[h] ->> 'weapon')::int + case when f[h] ->> 'relicFrom' is not null then 1 else 0 end;
          def := (e[t] ->> 'def')::int + case when chant and (p_week = 2 or (p_week = 6 and e[t] ->> 'kind' = 'faithful')) then 1 else 0 end;
          margin := roll + att - def; hit := margin >= 1; dmg := case when hit then margin * 5 else 0 end;
          before := (e[t] ->> 'hp')::int;
          e[t] := e[t] || jsonb_build_object('hp', greatest(0, before - dmg));
          if hit and (e[t] ->> 'hp')::int = 0 and (p_week = 5 or (p_week = 6 and e[t] ->> 'kind' = 'hollow'))
             and not (e[t] ->> 'risen')::boolean then
            e[t] := e[t] || '{"risen": true, "hp": 2, "lose": true}';
          end if;
          if p_week = 4 and roll <= 3 then f[h] := f[h] || '{"lose": true}'; end if;
          ln := jsonb_build_object('attacker', f[h] ->> 'name', 'target', e[t] ->> 'name', 'side', 'party', 'roll', roll,
            'attack', att, 'defence', def, 'margin', margin, 'hit', hit, 'damage', dmg, 'hpBefore', before, 'hpAfter', (e[t] ->> 'hp')::int);
        end if;
        if h <> t then ln := ln || jsonb_build_object('note', (f[h] ->> 'name') || ' fights beside ' || (f[t] ->> 'name') || '.'); end if;
        lines := jsonb_set(lines, array[f[t] ->> 'id'], (lines -> (f[t] ->> 'id')) || ln);
      end loop;
    else
      -- The enemies strike: a fallen friend's enemy stops; reinforcers cannot be hurt.
      for k in 1..nf loop
        if (e[k] ->> 'hp')::int <= 0 or (f[k] ->> 'fallen')::boolean or coalesce((e[k] ->> 'none')::boolean, false) then continue; end if;
        if (e[k] ->> 'lose')::boolean then
          ln := jsonb_build_object('attacker', e[k] ->> 'name', 'target', f[k] ->> 'name', 'side', 'enemy',
            'lost', case when (e[k] ->> 'risen')::boolean and (e[k] ->> 'hp')::int = 2 then 'risen' else 'knee-deep' end);
          e[k] := e[k] || '{"lose": false}';
        else
          roll := public.d20();
          def := (f[k] ->> 'armor')::int + case when f[k] ->> 'relicFrom' is not null then 1 else 0 end;
          margin := roll + (e[k] ->> 'atk')::int - def; hit := margin >= 1; dmg := case when hit then margin * 5 else 0 end;
          before := (f[k] ->> 'hp')::int;
          f[k] := f[k] || jsonb_build_object('hp', greatest(0, before - dmg), 'fallen', before - dmg <= 0);
          if hit and p_week = 3 then f[k] := f[k] || '{"burn": true}'; end if;
          if p_week = 4 and roll <= 3 then e[k] := e[k] || '{"lose": true}'; end if;
          ln := jsonb_build_object('attacker', e[k] ->> 'name', 'target', f[k] ->> 'name', 'side', 'enemy', 'roll', roll,
            'attack', (e[k] ->> 'atk')::int, 'defence', def, 'margin', margin, 'hit', hit, 'damage', dmg, 'hpBefore', before,
            'hpAfter', (f[k] ->> 'hp')::int);
        end if;
        lines := jsonb_set(lines, array[f[k] ->> 'id'], (lines -> (f[k] ->> 'id')) || ln);
      end loop;
    end if;
  end loop;

  -- Help-calls: once per friend, straight after the round their HP first fell below 50; lowest HP first.
  for k in select o from unnest(f) with ordinality a(x, o)
            where not (x ->> 'fallen')::boolean and (x ->> 'hp')::int < 50 and not (x ->> 'helpCalled')::boolean
            order by (x ->> 'hp')::int, o loop
    f[k] := f[k] || '{"helpCalled": true}';
    helps := helps || jsonb_build_object('id', f[k] ->> 'id', 'hp', (f[k] ->> 'hp')::int);
    insert into public.party_messages (party_id, kind, body)
    values (p_party, 'notice', upper(f[k] ->> 'name') || ' IS IN TROUBLE · HP ' || (f[k] ->> 'hp'));
  end loop;

  if not exists (select 1 from unnest(e) x where (x ->> 'hp')::int > 0) then outcome := 'won';
  elsif not exists (select 1 from unnest(f) x where not (x ->> 'fallen')::boolean) then outcome := 'lost';
  end if;

  return b || jsonb_build_object('round', r, 'fighters', to_jsonb(f), 'foes', to_jsonb(e), 'outcome', outcome,
    'help', helps, 'rounds', coalesce(b -> 'rounds', '[]'::jsonb) || jsonb_build_object('round', r, 'lines', lines));
end;
$$;

-- A friend joins the Battle (at its start, or late as a reinforcer: Core Rules §11 "Arriving during the Battle").
create function public.g_battle_join(p_party uuid, p_week int, b jsonb, p_user uuid, p_meta jsonb, p_late boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_w int; v_a int; v_kind text; v_idx int := jsonb_array_length(coalesce(b -> 'fighters', '[]'::jsonb));
begin
  if exists (select 1 from jsonb_array_elements(coalesce(b -> 'fighters', '[]'::jsonb)) x where x ->> 'id' = p_user::text) then
    return b;
  end if;
  perform public.ensure_progress(p_party, p_user);
  select 13 + weapon_level, 26 + armor_level into v_w, v_a from public.member_progress where party_id = p_party and user_id = p_user;
  v_kind := case when p_week = 6 then case when v_idx % 2 = 0 then 'faithful' else 'hollow' end else 'plain' end;
  return b || jsonb_build_object(
    'fighters', coalesce(b -> 'fighters', '[]'::jsonb) || jsonb_build_object('id', p_user, 'name', public.g_name(p_party, p_user),
      'weapon', v_w, 'armor', v_a, 'hp', 100, 'fallen', false, 'relicFrom', null, 'relicPending', null, 'lose', false,
      'burn', false, 'helpCalled', false, 'late', p_late),
    'foes', coalesce(b -> 'foes', '[]'::jsonb) || jsonb_build_object('owner', p_user,
      'name', case v_kind when 'faithful' then 'One of the faithful' when 'hollow' then 'One of the hollowed' else p_meta ->> 'enemy' end,
      'kind', v_kind, 'def', (p_meta ->> 'def')::int, 'atk', (p_meta ->> 'atk')::int,
      'hp', case when p_late then 0 else 100 end, 'none', p_late, 'risen', false, 'lose', false));
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- The United Effort (Core Rules §5): one friend at a time rolls the night's Attribute against the weekday DC.
-- A pass does 10 + d20 to the thing in the way; a fail to the thing at risk. One story line by band, never said twice.
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_ue_roll(p_party uuid, s jsonb, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u jsonb := s -> 'ue'; v_roller uuid := (s -> 'ue' ->> 'next')::uuid; v_attr text := p_data -> 'meta' ->> 'ueAttr';
        v_dc int := (p_data -> 'meta' ->> 'ueDc')::int; v_score int; v_tier int; v_relic int := 0; v_d20 int; v_margin int;
        v_success boolean; v_dmg_roll int; v_dmg int; v_bar text; v_before int; v_after int; v_start int := (u ->> 'start')::int;
        v_band int; v_used int; v_line text; v_between text; v_turn int; v_gone jsonb; v_rollers jsonb := u -> 'rollers'; v_out text;
begin
  -- A Relic armed for this roll (the roller's own matching one, or any Attribute Relic a friend gives): +4, spent now.
  if u -> 'relic' is not null and u -> 'relic' <> 'null'::jsonb then
    if public.g_spend(p_party, (u -> 'relic' ->> 'from')::uuid, u -> 'relic' ->> 'kind') then v_relic := 4; end if;
  end if;
  perform public.ensure_progress(p_party, v_roller);
  v_score := public.g_score(p_party, v_roller, v_attr);
  v_tier := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_margin := v_d20 + v_tier + v_relic - v_dc;
  v_success := v_margin >= 1;
  v_dmg_roll := public.d20();
  v_dmg := 10 + v_dmg_roll;
  v_bar := case when v_success then 'way' else 'risk' end;
  v_before := (u ->> v_bar)::int;
  v_after := greatest(0, v_before - v_dmg);
  v_band := case when v_after <= 0 then 0 when v_after <= v_start / 3.0 then 1 when v_after <= v_start * 2 / 3.0 then 2 else 3 end;
  select count(*) into v_used from jsonb_array_elements(u -> 'rolls') x
  where (x ->> 'success')::boolean = v_success and (x ->> 'band')::int = v_band;
  v_line := p_data -> 'ue' -> (case when v_success then 'success' else 'fail' end) -> v_band::text ->> v_used;
  v_turn := jsonb_array_length(u -> 'rolls') + 1;
  u := u || jsonb_build_object(v_bar, v_after);
  v_out := case when (u ->> 'way')::int <= 0 then 'won' when (u ->> 'risk')::int <= 0 then 'lost' else 'ongoing' end;
  if v_out = 'ongoing' and v_turn in (2, 4, 6) then v_between := p_data -> 'ue' -> 'between' ->> (v_turn / 2 - 1); end if;
  -- Nobody twice until everyone has gone once.
  v_gone := coalesce(u -> 'gone', '[]'::jsonb);
  if jsonb_array_length(v_gone) >= jsonb_array_length(v_rollers) then v_gone := '[]'::jsonb; end if;
  v_gone := v_gone || to_jsonb(v_roller::text);
  if jsonb_array_length(v_gone) >= jsonb_array_length(v_rollers) then v_gone := '[]'::jsonb; end if;
  u := u || jsonb_build_object('gone', v_gone, 'relic', null, 'outcome', v_out,
    'rolls', (u -> 'rolls') || jsonb_build_object('by', v_roller, 'name', public.g_name(p_party, v_roller), 'attr', v_attr,
      'score', v_score, 'bonus', v_tier, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc, 'margin', v_margin, 'success', v_success,
      'damageRoll', v_dmg_roll, 'damage', v_dmg, 'bar', v_bar, 'before', v_before, 'after', v_after, 'band', v_band,
      'line', public.g_fill(p_party, v_line, s), 'between', public.g_fill(p_party, v_between, s)));
  if v_out = 'ongoing' then
    -- The friend who has just rolled hands on (10 seconds), or MYTHIOS names the next.
    u := u || jsonb_build_object('phase', 'handon', 'by', v_roller);
  else
    u := u || jsonb_build_object('phase', 'done', 'next', null);
  end if;
  return jsonb_set(s, '{ue}', u);
end;
$$;

-- Friends who may roll next: nobody twice until all have gone.
create function public.g_ue_eligible(u jsonb) returns text[] language sql immutable set search_path = '' as $$
  select case when count(*) filter (where not coalesce(u -> 'gone', '[]'::jsonb) ? r) = 0 then array_agg(r order by o)
              else array_agg(r order by o) filter (where not coalesce(u -> 'gone', '[]'::jsonb) ? r) end
  from jsonb_array_elements_text(u -> 'rollers') with ordinality x(r, o);
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- The Approach roll (Core Rules §3, §11): the chosen friend's Daily Challenge for Day 7, at the Gathering DC, with the
-- map +2 when the party solved all six of the week's fragments (§15 item 7) and their own matching Attribute Relic (+4).
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_approach_roll(p_party uuid, p_week int, s jsonb, p_data jsonb, p_relic boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_roller uuid := (s -> 'approach' ->> 'roller')::uuid; v_step jsonb; v_way jsonb; v_attr text; v_score int; v_tier int;
        v_map int := 0; v_relic int := 0; v_dc int := (p_data -> 'meta' ->> 'dc')::int; v_d20 int; v_net int; v_pass boolean;
        v_growth int := 0; v_played int; v_series text; v_season int;
begin
  v_step := p_data -> 'steps' -> (s -> 'approach' ->> 'i')::int;
  v_way := v_step -> 'ways' -> coalesce((s ->> 'way')::int, 0);
  if v_way is null then v_way := v_step -> 'ways' -> 0; end if;
  v_attr := v_way ->> 'attr';
  perform public.ensure_progress(p_party, v_roller);
  v_score := public.g_score(p_party, v_roller, v_attr);
  v_tier := public.tier_bonus(v_score);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  if (select count(*) from public.fragment_words fw join public.fragments fr on fr.id = fw.fragment_id
      and fr.series_id = v_series and fr.season_number = v_season
      where fw.party_id = p_party and fr.week = p_week and fw.solved_by is not null) >= 12 then
    v_map := 2;
  end if;
  if p_relic and public.g_spend(p_party, v_roller, v_attr) then v_relic := 4; end if;
  v_d20 := public.d20();
  v_net := v_d20 + v_tier + v_map + v_relic - v_dc;
  v_pass := v_net >= 1;
  if v_pass then
    -- Growth as a Daily Challenge: the roller's nth day played this week (Day 7 is this one), only on an uncertain roll.
    if 1 + v_tier - v_dc < 1 and 20 + v_tier - v_dc >= 1 then
      select count(*) + 1 into v_played from public.member_days
      where party_id = p_party and user_id = v_roller and week = p_week and day < 7 and finished_at is not null;
      v_growth := greatest(1, round((array[12, 9, 7, 5, 4, 3, 3])[least(7, v_played)] * public.tier_rate(v_score))::int);
      update public.member_progress set attrs = jsonb_set(attrs, array[v_attr], to_jsonb(v_score + v_growth))
      where party_id = p_party and user_id = v_roller;
    end if;
    s := public.g_earn(p_party, v_roller, 500, s);
  else
    s := public.g_earn(p_party, v_roller, -150, s);
  end if;
  s := jsonb_set(s, array['earned', v_roller::text], (s -> 'earned' -> v_roller::text)
         || jsonb_build_object('growth', v_growth, 'attr', v_attr, 'rolled', true));
  return jsonb_set(s, '{approach}', (s -> 'approach') || jsonb_build_object('phase', 'done', 'roll', jsonb_build_object(
    'by', v_roller, 'name', public.g_name(p_party, v_roller), 'attr', v_attr, 'score', v_score, 'bonus', v_tier, 'map', v_map,
    'relic', v_relic, 'd20', v_d20, 'dc', v_dc, 'net', v_net, 'pass', v_pass, 'growth', v_growth)));
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- The night moves on: from the current step, show what follows until something waits (a passage being read, a
-- button, a vote, a roll, the Battle's next round). Called by every tick and every action, inside the row's lock.
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_advance(p_party uuid, p_week int) returns void
language plpgsql security definer set search_path = '' as $$
declare g public.gatherings; d jsonb; steps jsonb; n int; st jsonb; t text; s jsonb; v_cursor int; v_wait timestamptz;
        shown boolean; here uuid[]; v_guard int := 0; v_changed boolean := false; v_text text; v_k text; v_res int;
        v_cnt int; v_top int; v_pick jsonb; v_u uuid; v_list uuid[]; v_at timestamptz; v_entry jsonb; v_meta jsonb;
        v_b jsonb; v_elig text[]; v_limit int; v_sealed jsonb; v_fid text;
begin
  select * into g from public.gatherings where party_id = p_party and week = p_week for update;
  if g.started_at is null or g.ended_at is not null then return; end if;
  d := public.g_script(p_party, p_week); steps := d -> 'steps'; n := jsonb_array_length(steps); v_meta := d -> 'meta';
  s := g.state; v_cursor := g.cursor; v_wait := g.wait_until;
  here := public.g_here(p_party, p_week);

  -- Friends who arrive after the start join the night (and, during the Battle, fight as reinforcers).
  for v_u in select x from unnest(here) x where not (coalesce(s -> 'order', '[]'::jsonb) ? x::text) loop
    s := jsonb_set(s, '{order}', coalesce(s -> 'order', '[]'::jsonb) || to_jsonb(v_u::text));
    if s -> 'battle' is not null and s -> 'battle' ->> 'outcome' = 'ongoing' then
      s := jsonb_set(s, '{battle}', public.g_battle_join(p_party, p_week, s -> 'battle', v_u, v_meta, true));
    end if;
    v_changed := true;
  end loop;

  <<steps_loop>>
  loop
    v_guard := v_guard + 1;
    exit when v_guard > 400;
    if v_cursor >= n then
      update public.gatherings set ended_at = coalesce(ended_at, now()) where party_id = p_party and week = p_week;
      v_changed := true;
      exit;
    end if;
    st := steps -> v_cursor; t := st ->> 't';
    shown := (s -> 'log' -> -1 ->> 'i')::int is not distinct from v_cursor;
    if not shown and st ? 'cond' and not public.g_cond(st -> 'cond', s) then v_cursor := v_cursor + 1; continue; end if;
    if not shown and (st ->> 'ifTapped')::boolean and not (s -> 'tapped' ? (v_cursor - 1)::text) then v_cursor := v_cursor + 1; continue; end if;

    if t in ('tonight', 'ueEnd') then
      v_cursor := v_cursor + 1;
    elsif t = 'section' then
      s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'section', 'title', st ->> 'title'));
      v_cursor := v_cursor + 1; v_changed := true;

    elsif t in ('say', 'notice', 'lookCloser') then
      if not shown then
        if t = 'say' then
          -- Gathering 6's act: the light lets go of one friend, chosen at random, leaving out the Approach's roller
          -- (in a party of two or one, from everyone). "It is not a race."
          if st ->> 'text' like '%{CHOSEN}%' and not s ? 'chosen' then
            select x into v_u from unnest(here) x
            where coalesce(array_length(here, 1), 0) <= 2 or x::text is distinct from s -> 'approach' ->> 'roller'
            order by random() limit 1;
            if v_u is null then select x::uuid into v_u from jsonb_array_elements_text(s -> 'order') x order by random() limit 1; end if;
            s := s || jsonb_build_object('chosen', v_u);
          end if;
          v_text := public.g_fill(p_party, st ->> 'text', s);
          if st ? 'nameOf' then
            -- "Say a name": each line with the friends who said it; a name nobody picked is posted all the same.
            select array_agg(key::uuid) into v_list from jsonb_each(coalesce(s -> 'picks' -> (s ->> 'namesAt'), '{}'::jsonb))
            where value::int = (st ->> 'nameOf')::int;
            if v_list is not null then v_text := v_text || ' *' || public.g_names(p_party, v_list) || '.*'; end if;
          end if;
          s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'say', 'text', v_text, 'alone', coalesce((st ->> 'alone')::boolean, false)));
          v_wait := now() + public.g_pace(v_text);
        else
          s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', t));
          v_wait := now() + interval '8 seconds';
        end if;
        v_changed := true;
        exit;
      elsif now() >= v_wait then
        v_cursor := v_cursor + 1;
      else
        exit;
      end if;

    elsif t = 'act' then
      -- [LOOK CLOSER] is offered by the roll card that follows it, to each friend in their own thread.
      if st ->> 'label' = 'LOOK CLOSER' and steps -> (v_cursor + 1) ->> 't' = 'lookCloser' then v_cursor := v_cursor + 1; continue; end if;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'act', 'label', public.g_fill(p_party, st ->> 'label', s)));
        v_wait := case when st ? 'timeout' then now() + make_interval(secs => (st ->> 'timeout')::int) else null end;
        v_changed := true;
        exit;
      elsif s -> 'tapped' ? v_cursor::text then
        v_cursor := v_cursor + 1;
      elsif v_wait is not null and now() >= v_wait then
        v_cursor := v_cursor + 1;
      else
        exit;
      end if;

    elsif t = 'pick' then
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'pick'));
        s := jsonb_set(s, array['picks', v_k], '{}'::jsonb);
        v_wait := now() + case st ->> 'mode' when 'vote' then interval '30 seconds' when 'private' then interval '30 seconds'
                                             when 'chosen' then interval '50 seconds' else interval '20 seconds' end;
        if st ->> 'mode' = 'each' then s := s || jsonb_build_object('namesAt', v_k); end if;
        v_changed := true;
        exit;
      end if;
      if s -> 'result' ? v_k then v_cursor := v_cursor + 1; continue; end if;
      select count(*) into v_cnt from jsonb_object_keys(s -> 'picks' -> v_k);
      v_res := null;
      if st ->> 'mode' = 'vote' then
        -- The group Choice: the majority after 30 seconds, or sooner once everyone here has tapped; a tie goes to the
        -- first vote cast. With no vote yet, it waits for the first.
        if v_cnt > 0 and (now() >= v_wait or v_cnt >= coalesce(array_length(here, 1), 0)) then
          select (x.value ->> 'o')::int into v_res from (
            select v.value, count(*) over (partition by v.value ->> 'o') c, v.ordinality o
            from jsonb_array_elements(s -> 'votes' -> v_k) with ordinality v) x
          order by x.c desc, x.o limit 1;
          s := s || jsonb_build_object('way', v_res);
        end if;
      elsif st ->> 'mode' = 'private' then
        -- Gathering 6, the fifth: private picks, shown together after 30 seconds; the majority decides, a tie holds it back.
        if now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0)) then
          select case when count(*) filter (where value::int = 0) > count(*) filter (where value::int = 1) then 0 else 1 end
          into v_res from jsonb_each(s -> 'picks' -> v_k);
        end if;
      elsif st ->> 'mode' = 'chosen' then
        -- Gathering 6, the act: thirty seconds for the others to talk, then twenty for the chosen friend; no tap is [DO NOTHING].
        if s -> 'picks' -> v_k ? (s ->> 'chosen') then v_res := (s -> 'picks' -> v_k ->> (s ->> 'chosen'))::int;
        elsif now() >= v_wait then v_res := jsonb_array_length(st -> 'options') - 1;
        end if;
      else
        -- "Say a name": every friend picks in private; after twenty seconds (or once all have) the lines are posted.
        if now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0)) then v_res := -1; end if;
      end if;
      if v_res is null then exit; end if;
      s := jsonb_set(s, array['result', v_k], to_jsonb(v_res));
      if st ->> 'mode' <> 'vote' and v_res >= 0 then s := s || jsonb_build_object('lastPick', v_res); end if;
      v_cursor := v_cursor + 1; v_changed := true;

    elsif t = 'approach' then
      v_u := null;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'approach'));
        s := s || jsonb_build_object('approach', jsonb_build_object('i', v_cursor, 'phase', 'volunteer', 'vols', '[]'::jsonb));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'approach' ->> 'phase' = 'volunteer' then
        -- Who rolls (§11): of those who step up, whoever has rolled fewest Approaches this season (a tie: the first tap).
        -- The window closes 30 seconds after the card, 10 seconds after the first step-up, or once everyone has stepped up.
        if jsonb_array_length(s -> 'approach' -> 'vols') > 0 and (now() >= v_wait
           or jsonb_array_length(s -> 'approach' -> 'vols') >= coalesce(array_length(here, 1), 0)) then
          select (v.value ->> 'u')::uuid into v_u from jsonb_array_elements(s -> 'approach' -> 'vols') with ordinality v
          order by (select count(*) from public.gatherings g2 where g2.party_id = p_party and g2.week <> p_week
                    and g2.state -> 'approach' ->> 'roller' = v.value ->> 'u'), v.ordinality limit 1;
        elsif now() >= v_wait then
          -- Nobody stepped up: the friend who has rolled fewest at Gatherings this season, then the party list.
          select x into v_u from unnest(case when coalesce(array_length(here, 1), 0) > 0 then here
                                        else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end)
                 with ordinality o(x, ord)
          order by (select count(*) from public.gatherings g2 where g2.party_id = p_party and g2.week <> p_week
                    and g2.state -> 'approach' ->> 'roller' = x::text), ord limit 1;
        end if;
        if v_u is null then exit; end if;
        s := jsonb_set(s, '{approach}', (s -> 'approach') || jsonb_build_object('phase', 'roll', 'roller', v_u,
               'stepped', exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_u::text)));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      elsif s -> 'approach' ->> 'phase' = 'roll' then
        -- The roller taps [ROLL]; if they do not within 30 seconds, the server rolls for them (no Relic).
        if now() >= v_wait then
          s := public.g_approach_roll(p_party, p_week, s, d, false);
          v_changed := true;
        else
          exit;
        end if;
      else
        v_cursor := v_cursor + 1;
      end if;

    elsif t = 'battle' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'battle'));
        v_b := jsonb_build_object('round', 0, 'partyFirst', coalesce((s -> 'approach' -> 'roll' ->> 'pass')::boolean, true),
                                  'outcome', 'ongoing', 'fighters', '[]'::jsonb, 'foes', '[]'::jsonb, 'rounds', '[]'::jsonb, 'help', '[]'::jsonb);
        for v_u in select x from unnest(case when coalesce(array_length(here, 1), 0) > 0 then here
                                        else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end) x loop
          v_b := public.g_battle_join(p_party, p_week, v_b, v_u, v_meta, false);
        end loop;
        s := s || jsonb_build_object('battle', v_b);
        v_wait := now() + interval '10 seconds'; -- "The fight begins in 10 seconds"
        v_changed := true;
        exit;
      end if;
      if s -> 'battle' ->> 'outcome' = 'ongoing' then
        if now() < v_wait then exit; end if;
        s := jsonb_set(s, '{battle}', public.g_battle_round(p_party, p_week, s -> 'battle'));
        if p_week = 1 and s -> 'battle' ->> 'outcome' <> 'ongoing' then
          -- Gathering 1: the friend in the drop is the one who fell in the Battle, or else who finished it with the least
          -- HP (set now, as the scene before the United Effort already names them).
          select (x ->> 'id')::uuid into v_u from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o)
          where not coalesce((x ->> 'late')::boolean, false)
          order by (x ->> 'fallen')::boolean desc, (x ->> 'hp')::int, o limit 1;
          s := s || jsonb_build_object('risk', v_u);
        end if;
        if s -> 'battle' ->> 'outcome' = 'won' then
          -- Every friend in the Battle is paid its reward when the party wins, whoever landed the last blow.
          for v_u in select (x ->> 'id')::uuid from jsonb_array_elements(s -> 'battle' -> 'fighters') x loop
            s := public.g_earn(p_party, v_u, (v_meta ->> 'reward')::int, s);
          end loop;
        end if;
        v_wait := now() + interval '10 seconds'; -- a shared pause between rounds, and after the last before the night goes on
        v_changed := true;
        exit;
      end if;
      if now() < v_wait then exit; end if;
      v_cursor := v_cursor + 1;

    elsif t = 'ue' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'ue'));
        v_list := case when coalesce(array_length(here, 1), 0) > 0 then here
                       else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end;
        -- Gathering 1: the friend in the drop is the one who fell in the Battle, or else who finished it with the least HP.
        -- They are being hauled, so they do not roll; a friend alone is in the drop and hauls themselves.
        if p_week = 1 then
          if not s ? 'risk' then s := s || jsonb_build_object('risk', v_list[1]); end if;
          if array_length(v_list, 1) > 1 then v_list := array_remove(v_list, (s ->> 'risk')::uuid); end if;
        end if;
        -- MYTHIOS names the first friend: at random from those who have not rolled tonight.
        select x into v_u from unnest(v_list) x order by (x::text is not distinct from s -> 'approach' ->> 'roller'), random() limit 1;
        s := s || jsonb_build_object('ue', jsonb_build_object('start', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'way', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'risk', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'rollers', to_jsonb(v_list::text[]), 'gone', '[]'::jsonb, 'rolls', '[]'::jsonb, 'outcome', 'ongoing',
          'phase', 'roll', 'next', v_u, 'relic', null));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'ue' ->> 'phase' = 'roll' then
        if now() < v_wait then exit; end if;
        s := public.g_ue_roll(p_party, s, d); -- the roller did not tap in 30 seconds: the server rolls for them
        v_wait := now() + interval '10 seconds';
        v_changed := true;
        if s -> 'ue' ->> 'outcome' <> 'ongoing' then
          if s -> 'ue' ->> 'outcome' = 'won' then
            for v_u in select x::uuid from jsonb_array_elements_text(s -> 'order') x loop s := public.g_earn(p_party, v_u, 300, s); end loop;
          end if;
          v_wait := now() + interval '8 seconds';
        end if;
        exit;
      elsif s -> 'ue' ->> 'phase' = 'handon' then
        if now() < v_wait then exit; end if;
        v_elig := public.g_ue_eligible(s -> 'ue');
        s := jsonb_set(s, '{ue}', (s -> 'ue') || jsonb_build_object('phase', 'roll', 'next', v_elig[1], 'named', true));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      else
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
      end if;

    elsif t = 'match' then
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'match'));
        s := jsonb_set(s, array['match', v_k], jsonb_build_object('picks', '{}'::jsonb, 'done', false));
        v_wait := now() + interval '60 seconds';
        v_changed := true;
        exit;
      end if;
      if (s -> 'match' -> v_k ->> 'done')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
        continue;
      end if;
      select count(*) into v_cnt from jsonb_object_keys(s -> 'match' -> v_k -> 'picks');
      if not (now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0))) then exit; end if;
      -- The right row lights up with those who matched it; a wrong pick is never shown. 50g a right pick, 100g if every
      -- friend here is right.
      v_fid := st ->> 'answer';
      select array_agg(key::uuid) into v_list from jsonb_each_text(s -> 'match' -> v_k -> 'picks') where value = v_fid;
      v_top := case when v_list is not null and coalesce(array_length(here, 1), 0) > 0
                     and here <@ v_list then 100 else 50 end;
      if v_list is not null then
        foreach v_u in array v_list loop
          s := public.g_earn(p_party, v_u, v_top, s);
          s := jsonb_set(s, array['earned', v_u::text, 'match'], to_jsonb(coalesce((s -> 'earned' -> v_u::text ->> 'match')::int, 0) + 1));
        end loop;
      end if;
      s := jsonb_set(s, array['match', v_k], (s -> 'match' -> v_k) || jsonb_build_object('done', true,
             'right', to_jsonb(coalesce(v_list, '{}')::text[]), 'all', v_list is not null and here <@ v_list, 'pay', v_top));
      s := s || jsonb_build_object('matches', coalesce((s ->> 'matches')::int, 0) + 1);
      v_wait := now() + interval '6 seconds';
      v_changed := true;
      exit;

    elsif t = 'turn' then
      -- A question to the table (§11): it holds until a friend answers; one nudge after sixty quiet seconds, the
      -- answer after ninety. MYTHIOS never grades what a friend says.
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'turn'));
        s := jsonb_set(s, array['turn', v_k], '{}'::jsonb);
        v_wait := now() + interval '60 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'turn' -> v_k ? 'by' or (s -> 'turn' -> v_k ->> 'given')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
      elsif now() >= v_wait and not coalesce((s -> 'turn' -> v_k ->> 'nudged')::boolean, false) and st ? 'nudge' then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || '{"nudged": true}');
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      elsif now() >= v_wait then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || '{"given": true}');
        v_wait := now() + public.g_pace(st ->> 'answer');
        v_changed := true;
        exit;
      else
        exit;
      end if;

    elsif t = 'ask' then
      -- The Ask board (§11): one question per friend (two each in a party of two, four alone). It closes when every
      -- friend has asked, on [GO ON], or after two quiet minutes; a sealed question nobody asked is answered anyway.
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'ask'));
        s := jsonb_set(s, array['ask', v_k], jsonb_build_object('asked', '[]'::jsonb, 'done', false));
        v_wait := now() + interval '2 minutes';
        v_changed := true;
        exit;
      end if;
      if (s -> 'ask' -> v_k ->> 'done')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
        continue;
      end if;
      v_limit := case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end;
      if now() >= v_wait or (s -> 'ask' -> v_k ->> 'closing')::boolean
         or jsonb_array_length(s -> 'ask' -> v_k -> 'asked') >= least(jsonb_array_length(st -> 'rows'),
              v_limit * greatest(1, jsonb_array_length(coalesce(s -> 'order', '[]'::jsonb)))) then
        select coalesce(jsonb_agg(o - 1 order by o), '[]'::jsonb) into v_sealed
        from jsonb_array_elements(st -> 'rows') with ordinality r(x, o)
        where (x ->> 'sealed')::boolean
          and not exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1);
        s := jsonb_set(s, array['ask', v_k], (s -> 'ask' -> v_k) || jsonb_build_object('done', true, 'unasked', v_sealed));
        v_wait := now() + interval '5 seconds' + jsonb_array_length(v_sealed) * interval '6 seconds';
        v_changed := true;
      end if;
      exit;

    elsif t = 'summary' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'summary'));
        v_changed := true;
      end if;
      v_cursor := v_cursor + 1;
    else
      v_cursor := v_cursor + 1;
    end if;
  end loop;

  if v_changed or v_cursor <> g.cursor or v_wait is distinct from g.wait_until then
    update public.gatherings set state = s, cursor = v_cursor, wait_until = v_wait, version = version + 1
    where party_id = p_party and week = p_week;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- What a friend's phone shows: the night so far (only the steps reached), the shared cards with their live state,
-- and what is theirs alone (their notice, [LOOK CLOSER], their picks, their summary card).
-- ---------------------------------------------------------------------------------------------------------------

create function public.g_view(p_party uuid, p_week int, p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare g public.gatherings; d jsonb; s jsonb; steps jsonb; meta jsonb; e jsonb; st jsonb; out jsonb := '[]'::jsonb; item jsonb;
        here uuid[]; v_k text; v_attr text; v_fell boolean; v_series text; v_season int; v_rows jsonb; v_res int; v_me text := p_user::text;
        v_earn jsonb; v_lines jsonb; v_line text; v_gold int; v_parts text[]; v_tz text; v_ue_won boolean; v_asked int;
begin
  select * into g from public.gatherings where party_id = p_party and week = p_week;
  d := public.g_script(p_party, p_week); steps := d -> 'steps'; meta := d -> 'meta'; s := g.state;
  here := public.g_here(p_party, p_week);
  select series_id, season_number, time_zone into v_series, v_season, v_tz from public.parties where id = p_party;
  v_fell := exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = v_me and (x ->> 'fallen')::boolean);
  v_ue_won := s -> 'ue' ->> 'outcome' = 'won';

  for e in select x from jsonb_array_elements(coalesce(s -> 'log', '[]'::jsonb)) x loop
    st := steps -> (e ->> 'i')::int; v_k := e ->> 'i'; item := e;
    case e ->> 't'
      when 'act' then
        item := item || jsonb_build_object('by', s -> 'tappedBy' -> v_k, 'tapped', s -> 'tapped' ? v_k);
      when 'notice' then
        if v_fell and st -> 'lines' ? 'floor' then
          item := item || jsonb_build_object('attr', 'floor', 'text', public.g_fill(p_party, st -> 'lines' ->> 'floor', s));
        else
          v_attr := public.g_top_attr(p_party, p_user, st -> 'lines');
          item := item || jsonb_build_object('attr', v_attr, 'text', public.g_fill(p_party, st -> 'lines' ->> v_attr, s));
        end if;
      when 'lookCloser' then
        v_attr := public.g_top_attr(p_party, p_user, st -> 'lines');
        item := item || jsonb_build_object('attr', v_attr,
          'offered', not v_fell and not (p_week = 5 and s -> 'ue' ->> 'outcome' = 'lost') and s -> 'order' ? v_me,
          'mine', s -> 'look' -> v_me,
          'line', case when (s -> 'look' -> v_me ->> 'pass')::boolean then public.g_fill(p_party, st -> 'lines' ->> (s -> 'look' -> v_me ->> 'attr'), s) end,
          'score', public.g_score(p_party, p_user, v_attr), 'dc', (meta ->> 'dc')::int);
      when 'pick' then
        v_res := (s -> 'result' ->> v_k)::int;
        item := item || jsonb_build_object('mode', st ->> 'mode', 'question', st ->> 'question', 'options', st -> 'options',
          'mine', s -> 'picks' -> v_k -> v_me, 'result', v_res, 'count', (select count(*) from jsonb_object_keys(coalesce(s -> 'picks' -> v_k, '{}'::jsonb))),
          'chosen', case when st ->> 'mode' = 'chosen' then public.g_name(p_party, (s ->> 'chosen')::uuid) end,
          'chosenIsMe', st ->> 'mode' = 'chosen' and s ->> 'chosen' = v_me,
          'chooseFrom', case when st ->> 'mode' = 'chosen' then (e ->> 'at')::timestamptz + interval '30 seconds' end,
          -- Who voted for what shows for a group vote; private picks only once shown together.
          'votes', case when st ->> 'mode' = 'vote' or v_res is not null then
            (select coalesce(jsonb_agg(jsonb_build_object('name', public.g_name(p_party, key::uuid), 'o', value::int)), '[]'::jsonb)
             from jsonb_each(coalesce(s -> 'picks' -> v_k, '{}'::jsonb))) end);
      when 'approach' then
        item := item || jsonb_build_object('title', st ->> 'title', 'ways', st -> 'ways', 'reward', st ->> 'reward', 'fail', public.g_fill(p_party, st ->> 'fail', s),
          'way', coalesce((s ->> 'way')::int, 0), 'phase', s -> 'approach' ->> 'phase',
          'stepped', (select coalesce(jsonb_agg(public.g_name(p_party, (v.value ->> 'u')::uuid)), '[]'::jsonb) from jsonb_array_elements(s -> 'approach' -> 'vols') v),
          'iStepped', exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_me),
          'roller', public.g_name(p_party, (s -> 'approach' ->> 'roller')::uuid), 'rollerIsMe', s -> 'approach' ->> 'roller' = v_me,
          'roll', s -> 'approach' -> 'roll', 'dc', (meta ->> 'dc')::int,
          'map', (select count(*) from public.fragment_words fw join public.fragments fr on fr.id = fw.fragment_id
                  and fr.series_id = v_series and fr.season_number = v_season
                  where fw.party_id = p_party and fr.week = p_week and fw.solved_by is not null) >= 12);
      when 'battle' then
        item := item || jsonb_build_object('name', coalesce(nullif(st ->> 'name', ''), meta ->> 'enemy'),
          'desc', public.g_fill(p_party, st ->> 'desc', s), 'condition', meta ->> 'condition',
          'firstLine', case when st -> 'firstLines' is not null and st -> 'firstLines' <> 'null'::jsonb then
            st -> 'firstLines' ->> (case when (s -> 'battle' ->> 'partyFirst')::boolean then 0 else 1 end) end,
          'def', (meta ->> 'def')::int, 'atk', (meta ->> 'atk')::int, 'reward', (meta ->> 'reward')::int,
          'round', s -> 'battle' -> 'round', 'outcome', s -> 'battle' ->> 'outcome', 'partyFirst', s -> 'battle' -> 'partyFirst',
          'fighters', (select jsonb_agg(jsonb_build_object('id', x ->> 'id', 'name', x ->> 'name', 'hp', x -> 'hp', 'fallen', x -> 'fallen',
                         'weapon', x -> 'weapon', 'armor', x -> 'armor', 'relic', x ->> 'relicFrom', 'relicPending', x ->> 'relicPending',
                         'late', x -> 'late', 'foe', (s -> 'battle' -> 'foes' -> (o::int - 1)) - 'owner'))
                       from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o)),
          -- Each friend's rounds show in their own thread: only the caller's fight comes down.
          -- A friend fighting beside another sees their own strikes in that fight too.
          'myRounds', (select coalesce(jsonb_agg(jsonb_build_object('round', r -> 'round', 'lines',
                         coalesce(r -> 'lines' -> v_me, '[]'::jsonb) || (select coalesce(jsonb_agg(l), '[]'::jsonb) from jsonb_each(r -> 'lines') fl,
                           jsonb_array_elements(fl.value) l where fl.key <> v_me and l ->> 'attacker' = public.g_name(p_party, p_user)))
                         order by (r ->> 'round')::int), '[]'::jsonb)
                       from jsonb_array_elements(s -> 'battle' -> 'rounds') r where r -> 'lines' ? v_me),
          -- An open help-call; while a Combat Relic already helps that friend, the offer is hidden (§12a).
          'help', (select coalesce(jsonb_agg(h || jsonb_build_object('name', public.g_name(p_party, (h ->> 'id')::uuid),
                     'canTake', exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = h ->> 'id'
                       and not (x ->> 'fallen')::boolean and x ->> 'relicFrom' is null and x ->> 'relicPending' is null))), '[]'::jsonb)
                   from jsonb_array_elements(coalesce(s -> 'battle' -> 'help', '[]'::jsonb)) h));
      when 'ue' then
        item := item || jsonb_build_object('title', meta ->> 'ueTitle', 'attr', meta ->> 'ueAttr', 'dc', (meta ->> 'ueDc')::int,
          'barWay', meta ->> 'barWay', 'barRisk', public.g_fill(p_party, meta ->> 'barRisk', s),
          'start', s -> 'ue' -> 'start', 'way', s -> 'ue' -> 'way', 'risk', s -> 'ue' -> 'risk', 'outcome', s -> 'ue' ->> 'outcome',
          'phase', s -> 'ue' ->> 'phase', 'next', public.g_name(p_party, (s -> 'ue' ->> 'next')::uuid), 'nextIsMe', s -> 'ue' ->> 'next' = v_me,
          'named', coalesce((s -> 'ue' ->> 'named')::boolean, false),
          'handerIsMe', s -> 'ue' ->> 'phase' = 'handon' and s -> 'ue' ->> 'by' = v_me,
          'eligible', (select coalesce(jsonb_agg(jsonb_build_object('id', x, 'name', public.g_name(p_party, x::uuid))), '[]'::jsonb)
                       from unnest(public.g_ue_eligible(s -> 'ue')) x),
          'rolls', s -> 'ue' -> 'rolls', 'relic', case when s -> 'ue' -> 'relic' is not null and s -> 'ue' -> 'relic' <> 'null'::jsonb then
            jsonb_build_object('kind', s -> 'ue' -> 'relic' ->> 'kind', 'from', public.g_name(p_party, (s -> 'ue' -> 'relic' ->> 'from')::uuid),
                               'mine', s -> 'ue' -> 'relic' ->> 'from' = v_me) end,
          'myScore', public.g_score(p_party, p_user, meta ->> 'ueAttr'),
          'nextScore', public.g_score(p_party, (s -> 'ue' ->> 'next')::uuid, meta ->> 'ueAttr'));
      when 'match' then
        -- The week's six fragments as rows; the answer and its source only once revealed.
        select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'day', f.day, 'place', f.place_label,
                 'text', replace(replace(f.template, '{0}', f.word1), '{1}', f.word2)) order by f.day), '[]'::jsonb)
          into v_rows from public.fragments f where f.series_id = v_series and f.season_number = v_season and f.week = p_week;
        item := item || jsonb_build_object('question', st ->> 'question', 'quote', st ->> 'quote', 'rows', v_rows,
          'mine', s -> 'match' -> v_k -> 'picks' ->> v_me,
          'picked', (select coalesce(jsonb_agg(public.g_name(p_party, key::uuid)), '[]'::jsonb) from jsonb_object_keys(s -> 'match' -> v_k -> 'picks') key),
          'done', s -> 'match' -> v_k -> 'done');
        if (s -> 'match' -> v_k ->> 'done')::boolean then
          item := item || jsonb_build_object('answer', st ->> 'answer', 'source', st ->> 'source', 'all', s -> 'match' -> v_k -> 'all',
            'pay', s -> 'match' -> v_k -> 'pay', 'iMatched', s -> 'match' -> v_k -> 'right' ? v_me,
            'right', (select coalesce(jsonb_agg(public.g_name(p_party, x::uuid)), '[]'::jsonb) from jsonb_array_elements_text(s -> 'match' -> v_k -> 'right') x),
            'rightNames', public.g_names(p_party, (select array_agg(x::uuid) from jsonb_array_elements_text(s -> 'match' -> v_k -> 'right') x)));
        end if;
      when 'turn' then
        item := item || jsonb_build_object('question', st ->> 'question',
          'nudge', case when (s -> 'turn' -> v_k ->> 'nudged')::boolean then st ->> 'nudge' end,
          'by', public.g_name(p_party, (s -> 'turn' -> v_k ->> 'by')::uuid), 'said', s -> 'turn' -> v_k ->> 'text',
          'answer', case when s -> 'turn' -> v_k ? 'by' or (s -> 'turn' -> v_k ->> 'given')::boolean then st ->> 'answer' end);
      when 'ask' then
        select count(*) into v_asked from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where a ->> 'u' = v_me;
        item := item || jsonb_build_object(
          'rows', (select jsonb_agg(jsonb_build_object('q', public.g_fill(p_party, x -> 'questions' ->> 0, s), 'sealed', x -> 'sealed',
                     'note', x ->> 'note', 'group', x ->> 'group',
                     'by', (select public.g_name(p_party, (a ->> 'u')::uuid) from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1),
                     'answer', case when exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1)
                                      or (s -> 'ask' -> v_k -> 'unasked') @> to_jsonb(o - 1) then public.g_fill(p_party, x ->> 'answer', s) end) order by o)
                   from jsonb_array_elements(st -> 'rows') with ordinality r(x, o)),
          'asked', s -> 'ask' -> v_k -> 'asked', 'done', s -> 'ask' -> v_k -> 'done', 'unasked', s -> 'ask' -> v_k -> 'unasked',
          'unaskedLine', public.g_fill(p_party, st ->> 'unaskedLine', s),
          'left', case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end - v_asked);
      when 'summary' then
        -- The summary card, filled from what happened tonight; "You earned" is the caller's own.
        v_earn := coalesce(s -> 'earned' -> v_me, '{}'::jsonb);
        v_gold := coalesce((v_earn ->> 'gold')::int, 0);
        v_parts := '{}';
        if v_gold <> 0 then v_parts := v_parts || (case when v_gold > 0 then '+' else '−' end || to_char(abs(v_gold), 'FM999,999') || 'g'); end if;
        if coalesce((v_earn ->> 'growth')::int, 0) > 0 then v_parts := v_parts || ((v_earn ->> 'attr') || ' +' || (v_earn ->> 'growth')); end if;
        if coalesce((s ->> 'matches')::int, 0) > 0 then
          v_parts := v_parts || ('Match: ' || coalesce((v_earn ->> 'match')::int, 0) || ' of ' || (s ->> 'matches'));
        end if;
        select jsonb_agg(case
            when l = '{EARNED}' then 'You earned: ' || case when cardinality(v_parts) = 0 then 'nothing new' else array_to_string(v_parts, ' · ') end
            else regexp_replace(regexp_replace(regexp_replace(
                   replace(replace(public.g_fill(p_party, l, s), '{battle}', case when s -> 'battle' ->> 'outcome' = 'won' then 'won' else 'lost' end),
                           '{asked}', coalesce((select sum(jsonb_array_length(v.value -> 'asked')) from jsonb_each(coalesce(s -> 'ask', '{}'::jsonb)) v), 0)::text),
                   '\{ue:([^|}]*)\|([^}]*)\}', case when v_ue_won then '\1' else '\2' end, 'g'),
                   '\{pick:31:([^|}]*)\|([^}]*)\}', case when (s -> 'result' ->> '31')::int = 0 then '\1' else '\2' end, 'g'),
                   '\{pick:61:([^|}]*)\|([^|}]*)\|([^}]*)\}',
                     case (s -> 'result' ->> '61')::int when 0 then '\1' when 1 then '\2' else '\3' end, 'g') end order by o)
          into v_lines from jsonb_array_elements_text(st -> 'lines') with ordinality z(l, o);
        item := item || jsonb_build_object('lines', v_lines);
      else null;
    end case;
    out := out || item;
  end loop;

  return jsonb_build_object(
    'week', p_week, 'version', g.version, 'now', now(), 'opensAt', g.opens_at, 'startedAt', g.started_at, 'endedAt', g.ended_at,
    'cursor', g.cursor, 'waitUntil', g.wait_until, 'timeZone', v_tz,
    'tonight', (select x ->> 'text' from jsonb_array_elements(steps) x where x ->> 't' = 'tonight' limit 1),
    'ueAttr', meta ->> 'ueAttr',
    'party', (select jsonb_agg(jsonb_build_object('id', o.u, 'name', public.g_name(p_party, o.u), 'here', o.u = any(here),
                'in', coalesce(s -> 'order', '[]'::jsonb) ? o.u::text) order by o.ord)
              from unnest(public.g_party_order(p_party)) with ordinality o(u, ord)),
    'me', v_me, 'isHost', (select host_id = p_user from public.parties where id = p_party),
    'n', s -> 'n', 'log', out,
    'progress', (select jsonb_build_object('gold', gold, 'attrs', attrs, 'relics', relics, 'weapon', 13 + weapon_level, 'armor', 26 + armor_level)
                 from public.member_progress where party_id = p_party and user_id = p_user));
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- What players call
-- ---------------------------------------------------------------------------------------------------------------

-- Starting (§11, §12a "It starts once"): everyone here, once the lobby has opened; any friend here after 10 minutes;
-- by itself after 30; the host at any time on Day 7.
create function public.g_start(p_party uuid, p_week int) returns void
language plpgsql security definer set search_path = '' as $$
declare here uuid[] := public.g_here(p_party, p_week); v_u uuid;
begin
  update public.gatherings set started_at = now(), cursor = 0, version = version + 1,
    state = jsonb_build_object('n', greatest(1, coalesce(array_length(here, 1), 1)), 'order', to_jsonb(here::text[]), 'log', '[]'::jsonb,
      'votes', '{}'::jsonb, 'picks', '{}'::jsonb, 'result', '{}'::jsonb, 'tapped', '{}'::jsonb, 'tappedBy', '{}'::jsonb,
      'match', '{}'::jsonb, 'turn', '{}'::jsonb, 'ask', '{}'::jsonb, 'look', '{}'::jsonb, 'earned', '{}'::jsonb)
  where party_id = p_party and week = p_week and started_at is null;
  foreach v_u in array here loop perform public.ensure_progress(p_party, v_u); end loop;
end;
$$;

-- Every two seconds from an open Gathering: "here", the start conditions, the night's next step, and the view when
-- something changed since p_seen (the version and who is here).
create function public.gathering_tick(p_party uuid, p_seen text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; here uuid[]; v_all uuid[]; v_key text; v_day int;
begin
  if v_week is null then return jsonb_build_object('none', true); end if;
  perform public.g_row(p_party, v_week);
  insert into public.gathering_present (party_id, week, user_id) values (p_party, v_week, auth.uid())
  on conflict (party_id, week, user_id) do update set last_at = now();
  -- Day 7 counts as played for a friend who was in the Gathering at any point (§12a).
  select g2.* into g from public.gatherings g2 where party_id = p_party and week = v_week;
  if g.started_at is not null then
    perform public.ensure_progress(p_party, auth.uid());
    insert into public.member_days as md (party_id, user_id, week, day, finished_at) values (p_party, auth.uid(), v_week, 7, now())
    on conflict (party_id, user_id, week, day) do update set finished_at = coalesce(md.finished_at, now());
  end if;
  if g.started_at is null then
    here := public.g_here(p_party, v_week);
    v_all := public.g_party_order(p_party);
    if (now() >= g.opens_at and v_all <@ here) or now() >= g.opens_at + interval '30 minutes' then
      perform public.g_start(p_party, v_week);
    end if;
  end if;
  perform public.g_advance(p_party, v_week);
  select g2.* into g from public.gatherings g2 where party_id = p_party and week = v_week;
  v_key := g.version || ':' || array_to_string(public.g_here(p_party, v_week), ',');
  if p_seen is not distinct from v_key then return jsonb_build_object('same', true, 'now', now()); end if;
  return public.g_view(p_party, v_week, auth.uid()) || jsonb_build_object('key', v_key);
end;
$$;

-- Everything a friend does at the Gathering, through one door. The first tap to reach the server counts (§12a).
create function public.gathering_do(p_party uuid, p_action text, p_args jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; s jsonb; d jsonb; st jsonb; v_me text := auth.uid()::text;
        v_k text; v_i int; v_opt int; v_kind text; v_to uuid; v_name text := public.g_name(p_party, auth.uid()); v_f jsonb;
        v_idx int; v_txt text; v_limit int; v_meta jsonb; v_attr text; v_score int; v_tier int; v_d20 int; v_net int;
begin
  if v_week is null then raise exception 'no gathering tonight'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  d := public.g_script(p_party, v_week); v_meta := d -> 'meta';
  s := g.state; v_k := g.cursor::text; st := d -> 'steps' -> g.cursor;
  v_i := (p_args ->> 'i')::int;

  if p_action = 'start' then
    if g.started_at is not null then return public.g_view(p_party, v_week, auth.uid()); end if;
    if not ((select host_id from public.parties where id = p_party) = auth.uid() or now() >= g.opens_at + interval '10 minutes') then
      raise exception 'only the host can start it yet';
    end if;
    insert into public.gathering_present (party_id, week, user_id) values (p_party, v_week, auth.uid())
    on conflict (party_id, week, user_id) do update set last_at = now();
    perform public.g_start(p_party, v_week);
    perform public.g_advance(p_party, v_week);
    return public.g_view(p_party, v_week, auth.uid());
  end if;
  if g.started_at is null or g.ended_at is not null then raise exception 'not now'; end if;
  if not (coalesce(s -> 'order', '[]'::jsonb) ? v_me) then raise exception 'not now'; end if;

  -- Shared buttons are for the step the night is on; a tap for a step already passed does nothing.
  if p_action in ('go_on', 'tap', 'vote', 'pick', 'step_up', 'roll', 'ue_roll', 'hand_on', 'match', 'answer', 'ask', 'ask_done')
     and v_i is distinct from g.cursor then
    return public.g_view(p_party, v_week, auth.uid());
  end if;

  case p_action
    when 'go_on' then
      -- [GO ON]: the next passage at once.
      if st ->> 't' in ('say', 'notice', 'lookCloser') and (s -> 'log' -> -1 ->> 'i')::int = g.cursor then
        update public.gatherings set wait_until = now() where party_id = p_party and week = v_week;
      end if;
    when 'tap' then
      if st ->> 't' = 'act' and not (s -> 'tapped' ? v_k) then
        s := jsonb_set(s, array['tapped', v_k], to_jsonb(v_me));
        s := jsonb_set(s, array['tappedBy', v_k], to_jsonb(v_name));
        s := s || jsonb_build_object('tapper', v_name);
      end if;
    when 'vote' then
      v_opt := (p_args ->> 'o')::int;
      if st ->> 't' = 'pick' and st ->> 'mode' = 'vote' and not (s -> 'result' ? v_k) and not (s -> 'picks' -> v_k ? v_me)
         and v_opt between 0 and jsonb_array_length(st -> 'options') - 1 then
        s := jsonb_set(s, array['picks', v_k, v_me], to_jsonb(v_opt));
        s := jsonb_set(s, array['votes', v_k], coalesce(s -> 'votes' -> v_k, '[]'::jsonb) || jsonb_build_object('u', v_me, 'o', v_opt));
      end if;
    when 'pick' then
      v_opt := (p_args ->> 'o')::int;
      if st ->> 't' = 'pick' and st ->> 'mode' in ('private', 'each', 'chosen') and not (s -> 'result' ? v_k)
         and not (s -> 'picks' -> v_k ? v_me) and v_opt between 0 and jsonb_array_length(st -> 'options') - 1 then
        if st ->> 'mode' = 'chosen' and (s ->> 'chosen' is distinct from v_me
           or now() < (s -> 'log' -> -1 ->> 'at')::timestamptz + interval '30 seconds') then
          raise exception 'not yet';
        end if;
        s := jsonb_set(s, array['picks', v_k, v_me], to_jsonb(v_opt));
      end if;
    when 'step_up' then
      if st ->> 't' = 'approach' and s -> 'approach' ->> 'phase' = 'volunteer'
         and not exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_me) then
        if jsonb_array_length(s -> 'approach' -> 'vols') = 0 then
          update public.gatherings set wait_until = least(wait_until, now() + interval '10 seconds') where party_id = p_party and week = v_week;
        end if;
        s := jsonb_set(s, '{approach,vols}', (s -> 'approach' -> 'vols') || jsonb_build_object('u', v_me));
      end if;
    when 'roll' then
      if st ->> 't' = 'approach' and s -> 'approach' ->> 'phase' = 'roll' and s -> 'approach' ->> 'roller' = v_me then
        s := public.g_approach_roll(p_party, v_week, s, d, coalesce((p_args ->> 'relic')::boolean, false));
        update public.gatherings set wait_until = now() where party_id = p_party and week = v_week;
      end if;
    when 'use_combat_relic', 'give_combat_relic' then
      -- A Combat Relic (§5): +1 Weapon and +1 Armor from the next round, one per fighter per fight. A help-call's
      -- [GIVE A COMBAT RELIC] goes to the first friend who taps it; the giver's Relic is spent.
      v_to := case when p_action = 'use_combat_relic' then auth.uid() else (p_args ->> 'to')::uuid end;
      if s -> 'battle' ->> 'outcome' is distinct from 'ongoing' then raise exception 'not now'; end if;
      if p_action = 'give_combat_relic' and not exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'help') h where h ->> 'id' = v_to::text) then
        return public.g_view(p_party, v_week, auth.uid()); -- the call has closed, or another friend answered it first
      end if;
      select o::int - 1, x into v_idx, v_f from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o) where x ->> 'id' = v_to::text;
      if v_f is null or (v_f ->> 'fallen')::boolean or v_f ->> 'relicFrom' is not null or v_f ->> 'relicPending' is not null then
        raise exception 'a relic is already helping';
      end if;
      if not public.g_spend(p_party, auth.uid(), 'Combat') then raise exception 'no relic of that kind'; end if;
      s := jsonb_set(s, array['battle', 'fighters', v_idx::text, 'relicPending'], to_jsonb(v_name));
      if p_action = 'give_combat_relic' then
        s := jsonb_set(s, '{battle,help}', (select coalesce(jsonb_agg(h), '[]'::jsonb) from jsonb_array_elements(s -> 'battle' -> 'help') h
                                           where h ->> 'id' <> v_to::text));
      end if;
    when 'ue_relic' then
      -- One Relic to a roll: the roller's own matching Attribute Relic, or any Attribute Relic a friend gives (§5).
      -- A second tap by the same friend takes it back. It is spent when the roll is made.
      v_kind := p_args ->> 'kind';
      if s -> 'ue' ->> 'phase' <> 'roll' then raise exception 'not now'; end if;
      if s -> 'ue' -> 'relic' is not null and s -> 'ue' -> 'relic' <> 'null'::jsonb then
        if s -> 'ue' -> 'relic' ->> 'from' = v_me then s := jsonb_set(s, '{ue,relic}', 'null'::jsonb); end if;
      else
        if v_kind not in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim') then raise exception 'no relic of that kind'; end if;
        if s -> 'ue' ->> 'next' = v_me and v_kind <> v_meta ->> 'ueAttr' then raise exception 'no relic of that kind'; end if;
        if public.g_relics(p_party, auth.uid(), v_kind) < 1 then raise exception 'no relic of that kind'; end if;
        s := jsonb_set(s, '{ue,relic}', jsonb_build_object('from', v_me, 'kind', v_kind));
      end if;
    when 'ue_roll' then
      if st ->> 't' = 'ue' and s -> 'ue' ->> 'phase' = 'roll' and s -> 'ue' ->> 'next' = v_me then
        s := public.g_ue_roll(p_party, s, d);
        if s -> 'ue' ->> 'outcome' = 'won' then
          for v_to in select x::uuid from jsonb_array_elements_text(s -> 'order') x loop s := public.g_earn(p_party, v_to, 300, s); end loop;
        end if;
        update public.gatherings set wait_until = now() + case when s -> 'ue' ->> 'outcome' = 'ongoing' then interval '10 seconds'
                                                               else interval '8 seconds' end
        where party_id = p_party and week = v_week;
      end if;
    when 'hand_on' then
      v_to := (p_args ->> 'to')::uuid;
      if st ->> 't' = 'ue' and s -> 'ue' ->> 'phase' = 'handon' and s -> 'ue' ->> 'by' = v_me
         and v_to::text = any(public.g_ue_eligible(s -> 'ue')) then
        s := jsonb_set(s, '{ue}', (s -> 'ue') || jsonb_build_object('phase', 'roll', 'next', v_to, 'named', false));
        update public.gatherings set wait_until = now() + interval '30 seconds' where party_id = p_party and week = v_week;
      end if;
    when 'look' then
      -- [LOOK CLOSER] (§11): optional, on the friend's highest Attribute, at the Gathering DC; +75g on a pass.
      v_i := (p_args ->> 'i')::int;
      if not exists (select 1 from jsonb_array_elements(s -> 'log') x where (x ->> 'i')::int = v_i and x ->> 't' = 'lookCloser') then raise exception 'not now'; end if;
      if s -> 'look' ? v_me then return public.g_view(p_party, v_week, auth.uid()); end if;
      if exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = v_me and (x ->> 'fallen')::boolean)
         or (v_week = 5 and s -> 'ue' ->> 'outcome' = 'lost') then raise exception 'not now'; end if;
      if (p_args ->> 'leave')::boolean then
        s := jsonb_set(s, array['look', v_me], '{"left": true}');
      else
        v_attr := public.g_top_attr(p_party, auth.uid(), d -> 'steps' -> v_i -> 'lines');
        v_score := public.g_score(p_party, auth.uid(), v_attr);
        v_tier := public.tier_bonus(v_score);
        v_d20 := public.d20();
        v_net := v_d20 + v_tier - (v_meta ->> 'dc')::int;
        s := jsonb_set(s, array['look', v_me], jsonb_build_object('attr', v_attr, 'score', v_score, 'bonus', v_tier, 'd20', v_d20,
               'dc', (v_meta ->> 'dc')::int, 'net', v_net, 'pass', v_net >= 1));
        if v_net >= 1 then s := public.g_earn(p_party, auth.uid(), 75, s); end if;
      end if;
    when 'match' then
      if st ->> 't' = 'match' and not (s -> 'match' -> v_k -> 'picks' ? v_me) and not (s -> 'match' -> v_k ->> 'done')::boolean then
        s := jsonb_set(s, array['match', v_k, 'picks', v_me], to_jsonb(p_args ->> 'f'));
      end if;
    when 'answer' then
      v_txt := btrim(coalesce(p_args ->> 'text', ''));
      if char_length(v_txt) < 1 or char_length(v_txt) > 140 then raise exception 'an answer is 1 to 140 characters'; end if;
      if st ->> 't' = 'turn' and not (s -> 'turn' -> v_k ? 'by') and not coalesce((s -> 'turn' -> v_k ->> 'given')::boolean, false) then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || jsonb_build_object('by', v_me, 'text', v_txt));
        update public.gatherings set wait_until = now() + public.g_pace(st ->> 'answer') where party_id = p_party and week = v_week;
      end if;
    when 'ask' then
      v_opt := (p_args ->> 'r')::int;
      v_limit := case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end;
      if st ->> 't' = 'ask' and not (s -> 'ask' -> v_k ->> 'done')::boolean and v_opt between 0 and jsonb_array_length(st -> 'rows') - 1
         and not exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = v_opt)
         and (select count(*) from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where a ->> 'u' = v_me) < v_limit then
        s := jsonb_set(s, array['ask', v_k, 'asked'], (s -> 'ask' -> v_k -> 'asked') || jsonb_build_object('r', v_opt, 'u', v_me));
        update public.gatherings set wait_until = now() + interval '2 minutes' where party_id = p_party and week = v_week;
      end if;
    when 'ask_done' then
      if st ->> 't' = 'ask' then s := jsonb_set(s, array['ask', v_k, 'closing'], 'true'); end if;
    else
      raise exception 'not now';
  end case;

  update public.gatherings set state = s, version = version + 1 where party_id = p_party and week = v_week;
  perform public.g_advance(p_party, v_week);
  return public.g_view(p_party, v_week, auth.uid());
end;
$$;

-- The host pins the Gathering's time (§11 "The Gathering's hour"): 8:00am to 11:00pm on Day 7, until the lobby opens.
-- Everyone is told in the party chat. (The Day 4 poll comes with notifications.)
create function public.gathering_set_time(p_party uuid, p_time time) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; g public.gatherings; v_at timestamptz; v_tz text;
begin
  if (select host_id from public.parties where id = p_party) is distinct from auth.uid() then raise exception 'only the host'; end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;
  if p_time < time '08:00' or p_time > time '23:00' then raise exception 'between 8:00am and 11:00pm'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  if g.started_at is not null or now() >= g.opens_at then raise exception 'the lobby is already open'; end if;
  select time_zone into v_tz from public.parties where id = p_party;
  v_at := ((public.party_day_start(p_party, v_week, 7) at time zone v_tz)::date + p_time) at time zone v_tz;
  if v_at <= now() then raise exception 'that time has passed'; end if;
  update public.gatherings set opens_at = v_at, version = version + 1 where party_id = p_party and week = v_week;
  insert into public.party_messages (party_id, kind, body)
  values (p_party, 'notice', 'The Gathering is at ' || lower(to_char(v_at at time zone v_tz, 'FMHH12:MIam')) || ' on Day 7.');
  return jsonb_build_object('week', v_week, 'opensAt', v_at);
end;
$$;

-- For the party page: this week's Gathering time, whether it is on now, and the "Tonight" line on Day 7.
create function public.gathering_info(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; g public.gatherings; v_running int;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then return null; end if;
  select week into v_running from public.gatherings where party_id = p_party and started_at is not null and ended_at is null limit 1;
  perform public.g_row(p_party, coalesce(v_running, v_week));
  select * into g from public.gatherings where party_id = p_party and week = coalesce(v_running, v_week);
  return jsonb_build_object('week', g.week, 'day', v_day, 'opensAt', g.opens_at, 'startedAt', g.started_at, 'endedAt', g.ended_at,
    'open', v_running is not null or v_day = 7,
    'tonight', case when v_day = 7 or v_running is not null then
      (select x ->> 'text' from jsonb_array_elements(public.g_script(p_party, g.week) -> 'steps') x where x ->> 't' = 'tonight' limit 1) end);
end;
$$;

-- What a Gathering carries into the weekdays (§11 "One result carries into a weekday"): a lost United Effort.
create function public.party_claims(p_party uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg('G' || week || ':united-effort-lost'), '[]'::jsonb) from public.gatherings
  where party_id = p_party and state -> 'ue' ->> 'outcome' = 'lost';
$$;

revoke execute on function public.g_word, public.g_party_order, public.g_name, public.g_names, public.g_here, public.g_script,
  public.g_week, public.g_row, public.g_fill, public.g_earn, public.g_spend, public.g_relics, public.g_score, public.g_top_attr,
  public.g_log, public.g_pace, public.g_cond, public.g_battle_round, public.g_battle_join, public.g_ue_roll, public.g_ue_eligible,
  public.g_approach_roll, public.g_advance, public.g_view, public.g_start, public.party_claims
  from public, anon, authenticated;
revoke execute on function public.gathering_tick, public.gathering_do, public.gathering_set_time, public.gathering_info from public, anon;
grant execute on function public.gathering_tick, public.gathering_do, public.gathering_set_time, public.gathering_info to authenticated;
