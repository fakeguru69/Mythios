-- The Store and Relics online (Core Rules §4 gear, §5 Relics, §8 the Store, §12 prices, §12a "Cards and Relics").
-- Gear: two tracks, Level 1 to 5; stepping up costs 950, 1,100, 1,750, 2,400 per track. Relics: 150g each, seven types
-- (six Attribute Relics and one Combat Relic). The Store is closed while your own card or fight is open; [NOT NOW]
-- sets a card aside (and a fight not yet begun, except the first fight), and the Store opens. One confirmation to buy, no undo.
-- An Attribute Relic adds 4 to one roll of its Attribute (a Challenge or [PRESS ON]), spent when the roll is made.
-- A Combat Relic is +1 Weapon and +1 Armor for the rest of one fight, from the next round, once per fight.
-- Relics can be given to a friend; gold cannot. Every change here is additive (new columns, a new table, new functions).

alter table public.member_days add column aside boolean not null default false;       -- [NOT NOW] on the card or fight
alter table public.member_progress add column store_opened_at timestamptz;             -- the Store's first-time line, once

-- Relics given: who gave which to whom (the receiver sees "TV gave you a Charm Relic."; the Record counts Relics Given).
create table public.relic_gifts (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  from_user uuid references public.profiles (id) on delete set null,
  to_user uuid references public.profiles (id) on delete set null,
  relic text not null,
  given_at timestamptz not null default now()
);
alter table public.relic_gifts enable row level security;
create policy "gifts: own" on public.relic_gifts for select to authenticated using (from_user = auth.uid() or to_user = auth.uid());
revoke insert, update, delete on public.relic_gifts from anon, authenticated;

-- The seven Relic types: the six Attributes, and Combat.
create function public.relic_kind_ok(p_relic text) returns boolean language sql immutable set search_path = '' as $$
  select p_relic in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim', 'Combat');
$$;

