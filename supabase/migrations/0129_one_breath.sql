-- 0129 (25 Oct 2026, audit): the Gatherings' "tell them what to do" moment is renamed "One breath".
-- "Heartbeat" is gated to Week 4 Day 6 (CLAUDE.md §6), and Gatherings 1 to 3 come before it. The
-- first-turn rule in g_advance looked for the section by its old name; it now looks for the new one.
-- Nothing else changes.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_advance(uuid,integer)'::regprocedure);
  n := replace(d, $o$x.st2 ->> 'section' = 'One heartbeat'$o$, $n$x.st2 ->> 'section' = 'One breath'$n$);
  n := replace(n, $o$-- Gathering 1's heartbeat: the friend$o$, $n$-- One breath: the friend$n$);
  if n = d or strpos(n, 'One heartbeat') > 0 then raise exception 'g_advance: text not found'; end if;
  execute n;
end $mig$;
