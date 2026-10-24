-- 0122 (24 Oct, Phase 2 part 6 of the make-it-great plan; decided by Claude on Fake Guru's "use your judgement"):
-- fewer fire alerts. Each friend gets at most one fire alert a night (a friend came, the table clicked, your reading was
-- doubted, a friend changed sides, last call), whichever comes first. Plus one that brings people back, outside that
-- limit: "The table is waiting for your piece.", once a night, to a friend who has not come to tonight's fire while one
-- half of a click's pair is on the table and the other is not. Quiet hours (10:00pm to 8:00am) as before.

CREATE OR REPLACE FUNCTION public.notify_due()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare p record; v_week int; v_day int; v_local timestamp; g public.gatherings; v_slot time; v_at timestamptz; v_n int := 0; v_body text;
        v_arrived uuid[]; v_names text;
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
          when v_day = 5 and public.gathering_calls_on(p.id, v_week) is not null then 'Week ' || v_week || ', Day 5 is open. The Gathering on Day 7 will call on '
               || public.gathering_calls_on(p.id, v_week) || '.'
          else 'Week ' || v_week || ', Day ' || v_day || ' is open. The road goes on.' end;
        -- Campfire v3: a friend who pinned last night hears that the fire's call is in.
        insert into public.push_outbox (user_id, party_id, title, body, tag)
        select pm.user_id, p.id, 'Tales of the Dark Moon · ' || p.name,
               v_body || case when v_day > 1 and exists (select 1 from public.fire_pins fp where fp.party_id = p.id and fp.user_id = pm.user_id
                                                         and fp.week = v_week and fp.day = v_day - 1)
                              then ' Last night''s call is in.' else '' end, 'day'
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

    -- Someone has come to the fire (Fake Guru, 17 Oct: "a prompt that someone has entered the campfire is a good
    -- feature"). One alert per friend per day, on their first arrival; arrivals between two runs share one alert. Not on
    -- a narrated fire (Week 1 Day 1, before the party has met), not to the friend who came, not to a friend at the fire
    -- right now, and only to friends on the same day (a late joiner's Day 1 fire stays quiet). None from 10:00pm to
    -- 8:00am party time (§12a): an arrival between 5:00am and 8:00am goes out at 8:00am, one after 10:00pm never (the day
    -- has changed by the morning).
    if v_day between 1 and 6 and v_local::time >= time '08:00' and v_local::time < time '22:00'
       and not coalesce((public.campfire_data(p.id, v_week, v_day) ->> 'narrated')::boolean, false) then
      v_arrived := '{}';
      with fresh as (
        insert into public.notify_sent (party_id, kind, week, day)
        select p.id, 'fire ' || v.user_id, v_week, v_day from public.fire_visits v
        join public.party_members m on m.party_id = v.party_id and m.user_id = v.user_id and m.status = 'approved'
        where v.party_id = p.id and v.week = v_week and v.day = v_day
        on conflict do nothing
        returning substr(kind, 6)::uuid u)
      select coalesce(array_agg(u), '{}') into v_arrived from fresh;
      if array_length(v_arrived, 1) > 0 then
        select regexp_replace(string_agg(m.character_name, ', ' order by v.first_at), ', ([^,]*)$', ' and \1')
               || case when count(*) > 1 then ' have come to the fire.' else ' has come to the fire.' end
        into v_names
        from public.fire_visits v join public.party_members m on m.party_id = v.party_id and m.user_id = v.user_id
        where v.party_id = p.id and v.week = v_week and v.day = v_day and v.user_id = any (v_arrived);
        insert into public.push_outbox (user_id, party_id, title, body, tag)
        with c as materialized (
          select pm.user_id,
                 v_names || case when exists (select 1 from public.member_days md where md.party_id = p.id and md.user_id = pm.user_id
                                              and md.week = v_week and md.day = v_day and md.finished_at is not null)
                                 then '' else ' Your day is still waiting.' end body
          from public.party_members pm
          where pm.party_id = p.id and pm.status = 'approved' and pm.session_zero_done_at is not null
            and not (pm.user_id = any (v_arrived))
            and not exists (select 1 from public.fire_visits h where h.party_id = p.id and h.user_id = pm.user_id
                            and h.week = v_week and h.day = v_day and h.last_at > now() - interval '3 minutes')
            and not public.is_late_day1(p.id, pm.user_id))
        -- 24 Oct (Phase 2 part 6): one fire alert a friend a night, whichever comes first ('fireone').
        select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, c.body, 'fire'
        from c where public.notify_once(p.id, 'fireone ' || c.user_id, v_week, v_day);
      end if;

      -- Campfire v3 (docs/design/campfire-v3-17oct.md §9): alerts that carry something to answer, each once, to friends
      -- who have sat at tonight's fire and are not there now. Same hours as above.
      -- Each list of who should hear is made first (materialized), and only then is each alert claimed once.
      -- The table clicked.
      insert into public.push_outbox (user_id, party_id, title, body, tag)
      with c as materialized (
        select k.idx, v.user_id from public.fire_clicks k
        join public.fire_visits v on v.party_id = k.party_id and v.week = k.week and v.day = k.day and v.last_at <= now() - interval '3 minutes'
        where k.party_id = p.id and k.week = v_week and k.day = v_day)
      select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, 'The table clicked: two pieces belong together.', 'fire-click'
      from c where public.notify_once(p.id, 'click ' || c.idx || ' ' || c.user_id, v_week, v_day)
        and public.notify_once(p.id, 'fireone ' || c.user_id, v_week, v_day);
      -- Your reading was doubted (names, once a night).
      insert into public.push_outbox (user_id, party_id, title, body, tag)
      with c as materialized (
        select fp.user_id,
               (select regexp_replace(string_agg(m.character_name, ', ' order by r.at), ', ([^,]*)$', ' and \1')
                from public.fire_reactions r join public.party_members m on m.party_id = r.party_id and m.user_id = r.user_id
                where r.party_id = p.id and r.week = v_week and r.day = v_day and r.target = 'pin:' || fp.user_id and r.kind = 'doubt') names
        from public.fire_pins fp
        join public.fire_visits v on v.party_id = fp.party_id and v.user_id = fp.user_id and v.week = fp.week and v.day = fp.day
                                 and v.last_at <= now() - interval '3 minutes'
        where fp.party_id = p.id and fp.week = v_week and fp.day = v_day)
      select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, c.names || ' doubted your reading.', 'fire-doubt'
      from c where c.names is not null and public.notify_once(p.id, 'doubted ' || c.user_id, v_week, v_day)
        and public.notify_once(p.id, 'fireone ' || c.user_id, v_week, v_day);
      -- A friend changed sides (never to which), to friends who have pinned.
      insert into public.push_outbox (user_id, party_id, title, body, tag)
      with c as materialized (
        select th.id, th.body, fp.user_id from public.fire_thread th
        join public.fire_pins fp on fp.party_id = th.party_id and fp.week = th.week and fp.day = th.day and fp.user_id <> th.user_id
        join public.fire_visits v on v.party_id = fp.party_id and v.user_id = fp.user_id and v.week = fp.week and v.day = fp.day
                                 and v.last_at <= now() - interval '3 minutes'
        where th.party_id = p.id and th.week = v_week and th.day = v_day and th.kind = 'changed')
      select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, c.body, 'fire-side'
      from c where public.notify_once(p.id, 'side ' || c.id || ' ' || c.user_id, v_week, v_day)
        and public.notify_once(p.id, 'fireone ' || c.user_id, v_week, v_day);
      -- The table is waiting for your piece (24 Oct, Phase 2 part 6): once a night, outside the one-alert limit, to a
      -- friend who has not come to tonight's fire while one half of a click's pair is on the table and the other is not.
      if exists (
        select 1 from jsonb_array_elements(coalesce(public.campfire_data(p.id, v_week, v_day) -> 'clicks', '[]'::jsonb)) with ordinality ck(c, i)
        where not exists (select 1 from public.fire_clicks k where k.party_id = p.id and k.week = v_week and k.day = v_day and k.idx = ck.i)
          and (exists (select 1 from public.fan_outs f where f.party_id = p.id and f.week = v_week and f.day = v_day and f.lead_id = ck.c ->> 'a')
               <> exists (select 1 from public.fan_outs f where f.party_id = p.id and f.week = v_week and f.day = v_day and f.lead_id = ck.c ->> 'b'))) then
        insert into public.push_outbox (user_id, party_id, title, body, tag)
        with c as materialized (
          select pm.user_id from public.party_members pm
          where pm.party_id = p.id and pm.status = 'approved' and pm.session_zero_done_at is not null
            and not public.is_late_day1(p.id, pm.user_id)
            and not exists (select 1 from public.fan_outs f where f.party_id = p.id and f.user_id = pm.user_id and f.week = v_week and f.day = v_day))
        select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, 'The table is waiting for your piece.', 'fire-piece'
        from c where public.notify_once(p.id, 'piece ' || c.user_id, v_week, v_day);
      end if;

      -- Last call, from 8:00pm: a friend whose fire is open and who has not pinned.
      if v_local::time >= time '20:00' then
        insert into public.push_outbox (user_id, party_id, title, body, tag)
        with c as materialized (
          select pm.user_id from public.party_members pm
          join public.fan_outs f on f.party_id = pm.party_id and f.user_id = pm.user_id and f.week = v_week and f.day = v_day
          where pm.party_id = p.id and pm.status = 'approved'
            and not exists (select 1 from public.fire_pins fp where fp.party_id = p.id and fp.user_id = pm.user_id and fp.week = v_week and fp.day = v_day)
            and not exists (select 1 from public.fire_visits h where h.party_id = p.id and h.user_id = pm.user_id
                            and h.week = v_week and h.day = v_day and h.last_at > now() - interval '3 minutes'))
        select c.user_id, p.id, 'Tales of the Dark Moon · ' || p.name, 'Last call: the fire''s call closes at dawn, and you haven''t pinned.', 'fire-lastcall'
        from c where public.notify_once(p.id, 'lastcall ' || c.user_id, v_week, v_day)
        and public.notify_once(p.id, 'fireone ' || c.user_id, v_week, v_day);
      end if;
    end if;
  end loop;
  return v_n;
end;
$function$;
