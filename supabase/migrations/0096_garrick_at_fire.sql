-- Piece 6 (docs/design/handoff-ledger.md): Garrick at the fire is decided by the server.
-- 1. Marks each Garrick reply with whether it was said at the fire (at_fire) and who asked it (reply_to_user).
-- 2. garrick_state checks whether p_asked_by is at the fire (the friend has finished today's chapter and the fire is open).
-- 3. garrick_post records at_fire and reply_to_user into party_messages.
-- 4. An unfinished friend sees Garrick's reply to their own question; non-fire replies never bleed into the evening fire.

alter table public.party_messages add column if not exists at_fire boolean not null default false;
alter table public.party_messages add column if not exists reply_to_user uuid references public.profiles (id) on delete set null;

-- Drop the earlier 1-arg / 9-arg signatures from 0042 so the new signatures replace them cleanly without ambiguity.
drop function if exists public.garrick_state(uuid);
drop function if exists public.garrick_post(uuid, uuid, bigint, text, text, text, jsonb, boolean, text);

-- Story state the router needs: now checks whether p_asked_by is at the fire.
create or replace function public.garrick_state(p_party uuid, p_asked_by uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_week int;
  v_day int;
  v_chapter jsonb;
  v_summary jsonb;
  v_learned text;
  v_pull text;
  v_question text;
  v_fire_week int;
  v_fire_day int;
  v_at_fire boolean := false;
begin
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;

  -- Server decides whether the asker is at the fire:
  -- The fire is open for today, and the friend has finished today's chapter (a fan_outs row for today).
  if p_asked_by is not null then
    begin
      select f.o_week, f.o_day into v_fire_week, v_fire_day from public.my_fire_day(p_party) f;
      if v_fire_week is not null and exists (
        select 1 from public.fan_outs
        where party_id = p_party and user_id = p_asked_by and week = v_fire_week and day = v_fire_day
      ) then
        v_at_fire := true;
      end if;
    exception when others then
      v_at_fire := false;
    end;
  end if;

  select c.script into v_chapter from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = v_week and c.day = v_day;
  if v_chapter is not null then
    v_question := v_chapter ->> 'question';
    select s into v_summary from jsonb_array_elements(v_chapter -> 'steps') s where s ->> 't' = 'summary' limit 1;
    select regexp_replace(l, '^You learned:\s*', '') into v_learned from jsonb_array_elements_text(v_summary -> 'lines') l where l like 'You learned:%' limit 1;
    select s ->> 'text' into v_pull from jsonb_array_elements(v_chapter -> 'steps') s where s ->> 't' = 'say' and (s ->> 'pull')::boolean limit 1;
  else
    -- Day 7: the Gathering's "Tonight" line.
    select x ->> 'text' into v_question from jsonb_array_elements(public.g_script(p_party, v_week) -> 'steps') x where x ->> 't' = 'tonight' limit 1;
  end if;

  return jsonb_build_object(
    'party', (select name from public.parties where id = p_party),
    'atFire', v_at_fire,
    'state', jsonb_build_object(
      'episode', v_week, 'day', v_day,
      'ledgerOpened', v_week > 2 or (v_week = 2 and v_day >= 6),
      'prisonerHeld', (v_week = 3 and v_day = 7) or (v_week = 4 and v_day = 1),
      'prisonerAskedLeader', exists (
        select 1 from public.gatherings g, jsonb_each(coalesce(g.state -> 'ask', '{}'::jsonb)) a, jsonb_array_elements(a.value -> 'asked') q
        where g.party_id = p_party and g.week = 3
          and public.g_script(p_party, 3) -> 'steps' -> (a.key::int) -> 'rows' -> ((q ->> 'r')::int) -> 'questions' ->> 0 = 'WHO LEADS YOU?'),
      'allFourChildrenHome', v_week >= 5 or (v_week = 4 and v_day = 7),
      'verseOfFourRead', v_week >= 5 or (v_week = 4 and v_day = 7),
      'atHighwall', v_week >= 5,
      'ep6RevealLanded', exists (
        select 1 from public.gatherings g, jsonb_array_elements(coalesce(g.state -> 'log', '[]'::jsonb)) e
        where g.party_id = p_party and g.week = 6 and e ->> 't' = 'section' and e ->> 'title' = 'The Verse of the Name'),
      'atCampfire', v_at_fire,
      -- "Malakor. My grandmother taught me that name." only the first time he is asked (CLAUDE.md §6).
      'malakorNameGiven', exists (select 1 from public.garrick_log l where l.party_id = p_party and l.reply like 'Malakor.%')),
    'scene', jsonb_build_object('question', v_question, 'learned', v_learned, 'pull', v_pull),
    -- AI replies used today (at most 12 a day for a party; after that he answers from his stored lines only).
    'aiToday', (select count(*) from public.garrick_log l where l.party_id = p_party and l.ai
                and l.at >= public.party_day_start(p_party, v_week, v_day)),
    -- His recent lines by question type, so he does not repeat himself (stored-lines rule 6).
    'history', (select coalesce(jsonb_object_agg(category, lines), '{}'::jsonb) from (
                  select category, jsonb_agg(reply order by at) lines from (
                    select category, reply, at, row_number() over (partition by category order by at desc) rn
                    from public.garrick_log where party_id = p_party) z
                  where rn <= 6 group by category) h),
    -- The last few lines of the party chat, for small talk that fits the moment.
    'recent', (select coalesce(jsonb_agg(jsonb_build_object('speaker', who, 'line', body) order by id), '[]'::jsonb) from (
                 select m.id, m.body, case when m.speaker = 'garrick' then 'Garrick' else coalesce(pm.character_name, 'MYTHIOS') end who
                 from public.party_messages m left join public.party_members pm on pm.party_id = m.party_id and pm.user_id = m.author_id
                 where m.party_id = p_party order by m.id desc limit 4) r));
end;
$$;

-- Garrick's reply into the party chat, and its log line. Marks at_fire and reply_to_user.
create or replace function public.garrick_post(
  p_party uuid, p_asked_by uuid, p_question_id bigint, p_body text, p_route text, p_category text,
  p_flags jsonb, p_ai boolean, p_filtered text, p_at_fire boolean default false
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint;
begin
  insert into public.party_messages (party_id, author_id, kind, body, speaker, at_fire, reply_to_user)
  values (p_party, null, 'chat', left(p_body, 500), 'garrick', coalesce(p_at_fire, false), p_asked_by)
  returning id into v_id;
  insert into public.garrick_log (party_id, asked_by, question_id, reply_id, route, category, reply, flags, ai, filtered)
  values (p_party, p_asked_by, p_question_id, v_id, p_route, p_category, p_body, coalesce(p_flags, '[]'::jsonb), p_ai, p_filtered);
  return v_id;
end;
$$;

revoke execute on function public.garrick_state(uuid, uuid), public.garrick_post(uuid, uuid, bigint, text, text, text, jsonb, boolean, text, boolean) from public, anon, authenticated;
grant execute on function public.garrick_state(uuid, uuid), public.garrick_post(uuid, uuid, bigint, text, text, text, jsonb, boolean, text, boolean) to service_role;
