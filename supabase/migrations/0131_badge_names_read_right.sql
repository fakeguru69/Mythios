-- 0131 (25 Oct 2026, play test): a badge whose name already starts with "The" or "A" was announced with a second
-- article: "The party earned the The Whole Table badge.", "Ana earned the A Whole Week badge." The notice now reads
-- "earned The Whole Table badge" for those and "earned the Perfect badge" for the rest. The check that keeps a badge
-- from being announced twice matches both wordings. The same card said "gave Ben a Aim Relic": it now says "an" before
-- Aim, Agility and Intellect. Notices already posted are left as they are.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.party_yesterday(uuid)'::regprocedure);
  n := replace(d, $o$'The party earned the ' || v_b_title || ' badge.'$o$,
    $n$'The party earned ' || case when v_b_title ~ '^(The|A) ' then v_b_title else 'the ' || v_b_title end || ' badge.'$n$);
  n := replace(n, $o$v_name || ' earned the ' || v_b_title || ' badge.'$o$,
    $n$v_name || ' earned ' || case when v_b_title ~ '^(The|A) ' then v_b_title else 'the ' || v_b_title end || ' badge.'$n$);
  n := replace(n, $o$m.body like '% earned the % badge.' or m.body like 'The party earned the % badge.'$o$,
    $n$m.body like '% earned % badge.' or m.body like 'The party earned % badge.'$n$);
  n := replace(n, $o$coalesce(pm_to.character_name, 'a friend') || ' a ' || rg.relic || ' Relic.'$o$,
    $n$coalesce(pm_to.character_name, 'a friend') || case when rg.relic ~ '^[AEIOU]' then ' an ' else ' a ' end || rg.relic || ' Relic.'$n$);
  if strpos(n, $o$|| ' a ' || rg.relic$o$) > 0 then raise exception 'party_yesterday: relic article not found'; end if;
  if n = d or strpos(n, 'earned the '' || v_b_title') > 0 or strpos(n, 'The party earned % badge.') = 0 then
    raise exception 'party_yesterday: text not found';
  end if;
  execute n;
end $mig$;
