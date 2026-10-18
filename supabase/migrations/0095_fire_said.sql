-- What was said to a friend at the fire, kept on the server (handoff ledger piece 4b; Fake Guru, 18 Oct: "A server-side
-- record ... Do it"). Piece 4 kept Garrick's (and MYTHIOS's) stored lines per slot in the browser session so a line is
-- never rewritten under the reader; this keeps them across a reload, another phone, and a new session.
--   one row per line shown to a friend: which slot (cup, greet, opener, notice-N, nudge, callback, closer), the words,
--   and when it was first shown. A different line for the same slot is a new row, below the first.
-- The friend's own screen reports what it shows (the stored lines live in the app's data, not the database), the server
-- keeps the order and the times, refuses anything but the known slots, and only hands a friend their own rows. Nobody
-- else reads them. Additive only.

create table public.fire_said (
  id bigint generated always as identity primary key,
  party_id uuid not null references public.parties (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  week int not null,
  day int not null,
  slot text not null check (slot ~ '^(cup|greet|opener|notice-[0-9]{1,2}|nudge|callback|closer)$'),
  body text not null check (length(body) between 1 and 500),
  at timestamptz not null default now()
);
create index fire_said_mine on public.fire_said (party_id, user_id, week, day, slot, id);
alter table public.fire_said enable row level security;
revoke all on public.fire_said from anon, authenticated;

-- Remember the lines this friend's fire is showing, and give back every line shown to them tonight, in order.
-- p_lines: [{ "slot": "nudge", "text": "...", "at": "<time it would first be shown>" }, ...] (at most 20). A line is
-- kept only if it differs from the last one kept for its slot; the first line of a slot keeps the time sent (never in the
-- future), later ones are stamped now. An empty list just reads.
create function public.fire_remember(p_party uuid, p_lines jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid(); v_week int; v_day int; r record; v_last text;
begin
  if v_me is null or not exists (select 1 from public.party_members where party_id = p_party and user_id = v_me and status = 'approved') then
    raise exception 'not in this party';
  end if;
  select f.o_week, f.o_day into v_week, v_day from public.my_fire_day(p_party) f;
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
    raise exception 'you are not at the fire yet';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) > 20 then raise exception 'bad lines'; end if;
  for r in select x ->> 'slot' as slot, x ->> 'text' as txt, nullif(x ->> 'at', '')::timestamptz as at_
           from jsonb_array_elements(p_lines) x loop
    select body into v_last from public.fire_said
      where party_id = p_party and user_id = v_me and week = v_week and day = v_day and slot = r.slot order by id desc limit 1;
    if v_last is distinct from r.txt then
      insert into public.fire_said (party_id, user_id, week, day, slot, body, at)
      values (p_party, v_me, v_week, v_day, r.slot, r.txt, case when v_last is null then least(coalesce(r.at_, now()), now()) else now() end);
    end if;
  end loop;
  return (select coalesce(jsonb_agg(jsonb_build_object('slot', slot, 'text', body, 'at', at) order by id), '[]'::jsonb)
          from public.fire_said where party_id = p_party and user_id = v_me and week = v_week and day = v_day);
end;
$$;
revoke execute on function public.fire_remember from public, anon;
grant execute on function public.fire_remember to authenticated;
