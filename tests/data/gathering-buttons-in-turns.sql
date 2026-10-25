-- 0126 (25 Oct): story buttons at the Gathering go in turns when three or more friends are here.
-- Run on the local copy: psql -At -f tests/data/gathering-buttons-in-turns.sql (rolled back)
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000a2'
\set C '00000000-0000-0000-0000-0000000000a3'
begin;
insert into auth.users (id) values (:'C') on conflict do nothing;
insert into profiles (id, display_name) values (:'C', 'Dev') on conflict do nothing;
insert into party_members (party_id, user_id, character_name, status, class, session_zero_done_at) values (:'P', :'C', 'Dev', 'approved', 'Sage', now()) on conflict do nothing;
update parties set day1_opens_at = now() - interval '13 days' where id = :'P';
delete from gatherings where party_id = :'P' and week = 2;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 2, now() - interval '1 hour', now() - interval '30 minutes', 38, now() - interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A', :'B', :'C'), 'n', 3, 'result', '{}'::jsonb, 'tapped', '{}'::jsonb, 'tappedBy', '{}'::jsonb, 'log', '[]'::jsonb));
delete from gathering_present where party_id = :'P' and week = 2;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P', 2, :'A', now()), (:'P', 2, :'B', now()), (:'P', 2, :'C', now());
select public.g_advance(:'P', 2);
select 'first READ ON goes to the first friend (expect TestHost)', public.g_name(:'P', (state -> 'log' -> -1 ->> 'turn')::uuid) from gatherings where party_id = :'P' and week = 2;
select set_config('request.uid', :'B', true) \gset
select 'x', jsonb_typeof(public.gathering_do(:'P', 'tap', jsonb_build_object('i', 38)));
select 'another friend cannot take it in the first 15 s (expect f)', state -> 'tapped' ? '38' from gatherings where party_id = :'P' and week = 2;
select 'the view says whose turn (expect TestHost, f)', x ->> 'turn', x ->> 'turnIsMe'
  from jsonb_array_elements(public.g_view(:'P', 2, :'B') -> 'log') x where x ->> 't' = 'act';
select set_config('request.uid', :'A', true) \gset
select 'x', jsonb_typeof(public.gathering_do(:'P', 'tap', jsonb_build_object('i', 38)));
select 'the friend whose turn it is takes it (expect t)', state -> 'tapped' ? '38' from gatherings where party_id = :'P' and week = 2;
update gatherings set cursor = 40, wait_until = now() - interval '1 second' where party_id = :'P' and week = 2;
select public.g_advance(:'P', 2);
select 'the next READ ON goes to the next friend (expect Mei)', public.g_name(:'P', (state -> 'log' -> -1 ->> 'turn')::uuid) from gatherings where party_id = :'P' and week = 2;
-- after 15 seconds anyone may take it
update gatherings set state = jsonb_set(state, '{log}', (state -> 'log') - (-1) || jsonb_build_array((state -> 'log' -> -1) || jsonb_build_object('at', now() - interval '20 seconds'))) where party_id = :'P' and week = 2;
select 'x', jsonb_typeof(public.gathering_do(:'P', 'tap', jsonb_build_object('i', 40)));
select 'after 15 s anyone may take it (expect t)', state -> 'tapped' ? '40' from gatherings where party_id = :'P' and week = 2;
rollback;
