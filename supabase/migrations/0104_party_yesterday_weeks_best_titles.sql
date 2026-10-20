-- Migration 0104: "The Party, Yesterday", the Week's Best at the Gathering lobby, Season Titles (Piece D4)
-- 1. Activity sequence & seen-tracking so "The Party, Yesterday" never repeats what the friend already saw in the party chat.
-- 2. party_yesterday(p_party): up to five good-news lines after the recap each morning, best first (badge, Perfect Roll, Relic given, crown/tier, who played/pressed on), none if nothing happened.
-- 3. gathering_weeks_best(p_party, p_week): one true achievement for every friend present in the Gathering waiting room before Beat 1 (nobody ranked last; if two friends share a top stat, the second gets their next best).
-- 4. party_season_titles(p_party): end-of-season honours (The Steady Feet, The Unbroken, The Faithful, The Reader, The Open Hand, First Forward, The Keen Eye, The Wall, The Sure Hand, The Bold, The Hunter, The Lucky One).
-- 5. Hook big-moment checks into roll_card, roll_press_card, fight_round, finish_day, and give_relic.

-- 1. Monotonic activity sequence & seen columns
create sequence if not exists public.party_activity_seq;

alter table public.member_progress
  add column if not exists chat_seen_msg_id bigint not null default 0,
  add column if not exists chat_seen_seq bigint not null default 0;

alter table public.member_days
  add column if not exists seen_msg_id_at_open bigint,
  add column if not exists seen_seq_at_open bigint,
  add column if not exists finish_seq bigint,
  add column if not exists press_seq bigint;

alter table public.relic_gifts
  add column if not exists gift_seq bigint not null default nextval('public.party_activity_seq'),
  add column if not exists event_week int,
  add column if not exists event_day int;

alter table public.party_messages
  add column if not exists event_week int,
  add column if not exists event_day int;

create or replace function public.trg_member_days_activity_seq() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.finished_at is not null and (tg_op = 'INSERT' or old.finished_at is null) then
    new.finish_seq := coalesce(new.finish_seq, nextval('public.party_activity_seq'));
  end if;
  if new.press is not null and not coalesce((new.press ->> 'left')::boolean, false)
     and (tg_op = 'INSERT' or old.press is null or coalesce((old.press ->> 'left')::boolean, false)) then
    new.press_seq := coalesce(new.press_seq, nextval('public.party_activity_seq'));
  end if;
  return new;
end;
$$;

drop trigger if exists member_days_activity_seq_trg on public.member_days;
create trigger member_days_activity_seq_trg
  before insert or update on public.member_days
  for each row execute function public.trg_member_days_activity_seq();

create or replace function public.trg_relic_gifts_activity_seq() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_w int;
  v_d int;
begin
  new.gift_seq := nextval('public.party_activity_seq');
  if new.event_week is null or new.event_day is null then
    select t.week, t.day into v_w, v_d from public.party_today(new.party_id) t;
    new.event_week := coalesce(new.event_week, v_w);
    new.event_day := coalesce(new.event_day, v_d);
  end if;
  return new;
end;
$$;

drop trigger if exists relic_gifts_activity_seq_trg on public.relic_gifts;
create trigger relic_gifts_activity_seq_trg
  before insert on public.relic_gifts
  for each row execute function public.trg_relic_gifts_activity_seq();

create or replace function public.trg_party_messages_event_day() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_w int;
  v_d int;
begin
  if new.event_week is null or new.event_day is null then
    select t.week, t.day into v_w, v_d from public.party_today(new.party_id) t;
    new.event_week := coalesce(new.event_week, v_w);
    new.event_day := coalesce(new.event_day, v_d);
  end if;
  return new;
end;
$$;

drop trigger if exists party_messages_event_day_trg on public.party_messages;
create trigger party_messages_event_day_trg
  before insert on public.party_messages
  for each row execute function public.trg_party_messages_event_day();

revoke execute on function public.trg_member_days_activity_seq() from public, anon, authenticated;
revoke execute on function public.trg_relic_gifts_activity_seq() from public, anon, authenticated;
revoke execute on function public.trg_party_messages_event_day() from public, anon, authenticated;

-- 2. Lock the caller's seen snapshot for today's chapter before updating chat_seen_msg_id
create or replace function public.lock_today_seen_snapshot(p_party uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_check_day int;
  v_seen_id bigint := 0;
  v_seen_seq bigint := 0;
begin
  if p_user is null or not public.is_party_member(p_party) then
    return;
  end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or v_day > 6 then
    return;
  end if;
  v_check_day := case when public.is_late_day1(p_party, p_user) then 1 else v_day end;
  perform public.ensure_progress(p_party, p_user);
  select coalesce(chat_seen_msg_id, 0), coalesce(chat_seen_seq, 0)
    into v_seen_id, v_seen_seq
    from public.member_progress
   where party_id = p_party and user_id = p_user;

  insert into public.member_days (party_id, user_id, week, day, seen_msg_id_at_open, seen_seq_at_open)
  values (p_party, p_user, v_week, v_check_day, v_seen_id, v_seen_seq)
  on conflict (party_id, user_id, week, day) do update
    set seen_msg_id_at_open = coalesce(public.member_days.seen_msg_id_at_open, excluded.seen_msg_id_at_open),
        seen_seq_at_open = coalesce(public.member_days.seen_seq_at_open, excluded.seen_seq_at_open);
end;
$$;

revoke execute on function public.lock_today_seen_snapshot(uuid, uuid) from public, anon, authenticated;

-- 3. Update party_chat_messages to record what the caller has seen in the party chat
create or replace function public.party_chat_messages(p_party uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_week int;
  v_day int;
  v_check_day int;
  v_start timestamptz;
  v_can_see_today boolean := false;
  v_res jsonb;
  v_max_id bigint;
  v_curr_seq bigint;
begin
  if v_me is null or not public.is_party_member(p_party) or not public.party_chat_open(p_party) then
    return '[]'::jsonb;
  end if;

  -- Lock today's morning snapshot first so opening the app in the morning preserves "The Party, Yesterday"
  perform public.lock_today_seen_snapshot(p_party, v_me);

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
  ),
  max(x.id)
  into v_res, v_max_id
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
  ) x;

  if v_max_id is not null then
    update public.member_progress
       set chat_seen_msg_id = greatest(chat_seen_msg_id, v_max_id)
     where party_id = p_party and user_id = v_me;
  end if;

  if v_can_see_today then
    select case when is_called then last_value else 0 end into v_curr_seq from public.party_activity_seq;
    update public.member_progress
       set chat_seen_seq = greatest(chat_seen_seq, coalesce(v_curr_seq, 0))
     where party_id = p_party and user_id = v_me;
  end if;

  return v_res;
