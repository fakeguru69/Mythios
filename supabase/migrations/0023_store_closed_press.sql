-- The Store's closed line names the right way out: a Challenge card can be set aside with [NOT NOW]; a [PRESS ON]
-- card cannot (Core Rules §3), so it is rolled or left. store_closed_by() now returns 'press' for it.
create or replace function public.store_closed_by(p_party uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step text; v_row public.member_days;
begin
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
