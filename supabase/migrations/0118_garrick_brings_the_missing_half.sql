-- 0118 (24 Oct): two friends and the fire's click (rule-breaking word list, row 20, option (a); decided by Claude on
-- Fake Guru's "use your judgement and proceed accordingly").
--
-- A click needs its two pieces laid by two different friends. Two friends lay two of the night's three leads, so on some
-- nights the pair is never laid, and a friend who holds both halves never gets it. Now, in a party of one or two, once
-- every friend has come to the fire tonight (or from 8:00pm on the party's clock), Garrick brings the missing half:
-- when one half is on the table and the other is a lead nobody took, or one friend laid both. The click is recorded with
-- that friend's name and Garrick's; the fire screen gives his line (OnlineCampfire.tsx). Quiet (narrated) nights have no
-- clicks, as before. Larger parties are unchanged.

CREATE OR REPLACE FUNCTION public.fire_check_clicks(p_party uuid, p_week integer, p_day integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_data jsonb := public.campfire_data(p_party, p_week, p_day); v_pieces jsonb; c jsonb; i int := 0;
        v_a jsonb; v_b jsonb; v_names text[]; v_ua text; v_ub text;
        v_size int; v_small boolean; v_ready boolean; v_lead_keys text[];
begin
  if jsonb_typeof(v_data -> 'clicks') <> 'array' or coalesce((v_data ->> 'narrated')::boolean, false) then return; end if;
  v_pieces := public.fire_pieces(p_party, p_week, p_day);

  -- A small party: Garrick may bring the missing half once everyone has come to the fire, or from 8:00pm.
  select count(*) into v_size from public.party_members
  where party_id = p_party and status = 'approved' and session_zero_done_at is not null;
  v_small := v_size between 1 and 2;
  v_ready := v_small and (
    not exists (select 1 from public.party_members m where m.party_id = p_party and m.status = 'approved'
                and m.session_zero_done_at is not null
                and not exists (select 1 from public.fan_outs f where f.party_id = p_party and f.user_id = m.user_id
                                and f.week = p_week and f.day = p_day))
    or (select extract(hour from now() at time zone time_zone) >= 20 from public.parties where id = p_party));
  select coalesce(array_agg(l ->> 'id'), '{}') into v_lead_keys from jsonb_array_elements(coalesce(v_data -> 'leads', '[]'::jsonb)) l;

  for c in select * from jsonb_array_elements(v_data -> 'clicks') loop
    i := i + 1;
    continue when exists (select 1 from public.fire_clicks where party_id = p_party and week = p_week and day = p_day and idx = i);
    select p into v_a from jsonb_array_elements(v_pieces) p
    where p ->> 'key' in (c ->> 'a', 'lead:' || (c ->> 'a'))
       or (c ->> 'a' = 'notice' and p ->> 'kind' = 'notice' and p ->> 'attr' = c ->> 'aAttr');
    select p into v_b from jsonb_array_elements(v_pieces) p
    where p ->> 'key' in (c ->> 'b', 'lead:' || (c ->> 'b'));
    v_ua := null; v_ub := null; v_names := null;
    if v_a is not null and v_b is not null then
      select b1 ->> 'name', b2 ->> 'name' into v_ua, v_ub
      from jsonb_array_elements(v_a -> 'by') b1, jsonb_array_elements(v_b -> 'by') b2
      where b1 ->> 'id' <> b2 ->> 'id' limit 1;
      if v_ua is not null then
        v_names := array[v_ua, v_ub];
      elsif v_ready then
        -- One friend laid both halves: Garrick sets them together.
        v_names := array[v_a -> 'by' -> 0 ->> 'name', 'Garrick'];
      end if;
    elsif v_ready and v_a is not null and c ->> 'b' = any (v_lead_keys) then
      v_names := array[v_a -> 'by' -> 0 ->> 'name', 'Garrick'];
    elsif v_ready and v_b is not null and c ->> 'a' = any (v_lead_keys) then
      v_names := array[v_b -> 'by' -> 0 ->> 'name', 'Garrick'];
    end if;
    continue when v_names is null;
    insert into public.fire_clicks (party_id, week, day, idx, names) values (p_party, p_week, p_day, i, v_names)
    on conflict do nothing;
    if found then
      insert into public.fire_thread (party_id, week, day, kind, body) values (p_party, p_week, p_day, 'click', c ->> 'text');
    end if;
  end loop;
end;
$function$;
