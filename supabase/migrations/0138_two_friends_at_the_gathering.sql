-- 0138 (25 Oct 2026, outside audits of a party of two; Fake Guru pasted them):
--   g_fill: the Gathering's lines are filled on the server, so the short versions written for two friends
--     (smallPartyLines.ts) never reached them. With two friends, One breath no longer calls "Everyone else" (there is
--     one other friend), and Gathering 4's water-gate no longer needs three pairs of hands.
--   g_week_facts: a night the fire split is noted as 'S', so Gathering 1 can say so ("you could not agree"). With two
--     friends any disagreement is a split, and the night that answered the week said nothing at all.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_fill(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $o$  v := replace(v, '{N}', w);$o$, $n$  v := replace(v, '{N}', w);
  -- Two friends (0138): the lines canon writes for three or more.
  if coalesce((s ->> 'n')::int, 1) = 2 then
    v := replace(v, '**Everyone else: you have thirty seconds.', '**You have thirty seconds.');
    v := replace(v, 'Two of you take his shoulders. Somebody finds a knife with a good point.',
                    'One of you takes his shoulders. The other finds a knife with a good point.');
    v := replace(v, 'The two holding his shoulders have to go under with him to keep hold.',
                    'The one holding his shoulders has to go under with him to keep hold.');
  end if;$n$);
  if n = d then raise exception 'g_fill: text not found'; end if;
  execute n;

  d := pg_get_functiondef('public.g_week_facts(uuid,integer)'::regprocedure);
  n := replace(d, $o$      v_calls := v_calls || jsonb_build_object(v_d::text, v_call ->> 'reading');
    end if;$o$, $n$      v_calls := v_calls || jsonb_build_object(v_d::text, v_call ->> 'reading');
    elsif v_call is not null and coalesce((v_call ->> 'split')::boolean, false) then
      v_calls := v_calls || jsonb_build_object(v_d::text, 'S');
    end if;$n$);
  if n = d then raise exception 'g_week_facts: text not found'; end if;
  execute n;
end $mig$;