end;
$$;

revoke execute on function public.party_chat_messages(uuid) from public, anon;
grant execute on function public.party_chat_messages(uuid) to authenticated;

-- 4. "The Party, Yesterday": one card after the recap each morning, good news only, up to five lines,
-- best first (badge, Perfect Roll, Relic given, crown/tier, then who played/pressed on), never repeating what the friend already saw.
create or replace function public.party_yesterday(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_my_name text;
  v_week int;
  v_day int;
  v_today_idx int;
  v_prev_idx int;
  v_prev_week int;
  v_prev_day int;
  v_seen_msg_id bigint := 0;
  v_seen_seq bigint := 0;
  v_day_start timestamptz;
  v_lines text[] := array[]::text[];
  v_line text;
  v_party_size int := 0;
  v_played_yesterday int := 0;
  v_unseen_friends uuid[];
begin
  if v_me is null or not public.is_party_member(p_party) then
    raise exception 'not in this party';
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or (v_week = 1 and v_day = 1) or public.is_late_day1(p_party, v_me) then
    return '[]'::jsonb;
  end if;

  v_today_idx := (v_week - 1) * 7 + (v_day - 1);
  if v_today_idx <= 0 then
    return '[]'::jsonb;
  end if;
  v_prev_idx := v_today_idx - 1;
  v_prev_week := (v_prev_idx / 7) + 1;
  v_prev_day := (v_prev_idx % 7) + 1;

  select character_name into v_my_name
  from public.party_members
  where party_id = p_party and user_id = v_me;
  v_my_name := coalesce(v_my_name, '');

  select coalesce(md.seen_msg_id_at_open, mp.chat_seen_msg_id, 0),
         coalesce(md.seen_seq_at_open, mp.chat_seen_seq, 0)
    into v_seen_msg_id, v_seen_seq
    from public.member_progress mp
    left join public.member_days md
      on md.party_id = mp.party_id and md.user_id = mp.user_id and md.week = v_week and md.day = v_day
   where mp.party_id = p_party and mp.user_id = v_me;

  v_Seen_msg_id := coalesce(v_seen_msg_id, 0);
  v_seen_seq := coalesce(v_seen_seq, 0);
  v_day_start := public.party_day_start(p_party, v_week, v_day);

  -- Priority 1: Badges earned by friends (or whole party) yesterday, not yet seen in chat
  for v_line in
    select m.body
    from public.party_messages m
    where m.party_id = p_party
      and m.kind = 'notice'
      and m.id > v_seen_msg_id
      and coalesce(m.event_week, v_prev_week) = v_prev_week
      and coalesce(m.event_day, v_prev_day) = v_prev_day
      and (m.body like '% earned the % badge.' or m.body like 'The party earned the % badge.' or m.body like 'BADGE:%')
      and (v_my_name = '' or not (m.body like v_my_name || ' earned %'))
    order by m.id asc
  loop
    if not (v_line = any(v_lines)) and coalesce(array_length(v_lines, 1), 0) < 5 then
      v_lines := array_append(v_lines, v_line);
    end if;
  end loop;

  -- Priority 2: Perfect Rolls (natural 20s) by friends yesterday, not yet seen in chat
  for v_line in
    select m.body
    from public.party_messages m
    where m.party_id = p_party
      and m.kind = 'notice'
      and m.id > v_seen_msg_id
      and coalesce(m.event_week, v_prev_week) = v_prev_week
      and coalesce(m.event_day, v_prev_day) = v_prev_day
      and (m.body like '% rolled a natural 20!' or m.body like '% PERFECT ROLL%')
      and (v_my_name = '' or not (m.body like v_my_name || ' rolled %'))
    order by m.id asc
  loop
    if not (v_line = any(v_lines)) and coalesce(array_length(v_lines, 1), 0) < 5 then
      v_lines := array_append(v_lines, v_line);
    end if;
  end loop;

  -- Priority 3: Relics given by friends yesterday since caller last looked
  for v_line in
    select coalesce(pm_from.character_name, 'A friend') || ' gave ' ||
           coalesce(pm_to.character_name, 'a friend') || ' a ' || rg.relic || ' Relic.'
    from public.relic_gifts rg
    join public.party_members pm_from on pm_from.party_id = rg.party_id and pm_from.user_id = rg.from_user
    join public.party_members pm_to on pm_to.party_id = rg.party_id and pm_to.user_id = rg.to_user
    where rg.party_id = p_party
      and rg.from_user <> v_me
      and rg.gift_seq > v_seen_seq
      and coalesce(rg.event_week, v_prev_week) = v_prev_week
      and coalesce(rg.event_day, v_prev_day) = v_prev_day
    order by rg.gift_seq asc
  loop
    if not (v_line = any(v_lines)) and coalesce(array_length(v_lines, 1), 0) < 5 then
      v_lines := array_append(v_lines, v_line);
    end if;
  end loop;

  -- Priority 4: Crown changing hands or new Attribute tier reached by friends yesterday, not yet seen in chat
  for v_line in
    select m.body
    from public.party_messages m
    where m.party_id = p_party
      and m.kind = 'notice'
      and m.id > v_seen_msg_id
      and coalesce(m.event_week, v_prev_week) = v_prev_week
      and coalesce(m.event_day, v_prev_day) = v_prev_day
      and (m.body like '% took the crown for %.' or m.body like '%''s % reached %.')
      and (v_my_name = '' or not (m.body like v_my_name || ' took the crown%' or m.body like v_my_name || '''s %'))
    order by m.id asc
  loop
    if not (v_line = any(v_lines)) and coalesce(array_length(v_lines, 1), 0) < 5 then
      v_lines := array_append(v_lines, v_line);
    end if;
  end loop;

  -- Priority 5a: Friends who pressed on yesterday since caller last looked
  for v_line in
    select coalesce(pm.character_name, 'A friend') || ' pressed on.'
    from public.member_days md
    join public.party_members pm on pm.party_id = md.party_id and pm.user_id = md.user_id
    where md.party_id = p_party
      and md.user_id <> v_me
      and md.week = v_prev_week
      and md.day = v_prev_day
      and ((md.week - 1) * 7 + (md.day - 1)) < v_today_idx
      and md.press is not null
      and not coalesce((md.press ->> 'left')::boolean, false)
      and coalesce(md.press_seq, 1) > v_seen_seq
    order by md.week asc, md.day asc, pm.joined_at asc
  loop
    if not (v_line = any(v_lines)) and coalesce(array_length(v_lines, 1), 0) < 5 then
      v_lines := array_append(v_lines, v_line);
    end if;
  end loop;

  -- Priority 5b: Who played yesterday (good news only; never names who missed)
  if coalesce(array_length(v_lines, 1), 0) < 5 then
    select array_agg(md.user_id order by pm.joined_at, pm.user_id)
      into v_unseen_friends
      from public.member_days md
      join public.party_members pm on pm.party_id = md.party_id and pm.user_id = md.user_id
     where md.party_id = p_party
       and pm.status = 'approved'
       and md.user_id <> v_me
       and md.week = v_prev_week
       and md.day = v_prev_day
       and md.finished_at is not null
       and coalesce(md.finish_seq, 1) > v_seen_seq;

    if coalesce(array_length(v_unseen_friends, 1), 0) > 0 then
      select count(*) into v_party_size
      from public.party_members
      where party_id = p_party and status = 'approved';

      select count(*) into v_played_yesterday
      from public.member_days md
      join public.party_members pm on pm.party_id = md.party_id and pm.user_id = md.user_id
      where md.party_id = p_party
        and pm.status = 'approved'
        and md.week = v_prev_week
        and md.day = v_prev_day
        and md.finished_at is not null;

      if v_party_size >= 3 and v_played_yesterday = v_party_size - 1 then
        v_line := initcap(public.g_word(v_played_yesterday)) || ' of ' || public.g_word(v_party_size) || ' played. One more makes a Whole Table.';
      else
        v_line := public.g_names(p_party, v_unseen_friends) || ' played yesterday.';
      end if;

      if not (v_line = any(v_lines)) then
        v_lines := array_append(v_lines, v_line);
      end if;
    end if;
  end if;

  return coalesce(to_jsonb(v_lines), '[]'::jsonb);
end;
$$;

revoke execute on function public.party_yesterday(uuid) from public, anon;
grant execute on function public.party_yesterday(uuid) to authenticated;

-- 5. "The Week's Best": one true achievement for every friend present at the Gathering lobby before Beat 1
create or replace function public.gathering_weeks_best(p_party uuid, p_week int default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_week int;
  v_present uuid[];
  v_all uuid[];
  v_u uuid;
  v_name text;
  v_used_cats text[] := array[]::text[];
  v_perfect int;
  v_pressed int;
  v_relics int;
  v_words int;
  v_enemies int;
  v_cleared int;
  v_days int;
  v_best_cat text;
  v_best_line text;
  v_items jsonb := '[]'::jsonb;
  v_sentences text[] := array[]::text[];
begin
  if auth.uid() is null or not public.is_party_member(p_party) then
    raise exception 'not in this party';
  end if;

  v_week := coalesce(p_week, public.g_week(p_party), (select t.week from public.party_today(p_party) t), 1);
  v_all := public.g_party_order(p_party);
  v_present := public.g_here(p_party, v_week);

  -- If nobody is in gathering_present yet, include all approved party members in party order
  if coalesce(array_length(v_present, 1), 0) = 0 then
    v_present := v_all;
  end if;

  foreach v_u in array v_present loop
    select character_name into v_name
    from public.party_members
    where party_id = p_party and user_id = v_u;
    v_name := coalesce(v_name, 'A friend');

    -- 1. Perfect Rolls this week
    select coalesce((
      select count(*) from public.member_days md
      where md.party_id = p_party and md.user_id = v_u and md.week = v_week
        and coalesce((md.challenge ->> 'd20')::int, 0) = 20
    ), 0) + coalesce((
      select count(*) from public.member_days md
      where md.party_id = p_party and md.user_id = v_u and md.week = v_week
        and coalesce((md.press ->> 'd20')::int, 0) = 20
    ), 0) + coalesce((
      select count(*)
      from public.member_days md,
      lateral jsonb_array_elements(
        case when jsonb_typeof(md.fight -> 'rounds') = 'array' then md.fight -> 'rounds' else '[]'::jsonb end
      ) r
      where md.party_id = p_party and md.user_id = v_u and md.week = v_week
        and coalesce((r ->> 'd20')::int, (r ->> 'playerD20')::int, 0) = 20
    ), 0)
    into v_perfect;

    -- 2. Challenges Pressed On this week
    select count(*) into v_pressed
    from public.member_days md
    where md.party_id = p_party and md.user_id = v_u and md.week = v_week
      and md.press is not null
      and not coalesce((md.press ->> 'left')::boolean, false);

    -- 3. Relics Given
    select count(*) into v_relics
    from public.relic_gifts rg
    where rg.party_id = p_party and rg.from_user = v_u;

    -- 4. Fragments Solved this week
    select count(distinct fw.fragment_id) into v_words
    from public.fragment_words fw
    join public.fragments f on f.id = fw.fragment_id
    where fw.party_id = p_party and fw.solved_by = v_u and f.week = v_week;

    -- 5. Enemies Defeated this week
    select count(*) into v_enemies
    from public.member_days md
    where md.party_id = p_party and md.user_id = v_u and md.week = v_week
      and coalesce((md.fight ->> 'won')::boolean, false) = true;

    -- 6. Challenges Cleared this week
    select count(*) into v_cleared
    from public.member_days md
    where md.party_id = p_party and md.user_id = v_u and md.week = v_week
      and coalesce((md.challenge ->> 'pass')::boolean, false) = true;

    -- 7. Days Played this week
    select count(*) into v_days
    from public.member_days md
    where md.party_id = p_party and md.user_id = v_u and md.week = v_week
      and md.day between 1 and 6 and md.finished_at is not null;

    -- Pick the highest-scoring true achievement for this friend, preferring a category not yet used by an earlier friend
    select c.cat, c.line
      into v_best_cat, v_best_line
      from (
        values
          ('perfectRolls', v_perfect, v_perfect * 20,
           v_name || ' rolled ' || (case when v_perfect = 1 then 'a natural 20' else public.g_word(v_perfect) || ' natural 20s' end) || '.'),
          ('relicsGiven', v_relics, v_relics * 15,
           v_name || ' gave ' || (case when v_relics = 1 then 'a Relic' else public.g_word(v_relics) || ' Relics' end) || '.'),
          ('challengesPressedOn', v_pressed, v_pressed * 12,
           v_name || ' pressed on ' || (case when v_pressed = 1 then 'once' when v_pressed = 2 then 'twice' else public.g_word(v_pressed) || ' times' end) || '.'),
          ('fragmentsSolved', v_words, v_words * 10,
           v_name || ' solved ' || (case when v_words = 1 then 'a fragment' else public.g_word(v_words) || ' fragments' end) || '.'),
          ('enemiesDefeated', v_enemies, v_enemies * 9,
           v_name || ' defeated ' || (case when v_enemies = 1 then 'an enemy' else public.g_word(v_enemies) || ' enemies' end) || '.'),
          ('challengesCleared', v_cleared, v_cleared * 8,
           case when v_cleared >= 4 then v_name || ' cleared every Challenge.'
                else v_name || ' cleared ' || (case when v_cleared = 1 then 'a Challenge' else public.g_word(v_cleared) || ' Challenges' end) || '.' end),
          ('daysPlayed', v_days, v_days * 5,
           case when v_days >= 6 then v_name || ' walked every day of the week.'
                else v_name || ' walked ' || (case when v_days = 1 then 'a day' else public.g_word(v_days) || ' days' end) || ' of the road.' end)
      ) as c(cat, cnt, score, line)
     where c.cnt > 0
     order by (not (c.cat = any(v_used_cats))) desc, c.score desc
     limit 1;

    if v_best_cat is null then
      v_best_cat := 'gatheringPresent';
      v_best_line := v_name || ' answered the call to the Gathering.';
    else
      v_used_cats := array_append(v_used_cats, v_best_cat);
    end if;

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'userId', v_u,
      'name', v_name,
      'category', v_best_cat,
      'line', v_best_line
    ));
    v_sentences := array_append(v_sentences, v_best_line);
  end loop;

  return jsonb_build_object(
    'week', v_week,
    'lines', v_items,
    'summary', case when coalesce(array_length(v_sentences, 1), 0) > 0
                    then 'This week: ' || array_to_string(v_sentences, ' ')
                    else null end
  );
end;
$$;

revoke execute on function public.gathering_weeks_best(uuid, int) from public, anon;
grant execute on function public.gathering_weeks_best(uuid, int) to authenticated;

-- 6. Season Titles: permanent end-of-season honours for each friend in the party
create or replace function public.party_season_titles(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_member record;
  v_scores jsonb := '[]'::jsonb;
  v_assigned_users uuid[] := array[]::uuid[];
  v_assigned_stats text[] := array[]::text[];
  v_user_stat jsonb := '{}'::jsonb;
  v_cand record;
  v_fallback_stat text;
  v_out jsonb := '[]'::jsonb;
  v_s_key text;
  v_s_title text;
  v_s_label text;
  v_s_val int;
begin
  if auth.uid() is null or not public.is_party_member(p_party) then
    raise exception 'not in this party';
  end if;

  -- Compute all member stats once into an in-memory JSONB array (no temp tables, 100% STABLE)
  with member_records as (
    select pm.user_id,
           row_number() over (order by pm.joined_at, pm.user_id)::int as ord,
           coalesce(pm.character_name, 'A friend') as name,
           coalesce(pm.class, 'Warrior') as class,
           coalesce(public.compute_member_record(p_party, pm.user_id) -> 'stats', '{}'::jsonb) as stats
    from public.party_members pm
    where pm.party_id = p_party and pm.status = 'approved'
  ),
  score_rows as (
    select mr.user_id, mr.ord, mr.name, mr.class,
           s.stat_key, s.stat_order, s.stat_label, s.title,
           coalesce((mr.stats ->> s.stat_key)::int, 0) as val,
           s.weight
    from member_records mr
    cross join (
      values
        ('daysPlayed', 1, 'Days Played', 'The Steady Feet', 10),
        ('bestStreak', 2, 'Best Streak', 'The Unbroken', 20),
        ('gatheringsAttended', 3, 'Gatherings Attended', 'The Faithful', 60),
        ('fragmentsSolved', 4, 'Fragments Solved', 'The Reader', 40),
        ('relicsGiven', 5, 'Relics Given', 'The Open Hand', 100),
        ('timesSteppedUp', 6, 'Times Stepped Up', 'First Forward', 80),
        ('fragmentsMatched', 7, 'Fragments Matched', 'The Keen Eye', 85),
        ('battlesWon', 8, 'Battles Won', 'The Wall', 70),
        ('challengesCleared', 9, 'Challenges Cleared', 'The Sure Hand', 30),
        ('challengesPressedOn', 10, 'Challenges Pressed On', 'The Bold', 65),
        ('enemiesDefeated', 11, 'Enemies Defeated', 'The Hunter', 50),
        ('perfectRolls', 12, 'Perfect Rolls', 'The Lucky One', 120)
    ) as s(stat_key, stat_order, stat_label, title, weight)
  )
  select coalesce(jsonb_agg(to_jsonb(score_rows)), '[]'::jsonb)
  into v_scores
  from score_rows;

  -- Greedily assign unique Season Titles to each friend based on crown leadership and weighted specialization
  for v_cand in
    with parsed as (
      select * from jsonb_to_recordset(v_scores) as x(
        user_id uuid, ord int, name text, class text,
        stat_key text, stat_order int, stat_label text, title text, val int, weight int
      )
    ),
    stat_max as (
      select p.stat_key, max(p.val) as max_val,
             count(*) filter (where p.val = (select max(p2.val) from parsed p2 where p2.stat_key = p.stat_key)) as leaders_cnt
      from parsed p
      group by p.stat_key
    )
    select t.user_id, t.stat_key, t.title, t.stat_label, t.val,
           (case when t.val > 0 and t.val = sm.max_val and sm.leaders_cnt = 1 then 10000
                 when t.val > 0 and t.val = sm.max_val then 5000
                 else 0 end) + (t.val * t.weight) as priority_score
    from parsed t
    join stat_max sm on sm.stat_key = t.stat_key
    where t.val > 0
    order by priority_score desc, t.weight desc, t.ord asc, t.stat_order asc
  loop
    if not (v_cand.user_id = any(v_assigned_users)) and not (v_cand.stat_key = any(v_assigned_stats)) then
      v_assigned_users := array_append(v_assigned_users, v_cand.user_id);
      v_assigned_stats := array_append(v_assigned_stats, v_cand.stat_key);
      v_user_stat := jsonb_set(v_user_stat, array[v_cand.user_id::text], to_jsonb(v_cand.stat_key));
    end if;
  end loop;

  -- Fallback for any member who still needs a distinct Season Title
  for v_member in
    select distinct x.user_id, x.ord
    from jsonb_to_recordset(v_scores) as x(user_id uuid, ord int)
    order by x.ord asc
  loop
    if not (v_member.user_id = any(v_assigned_users)) then
      select x.stat_key into v_fallback_stat
      from jsonb_to_recordset(v_scores) as x(user_id uuid, stat_key text, stat_order int)
      where x.user_id = v_member.user_id and not (x.stat_key = any(v_assigned_stats))
      order by x.stat_order asc
      limit 1;

      v_assigned_users := array_append(v_assigned_users, v_member.user_id);
      v_assigned_stats := array_append(v_assigned_stats, v_fallback_stat);
      v_user_stat := jsonb_set(v_user_stat, array[v_member.user_id::text], to_jsonb(v_fallback_stat));
    end if;
  end loop;

  -- Build output in party order
  for v_member in
    select distinct x.user_id, x.ord, x.name, x.class
    from jsonb_to_recordset(v_scores) as x(user_id uuid, ord int, name text, class text)
    order by x.ord asc
  loop
    v_s_key := v_user_stat ->> (v_member.user_id::text);
    select x.title, x.stat_label, x.val into v_s_title, v_s_label, v_s_val
    from jsonb_to_recordset(v_scores) as x(user_id uuid, stat_key text, title text, stat_label text, val int)
    where x.user_id = v_member.user_id and x.stat_key = v_s_key;

    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'userId', v_member.user_id,
      'name', v_member.name,
      'class', v_member.class,
      'statKey', v_s_key,
      'statLabel', v_s_label,
      'val', v_s_val,
      'title', v_s_title
    ));
  end loop;

  return v_out;
end;
$$;

revoke execute on function public.party_season_titles(uuid) from public, anon;
grant execute on function public.party_season_titles(uuid) to authenticated;

-- 7. Fix whole-party badge deduplication in check_member_big_moments so Whole Table & Clean Night post once per party
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
        v_tier_key := 'tier:' || p_user || ':' || v_attr || ':Champion';
        if not exists (select 1 from public.party_moments where party_id = p_party and moment_key = v_tier_key) then
          insert into public.party_moments (party_id, moment_key) values (p_party, v_tier_key) on conflict do nothing;
          insert into public.party_messages (party_id, kind, body)
          values (p_party, 'notice', v_name || '''s ' || v_attr || ' reached Champion.');
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
          v_nudge := v_name || ' leads ' || v_stat_title || ' by ' || v_diff_word || '. Play tomorrow to draw level.';
          insert into public.party_messages (party_id, author_id, reply_to_user, kind, body)
          values (p_party, null, v_curr_leader, 'nudge', v_nudge);
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
$$;

revoke execute on function public.check_member_big_moments(uuid, uuid) from public, anon, authenticated;

-- 8. Update my_record to include Season Titles when the season concludes (and mySeasonTitle / seasonTitles)
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
$$;

revoke execute on function public.my_record(uuid) from public, anon;
grant execute on function public.my_record(uuid) to authenticated;

-- 9. Update today(p_party) to lock seen snapshot and return partyYesterday
create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_series text;
  v_season int;
  r jsonb;
  v_recaps jsonb;
  v_missed int;
  v_yesterday jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  perform public.lock_today_seen_snapshot(p_party, auth.uid());
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  perform public.garrick_morning(p_party);
  select o_recaps, o_missed into v_recaps, v_missed from public.my_recaps(p_party);
  if v_week = 1 and v_day = 1 then v_recaps := '[]'::jsonb; v_missed := 0; end if;
  v_yesterday := public.party_yesterday(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'claims', public.party_claims(p_party),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null),
    'recaps', v_recaps,
    'missed', v_missed,
    'partyYesterday', v_yesterday
  ) into r;
  return r;
end;
$$;

revoke execute on function public.today(uuid) from public, anon;
grant execute on function public.today(uuid) to authenticated;

-- 10. Hook big moments into roll_card, roll_press_card, fight_round, finish_day, and give_relic
create or replace function public.roll_card(p_party uuid, p_attr text, p_relic boolean) returns jsonb
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
  v_dc := (v_meta ->> 'dc')::int
          + case when v_step ? 'harderIf' and (public.party_claims(p_party) ? (v_step -> 'harderIf' ->> 'key')) = (v_step -> 'harderIf' ->> 'has')::boolean
                 then (v_step -> 'harderIf' ->> 'by')::int else 0 end;
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
    set gold = gold + 500, attrs = jsonb_set(attrs, array[p_attr], to_jsonb(least(100, v_score + v_growth)))
    where party_id = p_party and user_id = auth.uid();
  else
    update public.member_progress set gold = greatest(0, gold - 150) where party_id = p_party and user_id = auth.uid();
  end if;
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  if v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'challenge:' || v_week || ':' || v_day);
  end if;
  perform public.check_member_big_moments(p_party, auth.uid());

  return v_result;
end;
$$;

create or replace function public.roll_press_card(p_party uuid, p_leave boolean, p_relic boolean) returns jsonb
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

  if not p_leave and v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'press:' || v_week || ':' || v_day);
  end if;
  if not p_leave then
    perform public.check_member_big_moments(p_party, auth.uid());
  end if;

  return v_result;
