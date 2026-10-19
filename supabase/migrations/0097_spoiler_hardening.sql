-- Piece 7 (docs/design/handoff-ledger.md): Spoiler hardening on the server.
-- 1. A friend who has not finished today's chapter cannot read today's fire talk (messages from today's 5:00am start
--    written by other friends, notices, or Garrick lines not answering their own question) through the data connection.
-- 2. Direct table reads on party_messages are closed; FireChat and PartyChat read through party_chat_messages(p_party).
-- 3. EarlierFire continues to receive last night's talk plus the caller's own lines and Garrick's replies to them today.

create or replace function public.party_message_visible(
  p_party uuid,
  p_author uuid,
  p_reply_to uuid,
  p_created_at timestamptz
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

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  -- Before the season starts or on Day 7 (the Gathering), there is no weekday chapter to finish first.
  if v_week is null or v_day > 6 then
    return true;
  end if;

  v_check_day := case when public.is_late_day1(p_party, v_me) then 1 else v_day end;

  -- Once the friend has finished today's chapter, all of today's fire talk is open to them.
  if exists (
    select 1 from public.member_days md
    where md.party_id = p_party and md.user_id = v_me
      and md.week = v_week and md.day = v_check_day and md.finished_at is not null
  ) then
    return true;
  end if;

  -- Before finishing today's chapter: messages before today's 5:00am start (e.g. last night's fire) are visible,
  -- and today's messages are visible only if authored by the caller or a Garrick reply to the caller's own question.
  v_start := public.party_day_start(p_party, v_week, v_day);
  if p_created_at < v_start then
    return true;
  end if;

  return (p_author = v_me or p_reply_to = v_me);
end;
$$;

-- Restrictive row-level policy and closed direct table reads on party_messages.
create policy "messages: today's fire talk only after finishing today" on public.party_messages
  as restrictive for select to authenticated
  using (public.party_message_visible(party_id, author_id, reply_to_user, created_at));

revoke select on public.party_messages from anon, authenticated;

-- Security-definer read function for the fire, EarlierFire, and the Gathering's table talk (newest 200, ordered newest-first).
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
          v_can_see_today
          or m.created_at < v_start
          or m.author_id = v_me
          or m.reply_to_user = v_me
        )
      order by m.created_at desc, m.id desc
      limit 200
    ) x
  );
end;
$$;

revoke execute on function public.party_message_visible(uuid, uuid, uuid, timestamptz) from public, anon;
grant execute on function public.party_message_visible(uuid, uuid, uuid, timestamptz) to authenticated;
revoke execute on function public.party_chat_messages(uuid) from public, anon;
grant execute on function public.party_chat_messages(uuid) to authenticated;
