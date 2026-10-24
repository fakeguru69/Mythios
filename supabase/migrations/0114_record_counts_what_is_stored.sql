-- 0114 (24 Oct, Phase 0.3 of the make-it-great plan): the Record's numbers and badges count what the game stores.
--
-- The live server ran 0101/0102 copies of these three; the repo's 0104 copies had their own faults. Found by the
-- 24 Oct audit and checked against what each roll really writes:
--   * Times Stepped Up was always 0 (the volunteers are {"u": id} objects, not bare ids);
--   * A Clean Night could never be earned (it read approach.passed and ue.passed; the Gathering writes
--     approach.roll.pass and ue.outcome);
--   * Perfect Rolls turned the Approach's roll, an object, into a number: an error for whoever rolled it, which stopped
--     their Record, "The Party, Yesterday" and the Season Titles loading; an attack 20 now counts only when you struck;
--   * Lifeline counted any Relic; now a Relic of the kind you gave, after your gift, that turned the roll (or a Combat
--     Relic in a fight won). The 0104 copy read the Relic number as true/false, another error;
--   * Down to a Thread read an HP field the fight never writes;
--   * the tier canon calls Expert was announced as "Champion";
--   * the private crown nudge told everyone "Play tomorrow to draw level", even for numbers a day does not raise.
-- Never Enough (three [PRESS ON] in one week, when no week has more than two) is unchanged: Fake Guru decides.

