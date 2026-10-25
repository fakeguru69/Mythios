-- 0132 (25 Oct 2026, the plan after the audits, Phase 1): "One breath", the screen half. While the light picks one
-- friend and the others have thirty seconds to tell them what to do, each other friend may now tap one option as
-- advice ('advise'). Every friend sees the advice by name ("Mei and Dev say: GO OUT NOW"); the chosen friend still
-- chooses alone, and no number changes. Advice is kept in the night's state under 'advice', by step.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.gathering_do(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$if p_action in ('go_on', 'tap', 'vote', 'pick', 'step_up',$o$,
                  $n$if p_action in ('go_on', 'tap', 'vote', 'pick', 'advise', 'step_up',$n$);
  n := replace(n, $o$    when 'step_up' then$o$,
    $n$    when 'advise' then
      v_opt := (p_args ->> 'o')::int;
      if st ->> 't' = 'pick' and st ->> 'mode' = 'chosen' and not (s -> 'result' ? v_k)
         and s ->> 'chosen' is distinct from v_me and not coalesce((s ->> 'chosenOpen')::boolean, false)
         and v_opt between 0 and jsonb_array_length(st -> 'options') - 1 then
        s := jsonb_set(s, '{advice}', coalesce(s -> 'advice', '{}'::jsonb)
               || jsonb_build_object(v_k, coalesce(s -> 'advice' -> v_k, '{}'::jsonb) || jsonb_build_object(v_me, v_opt)));
      end if;
    when 'step_up' then$n$);
  if n = d or strpos(n, $o$when 'advise' then$o$) = 0 or strpos(n, $o$'pick', 'advise', 'step_up'$o$) = 0 then
    raise exception 'gathering_do: text not found';
  end if;
  execute n;

  d := pg_get_functiondef('public.g_view(uuid,integer,uuid)'::regprocedure);
  n := replace(d, $o$          'chooseFrom', case when st ->> 'mode' = 'chosen' then (e ->> 'at')::timestamptz + interval '30 seconds' end,$o$,
    $n$          'chooseFrom', case when st ->> 'mode' = 'chosen' then (e ->> 'at')::timestamptz + interval '30 seconds' end,
          'advice', case when st ->> 'mode' = 'chosen' then
            (select coalesce(jsonb_agg(jsonb_build_object('name', public.g_name(p_party, key::uuid), 'o', value::int, 'me', key = v_me)), '[]'::jsonb)
             from jsonb_each(coalesce(s -> 'advice' -> v_k, '{}'::jsonb))) end,$n$);
  if n = d then raise exception 'g_view: text not found'; end if;
  execute n;
end $mig$;

-- The Day 7 alert for a Gathering pinned before 5:00pm says "Today", not "Tonight" (play test, 25 Oct).
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.notify_due()'::regprocedure);
  n := replace(d, $o$when v_day = 7 then 'Tonight: the Gathering, at ' || public.clock_word(g.opens_at, p.time_zone) || '.'$o$,
    $n$when v_day = 7 then case when extract(hour from g.opens_at at time zone p.time_zone) < 17 then 'Today' else 'Tonight' end
                          || ': the Gathering, at ' || public.clock_word(g.opens_at, p.time_zone) || '.'$n$);
  if n = d then raise exception 'notify_due: text not found'; end if;
  execute n;
end $mig$;