end;
$$;

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

  if v_pstruck and v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'fight:' || v_week || ':' || v_day || ':' || (jsonb_array_length(v_rounds) + 1));
  end if;
  if v_done and v_won then
    perform public.check_member_big_moments(p_party, auth.uid());
  end if;

  return v_fight;
end;
$$;

create or replace function public.finish_day(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_row public.member_days; v_name text; v_line text;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_row.finished_at is not null then return; end if;
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
  perform public.check_member_big_moments(p_party, auth.uid());
end;
$$;

create or replace function public.give_relic(p_party uuid, p_to uuid, p_relic text) returns jsonb
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
  perform public.check_member_big_moments(p_party, auth.uid());
  return public.store_state(p_party);
end;
$$;

revoke execute on function public.roll_card(uuid, text, boolean), public.roll_press_card(uuid, boolean, boolean),
  public.fight_round(uuid), public.finish_day(uuid), public.give_relic(uuid, uuid, text) from public, anon;
grant execute on function public.roll_card(uuid, text, boolean), public.roll_press_card(uuid, boolean, boolean),
  public.fight_round(uuid), public.finish_day(uuid), public.give_relic(uuid, uuid, text) to authenticated;

-- 11. Include weeksBest and seasonTitles in g_view
create or replace function public.g_view(p_party uuid, p_week int, p_user uuid) returns jsonb
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
          'myRounds', (select coalesce(jsonb_agg(jsonb_build_object('round', r -> 'round', 'lines',
                         coalesce(r -> 'lines' -> v_me, '[]'::jsonb) || (select coalesce(jsonb_agg(l), '[]'::jsonb) from jsonb_each(r -> 'lines') fl,
                           jsonb_array_elements(fl.value) l where fl.key <> v_me and l ->> 'attacker' = public.g_name(p_party, p_user)))
                         order by (r ->> 'round')::int), '[]'::jsonb)
                       from jsonb_array_elements(s -> 'battle' -> 'rounds') r where r -> 'lines' ? v_me),
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
    'weeksBest', public.gathering_weeks_best(p_party, p_week),
    'seasonTitles', case when p_week = 6 then public.party_season_titles(p_party) else '[]'::jsonb end,
    'progress', (select jsonb_build_object('gold', gold, 'attrs', attrs, 'relics', relics, 'weapon', 13 + weapon_level, 'armor', 26 + armor_level)
                 from public.member_progress where party_id = p_party and user_id = p_user));
