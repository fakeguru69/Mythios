-- Migration 0103: Big moments in the chat and the chase
-- Piece D3: Big moments in the chat (natural 20, badge earned, crown taken, new level);
-- the lost crown told privately; the near-miss line; the first-time Record card.
-- 1. party_moments table for deduplicating big-moment notices (each big moment posted once).
-- 2. party_crowns table to track stat leaders and crown changes.
-- 3. party_messages supports 'nudge' kind, with visibility strictly restricted to recipient (reply_to_user).
-- 4. post_natural_20 RPC for Challenge, Press On, and combat strike natural 20s.
-- 5. check_member_big_moments RPC to announce badges, crowns taken, and attribute tier advancements.
-- 6. Private nudge to friend who lost a crown ("Mei leads Best Streak by one. Play tomorrow to draw level.").

-- 1. Deduplication table for big moments
create table if not exists public.party_moments (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  moment_key text not null,
  created_at timestamptz not null default now(),
  unique (party_id, moment_key)
);
create index if not exists party_moments_party_key on public.party_moments (party_id, moment_key);
alter table public.party_moments enable row level security;
revoke insert, update, delete, select on public.party_moments from anon, authenticated;

-- 2. Crown tracking table
create table if not exists public.party_crowns (
  party_id uuid not null references public.parties (id) on delete cascade,
  stat_key text not null,
  leader_user_id uuid references public.profiles (id) on delete set null,
  score int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (party_id, stat_key)
);
alter table public.party_crowns enable row level security;
revoke insert, update, delete, select on public.party_crowns from anon, authenticated;

-- 3. Check constraint on party_messages allowing 'nudge'
alter table public.party_messages drop constraint if exists party_messages_kind_check;
alter table public.party_messages add constraint party_messages_kind_check check (kind in ('chat', 'notice', 'nudge'));

-- 4. Visibility function: private nudge is visible ONLY to reply_to_user or author
create or replace function public.party_message_visible(
  p_party uuid,
  p_author uuid,
  p_reply_to uuid,
  p_created_at timestamptz,
  p_kind text default 'chat'
) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_week int;
  v_day int;
  v_check_day int;
  v_start timestamptz;
begin
  if v_me is null or not public.is_party_member(p_party) or not public.party_chat_open(p_party) then
    return false;
  end if;

  -- A private nudge is strictly visible ONLY to the recipient (reply_to_user) or author
  if p_kind = 'nudge' or (p_reply_to is not null and p_author is null and p_kind <> 'chat') then
    return (p_reply_to = v_me or p_author = v_me);
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  -- Before the season starts or on Day 7 (the Gathering), there is no weekday chapter to finish first.
  if v_week is null or v_day > 6 then
    return true;
  end if;

  v_check_day := case when public.is_late_day1(p_party, v_me) then 1 else v_day end;

  -- Once the friend has finished today's chapter, all public fire talk is open to them.
  if exists (
    select 1 from public.member_days md
    where md.party_id = p_party and md.user_id = v_me
      and md.week = v_week and md.day = v_check_day and md.finished_at is not null
  ) then
    return true;
  end if;

  v_start := public.party_day_start(p_party, v_week, v_day);
  if p_created_at < v_start then
    return true;
  end if;

  return (p_author = v_me or p_reply_to = v_me);
end;
$$;

drop policy if exists "messages: today's fire talk only after finishing today" on public.party_messages;
create policy "messages: today's fire talk only after finishing today" on public.party_messages
  as restrictive for select to authenticated
  using (public.party_message_visible(party_id, author_id, reply_to_user, created_at, kind));

-- 5. Read function for party chat messages, strictly filtering private nudges
create or replace function public.party_chat_messages(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_week int;
  v_day int;
  v_check_day int;
  v_start timestamptz;
  v_can_see_today boolean := false;
begin
  if v_me is null or not public.is_party_member(p_party) or not public.party_chat_open(p_party) then
    return '[]'::jsonb;
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or v_day > 6 then
    v_can_see_today := true;
  else
    v_check_day := case when public.is_late_day1(p_party, v_me) then 1 else v_day end;
    v_can_see_today := exists (
      select 1 from public.member_days md
      where md.party_id = p_party and md.user_id = v_me
        and md.week = v_week and md.day = v_check_day and md.finished_at is not null
    );
    v_start := public.party_day_start(p_party, v_week, v_day);
  end if;

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', x.id,
          'party_id', x.party_id,
          'author_id', x.author_id,
          'kind', x.kind,
          'speaker', x.speaker,
          'body', x.body,
          'created_at', x.created_at,
          'at_fire', x.at_fire,
          'reply_to_user', x.reply_to_user
        )
        order by x.created_at desc, x.id desc
      ),
      '[]'::jsonb
    )
    from (
      select m.id, m.party_id, m.author_id, m.kind, m.speaker, m.body, m.created_at, m.at_fire, m.reply_to_user
      from public.party_messages m
      where m.party_id = p_party
        and (
          case
            when m.kind = 'nudge' or (m.reply_to_user is not null and m.speaker is null and m.author_id is null) then
              (m.reply_to_user = v_me or m.author_id = v_me)
            else
              (
                v_can_see_today
                or m.created_at < v_start
                or m.author_id = v_me
                or m.reply_to_user = v_me
              )
          end
        )
      order by m.created_at desc, m.id desc
      limit 200
    ) x
  );
