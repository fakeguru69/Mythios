-- Phase 0.4 (24 Oct, migration 0115): Gathering 6's act when the chosen friend has gone. Run on the local copy:
--   psql -At -f tests/data/gathering6-act-when-chosen-gone.sql
-- (Step numbers moved up two on 25 Oct: "The six, read together" comes before the act.)
-- Three cases, each rolled back: the chosen friend gone (the act opens to all; the first tap stands), the chosen friend
-- here and silent (does nothing, as canon), and another friend tapping before (refused).
begin;
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
select user_id as o from party_members where party_id=:'P' and user_id<>:'A' limit 1 \gset
select set_config('request.uid', :'A', true);
update parties set day1_opens_at = now() - interval '41 days 1 hour' where id=:'P';
delete from gatherings where party_id=:'P' and week=6;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 6, now()-interval '1 hour', now()-interval '30 minutes', 64, now()-interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A', :'o'), 'chosen', :'o', 'n', 2, 'result', '{}'::jsonb,
     'log', jsonb_build_array(jsonb_build_object('i',64,'t','pick','at', now()-interval '60 seconds')),
     'picks', jsonb_build_object('64','{}'::jsonb)));
delete from gathering_present where party_id=:'P' and week=6;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P',6,:'A',now()), (:'P',6,:'o',now()-interval '5 minutes');
select public.g_advance(:'P', 6);
select 'GONE: opens to all (expect true)', state->>'chosenOpen' from gatherings where party_id=:'P' and week=6;
select 'do', jsonb_typeof(public.gathering_do(:'P','pick', jsonb_build_object('i',64,'o',0)));
select 'GONE: first tap stands (expect 0, t, 65)', state->'result'->>'64', state->>'actedFor' = :'A', cursor from gatherings where party_id=:'P' and week=6;
rollback;
begin;
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
select user_id as o from party_members where party_id=:'P' and user_id<>:'A' limit 1 \gset
select set_config('request.uid', :'A', true);
update parties set day1_opens_at = now() - interval '41 days 1 hour' where id=:'P';
delete from gatherings where party_id=:'P' and week=6;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 6, now()-interval '1 hour', now()-interval '30 minutes', 64, now()-interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A', :'o'), 'chosen', :'o', 'n', 2, 'result', '{}'::jsonb,
     'log', jsonb_build_array(jsonb_build_object('i',64,'t','pick','at', now()-interval '60 seconds')),
     'picks', jsonb_build_object('64','{}'::jsonb)));
delete from gathering_present where party_id=:'P' and week=6;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P',6,:'A',now()), (:'P',6,:'o',now());
select public.g_advance(:'P', 6);
select 'HERE AND SILENT: does nothing (expect no, 2, 67)', coalesce(state->>'chosenOpen','no'), state->'result'->>'64', cursor from gatherings where party_id=:'P' and week=6;
rollback;
