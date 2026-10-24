-- 0113 (24 Oct, Phase 0.2 of the make-it-great plan): the morning line, and where a notification leads.
--
-- 1. Garrick's morning line is stamped at 5:00am, the very start of the party's day, so party_chat_messages hid it
--    (it showed only talk from before the day's start) from every friend who had not yet finished the day: the line
--    meant to greet them in the morning was never seen in the morning. It is now always shown, and marked 'morning'
--    so the screen can place it.
-- 2. push_batch_for_links: the same waiting notifications as push_batch, with the party each is about, so the
--    notify function can send a link that opens that party and the screen the alert is about (pwa/sw.js).

CREATE OR REPLACE FUNCTION public.party_chat_messages(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
        'reply_to_user', x.reply_to_user,
        'morning', x.morning
      )
      order by x.created_at desc, x.id desc
    ),
    '[]'::jsonb
  ),
  max(x.id)
  into v_res, v_max_id
  from (
    select m.id, m.party_id, m.author_id, m.kind, m.speaker, m.body, m.created_at, m.at_fire, m.reply_to_user,
           exists (select 1 from public.garrick_mornings gm where gm.party_id = p_party and gm.message_id = m.id) as morning
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
              -- Garrick's morning line (5:00am, stamped at the day's start) belongs to everyone from the moment it is up.
              or exists (select 1 from public.garrick_mornings gm where gm.party_id = p_party and gm.message_id = m.id)
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
$function$;

create or replace function public.push_batch_for_links()
returns table (id bigint, endpoint text, p256dh text, auth text, title text, body text, tag text, party_id uuid)
language sql security definer set search_path = '' as $$
  select o.id, s.endpoint, s.p256dh, s.auth, o.title, o.body, o.tag, o.party_id
  from public.push_outbox o join public.push_subscriptions s on s.user_id = o.user_id
  where o.sent_at is null and o.created_at > now() - interval '6 hours' and not s.gone
  order by o.id limit 500;
$$;
revoke execute on function public.push_batch_for_links() from public, anon, authenticated;
grant execute on function public.push_batch_for_links() to service_role;
