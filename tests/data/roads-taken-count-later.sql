-- 0123 (24 Oct): the road a player took is a claim ("2-3:took:0:0"), so a later Challenge can be harder.
-- Run on the local copy: psql -At -f tests/data/roads-taken-count-later.sql   (rolled back)
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
begin;
delete from member_days where party_id=:'P' and user_id=:'A' and week=2 and day in (2,3);
insert into member_days (party_id,user_id,week,day,picks) values
  (:'P',:'A',2,2,'{"0":[2]}'), (:'P',:'A',2,3,'{"0":[0]}');
select set_config('request.jwt.claim.sub', :'A', true), set_config('request.uid', :'A', true) \gset
select 'claims hold both roads (expect t t)', party_claims(:'P') ? '2-2:took:0:2', party_claims(:'P') ? '2-3:took:0:0';
select 'thorn not claimed (expect f)', party_claims(:'P') ? '2-3:took:0:1';
-- the harder rule roll_card applies, read from the loaded chapters
select 'W2D4 card one harder after the wheel-marks (expect 1)',
  case when (party_claims(:'P') ? (s -> 'harderIf' ->> 'key')) = (s -> 'harderIf' ->> 'has')::boolean then (s -> 'harderIf' ->> 'by')::int else 0 end
from chapters c, jsonb_array_elements(c.script -> 'steps') s
where c.series_id='dark-moon' and c.week=2 and c.day=4 and s ->> 't' = 'challenge';
update member_days set picks='{"0":[1]}' where party_id=:'P' and user_id=:'A' and week=2 and day=3;
select 'after the thorn instead (expect 0)',
  case when (party_claims(:'P') ? (s -> 'harderIf' ->> 'key')) = (s -> 'harderIf' ->> 'has')::boolean then (s -> 'harderIf' ->> 'by')::int else 0 end
from chapters c, jsonb_array_elements(c.script -> 'steps') s
where c.series_id='dark-moon' and c.week=2 and c.day=4 and s ->> 't' = 'challenge';
rollback;
