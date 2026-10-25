-- 0140 (26 Oct 2026; Fake Guru: "make sure the sign in and invite process work simply"). Three phone alerts for getting
-- ready, so nobody has to sit watching the party page:
--   a friend knocks           -> the host:   "Guest is asking to join Aaaa."
--   the host lets them in     -> the friend: "You're in Aaaa. Make your character."
--   the host starts the story -> everyone:   "Aaaa sets off. Day 1 opens at 5:00am on Sunday 26 October."
-- They go into push_outbox, which the notify job sends every five minutes, to phones that turned alerts on.
create or replace function public.getting_ready_alerts() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_party public.parties; v_title text;
begin
  if tg_table_name = 'party_members' then
    select * into v_party from public.parties where id = new.party_id;
    v_title := 'Tales of the Dark Moon · ' || v_party.name;
    if tg_op = 'INSERT' and new.status = 'pending' then
      insert into public.push_outbox (user_id, party_id, title, body, tag)
      values (v_party.host_id, new.party_id, v_title, new.character_name || ' is asking to join ' || v_party.name || '. Open the party to let them in.', 'knock');
    elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'approved' then
      insert into public.push_outbox (user_id, party_id, title, body, tag)
      values (new.user_id, new.party_id, v_title, 'You''re in ' || v_party.name || '. Make your character.', 'letin');
    end if;
  elsif tg_table_name = 'parties' and tg_op = 'UPDATE' and old.day1_opens_at is distinct from new.day1_opens_at and new.day1_opens_at is not null then
    insert into public.push_outbox (user_id, party_id, title, body, tag)
    select pm.user_id, new.id, 'Tales of the Dark Moon · ' || new.name,
           case when old.day1_opens_at is null then new.name || ' sets off. ' else 'The start has moved. ' end
           || 'Day 1 opens at 5:00am on ' || trim(to_char(new.day1_opens_at at time zone new.time_zone, 'FMDay FMDD FMMonth')) || '.',
           'start'
    from public.party_members pm
    where pm.party_id = new.id and pm.status = 'approved' and pm.user_id <> new.host_id;
  end if;
  return new;
end;
$$;
revoke execute on function public.getting_ready_alerts() from public, anon, authenticated;

drop trigger if exists getting_ready_member_alerts on public.party_members;
create trigger getting_ready_member_alerts after insert or update of status on public.party_members
  for each row execute function public.getting_ready_alerts();
drop trigger if exists getting_ready_party_alerts on public.parties;
create trigger getting_ready_party_alerts after update of day1_opens_at on public.parties
  for each row execute function public.getting_ready_alerts();
