-- The Campfire online (canon docs/canon/mythios-campfire-table-v2.md v2.3; the approved design
-- docs/design/fan-out-and-campfire-proposal.md, "the last light" and "a fire you sit at, not a form").
-- - Fan Out: after the day's chapter, one lead (one quick Challenge in its own verb, the week's DC; the clue always comes
--   back, a pass adds the first-letter hint for one fragment word; no gold, no growth), or straight to the fire.
-- - The fire opens for a friend only after their own day (v2.3 §D). Stored text only; Garrick never grades a theory.
-- - Tonight's question (A / B / Neither, and your own line), pin before peek; a dated week line ("the case so far");
--   the fragment's meaning pin once both words are found; a message in a bottle; a question pin; the riddle
--   (shared, three tries each); cup nights; up to two "he notices" lines; what we did today; the Pull.
-- - Everything is keyed to today on the party's clock, so it closes at the 5:00am dawn cutoff.
-- Additive: new tables and new functions only.

-- Each weekday's Campfire, generated from canon (scripts/gen-campfire-sql.ts). Players never read it directly.
create table public.campfire_days (
  series_id text not null references public.series (id),
  season_number int not null,
  week int not null,
  day int not null,
  data jsonb not null,
  primary key (series_id, season_number, week, day)
);
alter table public.campfire_days enable row level security;
revoke all on public.campfire_days from anon, authenticated;

