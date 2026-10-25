-- 0134 (25 Oct 2026, the plan after the audits, Phase 3: Week 1 as the pilot; Fake Guru: "use your judgement (be
-- critical)"). The Gathering answers the week, and One breath carries weight.
--   g_week_facts: when a Gathering starts it notes, once, the roads the party's friends took that week ("D:choice:option")
--     and each night's call at the fire ("1".."6": 'A' or 'B'; nothing when split or unmade). Kept in state as 'week'.
--   g_cond: two new conditions for the script: {on:'took', key} (any friend took that road) and {on:'call', day, reading}.
--   One breath (Week 1 only, the pilot): GO OUT NOW, +2 on the chosen friend's first United Effort roll; THE NEW PROP,
--   the thing at risk starts 10 higher; STAY WHERE YOU ARE, +1 on every friend's first roll. Each roll carries 'edge'.
create or replace function public.g_week_facts(p_party uuid, p_week int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_calls jsonb := '{}'::jsonb; v_d int; v_call jsonb;
begin
  for v_d in 1..6 loop
    v_call := public.fire_call(p_party, p_week, v_d);
    if v_call is not null and v_call ->> 'reading' in ('A', 'B') then
      v_calls := v_calls || jsonb_build_object(v_d::text, v_call ->> 'reading');
    end if;
  end loop;
  return jsonb_build_object('calls', v_calls, 'took', (
    select coalesce(jsonb_agg(distinct md.day || ':' || pk.key || ':' || o.value), '[]'::jsonb)
    from public.member_days md
    join public.party_members m on m.party_id = md.party_id and m.user_id = md.user_id and m.status = 'approved'
    cross join lateral jsonb_each(coalesce(md.picks, '{}'::jsonb)) pk
    cross join lateral jsonb_array_elements_text(case when jsonb_typeof(pk.value) = 'array' then pk.value else jsonb_build_array(pk.value) end) o
    where md.party_id = p_party and md.week = p_week and md.day between 1 and 6));
end;
$$;
revoke execute on function public.g_week_facts(uuid, int) from public, anon, authenticated;

do $mig$
declare d text; n text;
begin
  -- g_start: note the week's facts once, as the night begins.
  d := pg_get_functiondef('public.g_start(uuid,integer)'::regprocedure);
  n := replace(d, $o$  foreach v_u in array here loop perform public.ensure_progress(p_party, v_u); end loop;$o$,
    $n$  update public.gatherings set state = state || jsonb_build_object('week', public.g_week_facts(p_party, p_week))
  where party_id = p_party and week = p_week and not (state ? 'week');
  foreach v_u in array here loop perform public.ensure_progress(p_party, v_u); end loop;$n$);
  if n = d then raise exception 'g_start: text not found'; end if;
  execute n;

  -- g_cond: the two new conditions.
  d := pg_get_functiondef('public.g_cond(jsonb,jsonb)'::regprocedure);
  n := replace(d, $o$    when 'together' then coalesce((s ->> 'n')::int, 1) > 1$o$,
    $n$    when 'together' then coalesce((s ->> 'n')::int, 1) > 1
    when 'took' then coalesce(s -> 'week' -> 'took', '[]'::jsonb) ? (p_cond ->> 'key')
    when 'call' then s -> 'week' -> 'calls' ->> (p_cond ->> 'day') = p_cond ->> 'reading'$n$);
  if n = d then raise exception 'g_cond: text not found'; end if;
  execute n;

  -- g_advance: at the United Effort's start, Week 1 notes the One breath choice; THE NEW PROP adds 10 to the thing at risk.
  d := pg_get_functiondef('public.g_advance(uuid,integer)'::regprocedure);
  n := replace(d, $o$          'rollers', to_jsonb(v_list::text[]), 'gone', '[]'::jsonb, 'rolls', '[]'::jsonb, 'outcome', 'ongoing',
          'phase', 'roll', 'next', v_u, 'relic', null));$o$,
    $n$          'rollers', to_jsonb(v_list::text[]), 'gone', '[]'::jsonb, 'rolls', '[]'::jsonb, 'outcome', 'ongoing',
          'phase', 'roll', 'next', v_u, 'relic', null));
        if p_week = 1 then
          s := jsonb_set(s, '{ue,breath}', coalesce((
            select s -> 'result' -> ((x.o - 1)::text) from jsonb_array_elements(steps) with ordinality x(st2, o)
            where x.st2 ->> 't' = 'pick' and x.st2 ->> 'mode' = 'chosen' and x.st2 ->> 'section' = 'One breath' limit 1), 'null'::jsonb));
          if (s -> 'ue' ->> 'breath')::int = 1 then
            s := jsonb_set(s, '{ue,risk}', to_jsonb((s -> 'ue' ->> 'risk')::int + 10));
          end if;
        end if;$n$);
  if n = d then raise exception 'g_advance: text not found'; end if;
  execute n;

  -- g_ue_roll: the edge on a first roll.
  d := pg_get_functiondef('public.g_ue_roll(uuid,jsonb,jsonb)'::regprocedure);
  n := replace(d, $o$  v_margin := v_d20 + v_tier + v_relic - v_dc;$o$,
    $n$  -- One breath (0134): GO OUT NOW, +2 on the chosen friend's first roll; STAY WHERE YOU ARE, +1 on everyone's first.
  v_edge := case
    when (u ->> 'breath')::int = 0 and v_roller::text = s ->> 'chosen'
         and not exists (select 1 from jsonb_array_elements(u -> 'rolls') x where x ->> 'by' = v_roller::text) then 2
    when (u ->> 'breath')::int = 2
         and not exists (select 1 from jsonb_array_elements(u -> 'rolls') x where x ->> 'by' = v_roller::text) then 1
    else 0 end;
  v_margin := v_d20 + v_tier + v_relic + v_edge - v_dc;$n$);
  n := replace(n, $o$v_rollers jsonb := u -> 'rollers'; v_out text; v_self int;$o$,
                  $n$v_rollers jsonb := u -> 'rollers'; v_out text; v_self int; v_edge int := 0;$n$);
  n := replace(n, $o$'score', v_score, 'bonus', v_tier, 'relic', v_relic, 'd20', v_d20,$o$,
                  $n$'score', v_score, 'bonus', v_tier, 'relic', v_relic, 'edge', v_edge, 'd20', v_d20,$n$);
  if n = d or strpos(n, 'v_edge int := 0') = 0 or strpos(n, $o$'edge', v_edge$o$) = 0 then raise exception 'g_ue_roll: text not found'; end if;
  execute n;
end $mig$;

-- The United Effort card says what One breath did (g_view 'breath').
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.g_view(uuid,integer,uuid)'::regprocedure);
  n := replace(d, $o$          'rolls', s -> 'ue' -> 'rolls', 'relic', case$o$, $n$          'rolls', s -> 'ue' -> 'rolls', 'breath', s -> 'ue' -> 'breath', 'relic', case$n$);
  if n = d then raise exception 'g_view: text not found'; end if;
  execute n;
end $mig$;
