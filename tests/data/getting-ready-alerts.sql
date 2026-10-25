-- 0140 (26 Oct): phone alerts while getting ready. Run on the local copy: psql -At -f tests/data/getting-ready-alerts.sql
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'h@x'), ('00000000-0000-0000-0000-0000000000f2', 'g@x') on conflict do nothing;
insert into profiles (id, display_name) values ('00000000-0000-0000-0000-0000000000f1', 'Hostie'), ('00000000-0000-0000-0000-0000000000f2', 'Guesty') on conflict do nothing;
insert into parties (id, name, host_id, time_zone) values ('99999999-9999-9999-9999-999999999999', 'Lanterns', '00000000-0000-0000-0000-0000000000f1', 'Asia/Singapore');
insert into party_members (party_id, user_id, character_name, status) values ('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-0000000000f1', 'Hostie', 'approved');
insert into party_members (party_id, user_id, character_name, status) values ('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-0000000000f2', 'Guesty', 'pending');
select 'knock reaches the host (expect 1)', count(*) from push_outbox where party_id = '99999999-9999-9999-9999-999999999999' and tag = 'knock' and user_id = '00000000-0000-0000-0000-0000000000f1' and body like 'Guesty is asking to join Lanterns.%';
select set_config('request.uid', '00000000-0000-0000-0000-0000000000f1', true);
select public.set_member_status('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-0000000000f2', 'approved');
select 'let in reaches the friend (expect 1)', count(*) from push_outbox where party_id = '99999999-9999-9999-9999-999999999999' and tag = 'letin' and user_id = '00000000-0000-0000-0000-0000000000f2';
update party_members set ready = true where party_id = '99999999-9999-9999-9999-999999999999';
select public.schedule_season('99999999-9999-9999-9999-999999999999', (current_date + 2)::date);
select 'the start reaches the friend, not the host (expect 1 0)',
  (select count(*) from push_outbox where party_id = '99999999-9999-9999-9999-999999999999' and tag = 'start' and user_id = '00000000-0000-0000-0000-0000000000f2'),
  (select count(*) from push_outbox where party_id = '99999999-9999-9999-9999-999999999999' and tag = 'start' and user_id = '00000000-0000-0000-0000-0000000000f1');
select 'its words', body from push_outbox where party_id = '99999999-9999-9999-9999-999999999999' and tag = 'start';
rollback;
