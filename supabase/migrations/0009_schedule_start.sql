-- The host picks the day the story starts, for example next Monday (Fake Guru, 16 Oct; Core Rules §11:
-- "The host decides when Episode 1 starts."). Day 1 opens at 5:00am that day on the party's clock.
-- The day can be changed until Day 1 opens; the clock is locked from the moment the start is set (§12a).
create function public.schedule_season(p_party uuid, p_start date) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare v_tz text; v_day1 timestamptz; v_ready int; v_open timestamptz;
begin
  if not public.is_party_host(p_party) then raise exception 'only the host can do this'; end if;
  select time_zone, day1_opens_at into v_tz, v_day1 from public.parties where id = p_party;
  if v_day1 is not null and now() >= v_day1 then raise exception 'the story has already started'; end if;
  select count(*) into v_ready from public.party_members where party_id = p_party and status = 'approved' and ready;
  if v_ready < 2 then raise exception 'needs two of you ready'; end if;
  v_open := (p_start + time '05:00') at time zone v_tz;
  if v_open <= now() then raise exception 'choose a later day'; end if;
  update public.parties set season_started_at = coalesce(season_started_at, now()), day1_opens_at = v_open where id = p_party;
  return v_open;
end;
$$;
revoke execute on function public.schedule_season from public, anon;
grant execute on function public.schedule_season to authenticated;
