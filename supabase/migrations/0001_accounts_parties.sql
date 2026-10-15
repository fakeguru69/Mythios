-- Mythios multiplayer, step 1: accounts, parties, members, invites (Core Rules §12a, "People and accounts").
-- Applied to the Supabase project "mythios" (ap-southeast-1) on 15 Oct 2026.

-- An account's one name (1 to 12 characters). Made when someone signs up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 12),
  created_at timestamptz not null default now()
);

-- A party: its name (1 to 20), its host, its locked time zone, its invite link.
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  host_id uuid not null references public.profiles (id),
  time_zone text not null default 'Asia/Singapore',
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),
  invite_open boolean not null default true,
  season_started_at timestamptz,
  created_at timestamptz not null default now()
);

create type public.member_status as enum ('pending', 'approved', 'left', 'removed');

-- A person in a party: their character name (1 to 12) and Session Zero answers for this party.
create table public.party_members (
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  character_name text not null check (char_length(character_name) between 1 and 12),
  class text,
  second_attr text,
  birthplace text check (birthplace is null or char_length(birthplace) <= 40),
  grandparent_name text check (grandparent_name is null or char_length(grandparent_name) <= 40),
  status public.member_status not null default 'pending',
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  -- The party list: the host, then friends in the order they finished Session Zero (§12a).
  session_zero_done_at timestamptz,
  primary key (party_id, user_id)
);

-- Helpers (security definer, so the access rules below do not call themselves).
create function public.is_party_member(p_party uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.party_members m
    where m.party_id = p_party and m.user_id = auth.uid() and m.status = 'approved'
  );
$$;

create function public.is_party_host(p_party uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.parties p where p.id = p_party and p.host_id = auth.uid());
$$;

-- A profile is made with every new account, named from the sign-up form or the email.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Friend'), 12)
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Access rules: a player sees only their own parties and the people in them.
alter table public.profiles enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;

create policy "profiles: own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles: party mates" on public.profiles for select to authenticated using (
  exists (
    select 1 from public.party_members a join public.party_members b on a.party_id = b.party_id
    where a.user_id = auth.uid() and a.status = 'approved' and b.user_id = profiles.id
  )
);
create policy "profiles: edit own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "parties: members" on public.parties for select to authenticated
  using (public.is_party_member(id) or host_id = auth.uid());
create policy "parties: host edits" on public.parties for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());

create policy "members: see own row" on public.party_members for select to authenticated using (user_id = auth.uid());
create policy "members: see party" on public.party_members for select to authenticated using (public.is_party_member(party_id));
-- A member edits only their own character and Session Zero fields; status changes go through the functions below.
create policy "members: edit own" on public.party_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create function public.guard_member_status() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status and current_setting('mythios.allow_status', true) is distinct from 'on' then
    raise exception 'status is changed by the host, not directly';
  end if;
  -- Nobody moves their row to another party or changes when they joined.
  if new.party_id is distinct from old.party_id or new.user_id is distinct from old.user_id
     or new.joined_at is distinct from old.joined_at then
    raise exception 'this cannot be changed';
  end if;
  return new;
end;
$$;
create trigger guard_member_status before update on public.party_members
  for each row execute function public.guard_member_status();

-- Making a party: the maker is its host, approved at once.
create function public.create_party(p_name text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  insert into public.parties (name, host_id) values (p_name, auth.uid()) returning id into v_party;
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name, status)
  values (v_party, auth.uid(), p_character_name, 'approved');
  return v_party;
end;
$$;

-- Asking to join with an invite code; the host approves (§12a). Closed when the party has six.
create function public.request_join(p_invite_code text, p_character_name text) returns uuid
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
  return v_party;
end;
$$;

-- The host approves or removes a friend. Approving the sixth closes the invite.
create function public.set_member_status(p_party uuid, p_user uuid, p_status public.member_status) returns void
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
  select count(*) into v_count from public.party_members where party_id = p_party and status = 'approved';
  if v_count >= 6 then update public.parties set invite_open = false where id = p_party; end if;
end;
$$;

-- Leaving. If the host leaves, the friend who joined first becomes host (§12a).
create function public.leave_party(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_next uuid;
begin
  perform set_config('mythios.allow_status', 'on', true);
  update public.party_members set status = 'left' where party_id = p_party and user_id = auth.uid();
  if public.is_party_host(p_party) then
    select user_id into v_next from public.party_members
    where party_id = p_party and status = 'approved' order by joined_at limit 1;
    if v_next is not null then update public.parties set host_id = v_next where id = p_party; end if;
  end if;
end;
$$;

-- A new invite link; the old one stops working (§12a).
create function public.new_invite_code(p_party uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_code text := substr(md5(gen_random_uuid()::text), 1, 10);
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  update public.parties set invite_code = v_code, invite_open = true where id = p_party;
  return v_code;
end;
$$;

revoke execute on function public.create_party, public.request_join, public.set_member_status,
  public.leave_party, public.new_invite_code from public, anon;
grant execute on function public.create_party, public.request_join, public.set_member_status,
  public.leave_party, public.new_invite_code to authenticated;

-- The helpers are for the access rules only; the sign-up trigger is for the database only.
revoke execute on function public.is_party_member, public.is_party_host from public, anon;
grant execute on function public.is_party_member, public.is_party_host to authenticated;
revoke execute on function public.handle_new_user, public.guard_member_status from public, anon, authenticated;