end;
$$;

revoke execute on function public.party_message_visible(uuid, uuid, uuid, timestamptz, text) from public, anon;
grant execute on function public.party_message_visible(uuid, uuid, uuid, timestamptz, text) to authenticated;
revoke execute on function public.party_chat_messages(uuid) from public, anon;
grant execute on function public.party_chat_messages(uuid) to authenticated;

-- 6. Natural 20 announcer
create or replace function public.post_natural_20(
  p_party uuid,
  p_user uuid,
  p_key text
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_name text;
  v_full_key text := 'nat20:' || p_user || ':' || p_key;
begin
  if exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_full_key) then
    return;
  end if;

  select character_name into v_name from public.party_members where party_id = p_party and user_id = p_user;
  v_name := coalesce(v_name, 'A friend');

  insert into public.party_moments (party_id, moment_key) values (p_party, v_full_key) on conflict do nothing;
  insert into public.party_messages (party_id, kind, body)
  values (p_party, 'notice', v_name || ' rolled a natural 20!');
end;
$$;

revoke execute on function public.post_natural_20(uuid, uuid, text) from public, anon;
grant execute on function public.post_natural_20(uuid, uuid, text) to authenticated;

-- 7. Function to evaluate and announce big moments (badges, tier level-ups, crowns taken)
create or replace function public.check_member_big_moments(
  p_party uuid,
  p_user uuid
) returns void
language plpgsql security definer set search_path = '' as $$
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
  v_tier_name text;
  v_tier_key text;
  v_stat_key text;
  v_stat_title text;
  v_my_val int;
  v_curr_leader uuid;
  v_curr_score int;
  v_diff int;
  v_diff_word text;
  v_nudge text;

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

  -- A. Badges earned (announced once each)
  for v_b in select jsonb_array_elements_text(v_badges) loop
    v_badge_key := 'badge:' || p_user || ':' || v_b;
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
      -- Check Apprentice (>= 26)
      if v_val >= 26 then
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Apprentice';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Apprentice.');
        end if;
      end if;

      -- Check Adept (>= 51)
      if v_val >= 51 then
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Adept';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Adept.');
        end if;
      end if;

      -- Check Master (>= 76)
      if v_val >= 76 then
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
        -- Initial crown holder
        insert into public.party_crowns (party_id, stat_key, leader_user_id, score)
        values (p_party, v_stat_key, p_user, v_my_val);
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', v_name || ' took the crown for ' || v_stat_title || '.');
      elsif v_my_val > v_curr_score and (v_curr_leader is null or v_curr_leader <> p_user) then
        -- Surpassed previous leader! Crown taken!
        insert into public.party_messages (party_id, kind, body)
        values (p_party, 'notice', v_name || ' took the crown for ' || v_stat_title || '.');

        -- The friend who lost the crown gets a private nudge only
        if v_curr_leader is not null and v_curr_leader <> p_user then
          v_diff := v_my_val - v_curr_score;
          v_diff_word := case when v_diff = 1 then 'one' else v_diff::text end;
          v_nudge := v_name || ' leads ' || v_stat_title || ' by ' || v_diff_word || '. Play tomorrow to draw level.';
          insert into public.party_messages (party_id, author_id, reply_to_user, kind, body)
          values (p_party, null, v_curr_leader, 'nudge', v_nudge);
        end if;

        update public.party_crowns
        set leader_user_id = p_user, score = v_my_val, updated_at = now()
        where party_id = p_party and stat_key = v_stat_key;
      elsif v_curr_leader = p_user and v_my_val > v_curr_score then
        -- User extends their own existing lead
        update public.party_crowns
        set score = v_my_val, updated_at = now()
        where party_id = p_party and stat_key = v_stat_key;
      end if;
    end if;
  end loop;
end;
$$;

revoke execute on function public.check_member_big_moments(uuid, uuid) from public, anon;
grant execute on function public.check_member_big_moments(uuid, uuid) to authenticated;

