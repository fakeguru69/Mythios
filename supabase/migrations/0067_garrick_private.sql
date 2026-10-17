-- Private questions to Garrick (Fake Guru, 17 Oct: "go with your suggestion"; Core Rules §1 "Your thread": private
-- questions to Garrick; Core Rules §12a "A player's thread is private"; Campfire table §E "No AI free text" at the fire).
-- Two places, both private to the friend who asks:
--   'thread': in your own thread, once you have met him (the same rule as the party chat opening, 0044). The router
--             answers; small talk may go to the AI behind the filter, sharing the party's 12 a day.
--   'fire':   at the Campfire, once you are at today's fire. Stored lines only, and never "Malakor" (router: atCampfire).
-- The server function "garrick" does the routing; the router's hidden meanings never leave it. Additive only.

create table public.garrick_private (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  place text not null check (place in ('thread', 'fire')),
  week int not null,
  day int not null,
  question text not null,
  reply text not null,
  at timestamptz not null default now()
);
create index garrick_private_mine on public.garrick_private (party_id, user_id, week, day, at);
alter table public.garrick_private enable row level security;
revoke all on public.garrick_private from anon, authenticated;

-- May this friend ask him privately here, now? Called as the friend (by the server function, with the friend's own
-- sign-in), so auth.uid() is the asker. Returns the week and day the question belongs to, or raises.
create function public.garrick_private_open(p_party uuid, p_place text) returns table (o_week int, o_day int)
language plpgsql security definer set search_path = '' as $$
declare v_me uuid := auth.uid(); v_week int; v_day int;
begin
  if v_me is null or not exists (select 1 from public.party_members where party_id = p_party and user_id = v_me and status = 'approved') then
    raise exception 'not in this party';
  end if;
  if p_place = 'thread' then
    if not public.party_chat_open(p_party) then raise exception 'you have not met Garrick yet'; end if;
    select t.o_week, t.o_day into v_week, v_day from public.my_today_row(p_party) t;
  elsif p_place = 'fire' then
    select f.o_week, f.o_day into v_week, v_day from public.my_fire_day(p_party) f;
    if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
      raise exception 'you are not at the fire yet';
    end if;
  else
    raise exception 'bad place';
  end if;
  return query select v_week, v_day;
end;
$$;
revoke execute on function public.garrick_private_open from public, anon;
grant execute on function public.garrick_private_open to authenticated;

-- His private answer, and its log line (stored-lines rule 7). Called only by the server function.
create function public.garrick_private_post(p_party uuid, p_user uuid, p_place text, p_week int, p_day int, p_question text,
                                            p_reply text, p_route text, p_category text, p_flags jsonb, p_ai boolean,
                                            p_filtered text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint;
begin
  insert into public.garrick_private (party_id, user_id, place, week, day, question, reply)
  values (p_party, p_user, p_place, p_week, p_day, left(p_question, 300), left(p_reply, 500)) returning id into v_id;
  insert into public.garrick_log (party_id, asked_by, route, category, reply, flags, ai, filtered)
  values (p_party, p_user, p_route || ':' || upper(p_place), p_category, p_reply, coalesce(p_flags, '[]'::jsonb), p_ai, p_filtered);
  return v_id;
end;
$$;
revoke execute on function public.garrick_private_post from public, anon, authenticated;
grant execute on function public.garrick_private_post to service_role;

-- Your own private questions and his answers, for today, in one place. Nobody else's.
create function public.my_garrick_private(p_party uuid, p_place text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.garrick_private_open(p_party, p_place);
  return coalesce((select jsonb_agg(jsonb_build_object('q', question, 'a', reply) order by at)
                   from public.garrick_private
                   where party_id = p_party and user_id = auth.uid() and place = p_place and week = v_week and day = v_day), '[]'::jsonb);
end;
$$;
revoke execute on function public.my_garrick_private from public, anon;
grant execute on function public.my_garrick_private to authenticated;
