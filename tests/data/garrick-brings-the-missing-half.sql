-- 0118 (24 Oct): in a party of one or two, Garrick brings the click's missing half. Run on the local copy:
--   psql -At -f tests/data/garrick-brings-the-missing-half.sql
-- Each case is rolled back. The party clock is set to UTC; run before 8:00pm UTC for case 1 to mean "not yet".
\set P '22222222-2222-2222-2222-222222222222'
\set A '00000000-0000-0000-0000-0000000000a1'
select user_id as o from party_members where party_id=:'P' and user_id<>:'A' limit 1 \gset
begin;
update parties set time_zone = 'UTC' where id=:'P';
delete from fire_clicks where party_id=:'P' and week=1 and day=2; delete from fan_outs where party_id=:'P' and week=1 and day=2;
insert into fan_outs (party_id,user_id,week,day,lead_id,at) values (:'P',:'A',1,2,'1-2-2',now());
select public.fire_check_clicks(:'P',1,2);
select 'one friend at the fire, before 8pm (expect 0)', count(*) from fire_clicks where party_id=:'P' and week=1 and day=2;
insert into fan_outs (party_id,user_id,week,day,lead_id,at) values (:'P',:'o',1,2,'1-2-1',now());
select public.fire_check_clicks(:'P',1,2);
select 'both came, pair missed (expect {TestHost,Garrick})', names from fire_clicks where party_id=:'P' and week=1 and day=2;
rollback;
begin;
delete from fire_clicks where party_id=:'P' and week=1 and day=2; delete from fan_outs where party_id=:'P' and week=1 and day=2;
insert into fan_outs (party_id,user_id,week,day,lead_id,at) values (:'P',:'A',1,2,'1-2-2',now()), (:'P',:'o',1,2,'1-2-3',now());
select public.fire_check_clicks(:'P',1,2);
select 'pair laid by two friends (expect {TestHost,Mei})', names from fire_clicks where party_id=:'P' and week=1 and day=2;
rollback;
