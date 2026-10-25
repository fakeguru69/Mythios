-- 0134 (25 Oct): the Gathering answers the week, and One breath carries weight (Week 1).
-- Run on the local copy: psql -At -f tests/data/gathering-answers-the-week.sql
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000a2'
\set C '00000000-0000-0000-0000-0000000000a3'
begin;
insert into auth.users (id) values (:'C') on conflict do nothing;
insert into profiles (id, display_name) values (:'C', 'Dev') on conflict do nothing;
insert into party_members (party_id, user_id, character_name, status, class, session_zero_done_at) values (:'P', :'C', 'Dev', 'approved', 'Sage', now()) on conflict do nothing;
update parties set day1_opens_at = now() - interval '6 days' where id = :'P';
-- Mei let a friend read the map on Day 6 (she saw the courier); the fire called A.
insert into member_days (party_id, user_id, week, day, picks, acts, aside) values (:'P', :'B', 1, 6, '{"1":[1]}', 0, false)
on conflict (party_id, user_id, week, day) do update set picks = '{"1":[1]}';
delete from fire_pins where party_id = :'P' and week = 1 and day = 6;
insert into fire_pins (party_id, user_id, week, day, reading, at) values (:'P', :'A', 1, 6, 'A', now()), (:'P', :'B', 1, 6, 'A', now());
select 'week facts (expect A, t)', public.g_week_facts(:'P', 1) -> 'calls' ->> '6', (public.g_week_facts(:'P', 1) -> 'took') ? '6:1:1';
select 'conditions (expect t t f f)',
  public.g_cond('{"on":"took","key":"6:1:1"}', jsonb_build_object('week', public.g_week_facts(:'P', 1))),
  public.g_cond('{"on":"call","day":6,"reading":"A"}', jsonb_build_object('week', public.g_week_facts(:'P', 1))),
  public.g_cond('{"on":"call","day":6,"reading":"B"}', jsonb_build_object('week', public.g_week_facts(:'P', 1))),
  public.g_cond('{"on":"took","key":"6:1:0"}', jsonb_build_object('week', public.g_week_facts(:'P', 1)));
-- The Gathering 1 script carries the lines.
select 'the script has the courier and both calls (expect 1 2)',
  (select count(*) from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') x where g.week = 1 and x -> 'cond' ->> 'on' = 'took'),
  (select count(*) from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') x where g.week = 1 and x -> 'cond' ->> 'on' = 'call');
-- One breath: Mei chose THE NEW PROP; the United Effort opens with the thing at risk 10 higher.
select (x.o - 1) as pk from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o) where g.week = 1 and x.s ->> 'mode' = 'chosen' \gset
select (x.o - 1) as ue from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o) where g.week = 1 and x.s ->> 't' = 'ue' \gset
delete from gathering_present where party_id = :'P' and week = 1;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P', 1, :'A', now()), (:'P', 1, :'B', now()), (:'P', 1, :'C', now());
delete from gatherings where party_id = :'P' and week = 1;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 1, now() - interval '1 hour', now() - interval '30 minutes', :ue, now() - interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A', :'B', :'C'), 'n', 3, 'result', jsonb_build_object(:'pk'::text, 1), 'lastPick', 1,
    'tapped', '{}'::jsonb, 'log', '[]'::jsonb, 'risk', :'C', 'chosen', :'B', 'approach', jsonb_build_object('roller', :'A')));
select public.g_advance(:'P', 1);
select 'the new prop (expect 1, risk 110, way 100)', state -> 'ue' ->> 'breath', state -> 'ue' ->> 'risk', state -> 'ue' ->> 'way' from gatherings where party_id = :'P' and week = 1;
-- GO OUT NOW: Mei goes first, and her first roll carries +2.
update gatherings set wait_until = now() - interval '1 second',
  state = ((state - 'ue') - 'log') || jsonb_build_object('result', jsonb_build_object(:'pk'::text, 0), 'lastPick', 0, 'log', '[]'::jsonb)
where party_id = :'P' and week = 1;
select public.g_advance(:'P', 1);
select 'go out now (expect 0, Mei first, risk 100)', state -> 'ue' ->> 'breath', public.g_name(:'P', (state -> 'ue' ->> 'next')::uuid), state -> 'ue' ->> 'risk' from gatherings where party_id = :'P' and week = 1;
select 'her first roll (expect 2)', (public.g_ue_roll(:'P', state, public.g_script(:'P', 1)) -> 'ue' -> 'rolls' -> 0 ->> 'edge') from gatherings where party_id = :'P' and week = 1;
rollback;
