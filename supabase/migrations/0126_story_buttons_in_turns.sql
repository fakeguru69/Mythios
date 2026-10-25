-- Phase 4, part 6 (25 Oct; Fake Guru: "Ok, go on"): story buttons at the Gathering go in turns, so the fastest friend
-- does not take every one. Each [ACT] is offered to the next friend present, in party order (g_advance: the log entry's
-- `turn`, the state's `actLast`). Anyone may tap it once 15 seconds have passed, or at once if that friend has gone,
-- and in a party of one or two present it is open to all from the start. g_view says whose turn it is.
-- Each function is patched in place from its live definition; the patch stops if the text it replaces is not there.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_advance(uuid,integer)'::regprocedure);
  n := replace(d, $o$v_changed boolean := false;$o$, $o$v_changed boolean := false; v_turn uuid; v_po uuid[];$o$);
  n := replace(n, $o$        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'act', 'label', public.g_fill(p_party, st ->> 'label', s)));$o$,
    $n$        -- Whose turn: the next friend here, in party order, after the last one offered a button.
        v_po := array(select x from unnest(public.g_party_order(p_party)) x where x = any(here));
        v_turn := null;
        if coalesce(array_length(v_po, 1), 0) >= 3 then
          v_turn := v_po[(coalesce(array_position(v_po, (s ->> 'actLast')::uuid), 0) % array_length(v_po, 1)) + 1];
          s := s || jsonb_build_object('actLast', v_turn);
        end if;
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'act', 'label', public.g_fill(p_party, st ->> 'label', s), 'turn', v_turn));$n$);
  if n = d or strpos(n, 'v_turn uuid') = 0 then raise exception 'g_advance: text not found'; end if;
  execute n;

  d := pg_get_functiondef('public.gathering_do(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$      if st ->> 't' = 'act' and not (s -> 'tapped' ? v_k) then$o$,
    $n$      if st ->> 't' = 'act' and not (s -> 'tapped' ? v_k)
         and (s -> 'log' -> -1 ->> 'turn' is null or s -> 'log' -> -1 ->> 'turn' = v_me
              or now() >= (s -> 'log' -> -1 ->> 'at')::timestamptz + interval '15 seconds'
              or not ((s -> 'log' -> -1 ->> 'turn')::uuid = any(public.g_here(p_party, v_week)))) then$n$);
  if n = d then raise exception 'gathering_do: text not found'; end if;
  execute n;

  d := pg_get_functiondef('public.g_view(uuid,integer,uuid)'::regprocedure);
  n := replace(d, $o$        item := item || jsonb_build_object('by', s -> 'tappedBy' -> v_k, 'tapped', s -> 'tapped' ? v_k);$o$,
    $n$        item := item || jsonb_build_object('by', s -> 'tappedBy' -> v_k, 'tapped', s -> 'tapped' ? v_k,
          'turn', case when e ->> 'turn' is not null then public.g_name(p_party, (e ->> 'turn')::uuid) end,
          'turnIsMe', e ->> 'turn' = v_me,
          'openAt', case when e ->> 'turn' is not null then (e ->> 'at')::timestamptz + interval '15 seconds' end);$n$);
  if n = d then raise exception 'g_view: text not found'; end if;
  execute n;
end $mig$;
