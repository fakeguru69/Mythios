-- 0136 (25 Oct 2026, found in a local Gathering 1 play-through): 0131 fixed the doubled article in the morning card
-- (party_yesterday), but the party chat's own notice comes from check_member_big_moments, which still posted
-- "The party earned the The Whole Table badge." and "Ana earned the A Clean Night badge." The notice now reads
-- "earned The Whole Table badge" for a badge whose name starts with "The" or "A", and "earned the Perfect badge" for the
-- rest, the same rule as 0131. Notices already posted are left as they are.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.check_member_big_moments(uuid,uuid)'::regprocedure);
  n := replace(d, $o$'The party earned the ' || v_b_title || ' badge.'$o$,
    $n$'The party earned ' || case when v_b_title ~ '^(The|A) ' then v_b_title else 'the ' || v_b_title end || ' badge.'$n$);
  n := replace(n, $o$v_name || ' earned the ' || v_b_title || ' badge.'$o$,
    $n$v_name || ' earned ' || case when v_b_title ~ '^(The|A) ' then v_b_title else 'the ' || v_b_title end || ' badge.'$n$);
  if n = d or strpos(n, 'earned the '' || v_b_title') > 0 then raise exception 'check_member_big_moments: text not found'; end if;
  execute n;
end $mig$;
