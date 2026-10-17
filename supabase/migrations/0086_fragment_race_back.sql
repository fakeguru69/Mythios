-- Fake Guru, 17 Oct ("C"): the fragment race comes back. The first friend to find a word fills it in for the whole
-- party and takes its 25g; until the fragment's own day ends a friend may fill only one of its two words (Core Rules §6,
-- as before 0083). seeker_chest, solve_word and leave_note are back to their 0019 / 0024 bodies; campfire keeps 0083's
-- last-light glimpse (C4) and reads the party's words again. member_words stays (nothing is removed) and is no longer
-- written or read.

create or replace function public.seeker_chest(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  -- At the end of each week's Day 6, its unsolved words complete themselves (no gold, no name).
  insert into public.fragment_words (party_id, fragment_id, slot, solved_by)
  select p_party, f.id, s.slot, null
  from public.fragments f cross join (values (1), (2)) s(slot)
  where f.series_id = v_series and f.season_number = v_season and (f.week < v_week or (f.week = v_week and v_day = 7))
  on conflict do nothing;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', f.id, 'week', f.week, 'day', f.day, 'place', f.place_label, 'template', f.template,
    'today', f.week = v_week and f.day = v_day,
    'slots', (select jsonb_agg(jsonb_build_object(
        'slot', s.slot,
        'jumble', case when s.slot = 1 then to_jsonb(f.jumble1) else to_jsonb(f.jumble2) end,
        'word', case when w.slot is not null then (case when s.slot = 1 then f.word1 else f.word2 end) end,
        'solver', case when w.solved_by is not null then (select m.character_name from public.party_members m
                                                           where m.party_id = p_party and m.user_id = w.solved_by) end,
        'mine', w.solved_by = auth.uid(),
        'auto', w.slot is not null and w.solved_by is null,
        'waitUntil', (select t.wait_until from public.fragment_tries t where t.party_id = p_party and t.user_id = auth.uid()
                      and t.fragment_id = f.id and t.slot = s.slot and t.wait_until > now())
      ) order by s.slot)
      from (values (1), (2)) s(slot)
      left join public.fragment_words w on w.party_id = p_party and w.fragment_id = f.id and w.slot = s.slot)
  ) order by f.week, f.day), '[]'::jsonb)
  into r
  from public.fragments f
  where f.series_id = v_series and f.season_number = v_season and (f.week < v_week or (f.week = v_week and f.day <= v_day));
  return jsonb_build_object('week', v_week, 'day', v_day, 'fragments', r,
    'mySolved', (select count(*) from public.fragment_words w where w.party_id = p_party and w.solved_by = auth.uid()));
end;
$$;

