-- The party chat (Core Rules §1 "The three places", §12a "People and accounts"): the friends' own talk and the
-- party's one-line notices. Garrick and MYTHIOS's lines, day results and fragment news come with the days.

create table public.party_messages (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null, -- null for a notice
  kind text not null check (kind in ('chat', 'notice')),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index party_messages_party_time on public.party_messages (party_id, created_at);
alter table public.party_messages enable row level security;
create policy "messages: party sees" on public.party_messages for select to authenticated
  using (public.is_party_member(party_id));
revoke insert, update, delete on public.party_messages from anon, authenticated;

-- A friend writes in the chat (approved members only).
create function public.post_message(p_party uuid, p_body text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint; v_body text := btrim(coalesce(p_body, ''));
begin
  if not public.is_party_member(p_party) then raise exception 'not in this party'; end if;
  if char_length(v_body) < 1 or char_length(v_body) > 500 then raise exception 'a message is 1 to 500 characters'; end if;
  insert into public.party_messages (party_id, author_id, kind, body) values (p_party, auth.uid(), 'chat', v_body)
  returning id into v_id;
  return v_id;
end;
$$;

-- Notices, written by the server in canon's words (§12a).
create function public.member_notices() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.status = 'approved' and new.status in ('left', 'removed') then
    insert into public.party_messages (party_id, kind, body) values (new.party_id, 'notice', new.character_name || ' has left the road.');
  elsif new.status = 'approved' and old.status = 'approved' and new.character_name is distinct from old.character_name then
    insert into public.party_messages (party_id, kind, body) values (new.party_id, 'notice', old.character_name || ' is now ' || new.character_name || '.');
  end if;
  return new;
end;
$$;
create trigger member_notices after update on public.party_members
  for each row execute function public.member_notices();

create function public.host_notice() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.host_id is distinct from old.host_id then
    insert into public.party_messages (party_id, kind, body)
    select new.id, 'notice', m.character_name || ' now leads the party.'
    from public.party_members m where m.party_id = new.id and m.user_id = new.host_id;
  end if;
  return new;
end;
$$;
create trigger host_notice after update on public.parties
  for each row execute function public.host_notice();

-- Reporting: press and hold a message, then [REPORT] (review-accounts-and-invites.md §5). It comes to the makers;
-- the person reported is not told, and players cannot read reports.
create table public.message_reports (
  id bigint generated always as identity primary key,
  message_id bigint not null references public.party_messages (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table public.message_reports enable row level security;
revoke all on public.message_reports from anon, authenticated;

create function public.report_message(p_message bigint, p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_party uuid;
begin
  select party_id into v_party from public.party_messages where id = p_message;
  if v_party is null or not public.is_party_member(v_party) then raise exception 'not in this party'; end if;
  insert into public.message_reports (message_id, reporter_id, note)
  values (p_message, auth.uid(), nullif(btrim(coalesce(p_note, '')), ''));
end;
$$;

revoke execute on function public.post_message, public.report_message from public, anon;
grant execute on function public.post_message, public.report_message to authenticated;
revoke execute on function public.member_notices, public.host_notice from public, anon, authenticated;

-- Live updates for the chat.
alter publication supabase_realtime add table public.party_messages;
