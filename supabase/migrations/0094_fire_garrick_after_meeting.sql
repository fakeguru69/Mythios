-- Fake Guru, 18 Oct, after playing Week 1 Day 1: "A word with Garrick" answered at the Day 1 fire, before the party
-- has met him (they meet him in Week 1 Day 2's chapter). The fire now needs the same rule as the thread and the party
-- chat (0044): you have met him. Until then the fire offers no word with him (the screen hides it when this raises).
-- Also, in both places, never on your Week 1 Day 1 (a late joiner plays it after the party chat has opened).
-- Same shape as 0067. Additive (create or replace).
create or replace function public.garrick_private_open(p_party uuid, p_place text) returns table (o_week int, o_day int)
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
    if not public.party_chat_open(p_party) then raise exception 'you have not met Garrick yet'; end if;
    select f.o_week, f.o_day into v_week, v_day from public.my_fire_day(p_party) f;
    if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
      raise exception 'you are not at the fire yet';
    end if;
  else
    raise exception 'bad place';
  end if;
  -- Week 1 Day 1 is before the party meets him, whatever the clock says (a late joiner plays it on Day 3 or later).
  if v_week = 1 and v_day = 1 then raise exception 'you have not met Garrick yet'; end if;
  return query select v_week, v_day;
end;
$$;
revoke execute on function public.garrick_private_open from public, anon;
grant execute on function public.garrick_private_open to authenticated;
