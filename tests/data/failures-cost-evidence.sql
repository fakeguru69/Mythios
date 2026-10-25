-- 0124 (24 Oct): a failed Challenge sends the road find's `lost` text to the fire; a failed [PRESS ON] keeps the
-- pass piece off the table. Run on the local copy: psql -At -f tests/data/failures-cost-evidence.sql (rolled back)
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
\set ON_ERROR_STOP 1
begin;
select set_config('request.uid', :'A', true), set_config('request.jwt.claim.sub', :'A', true) \gset
-- the party clock on Week 4, Day 4
update parties set day1_opens_at = now() - interval '24 days', time_zone = 'UTC' where id = :'P';
select 'today is (expect 4|4)', o_week, o_day from public.my_today_row(:'P');
delete from member_days where party_id=:'P' and user_id=:'A' and week=4 and day=4;
delete from fan_outs where party_id=:'P' and week=4 and day=4;
delete from fire_laid where party_id=:'P' and week=4 and day=4;
insert into fan_outs (party_id,user_id,week,day,lead_id,at) values (:'P',:'A',4,4,'4-4-1',now());
-- 1. passed the Challenge, failed the press
insert into member_days (party_id,user_id,week,day,picks,challenge,press,finished_at) values
  (:'P',:'A',4,4,'{"0":[1]}','{"pass":true,"attr":"Aim"}','{"pass":false,"net":-2}',now());
select 'failed press: pass piece in hand (expect f)', exists (select 1 from jsonb_array_elements(public.fire_table(:'P') -> 'hands') h where h ->> 'kind' = 'pass');
savepoint s1;
do $t$ begin perform public.fire_lay('22222222-2222-2222-2222-222222222222', 'pass'); raise exception 'laid'; exception when others then
  if sqlerrm = 'laid' then raise; end if; end $t$;
select 'failed press: fire_lay refused (expect refused)', 'refused';
rollback to s1;
update member_days set press = '{"left":true}' where party_id=:'P' and user_id=:'A' and week=4 and day=4;
select 'left it: pass piece in hand (expect t)', exists (select 1 from jsonb_array_elements(public.fire_table(:'P') -> 'hands') h where h ->> 'kind' = 'pass');
-- 2. the road find after a pass, then after a failed Challenge
select 'road find after a pass (expect By lamplight…barefoot.)', body from public.fire_fork_pieces_for(:'P',4,4) where user_id=:'A';
update member_days set challenge = '{"pass":false,"attr":"Aim"}', press = null where party_id=:'P' and user_id=:'A' and week=4 and day=4;
select 'road find after a failure (expect …before anyone else could see them.)', body from public.fire_fork_pieces_for(:'P',4,4) where user_id=:'A';
rollback;
