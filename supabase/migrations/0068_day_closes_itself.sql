-- A day left open when it ends finishes by itself (Core Rules §12a, "The day"; Fake Guru, 17 Oct: "1 yes").
--   - A card left unrolled, or set aside, gives the failure branch and costs no gold ("an expired card"); it posts nothing.
--   - A [PRESS ON] not taken is left.
--   - A fight not finished is rolled out and pays its real result (the tutorial fight too).
-- The day is not counted as played: that needs the chapter read to its last line (§12a), so finished_at stays empty
-- and the friend gets the day's recap next time. The day is marked closed_at instead.
-- It runs when anyone in the party next opens the game (every call goes through my_today_row), for every friend in
-- the party, so a friend who never comes back is still closed. Additive only.

alter table public.member_days add column closed_at timestamptz;

-- One round of a closed day's fight, for any friend (the same rules as fight_round: Core Rules §4). The strike-first
-- rule follows the day: an expired card counts as a failure, and a choice never made gives the enemy the first strike.
create function public.fight_round_closing(p_party uuid, p_user uuid, p_week int, p_day int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_step jsonb; v_meta jsonb; v_row public.member_days; v_rule jsonb; v_enemy_first boolean;
        v_fight jsonb; v_rounds jsonb; v_php int; v_ehp int; v_weapon int; v_armor int; v_def int; v_atk int;
        v_d20 int; v_ed20 int; v_margin int; v_emargin int; v_hit boolean := false; v_ehit boolean := false;
        v_pstruck boolean := false; v_estruck boolean := false; v_round jsonb; v_done boolean; v_won boolean; v_relic boolean;
begin
  select * into v_row from public.member_days where party_id = p_party and user_id = p_user and week = p_week and day = p_day;
  v_step := public.today_step(p_party, p_week, p_day, 'fight');
  v_fight := coalesce(v_row.fight, jsonb_build_object('rounds', '[]'::jsonb, 'done', false));
  if v_step is null or (v_fight ->> 'done')::boolean then return v_fight; end if;
  v_rule := v_step -> 'strikeFirst';
  if v_rule ->> 'on' = 'challenge' then
    v_enemy_first := not coalesce((v_row.challenge ->> 'pass')::boolean, false);
  elsif v_rule ->> 'on' = 'choice' then
    v_enemy_first := not coalesce((v_rule -> 'options') @> ((v_row.picks -> (v_rule ->> 'choice')) -> 0), false);
  else
    v_enemy_first := false;
  end if;
  v_meta := public.today_meta(p_party, p_week, p_day);
  v_def := (v_meta ->> 'wDef')::int; v_atk := (v_meta ->> 'wAtk')::int;
  v_rounds := v_fight -> 'rounds';
  v_relic := v_fight ? 'relicFrom' and jsonb_array_length(v_rounds) + 1 >= (v_fight ->> 'relicFrom')::int;
  select 13 + weapon_level + (case when v_relic then 1 else 0 end), 26 + armor_level + (case when v_relic then 1 else 0 end)
    into v_weapon, v_armor from public.member_progress where party_id = p_party and user_id = p_user;
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
  v_fight := v_fight || jsonb_build_object('rounds', v_rounds || v_round, 'done', v_done, 'won', v_won, 'rolledOut', true);
  if v_done and v_won and coalesce((v_meta ->> 'fightReward')::int, 0) > 0 then
    update public.member_progress set gold = gold + (v_meta ->> 'fightReward')::int where party_id = p_party and user_id = p_user;
    v_fight := v_fight || jsonb_build_object('gold', (v_meta ->> 'fightReward')::int);
  end if;
  update public.member_days set fight = v_fight, aside = false
  where party_id = p_party and user_id = p_user and week = p_week and day = p_day;
  return v_fight;
end;
$$;

-- Close every friend's open weekday in this party that is before today.
create function public.close_past_days(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; r public.member_days; v_fight jsonb; n int;
begin
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then return; end if;
  for r in
    select md.* from public.member_days md
    where md.party_id = p_party and md.finished_at is null and md.closed_at is null and md.day < 7
      and (md.week * 7 + md.day) < (v_week * 7 + v_day)
    for update skip locked
  loop
    if public.today_meta(p_party, r.week, r.day) is null then continue; end if;
    -- The card: rolled, or it expires as a failure that costs nothing.
    if public.today_step(p_party, r.week, r.day, 'challenge') is not null and r.challenge is null then
      update public.member_days set challenge = jsonb_build_object('pass', false, 'expired', true, 'growth', 0)
      where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
    end if;
    -- [PRESS ON] not taken is left.
    if public.today_step(p_party, r.week, r.day, 'press') is not null and r.press is null
       and coalesce((r.challenge ->> 'pass')::boolean, false) then
      update public.member_days set press = jsonb_build_object('left', true, 'expired', true)
      where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
    end if;
    -- The fight is rolled out (a fight lasts 4 to 6 rounds; 60 is only a guard).
    n := 0;
    loop
      v_fight := public.fight_round_closing(p_party, r.user_id, r.week, r.day);
      exit when public.today_step(p_party, r.week, r.day, 'fight') is null or (v_fight ->> 'done')::boolean;
      n := n + 1;
      exit when n >= 60;
    end loop;
    update public.member_days set closed_at = now(), aside = false
    where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
  end loop;
end;
$$;

-- The calling player's row for today (0012), now closing the party's past days first.
create or replace function public.my_today_row(p_party uuid, out o_week int, out o_day int)
language plpgsql security definer set search_path = '' as $$
declare v_class text; v_second text; v_attrs jsonb;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid()
                 and status = 'approved' and session_zero_done_at is not null) then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into o_week, o_day from public.party_today(p_party) t;
  if o_week is null then raise exception 'the story has not started'; end if;
  perform public.close_past_days(p_party);
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

revoke execute on function public.fight_round_closing, public.close_past_days from public, anon, authenticated;
