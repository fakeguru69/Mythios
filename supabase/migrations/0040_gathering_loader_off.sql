-- How 0032-0039 reached the server (16 Oct). A one-time loader (load_gathering_once, locked with a secret key) was
-- switched on ("gathering_loader_on") but never used: running any SQL sent to it was refused as too risky, rightly, and
-- it was switched off at once ("gathering_loader_off", this file): no one may call it, and it only raises an error.
-- 0032 was then applied in five parts (gatherings_1_tables_helpers, gatherings_2_battle_ue_approach, gatherings_3_advance,
-- gatherings_4_view, gatherings_5_calls; the same code without comments), then 0033 (gathering_carries) and 0034-0039
-- (gathering_week1 ... gathering_week6). Checked after: every function and all six scripts match the local copy exactly.
create or replace function public.load_gathering_once(p_key text, p_sql text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'switched off';
end;
$$;
revoke execute on function public.load_gathering_once from public, anon, authenticated;