CREATE OR REPLACE FUNCTION public.compute_member_record(p_party uuid, p_user uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_curr_week int;
  v_curr_day int;
  v_days_this_week int := 0;
  v_press_cleared_this_week int := 0;
  v_badges text[] := array[]::text[];
  v_streak int := 0;
  v_last_idx int := -999;
  v_day record;
  v_attrs jsonb;
  v_party_size int;
  v_attr_count int;
  v_week_press_max int;
  v_me text := p_user::text;
begin
  select t.week, t.day into v_curr_week, v_curr_day from public.party_today(p_party) t;

  -- Days Played, and this week's days and [PRESS ON] passes (for the badges' progress lines).
  select count(*)::int into v_days_played
  from public.member_days where party_id = p_party and user_id = p_user and finished_at is not null;
  if v_curr_week is not null then
    select count(distinct day)::int into v_days_this_week from public.member_days
    where party_id = p_party and user_id = p_user and week = v_curr_week and finished_at is not null and day between 1 and 6;
    select count(*)::int into v_press_cleared_this_week from public.member_days
    where party_id = p_party and user_id = p_user and week = v_curr_week and coalesce((press ->> 'pass')::boolean, false);
  end if;

  -- Best Streak: the longest run of days played in a row.
  for v_day in
    select (week - 1) * 7 + day as idx from public.member_days
    where party_id = p_party and user_id = p_user and finished_at is not null order by 1
  loop
    v_streak := case when v_day.idx = v_last_idx + 1 then v_streak + 1 else 1 end;
    v_best_streak := greatest(v_best_streak, v_streak);
    v_last_idx := v_day.idx;
  end loop;

  select count(*)::int into v_gatherings_attended
  from public.gathering_present where party_id = p_party and user_id = p_user;

  -- Fragments Solved: fragments where you filled a missing word.
  select count(distinct fragment_id)::int into v_fragments_solved
  from public.fragment_words where party_id = p_party and solved_by = p_user;

  select count(*)::int into v_relics_given
  from public.relic_gifts where party_id = p_party and from_user = p_user;

  -- Times Stepped Up: the volunteers are a list of {"u": id} (24 Oct: the old test looked for a bare id and never matched).
  select count(*)::int into v_times_stepped_up
  from public.gatherings g
  where g.party_id = p_party
    and (exists (select 1 from jsonb_array_elements(coalesce(g.state -> 'approach' -> 'vols', '[]'::jsonb)) v where v ->> 'u' = v_me)
         or g.state -> 'approach' -> 'roll' ->> 'by' = v_me);

  select count(*)::int into v_fragments_matched
  from public.gatherings g, jsonb_each(coalesce(g.state -> 'match', '{}'::jsonb)) m(k, v)
  where g.party_id = p_party and jsonb_typeof(m.v -> 'right') = 'array' and m.v -> 'right' ? v_me;

  -- Battles Won: Gathering Battles the party won while you fought in them.
  select count(*)::int into v_battles_won
  from public.gatherings g
  where g.party_id = p_party and g.state -> 'battle' ->> 'outcome' = 'won'
    and exists (select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f where f ->> 'id' = v_me);

  select count(*)::int into v_challenges_cleared
  from public.member_days where party_id = p_party and user_id = p_user and coalesce((challenge ->> 'pass')::boolean, false);

  select count(*)::int into v_challenges_pressed_on
  from public.member_days where party_id = p_party and user_id = p_user
    and press is not null and not coalesce((press ->> 'left')::boolean, false) and press ? 'd20';

  -- Enemies Defeated: weekday fights won, and won Gathering Battles you were still standing at.
  select count(*)::int into v_enemies_defeated
  from public.member_days where party_id = p_party and user_id = p_user and coalesce((fight ->> 'won')::boolean, false);
  select v_enemies_defeated + count(*)::int into v_enemies_defeated
  from public.gatherings g
  where g.party_id = p_party and g.state -> 'battle' ->> 'outcome' = 'won'
    and exists (select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f
                where f ->> 'id' = v_me and not coalesce((f ->> 'fallen')::boolean, false));

  -- Perfect Rolls: each 20 on a Challenge, [PRESS ON], the Approach, or an attack you made (never the Notice).
  -- 24 Oct: the Approach's roll is an object (its d20 is inside it); an attack counts only when you struck.
  select count(*) filter (where (challenge ->> 'd20')::int = 20) + count(*) filter (where (press ->> 'd20')::int = 20)
    into v_perfect_rolls
  from public.member_days where party_id = p_party and user_id = p_user;
  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.member_days md, jsonb_array_elements(coalesce(md.fight -> 'rounds', '[]'::jsonb)) r
  where md.party_id = p_party and md.user_id = p_user and (r ->> 'd20')::int = 20 and coalesce((r ->> 'playerStruck')::boolean, true);
  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.gatherings g
  where g.party_id = p_party and g.state -> 'approach' -> 'roll' ->> 'by' = v_me
    and (g.state -> 'approach' -> 'roll' ->> 'd20')::int = 20;
  -- Battle lines are kept under the friend each attack defended; the attacker is named, and is you when the name is your
  -- fighter's name in that Battle.
  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.gatherings g,
       jsonb_array_elements(coalesce(g.state -> 'battle' -> 'rounds', '[]'::jsonb)) r,
       jsonb_each(coalesce(r -> 'lines', '{}'::jsonb)) t(k, v),
       jsonb_array_elements(case when jsonb_typeof(t.v) = 'array' then t.v else '[]'::jsonb end) l
  where g.party_id = p_party and l ->> 'side' = 'party' and (l ->> 'roll')::int = 20
    and l ->> 'attacker' = (select f ->> 'name' from jsonb_array_elements(g.state -> 'battle' -> 'fighters') f where f ->> 'id' = v_me limit 1);

  -- The badges.
  if v_days_played >= 1 then v_badges := v_badges || 'first-light'::text; end if;

  if exists (
    select 1 from (
      select md.week from public.member_days md
      where md.party_id = p_party and md.user_id = p_user and md.finished_at is not null and md.day between 1 and 6
      group by md.week having count(distinct md.day) = 6
    ) w join public.gathering_present gp on gp.party_id = p_party and gp.week = w.week and gp.user_id = p_user
  ) then v_badges := v_badges || 'whole-week'::text; end if;

  if v_gatherings_attended >= 6 then v_badges := v_badges || 'long-road'::text; end if;

  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = p_user;
  if exists (select 1 from jsonb_each_text(coalesce(v_attrs, '{}'::jsonb)) where value ~ '^[0-9]+$' and value::int >= 51) then
    v_badges := v_badges || 'sharpened'::text;
  end if;

  if v_relics_given >= 1 then v_badges := v_badges || 'open-hand'::text; end if;

  -- Lifeline: a Relic of the kind you gave, used by that friend after your gift, on a roll it turned (a pass by 1 to 4,
  -- which fails without the +4), or a Combat Relic in a fight they then won (24 Oct: before, any Relic counted, and the
  -- Relic field, a number, was read as true or false).
  if exists (
    select 1 from public.relic_gifts rg
    join public.member_days md on md.party_id = rg.party_id and md.user_id = rg.to_user
    where rg.party_id = p_party and rg.from_user = p_user
      and rg.given_at < coalesce(md.finished_at, now())
      and (
        (rg.relic = md.challenge ->> 'attr' and coalesce((md.challenge ->> 'relic')::int, 0) > 0
          and coalesce((md.challenge ->> 'pass')::boolean, false) and (md.challenge ->> 'net')::int between 1 and 4)
        or (rg.relic = md.press ->> 'attr' and coalesce((md.press ->> 'relic')::int, 0) > 0
          and coalesce((md.press ->> 'pass')::boolean, false) and (md.press ->> 'net')::int between 1 and 4)
        or (rg.relic = 'Combat' and md.fight ? 'relicFrom' and coalesce((md.fight ->> 'won')::boolean, false))
      )
  ) then v_badges := v_badges || 'lifeline'::text; end if;

  -- The Whole Table: every friend who has made a character played the same day.
  select count(*)::int into v_party_size from public.party_members
  where party_id = p_party and status = 'approved' and session_zero_done_at is not null;
  if v_party_size >= 2 and exists (
    select 1 from public.member_days md
    join public.party_members m on m.party_id = md.party_id and m.user_id = md.user_id and m.status = 'approved'
    where md.party_id = p_party and md.finished_at is not null
    group by md.week, md.day having count(distinct md.user_id) >= v_party_size
  ) then v_badges := v_badges || 'whole-table'::text; end if;

  -- A Clean Night: the Approach passed (approach.roll.pass), the Battle won with nobody down, the United Effort won
  -- (ue.outcome). 24 Oct: the old test read keys the Gathering never writes.
  if exists (
    select 1 from public.gatherings g
    where g.party_id = p_party
      and coalesce((g.state -> 'approach' -> 'roll' ->> 'pass')::boolean, false)
      and g.state -> 'battle' ->> 'outcome' = 'won'
      and g.state -> 'ue' ->> 'outcome' = 'won'
      and not exists (select 1 from jsonb_array_elements(coalesce(g.state -> 'battle' -> 'fighters', '[]'::jsonb)) f
                      where coalesce((f ->> 'fallen')::boolean, false))
  ) then v_badges := v_badges || 'clean-night'::text; end if;

  if v_perfect_rolls >= 1 then v_badges := v_badges || 'perfect'::text; end if;

  -- Never Enough: three [PRESS ON] passes in one week (no week has more than two [PRESS ON] days; waiting on Fake Guru).
  select coalesce(max(c), 0) into v_week_press_max from (
    select count(*) c from public.member_days
    where party_id = p_party and user_id = p_user and coalesce((press ->> 'pass')::boolean, false) group by week) w;
  if v_week_press_max >= 3 then v_badges := v_badges || 'never-enough'::text; end if;

  select count(distinct challenge ->> 'attr')::int into v_attr_count
  from public.member_days where party_id = p_party and user_id = p_user and coalesce((challenge ->> 'pass')::boolean, false);
  if v_attr_count >= 4 then v_badges := v_badges || 'many-hands'::text; end if;

  -- Down to a Thread: a weekday fight won with 1 to 10 HP left (the last round's HP; the fight keeps no total).
  if exists (
    select 1 from public.member_days
    where party_id = p_party and user_id = p_user and coalesce((fight ->> 'won')::boolean, false)
      and (fight -> 'rounds' -> -1 ->> 'playerHpAfter')::int between 1 and 10
  ) then v_badges := v_badges || 'down-to-thread'::text; end if;

  return jsonb_build_object(
    'stats', jsonb_build_object(
      'daysPlayed', v_days_played, 'bestStreak', v_best_streak, 'gatheringsAttended', v_gatherings_attended,
      'fragmentsSolved', v_fragments_solved, 'relicsGiven', v_relics_given, 'timesSteppedUp', v_times_stepped_up,
      'fragmentsMatched', v_fragments_matched, 'battlesWon', v_battles_won, 'challengesCleared', v_challenges_cleared,
      'challengesPressedOn', v_challenges_pressed_on, 'enemiesDefeated', v_enemies_defeated, 'perfectRolls', v_perfect_rolls,
      'daysPlayedThisWeek', v_days_this_week, 'pressClearedThisWeek', v_press_cleared_this_week),
    'badges', to_jsonb(v_badges));
end;
$function$;

CREATE OR REPLACE FUNCTION public.check_member_big_moments(p_party uuid, p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_name text;
  v_rec jsonb;
  v_stats jsonb;
  v_badges jsonb;
  v_b text;
  v_b_title text;
  v_badge_key text;
  v_attrs jsonb;
  v_attr text;
  v_val int;
  v_tier_key text;
  v_stat_key text;
  v_stat_title text;
  v_my_val int;
  v_curr_leader uuid;
  v_curr_score int;
  v_diff int;
  v_diff_word text;
  v_nudge text;
  v_how text;

  v_stat_keys text[] := array[
    'daysPlayed', 'bestStreak', 'gatheringsAttended', 'fragmentsSolved',
    'relicsGiven', 'timesSteppedUp', 'fragmentsMatched', 'battlesWon',
    'challengesCleared', 'challengesPressedOn', 'enemiesDefeated', 'perfectRolls'
  ];
begin
  select character_name into v_name
  from public.party_members
  where party_id = p_party and user_id = p_user;
  v_name := coalesce(v_name, 'A friend');

  v_rec := public.compute_member_record(p_party, p_user);
  v_stats := v_rec -> 'stats';
  v_badges := v_rec -> 'badges';

  -- A. Badges earned (announced once each; whole-party badges deduplicated per party)
  for v_b in select jsonb_array_elements_text(v_badges) loop
    v_badge_key := case
      when v_b in ('whole-table', 'clean-night') then 'badge:party:' || v_b
      else 'badge:' || p_user || ':' || v_b
    end;
    if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_badge_key) then
      insert into public.party_moments (party_id, moment_key) values (p_party, v_badge_key) on conflict do nothing;
      v_b_title := case v_b
        when 'first-light' then 'First Light'
        when 'whole-week' then 'A Whole Week'
        when 'long-road' then 'The Long Road'
        when 'sharpened' then 'Sharpened'
        when 'open-hand' then 'Open Hand'
        when 'lifeline' then 'Lifeline'
        when 'whole-table' then 'The Whole Table'
        when 'clean-night' then 'A Clean Night'
        when 'perfect' then 'Perfect'
        when 'never-enough' then 'Never Enough'
        when 'many-hands' then 'Many Hands'
        when 'down-to-thread' then 'Down to a Thread'
        else v_b
      end;

      if v_b in ('whole-table', 'clean-night') then
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', 'The party earned the ' || v_b_title || ' badge.');
      else
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', v_name || ' earned the ' || v_b_title || ' badge.');
      end if;
    end if;
  end loop;

  -- B. New tier / level reached (Novice: 0-25, Apprentice: 26-50, Adept: 51-75, Master: 76-100)
  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = p_user;
  if v_attrs is not null then
    for v_attr, v_val in select key, value::int from jsonb_each_text(v_attrs) where value ~ '^[0-9]+$' loop
      if v_val >= 26 then
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Apprentice';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Apprentice.');
        end if;
      end if;

      if v_val >= 51 then
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Adept';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Adept.');
        end if;
      end if;

      if v_val >= 76 then
        -- Expert (the key keeps its old name so nobody is told twice)
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Champion';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Expert.');
        end if;
      end if;

      if v_val >= 101 then
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Master';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Master.');
        end if;
      end if;
    end loop;
  end if;

  -- C. Crown taken & Lost crown told privately
  foreach v_stat_key in array v_stat_keys loop
    v_my_val := coalesce((v_stats ->> v_stat_key)::int, 0);
    if v_my_val > 0 then
      v_stat_title := case v_stat_key
        when 'daysPlayed' then 'Days Played'
        when 'bestStreak' then 'Best Streak'
        when 'gatheringsAttended' then 'Gatherings Attended'
        when 'fragmentsSolved' then 'Fragments Solved'
        when 'relicsGiven' then 'Relics Given'
        when 'timesSteppedUp' then 'Times Stepped Up'
        when 'fragmentsMatched' then 'Fragments Matched'
        when 'battlesWon' then 'Battles Won'
        when 'challengesCleared' then 'Challenges Cleared'
        when 'challengesPressedOn' then 'Challenges Pressed On'
        when 'enemiesDefeated' then 'Enemies Defeated'
        when 'perfectRolls' then 'Perfect Rolls'
        else v_stat_key
      end;

      select leader_user_id, score into v_curr_leader, v_curr_score
      from public.party_crowns
      where party_id = p_party and stat_key = v_stat_key;

      if not found then
        insert into public.party_crowns (party_id, stat_key, leader_user_id, score)
        values (p_party, v_stat_key, p_user, v_my_val);
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', v_name || ' took the crown for ' || v_stat_title || '.');
      elsif v_my_val > v_curr_score and (v_curr_leader is null or v_curr_leader <> p_user) then
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', v_name || ' took the crown for ' || v_stat_title || '.');

        if v_curr_leader is not null and v_curr_leader <> p_user then
          v_diff := v_my_val - v_curr_score;
          v_diff_word := case when v_diff = 1 then 'one' else v_diff::text end;
          -- Only what can really raise this number (24 Oct; the same words as drawLevelLine in mythiosRulesData.ts).
          v_how := case v_stat_key
            when 'daysPlayed' then 'Play tomorrow to draw level.'
            when 'bestStreak' then 'Play tomorrow to draw level.'
            when 'challengesCleared' then 'Clear tomorrow''s Challenge to draw level.'
            when 'challengesPressedOn' then 'Press on the next time the road allows it, and you draw level.'
            when 'enemiesDefeated' then 'Win your next fight to draw level.'
            when 'fragmentsSolved' then 'Solve the next missing word first to draw level.'
            when 'relicsGiven' then 'Give a friend a Relic to draw level.'
            when 'gatheringsAttended' then 'The Gathering is the place to draw level.'
            when 'battlesWon' then 'The Gathering is the place to draw level.'
            when 'fragmentsMatched' then 'The Gathering is the place to draw level.'
            when 'timesSteppedUp' then 'The Gathering is the place to draw level.'
          end;
          if v_how is not null then
            v_nudge := v_name || ' leads ' || v_stat_title || ' by ' || v_diff_word || '. ' || v_how;
            insert into public.party_messages (party_id, author_id, reply_to_user, kind, body)
            values (p_party, null, v_curr_leader, 'nudge', v_nudge);
          end if;
        end if;

        update public.party_crowns
        set leader_user_id = p_user, score = v_my_val, updated_at = now()
        where party_id = p_party and stat_key = v_stat_key;
      elsif v_curr_leader = p_user and v_my_val > v_curr_score then
        update public.party_crowns
        set score = v_my_val, updated_at = now()
        where party_id = p_party and stat_key = v_stat_key;
      end if;
    end if;
  end loop;