end;
$$;

revoke execute on function public.g_view(uuid, int, uuid) from public, anon, authenticated;

-- 11. Update roll_notice so Novice pass note uses exact canon copy ("At Apprentice (26), you would catch more.")
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
  v_top int := -1;
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

  v_notice_line := public.notice_line_for(p_party, v_user, v_week, v_day);
  if v_notice_line is not null and v_notice_line ? 'attr' then
    v_best := v_notice_line ->> 'attr';
  else
    v_best := coalesce(v_class_attr, 'Intellect');
  end if;

  v_top := coalesce((v_attrs ->> v_best)::int, 10);

  v_bonus := case
    when v_top >= 101 then 8
    when v_top >= 76 then 6
    when v_top >= 51 then 4
    when v_top >= 26 then 2
    else 0
  end;

  v_d20 := floor(random() * 20 + 1)::int;
  v_total := v_d20 + v_bonus;
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

-- 12. Update compute_member_record to also include daysPlayedThisWeek and pressClearedThisWeek for accurate current-week badge progress
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
  v_curr_week int;
  v_curr_day int;
  v_days_this_week int := 0;
  v_press_cleared_this_week int := 0;

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
  v_week_full boolean := false;
  v_g record;
  v_round record;
  v_line record;
begin
  select t.week, t.day into v_curr_week, v_curr_day from public.party_today(p_party) t;

  select count(*)::int into v_days_played
  from public.member_days
  where party_id = p_party and user_id = p_user and finished_at is not null;

  if v_curr_week is not null then
    select count(distinct day)::int into v_days_this_week
    from public.member_days
    where party_id = p_party and user_id = p_user and week = v_curr_week and finished_at is not null and day between 1 and 6;

    select count(*)::int into v_press_cleared_this_week
    from public.member_days
    where party_id = p_party and user_id = p_user and week = v_curr_week
      and press is not null and (press ->> 'pass')::boolean = true;
  end if;

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

  select count(*)::int into v_gatherings_attended
  from public.gathering_present
  where party_id = p_party and user_id = p_user;

  select count(distinct fragment_id)::int into v_fragments_solved
  from public.fragment_words
  where party_id = p_party and solved_by = p_user;

  select count(*)::int into v_relics_given
  from public.relic_gifts
  where party_id = p_party and from_user = p_user;

  select count(*)::int into v_times_stepped_up
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'approach' -> 'vols' ? p_user::text;

  select count(*)::int into v_fragments_matched
  from public.gatherings g,
       jsonb_each(coalesce(g.state -> 'match', '{}'::jsonb)) as m(k, v)
  where g.party_id = p_party
    and v -> 'right' ? p_user::text;

  select count(*)::int into v_battles_won
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'battle' ->> 'outcome' = 'won'
    and exists (
      select 1 from public.gathering_present gp
      where gp.party_id = p_party and gp.week = g.week and gp.user_id = p_user
    );

  select count(*)::int into v_challenges_cleared
  from public.member_days
  where party_id = p_party and user_id = p_user
    and challenge is not null and (challenge ->> 'pass')::boolean = true;

  select count(*)::int into v_challenges_pressed_on
  from public.member_days
  where party_id = p_party and user_id = p_user
    and press is not null
    and not coalesce((press ->> 'left')::boolean, false);

  select count(*)::int into v_enemies_defeated
  from public.member_days
  where party_id = p_party and user_id = p_user
    and fight is not null and (fight ->> 'won')::boolean = true;

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

  select count(*)::int into v_perfect_rolls
  from public.member_days
  where party_id = p_party and user_id = p_user
    and (
      (challenge is not null and (challenge ->> 'd20')::int = 20)
      or (press is not null and (press ->> 'd20')::int = 20)
      or (fight is not null and (fight ->> 'playerRoll')::int = 20)
    );

  select v_perfect_rolls + count(*)::int into v_perfect_rolls
  from public.gatherings g
  where g.party_id = p_party
    and g.state -> 'approach' ->> 'roller' = p_user::text
    and (g.state -> 'approach' ->> 'roll')::int = 20;

  for v_g in
    select g.state -> 'battle' as b from public.gatherings g where g.party_id = p_party
  loop
    for v_round in
      select value as r from jsonb_array_elements(coalesce(v_g.b -> 'rounds', '[]'::jsonb))
    loop
      for v_line in
        select value as l from jsonb_array_elements(coalesce(v_round.r -> 'lines' -> (p_user::text), '[]'::jsonb))
      loop
        if (v_line.l ->> 'kind') = 'party' and (v_line.l ->> 'roll')::int = 20 then
          v_perfect_rolls := v_perfect_rolls + 1;
        end if;
      end loop;
    end loop;
  end loop;

  if v_days_played >= 1 then
    v_badges := array_append(v_badges, 'first-light');
  end if;

  select exists (
    select 1 from (
      select md.week
      from public.member_days md
      where md.party_id = p_party and md.user_id = p_user and md.finished_at is not null and md.day between 1 and 6
      group by md.week
      having count(distinct md.day) = 6
    ) w
    join public.gathering_present gp on gp.party_id = p_party and gp.week = w.week and gp.user_id = p_user
  ) into v_week_full;
  if v_week_full then
    v_badges := array_append(v_badges, 'whole-week');
  end if;

  if v_gatherings_attended >= 6 then
    v_badges := array_append(v_badges, 'long-road');
  end if;

  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = p_user;
  if v_attrs is not null and exists (
    select 1 from jsonb_each_text(v_attrs)
    where value ~ '^[0-9]+$' and value::int >= 51
  ) then
    v_badges := array_append(v_badges, 'sharpened');
  end if;

  if v_relics_given >= 1 then
    v_badges := array_append(v_badges, 'open-hand');
  end if;

  if exists (
    select 1 from public.relic_gifts rg
    join public.member_days md on md.party_id = rg.party_id and md.user_id = rg.to_user
    where rg.party_id = p_party and rg.from_user = p_user
      and (
        (md.challenge is not null and (md.challenge ->> 'pass')::boolean = true and (md.challenge ->> 'relic')::boolean = true and (md.challenge ->> 'net')::int between 1 and 4)
        or (md.press is not null and (md.press ->> 'pass')::boolean = true and (md.press ->> 'relic')::boolean = true and (md.press ->> 'net')::int between 1 and 4)
        or (md.fight is not null and (md.fight ->> 'won')::boolean = true and (md.fight ->> 'relic')::boolean = true and coalesce((md.fight ->> 'playerHp')::int, 100) <= 15)
      )
  ) then
    v_badges := array_append(v_badges, 'lifeline');
  end if;

  select count(*)::int into v_party_size
  from public.party_members
  where party_id = p_party and status = 'approved';

  if v_party_size >= 2 then
    select exists (
      select 1 from public.member_days
      where party_id = p_party and finished_at is not null
      group by week, day
      having count(distinct user_id) >= v_party_size
    ) into v_has_whole_table;
    if v_has_whole_table then
      v_badges := array_append(v_badges, 'whole-table');
    end if;
  end if;

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

  if v_perfect_rolls >= 1 then
    v_badges := array_append(v_badges, 'perfect');
  end if;

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

  select count(distinct challenge ->> 'attr')::int into v_party_size
  from public.member_days
  where party_id = p_party and user_id = p_user
    and challenge is not null and (challenge ->> 'pass')::boolean = true;

  if v_party_size >= 4 then
    v_badges := array_append(v_badges, 'many-hands');
  end if;

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
    'perfectRolls', v_perfect_rolls,
    'daysPlayedThisWeek', v_days_this_week,
    'pressClearedThisWeek', v_press_cleared_this_week
  );

  return jsonb_build_object(
    'stats', v_stats,
    'badges', to_jsonb(v_badges)
  );
