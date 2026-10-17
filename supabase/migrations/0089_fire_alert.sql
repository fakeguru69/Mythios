-- Notifications (Fake Guru, 17 Oct): "remove the limit of app notification. It's not a nag, it's a feature" and "the
-- campfire is the place for the players to interact in a day ... a prompt that someone has entered the campfire is a good
-- feature". notify_due as in 0083, plus the fire alert. (The daily cap was a rule in Core Rules only; no code enforced it.)
create or replace function public.notify_due() returns int
language plpgsql security definer set search_path = '' as $$
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
        select pm.user_id, p.id, 'Tales of the Dark Moon · ' || p.name,
               v_names || case when exists (select 1 from public.member_days md where md.party_id = p.id and md.user_id = pm.user_id
                                            and md.week = v_week and md.day = v_day and md.finished_at is not null)
                               then '' else ' Your day is still waiting.' end,
               'fire'
        from public.party_members pm
        where pm.party_id = p.id and pm.status = 'approved' and pm.session_zero_done_at is not null
          and not (pm.user_id = any (v_arrived))
          and not exists (select 1 from public.fire_visits h where h.party_id = p.id and h.user_id = pm.user_id
                          and h.week = v_week and h.day = v_day and h.last_at > now() - interval '3 minutes')
          and not public.is_late_day1(p.id, pm.user_id);
      end if;
    end if;
  end loop;
  return v_n;
end;
$$;
