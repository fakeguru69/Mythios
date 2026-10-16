-- The days online (build step 2 and 3, Week 1 first). The server keeps each player's numbers, rolls every die and
-- hands out each day's chapter only on its day (Core Rules §12a: "The server rolls every die"; "The server keeps the time").
-- Rules: Core Rules §3 (Challenges), §4 (fights), §12 (numbers); the same rules the demo plays.

-- The chapters, as canon writes them (generated from the episode files: scripts/gen-chapters-sql.ts).
-- Players never read this table directly; today() hands out the day's chapter.
create table public.chapters (
  series_id text not null references public.series (id),
  season_number int not null,
  week int not null,
  day int not null,
  script jsonb not null,
  meta jsonb not null, -- { dc, wDef, wAtk, fightReward }
  primary key (series_id, season_number, week, day)
);
alter table public.chapters enable row level security;
revoke all on public.chapters from anon, authenticated;

-- A player's numbers in a party: gold, Attributes, gear, Relics (Core Rules §2, §4, §5).
create table public.member_progress (
  party_id uuid not null,
  user_id uuid not null,
  gold int not null default 0 check (gold >= 0),
  attrs jsonb not null,
  weapon_level int not null default 1 check (weapon_level between 1 and 5),
  armor_level int not null default 1 check (armor_level between 1 and 5),
  relics jsonb not null default '{}'::jsonb,
  primary key (party_id, user_id),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);
alter table public.member_progress enable row level security;
create policy "progress: own" on public.member_progress for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.member_progress from anon, authenticated;

-- A player's day: what they picked, how far they read, and the server's rolls.
create table public.member_days (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  picks jsonb not null default '{}'::jsonb,   -- { "<choice id>": [options in the order picked] }
  acts int not null default 0,                -- [act] taps made
  challenge jsonb,
  press jsonb,
  fight jsonb,
  finished_at timestamptz,
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);
alter table public.member_days enable row level security;
create policy "days: own" on public.member_days for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.member_days from anon, authenticated;

-- Which day it is for a party: Day 1 opens at day1_opens_at, then a new day every 5:00am on the party's clock.
-- Returns week 1..6 and day 1..7; nothing before Day 1.
create function public.party_today(p_party uuid) returns table (week int, day int)
language sql stable security definer set search_path = '' as $$
  select (n / 7) + 1, (n % 7) + 1
  from (
    select ((now() at time zone p.time_zone) - interval '5 hours')::date
           - ((p.day1_opens_at at time zone p.time_zone) - interval '5 hours')::date as n
    from public.parties p where p.id = p_party and p.day1_opens_at is not null and now() >= p.day1_opens_at
  ) x
  where n between 0 and 41;
$$;

-- Tier bonus and growth rate by Attribute value (Core Rules §2).
create function public.tier_bonus(p_value int) returns int language sql immutable set search_path = '' as $$
  select case when p_value <= 25 then 0 when p_value <= 50 then 2 when p_value <= 75 then 4 when p_value <= 100 then 6 else 8 end;
$$;
create function public.tier_rate(p_value int) returns numeric language sql immutable set search_path = '' as $$
  select case when p_value <= 50 then 1.0 when p_value <= 75 then 0.6 when p_value <= 100 then 0.3 else 0.1 end;
$$;
create function public.d20() returns int language sql volatile set search_path = '' as $$
  select floor(random() * 20)::int + 1;
$$;

-- The calling player's row for today, made if needed; their numbers made from their character on first use
-- (class Attribute 14, second 12, the rest 10: Core Rules §2).
create function public.my_today_row(p_party uuid, out o_week int, out o_day int)
language plpgsql security definer set search_path = '' as $$
declare v_class text; v_second text; v_attrs jsonb;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid()
                 and status = 'approved' and session_zero_done_at is not null) then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into o_week, o_day from public.party_today(p_party) t;
  if o_week is null then raise exception 'the story has not started'; end if;
  if not exists (select 1 from public.member_progress where party_id = p_party and user_id = auth.uid()) then
    select class, second_attr into v_class, v_second from public.party_members where party_id = p_party and user_id = auth.uid();
    select jsonb_object_agg(a, case when a = public.class_attribute(v_class) then 14 when a = v_second then 12 else 10 end)
      into v_attrs from unnest(array['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim']) a;
    insert into public.member_progress (party_id, user_id, attrs) values (p_party, auth.uid(), v_attrs);
  end if;
  insert into public.member_days (party_id, user_id, week, day) values (p_party, auth.uid(), o_week, o_day)
  on conflict do nothing;
end;
$$;

-- Today: the day, its chapter (weekdays only), the player's numbers and their day so far.
create function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null)
  ) into r;
  return r;
end;
$$;

