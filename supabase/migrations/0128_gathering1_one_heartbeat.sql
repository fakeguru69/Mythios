-- Phase 4, part 1 (25 Oct; Fake Guru: "Proceed"): Gathering 1's "tell them what to do" moment, on Gathering 6's
-- model (episode 1, "One heartbeat"). The engine's one-friend pick now works on any night:
--   g_cond: 'together' (a party of two or more), and a pick branch marked `together` is shown only with friends, so a
--           friend alone skips the whole moment (their earlier Approach vote never stands in for it).
--   g_advance: the friend who acts is never the friend in the drop (`risk`), when anyone else is here; and if they
--           chose [GO OUT NOW], they take the United Effort's first turn. No numbers change.
-- Each function is patched in place from its live definition; the patch stops if the text it replaces is not there.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_cond(jsonb,jsonb)'::regprocedure);
  n := replace(d, $o$    when 'pick' then (s ->> 'lastPick')::int is not distinct from (p_cond ->> 'option')::int$o$,
    $n$    when 'pick' then (s ->> 'lastPick')::int is not distinct from (p_cond ->> 'option')::int
                     and (not coalesce((p_cond ->> 'together')::boolean, false) or coalesce((s ->> 'n')::int, 1) > 1)
    when 'together' then coalesce((s ->> 'n')::int, 1) > 1$n$);
  if n = d then raise exception 'g_cond: text not found'; end if;
  execute n;

  d := pg_get_functiondef('public.g_advance(uuid,integer)'::regprocedure);
  n := replace(d, $o$            where coalesce(array_length(here, 1), 0) <= 2 or x::text is distinct from s -> 'approach' ->> 'roller'$o$,
    $n$            where (coalesce(array_length(here, 1), 0) <= 1 or x::text is distinct from s ->> 'risk')
              and (coalesce(array_length(here, 1), 0) <= 2 or x::text is distinct from s -> 'approach' ->> 'roller'
                   or x::text is not distinct from s ->> 'risk')$n$);
  n := replace(n, $o$        select x into v_u from unnest(v_list) x order by (x::text is not distinct from s -> 'approach' ->> 'roller'), random() limit 1;$o$,
    $n$        select x into v_u from unnest(v_list) x order by (x::text is not distinct from s -> 'approach' ->> 'roller'), random() limit 1;
        -- Gathering 1's heartbeat: the friend who went out on the boards takes the first turn.
        if s ? 'chosen' and (s ->> 'chosen')::uuid = any(v_list) and (
             select (s -> 'result' ->> ((x.o - 1)::text))::int from jsonb_array_elements(steps) with ordinality x(st2, o)
             where x.st2 ->> 't' = 'pick' and x.st2 ->> 'mode' = 'chosen' and x.st2 ->> 'section' = 'One heartbeat' limit 1) = 0 then
          v_u := (s ->> 'chosen')::uuid;
        end if;$n$);
  if n = d or strpos(n, 'One heartbeat') = 0 or strpos(n, 's ->> ''risk'')') = 0 then raise exception 'g_advance: text not found'; end if;
  execute n;
end $mig$;
