-- so nothing later in the same request can change a status (found in testing, 15 Oct 2026).

create or replace function public.create_party(p_name text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  insert into public.parties (name, host_id) values (p_name, auth.uid()) returning id into v_party;
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name, status)
  values (v_party, auth.uid(), p_character_name, 'approved');
  perform set_config('mythios.allow_status', 'off', true);
  return v_party;
end;
$$;
create or replace function public.request_join(p_invite_code text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid; v_count int;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select id into v_party from public.parties where invite_code = p_invite_code and invite_open;
  if v_party is null then raise exception 'this invite no longer works'; end if;
  select count(*) into v_count from public.party_members where party_id = v_party and status = 'approved';
  if v_count >= 6 then raise exception 'this party is full'; end if;
  -- A friend who left may ask again; a removed friend may not.
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name)
  values (v_party, auth.uid(), p_character_name)
  on conflict (party_id, user_id) do update
    set status = 'pending', character_name = excluded.character_name
    where public.party_members.status = 'left';
  perform set_config('mythios.allow_status', 'off', true);
  return v_party;
end;
$$;
create or replace function public.set_member_status(p_party uuid, p_user uuid, p_status public.member_status) returns void
language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  if p_status not in ('approved', 'removed') then raise exception 'the host approves or removes'; end if;
  if p_user = auth.uid() then raise exception 'the host leaves, not removes'; end if;
  if p_status = 'approved' then
    select count(*) into v_count from public.party_members where party_id = p_party and status = 'approved';
    if v_count >= 6 then raise exception 'this party is full'; end if;
  end if;
  perform set_config('mythios.allow_status', 'on', true);
  update public.party_members set status = p_status where party_id = p_party and user_id = p_user;
  perform set_config('mythios.allow_status', 'off', true);
  select count(*) into v_count from public.party_members where party_id = p_party and status = 'approved';
  if v_count >= 6 then update public.parties set invite_open = false where id = p_party; end if;
end;
$$;
create or replace function public.leave_party(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_next uuid;
begin
  perform set_config('mythios.allow_status', 'on', true);
  update public.party_members set status = 'left' where party_id = p_party and user_id = auth.uid();
  perform set_config('mythios.allow_status', 'off', true);
  if public.is_party_host(p_party) then
    select user_id into v_next from public.party_members
    where party_id = p_party and status = 'approved' order by joined_at limit 1;
    if v_next is not null then update public.parties set host_id = v_next where id = p_party; end if;
  end if;
end;
$$;