-- Today's chapter step of a kind, for checking what the player asks for.
create function public.today_step(p_party uuid, p_week int, p_day int, p_kind text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select s from public.chapters c
  join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  cross join lateral jsonb_array_elements(c.script -> 'steps') s
  where p.id = p_party and c.week = p_week and c.day = p_day and s ->> 't' = p_kind
  limit 1;
$$;
create function public.today_meta(p_party uuid, p_week int, p_day int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select c.meta from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = p_week and c.day = p_day;
$$;

-- A pick in one of today's choices, and an [act] tap (so a player can close the app and come back to the same place).
create function public.pick_choice(p_party uuid, p_choice int, p_option int) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days
  set picks = jsonb_set(picks, array[p_choice::text], coalesce(picks -> p_choice::text, '[]'::jsonb) || to_jsonb(p_option))
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day and finished_at is null
    and not coalesce(picks -> p_choice::text, '[]'::jsonb) @> to_jsonb(p_option);
end;
$$;
create function public.tap_act(p_party uuid, p_acts int) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set acts = greatest(acts, p_acts)
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
end;
$$;

-- The day's Challenge (Core Rules §3): d20 + the Attribute's tier bonus − DC; success at 1 or more, a tie fails,
-- no automatic 20. Pass: +500g and the Attribute grows; fail: −150g (never below 0). Rolled once.
create function public.roll_challenge(p_party uuid, p_attr text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_dc int; v_score int; v_bonus int; v_d20 int; v_net int;
        v_pass boolean; v_growth int := 0; v_played int; v_base int; v_result jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if (select challenge from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) is not null then
    raise exception 'already rolled';
  end if;
  v_step := public.today_step(p_party, v_week, v_day, 'challenge');
  if v_step is null or not exists (select 1 from jsonb_array_elements(v_step -> 'options') o where o ->> 'attr' = p_attr) then
    raise exception 'not today''s Challenge';
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  v_dc := (v_meta ->> 'dc')::int; -- harderIf rests on Gathering results, which come later
  select (attrs ->> p_attr)::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_bonus := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_net := v_d20 + v_bonus - v_dc;
  v_pass := v_net >= 1;
  if v_pass then
    -- Growth: 12, 9, 7, 5, 4, 3, 3 for the player's 1st to 7th day played this week, × tier rate, rounded, at least 1,
    -- only if the roll was truly uncertain (a 1 could fail and a 20 could pass, before Relics).
    if 1 + v_bonus - v_dc < 1 and 20 + v_bonus - v_dc >= 1 then
      select count(*) + 1 into v_played from public.member_days
      where party_id = p_party and user_id = auth.uid() and week = v_week and finished_at is not null;
      v_base := (array[12, 9, 7, 5, 4, 3, 3])[least(7, greatest(1, v_played))];
      v_growth := greatest(1, round(v_base * public.tier_rate(v_score))::int);
    end if;
    update public.member_progress
    set gold = gold + 500, attrs = jsonb_set(attrs, array[p_attr], to_jsonb(v_score + v_growth))
    where party_id = p_party and user_id = auth.uid();
  else
    update public.member_progress set gold = greatest(0, gold - 150) where party_id = p_party and user_id = auth.uid();
  end if;
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;

-- [PRESS ON] (Core Rules §3): after a passed Challenge, the same Attribute against DC + 4. Pass: +200g, no growth.
create function public.roll_press(p_party uuid, p_leave boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_ch jsonb; v_dc int; v_score int; v_bonus int; v_d20 int; v_net int; v_result jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select challenge into v_ch from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_ch is null or not (v_ch ->> 'pass')::boolean then raise exception 'not now'; end if;
  if (select press from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) is not null then
    raise exception 'already rolled';
  end if;
  v_step := public.today_step(p_party, v_week, v_day, 'press');
  if v_step is null then raise exception 'not today'; end if;
  if p_leave then
    v_result := jsonb_build_object('left', true);
  else
    v_meta := public.today_meta(p_party, v_week, v_day);
    v_dc := (v_meta ->> 'dc')::int + coalesce((v_step ->> 'harder')::int, 4);
    select (attrs ->> (v_ch ->> 'attr'))::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
    v_bonus := public.tier_bonus(v_score);
    v_d20 := public.d20();
    v_net := v_d20 + v_bonus - v_dc;
    if v_net >= 1 then
      update public.member_progress set gold = gold + 200 where party_id = p_party and user_id = auth.uid();
    end if;
    v_result := jsonb_build_object('attr', v_ch ->> 'attr', 'score', v_score, 'bonus', v_bonus, 'd20', v_d20, 'dc', v_dc,
                                   'net', v_net, 'pass', v_net >= 1);
  end if;
  update public.member_days set press = v_result where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;

-- One round of the day's fight (Core Rules §4): 100 HP each; hit when d20 + Weapon − DEF ≥ 1 (enemy: d20 + ATK − Armor ≥ 1);
-- damage = margin × 5. Who strikes first follows the day (the player; or the Challenge; or a choice).
-- A fighter at 0 HP does not strike back. A win pays the day's fight gold.
create function public.fight_round(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_row public.member_days; v_rule jsonb; v_enemy_first boolean;
        v_fight jsonb; v_rounds jsonb; v_php int; v_ehp int; v_weapon int; v_armor int; v_def int; v_atk int;
        v_d20 int; v_ed20 int; v_margin int; v_emargin int; v_hit boolean := false; v_ehit boolean := false;
        v_pstruck boolean := false; v_estruck boolean := false; v_round jsonb; v_done boolean; v_won boolean;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  v_step := public.today_step(p_party, v_week, v_day, 'fight');
  if v_step is null then raise exception 'no fight today'; end if;
  v_fight := coalesce(v_row.fight, jsonb_build_object('rounds', '[]'::jsonb, 'done', false));
  if (v_fight ->> 'done')::boolean then raise exception 'the fight is over'; end if;
  v_rule := v_step -> 'strikeFirst';
  if v_rule ->> 'on' = 'challenge' then
    if v_row.challenge is null then raise exception 'not yet'; end if;
    v_enemy_first := not (v_row.challenge ->> 'pass')::boolean;
  elsif v_rule ->> 'on' = 'choice' then
    if not (v_row.picks ? (v_rule ->> 'choice')) then raise exception 'not yet'; end if;
    v_enemy_first := not ((v_rule -> 'options') @> ((v_row.picks -> (v_rule ->> 'choice')) -> 0));
  else
    v_enemy_first := false;
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  v_def := (v_meta ->> 'wDef')::int; v_atk := (v_meta ->> 'wAtk')::int;
  select 13 + weapon_level, 26 + armor_level into v_weapon, v_armor from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_rounds := v_fight -> 'rounds';
  v_php := coalesce((v_rounds -> -1 ->> 'playerHpAfter')::int, 100);
  v_ehp := coalesce((v_rounds -> -1 ->> 'enemyHpAfter')::int, 100);
  v_d20 := public.d20(); v_ed20 := public.d20();
  v_margin := v_d20 + v_weapon - v_def; v_emargin := v_ed20 + v_atk - v_armor;
  for i in 1..2 loop
    if (i = 1) = v_enemy_first then
      if v_ehp > 0 then v_estruck := true; v_ehit := v_emargin > 0; if v_ehit then v_php := greatest(0, v_php - v_emargin * 5); end if; end if;
    else
      if v_php > 0 then v_pstruck := true; v_hit := v_margin > 0; if v_hit then v_ehp := greatest(0, v_ehp - v_margin * 5); end if; end if;
    end if;
  end loop;
  v_round := jsonb_build_object('round', jsonb_array_length(v_rounds) + 1, 'enemyFirst', v_enemy_first,
    'd20', v_d20, 'playerAtk', v_weapon, 'enemyDef', v_def, 'margin', v_margin, 'hit', v_hit, 'playerStruck', v_pstruck,
    'enemyD20', v_ed20, 'enemyAtk', v_atk, 'playerArmor', v_armor, 'enemyMargin', v_emargin, 'enemyHit', v_ehit, 'enemyStruck', v_estruck,
    'playerHpAfter', v_php, 'enemyHpAfter', v_ehp);
  v_done := v_php <= 0 or v_ehp <= 0;
  v_won := v_ehp <= 0;
  v_fight := jsonb_build_object('rounds', v_rounds || v_round, 'done', v_done, 'won', v_won);
  if v_done and v_won and coalesce((v_meta ->> 'fightReward')::int, 0) > 0 then
    update public.member_progress set gold = gold + (v_meta ->> 'fightReward')::int where party_id = p_party and user_id = auth.uid();
    v_fight := v_fight || jsonb_build_object('gold', (v_meta ->> 'fightReward')::int);
  end if;
  update public.member_days set fight = v_fight where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_fight;
end;
$$;

-- The day read to its last line (Core Rules §12a "A weekday counts as played"). One line in the party chat,
-- about the friend, never the Attribute or the branch.
create function public.finish_day(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_row public.member_days; v_name text; v_line text;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_row.finished_at is not null then return; end if;
  -- The day's roll and fight come first.
  if public.today_step(p_party, v_week, v_day, 'challenge') is not null and v_row.challenge is null then raise exception 'not yet'; end if;
  if public.today_step(p_party, v_week, v_day, 'fight') is not null and not coalesce((v_row.fight ->> 'done')::boolean, false) then
    raise exception 'not yet';
  end if;
  update public.member_days set finished_at = now() where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  select character_name into v_name from public.party_members where party_id = p_party and user_id = auth.uid();
  v_line := case
    when v_row.challenge is null then v_name || ' has read today''s chapter.'
    when (v_row.challenge ->> 'pass')::boolean then v_name || ' passed today''s Challenge.'
    else v_name || ' failed today''s Challenge.' end;
  insert into public.party_messages (party_id, kind, body) values (p_party, 'notice', v_line);
end;
$$;

revoke execute on function public.party_today, public.my_today_row, public.today_step, public.today_meta, public.d20
  from public, anon, authenticated;
revoke execute on function public.today, public.pick_choice, public.tap_act, public.roll_challenge, public.roll_press,
  public.fight_round, public.finish_day from public, anon;
grant execute on function public.today, public.pick_choice, public.tap_act, public.roll_challenge, public.roll_press,
  public.fight_round, public.finish_day to authenticated;
