-- 0120 (24 Oct, Phase 2 part 5 of the make-it-great plan; decided by Claude on Fake Guru's "use your judgement"):
-- at the last light, each lead shows which friends have already walked it tonight, so the party spreads out and the
-- fire gets more pieces. Never on a quiet (narrated) night, which shows nothing of the others.
-- campfire() is changed by swapping its leads line in place, and the swap is checked.

do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.campfire(uuid)'::regprocedure);
  n := replace(d,
    $o$'leads', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place', 'actions', l -> 'actions'))$o$,
    $n$'leads', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place', 'actions', l -> 'actions',
                  'walkedBy', case when v_narrated then '[]'::jsonb else
                    (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                     join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                     where f.party_id = p_party and f.week = v_week and f.day = v_day and f.lead_id = l ->> 'id') end))$n$);
  if n = d then raise exception 'campfire: leads line not found'; end if;
  execute n;
end
$mig$;
