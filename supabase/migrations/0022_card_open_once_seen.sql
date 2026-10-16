-- The Store is closed while your own card or fight is open (Core Rules §8). A card or fight counts as open only once
-- the player has opened that day's chapter: on a day whose chapter starts with its card (Week 1 Day 6), the Store
-- stays open until the player opens the chapter and sees it. Additive: a new column; today() and store_closed_by()
-- replaced with the same shape.

alter table public.member_days add column opened_at timestamptz;

create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null)
  ) into r;
  return r;
end;
$$;

create or replace function public.store_closed_by(p_party uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step text; v_row public.member_days;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  if v_row.opened_at is null then return null; end if;
  v_step := public.day_open_step(p_party, auth.uid(), v_week, v_day);
  if v_step = 'card' and not v_row.aside then return 'card'; end if;
  if v_step = 'press' then return 'card'; end if;
  if v_step = 'fight' and (not v_row.aside or jsonb_array_length(coalesce(v_row.fight -> 'rounds', '[]'::jsonb)) > 0) then
    return 'fight';
  end if;
  return null;
end;
$$;
