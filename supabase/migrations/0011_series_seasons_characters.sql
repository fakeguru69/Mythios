-- Mythios is the app; "Tales of the Dark Moon" is one series of many, and a series has seasons (Fake Guru, 16 Oct).
-- A player has one character per series, with its own name: different series, different names (Fake Guru, 16 Oct;
-- replaces Core Rules §12a "Two names", which gave each party its own character name).

create table public.series (
  id text primary key,
  title text not null,
  position int not null default 1
);
create table public.seasons (
  series_id text not null references public.series (id),
  number int not null check (number >= 1),
  primary key (series_id, number)
);
insert into public.series (id, title, position) values ('dark-moon', 'Tales of the Dark Moon', 1);
insert into public.seasons (series_id, number) values ('dark-moon', 1);
alter table public.series enable row level security;
alter table public.seasons enable row level security;
create policy "series: anyone reads" on public.series for select to anon, authenticated using (true);
create policy "seasons: anyone reads" on public.seasons for select to anon, authenticated using (true);

-- Each party plays one season of one series.
alter table public.parties add column if not exists series_id text not null default 'dark-moon' references public.series (id);
alter table public.parties add column if not exists season_number int not null default 1;

-- A player's character in a series: its name, class, second strength and the two Session Zero answers.
-- It is kept from season to season (Core Rules §12a, "After the season, each character is kept").
create table public.characters (
  user_id uuid not null references public.profiles (id) on delete cascade,
  series_id text not null references public.series (id),
  name text not null check (char_length(name) between 1 and 12),
  class text check (class is null or class in ('Warrior', 'Artificer', 'Sage', 'Trickster', 'Assassin', 'Archer')),
  second_attr text check (second_attr is null or second_attr in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim')),
  birthplace text check (birthplace is null or char_length(birthplace) <= 40),
  grandparent_name text check (grandparent_name is null or char_length(grandparent_name) <= 40),
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);
alter table public.characters enable row level security;
create policy "characters: own" on public.characters for select to authenticated using (user_id = auth.uid());
create policy "characters: party mates" on public.characters for select to authenticated using (
  exists (
    select 1 from public.party_members a
    join public.party_members b on a.party_id = b.party_id
    join public.parties p on p.id = a.party_id
    where a.user_id = auth.uid() and a.status = 'approved' and b.user_id = characters.user_id and p.series_id = characters.series_id
  )
);
revoke insert, update, delete on public.characters from anon, authenticated;

-- Characters for people already in a party (test data so far), from their party rows.
insert into public.characters (user_id, series_id, name, class, second_attr, birthplace, grandparent_name)
select distinct on (m.user_id, p.series_id) m.user_id, p.series_id, m.character_name, m.class, m.second_attr, m.birthplace, m.grandparent_name
from public.party_members m join public.parties p on p.id = m.party_id
order by m.user_id, p.series_id, m.session_zero_done_at nulls last, m.joined_at
on conflict do nothing;

-- The name shown in a party is the character's name in that series. A name is changed on the character,
-- and every party of that series follows (each posts canon's "Dev is now Devan." once).
revoke update (character_name) on public.party_members from authenticated;

create function public.character_name_for(p_series text) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select c.name from public.characters c where c.user_id = auth.uid() and c.series_id = p_series),
    (select left(pr.display_name, 12) from public.profiles pr where pr.id = auth.uid()),
    'Friend');
$$;

