-- Garrick's morning line (Core Rules §1: "He replies when spoken to and may add a line or two a day"; Fake Guru, 16 Oct:
-- one line a day, posted when the day opens at 5:00am). The lines are in src/data/garrickMorningLines.ts and load into
-- garrick_morning_lines (scripts/gen-garrick-morning-sql.ts) once approved; with none loaded, nothing is posted.
-- The line is posted once per party, by the first friend to open the app or the chat that day, and carries the day's
-- 5:00am time so it sits first in that day's chat. Additive: two new tables, one new function, today() replaced in place.

create table public.garrick_morning_lines (
  series_id text not null,
  season_number int not null,
  week int not null check (week between 1 and 6),
  day int not null check (day between 1 and 7),
  line text not null check (char_length(line) between 1 and 500),
  primary key (series_id, season_number, week, day)
);
alter table public.garrick_morning_lines enable row level security;
revoke all on public.garrick_morning_lines from anon, authenticated;

-- Which mornings a party has had (so each line is posted once, however many friends open at once).
create table public.garrick_mornings (
  party_id uuid not null references public.parties (id) on delete cascade,
  week int not null,
  day int not null,
  message_id bigint,
  primary key (party_id, week, day)
);
alter table public.garrick_mornings enable row level security;
revoke all on public.garrick_mornings from anon, authenticated;

create function public.garrick_morning(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_line text; v_tz text; v_at timestamptz; v_id bigint;
begin
  if not public.is_party_member(p_party) then raise exception 'not in this party'; end if;
  if not public.party_chat_open(p_party) then return; end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then return; end if;
  select l.line into v_line from public.garrick_morning_lines l join public.parties p
    on p.series_id = l.series_id and p.season_number = l.season_number
  where p.id = p_party and l.week = v_week and l.day = v_day;
  if v_line is null then return; end if;
  insert into public.garrick_mornings (party_id, week, day) values (p_party, v_week, v_day) on conflict do nothing;
  if not found then return; end if;
  -- The day opened at 5:00am on the party's clock.
  select p.time_zone into v_tz from public.parties p where p.id = p_party;
  v_at := ((((now() at time zone v_tz) - interval '5 hours')::date + time '05:00') at time zone v_tz);
  insert into public.party_messages (party_id, author_id, kind, body, speaker, created_at)
  values (p_party, null, 'chat', v_line, 'garrick', v_at) returning id into v_id;
  update public.garrick_mornings set message_id = v_id where party_id = p_party and week = v_week and day = v_day;
  insert into public.garrick_log (party_id, at, reply_id, route, category, reply, flags)
  values (p_party, v_at, v_id, 'MORNING_LINE', 'morning', v_line, jsonb_build_array('Ep' || v_week || 'D' || v_day));
end;
$$;
revoke execute on function public.garrick_morning from public, anon;
grant execute on function public.garrick_morning to authenticated;

-- today() also posts the morning line, so it is there whichever screen a friend opens first. Same shape as 0033.
create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  perform public.garrick_morning(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'claims', public.party_claims(p_party),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null)
  ) into r;
  return r;
end;
$$;