-- 8. Hook check_member_big_moments into my_record
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

  -- 2. Process big moments (badges earned, new tier reached, crowns taken, lost crown nudge)
  perform public.check_member_big_moments(p_party, v_user);

  -- 3. Compare against approved party members to compute crowns and leads
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

-- 9. Natural 20 hooks in roll_challenge, roll_press, fight_round
create or replace function public.roll_challenge(p_party uuid, p_attr text) returns jsonb
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
  v_dc := (v_meta ->> 'dc')::int;
  select (attrs ->> p_attr)::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_bonus := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_net := v_d20 + v_bonus - v_dc;
  v_pass := v_net >= 1;
  if v_pass then
    if 1 + v_bonus - v_dc < 1 and 20 + v_bonus - v_dc >= 1 then
      select count(*) + 1 into v_played from public.member_days
      where party_id = p_party and user_id = auth.uid() and week = v_week and finished_at is not null;
      v_base := (array[12, 9, 7, 5, 4, 3, 3])[least(7, greatest(1, v_played))];
      v_growth := greatest(1, round(v_base * public.tier_rate(v_score))::int);
    end if;
    update public.member_progress
    set attrs = jsonb_set(attrs, array[p_attr], to_jsonb(least(100, v_score + v_growth)))
    where party_id = p_party and user_id = auth.uid();
  end if;
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  -- Natural 20 announcement
  if v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'challenge:' || v_week || ':' || v_day);
  end if;

  return v_result;
end;
$$;

create or replace function public.roll_press(p_party uuid, p_leave boolean default false) returns jsonb
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
    -- Natural 20 announcement
    if v_d20 = 20 then
      perform public.post_natural_20(p_party, auth.uid(), 'press:' || v_week || ':' || v_day);
    end if;
  end if;
  update public.member_days set press = v_result where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;

create or replace function public.fight_round(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_week int; v_day int; v_step jsonb; v_rule jsonb; v_row public.member_days%rowtype;
  v_enemy_first boolean; v_meta jsonb; v_def int; v_atk int; v_weapon int; v_armor int;
  v_rounds jsonb; v_php int; v_ehp int; v_d20 int; v_ed20 int; v_margin int; v_emargin int;
  v_hit boolean; v_ehit boolean; v_pstruck boolean := false; v_estruck boolean := false;
  v_round jsonb; v_done boolean; v_won boolean; v_fight jsonb; v_gold int := 0;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_row.fight is not null and coalesce((v_row.fight ->> 'done')::boolean, false) then
    raise exception 'fight is already finished';
  end if;
  v_step := public.today_step(p_party, v_week, v_day, 'fight');
  if v_step is null then raise exception 'not today'; end if;
  v_rule := v_step -> 'enemyStrikesFirst';
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
  v_rounds := coalesce(v_row.fight -> 'rounds', '[]'::jsonb);
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
  v_done := v_php <= 0 or v_ehp <= 0;
  v_won := v_ehp <= 0 and v_php > 0;
  if v_done and v_won then
    v_gold := (v_meta ->> 'fightReward')::int;
    if v_gold > 0 then
      update public.member_progress set gold = gold + v_gold where party_id = p_party and user_id = auth.uid();
    end if;
  end if;
  v_round := jsonb_build_object(
    'playerD20', v_d20, 'playerWeapon', v_weapon, 'enemyDef', v_def, 'playerMargin', v_margin, 'playerHit', v_hit, 'playerStruck', v_pstruck,
    'enemyD20', v_ed20, 'enemyAtk', v_atk, 'playerArmor', v_armor, 'enemyMargin', v_emargin, 'enemyHit', v_ehit, 'enemyStruck', v_estruck,
    'playerHpAfter', v_php, 'enemyHpAfter', v_ehp
  );
  v_rounds := v_rounds || jsonb_build_array(v_round);
  v_fight := jsonb_build_object('rounds', v_rounds, 'done', v_done, 'won', v_won, 'gold', v_gold);
  update public.member_days set fight = v_fight where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  -- Natural 20 announcement on player combat strike
  if v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'fight:' || v_week || ':' || v_day || ':' || jsonb_array_length(v_rounds));
  end if;

  return v_fight;
end;
$$;

revoke execute on function public.roll_challenge(uuid, text) from public, anon;
grant execute on function public.roll_challenge(uuid, text) to authenticated;
revoke execute on function public.roll_press(uuid, boolean) from public, anon;
grant execute on function public.roll_press(uuid, boolean) to authenticated;
revoke execute on function public.fight_round(uuid) from public, anon;
grant execute on function public.fight_round(uuid) to authenticated;
