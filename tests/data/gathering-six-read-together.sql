-- 0125 (25 Oct): at each Gathering's "The six, read together", the server reads the week's six as the party holds
-- them: found words in, the rest left blank. Run on the local copy: psql -At -f tests/data/gathering-six-read-together.sql
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
begin;
select set_config('request.uid', :'A', true) \gset
select (x.o - 1) as six from gathering_scripts g, jsonb_array_elements(g.data -> 'steps') with ordinality x(s, o)
 where g.week = 1 and g.series_id = 'dark-moon' and x.s ->> 'text' like '%{SIX:1}%' \gset
select 'the six step is in Gathering 1 at', :six;
delete from fragment_words where party_id = :'P' and fragment_id like '1-%';
insert into fragment_words (party_id, fragment_id, slot, solved_by) values (:'P', '1-1', 1, :'A'), (:'P', '1-6', 2, :'A');
delete from gatherings where party_id = :'P' and week = 1;
insert into gatherings (party_id, week, opens_at, started_at, cursor, wait_until, state)
values (:'P', 1, now() - interval '1 hour', now() - interval '30 minutes', :six, now() - interval '1 second',
  jsonb_build_object('order', jsonb_build_array(:'A'), 'n', 1, 'result', '{}'::jsonb, 'log', '[]'::jsonb));
delete from gathering_present where party_id = :'P' and week = 1;
insert into gathering_present (party_id, week, user_id, last_at) values (:'P', 1, :'A', now());
select public.g_advance(:'P', 1);
select 'found word in (expect t)', (state -> 'log' -> -1 ->> 'text') like '%Four were scattered after. One stayed ____.%' from gatherings where party_id = :'P' and week = 1;
select 'blank for the rest (expect t)', (state -> 'log' -> -1 ->> 'text') like '%They ____ for him before they ____ him.%' from gatherings where party_id = :'P' and week = 1;
select 'no marker left (expect f)', (state -> 'log' -> -1 ->> 'text') like '%{SIX%' from gatherings where party_id = :'P' and week = 1;
select 'paced to its length, over 20 s (expect t)', wait_until > now() + interval '20 seconds' from gatherings where party_id = :'P' and week = 1;
rollback;
