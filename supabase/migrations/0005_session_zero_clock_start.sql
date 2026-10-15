-- Session Zero, the party's clock and starting the story (Core Rules §7, §11, §12a;
-- review-accounts-and-invites.md). Also: players change only names directly; everything else goes through functions.

alter table public.parties add column if not exists day1_opens_at timestamptz;

alter table public.party_members
  add constraint party_members_class_check
    check (class is null or class in ('Warrior', 'Artificer', 'Sage', 'Trickster', 'Assassin', 'Archer')),
  add constraint party_members_second_attr_check
    check (second_attr is null or second_attr in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'));

-- Direct edits: a player's own name, their name in a party, and the party's name (host). Nothing else.
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;
revoke update on public.party_members from authenticated, anon;
grant update (character_name) on public.party_members to authenticated;
revoke update on public.parties from authenticated, anon;
grant update (name) on public.parties to authenticated;

-- Each class's own Attribute (Core Rules §2).
create function public.class_attribute(p_class text) returns text
language sql immutable set search_path = '' as $$
  select case p_class
    when 'Warrior' then 'Might' when 'Artificer' then 'Craft' when 'Sage' then 'Intellect'
    when 'Trickster' then 'Charm' when 'Assassin' then 'Agility' when 'Archer' then 'Aim' end;
$$;

-- The invite closes when the party has six, or at the end of Episode 1 Day 2 (§12a).
create function public.party_set_off(p_party uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select now() >= p.day1_opens_at + interval '2 days' from public.parties p where p.id = p_party), false);
$$;

-- Making a party now also sets its clock (the host picks the time zone; §11). make_party replaces create_party,
-- which is closed to players below (nothing is deleted in a migration, so old calls fail plainly instead).
create function public.make_party(p_name text, p_character_name text, p_time_zone text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then raise exception 'choose a clock'; end if;
  insert into public.parties (name, host_id, time_zone) values (p_name, auth.uid(), p_time_zone) returning id into v_party;
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name, status)
  values (v_party, auth.uid(), p_character_name, 'approved');
  perform set_config('mythios.allow_status', 'off', true);
  return v_party;
end;
$$;