end;
$$;

revoke execute on function public.compute_member_record(uuid, uuid) from public, anon, authenticated;

-- 13. Require passed Notice roll (member_days.notice ->> 'pass' = true) to hold or lay the Notice piece at the evening fire
create or replace function public.share_notice(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_line jsonb; v_notice_passed boolean := false;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  select coalesce((notice ->> 'pass')::boolean, false) into v_notice_passed
  from public.member_days
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  if not coalesce(v_notice_passed, false) then
    raise exception 'nothing to share';
  end if;

  v_line := public.notice_line_for(p_party, auth.uid(), v_week, v_day);
  if v_line is null then raise exception 'nothing to share'; end if;
  insert into public.fire_shares (party_id, user_id, week, day, attr, body)
  values (p_party, auth.uid(), v_week, v_day, v_line ->> 'attr', v_line ->> 'text')
  on conflict (party_id, user_id, week, day) do nothing;
  return public.fire_shares(p_party);
end;
$$;

revoke execute on function public.share_notice(uuid) from public, anon;
grant execute on function public.share_notice(uuid) to authenticated;

create or replace function public.fire_table(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_me uuid := auth.uid(); v_data jsonb; v_narrated boolean; v_pieces jsonb;
        v_mine_pin public.fire_pins; v_passed boolean; v_pressed boolean; v_notice_passed boolean; v_notice jsonb; v_hands jsonb := '[]'::jsonb;
        v_press jsonb; v_prev_w int; v_prev_d int; v_readings jsonb; v_kinds int;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  v_data := public.campfire_data(p_party, v_week, v_day);
  v_narrated := coalesce((v_data ->> 'narrated')::boolean, false);
  perform public.fire_check_clicks(p_party, v_week, v_day);
  v_pieces := public.fire_pieces(p_party, v_week, v_day);
  if v_narrated then
    select coalesce(jsonb_agg(p), '[]'::jsonb) into v_pieces from jsonb_array_elements(v_pieces) p
    where exists (select 1 from jsonb_array_elements(p -> 'by') b where b ->> 'id' = v_me::text);
  end if;
  select coalesce(jsonb_agg(p || jsonb_build_object(
      'mine', exists (select 1 from jsonb_array_elements(p -> 'by') b where b ->> 'id' = v_me::text),
      'agree', (select coalesce(jsonb_agg(m.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                join public.party_members m on m.party_id = r.party_id and m.user_id = r.user_id
                where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = p ->> 'key' and r.kind = 'agree'),
      'doubt', (select coalesce(jsonb_agg(m.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                join public.party_members m on m.party_id = r.party_id and m.user_id = r.user_id
                where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = p ->> 'key' and r.kind = 'doubt'),
      'myReaction', (select kind from public.fire_reactions where party_id = p_party and user_id = v_me and week = v_week and day = v_day
                     and target = p ->> 'key' and kind <> 'none')) order by p ->> 'at'), '[]'::jsonb)
    into v_pieces from jsonb_array_elements(v_pieces) p;

  if not v_narrated then
    select coalesce((notice ->> 'pass')::boolean, false),
           coalesce((challenge ->> 'pass')::boolean, false),
           coalesce((press ->> 'pass')::boolean, false)
      into v_notice_passed, v_passed, v_pressed
      from public.member_days
     where party_id = p_party and user_id = v_me and week = v_week and day = v_day;

    if coalesce(v_notice_passed, false) then
      v_notice := public.notice_line_for(p_party, v_me, v_week, v_day);
      if v_notice is not null and not exists (select 1 from public.fire_shares where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
        v_hands := v_hands || jsonb_build_object('kind', 'notice', 'title', 'What you noticed', 'attr', v_notice ->> 'attr', 'text', v_notice ->> 'text');
      end if;
    end if;

    if v_passed and public.fire_pass_text(p_party, v_week, v_day) is not null
       and not exists (select 1 from public.fire_laid where party_id = p_party and user_id = v_me and week = v_week and day = v_day and kind = 'pass') then
      v_hands := v_hands || jsonb_build_object('kind', 'pass', 'title', 'What you heard, because you passed', 'text', public.fire_pass_text(p_party, v_week, v_day));
    end if;
    v_press := public.fire_press_piece(p_party, v_week, v_day);
    if v_pressed and v_press is not null
       and not exists (select 1 from public.fire_laid where party_id = p_party and user_id = v_me and week = v_week and day = v_day and kind = 'press') then
      v_hands := v_hands || jsonb_build_object('kind', 'press', 'title', v_press ->> 'title', 'text', v_press ->> 'text');
    end if;
  end if;

  select * into v_mine_pin from public.fire_pins where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
  if v_mine_pin.user_id is not null and not v_narrated then
    select coalesce(jsonb_agg(jsonb_build_object('id', fp.user_id, 'name', m.character_name, 'reading', fp.reading, 'line', fp.line,
        'mine', fp.user_id = v_me,
        'agree', (select coalesce(jsonb_agg(rm.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                  join public.party_members rm on rm.party_id = r.party_id and rm.user_id = r.user_id
                  where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = 'pin:' || fp.user_id and r.kind = 'agree'),
        'doubt', (select coalesce(jsonb_agg(rm.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                  join public.party_members rm on rm.party_id = r.party_id and rm.user_id = r.user_id
                  where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = 'pin:' || fp.user_id and r.kind = 'doubt'),
        'myReaction', (select kind from public.fire_reactions where party_id = p_party and user_id = v_me and week = v_week and day = v_day
                       and target = 'pin:' || fp.user_id and kind <> 'none')) order by fp.at), '[]'::jsonb)
      into v_readings
    from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
    where fp.party_id = p_party and fp.week = v_week and fp.day = v_day;
  end if;
  select count(distinct reading) into v_kinds from public.fire_pins where party_id = p_party and week = v_week and day = v_day;

  if v_day > 1 then v_prev_w := v_week; v_prev_d := v_day - 1;
  elsif v_week > 1 then v_prev_w := v_week - 1; v_prev_d := 6;
  end if;

  return jsonb_build_object('week', v_week, 'day', v_day, 'narrated', v_narrated,
    'evening', (select extract(hour from now() at time zone time_zone) >= 20 from public.parties where id = p_party),
    'pieces', v_pieces,
    'hands', v_hands,
    'clicks', (select coalesce(jsonb_agg(jsonb_build_object('text', (v_data -> 'clicks' -> (k.idx - 1)) ->> 'text',
                 'names', to_jsonb(k.names), 'solves', coalesce(((v_data -> 'clicks' -> (k.idx - 1)) ->> 'solves')::boolean, false)) order by k.at), '[]'::jsonb)
               from public.fire_clicks k where k.party_id = p_party and k.week = v_week and k.day = v_day),
    'puzzle', v_data -> 'puzzle',
    'thread', case when v_narrated then '[]'::jsonb else (
      select coalesce(jsonb_agg(t.item order by t.at), '[]'::jsonb) from (
        select x.at, x.item from (
          select th.at, jsonb_build_object('kind', th.kind, 'name', m.character_name, 'mine', th.user_id = v_me, 'body', th.body, 'at', th.at) item
          from public.fire_thread th left join public.party_members m on m.party_id = th.party_id and m.user_id = th.user_id
          where th.party_id = p_party and th.week = v_week and th.day = v_day
          union all
          select f.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', f.user_id = v_me, 'body', l ->> 'clueTitle', 'at', f.at)
          from public.fan_outs f join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
          join lateral jsonb_array_elements(v_data -> 'leads') l on l ->> 'id' = f.lead_id
          where f.party_id = p_party and f.week = v_week and f.day = v_day
          union all
          select s.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', s.user_id = v_me, 'body', 'What ' || m.character_name || ' noticed', 'at', s.at)
          from public.fire_shares s join public.party_members m on m.party_id = s.party_id and m.user_id = s.user_id
          where s.party_id = p_party and s.week = v_week and s.day = v_day
          union all
          select l.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', l.user_id = v_me,
                   'body', case l.kind when 'pass' then 'What the passers heard' else coalesce(public.fire_press_piece(p_party, v_week, v_day) ->> 'title', 'A find') end, 'at', l.at)
          from public.fire_laid l join public.party_members m on m.party_id = l.party_id and m.user_id = l.user_id
          where l.party_id = p_party and l.week = v_week and l.day = v_day
        ) x order by x.at desc limit 200) t) end,
    'pinned', (select coalesce(jsonb_agg(m.character_name order by fp.at), '[]'::jsonb) from public.fire_pins fp
               join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
               where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and not v_narrated),
    'readings', v_readings,
    'leaning', case when v_narrated then null when v_kinds > 1 then 'split'
                    when v_kinds = 1 and v_mine_pin.user_id is not null
                         and (select count(*) from public.fire_pins where party_id = p_party and week = v_week and day = v_day) >= 3 then 'same' end,
    'lastCall', case when v_prev_w is not null then public.fire_call(p_party, v_prev_w, v_prev_d) end);
end;
$$;

revoke execute on function public.fire_table(uuid) from public, anon;
grant execute on function public.fire_table(uuid) to authenticated;

