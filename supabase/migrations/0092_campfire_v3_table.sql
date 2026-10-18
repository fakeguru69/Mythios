-- The Campfire, version 3, Phase 1 (Fake Guru, 17-18 Oct: "yes" to the redesign, then "Go";
-- docs/design/campfire-v3-17oct.md). The mechanics, on today's content:
-- * The table: every piece a friend brings, with their names. A last-light find goes down by itself (fan_outs);
--   a Notice line (fire_shares, 0079), the pass lines and the [PRESS ON] find are laid with one tap each.
-- * Agree or doubt any friend's piece or reading, with one tap (tap again to take it back).
-- * The fire's own thread: friends' messages at the fire, and short event lines (a piece laid, a pin, a change of
--   side, a click), in time order.
-- * Tonight's question: pins stay secret until your own (pin before peek); a change of reading posts
--   "Dev changed sides.", never to which side.
-- * Clicks: when two pieces that belong together are both on the table, laid by different friends, MYTHIOS states
--   once what they show together. The pairs come with each night's content (Phase 2): campfire_days.data -> 'clicks'.
-- * The party's call at dawn: once a day has ended, the reading most friends pinned, or "split", or no call; names,
--   never counts. Shown at the next fire and in the casebook.
-- * The casebook: each night of a week, its readings, pieces, clicks and call.
-- Additive: new tables and new functions; pin_theory is replaced in place (same shape).
-- Applied live 18 Oct in two parts (tables and helpers, then the fire's functions); every function md5-checked.

create table public.fire_laid (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  kind text not null check (kind in ('pass', 'press')),
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day, kind),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

create table public.fire_reactions (
  party_id uuid not null,
  user_id uuid not null,
  week int not null,
  day int not null,
  target text not null,
  kind text not null check (kind in ('agree', 'doubt', 'none')),
  at timestamptz not null default now(),
  primary key (party_id, user_id, week, day, target),
  foreign key (party_id, user_id) references public.party_members (party_id, user_id) on delete cascade
);

create table public.fire_thread (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null,
  day int not null,
  user_id uuid,
  kind text not null check (kind in ('say', 'pinned', 'changed', 'click')),
  body text not null check (char_length(body) between 1 and 600),
  at timestamptz not null default now()
);
create index fire_thread_night on public.fire_thread (party_id, week, day, at);

create table public.fire_clicks (
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null,
  day int not null,
  idx int not null,
  names text[] not null,
  at timestamptz not null default now(),
  primary key (party_id, week, day, idx)
);

alter table public.fire_laid enable row level security;
alter table public.fire_reactions enable row level security;
alter table public.fire_thread enable row level security;
alter table public.fire_clicks enable row level security;
revoke all on public.fire_laid, public.fire_reactions, public.fire_thread, public.fire_clicks from anon, authenticated;

-- The pass-only lines of a day's chapter (what a friend who passed read), and its [PRESS ON] find.
create function public.fire_pass_text(p_party uuid, p_week int, p_day int) returns text
language sql stable security definer set search_path = '' as $$
  select string_agg(s ->> 'text', E'\n\n' order by o)
  from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  cross join lateral jsonb_array_elements(c.script -> 'steps') with ordinality x(s, o)
  where p.id = p_party and c.week = p_week and c.day = p_day and s ->> 't' = 'say'
    and s -> 'cond' ->> 'on' = 'challenge' and (s -> 'cond' ->> 'pass')::boolean;
$$;

create function public.fire_press_piece(p_party uuid, p_week int, p_day int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when public.today_step(p_party, p_week, p_day, 'press') is null then null else jsonb_build_object(
    'title', public.today_step(p_party, p_week, p_day, 'press') ->> 'title',
    'text', (select string_agg(s ->> 'text', E'\n\n' order by o)
             from public.chapters c join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
             cross join lateral jsonb_array_elements(c.script -> 'steps') with ordinality x(s, o)
             where p.id = p_party and c.week = p_week and c.day = p_day and s ->> 't' = 'say' and s -> 'cond' ->> 'on' = 'press'))
  end;
$$;

-- Every piece on a night's table: key, kind, title, text, and who laid it (user ids and names, in the order laid).
-- Keys: 'lead:<lead id>', 'notice:<user id>', 'pass', 'press'.
create function public.fire_pieces(p_party uuid, p_week int, p_day int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_data jsonb := public.campfire_data(p_party, p_week, p_day); v_press jsonb; v_out jsonb := '[]'::jsonb;
begin
  -- Last-light finds: one piece per lead, with every finder.
  select coalesce(jsonb_agg(x.item order by x.first_at), '[]'::jsonb) into v_out from (
    select min(f.at) first_at, jsonb_build_object('key', 'lead:' || (l ->> 'id'), 'kind', 'lead',
      'title', l ->> 'clueTitle', 'text', l ->> 'clueText', 'source', l ->> 'place',
      'by', jsonb_agg(jsonb_build_object('id', f.user_id, 'name', m.character_name) order by f.at), 'at', min(f.at)) item
    from jsonb_array_elements(v_data -> 'leads') l
    join public.fan_outs f on f.party_id = p_party and f.week = p_week and f.day = p_day and f.lead_id = l ->> 'id'
    join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
    group by l) x;
  -- Notice lines, each its friend's own.
  v_out := v_out || coalesce((select jsonb_agg(jsonb_build_object('key', 'notice:' || s.user_id, 'kind', 'notice',
      'title', 'What ' || m.character_name || ' noticed', 'attr', s.attr, 'text', s.body, 'source', s.attr,
      'by', jsonb_build_array(jsonb_build_object('id', s.user_id, 'name', m.character_name)), 'at', s.at) order by s.at)
    from public.fire_shares s join public.party_members m on m.party_id = s.party_id and m.user_id = s.user_id
    where s.party_id = p_party and s.week = p_week and s.day = p_day), '[]'::jsonb);
  -- The pass lines and the [PRESS ON] find: one piece each, with everyone who laid it.
  v_out := v_out || coalesce((select jsonb_agg(jsonb_build_object('key', 'pass', 'kind', 'pass',
      'title', 'What the passers heard', 'text', public.fire_pass_text(p_party, p_week, p_day), 'source', 'pass',
      'by', (select jsonb_agg(jsonb_build_object('id', l.user_id, 'name', m.character_name) order by l.at)
             from public.fire_laid l join public.party_members m on m.party_id = l.party_id and m.user_id = l.user_id
             where l.party_id = p_party and l.week = p_week and l.day = p_day and l.kind = 'pass'),
      'at', (select min(at) from public.fire_laid where party_id = p_party and week = p_week and day = p_day and kind = 'pass')))
    from (select 1) one
    where exists (select 1 from public.fire_laid where party_id = p_party and week = p_week and day = p_day and kind = 'pass')), '[]'::jsonb);
  v_press := public.fire_press_piece(p_party, p_week, p_day);
  v_out := v_out || coalesce((select jsonb_agg(jsonb_build_object('key', 'press', 'kind', 'press',
      'title', v_press ->> 'title', 'text', v_press ->> 'text', 'source', 'press',
      'by', (select jsonb_agg(jsonb_build_object('id', l.user_id, 'name', m.character_name) order by l.at)
             from public.fire_laid l join public.party_members m on m.party_id = l.party_id and m.user_id = l.user_id
             where l.party_id = p_party and l.week = p_week and l.day = p_day and l.kind = 'press'),
      'at', (select min(at) from public.fire_laid where party_id = p_party and week = p_week and day = p_day and kind = 'press')))
    from (select 1) one
    where v_press is not null
      and exists (select 1 from public.fire_laid where party_id = p_party and week = p_week and day = p_day and kind = 'press')), '[]'::jsonb);
  return v_out;
end;
$$;

-- Clicks: a pair of pieces both on the table, laid by different friends, states once what the two show together.
create function public.fire_check_clicks(p_party uuid, p_week int, p_day int) returns void
language plpgsql security definer set search_path = '' as $$
declare v_data jsonb := public.campfire_data(p_party, p_week, p_day); v_pieces jsonb; c jsonb; i int := 0;
        v_a jsonb; v_b jsonb; v_names text[]; v_ua text; v_ub text;
begin
  if jsonb_typeof(v_data -> 'clicks') <> 'array' or coalesce((v_data ->> 'narrated')::boolean, false) then return; end if;
  v_pieces := public.fire_pieces(p_party, p_week, p_day);
  for c in select * from jsonb_array_elements(v_data -> 'clicks') loop
    i := i + 1;
    continue when exists (select 1 from public.fire_clicks where party_id = p_party and week = p_week and day = p_day and idx = i);
    select p into v_a from jsonb_array_elements(v_pieces) p where p ->> 'key' = c ->> 'a' or (c ->> 'a' = 'notice' and p ->> 'kind' = 'notice' and p ->> 'attr' = c ->> 'aAttr');
    select p into v_b from jsonb_array_elements(v_pieces) p where p ->> 'key' = c ->> 'b';
    continue when v_a is null or v_b is null;
    -- Two different friends: some layer of one and some other layer of the other.
    select b1 ->> 'name', b2 ->> 'name' into v_ua, v_ub
    from jsonb_array_elements(v_a -> 'by') b1, jsonb_array_elements(v_b -> 'by') b2
    where b1 ->> 'id' <> b2 ->> 'id' limit 1;
    continue when v_ua is null;
    v_names := array[v_ua, v_ub];
    insert into public.fire_clicks (party_id, week, day, idx, names) values (p_party, p_week, p_day, i, v_names)
    on conflict do nothing;
    if found then
      insert into public.fire_thread (party_id, week, day, kind, body) values (p_party, p_week, p_day, 'click', c ->> 'text');
    end if;
  end loop;
end;
$$;

-- The party's call on a night, once that night is over (dawn, 5:00am): the reading most friends pinned, or a split,
-- or no call. Names under each reading, never counts.
create function public.fire_call(p_party uuid, p_week int, p_day int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_data jsonb := public.campfire_data(p_party, p_week, p_day); v_top int; v_tops text[]; v_backers jsonb;
begin
  if now() < public.party_day_start(p_party, p_week, p_day + 1) then return null; end if;
  select jsonb_object_agg(r.reading, r.names) into v_backers from (
    select fp.reading, jsonb_agg(m.character_name order by fp.at) names
    from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
    where fp.party_id = p_party and fp.week = p_week and fp.day = p_day group by fp.reading) r;
  select max(n) into v_top from (select count(*) n from public.fire_pins where party_id = p_party and week = p_week and day = p_day group by reading) x;
  select array_agg(reading order by reading) into v_tops from (
    select reading from public.fire_pins where party_id = p_party and week = p_week and day = p_day group by reading having count(*) = v_top) y;
  return jsonb_build_object('week', p_week, 'day', p_day,
    'forkA', v_data ->> 'forkA', 'forkB', v_data ->> 'forkB',
    'reading', case when coalesce(array_length(v_tops, 1), 0) = 1 then v_tops[1] end,
    'split', coalesce(array_length(v_tops, 1), 0) > 1,
    'backers', coalesce(v_backers, '{}'::jsonb),
    'lines', (select coalesce(jsonb_agg(jsonb_build_object('name', m.character_name, 'line', fp.line) order by fp.at), '[]'::jsonb)
              from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
              where fp.party_id = p_party and fp.week = p_week and fp.day = p_day and fp.line is not null));
end;
$$;

-- Everything the new fire screen needs beyond campfire(): the table, reactions, the thread, readings (after your own
-- pin), who has pinned, last night's call, and what is still in your hands.
create function public.fire_table(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_me uuid := auth.uid(); v_data jsonb; v_narrated boolean; v_pieces jsonb;
        v_mine_pin public.fire_pins; v_passed boolean; v_pressed boolean; v_notice jsonb; v_hands jsonb := '[]'::jsonb;
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
  -- Before the party has met (a narrated fire), only your own pieces.
  if v_narrated then
    select coalesce(jsonb_agg(p), '[]'::jsonb) into v_pieces from jsonb_array_elements(v_pieces) p
    where exists (select 1 from jsonb_array_elements(p -> 'by') b where b ->> 'id' = v_me::text);
  end if;
  -- Reactions on each piece, by name; yours marked.
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

  -- Still in your hands: your Notice line, the pass lines if you passed, the [PRESS ON] find if you pressed on and passed.
  if not v_narrated then
    v_notice := public.notice_line_for(p_party, v_me, v_week, v_day);
    if v_notice is not null and not exists (select 1 from public.fire_shares where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
      v_hands := v_hands || jsonb_build_object('kind', 'notice', 'title', 'What you noticed', 'attr', v_notice ->> 'attr', 'text', v_notice ->> 'text');
    end if;
    select coalesce((challenge ->> 'pass')::boolean, false), coalesce((press ->> 'pass')::boolean, false) into v_passed, v_pressed
    from public.member_days where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
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

  -- Readings with their reactions: only after your own pin (pin before peek), never on a narrated fire.
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

  -- Last night: the previous weekday's call (Day 1 looks back to the last week's Day 6).
  if v_day > 1 then v_prev_w := v_week; v_prev_d := v_day - 1;
  elsif v_week > 1 then v_prev_w := v_week - 1; v_prev_d := 6;
  end if;

  return jsonb_build_object('week', v_week, 'day', v_day, 'narrated', v_narrated,
    -- From 8:00pm on the party's clock, Garrick's last call for tonight's pins.
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
          -- A piece laid: a last-light find, a Notice line, the pass lines, the [PRESS ON] find.
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

-- Lay a piece from your hands: 'notice', 'pass' or 'press'.
create function public.fire_lay(p_party uuid, p_kind text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_ok boolean;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if coalesce((public.campfire_data(p_party, v_week, v_day) ->> 'narrated')::boolean, false) then raise exception 'nothing to lay tonight'; end if;
  if p_kind = 'notice' then
    perform public.share_notice(p_party);
  elsif p_kind in ('pass', 'press') then
    select case p_kind when 'pass' then coalesce((challenge ->> 'pass')::boolean, false) and public.fire_pass_text(p_party, v_week, v_day) is not null
                       else coalesce((press ->> 'pass')::boolean, false) and public.fire_press_piece(p_party, v_week, v_day) is not null end
      into v_ok from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
    if not coalesce(v_ok, false) then raise exception 'nothing to lay'; end if;
    insert into public.fire_laid (party_id, user_id, week, day, kind) values (p_party, auth.uid(), v_week, v_day, p_kind)
    on conflict do nothing;
  else
    raise exception 'nothing to lay';
  end if;
  perform public.fire_check_clicks(p_party, v_week, v_day);
  return public.fire_table(p_party);
end;
$$;

-- Agree or doubt a friend's piece ('lead:…', 'notice:…', 'pass', 'press') or reading ('pin:<user id>'); the same tap
-- again takes it back. Never on your own; a reading only once you have pinned your own.
create function public.fire_react(p_party uuid, p_target text, p_kind text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_me uuid := auth.uid(); v_piece jsonb; v_prev text; v_owner uuid;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if p_kind not in ('agree', 'doubt') then raise exception 'not a reaction'; end if;
  if coalesce((public.campfire_data(p_party, v_week, v_day) ->> 'narrated')::boolean, false) then raise exception 'not tonight'; end if;
  if p_target like 'pin:%' then
    v_owner := substr(p_target, 5)::uuid;
    if v_owner = v_me or not exists (select 1 from public.fire_pins where party_id = p_party and user_id = v_owner and week = v_week and day = v_day)
       or not exists (select 1 from public.fire_pins where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
      raise exception 'not a reading you can answer';
    end if;
  else
    select p into v_piece from jsonb_array_elements(public.fire_pieces(p_party, v_week, v_day)) p where p ->> 'key' = p_target;
    if v_piece is null or exists (select 1 from jsonb_array_elements(v_piece -> 'by') b where b ->> 'id' = v_me::text) then
      raise exception 'not a piece you can answer';
    end if;
  end if;
  select kind into v_prev from public.fire_reactions where party_id = p_party and user_id = v_me and week = v_week and day = v_day and target = p_target;
  insert into public.fire_reactions (party_id, user_id, week, day, target, kind)
  values (p_party, v_me, v_week, v_day, p_target, case when v_prev = p_kind then 'none' else p_kind end)
  on conflict (party_id, user_id, week, day, target) do update set kind = excluded.kind, at = now();
  return public.fire_table(p_party);
end;
$$;

-- Say something at the fire (its own thread; the party chat is apart).
create function public.fire_say(p_party uuid, p_body text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_body text := btrim(coalesce(p_body, ''));
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if coalesce((public.campfire_data(p_party, v_week, v_day) ->> 'narrated')::boolean, false) then raise exception 'not tonight'; end if;
  if char_length(v_body) < 1 or char_length(v_body) > 300 then raise exception 'say it in 1 to 300 characters'; end if;
  insert into public.fire_thread (party_id, week, day, user_id, kind, body) values (p_party, v_week, v_day, auth.uid(), 'say', v_body);
  return public.fire_table(p_party);
end;
$$;

-- Pinning, as before (0024), and now on the fire's thread: "Mei pinned a reading." the first time, "Mei changed sides."
-- when the reading changes (never to which side).
create or replace function public.pin_theory(p_party uuid, p_reading text, p_line text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_first boolean; v_name text; v_line text := nullif(btrim(coalesce(p_line, '')), '');
        v_data jsonb; v_prev text;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  if p_reading not in ('A', 'B', 'NEITHER') then raise exception 'not a reading'; end if;
  select reading into v_prev from public.fire_pins where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  v_first := v_prev is null;
  insert into public.fire_pins (party_id, user_id, week, day, reading, line) values (p_party, auth.uid(), v_week, v_day, p_reading, left(v_line, 140))
  on conflict (party_id, user_id, week, day) do update set reading = excluded.reading, line = excluded.line, at = now();
  v_data := public.campfire_data(p_party, v_week, v_day);
  select character_name into v_name from public.party_members where party_id = p_party and user_id = auth.uid();
  if coalesce((v_data ->> 'narrated')::boolean, false) then
    insert into public.fire_notes (party_id, user_id, week, day, kind, body)
    values (p_party, auth.uid(), v_week, v_day, 'week',
            left(coalesce(v_line, case p_reading when 'A' then v_data ->> 'forkA' when 'B' then v_data ->> 'forkB' else 'Neither.' end), 200))
    on conflict do nothing;
  elsif v_first then
    insert into public.party_messages (party_id, kind, body) values (p_party, 'notice', v_name || ' pinned a theory.');
    insert into public.fire_thread (party_id, week, day, user_id, kind, body) values (p_party, v_week, v_day, auth.uid(), 'pinned', v_name || ' pinned a reading.');
  elsif v_prev <> p_reading then
    insert into public.fire_thread (party_id, week, day, user_id, kind, body) values (p_party, v_week, v_day, auth.uid(), 'changed', v_name || ' changed sides.');
  end if;
  return public.campfire(p_party);
end;
$$;

-- The casebook: every night of a week up to today, with its readings, pieces (titles and names), clicks and the
-- party's call once the night is over. Your own week only up to your own day. Week 0 means this week.
create function public.casebook(p_party uuid, p_week int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_last int; v_out jsonb := '[]'::jsonb; d int; v_data jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if p_week = 0 then p_week := v_week; end if;
  if p_week < 1 or p_week > v_week then raise exception 'not yet'; end if;
  v_last := case when p_week < v_week then 6 else least(v_day, 6) end;
  -- Tonight's page only once your own day is done (the fire's own rule).
  if p_week = v_week and not exists (select 1 from public.member_days where party_id = p_party and user_id = auth.uid()
                                     and week = v_week and day = v_day and finished_at is not null) then
    v_last := least(v_day - 1, 6);
  end if;
  for d in 1 .. v_last loop
    v_data := public.campfire_data(p_party, p_week, d);
    continue when v_data is null or coalesce((v_data ->> 'narrated')::boolean, false);
    v_out := v_out || jsonb_build_object('day', d, 'place', v_data ->> 'place', 'forkA', v_data ->> 'forkA', 'forkB', v_data ->> 'forkB',
      'pieces', (select coalesce(jsonb_agg(jsonb_build_object('title', p ->> 'title',
                   'names', (select jsonb_agg(b ->> 'name') from jsonb_array_elements(p -> 'by') b))), '[]'::jsonb)
                 from jsonb_array_elements(public.fire_pieces(p_party, p_week, d)) p),
      'clicks', (select coalesce(jsonb_agg(jsonb_build_object('text', (v_data -> 'clicks' -> (k.idx - 1)) ->> 'text', 'names', to_jsonb(k.names)) order by k.at), '[]'::jsonb)
                 from public.fire_clicks k where k.party_id = p_party and k.week = p_week and k.day = d),
      'call', public.fire_call(p_party, p_week, d));
  end loop;
  return jsonb_build_object('week', p_week, 'currentWeek', v_week, 'weekQuestion', (public.campfire_data(p_party, p_week, 1) ->> 'weekQuestion'), 'nights', v_out);
end;
$$;

revoke execute on function public.fire_pass_text(uuid, int, int), public.fire_press_piece(uuid, int, int),
  public.fire_pieces(uuid, int, int), public.fire_check_clicks(uuid, int, int), public.fire_call(uuid, int, int)
  from public, anon, authenticated;
revoke execute on function public.fire_table(uuid), public.fire_lay(uuid, text), public.fire_react(uuid, text, text),
  public.fire_say(uuid, text), public.casebook(uuid, int) from public, anon;
grant execute on function public.fire_table(uuid), public.fire_lay(uuid, text), public.fire_react(uuid, text, text),
  public.fire_say(uuid, text), public.casebook(uuid, int) to authenticated;
