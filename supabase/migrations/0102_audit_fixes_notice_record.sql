-- Migration 0102: Audit remediation for Notice roll, security-definer permissions, and canonical chase stats/badges
-- Fixes:
-- 1. Security: Check party membership in roll_notice and my_record; revoke compute_member_record from authenticated/public.
-- 2. Notice roll: DC 3, tier table bonuses (+0, +2, +4, +6, +8 for Master 101+), consistent skill resolution, membership check.
-- 3. Sharpened badge: Evaluates Adept tier (score >= 51).
-- 4. Lifeline badge: Evaluates genuine relic rescues (relic turned a fail into a pass, net 1..4).
-- 5. Enemies Defeated: Includes both weekday fights and Gathering Battle victories.
-- 6. Perfect Rolls: Natural 20 on Challenge, Press On, and attack rolls (excludes Notice and damage dice).

-- ---- 1. roll_notice ----
create or replace function public.roll_notice(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_user uuid := auth.uid();
  v_existing jsonb;
  v_attrs jsonb;
  v_class text;
  v_class_attr text;
  v_best text;
  v_top int := 10;
  v_d20 int;
  v_bonus int := 0;
  v_total int;
  v_pass boolean;
  v_notice_line jsonb;
  v_text text;
  v_novice_note text := null;
  v_res jsonb;
begin
  if v_user is null then raise exception 'not signed in'; end if;

  -- Security: Caller must be an approved member of this party
  if not exists (
    select 1 from public.party_members
    where party_id = p_party and user_id = v_user and status = 'approved'
  ) then
    raise exception 'not in party';
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;

  select notice into v_existing from public.member_days
  where party_id = p_party and user_id = v_user and week = v_week and day = v_day;

  if v_existing is not null then
    return v_existing;
  end if;

  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = v_user;
  select class into v_class from public.party_members where party_id = p_party and user_id = v_user;
  v_class_attr := public.class_attribute(v_class);

  -- Retrieve canon notice line for today (which resolves the best skill per chapter script)
  v_notice_line := public.notice_line_for(p_party, v_user, v_week, v_day);

  if v_notice_line is not null and v_notice_line ? 'attr' then
    v_best := v_notice_line ->> 'attr';
  else
    v_best := coalesce(v_class_attr, 'Intellect');
  end if;

  v_top := coalesce((v_attrs ->> v_best)::int, 10);

  -- Core Rules §12 tier bonuses: Novice 10-25 (+0), Apprentice 26-50 (+2), Adept 51-75 (+4), Champion 76-100 (+6), Master 101+ (+8)
  v_bonus := case
    when v_top >= 101 then 8
    when v_top >= 76 then 6
    when v_top >= 51 then 4
    when v_top >= 26 then 2
    else 0
  end;

  v_d20 := floor(random() * 20 + 1)::int;
  v_total := v_d20 + v_bonus;
  -- DC 3: tie fails in Mythios, so net >= 1 (total >= 4) succeeds
  v_pass := (v_total >= 4);

  if v_pass then
    if v_notice_line is not null and coalesce(v_notice_line ->> 'text', '') <> '' then
      v_text := v_notice_line ->> 'text';
    else
      v_text := 'You notice subtle details in your surroundings.';
    end if;
    if v_top < 26 then
      v_novice_note := 'At Apprentice (26), you would catch more.';
    end if;
  else
    v_text := 'Nothing catches your eye.';
  end if;

  v_res := jsonb_build_object(
    'attr', v_best,
    'score', v_top,
    'd20', v_d20,
    'bonus', v_bonus,
    'total', v_total,
    'dc', 3,
    'pass', v_pass,
    'text', v_text,
    'noviceNote', v_novice_note
  );

  insert into public.member_days (party_id, user_id, week, day, notice)
  values (p_party, v_user, v_week, v_day, v_res)
  on conflict (party_id, user_id, week, day)
  do update set notice = v_res;

  return v_res;
end;
$$;

revoke execute on function public.roll_notice(uuid) from public, anon;
grant execute on function public.roll_notice(uuid) to authenticated;

-- ---- 2. compute_member_record (Internal helper, not directly callable by players) ----
create or replace function public.compute_member_record(p_party uuid, p_user uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_days_played int := 0;
  v_best_streak int := 0;
  v_gatherings_attended int := 0;
  v_fragments_solved int := 0;
  v_relics_given int := 0;
  v_times_stepped_up int := 0;
  v_fragments_matched int := 0;
  v_battles_won int := 0;
  v_challenges_cleared int := 0;
  v_challenges_pressed_on int := 0;
  v_enemies_defeated int := 0;
  v_perfect_rolls int := 0;

  v_badges text[] := array[]::text[];
  v_stats jsonb;
  v_streak int := 0;
  v_last_idx int := -999;
  v_day_record record;
  v_attrs jsonb;
  v_has_down_to_thread boolean := false;
  v_has_clean_night boolean := false;
  v_has_whole_table boolean := false;
  v_party_size int := 1;
  v_week_press_max int := 0;
  v_g record;
begin
  -- 1. Days Played: Total days read to the last line over the season
  select count(*)::int into v_days_played
  from public.member_days
  where party_id = p_party and user_id = p_user and finished_at is not null;

  -- 2. Best Streak: Longest consecutive run of days played
  for v_day_record in
    select (week - 1) * 7 + day as day_idx
    from public.member_days
    where party_id = p_party and user_id = p_user and finished_at is not null
    order by (week - 1) * 7 + day asc
  loop
    if v_day_record.day_idx = v_last_idx + 1 then
      v_streak := v_streak + 1;
    else
      v_streak := 1;
    end if;
    if v_streak > v_best_streak then
      v_best_streak := v_streak;
    end if;
    v_last_idx := v_day_record.day_idx;
  end loop;

  -- 3. Gatherings Attended
  select count(*)::int into v_gatherings_attended
  from public.gathering_present
  where party_id = p_party and user_id = p_user;

  -- 4. Fragments Solved: Distinct fragments where player filled a missing word in Seeker Chest
  select count(distinct fragment_id)::int into v_fragments_solved
  from public.fragment_words
  where party_id = p_party and solved_by = p_user;

  -- 5. Relics Given: Relics sent to teammates
  select count(*)::int into v_relics_given
  from public.relic_gifts
  where party_id = p_party and from_user = p_user;

  -- 6. Times Stepped Up: Volunteers for the Approach roll at Gatherings
  select count(*)::int into v_times_stepped_up
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'approach' -> 'vols' ? p_user::text;

  -- 7. Fragments Matched: Correct lore matches at Gatherings
  select count(*)::int into v_fragments_matched
  from public.gatherings g,
       jsonb_each(coalesce(g.state -> 'match', '{}'::jsonb)) as m(k, v)
  where g.party_id = p_party
    and v -> 'right' ? p_user::text;

  -- 8. Battles Won: Gathering Battles won with player present
  select count(*)::int into v_battles_won
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'battle' ->> 'outcome' = 'won'
    and exists (
      select 1 from public.gathering_present gp
      where gp.party_id = p_party and gp.week = g.week and gp.user_id = p_user
    );

  -- 9. Challenges Cleared: Total weekday Challenges passed
  select count(*)::int into v_challenges_cleared
  from public.member_days
  where party_id = p_party and user_id = p_user
    and challenge is not null and (challenge ->> 'pass')::boolean = true;

  -- 10. Challenges Pressed On: Total optional harder rolls attempted
  select count(*)::int into v_challenges_pressed_on
  from public.member_days
  where party_id = p_party and user_id = p_user
    and press is not null;

  -- 11. Enemies Defeated: Weekday fight victories PLUS Gathering battle victories
  select count(*)::int into v_enemies_defeated
  from public.member_days
  where party_id = p_party and user_id = p_user
    and fight is not null and (fight ->> 'won')::boolean = true;

  -- Add Gathering battle foes defeated where the player was a fighter and battle was won
  for v_g in
    select g.state -> 'battle' as b
    from public.gatherings g
    where g.party_id = p_party and g.state -> 'battle' ->> 'outcome' = 'won'
  loop
    if exists (
      select 1 from jsonb_array_elements(v_g.b -> 'fighters') f
      where f ->> 'id' = p_user::text and not coalesce((f ->> 'fallen')::boolean, false)
    ) then
      v_enemies_defeated := v_enemies_defeated + 1;
    end if;
  end loop;

  -- 12. Perfect Rolls: Natural 20s on Challenges, Press On, and attack rolls (NO Notice, NO damage rolls)
  select count(*)::int into v_perfect_rolls
  from public.member_days
  where party_id = p_party and user_id = p_user
    and (
      (challenge is not null and (challenge ->> 'd20')::int = 20)
      or (press is not null and (press ->> 'd20')::int = 20)
      or (fight is not null and (fight ->> 'playerRoll')::int = 20)
    );

  -- Add Gathering Approach natural 20 if caller was roller
  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'approach' ->> 'roller' = p_user::text
    and (g.state -> 'approach' ->> 'roll')::int = 20;

  -- Add Gathering Battle player attack natural 20s
  for v_g in
    select g.state -> 'battle' as b from public.gatherings g where g.party_id = p_party
  loop
    select v_perfect_rolls + count(*)::int into v_perfect_rolls
    from jsonb_array_elements(coalesce(v_g.b -> 'rounds', '[]'::jsonb)) r
    where (r -> 'lines' -> p_user::text ->> 'roll')::int = 20;
  end loop;

  -- =========================================================================
  -- EVALUATE THE 12 BADGES
  -- =========================================================================

  -- Badge 1: First Light (Finish first chapter)
  if v_days_played >= 1 then
    v_badges := array_append(v_badges, 'first-light');
  end if;

  -- Badge 2: A Whole Week (Play all 6 days + Gathering in one week)
  if exists (
    select 1
    from (
      select week, count(*) as c
      from public.member_days
      where party_id = p_party and user_id = p_user and finished_at is not null
      group by week
    ) w
    join public.gathering_present gp on gp.party_id = p_party and gp.user_id = p_user and gp.week = w.week
    where w.c >= 6
  ) then
    v_badges := array_append(v_badges, 'whole-week');
  end if;

  -- Badge 3: The Long Road (Come to all 6 Gatherings)
  if v_gatherings_attended >= 6 then
    v_badges := array_append(v_badges, 'long-road');
  end if;

  -- Badge 4: Sharpened (Advance any single Attribute to Adept, 51+ points, per Core Rules §12)
  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = p_user;
  if exists (
    select 1
    from jsonb_each_text(coalesce(v_attrs, '{}'::jsonb))
    where value ~ '^[0-9]+$' and value::int >= 51
  ) then
    v_badges := array_append(v_badges, 'sharpened');
  end if;

  -- Badge 5: Open Hand (Gift a Relic to a friend for the first time)
  if v_relics_given >= 1 then
    v_badges := array_append(v_badges, 'open-hand');
  end if;

  -- Badge 6: Lifeline (A Relic you gifted carries a friend: turned a fail into a pass, net margin 1..4)
  if exists (
    select 1 from public.relic_gifts rg
    join public.member_days md on md.party_id = rg.party_id and md.user_id = rg.to_user
    where rg.party_id = p_party and rg.from_user = p_user
      and (
        (md.challenge is not null and (md.challenge ->> 'pass')::boolean = true and md.challenge ? 'relic' and (md.challenge ->> 'net')::int between 1 and 4)
        or (md.fight is not null and (md.fight ->> 'won')::boolean = true and md.fight ? 'relic')
      )
  ) then
    v_badges := array_append(v_badges, 'lifeline');
  end if;

  -- Badge 7: The Whole Table (Every approved party member plays on the same day)
  select count(*)::int into v_party_size
  from public.party_members
  where party_id = p_party and status = 'approved' and session_zero_done_at is not null;

  if v_party_size > 0 then
    select exists (
      select 1
      from public.member_days md
      where md.party_id = p_party and md.finished_at is not null
      group by md.week, md.day
      having count(distinct md.user_id) >= v_party_size
    ) into v_has_whole_table;
    if v_has_whole_table then
      v_badges := array_append(v_badges, 'whole-table');
    end if;
  end if;

  -- Badge 8: A Clean Night (Flawless Gathering)
  select exists (
    select 1 from public.gatherings g
    where g.party_id = p_party
      and coalesce((g.state -> 'approach' ->> 'passed')::boolean, false) = true
      and g.state -> 'battle' ->> 'outcome' = 'won'
      and not exists (
        select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f
        where coalesce((f ->> 'fallen')::boolean, false) = true
      )
      and coalesce((g.state -> 'ue' ->> 'passed')::boolean, false) = true
  ) into v_has_clean_night;

  if v_has_clean_night then
    v_badges := array_append(v_badges, 'clean-night');
  end if;

  -- Badge 9: Perfect (Roll your first natural 20)
  if v_perfect_rolls >= 1 then
    v_badges := array_append(v_badges, 'perfect');
  end if;

  -- Badge 10: Never Enough (Clear 3 Press On rolls in one week)
  select coalesce(max(c), 0) into v_week_press_max
  from (
    select count(*) as c
    from public.member_days
    where party_id = p_party and user_id = p_user
      and press is not null and (press ->> 'pass')::boolean = true
    group by week
  ) sub;

  if v_week_press_max >= 3 then
    v_badges := array_append(v_badges, 'never-enough');
  end if;

  -- Badge 11: Many Hands (Clear Challenges with 4 different Attributes)
  select count(distinct challenge ->> 'attr')::int into v_party_size
  from public.member_days
  where party_id = p_party and user_id = p_user
    and challenge is not null and (challenge ->> 'pass')::boolean = true;

  if v_party_size >= 4 then
    v_badges := array_append(v_badges, 'many-hands');
  end if;

  -- Badge 12: Down to a Thread (Win fight with 10 HP or less)
  select exists (
    select 1 from public.member_days
    where party_id = p_party and user_id = p_user
      and fight is not null
      and (fight ->> 'won')::boolean = true
      and (fight ->> 'playerHp')::int <= 10
  ) into v_has_down_to_thread;

  if v_has_down_to_thread then
    v_badges := array_append(v_badges, 'down-to-thread');
  end if;

  v_stats := jsonb_build_object(
    'daysPlayed', v_days_played,
    'bestStreak', v_best_streak,
    'gatheringsAttended', v_gatherings_attended,
    'fragmentsSolved', v_fragments_solved,
    'relicsGiven', v_relics_given,
    'timesSteppedUp', v_times_stepped_up,
    'fragmentsMatched', v_fragments_matched,
    'battlesWon', v_battles_won,
    'challengesCleared', v_challenges_cleared,
    'challengesPressedOn', v_challenges_pressed_on,
    'enemiesDefeated', v_enemies_defeated,
    'perfectRolls', v_perfect_rolls
  );

  return jsonb_build_object(
    'stats', v_stats,
    'badges', to_jsonb(v_badges)
  );
end;
$$;

-- Revoke compute_member_record from public and authenticated (cannot be called directly by players)
revoke execute on function public.compute_member_record(uuid, uuid) from public, anon, authenticated;

-- ---- 3. my_record ----
create or replace function public.my_record(p_party uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_my_rec jsonb;
  v_my_stats jsonb;
  v_my_badges jsonb;
  v_stat_key text;
  v_my_val int;
  v_lead_val int;
  v_lead_friend text;
  v_is_lead boolean;
  v_leads_count int := 0;
  v_leads jsonb := '{}'::jsonb;
  v_member record;
  v_mem_rec jsonb;
  v_mem_stats jsonb;
  v_other_val int;

  v_stat_keys text[] := array[
    'daysPlayed', 'bestStreak', 'gatheringsAttended', 'fragmentsSolved',
    'relicsGiven', 'timesSteppedUp', 'fragmentsMatched', 'battlesWon',
    'challengesCleared', 'challengesPressedOn', 'enemiesDefeated', 'perfectRolls'
  ];
begin
  if v_user is null then raise exception 'not signed in'; end if;

  -- Security: Caller must be an approved member of this party
  if not exists (
    select 1 from public.party_members
    where party_id = p_party and user_id = v_user and status = 'approved'
  ) then
    raise exception 'not in party';
  end if;

  -- 1. Compute for caller
  v_my_rec := public.compute_member_record(p_party, v_user);
  v_my_stats := v_my_rec -> 'stats';
  v_my_badges := v_my_rec -> 'badges';

  -- Persist cached stats/badges on member_progress
  update public.member_progress
  set stats = v_my_stats,
      badges = (select coalesce(array_agg(x::text), array[]::text[]) from jsonb_array_elements_text(v_my_badges) x)
  where party_id = p_party and user_id = v_user;

  -- 2. Compare against approved party members to compute crowns and leads
  foreach v_stat_key in array v_stat_keys loop
    v_my_val := coalesce((v_my_stats ->> v_stat_key)::int, 0);
    v_lead_val := v_my_val;
    v_lead_friend := 'You';
    v_is_lead := true;

    for v_member in
      select m.user_id, m.character_name
      from public.party_members m
      where m.party_id = p_party and m.status = 'approved' and m.user_id <> v_user
    loop
      v_mem_rec := public.compute_member_record(p_party, v_member.user_id);
      v_mem_stats := v_mem_rec -> 'stats';
      v_other_val := coalesce((v_mem_stats ->> v_stat_key)::int, 0);

      if v_other_val > v_lead_val then
        v_lead_val := v_other_val;
        v_lead_friend := coalesce(v_member.character_name, 'A friend');
        v_is_lead := false;
      elsif v_other_val = v_lead_val and not v_is_lead then
        v_lead_friend := coalesce(v_member.character_name, 'A friend');
      end if;
    end loop;

    -- A player leads if their score is highest and > 0 (or daysPlayed/streak >= 1)
    if v_my_val > 0 and v_is_lead then
      v_leads_count := v_leads_count + 1;
    else
      v_is_lead := false;
    end if;

    v_leads := jsonb_set(v_leads, array[v_stat_key], jsonb_build_object(
      'isLead', v_is_lead,
      'leadVal', v_lead_val,
      'leadFriend', v_lead_friend
    ));
  end loop;

  return jsonb_build_object(
    'stats', v_my_stats,
    'earnedBadgeIds', v_my_badges,
    'leads', v_leads,
    'leadsCount', v_leads_count
  );
end;
$$;

revoke execute on function public.my_record(uuid) from public, anon;
grant execute on function public.my_record(uuid) to authenticated;
