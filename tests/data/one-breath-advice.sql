-- 0132 (25 Oct): "One breath", advice. Run on the local copy: psql -At -f tests/data/one-breath-advice.sql
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000a2'
\set C '00000000-0000-0000-0000-0000000000a3'
begin;
insert into auth.users (id) values (:'C') on conflict do nothing;
insert into profiles (id, display_name) values (:'C', 'Dev') on conflict do nothing;
insert into party_members (party_id, user_id, character_name, status, class, session_zero_done_at) values (:'P', :'C', 'Dev', 'approved', 'Sage', now()) on conflict do nothing;
update parties set day1_opens_at = now() - interval '6 days' where id = :'P';
select (x.o - 1) as pk from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and x.s ->> 'mode' = 'chosen' \gset
delete from gathering_present where party_id = :'P' and week = 1;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P', 1, :'A', now()), (:'P', 1, :'B', now()), (:'P', 1, :'C', now());
-- Mei (B) has been chosen; the act is on screen.
delete from gatherings where party_id = :'P' and week = 1;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 1, now() - interval '1 hour', now() - interval '30 minutes', :pk, now() + interval '20 seconds',
  jsonb_build_object('order', jsonb_build_array(:'A', :'B', :'C'), 'n', 3, 'result', '{}'::jsonb, 'tapped', '{}'::jsonb,
    'log', jsonb_build_array(jsonb_build_object('i', :pk, 't', 'pick', 'at', now())), 'risk', :'C', 'chosen', :'B', 'approach', jsonb_build_object('roller', :'A')));
-- TestHost and Dev advise; Mei (the chosen) cannot.
select set_config('request.uid', :'A', true);
select 'host advises' , public.gathering_do(:'P', 'advise', jsonb_build_object('i', :pk, 'o', 0)) is not null;
select set_config('request.uid', :'C', true);
select 'dev advises', public.gathering_do(:'P', 'advise', jsonb_build_object('i', :pk, 'o', 0)) is not null;
select set_config('request.uid', :'B', true);
select 'mei cannot advise herself', public.gathering_do(:'P', 'advise', jsonb_build_object('i', :pk, 'o', 2)) is not null;
select 'advice kept (expect 2 rows of 0)', (select count(*) from jsonb_each(state -> 'advice' -> :'pk'::text) where value::int = 0), (state -> 'advice' -> :'pk'::text) ? :'B' from gatherings where party_id = :'P' and week = 1;
-- What Mei sees: both names under option 0.
select 'Mei sees the advice (expect TestHost and Dev at 0)',
  (select string_agg(a ->> 'name' || ':' || (a ->> 'o'), ',' order by a ->> 'name')
     from jsonb_array_elements(public.g_view(:'P', 1, :'B'::uuid) -> 'log') en, jsonb_array_elements(en -> 'advice') a);
rollback;
