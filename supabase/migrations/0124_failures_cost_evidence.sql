-- Phase 3, parts 3 and 4 (24 Oct; Fake Guru: "Ok, go on").
-- 3. A failed Challenge keeps the fact and loses the evidence: a road find with a `lost` text (chapter scripts,
--    "roadFind.lost") reaches the fire as that text when the friend failed the day's Challenge.
-- 4. A failed [PRESS ON] costs a piece, not gold: a friend whose press failed cannot lay the day's pass piece
--    ("What you heard, because you passed"). A press left with [LEAVE IT] costs nothing.
-- Each function is patched in place from its live definition; the patch stops if the text it replaces is not there.
do $mig$
declare d text; n text;
begin
  -- 3: fire_fork_pieces_for(uuid,int,int): the lost text after a failed Challenge.
  d := pg_get_functiondef('public.fire_fork_pieces_for(uuid,integer,integer)'::regprocedure);
  n := replace(d, $o$cb.branch -> 'roadFind' ->> 'text' as body,$o$,
    $n$case when md.challenge is not null and not coalesce((md.challenge ->> 'pass')::boolean, false)
              and not coalesce((md.challenge ->> 'expired')::boolean, false)
              and coalesce(cb.branch -> 'roadFind' ->> 'lost', '') <> ''
         then cb.branch -> 'roadFind' ->> 'lost' else cb.branch -> 'roadFind' ->> 'text' end as body,$n$);
  if n = d then raise exception 'fire_fork_pieces_for: text not found'; end if;
  execute n;

  -- 4: fire_lay: no pass piece after a failed press.
  d := pg_get_functiondef('public.fire_lay(uuid,text)'::regprocedure);
  n := replace(d, $o$select case p_kind when 'pass' then coalesce((challenge ->> 'pass')::boolean, false) and public.fire_pass_text(p_party, v_week, v_day) is not null$o$,
    $n$select case p_kind when 'pass' then coalesce((challenge ->> 'pass')::boolean, false) and public.fire_pass_text(p_party, v_week, v_day) is not null
                                         and not (press is not null and not coalesce((press ->> 'left')::boolean, false) and not coalesce((press ->> 'pass')::boolean, false))$n$);
  if n = d then raise exception 'fire_lay: text not found'; end if;
  execute n;

  -- 4: fire_table: the pass piece is not in the hand after a failed press.
  d := pg_get_functiondef('public.fire_table(uuid)'::regprocedure);
  n := replace(d, $o$coalesce((challenge ->> 'pass')::boolean, false),
           coalesce((press ->> 'pass')::boolean, false)$o$,
    $n$coalesce((challenge ->> 'pass')::boolean, false)
             and not (press is not null and not coalesce((press ->> 'left')::boolean, false) and not coalesce((press ->> 'pass')::boolean, false)),
           coalesce((press ->> 'pass')::boolean, false)$n$);
  if n = d then raise exception 'fire_table: text not found'; end if;
  execute n;
end $mig$;