end;
$function$;

CREATE OR REPLACE FUNCTION public.my_record(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_season_ended boolean := false;
  v_titles jsonb := '[]'::jsonb;
  v_my_title jsonb := null;

  v_stat_keys text[] := array[
    'daysPlayed', 'bestStreak', 'gatheringsAttended', 'fragmentsSolved',
    'relicsGiven', 'timesSteppedUp', 'fragmentsMatched', 'battlesWon',
    'challengesCleared', 'challengesPressedOn', 'enemiesDefeated', 'perfectRolls'
  ];
begin
  if v_user is null then raise exception 'not signed in'; end if;

  if not exists (
    select 1 from public.party_members
    where party_id = p_party and user_id = v_user and status = 'approved'
  ) then
    raise exception 'not in party';
  end if;

  v_my_rec := public.compute_member_record(p_party, v_user);
  v_my_stats := v_my_rec -> 'stats';
  v_my_badges := v_my_rec -> 'badges';

  update public.member_progress
  set stats = v_my_stats,
      badges = (select coalesce(array_agg(x::text), array[]::text[]) from jsonb_array_elements_text(v_my_badges) x)
  where party_id = p_party and user_id = v_user;

  perform public.check_member_big_moments(p_party, v_user);

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

  v_season_ended := exists (
    select 1 from public.gatherings g
    where g.party_id = p_party and g.week = 6 and g.ended_at is not null
  ) or exists (
    select 1 from public.member_days md
    where md.party_id = p_party and md.week = 6 and md.day >= 6 and md.finished_at is not null
  );

  v_titles := public.party_season_titles(p_party);
  select x into v_my_title
  from jsonb_array_elements(v_titles) x
  where (x ->> 'userId')::uuid = v_user
  limit 1;

  return jsonb_build_object(
    'stats', v_my_stats,
    'earnedBadgeIds', v_my_badges,
    'leads', v_leads,
    'leadsCount', v_leads_count,
    'seasonEnded', v_season_ended,
    'mySeasonTitle', v_my_title,
    'seasonTitles', v_titles
  );
end;
$function$;

revoke execute on function public.compute_member_record(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.check_member_big_moments(uuid, uuid) from public, anon, authenticated;
