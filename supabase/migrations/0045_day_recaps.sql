-- The road so far (Fake Guru, 16 Oct: a storybook recap at the start of every day, for everyone). Core Rules "Recap":
-- a friend who missed days gets a short recap of each missed day, then "You missed two days. The story went on. Today is
-- still yours.", then today's beat. Now every friend also gets yesterday's recap, so each day opens on the story so far.
-- The recaps are written per day (Days 1 to 6, and 7 for the Gathering), loaded from src/data/dayRecaps.ts by
-- scripts/gen-recaps-sql.ts; they stay on the server so a phone never holds a later day's story.
-- Additive: one new table, one new function, today() replaced in place (same shape as 0043, two new keys).

create table public.day_recaps (
  series_id text not null,
  season_number int not null,
  week int not null check (week between 1 and 6),
  day int not null check (day between 1 and 7),
  recap text not null check (char_length(recap) between 1 and 4000),
  primary key (series_id, season_number, week, day)
);
alter table public.day_recaps enable row level security;
revoke all on public.day_recaps from anon, authenticated;

-- What the calling friend reads before today's chapter: the recaps of the days since they last played (a weekday counts
-- once its beat was read to the end; Day 7 once they were at the Gathering), always including yesterday's; at most
-- fourteen. "missed" counts the days in between that they did not play.
create function public.my_recaps(p_party uuid, out o_recaps jsonb, out o_missed int)
language plpgsql stable security definer set search_path = '' as $$
declare v_week int; v_day int; v_today int; v_last int; v_from int; v_series text; v_season int;
begin
  if not public.is_party_member(p_party) then raise exception 'not in this party'; end if;
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  o_recaps := '[]'::jsonb; o_missed := 0;
  if v_week is null then return; end if;
  v_today := (v_week - 1) * 7 + (v_day - 1);
  if v_today = 0 then return; end if;
  select max(i) into v_last from (
    select (md.week - 1) * 7 + (md.day - 1) i from public.member_days md
    where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null
    union all
    select (gp.week - 1) * 7 + 6 from public.gathering_present gp where gp.party_id = p_party and gp.user_id = auth.uid()
  ) x where i < v_today;
  o_missed := v_today - 1 - coalesce(v_last, -1);
  v_from := greatest(least(coalesce(v_last, -1) + 1, v_today - 1), v_today - 14);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select coalesce(jsonb_agg(jsonb_build_object('week', r.week, 'day', r.day, 'recap', r.recap) order by r.week, r.day), '[]'::jsonb)
    into o_recaps
  from public.day_recaps r
  where r.series_id = v_series and r.season_number = v_season
    and (r.week - 1) * 7 + (r.day - 1) between v_from and v_today - 1;
end;
$$;
revoke execute on function public.my_recaps from public, anon, authenticated;

-- today() hands out the recaps with the chapter.
create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb; v_recaps jsonb; v_missed int;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  perform public.garrick_morning(p_party);
  select o_recaps, o_missed into v_recaps, v_missed from public.my_recaps(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'claims', public.party_claims(p_party),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null),
    'recaps', v_recaps,
    'missed', v_missed
  ) into r;
  return r;
end;
$$;
