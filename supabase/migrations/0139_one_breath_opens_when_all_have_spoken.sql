-- 0139 (25 Oct 2026; Fake Guru: "use your judgement" on an outside two-friend audit): the chosen friend no longer waits
-- out the full thirty seconds once every other friend here has tapped their advice. With two friends that was one tap
-- and then twenty-five seconds of nothing. The moment the last friend advises, the night notes it ('adviceIn', by step),
-- the choice opens, and the card's clock says so (chooseFrom). It holds for every "chosen" pick: One breath and
-- Gathering 6's act. Nobody's time is cut while anyone has yet to speak.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.gathering_do(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$                or now() < (s -> 'log' -> -1 ->> 'at')::timestamptz + interval '30 seconds') then$o$,
    $n$                or now() < least((s -> 'log' -> -1 ->> 'at')::timestamptz + interval '30 seconds',
                              (s -> 'adviceIn' ->> v_k)::timestamptz)) then$n$);
  n := replace(n, $o$               || jsonb_build_object(v_k, coalesce(s -> 'advice' -> v_k, '{}'::jsonb) || jsonb_build_object(v_me, v_opt)));
      end if;$o$, $n$               || jsonb_build_object(v_k, coalesce(s -> 'advice' -> v_k, '{}'::jsonb) || jsonb_build_object(v_me, v_opt)));
        -- 0139: every other friend here has spoken, so the choice opens now.
        if not exists (select 1 from unnest(public.g_here(p_party, v_week)) h
                       where h::text is distinct from s ->> 'chosen' and not (s -> 'advice' -> v_k ? h::text)) then
          s := s || jsonb_build_object('adviceIn', coalesce(s -> 'adviceIn', '{}'::jsonb) || jsonb_build_object(v_k, now()));
        end if;
      end if;$n$);
  if n = d or strpos(n, 'adviceIn') = 0 or strpos(n, $o$least((s -> 'log' -> -1 ->> 'at')::timestamptz$o$) = 0 then
    raise exception 'gathering_do: text not found';
  end if;
  execute n;

  d := pg_get_functiondef('public.g_view(uuid,integer,uuid)'::regprocedure);
  n := replace(d, $o$          'chooseFrom', case when st ->> 'mode' = 'chosen' then (e ->> 'at')::timestamptz + interval '30 seconds' end,$o$,
    $n$          'chooseFrom', case when st ->> 'mode' = 'chosen' then least((e ->> 'at')::timestamptz + interval '30 seconds', (s -> 'adviceIn' ->> v_k)::timestamptz) end,$n$);
  if n = d then raise exception 'g_view: text not found'; end if;
  execute n;
end $mig$;