-- A player's numbers, made from their character on first use (as my_today_row does for the caller).
create function public.ensure_progress(p_party uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_class text; v_second text; v_attrs jsonb;
begin
  if exists (select 1 from public.member_progress where party_id = p_party and user_id = p_user) then return; end if;
  select class, second_attr into v_class, v_second from public.party_members where party_id = p_party and user_id = p_user;
  select jsonb_object_agg(a, case when a = public.class_attribute(v_class) then 14 when a = v_second then 12 else 10 end)
    into v_attrs from unnest(array['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim']) a;
  insert into public.member_progress (party_id, user_id, attrs) values (p_party, p_user, v_attrs) on conflict do nothing;
end;
$$;

-- Where a player stands in today's chapter: the first step still waiting on them, as the screen plays it
-- (OnlineDay.tsx): 'reading' (a tap or a choice), 'card' (the Challenge), 'press' ([PRESS ON]), 'fight', 'done',
-- or 'none' (no chapter today: Day 7).
create function public.day_open_step(p_party uuid, p_user uuid, p_week int, p_day int) returns text
language plpgsql stable security definer set search_path = '' as $$
declare v_row public.member_days; v_script jsonb; s jsonb; v_acts int := 0; v_picks jsonb;
begin
  select * into v_row from public.member_days where party_id = p_party and user_id = p_user and week = p_week and day = p_day;
  select c.script into v_script from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = p_week and c.day = p_day;
  if v_script is null then return 'none'; end if;
  for s in select * from jsonb_array_elements(v_script -> 'steps') loop
    case s ->> 't'
      when 'act' then
        v_acts := v_acts + 1;
        if v_acts > coalesce(v_row.acts, 0) then return 'reading'; end if;
      when 'choice' then
        v_picks := coalesce(v_row.picks -> (s ->> 'id'), '[]'::jsonb);
        if jsonb_array_length(v_picks) = 0 then return 'reading'; end if;
        -- "each": picked until every branch has been seen.
        if s ->> 'mode' = 'each' and exists (
          select 1 from jsonb_array_elements(s -> 'branches') b
          where not exists (select 1 from jsonb_array_elements(b -> 'options') o where v_picks @> jsonb_build_array(o))
        ) then return 'reading'; end if;
      when 'challenge' then
        if v_row.challenge is null then return 'card'; end if;
      when 'press' then
        if coalesce((v_row.challenge ->> 'pass')::boolean, false) and v_row.press is null then return 'press'; end if;
      when 'fight' then
        if not coalesce((v_row.fight ->> 'done')::boolean, false) then return 'fight'; end if;
      when 'summary' then
        return 'done';
      else
        null;
    end case;
  end loop;
  return 'done';
end;
$$;

-- Why the caller's Store is closed today: 'card' or 'fight', or null when it is open.
create function public.store_closed_by(p_party uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step text; v_row public.member_days;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  v_step := public.day_open_step(p_party, auth.uid(), v_week, v_day);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_step = 'card' and not v_row.aside then return 'card'; end if;
  if v_step = 'press' then return 'card'; end if;
  if v_step = 'fight' and (not v_row.aside or jsonb_array_length(coalesce(v_row.fight -> 'rounds', '[]'::jsonb)) > 0) then
    return 'fight';
  end if;
  return null;
end;
$$;

-- [NOT NOW] (Core Rules §3): the card is set aside, stays in the thread, and can be rolled any time before the day ends;
-- while it is set aside the Store is open. A fight not yet begun may be set aside the same way; the first fight
-- (Week 1, Day 1) may not (§12a).
create function public.set_aside(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step text; v_row public.member_days;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  v_step := public.day_open_step(p_party, auth.uid(), v_week, v_day);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_step = 'card'
     or (v_step = 'fight' and not (v_week = 1 and v_day = 1)
         and jsonb_array_length(coalesce(v_row.fight -> 'rounds', '[]'::jsonb)) = 0) then
    update public.member_days set aside = true where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  else
    raise exception 'not now';
  end if;
end;
$$;

-- The Store: gold, gear, Relics, whether it is open, the first-time line (once), and Relics friends have given you.
create function public.store_state(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_first boolean; r jsonb;
begin
  perform public.my_today_row(p_party);
  select store_opened_at is null into v_first from public.member_progress where party_id = p_party and user_id = auth.uid();
  update public.member_progress set store_opened_at = coalesce(store_opened_at, now()) where party_id = p_party and user_id = auth.uid();
  select jsonb_build_object(
    'gold', mp.gold, 'weaponLevel', mp.weapon_level, 'armorLevel', mp.armor_level, 'relics', mp.relics,
    'closedBy', public.store_closed_by(p_party),
    'first', v_first,
    'gifts', (select coalesce(jsonb_agg(jsonb_build_object('from', coalesce(m.character_name, 'A friend'), 'relic', g.relic, 'at', g.given_at)
                                        order by g.given_at desc), '[]'::jsonb)
              from (select * from public.relic_gifts where party_id = p_party and to_user = auth.uid() order by given_at desc limit 10) g
              left join public.party_members m on m.party_id = p_party and m.user_id = g.from_user),
    'given', (select count(*) from public.relic_gifts where party_id = p_party and from_user = auth.uid())
  ) into r
  from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid();
  return r;
end;
$$;

-- Step up one gear track by one Level (Core Rules §12): 950, 1,100, 1,750, 2,400.
create function public.buy_gear(p_party uuid, p_track text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_level int; v_cost int; v_gold int;
begin
  if p_track not in ('weapon', 'armor') then raise exception 'no such gear'; end if;
  if public.store_closed_by(p_party) is not null then raise exception 'the store is closed while your card or fight is open'; end if;
  select case when p_track = 'weapon' then weapon_level else armor_level end, gold into v_level, v_gold
  from public.member_progress where party_id = p_party and user_id = auth.uid() for update;
  if v_level >= 5 then raise exception 'already at level 5'; end if;
  v_cost := (array[0, 950, 1100, 1750, 2400])[v_level + 1];
  if v_gold < v_cost then raise exception 'not enough gold'; end if;
  if p_track = 'weapon' then
    update public.member_progress set gold = gold - v_cost, weapon_level = weapon_level + 1 where party_id = p_party and user_id = auth.uid();
  else
    update public.member_progress set gold = gold - v_cost, armor_level = armor_level + 1 where party_id = p_party and user_id = auth.uid();
  end if;
  return public.store_state(p_party);
end;
$$;

-- Buy one Relic, 150g (Core Rules §12). No limit on how many a player holds (§5).
create function public.buy_relic(p_party uuid, p_relic text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_gold int;
begin
  if not public.relic_kind_ok(p_relic) then raise exception 'no such relic'; end if;
  if public.store_closed_by(p_party) is not null then raise exception 'the store is closed while your card or fight is open'; end if;
  select gold into v_gold from public.member_progress where party_id = p_party and user_id = auth.uid() for update;
  if v_gold < 150 then raise exception 'not enough gold'; end if;
  update public.member_progress
  set gold = gold - 150, relics = jsonb_set(relics, array[p_relic], to_jsonb(coalesce((relics ->> p_relic)::int, 0) + 1))
  where party_id = p_party and user_id = auth.uid();
  return public.store_state(p_party);
end;
$$;

-- Give a Relic to a friend in the party (Core Rules §5: "Relics can be given to a friend. Gold cannot.").
create function public.give_relic(p_party uuid, p_to uuid, p_relic text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_have int;
begin
  if not public.relic_kind_ok(p_relic) then raise exception 'no such relic'; end if;
  perform public.my_today_row(p_party);
  if p_to = auth.uid() or not exists (select 1 from public.party_members where party_id = p_party and user_id = p_to
                                       and status = 'approved' and session_zero_done_at is not null) then
    raise exception 'not a friend in this party';
  end if;
  select coalesce((relics ->> p_relic)::int, 0) into v_have from public.member_progress
  where party_id = p_party and user_id = auth.uid() for update;
  if v_have < 1 then raise exception 'no relic of that kind'; end if;
  perform public.ensure_progress(p_party, p_to);
  update public.member_progress set relics = jsonb_set(relics, array[p_relic], to_jsonb(v_have - 1))
  where party_id = p_party and user_id = auth.uid();
  update public.member_progress set relics = jsonb_set(relics, array[p_relic], to_jsonb(coalesce((relics ->> p_relic)::int, 0) + 1))
  where party_id = p_party and user_id = p_to;
  insert into public.relic_gifts (party_id, from_user, to_user, relic) values (p_party, auth.uid(), p_to, p_relic);
  return public.store_state(p_party);
end;
$$;

-- Spend one of the caller's Relics, or refuse.
create function public.spend_relic(p_party uuid, p_relic text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.member_progress set relics = jsonb_set(relics, array[p_relic], to_jsonb((relics ->> p_relic)::int - 1))
  where party_id = p_party and user_id = auth.uid() and coalesce((relics ->> p_relic)::int, 0) >= 1;
  if not found then raise exception 'no relic of that kind'; end if;
end;
$$;

-- The day's Challenge, as roll_challenge (0012), with an Attribute Relic if the player uses one: +4, spent with the roll.
-- Growth is judged before the Relic (Core Rules §2), so using one never costs a player their growth.
create function public.roll_card(p_party uuid, p_attr text, p_relic boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_dc int; v_score int; v_bonus int; v_relic int := 0; v_d20 int; v_net int;
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
  if public.day_open_step(p_party, auth.uid(), v_week, v_day) <> 'card' then raise exception 'not yet'; end if;
  if p_relic then
    perform public.spend_relic(p_party, p_attr);
    v_relic := 4;
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  v_dc := (v_meta ->> 'dc')::int; -- harderIf rests on Gathering results, which come later
  select (attrs ->> p_attr)::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_bonus := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_net := v_d20 + v_bonus + v_relic - v_dc;
  v_pass := v_net >= 1;
  if v_pass then
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
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;

-- [PRESS ON], as roll_press (0012), with an Attribute Relic if the player uses one (Core Rules §3: "An Attribute Relic
-- may be used on it").
create function public.roll_press_card(p_party uuid, p_leave boolean, p_relic boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_ch jsonb; v_dc int; v_score int; v_bonus int; v_relic int := 0;
        v_d20 int; v_net int; v_result jsonb;
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
    if p_relic then
      perform public.spend_relic(p_party, v_ch ->> 'attr');
      v_relic := 4;
    end if;
    v_meta := public.today_meta(p_party, v_week, v_day);
    v_dc := (v_meta ->> 'dc')::int + coalesce((v_step ->> 'harder')::int, 4);
    select (attrs ->> (v_ch ->> 'attr'))::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
    v_bonus := public.tier_bonus(v_score);
    v_d20 := public.d20();
    v_net := v_d20 + v_bonus + v_relic - v_dc;
    if v_net >= 1 then
      update public.member_progress set gold = gold + 200 where party_id = p_party and user_id = auth.uid();
    end if;
    v_result := jsonb_build_object('attr', v_ch ->> 'attr', 'score', v_score, 'bonus', v_bonus, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc,
                                   'net', v_net, 'pass', v_net >= 1);
  end if;
  update public.member_days set press = v_result where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;

-- A Combat Relic in today's fight (Core Rules §5): +1 Weapon and +1 Armor for the rest of the fight, from the next round.
-- Once per fight; while one is active the button is hidden (§12a).
create function public.use_combat_relic(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_fight jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if public.today_step(p_party, v_week, v_day, 'fight') is null then raise exception 'no fight today'; end if;
  if public.day_open_step(p_party, auth.uid(), v_week, v_day) <> 'fight' then raise exception 'not yet'; end if;
  select coalesce(fight, jsonb_build_object('rounds', '[]'::jsonb, 'done', false)) into v_fight
  from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day for update;
  if v_fight ? 'relicFrom' then raise exception 'a relic is already helping'; end if;
  perform public.spend_relic(p_party, 'Combat');
  v_fight := v_fight || jsonb_build_object('relicFrom', jsonb_array_length(v_fight -> 'rounds') + 1);
  update public.member_days set fight = v_fight where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_fight;
end;
$$;

-- One round of the day's fight, as in 0012, now with the Combat Relic (+1 Weapon, +1 Armor from its round on) and
-- the fight's own marks kept between rounds. Starting the fight takes it out of [NOT NOW].
create or replace function public.fight_round(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_row public.member_days; v_rule jsonb; v_enemy_first boolean;
        v_fight jsonb; v_rounds jsonb; v_php int; v_ehp int; v_weapon int; v_armor int; v_def int; v_atk int;
        v_d20 int; v_ed20 int; v_margin int; v_emargin int; v_hit boolean := false; v_ehit boolean := false;
        v_pstruck boolean := false; v_estruck boolean := false; v_round jsonb; v_done boolean; v_won boolean; v_relic boolean;
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
  v_rounds := v_fight -> 'rounds';
  v_relic := v_fight ? 'relicFrom' and jsonb_array_length(v_rounds) + 1 >= (v_fight ->> 'relicFrom')::int;
  select 13 + weapon_level + (case when v_relic then 1 else 0 end), 26 + armor_level + (case when v_relic then 1 else 0 end)
    into v_weapon, v_armor from public.member_progress where party_id = p_party and user_id = auth.uid();
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
    'playerHpAfter', v_php, 'enemyHpAfter', v_ehp, 'relic', v_relic);
  v_done := v_php <= 0 or v_ehp <= 0;
  v_won := v_ehp <= 0;
  v_fight := v_fight || jsonb_build_object('rounds', v_rounds || v_round, 'done', v_done, 'won', v_won);
  if v_done and v_won and coalesce((v_meta ->> 'fightReward')::int, 0) > 0 then
    update public.member_progress set gold = gold + (v_meta ->> 'fightReward')::int where party_id = p_party and user_id = auth.uid();
    v_fight := v_fight || jsonb_build_object('gold', (v_meta ->> 'fightReward')::int);
  end if;
  update public.member_days set fight = v_fight, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_fight;
end;
$$;

-- The old rolls (0012) give way to the ones that take a Relic.
revoke execute on function public.roll_challenge(uuid, text), public.roll_press(uuid, boolean) from authenticated;

revoke execute on function public.relic_kind_ok, public.ensure_progress, public.day_open_step, public.spend_relic
  from public, anon, authenticated;
revoke execute on function public.store_closed_by, public.set_aside, public.store_state, public.buy_gear, public.buy_relic,
  public.give_relic, public.roll_card, public.roll_press_card, public.use_combat_relic from public, anon;
grant execute on function public.store_closed_by, public.set_aside, public.store_state, public.buy_gear, public.buy_relic,
  public.give_relic, public.roll_card, public.roll_press_card, public.use_combat_relic to authenticated;
