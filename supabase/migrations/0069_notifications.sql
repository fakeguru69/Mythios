-- Phone notifications and the Day 4 poll (Fake Guru, 17 Oct: "1 yes, 2 8am"; Core Rules §11 "The Gathering's hour").
--   - 8:00am party time (the day still opens at 5:00am): the day is open. Day 4's adds the poll; Day 7's is the "Tonight" line.
--   - Day 4: the poll. Each friend taps every Day 7 time they can make (8:00am to 11:00pm only, §12a).
--   - End of Day 5: if the host has not pinned a time, the app does: the time most friends can make, or last week's time
--     (the first week: 8:00pm) if nobody voted. Everyone is told in the chat and by notification.
--   - An hour before the Gathering: a reminder. A time the host changes is told to everyone.
-- The server function "notify" (supabase/functions/notify) runs every five minutes: it calls notify_due() to fill the
-- outbox, then sends what is waiting (Web Push, signed with the game's VAPID key, kept in app_secrets).
-- Players never touch these tables; everything goes through the functions below. Additive only: rows are marked, never removed.

-- A phone that said yes to notifications.
create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  gone boolean not null default false -- turned off on the phone, or gone from the push service
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

-- What is waiting to be sent, and what has been.
create table public.push_outbox (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  party_id uuid references public.parties (id) on delete cascade,
  title text not null,
  body text not null,
  tag text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index push_outbox_waiting on public.push_outbox (created_at) where sent_at is null;
alter table public.push_outbox enable row level security;
revoke all on public.push_outbox from anon, authenticated;

-- Each party notice once: the morning line, the poll, the time chosen, the reminder.
create table public.notify_sent (
  party_id uuid not null references public.parties (id) on delete cascade,
  kind text not null,
  week int not null,
  day int not null,
  at timestamptz not null default now(),
  primary key (party_id, kind, week, day)
);
alter table public.notify_sent enable row level security;
revoke all on public.notify_sent from anon, authenticated;

-- The server's own keys (the VAPID private key). Never readable by a player.
create table public.app_secrets (name text primary key, value text not null);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

-- The poll: one row per friend per time they can make.
create table public.gathering_votes (
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot time not null,
  can boolean not null default true, -- tapped off again: false (rows are kept, never removed)
  primary key (party_id, week, user_id, slot)
);
alter table public.gathering_votes enable row level security;
revoke all on public.gathering_votes from anon, authenticated;

-- When the time was pinned, by the host or by the app.
alter table public.gatherings add column pinned_at timestamptz;

-- ---- Phones ----

create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 or length(p_p256dh) > 200 or length(p_auth) > 100 then
    raise exception 'bad subscription';
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, gone = false;
end;
$$;

create function public.stop_push_subscription(p_endpoint text) returns void
language sql security definer set search_path = '' as $$
  update public.push_subscriptions set gone = true where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- ---- The poll ----

-- A clock time as the chat writes it: "8:00pm".
create function public.clock_word(p_at timestamptz, p_tz text) returns text language sql stable set search_path = '' as $$
  select lower(to_char(p_at at time zone p_tz, 'FMHH12:MIam'));
$$;

-- The times offered: a morning, an afternoon and three evenings, with last week's time added if it is not among them.
create function public.poll_slots(p_party uuid, p_week int) returns time[]
language sql stable security definer set search_path = '' as $$
  select array(select distinct s from unnest(array['10:00', '14:00', '19:00', '20:00', '21:00']::time[]
    || coalesce((select array[(g.opens_at at time zone p.time_zone)::time] from public.gatherings g join public.parties p on p.id = g.party_id
                 where g.party_id = p_party and g.week = p_week - 1
                   and (g.opens_at at time zone p.time_zone)::time between time '08:00' and time '23:00'), array[]::time[])) s order by s);
$$;

-- The poll for the party page: open on Days 4 and 5, until the time is pinned at the end of Day 5.
create function public.gathering_poll(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or v_day not in (4, 5) then return null; end if;
  return jsonb_build_object('week', v_week, 'slots', (
    select jsonb_agg(jsonb_build_object(
      'time', to_char(s, 'HH24:MI'),
      'names', coalesce((select jsonb_agg(pm.character_name order by pm.character_name) from public.gathering_votes v
                         join public.party_members pm on pm.party_id = v.party_id and pm.user_id = v.user_id
                         where v.party_id = p_party and v.week = v_week and v.slot = s and v.can), '[]'::jsonb),
      'mine', exists (select 1 from public.gathering_votes v where v.party_id = p_party and v.week = v_week and v.slot = s and v.user_id = auth.uid() and v.can)
    ) order by s) from unnest(public.poll_slots(p_party, v_week)) s));
end;
$$;

create function public.gathering_vote(p_party uuid, p_slot time, p_on boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or v_day not in (4, 5) then raise exception 'the poll is closed'; end if;
  if not (p_slot = any (public.poll_slots(p_party, v_week))) then raise exception 'not one of the times'; end if;
  insert into public.gathering_votes (party_id, week, user_id, slot, can) values (p_party, v_week, auth.uid(), p_slot, p_on)
  on conflict (party_id, week, user_id, slot) do update set can = excluded.can;
  return public.gathering_poll(p_party);
end;
$$;

-- One notification to every friend in the party (optionally all but one).
create function public.notify_party(p_party uuid, p_body text, p_tag text, p_except uuid default null) returns void
language sql security definer set search_path = '' as $$
  insert into public.push_outbox (user_id, party_id, title, body, tag)
  select pm.user_id, p_party, 'Tales of the Dark Moon · ' || p.name, p_body, p_tag
  from public.party_members pm join public.parties p on p.id = pm.party_id
  where pm.party_id = p_party and pm.status = 'approved' and pm.session_zero_done_at is not null
    and pm.user_id is distinct from p_except;
$$;

-- The host pins the time (0032), now marking it pinned and telling everyone by notification as well as in the chat.
create or replace function public.gathering_set_time(p_party uuid, p_time time) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; g public.gatherings; v_at timestamptz; v_tz text;
begin
  if (select host_id from public.parties where id = p_party) is distinct from auth.uid() then raise exception 'only the host'; end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;
  if p_time < time '08:00' or p_time > time '23:00' then raise exception 'between 8:00am and 11:00pm'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  if g.started_at is not null or now() >= g.opens_at then raise exception 'the lobby is already open'; end if;
  select time_zone into v_tz from public.parties where id = p_party;
  v_at := ((public.party_day_start(p_party, v_week, 7) at time zone v_tz)::date + p_time) at time zone v_tz;
  if v_at <= now() then raise exception 'that time has passed'; end if;
  update public.gatherings set opens_at = v_at, pinned_at = now(), version = version + 1 where party_id = p_party and week = v_week;
  insert into public.party_messages (party_id, kind, body)
  values (p_party, 'notice', 'The Gathering is at ' || public.clock_word(v_at, v_tz) || ' on Day 7.');
  perform public.notify_party(p_party, 'The Gathering is at ' || public.clock_word(v_at, v_tz) || ' on Day 7.', 'gathering-time', auth.uid());
  return jsonb_build_object('week', v_week, 'opensAt', v_at);
end;
$$;

-- ---- What is due ----

-- Fills the outbox with whatever is due now, each thing once. Run every five minutes by the "notify" function.
create function public.notify_due() returns int
language plpgsql security definer set search_path = '' as $$
declare p record; v_week int; v_day int; v_local timestamp; g public.gatherings; v_slot time; v_at timestamptz; v_n int := 0; v_body text;
begin
  for p in select * from public.parties where day1_opens_at is not null and now() >= day1_opens_at loop
    select t.week, t.day into v_week, v_day from public.party_today(p.id) t;
    continue when v_week is null;
    v_local := now() at time zone p.time_zone;
    perform public.g_row(p.id, v_week);
    select * into g from public.gatherings where party_id = p.id and week = v_week;

    -- Day 4: the poll opens, in the chat.
    if v_day = 4 and g.pinned_at is null then
      insert into public.notify_sent (party_id, kind, week, day) values (p.id, 'poll', v_week, 4) on conflict do nothing;
      if found then
        insert into public.party_messages (party_id, kind, body) values (p.id, 'notice',
          'When can you all meet on Day 7? Tap every time you can make, under The Gathering on the party page. The host picks at the end of Day 5.');
      end if;
    end if;

    -- From Day 6: a time the host never pinned is pinned by the app.
    if v_day >= 6 and g.pinned_at is null and g.started_at is null then
      select v.slot into v_slot from public.gathering_votes v
      where v.party_id = p.id and v.week = v_week and v.can
      group by v.slot
      order by count(*) desc,
               (v.slot = (select (lw.opens_at at time zone p.time_zone)::time from public.gatherings lw where lw.party_id = p.id and lw.week = v_week - 1)) desc nulls last,
               v.slot
      limit 1;
      if v_slot is null then
        select (lw.opens_at at time zone p.time_zone)::time into v_slot from public.gatherings lw where lw.party_id = p.id and lw.week = v_week - 1;
      end if;
      v_at := case when v_slot is null then g.opens_at
                   else ((public.party_day_start(p.id, v_week, 7) at time zone p.time_zone)::date + v_slot) at time zone p.time_zone end;
      if v_at > now() then
        update public.gatherings set opens_at = v_at, pinned_at = now(), version = version + 1 where party_id = p.id and week = v_week;
        insert into public.party_messages (party_id, kind, body)
        values (p.id, 'notice', 'The Gathering is at ' || public.clock_word(v_at, p.time_zone) || ' on Day 7.');
        perform public.notify_party(p.id, 'The Gathering is at ' || public.clock_word(v_at, p.time_zone) || ' on Day 7.', 'gathering-time');
      else
        update public.gatherings set pinned_at = now() where party_id = p.id and week = v_week;
      end if;
      select * into g from public.gatherings where party_id = p.id and week = v_week;
    end if;

    -- 8:00am: the day is open (the day began at 5:00am; a friend who has already played it is left alone).
    if v_local::time >= time '08:00' then
      insert into public.notify_sent (party_id, kind, week, day) values (p.id, 'morning', v_week, v_day) on conflict do nothing;
      if found then
        v_body := case
          when v_day = 7 then 'Tonight: the Gathering, at ' || public.clock_word(g.opens_at, p.time_zone) || '.'
          when v_week = 1 and v_day = 1 then 'Your story begins today. Week 1, Day 1 is open.'
          when v_day = 4 then 'Week ' || v_week || ', Day 4 is open. And when can you all meet on Day 7? Tap the times you can make.'
          else 'Week ' || v_week || ', Day ' || v_day || ' is open. The road goes on.' end;
        insert into public.push_outbox (user_id, party_id, title, body, tag)
        select pm.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, v_body, 'day'
        from public.party_members pm
        where pm.party_id = p.id and pm.status = 'approved' and pm.session_zero_done_at is not null
          and not exists (select 1 from public.member_days md where md.party_id = p.id and md.user_id = pm.user_id
                          and md.week = v_week and md.day = v_day and md.finished_at is not null);
        get diagnostics v_n = row_count;
      end if;
    end if;

    -- An hour before the Gathering ("begins soon": a time moved to within the hour is reminded at once). Kept once per
    -- time, so a time the host moves is reminded again.
    if g.started_at is null and now() >= g.opens_at - interval '1 hour' and now() < g.opens_at then
      insert into public.notify_sent (party_id, kind, week, day)
      values (p.id, 'remind ' || extract(epoch from g.opens_at)::bigint, v_week, 7) on conflict do nothing;
      if found then
        perform public.notify_party(p.id, 'The Gathering begins soon, at ' || public.clock_word(g.opens_at, p.time_zone) || '.', 'gathering');
      end if;
    end if;
  end loop;
  return v_n;
end;
$$;

-- For the "notify" function: what is waiting, with every phone to send it to (only what is under six hours old).
create function public.push_batch() returns table (id bigint, endpoint text, p256dh text, auth text, title text, body text, tag text)
language sql security definer set search_path = '' as $$
  select o.id, s.endpoint, s.p256dh, s.auth, o.title, o.body, o.tag
  from public.push_outbox o join public.push_subscriptions s on s.user_id = o.user_id
  where o.sent_at is null and o.created_at > now() - interval '6 hours' and not s.gone
  order by o.id limit 500;
$$;

-- Marks the batch sent (and anything older than six hours, or with no phone, as done), and marks phones that are gone.
create function public.push_done(p_ids bigint[], p_gone text[]) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.push_outbox set sent_at = now() where id = any (p_ids) and sent_at is null;
  update public.push_outbox o set sent_at = now() where o.sent_at is null
    and (o.created_at <= now() - interval '6 hours' or not exists (select 1 from public.push_subscriptions s where s.user_id = o.user_id and not s.gone));
  update public.push_subscriptions set gone = true where endpoint = any (coalesce(p_gone, array[]::text[]));
end;
$$;

create function public.push_vapid() returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_object_agg(name, value) from public.app_secrets where name in ('vapid_public', 'vapid_private', 'vapid_subject');
$$;

revoke execute on function public.save_push_subscription, public.stop_push_subscription, public.gathering_poll, public.gathering_vote
  from public, anon;
grant execute on function public.save_push_subscription, public.stop_push_subscription, public.gathering_poll, public.gathering_vote
  to authenticated;
revoke execute on function public.clock_word, public.poll_slots, public.notify_party, public.notify_due, public.push_batch,
  public.push_done, public.push_vapid from public, anon, authenticated;
grant execute on function public.notify_due, public.push_batch, public.push_done, public.push_vapid to service_role;
