-- 0135 (25 Oct 2026): the Week 1 audit found GO OUT NOW the weakest One breath pick in every party size
-- (+2 on one roll is worth about 4 points of a bar; THE NEW PROP is 10; STAY WHERE YOU ARE is about 2 a friend).
-- GO OUT NOW now gives +4 on the chosen friend's first United Effort roll (about 8 points). Picked by Claude.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_ue_roll(uuid,jsonb,jsonb)'::regprocedure);
  n := replace(d, $o$-- One breath (0134): GO OUT NOW, +2 on the chosen friend's first roll;$o$,
                  $n$-- One breath (0134, 0135): GO OUT NOW, +4 on the chosen friend's first roll;$n$);
  n := replace(n, $o$where x ->> 'by' = v_roller::text) then 2$o$, $n$where x ->> 'by' = v_roller::text) then 4$n$);
  if n = d or strpos(n, $o$v_roller::text) then 4$o$) = 0 then raise exception 'g_ue_roll: text not found'; end if;
  execute n;
end $mig$;
