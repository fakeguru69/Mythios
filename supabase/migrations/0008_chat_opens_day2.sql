-- The party chat opens only when the party assembles and Garrick joins: at the inn, on Week 1 Day 2 (Fake Guru, 16 Oct).
-- The days are not yet played online, so for now it opens when Day 2 opens on the party's clock; when they are, this
-- becomes "when the friend has finished Day 2's chapter".
create function public.party_chat_open(p_party uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.day1_opens_at is not null and now() >= p.day1_opens_at + interval '1 day'
                   from public.parties p where p.id = p_party), false);
$$;

-- Messages are read only once the chat is open (added to the members' rule, which still applies).
create policy "messages: only once the chat is open" on public.party_messages as restrictive for select to authenticated
  using (public.party_chat_open(party_id));

create or replace function public.post_message(p_party uuid, p_body text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_body text := btrim(coalesce(p_body, ''));
begin
  if not public.is_party_member(p_party) then raise exception 'not in this party'; end if;
  if not public.party_chat_open(p_party) then raise exception 'the party chat is not open yet'; end if;
  if char_length(v_body) < 1 or char_length(v_body) > 500 then raise exception 'a message is 1 to 500 characters'; end if;
  insert into public.party_messages (party_id, author_id, kind, body) values (p_party, auth.uid(), 'chat', v_body)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.party_chat_open from public, anon;
grant execute on function public.party_chat_open to authenticated;