create or replace function public.solve_word(p_party uuid, p_fragment text, p_slot int, p_guess text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_f public.fragments; v_word text; v_tries public.fragment_tries; v_name text;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select f.* into v_f from public.fragments f join public.parties p on p.series_id = f.series_id and p.season_number = f.season_number
  where p.id = p_party and f.id = p_fragment and (f.week < v_week or (f.week = v_week and f.day <= v_day));
  if v_f.id is null or p_slot not in (1, 2) then raise exception 'no such fragment'; end if;
  if exists (select 1 from public.fragment_words where party_id = p_party and fragment_id = p_fragment and slot = p_slot) then
    return jsonb_build_object('ok', false, 'taken', true);
  end if;
  select * into v_tries from public.fragment_tries where party_id = p_party and user_id = auth.uid() and fragment_id = p_fragment and slot = p_slot;
  if v_tries.wait_until is not null and v_tries.wait_until > now() then
    return jsonb_build_object('ok', false, 'waitUntil', v_tries.wait_until);
  end if;
  -- One word per friend until the fragment's own day ends.
  if v_f.week = v_week and v_f.day = v_day and exists (
    select 1 from public.fragment_words where party_id = p_party and fragment_id = p_fragment and solved_by = auth.uid()) then
    return jsonb_build_object('ok', false, 'oneToday', true);
  end if;
  v_word := case when p_slot = 1 then v_f.word1 else v_f.word2 end;
  if lower(btrim(coalesce(p_guess, ''))) <> lower(v_word) then
    insert into public.fragment_tries (party_id, user_id, fragment_id, slot, wrong) values (p_party, auth.uid(), p_fragment, p_slot, 1)
    on conflict (party_id, user_id, fragment_id, slot) do update
      set wrong = case when public.fragment_tries.wrong + 1 >= 5 then 0 else public.fragment_tries.wrong + 1 end,
          wait_until = case when public.fragment_tries.wrong + 1 >= 5 then now() + interval '2 minutes' else null end;
    return jsonb_build_object('ok', false,
      'waitUntil', (select wait_until from public.fragment_tries where party_id = p_party and user_id = auth.uid() and fragment_id = p_fragment and slot = p_slot));
  end if;
  insert into public.fragment_words (party_id, fragment_id, slot, solved_by) values (p_party, p_fragment, p_slot, auth.uid())
  on conflict do nothing;
  if not found then return jsonb_build_object('ok', false, 'taken', true); end if; -- the first to arrive gets it
  update public.member_progress set gold = gold + 25 where party_id = p_party and user_id = auth.uid();
  select character_name into v_name from public.party_members where party_id = p_party and user_id = auth.uid();
  insert into public.party_messages (party_id, kind, body)
  values (p_party, 'notice', v_name || ' found a missing word in the Week ' || v_f.week || ', Day ' || v_f.day || ' fragment.');
  return jsonb_build_object('ok', true, 'word', v_word);
end;
$$;

create or replace function public.leave_note(p_party uuid, p_kind text, p_body text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_body text := btrim(coalesce(p_body, ''));
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if p_kind not in ('bottle', 'question', 'meaning', 'week') then raise exception 'not a note'; end if;
  if v_body = '' then raise exception 'write a line first'; end if;
  if p_kind = 'meaning' and (select count(*) from public.fragment_words where party_id = p_party and fragment_id = v_week || '-' || v_day) < 2 then
    raise exception 'not yet';
  end if;
  insert into public.fire_notes (party_id, user_id, week, day, kind, body) values (p_party, auth.uid(), v_week, v_day, p_kind, left(v_body, 200))
  on conflict (party_id, user_id, week, day, kind) do update set body = excluded.body, at = now();
  return public.campfire(p_party);
end;
$$;

-- The fire: the party's words again; the last light's glimpse (C4) stays.
create or replace function public.campfire(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_data jsonb; v_me uuid := auth.uid(); v_fan public.fan_outs; v_frag public.fragments;
        v_series text; v_season int; v_start timestamptz; v_narrated boolean; v_mine_pin public.fire_pins;
        v_members jsonb; v_riddle jsonb; v_tries public.fire_riddle_tries; v_solved public.fire_riddles; v_show_answer boolean;
        v_notice jsonb := '[]'::jsonb; v_named uuid[] := '{}'; v_cand record; v_nudge text; v_attr text; v_best text;
        v_at_fire int; v_words int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  v_data := public.campfire_data(p_party, v_week, v_day);
  v_narrated := coalesce((v_data ->> 'narrated')::boolean, false);
  select * into v_fan from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select * into v_frag from public.fragments where series_id = v_series and season_number = v_season and id = v_week || '-' || v_day;
  v_start := public.party_day_start(p_party, v_week, v_day);

  -- Not chosen yet: the last light only (the leads, without their clues).
  if v_fan.user_id is null then
    return jsonb_build_object('week', v_week, 'day', v_day, 'place', v_data -> 'place', 'narrated', v_narrated,
      'chosen', false,
      'leads', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place', 'actions', l -> 'actions'))
                from jsonb_array_elements(v_data -> 'leads') l),
      'progress', (select jsonb_build_object('attrs', attrs) from public.member_progress where party_id = p_party and user_id = v_me),
      'dc', (public.today_meta(p_party, v_week, v_day) ->> 'dc')::int);
  end if;

  insert into public.fire_visits (party_id, user_id, week, day) values (p_party, v_me, v_week, v_day)
  on conflict (party_id, user_id, week, day) do update set last_at = now();
  select * into v_mine_pin from public.fire_pins where party_id = p_party and user_id = v_me and week = v_week and day = v_day;

  -- The party, in party-list order, with what each did today.
  select jsonb_agg(jsonb_build_object(
      'id', m.user_id, 'name', m.character_name, 'me', m.user_id = v_me,
      'visitedAt', v.first_at, 'here', v.last_at > now() - interval '3 minutes',
      'finished', md.finished_at is not null,
      'passed', coalesce((md.challenge ->> 'pass')::boolean, false),
      'scraped', coalesce((md.fight ->> 'done')::boolean, false) and not coalesce((md.fight ->> 'won')::boolean, false),
      'lead', f.lead_id,
      'gaveTo', (select string_agg(coalesce(tm.character_name, 'a friend'), ', ') from public.relic_gifts g
                 left join public.party_members tm on tm.party_id = p_party and tm.user_id = g.to_user
                 where g.party_id = p_party and g.from_user = m.user_id and g.given_at >= v_start),
      'words', (select count(*) from public.fragment_words w where w.party_id = p_party and w.fragment_id = v_week || '-' || v_day
                and w.solved_by = m.user_id),
      'missedYesterday', v_day > 1 and md.finished_at is not null and not exists (
                 select 1 from public.member_days y where y.party_id = p_party and y.user_id = m.user_id
                 and y.week = v_week and y.day = v_day - 1 and y.finished_at is not null)
    ) order by (m.user_id = p.host_id) desc, m.session_zero_done_at nulls last, m.joined_at) into v_members
  from public.party_members m
  join public.parties p on p.id = m.party_id
  left join public.fire_visits v on v.party_id = m.party_id and v.user_id = m.user_id and v.week = v_week and v.day = v_day
  left join public.member_days md on md.party_id = m.party_id and md.user_id = m.user_id and md.week = v_week and md.day = v_day
  left join public.fan_outs f on f.party_id = m.party_id and f.user_id = m.user_id and f.week = v_week and f.day = v_day
  where m.party_id = p_party and m.status = 'approved' and m.session_zero_done_at is not null;

  -- He notices people (v2.3 §C): at most two true lines, two different friends, in this order.
  if not v_narrated then
    for v_cand in
      select 'bruisedScrape' k, (x ->> 'id')::uuid id, x ->> 'name' n, 1 o from jsonb_array_elements(v_members) x where (x ->> 'scraped')::boolean
      union all
      select 'solvedFragmentFirst', w.solved_by, m.character_name, 2 from (
        select solved_by from public.fragment_words where party_id = p_party and fragment_id = v_week || '-' || v_day and solved_by is not null
        order by solved_at limit 1) w join public.party_members m on m.party_id = p_party and m.user_id = w.solved_by
      union all
      select 'lentRelic', (x ->> 'id')::uuid, x ->> 'name', 3 from jsonb_array_elements(v_members) x where x ->> 'gaveTo' is not null
      union all
      select 'backAfterMissedDay', (x ->> 'id')::uuid, x ->> 'name', 4 from jsonb_array_elements(v_members) x where (x ->> 'missedYesterday')::boolean
      union all
      select 'notYetArrived', (x ->> 'id')::uuid, x ->> 'name', 5 from jsonb_array_elements(v_members) x where x ->> 'visitedAt' is null
      order by 4
    loop
      exit when jsonb_array_length(v_notice) >= 2;
      if not v_cand.id = any (v_named) then
        v_notice := v_notice || jsonb_build_object('kind', v_cand.k, 'name', v_cand.n);
        v_named := v_named || v_cand.id;
      end if;
    end loop;
  end if;

  -- The nudge (v2.3 §M): the friend at the fire tonight with the highest of the named Attribute; alone, no name.
  v_attr := substring(v_data ->> 'nudge' from '\{friend:([A-Za-z]+)\}');
  select count(*) into v_at_fire from public.fire_visits where party_id = p_party and week = v_week and day = v_day;
  if v_attr is not null then
    if v_at_fire <= 1 or v_narrated then
      v_nudge := regexp_replace(v_data ->> 'nudge', '\{friend:[A-Za-z]+\},?\s*', '');
      v_nudge := upper(left(v_nudge, 1)) || substr(v_nudge, 2);
    else
      select m.character_name into v_best from public.fire_visits v
      join public.member_progress mp on mp.party_id = v.party_id and mp.user_id = v.user_id
      join public.party_members m on m.party_id = v.party_id and m.user_id = v.user_id
      where v.party_id = p_party and v.week = v_week and v.day = v_day
      order by (mp.attrs ->> v_attr)::int desc, v.first_at limit 1;
      v_nudge := regexp_replace(v_data ->> 'nudge', '\{friend:[A-Za-z]+\}', coalesce(v_best, 'someone'), 'g');
    end if;
  end if;

  -- The riddle: the answer and Garrick's reply only once it is solved, or the caller is out of tries or gave up.
  if v_data -> 'riddle' <> 'null'::jsonb then
    select * into v_solved from public.fire_riddles where party_id = p_party and week = v_week and day = v_day;
    select * into v_tries from public.fire_riddle_tries where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
    v_show_answer := v_solved.party_id is not null or coalesce(v_tries.gave_up, false)
                     or coalesce(v_tries.wrong, 0) >= (v_data -> 'riddle' ->> 'maxTries')::int;
    v_riddle := jsonb_build_object('q', v_data -> 'riddle' -> 'q', 'maxTries', v_data -> 'riddle' -> 'maxTries',
      'wrong', coalesce(v_tries.wrong, 0), 'gaveUp', coalesce(v_tries.gave_up, false),
      'solvedBy', (select character_name from public.party_members where party_id = p_party and user_id = v_solved.solved_by),
      'solved', v_solved.party_id is not null,
      'answer', case when v_show_answer then v_data -> 'riddle' -> 'a' end,
      'quip', case when v_show_answer then v_data -> 'riddle' -> 'quip' end);
  end if;

  select count(*) into v_words from public.fragment_words where party_id = p_party and fragment_id = v_week || '-' || v_day;

  select jsonb_build_object(
    'week', v_week, 'day', v_day, 'chosen', true,
    'place', v_data -> 'place', 'narrated', v_narrated, 'tone', v_data -> 'tone', 'cupNight', v_data -> 'cupNight',
    'opener', v_data -> 'opener', 'forkA', v_data -> 'forkA', 'forkB', v_data -> 'forkB', 'callback', v_data -> 'callback',
    'nudge', v_nudge, 'riddle', v_riddle, 'pull', v_data -> 'pull',
    'members', v_members,
    'firstHere', not exists (select 1 from public.fire_visits where party_id = p_party and week = v_week and day = v_day
                             and user_id <> v_me and first_at < (select first_at from public.fire_visits where party_id = p_party
                             and user_id = v_me and week = v_week and day = v_day)),
    'myFanOut', jsonb_build_object('lead', v_fan.lead_id, 'roll', v_fan.roll, 'hint', v_fan.hint, 'glimpse', v_fan.roll ->> 'glimpse',
      'letter', case v_fan.hint when 1 then upper(left(v_frag.word1, 1)) when 2 then upper(left(v_frag.word2, 1)) end,
      'lateLine', (select l -> 'lateLine' from jsonb_array_elements(v_data -> 'leads') l where l ->> 'id' = v_fan.lead_id)),
    -- The board: one card per lead with every finder's name; a lead nobody took shows only its place.
    'board', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place',
                'finders', (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                            join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                            where f.party_id = p_party and f.week = v_week and f.day = v_day and f.lead_id = l ->> 'id'
                              and (not v_narrated or f.user_id = v_me)),
                -- C4: friends whose pass at the last light also showed them this lead.
                'glimpsedBy', (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                            join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                            where f.party_id = p_party and f.week = v_week and f.day = v_day and f.roll ->> 'glimpse' = l ->> 'id'
                              and (not v_narrated or f.user_id = v_me)),
                'clueTitle', l -> 'clueTitle', 'clueText', l -> 'clueText'))
              from jsonb_array_elements(v_data -> 'leads') l),
    -- Tonight's question: names under each reading, never a count or a winner; others' pins only after your own (§D).
    'myPin', case when v_mine_pin.user_id is not null then jsonb_build_object('reading', v_mine_pin.reading, 'line', v_mine_pin.line) end,
    'pins', (select coalesce(jsonb_agg(jsonb_build_object('name', m.character_name, 'reading', fp.reading, 'line', fp.line) order by fp.at desc), '[]'::jsonb)
             from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
             where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and fp.user_id <> v_me
               and v_mine_pin.user_id is not null and not v_narrated),
    -- The catch-up line on arrival (v2.3 §M): at most two earlier friends, newest first.
    'catchUp', (select coalesce(jsonb_agg(jsonb_build_object('name', x.n, 'reading', x.reading)), '[]'::jsonb) from (
                 select m.character_name n, fp.reading from public.fire_pins fp
                 join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
                 where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and fp.user_id <> v_me and not v_narrated
                 order by fp.at desc limit 2) x),
    'pinCount', (select count(*) from public.fire_pins where party_id = p_party and week = v_week and day = v_day and user_id <> v_me),
    -- Day 6: two pins from the week, read by name (v2.3 §E).
    'weekPins', case when v_day = 6 then (select coalesce(jsonb_agg(jsonb_build_object('name', x.n, 'day', x.day, 'reading', x.reading, 'week', v_week)), '[]'::jsonb) from (
                 select m.character_name n, fp.day, fp.reading from public.fire_pins fp
                 join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
                 where fp.party_id = p_party and fp.week = v_week and fp.day < 6 order by fp.at desc limit 2) x) end,
    'weekForks', case when v_day = 6 then (select jsonb_object_agg(c.day, jsonb_build_object('A', c.data -> 'forkA', 'B', c.data -> 'forkB'))
                 from public.campfire_days c where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day < 6) end,
    'notes', (select coalesce(jsonb_agg(jsonb_build_object('kind', n.kind, 'name', m.character_name, 'body', n.body, 'mine', n.user_id = v_me, 'day', n.day)
                order by n.at desc), '[]'::jsonb)
              from public.fire_notes n join public.party_members m on m.party_id = n.party_id and m.user_id = n.user_id
              where n.party_id = p_party and n.week = v_week and (not v_narrated or n.user_id = v_me)
                and (n.day = v_day or (n.kind = 'week' and n.day = (select max(n2.day) from public.fire_notes n2 where n2.party_id = p_party
                     and n2.user_id = n.user_id and n2.week = v_week and n2.kind = 'week')))),
    'fragment', jsonb_build_object('words', v_words,
      'text', case when v_words >= 2 then replace(replace(v_frag.template, '{0}', v_frag.word1), '{1}', v_frag.word2) end,
      'solvers', (select coalesce(jsonb_agg(m.character_name order by w.solved_at), '[]'::jsonb) from public.fragment_words w
                  join public.party_members m on m.party_id = w.party_id and m.user_id = w.solved_by
                  where w.party_id = p_party and w.fragment_id = v_week || '-' || v_day),
      'hintOpen', v_fan.hint is not null and not exists (select 1 from public.fragment_words where party_id = p_party
                  and fragment_id = v_week || '-' || v_day and slot = v_fan.hint)),
    'meaningQuestion', v_data -> 'meaningQuestion', 'weekQuestion', v_data -> 'weekQuestion',
    'noticings', v_notice,
    'atFire', v_at_fire
  ) into r;
  return r;
end;
$$;
