-- 0127 (25 Oct): Strike or Cover in the Gathering's Battle. Run on the local copy:
--   psql -At -f tests/data/battle-strike-or-cover.sql
\set P '22222222-2222-2222-2222-222222222222'
-- 1. TestHost has beaten their own enemy and covers Mei (30 HP). Mei's enemy hits for certain (attack 60).
select public.g_battle_round(:'P', 1, jsonb_build_object('round', 0, 'partyFirst', true,
  'fighters', jsonb_build_array(
     jsonb_build_object('id', 'a', 'name', 'TestHost', 'hp', 200, 'fallen', false, 'weapon', 14, 'armor', 27, 'cover', 'b'),
     jsonb_build_object('id', 'b', 'name', 'Mei', 'hp', 30, 'fallen', false, 'weapon', 14, 'armor', 27)),
  'foes', jsonb_build_array(
     jsonb_build_object('name', 'One', 'hp', 0, 'def', 22, 'atk', 60),
     jsonb_build_object('name', 'Two', 'hp', 100, 'def', 22, 'atk', 60)))) as b \gset
select 'Mei is spared (expect 30)', (:'b'::jsonb -> 'fighters' -> 1 ->> 'hp');
select 'TestHost took the blow (expect t)', (:'b'::jsonb -> 'fighters' -> 0 ->> 'hp')::int < 200;
select 'the line says so (expect t)', (:'b'::jsonb -> 'rounds' -> 0 -> 'lines' -> 'b')::text like '%TestHost takes the blow meant for Mei%';
select 'TestHost gave up the strike (expect 0)', (select count(*) from jsonb_array_elements(:'b'::jsonb -> 'rounds' -> 0 -> 'lines' -> 'b') l
  where l ->> 'attacker' = 'TestHost' and l ->> 'side' = 'party');
select 'the cover lasts one round (expect t)', not (:'b'::jsonb -> 'fighters' -> 0 ? 'cover');
-- 2. Without a cover, Mei takes her own enemy's blow.
select public.g_battle_round(:'P', 1, jsonb_build_object('round', 0, 'partyFirst', true,
  'fighters', jsonb_build_array(
     jsonb_build_object('id', 'a', 'name', 'TestHost', 'hp', 200, 'fallen', false, 'weapon', 14, 'armor', 27),
     jsonb_build_object('id', 'b', 'name', 'Mei', 'hp', 30, 'fallen', false, 'weapon', 14, 'armor', 27)),
  'foes', jsonb_build_array(
     jsonb_build_object('name', 'One', 'hp', 0, 'def', 22, 'atk', 60),
     jsonb_build_object('name', 'Two', 'hp', 100, 'def', 22, 'atk', 60)))) as b2 \gset
select 'without a cover Mei is hit (expect 0)', (:'b2'::jsonb -> 'fighters' -> 1 ->> 'hp');
-- 3. The action: TestHost chooses to cover Mei (below 40 HP); covering a friend above 40, or clearing it, works as written.
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000a2'
begin;
select set_config('request.uid', :'A', true) \gset
update parties set day1_opens_at = now() - interval '6 days 1 hour' where id = :'P';
select (x.o - 1) as bat from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and g.series_id = 'dark-moon' and x.s ->> 't' = 'battle' \gset
delete from gatherings where party_id = :'P' and week = 1;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 1, now() - interval '1 hour', now() - interval '30 minutes', :bat, now() + interval '1 hour',
  jsonb_build_object('order', jsonb_build_array(:'A', :'B'), 'n', 2, 'result', '{}'::jsonb, 'log', jsonb_build_array(jsonb_build_object('i', :bat, 't', 'battle', 'at', now())),
    'battle', jsonb_build_object('round', 1, 'outcome', 'ongoing', 'partyFirst', true,
      'fighters', jsonb_build_array(
        jsonb_build_object('id', :'A', 'name', 'TestHost', 'hp', 90, 'fallen', false, 'weapon', 14, 'armor', 27),
        jsonb_build_object('id', :'B', 'name', 'Mei', 'hp', 35, 'fallen', false, 'weapon', 14, 'armor', 27)),
      'foes', jsonb_build_array(jsonb_build_object('name', 'One', 'hp', 50), jsonb_build_object('name', 'Two', 'hp', 50)))));
select 'x', jsonb_typeof(public.gathering_do(:'P', 'cover', jsonb_build_object('i', :bat, 'to', :'B')));
select 'TestHost covers Mei (expect t)', state -> 'battle' -> 'fighters' -> 0 ->> 'cover' = :'B' from gatherings where party_id = :'P' and week = 1;
select 'the view names it (expect Mei)', x ->> 'cover' from jsonb_array_elements(
  (select y -> 'fighters' from jsonb_array_elements(public.g_view(:'P', 1, :'A') -> 'log') y where y ->> 't' = 'battle')) x where x ->> 'name' = 'TestHost';
select 'x', jsonb_typeof(public.gathering_do(:'P', 'cover', jsonb_build_object('i', :bat, 'to', null)));
select 'cleared (expect t)', not (state -> 'battle' -> 'fighters' -> 0 ? 'cover') from gatherings where party_id = :'P' and week = 1;
rollback;
