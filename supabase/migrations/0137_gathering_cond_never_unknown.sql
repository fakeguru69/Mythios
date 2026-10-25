-- 0137 (25 Oct 2026, found in a local Gathering 1 play-through): when the party made no call at Day 6's fire, the
-- 'call' condition (0134) compared a missing value and came back unknown instead of false, and an unknown condition
-- lets its line through, so a party that called nothing heard both "Last night by the fire you said…" lines. Every
-- condition now reads an unknown as false.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_cond(jsonb,jsonb)'::regprocedure);
  n := replace(d, $o$  select case p_cond ->> 'on'$o$, $n$  select coalesce(case p_cond ->> 'on'$n$);
  n := replace(n, $o$    else false end;$o$, $n$    else false end, false);$n$);
  if n = d or strpos(n, 'else false end, false);') = 0 or strpos(n, 'select coalesce(case') = 0 then
    raise exception 'g_cond: text not found';
  end if;
  execute n;
end $mig$;
