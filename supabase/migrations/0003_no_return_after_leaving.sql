-- A friend who leaves, or is removed, cannot come back to that story (Core Rules §12a, "Leaving").
-- 0001 wrongly let a friend who left ask again; this puts canon's rule back.
create or replace function public.request_join(p_invite_code text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid; v_count int; v_status public.member_status;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select id into v_party from public.parties where invite_code = p_invite_code and invite_open;
  if v_party is null then raise exception 'this invite no longer works'; end if;
  select status into v_status from public.party_members where party_id = v_party and user_id = auth.uid();
  if v_status in ('left', 'removed') then raise exception 'you cannot come back to this story'; end if;
  if v_status is not null then return v_party; end if;
  select count(*) into v_count from public.party_members where party_id = v_party and status = 'approved';
  if v_count >= 6 then raise exception 'this party is full'; end if;
  insert into public.party_members (party_id, user_id, character_name)
  values (v_party, auth.uid(), p_character_name);
  return v_party;
end;
$$;

-- What the invite page shows before joining: who sent it and the party's name (§12a, "The invite page").
create or replace function public.invite_info(p_invite_code text) returns table (party_name text, host_name text, open boolean)
language sql stable security definer set search_path = '' as $$
  select p.name, h.display_name, p.invite_open
  from public.parties p join public.profiles h on h.id = p.host_id
  where p.invite_code = p_invite_code;
$$;
revoke execute on function public.invite_info from public;
grant execute on function public.invite_info to anon, authenticated;