create function public.rename_character(p_series text, p_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_name text := btrim(coalesce(p_name, ''));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 12 then raise exception 'a name is 1 to 12 characters'; end if;
  insert into public.characters (user_id, series_id, name) values (auth.uid(), p_series, v_name)
  on conflict (user_id, series_id) do update set name = excluded.name;
  update public.party_members m set character_name = v_name
  from public.parties p
  where p.id = m.party_id and p.series_id = p_series and m.user_id = auth.uid() and m.character_name is distinct from v_name;
end;
$$;

-- Making a party and asking to join use your character's name in that series.
create or replace function public.make_party(p_name text, p_character_name text, p_time_zone text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then raise exception 'choose a clock'; end if;
  insert into public.parties (name, host_id, time_zone) values (p_name, auth.uid(), p_time_zone) returning id into v_party;
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name, status)
  values (v_party, auth.uid(), public.character_name_for('dark-moon'), 'approved');
  perform set_config('mythios.allow_status', 'off', true);
  return v_party;
end;
$$;

create or replace function public.request_join(p_invite_code text, p_character_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid; v_count int; v_status public.member_status; v_series text;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select id, series_id into v_party, v_series from public.parties where invite_code = p_invite_code;
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
  values (v_party, auth.uid(), public.character_name_for(v_series));
  return v_party;
end;
$$;

-- Session Zero makes (or confirms) the character for the series; its choices are copied to the party row.
-- Class and second strength cannot change once Day 1 has opened in any party that character plays in.
create or replace function public.finish_session_zero(p_party uuid, p_class text, p_second_attr text, p_birthplace text, p_grandparent_name text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_series text; v_char public.characters; v_locked boolean;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select series_id into v_series from public.parties where id = p_party;
  select * into v_char from public.characters where user_id = auth.uid() and series_id = v_series;
  select exists (
    select 1 from public.party_members m join public.parties p on p.id = m.party_id
    where m.user_id = auth.uid() and p.series_id = v_series and m.status = 'approved' and m.session_zero_done_at is not null
      and p.day1_opens_at is not null and now() >= p.day1_opens_at
  ) into v_locked;
  if v_locked and v_char.class is not null then
    -- The character is set: keep its choices.
    p_class := v_char.class; p_second_attr := v_char.second_attr;
    p_birthplace := v_char.birthplace; p_grandparent_name := v_char.grandparent_name;
  end if;
  if public.class_attribute(p_class) is null then raise exception 'choose a class'; end if;
  if p_second_attr is null or p_second_attr not in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim')
     or p_second_attr = public.class_attribute(p_class) then raise exception 'choose a second strength'; end if;
  insert into public.characters (user_id, series_id, name, class, second_attr, birthplace, grandparent_name)
  values (auth.uid(), v_series, public.character_name_for(v_series), p_class, p_second_attr,
          nullif(btrim(coalesce(p_birthplace, '')), ''), nullif(btrim(coalesce(p_grandparent_name, '')), ''))
  on conflict (user_id, series_id) do update
    set class = excluded.class, second_attr = excluded.second_attr,
        birthplace = excluded.birthplace, grandparent_name = excluded.grandparent_name;
  update public.party_members m
  set class = p_class, second_attr = p_second_attr,
      birthplace = nullif(btrim(coalesce(p_birthplace, '')), ''), grandparent_name = nullif(btrim(coalesce(p_grandparent_name, '')), ''),
      ready = true, session_zero_done_at = coalesce(m.session_zero_done_at, now())
  where m.party_id = p_party and m.user_id = auth.uid();
end;
$$;

revoke execute on function public.character_name_for, public.rename_character from public, anon;
grant execute on function public.character_name_for, public.rename_character to authenticated;

-- Making a party for a chosen series (season 1 for now).
create function public.make_series_party(p_series text, p_name text, p_time_zone text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if not exists (select 1 from public.series where id = p_series) then raise exception 'choose a series'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_time_zone) then raise exception 'choose a clock'; end if;
  insert into public.parties (name, host_id, time_zone, series_id, season_number)
  values (p_name, auth.uid(), p_time_zone, p_series, 1) returning id into v_party;
  perform set_config('mythios.allow_status', 'on', true);
  insert into public.party_members (party_id, user_id, character_name, status)
  values (v_party, auth.uid(), public.character_name_for(p_series), 'approved');
  perform set_config('mythios.allow_status', 'off', true);
  return v_party;
end;
$$;

-- The invite page, now naming the series and season.
create function public.invite_card(p_invite_code text)
returns table (party_name text, host_name text, members text, open boolean, set_off boolean, full boolean,
               series_id text, series_title text, season_number int)
language sql stable security definer set search_path = '' as $$
  select d.party_name, d.host_name, d.members, d.open, d.set_off, d.full, s.id, s.title, p.season_number
  from public.parties p
  join public.series s on s.id = p.series_id
  cross join lateral public.invite_details(p_invite_code) d
  where p.invite_code = p_invite_code;
$$;

revoke execute on function public.make_series_party from public, anon;
grant execute on function public.make_series_party to authenticated;
revoke execute on function public.invite_card from public;
grant execute on function public.invite_card to anon, authenticated;