-- The host changes the clock until the story starts; then it is locked (§12a).
create function public.set_party_clock(p_party uuid, p_time_zone text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then raise exception 'choose a clock'; end if;
  update public.parties set time_zone = p_time_zone where id = p_party and season_started_at is null;
  if not found then raise exception 'the clock is locked once the story starts'; end if;
end;
$$;

-- Asking to join: refused once the party has set off, when full, or for a friend who left, was removed or turned away.
create or replace function public.request_join(p_invite_code text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid; v_count int; v_status public.member_status;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select id into v_party from public.parties where invite_code = p_invite_code;
  if v_party is null then raise exception 'this invite no longer works'; end if;
  select status into v_status from public.party_members where party_id = v_party and user_id = auth.uid();
  if v_status = 'turned_away' then raise exception 'not this time'; end if;
  if v_status in ('left', 'removed') then raise exception 'you cannot come back'; end if;
  if v_status is not null then return v_party; end if;
  if public.party_set_off(v_party) then raise exception 'this party has set off'; end if;
  if not (select invite_open from public.parties where id = v_party) then raise exception 'this invite no longer works'; end if;
  select count(*) into v_count from public.party_members where party_id = v_party and status = 'approved';
  if v_count >= 6 then raise exception 'this party is full'; end if;
  insert into public.party_members (party_id, user_id, character_name)
  values (v_party, auth.uid(), p_character_name);
  return v_party;
end;
$$;

-- The host lets a friend in, or does not ("turned away"), or removes a friend who is in.
create or replace function public.set_member_status(p_party uuid, p_user uuid, p_status public.member_status) returns void
language plpgsql security definer set search_path = '' as $$
declare v_count int; v_old public.member_status; v_new public.member_status := p_status;
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  if p_status not in ('approved', 'removed') then raise exception 'the host approves or removes'; end if;
  if p_user = auth.uid() then raise exception 'the host leaves, not removes'; end if;
  select status into v_old from public.party_members where party_id = p_party and user_id = p_user;
  if v_old is null or v_old in ('left', 'removed', 'turned_away') then raise exception 'not in this party'; end if;
  if p_status = 'approved' then
    if v_old <> 'pending' then return; end if;
    if public.party_set_off(p_party) then raise exception 'this party has set off'; end if;
    select count(*) into v_count from public.party_members where party_id = p_party and status = 'approved';
    if v_count >= 6 then raise exception 'this party is full'; end if;
  elsif v_old = 'pending' then
    v_new := 'turned_away';
  end if;
  perform set_config('mythios.allow_status', 'on', true);
  update public.party_members set status = v_new where party_id = p_party and user_id = p_user;
  perform set_config('mythios.allow_status', 'off', true);
  select count(*) into v_count from public.party_members where party_id = p_party and status = 'approved';
  if v_count >= 6 then update public.parties set invite_open = false where id = p_party; end if;
end;
$$;

-- Session Zero's choices, saved when the player taps [READY] (§7). The first finish sets their place in the party list.
create function public.finish_session_zero(p_party uuid, p_class text, p_second_attr text, p_birthplace text, p_grandparent_name text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_done timestamptz; v_day1 timestamptz;
begin
  select session_zero_done_at into v_done from public.party_members
  where party_id = p_party and user_id = auth.uid() and status = 'approved';
  if not found then raise exception 'not in this party'; end if;
  select day1_opens_at into v_day1 from public.parties where id = p_party;
  -- Class and second Attribute cannot be changed once Day 1 opens.
  if v_done is not null and v_day1 is not null and now() >= v_day1 then raise exception 'too late to change'; end if;
  if public.class_attribute(p_class) is null then raise exception 'choose a class'; end if;
  if p_second_attr is null or p_second_attr not in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim')
     or p_second_attr = public.class_attribute(p_class) then raise exception 'choose a second strength'; end if;
  update public.party_members
  set class = p_class,
      second_attr = p_second_attr,
      birthplace = nullif(btrim(coalesce(p_birthplace, '')), ''),
      grandparent_name = nullif(btrim(coalesce(p_grandparent_name, '')), ''),
      ready = true,
      session_zero_done_at = coalesce(session_zero_done_at, now())
  where party_id = p_party and user_id = auth.uid();
end;
$$;

-- The host starts the story: at least two ready; Day 1 opens at the next 5:00am on the party's clock (§11, §12a).
create function public.start_season(p_party uuid) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare v_tz text; v_ready int; v_local timestamp; v_open timestamp;
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  select time_zone into v_tz from public.parties where id = p_party and season_started_at is null;
  if v_tz is null then raise exception 'the story has already started'; end if;
  select count(*) into v_ready from public.party_members where party_id = p_party and status = 'approved' and ready;
  if v_ready < 2 then raise exception 'needs two of you ready'; end if;
  v_local := now() at time zone v_tz;
  v_open := date_trunc('day', v_local) + interval '5 hours';
  if v_open <= v_local then v_open := v_open + interval '1 day'; end if;
  update public.parties set season_started_at = now(), day1_opens_at = v_open at time zone v_tz where id = p_party;
  return v_open at time zone v_tz;
end;
$$;

-- The invite page: who sent it, the party, who is already in it, and whether it still works.
-- invite_details replaces invite_info (closed below).
create function public.invite_details(p_invite_code text)
returns table (party_name text, host_name text, members text, open boolean, set_off boolean, full boolean)
language sql stable security definer set search_path = '' as $$
  select p.name,
         (select m.character_name from public.party_members m where m.party_id = p.id and m.user_id = p.host_id),
         (select string_agg(m.character_name, ', ' order by (m.user_id <> p.host_id), m.session_zero_done_at nulls last, m.joined_at)
            from public.party_members m where m.party_id = p.id and m.status = 'approved'),
         p.invite_open,
         public.party_set_off(p.id),
         (select count(*) >= 6 from public.party_members m where m.party_id = p.id and m.status = 'approved')
  from public.parties p
  where p.invite_code = p_invite_code;
$$;

revoke execute on function public.make_party, public.set_party_clock, public.finish_session_zero,
  public.start_season, public.party_set_off from public, anon;
grant execute on function public.make_party, public.set_party_clock, public.finish_session_zero,
  public.start_season, public.party_set_off to authenticated;
revoke execute on function public.invite_details from public;
grant execute on function public.invite_details to anon, authenticated;
revoke execute on function public.create_party(text, text), public.invite_info(text) from public, anon, authenticated;