-- A friend's Fan Out: the lead followed and its roll, or straight to the fire (lead_id null).
create table public.fan_outs (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  lead_id text,
  roll jsonb,
  hint int, -- the fragment word (1 or 2) whose first letter the friend now knows
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

-- Who has sat at the fire tonight, and when they were last there ("at the fire now").
create table public.fire_visits (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

-- Tonight's question: one reading per friend per day, with an optional line in their own words. Editable until dawn.
create table public.fire_pins (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  reading text not null check (reading in ('A', 'B', 'NEITHER')),
  line text check (char_length(line) <= 140),
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

-- One-line notes at the fire: a message in a bottle, a question pin, the fragment's meaning pin, the week line
-- (kept per day, so the Gathering can show how a theory changed). One of each kind per friend per day.
create table public.fire_notes (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  kind text not null check (kind in ('bottle', 'question', 'meaning', 'week')),
  body text not null check (char_length(body) between 1 and 200),
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day, kind),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

-- The riddle: one per evening for the whole fire; the first right answer solves it for all; three tries each.
create table public.fire_riddles (
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null,
  day int not null,
  solved_by uuid references public.profiles (id) on delete set null,
  solved_at timestamptz not null default now(),
  primary key (party_id, week, day)
);
create table public.fire_riddle_tries (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  wrong int not null default 0,
  gave_up boolean not null default false,
  primary key (party_id, user_id, week, day),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

alter table public.fan_outs enable row level security;
alter table public.fire_visits enable row level security;
alter table public.fire_pins enable row level security;
alter table public.fire_notes enable row level security;
alter table public.fire_riddles enable row level security;
alter table public.fire_riddle_tries enable row level security;
revoke all on public.fan_outs, public.fire_visits, public.fire_pins, public.fire_notes, public.fire_riddles,
  public.fire_riddle_tries from anon, authenticated;

-- Today's Campfire data for a party.
create function public.campfire_data(p_party uuid, p_week int, p_day int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select c.data from public.campfire_days c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = p_week and c.day = p_day;
$$;

-- When a party's day (week, day) opened: 5:00am on the party's clock.
create function public.party_day_start(p_party uuid, p_week int, p_day int) returns timestamptz
language sql stable security definer set search_path = '' as $$
  select ((((p.day1_opens_at at time zone p.time_zone) - interval '5 hours')::date + ((p_week - 1) * 7 + p_day - 1))
          + time '05:00') at time zone p.time_zone
  from public.parties p where p.id = p_party;
$$;

-- The caller's day today, if it is a weekday they have finished (the fire opens only then, v2.3 §D).
create function public.my_fire_day(p_party uuid, out o_week int, out o_day int)
language plpgsql security definer set search_path = '' as $$
begin
  select t.o_week, t.o_day into o_week, o_day from public.my_today_row(p_party) t;
  if o_day > 6 then raise exception 'no fire tonight'; end if;
  if not exists (select 1 from public.member_days where party_id = p_party and user_id = auth.uid()
                 and week = o_week and day = o_day and finished_at is not null) then
    raise exception 'finish your day first';
  end if;
end;
$$;

-- Fan Out: follow one lead (Core Rules §3 roll: d20 + tier bonus − the week's DC; success at 1 or more).
-- The clue always comes back; a pass gives the first letter of the lead's fragment word. No gold, no growth.
create function public.fan_out_roll(p_party uuid, p_lead text, p_attr text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_lead jsonb; v_dc int; v_score int; v_bonus int; v_d20 int; v_net int; v_pass boolean;
        v_roll jsonb; v_word text;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'already chosen';
  end if;
  select l into v_lead from jsonb_array_elements(public.campfire_data(p_party, v_week, v_day) -> 'leads') l where l ->> 'id' = p_lead;
  if v_lead is null or not exists (select 1 from jsonb_array_elements(v_lead -> 'actions') a where a ->> 'attr' = p_attr) then
    raise exception 'not tonight''s lead';
  end if;
  v_dc := (public.today_meta(p_party, v_week, v_day) ->> 'dc')::int;
  select (attrs ->> p_attr)::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_bonus := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_net := v_d20 + v_bonus - v_dc;
  v_pass := v_net >= 1;
  v_roll := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'd20', v_d20, 'dc', v_dc, 'net', v_net, 'pass', v_pass);
  insert into public.fan_outs (party_id, user_id, week, day, lead_id, roll, hint)
  values (p_party, auth.uid(), v_week, v_day, p_lead, v_roll, case when v_pass then (v_lead ->> 'hintFor')::int end);
  return public.campfire(p_party);
end;
$$;

-- Straight to the fire, with no lead.
create function public.fan_out_fire(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  insert into public.fan_outs (party_id, user_id, week, day) values (p_party, auth.uid(), v_week, v_day) on conflict do nothing;
  return public.campfire(p_party);
end;
$$;

-- The fire as the caller sees it tonight. Marks the caller as at the fire once they have chosen their Fan Out.
create function public.campfire(p_party uuid) returns jsonb
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
    'myFanOut', jsonb_build_object('lead', v_fan.lead_id, 'roll', v_fan.roll, 'hint', v_fan.hint,
      'letter', case v_fan.hint when 1 then upper(left(v_frag.word1, 1)) when 2 then upper(left(v_frag.word2, 1)) end,
      'lateLine', (select l -> 'lateLine' from jsonb_array_elements(v_data -> 'leads') l where l ->> 'id' = v_fan.lead_id)),
    -- The board: one card per lead with every finder's name; a lead nobody took shows only its place.
    'board', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place',
                'finders', (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                            join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                            where f.party_id = p_party and f.week = v_week and f.day = v_day and f.lead_id = l ->> 'id'
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

-- Tonight's question: A, B or Neither, and an optional line in your own words; editable until dawn.
-- The first pin of the day posts one line in the party chat (the approved design, §3.5). On Week 1 Day 1 the party
-- has not met: the pin is a private note and becomes the friend's first week line.
create function public.pin_theory(p_party uuid, p_reading text, p_line text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_first boolean; v_name text; v_line text := nullif(btrim(coalesce(p_line, '')), '');
        v_data jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if p_reading not in ('A', 'B', 'NEITHER') then raise exception 'not a reading'; end if;
  v_first := not exists (select 1 from public.fire_pins where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day);
  insert into public.fire_pins (party_id, user_id, week, day, reading, line) values (p_party, auth.uid(), v_week, v_day, p_reading, left(v_line, 140))
  on conflict (party_id, user_id, week, day) do update set reading = excluded.reading, line = excluded.line, at = now();
  v_data := public.campfire_data(p_party, v_week, v_day);
  if coalesce((v_data ->> 'narrated')::boolean, false) then
    insert into public.fire_notes (party_id, user_id, week, day, kind, body)
    values (p_party, auth.uid(), v_week, v_day, 'week',
            left(coalesce(v_line, case p_reading when 'A' then v_data ->> 'forkA' when 'B' then v_data ->> 'forkB' else 'Neither.' end), 200))
    on conflict do nothing;
  elsif v_first then
    select character_name into v_name from public.party_members where party_id = p_party and user_id = auth.uid();
    insert into public.party_messages (party_id, kind, body) values (p_party, 'notice', v_name || ' pinned a theory.');
  end if;
  return public.campfire(p_party);
end;
$$;

-- A one-line note at the fire: 'bottle', 'question', 'meaning' (once both fragment words are found) or 'week'.
create function public.leave_note(p_party uuid, p_kind text, p_body text) returns jsonb
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

-- The riddle (v2.3 §G, §M): the answer or a listed variant, ignoring case, spaces and a leading "a", "an" or "the".
create function public.riddle_guess(p_party uuid, p_guess text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_riddle jsonb; v_tries public.fire_riddle_tries; v_norm text; v_ok boolean;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  v_riddle := public.campfire_data(p_party, v_week, v_day) -> 'riddle';
  if v_riddle is null or v_riddle = 'null'::jsonb then raise exception 'no riddle tonight'; end if;
  if exists (select 1 from public.fire_riddles where party_id = p_party and week = v_week and day = v_day) then
    return public.campfire(p_party);
  end if;
  select * into v_tries from public.fire_riddle_tries where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if coalesce(v_tries.gave_up, false) or coalesce(v_tries.wrong, 0) >= (v_riddle ->> 'maxTries')::int then
    raise exception 'no tries left';
  end if;
  v_norm := regexp_replace(regexp_replace(lower(btrim(coalesce(p_guess, ''))), '[^a-z ]', '', 'g'), '^(a|an|the) ', '');
  select exists (select 1 from jsonb_array_elements_text(v_riddle -> 'accept') a
                 where regexp_replace(lower(a), '^(a|an|the) ', '') = v_norm) into v_ok;
  if v_ok then
    insert into public.fire_riddles (party_id, week, day, solved_by) values (p_party, v_week, v_day, auth.uid()) on conflict do nothing;
  else
    insert into public.fire_riddle_tries (party_id, user_id, week, day, wrong) values (p_party, auth.uid(), v_week, v_day, 1)
    on conflict (party_id, user_id, week, day) do update set wrong = public.fire_riddle_tries.wrong + 1;
  end if;
  return public.campfire(p_party) || jsonb_build_object('riddleRight', v_ok);
end;
$$;
create function public.riddle_give_up(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  insert into public.fire_riddle_tries (party_id, user_id, week, day, gave_up) values (p_party, auth.uid(), v_week, v_day, true)
  on conflict (party_id, user_id, week, day) do update set gave_up = true;
  return public.campfire(p_party);
end;
$$;

revoke execute on function public.campfire_data, public.party_day_start, public.my_fire_day from public, anon, authenticated;
revoke execute on function public.fan_out_roll, public.fan_out_fire, public.campfire, public.pin_theory, public.leave_note,
  public.riddle_guess, public.riddle_give_up from public, anon;
grant execute on function public.fan_out_roll, public.fan_out_fire, public.campfire, public.pin_theory, public.leave_note,
  public.riddle_guess, public.riddle_give_up to authenticated;
