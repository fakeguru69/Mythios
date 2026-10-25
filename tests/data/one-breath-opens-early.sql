-- 0139 (25 Oct): One breath opens once every other friend has spoken. Run on the local copy: psql -At -f tests/data/one-breath-opens-early.sql
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
  jsonb_build_object('order', jsonb_build_array(:'A', :'B', :'C'), 'n', 3, 'result', '{}'::jsonb, 'picks', jsonb_build_object(:'pk'::text, '{}'::jsonb), 'tapped', '{}'::jsonb,
    'log', jsonb_build_array(jsonb_build_object('i', :pk, 't', 'pick', 'at', now())), 'risk', :'C', 'chosen', :'B', 'approach', jsonb_build_object('roller', :'A')));
-- 0139: before anyone advises, Mei must wait; once TestHost and Dev have both spoken, she may choose at once.
select set_config('request.uid', :'B', true);
do $t$ begin perform public.gathering_do('22222222-2222-2222-2222-222222222222', 'pick', jsonb_build_object('i', (select cursor from public.gatherings where party_id = '22222222-2222-2222-2222-222222222222' and week = 1), 'o', 0)); raise exception 'should have been refused'; exception when others then if sqlerrm <> 'not yet' then raise; end if; end $t$;
select set_config('request.uid', :'A', true);
select public.gathering_do(:'P', 'advise', jsonb_build_object('i', :pk, 'o', 0)) is not null as a;
select 'one spoken, not yet open (expect f)', coalesce((state -> 'adviceIn') ? :'pk'::text, false) from gatherings where party_id = :'P' and week = 1;
select set_config('request.uid', :'C', true);
select public.gathering_do(:'P', 'advise', jsonb_build_object('i', :pk, 'o', 1)) is not null as c;
select 'all spoken, open (expect t)', (state -> 'adviceIn') ? :'pk'::text from gatherings where party_id = :'P' and week = 1;
select 'the clock says now (expect t)',
  (select (en ->> 'chooseFrom')::timestamptz <= now() + interval '1 second' from jsonb_array_elements(public.g_view(:'P', 1, :'B'::uuid) -> 'log') en where en ? 'chooseFrom' limit 1);
select set_config('request.uid', :'B', true);
select 'Mei picks at once (expect t)', public.gathering_do(:'P', 'pick', jsonb_build_object('i', :pk, 'o', 0)) is not null;
rollback;
