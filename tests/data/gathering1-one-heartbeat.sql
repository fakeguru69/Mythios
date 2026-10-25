-- 0128 (25 Oct): Gathering 1's heartbeat. Run on the local copy: psql -At -f tests/data/gathering1-one-heartbeat.sql
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000a2'
\set C '00000000-0000-0000-0000-0000000000a3'
begin;
insert into auth.users (id) values (:'C') on conflict do nothing;
insert into profiles (id, display_name) values (:'C', 'Dev') on conflict do nothing;
insert into party_members (party_id, user_id, character_name, status, class, session_zero_done_at) values (:'P', :'C', 'Dev', 'approved', 'Sage', now()) on conflict do nothing;
update parties set day1_opens_at = now() - interval '6 days' where id = :'P';
select (x.o - 1) as hb from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and x.s ->> 'text' like '{CHOSEN} is nearest%' \gset
select (x.o - 1) as pk from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and x.s ->> 'mode' = 'chosen' \gset
select (x.o - 1) as ue from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and x.s ->> 't' = 'ue' \gset
delete from gathering_present where party_id = :'P' and week = 1;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P', 1, :'A', now()), (:'P', 1, :'B', now()), (:'P', 1, :'C', now());
-- 1. Dev is in the drop, TestHost rolled the Approach: the light picks Mei.
delete from gatherings where party_id = :'P' and week = 1;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 1, now() - interval '1 hour', now() - interval '30 minutes', :hb, now() - interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A', :'B', :'C'), 'n', 3, 'result', '{}'::jsonb, 'tapped', '{}'::jsonb, 'log', '[]'::jsonb,
    'risk', :'C', 'approach', jsonb_build_object('roller', :'A')));
select public.g_advance(:'P', 1);
select 'the one who acts is Mei (expect Mei)', public.g_name(:'P', (state ->> 'chosen')::uuid) from gatherings where party_id = :'P' and week = 1;
-- 2. Mei chose GO OUT NOW: Mei takes the United Effort's first turn.
update gatherings set cursor = :ue, wait_until = now() - interval '1 second',
  state = state || jsonb_build_object('result', jsonb_build_object(:'pk'::text, 0), 'lastPick', 0) where party_id = :'P' and week = 1;
select public.g_advance(:'P', 1);
select 'Mei goes first (expect Mei)', public.g_name(:'P', (state -> 'ue' ->> 'next')::uuid) from gatherings where party_id = :'P' and week = 1;
-- 3. A friend alone: the heartbeat's passages are not shown, whatever the last pick was.
select 'alone, no heartbeat (expect f f)', public.g_cond('{"on":"together"}', '{"n":1}'), public.g_cond('{"on":"pick","option":0,"together":true}', '{"n":1,"lastPick":0}');
select 'with friends, the branch shows (expect t)', public.g_cond('{"on":"pick","option":0,"together":true}', '{"n":3,"lastPick":0}');
rollback;
