-- The Gathering's open pieces and a late joiner's Day 1 (Fake Guru, 17 Oct: "1 yes"; Core Rules §11, §12a). Additive only.
--   1. A friend who opens the Gathering only after it has ended missed it: they get its recap (the Day 7 recap), and
--      are not counted as having been there ("Day 7 counts as played for a friend who was in the Gathering at any point").
--   2. A friend who arrives after it has started gets one "what you missed" line.
--   3. The Store is closed while your own roll or fight at the Gathering is waiting (as on a weekday, §3).
--   4. Garrick's Recap unlocks once Gathering 6 has ended (§11 "The end of a season"); the lines and what they meant
--      stay on the server until then (table garrick_recaps, loaded by scripts/gen-garrick-recap-sql.ts).
--   5. A friend who joins late plays Day 1 and then the current day, in that order (§12a "The party"). While the party is
--      on Week 1 Day 2 and their Day 1 is not done, their day is Day 1; it does not close by itself until Day 2 ends.

-- ---- 5. A late joiner's Day 1 ----

-- Whether this friend's day is still Week 1 Day 1: they finished Session Zero after Day 1 ended, the party is on
-- Week 1 Day 2, and their Day 1 is neither played nor closed.
create function public.is_late_day1(p_party uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.party_today(p_party) t where t.week = 1 and t.day = 2)
     and exists (select 1 from public.party_members pm where pm.party_id = p_party and pm.user_id = p_user and pm.status = 'approved'
                 and pm.session_zero_done_at >= public.party_day_start(p_party, 1, 2))
     and not exists (select 1 from public.member_days md where md.party_id = p_party and md.user_id = p_user and md.week = 1 and md.day = 1
                     and (md.finished_at is not null or md.closed_at is not null));
$$;

-- Close every friend's open weekday before today (0068), leaving a late joiner's Day 1 open while it is still theirs.
create or replace function public.close_past_days(p_party uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; r public.member_days; v_fight jsonb; n int;
begin
  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then return; end if;
  for r in
    select md.* from public.member_days md
    where md.party_id = p_party and md.finished_at is null and md.closed_at is null and md.day < 7
      and (md.week * 7 + md.day) < (v_week * 7 + v_day)
      and not (md.week = 1 and md.day = 1 and public.is_late_day1(p_party, md.user_id))
    for update skip locked
  loop
    if public.today_meta(p_party, r.week, r.day) is null then continue; end if;
    -- The card: rolled, or it expires as a failure that costs nothing.
    if public.today_step(p_party, r.week, r.day, 'challenge') is not null and r.challenge is null then
      update public.member_days set challenge = jsonb_build_object('pass', false, 'expired', true, 'growth', 0)
      where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
    end if;
    -- [PRESS ON] not taken is left.
    if public.today_step(p_party, r.week, r.day, 'press') is not null and r.press is null
       and coalesce((r.challenge ->> 'pass')::boolean, false) then
      update public.member_days set press = jsonb_build_object('left', true, 'expired', true)
      where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
    end if;
    -- The fight is rolled out (a fight lasts 4 to 6 rounds; 60 is only a guard).
    n := 0;
    loop
      v_fight := public.fight_round_closing(p_party, r.user_id, r.week, r.day);
      exit when public.today_step(p_party, r.week, r.day, 'fight') is null or (v_fight ->> 'done')::boolean;
      n := n + 1;
      exit when n >= 60;
    end loop;
    update public.member_days set closed_at = now(), aside = false
    where party_id = r.party_id and user_id = r.user_id and week = r.week and day = r.day;
  end loop;
end;
$$;

-- The calling player's row for today (0068), with a late joiner's Day 1 first.
create or replace function public.my_today_row(p_party uuid, out o_week int, out o_day int)
language plpgsql security definer set search_path = '' as $$
declare v_class text; v_second text; v_attrs jsonb;
begin
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid()
                 and status = 'approved' and session_zero_done_at is not null) then
    raise exception 'not in this party';
  end if;
  select t.week, t.day into o_week, o_day from public.party_today(p_party) t;
  if o_week is null then raise exception 'the story has not started'; end if;
  perform public.close_past_days(p_party);
  if public.is_late_day1(p_party, auth.uid()) then o_day := 1; end if;
  if not exists (select 1 from public.member_progress where party_id = p_party and user_id = auth.uid()) then
    select class, second_attr into v_class, v_second from public.party_members where party_id = p_party and user_id = auth.uid();
    select jsonb_object_agg(a, case when a = public.class_attribute(v_class) then 14 when a = v_second then 12 else 10 end)
      into v_attrs from unnest(array['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim']) a;
    insert into public.member_progress (party_id, user_id, attrs) values (p_party, auth.uid(), v_attrs);
  end if;
  insert into public.member_days (party_id, user_id, week, day) values (p_party, auth.uid(), o_week, o_day)
  on conflict do nothing;
