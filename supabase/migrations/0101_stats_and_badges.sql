-- Piece D2 (docs/design/handoff-ledger.md):
-- Server counting of the twelve numbers and the badges (migration).
-- Evaluates real-time chase stats, 12 badges, and party leadership crowns.

alter table public.member_progress add column if not exists stats jsonb default '{}'::jsonb;
alter table public.member_progress add column if not exists badges text[] default array[]::text[];

-- Compute the 12 stats and 12 badges for a player in a party
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
  v_attr_val int;
  v_diff_attrs int := 0;
  v_has_down_to_thread boolean := false;
  v_has_clean_night boolean := false;
  v_has_whole_table boolean := false;
  v_party_size int := 1;
  v_week_press_max int := 0;
  v_week_full boolean := false;
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
  if v_days_played > 0 and v_best_streak = 0 then
    v_best_streak := 1;
  end if;

  -- 3. Gatherings Attended: Gatherings joined
  select count(distinct week)::int into v_gatherings_attended
  from public.gathering_present
  where party_id = p_party and user_id = p_user;

  -- 4. Fragments Solved: Missing lock-words unjumbled in Seeker Chest or Campfire
  select count(*)::int into v_fragments_solved
  from public.fragment_words
  where party_id = p_party and solved_by = p_user;

  -- 5. Relics Given: Total Relics given to friends
  select count(*)::int into v_relics_given
  from public.relic_gifts
  where party_id = p_party and from_user = p_user;

  -- 6. Times Stepped Up: Taking the opening Approach roll for the party
  select count(*)::int into v_times_stepped_up
  from public.gatherings g
  where g.party_id = p_party and (
    g.state -> 'approach' -> 'vols' @> to_jsonb(p_user::text)
    or g.state -> 'approach' ->> 'roller' = p_user::text
  );

  -- 7. Fragments Matched: Scripture lines matched at the Gathering
  select coalesce(sum((g.state -> 'earned' -> (p_user::text) ->> 'match')::int), 0)::int
  into v_fragments_matched
  from public.gatherings g
  where g.party_id = p_party;

  -- 8. Battles Won: Gathering Battles won side by side
  select count(*)::int into v_battles_won
  from public.gatherings g
  join public.gathering_present gp on gp.party_id = g.party_id and gp.week = g.week and gp.user_id = p_user
  where g.party_id = p_party and g.state -> 'battle' ->> 'outcome' = 'won';

  -- 9. Challenges Cleared: Challenges passed
  select count(*)::int into v_challenges_cleared
  from public.member_days
  where party_id = p_party and user_id = p_user and challenge is not null
    and coalesce((challenge ->> 'pass')::boolean, false) = true;

  -- 10. Challenges Pressed On: Optional harder road attempted, cleared or not
  select count(*)::int into v_challenges_pressed_on
  from public.member_days
  where party_id = p_party and user_id = p_user and press is not null
    and not coalesce((press ->> 'left')::boolean, false);

  -- 11. Enemies Defeated: Foes brought down personally in weekday fights and Battles
  select count(*)::int into v_enemies_defeated
  from public.member_days
  where party_id = p_party and user_id = p_user and fight is not null
    and (coalesce((fight ->> 'won')::boolean, false) = true
         or coalesce((fight ->> 'ehp')::int, 100) <= 0);

  -- Include foes defeated at Gathering Battles where party won and player was not fallen
  select v_enemies_defeated + count(*)::int into v_enemies_defeated
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'battle' ->> 'outcome' = 'won'
    and exists (
      select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f
      where f ->> 'id' = p_user::text and not coalesce((f ->> 'fallen')::boolean, false)
    );

  -- 12. Perfect Rolls: Natural 20s on a Challenge, Press On, or attack roll (NO Notice roll)
  select (
    coalesce((select count(*) from public.member_days where party_id = p_party and user_id = p_user and (challenge ->> 'd20')::int = 20), 0) +
    coalesce((select count(*) from public.member_days where party_id = p_party and user_id = p_user and (press ->> 'd20')::int = 20), 0) +
    coalesce((select count(*) from public.member_days md, jsonb_array_elements(md.fight -> 'rounds') r
              where md.party_id = p_party and md.user_id = p_user and (r ->> 'd20')::int = 20), 0)
  )::int into v_perfect_rolls;

  -- Include Gathering Approach roll if caller was roller and rolled 20
  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'approach' ->> 'roller' = p_user::text
    and (g.state -> 'approach' ->> 'roll')::int = 20;

  -- Include Gathering Battle attack 20s
  select v_perfect_rolls + coalesce(sum(
    case when (r -> 'lines' -> p_user::text ->> 'roll')::int = 20 then 1 else 0 end
  ), 0)::int into v_perfect_rolls
  from public.gatherings g,
       jsonb_array_elements(coalesce(g.state -> 'battle' -> 'rounds', '[]'::jsonb)) r
  where g.party_id = p_party;

  -- =========================================================================
  -- EVALUATE THE 12 BADGES
  -- =========================================================================

  -- Badge 1: First Light (Finish your first chapter)
  if v_days_played >= 1 then
    v_badges := array_append(v_badges, 'first-light');
  end if;

  -- Badge 2: A Whole Week (Play all 6 weekday chapters + attend Gathering in one week)
  select exists (
    select 1
    from public.member_days md
    join public.gathering_present gp on gp.party_id = md.party_id and gp.week = md.week and gp.user_id = md.user_id
    where md.party_id = p_party and md.user_id = p_user and md.finished_at is not null and md.day between 1 and 6
    group by md.week
    having count(distinct md.day) >= 6
  ) into v_week_full;
  if v_week_full then
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

  -- Badge 7: The Whole Table (Every single approved party member plays on the exact same day)
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

  -- Badge 8: A Clean Night (Opening Approach cleared, Battle won with 0 fallen, United Effort won)
  select exists (
    select 1
    from public.gatherings g
    where g.party_id = p_party
      and coalesce((g.state -> 'approach' -> 'roll' ->> 'pass')::boolean, false) = true
      and coalesce(g.state -> 'battle' ->> 'outcome', '') = 'won'
      and coalesce(g.state -> 'ue' ->> 'outcome', '') = 'won'
      and not exists (
        select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f
        where coalesce((f ->> 'fallen')::boolean, false) = true
      )
  ) into v_has_clean_night;
  if v_has_clean_night then
    v_badges := array_append(v_badges, 'clean-night');
  end if;

  -- Badge 9: Perfect (Roll your first natural 20 on a Challenge or combat strike)
  if v_perfect_rolls >= 1 then
    v_badges := array_append(v_badges, 'perfect');
  end if;

  -- Badge 10: Never Enough (Clear three optional [PRESS ON] rolls in one week)
  select coalesce(max(c), 0) into v_week_press_max
  from (
    select count(*) as c
    from public.member_days
    where party_id = p_party and user_id = p_user and press is not null
      and coalesce((press ->> 'pass')::boolean, false) = true
    group by week
  ) w;
  if v_week_press_max >= 3 then
    v_badges := array_append(v_badges, 'never-enough');
  end if;

  -- Badge 11: Many Hands (Clear weekday Challenges with at least four different Attributes)
  select count(distinct challenge ->> 'attr')::int into v_diff_attrs
  from public.member_days
  where party_id = p_party and user_id = p_user and challenge is not null
    and coalesce((challenge ->> 'pass')::boolean, false) = true;
  if v_diff_attrs >= 4 then
    v_badges := array_append(v_badges, 'many-hands');
  end if;

  -- Badge 12: Down to a Thread (Win an enemy fight with 10 HP or less remaining)
  select exists (
    select 1
    from public.member_days
    where party_id = p_party and user_id = p_user and fight is not null
      and coalesce((fight ->> 'won')::boolean, false) = true
      and coalesce((fight ->> 'php')::int, (fight -> 'rounds' -> -1 ->> 'playerHpAfter')::int, 100) between 1 and 10
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

-- Public RPC called by the client to get the player's 12 stats, 12 badges, and party leadership crowns
create or replace function public.my_record(p_party uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_my_rec jsonb;
  v_my_stats jsonb;
  v_my_badges jsonb;

  v_member record;
  v_mem_rec jsonb;
  v_mem_stats jsonb;
  v_stat_key text;
  v_my_val int;
  v_other_val int;
  v_lead_val int;
  v_lead_friend text;
  v_is_lead boolean;
  v_leads jsonb := '{}'::jsonb;
  v_leads_count int := 0;

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

  -- 2. Compare against all party members to compute crowns and leads
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
        -- Another member shares the top lead
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

revoke execute on function public.compute_member_record(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.my_record(uuid) from public, anon;
grant execute on function public.my_record(uuid) to authenticated;