end;
$$;

-- Which day is the caller's now, with nothing else: after a late joiner's Day 1 is read to its end, their phone asks this
-- to offer the party's day.
create function public.my_today_day(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  return jsonb_build_object('week', v_week, 'day', v_day);
end;
$$;

-- Today (0045), with no recap before a late joiner's Day 1: the story starts for them there.
create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb; v_recaps jsonb; v_missed int;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  perform public.garrick_morning(p_party);
  select o_recaps, o_missed into v_recaps, v_missed from public.my_recaps(p_party);
  if v_week = 1 and v_day = 1 then v_recaps := '[]'::jsonb; v_missed := 0; end if;
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

-- ---- 1 and 2. Missed it, or late ----

-- The phone's tick (0032), now: after the Gathering has ended, a friend who was never in it gets its recap instead of
-- the night (and is not counted as having been there); a friend who came in after it started gets one line.
create or replace function public.gathering_tick(p_party uuid, p_seen text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; here uuid[]; v_all uuid[]; v_key text; v_day int;
        v_first timestamptz; v_late text;
begin
  if v_week is null then return jsonb_build_object('none', true); end if;
  perform public.g_row(p_party, v_week);
  select g2.* into g from public.gatherings g2 where party_id = p_party and week = v_week;
  if g.ended_at is not null and not exists (
    select 1 from public.gathering_present gp where gp.party_id = p_party and gp.week = v_week and gp.user_id = auth.uid()
      and gp.first_at <= g.ended_at) then
    return jsonb_build_object('missed', true, 'week', v_week, 'endedAt', g.ended_at, 'now', now(),
      'recap', public.g_fill(p_party, (select r.recap from public.day_recaps r join public.parties p
                                       on p.series_id = r.series_id and p.season_number = r.season_number
                                       where p.id = p_party and r.week = v_week and r.day = 7),
                             jsonb_build_object('n', coalesce(array_length(public.g_party_order(p_party), 1), 1))));
  end if;
  insert into public.gathering_present (party_id, week, user_id) values (p_party, v_week, auth.uid())
  on conflict (party_id, week, user_id) do update set last_at = now();
  -- Day 7 counts as played for a friend who was in the Gathering at any point (§12a).
  if g.started_at is not null then
    perform public.ensure_progress(p_party, auth.uid());
    insert into public.member_days as md (party_id, user_id, week, day, finished_at) values (p_party, auth.uid(), v_week, 7, now())
    on conflict (party_id, user_id, week, day) do update set finished_at = coalesce(md.finished_at, now());
  end if;
  if g.started_at is null then
    here := public.g_here(p_party, v_week);
    v_all := public.g_party_order(p_party);
    if (now() >= g.opens_at and v_all <@ here) or now() >= g.opens_at + interval '30 minutes' then
      perform public.g_start(p_party, v_week);
    end if;
  end if;
  perform public.g_advance(p_party, v_week);
  select g2.* into g from public.gatherings g2 where party_id = p_party and week = v_week;
  v_key := g.version || ':' || array_to_string(public.g_here(p_party, v_week), ',');
  if p_seen is not distinct from v_key then return jsonb_build_object('same', true, 'now', now()); end if;
  -- "What you missed" (§11 "Late, absent, or dropped"): one line for a friend who came in a minute or more after the start.
  select first_at into v_first from public.gathering_present where party_id = p_party and week = v_week and user_id = auth.uid();
  if g.started_at is not null and v_first > g.started_at + interval '1 minute' then
    v_late := case
      when g.state -> 'battle' ->> 'outcome' = 'ongoing' and v_first < coalesce(g.ended_at, 'infinity'::timestamptz)
        then 'You catch up with the others in the thick of the fight, and join it from the next round. The night so far is below.'
      else 'You catch up with the others after the night has begun. The night so far is below.' end;
  end if;
  return public.g_view(p_party, v_week, auth.uid()) || jsonb_build_object('key', v_key, 'lateLine', v_late);
end;
$$;

-- ---- 3. The Store at the Gathering ----

-- Why the caller's Store is closed (0023), now also 'gathering' while their own roll or fight there is waiting:
-- their Battle fight while it goes on, the Approach when they are the one to roll, a United Effort turn that is theirs.
create or replace function public.store_closed_by(p_party uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step text; v_row public.member_days; s jsonb; v_me text := auth.uid()::text;
begin
  select g.state into s from public.gatherings g
  where g.party_id = p_party and g.started_at is not null and g.ended_at is null order by g.week desc limit 1;
  if s is not null then
    if s -> 'battle' ->> 'outcome' = 'ongoing' and exists (
         select 1 from jsonb_array_elements(coalesce(s -> 'battle' -> 'fighters', '[]'::jsonb)) f
         where f ->> 'id' = v_me and not coalesce((f ->> 'fallen')::boolean, false)) then
      return 'gathering';
    end if;
    if s -> 'approach' ->> 'phase' = 'roll' and s -> 'approach' ->> 'roller' = v_me then return 'gathering'; end if;
    if s -> 'ue' ->> 'outcome' = 'ongoing' and s -> 'ue' ->> 'phase' = 'roll' and s -> 'ue' ->> 'next' = v_me then return 'gathering'; end if;
  end if;
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_row.opened_at is null then return null; end if;
  v_step := public.day_open_step(p_party, auth.uid(), v_week, v_day);
  if v_step = 'card' and not v_row.aside then return 'card'; end if;
  if v_step = 'press' then return 'press'; end if;
  if v_step = 'fight' and (not v_row.aside or jsonb_array_length(coalesce(v_row.fight -> 'rounds', '[]'::jsonb)) > 0) then
    return 'fight';
  end if;
  return null;
end;
$$;

-- ---- 4. Garrick's Recap ----

create table public.garrick_recaps (
  series_id text not null,
  season_number int not null,
  data jsonb not null, -- [{ week, entries: [{ when, line, meaning }] }]
  primary key (series_id, season_number)
);
alter table public.garrick_recaps enable row level security;
revoke all on public.garrick_recaps from anon, authenticated;

-- Every line he said, and what it meant: only once the party's Gathering 6 has ended.
create function public.my_garrick_recap(p_party uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select gr.data from public.garrick_recaps gr join public.parties p on p.series_id = gr.series_id and p.season_number = gr.season_number
  where p.id = p_party
    and exists (select 1 from public.party_members pm where pm.party_id = p_party and pm.user_id = auth.uid() and pm.status = 'approved')
    and exists (select 1 from public.gatherings g where g.party_id = p_party and g.week = 6 and g.ended_at is not null);
$$;

revoke execute on function public.is_late_day1 from public, anon, authenticated;
revoke execute on function public.my_garrick_recap, public.my_today_day from public, anon;
grant execute on function public.my_garrick_recap, public.my_today_day to authenticated;
