-- The live night (Fake Guru, 17 Oct: "go with your suggestion" to the gameplay verdict, group B;
-- docs/design/gameplay-verdict-17oct.md; "make sure story is paced between game"):
-- * A passage stays up for its reading time (about 18 characters a second, at least 5 seconds, at most a minute),
--   not at most 20 seconds: the prose needed 1.25 to 1.6 times as long as it was shown.
-- * [GO ON] moves the night on when more than half of the friends here have tapped it (gathering_go_on), not at the
--   first friend's tap; otherwise the passage moves on by itself when its reading time is up.
-- * The question to the table: every friend may answer (gathering_answer); the answers show together, and the
--   night's answer follows once every friend here has answered, or after ninety seconds as before (§11).
-- * The vote shows each way's Attribute and the friend here who is best at it (gathering_vote_help; Core Rules §11
--   "toolkit": "the vote shows who is best at each option").
-- The old 'go_on' and 'answer' actions of gathering_do stay for older phones.

create or replace function public.g_pace(p_text text) returns interval language sql immutable set search_path = '' as $$
  select make_interval(secs => least(60, greatest(5, ceil(char_length(coalesce(p_text, '')) / 18.0))));
$$;

-- [GO ON], counted: the passage moves on once more than half of the friends here have asked for it.
create function public.gathering_go_on(p_party uuid, p_i int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; s jsonb; d jsonb; st jsonb; v_me text := auth.uid()::text;
        v_k text; v_taps jsonb; v_here int;
begin
  if v_week is null then raise exception 'no gathering tonight'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  if g.started_at is null or g.ended_at is not null then raise exception 'not now'; end if;
  s := g.state;
  if not (coalesce(s -> 'order', '[]'::jsonb) ? v_me) then raise exception 'not now'; end if;
  d := public.g_script(p_party, v_week); st := d -> 'steps' -> g.cursor; v_k := g.cursor::text;
  if p_i is not distinct from g.cursor and st ->> 't' in ('say', 'notice', 'lookCloser')
     and (s -> 'log' -> -1 ->> 'i')::int = g.cursor then
    v_taps := coalesce(s -> 'goOn' -> v_k, '[]'::jsonb);
    if not v_taps ? v_me then v_taps := v_taps || to_jsonb(v_me); end if;
    s := s || jsonb_build_object('goOn', coalesce(s -> 'goOn', '{}'::jsonb) || jsonb_build_object(v_k, v_taps));
    v_here := greatest(1, coalesce(array_length(public.g_here(p_party, v_week), 1), 1));
    if jsonb_array_length(v_taps) >= v_here / 2 + 1 then
      update public.gatherings set wait_until = now() where party_id = p_party and week = v_week;
    end if;
    update public.gatherings set state = s, version = version + 1 where party_id = p_party and week = v_week;
  end if;
  perform public.g_advance(p_party, v_week);
  return public.g_view(p_party, v_week, auth.uid());
end;
$$;

-- The question to the table: each friend's answer. Once every friend here has answered, the night's answer follows
-- (the step's 'by' is set, as the first answer used to set it). MYTHIOS never grades what a friend says.
create function public.gathering_answer(p_party uuid, p_i int, p_text text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; s jsonb; d jsonb; st jsonb; v_me text := auth.uid()::text;
        v_k text; v_txt text := btrim(coalesce(p_text, '')); v_answers jsonb; v_here uuid[];
begin
  if v_week is null then raise exception 'no gathering tonight'; end if;
  if char_length(v_txt) < 1 or char_length(v_txt) > 140 then raise exception 'an answer is 1 to 140 characters'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  if g.started_at is null or g.ended_at is not null then raise exception 'not now'; end if;
  s := g.state;
  if not (coalesce(s -> 'order', '[]'::jsonb) ? v_me) then raise exception 'not now'; end if;
  d := public.g_script(p_party, v_week); st := d -> 'steps' -> g.cursor; v_k := g.cursor::text;
  if p_i is not distinct from g.cursor and st ->> 't' = 'turn' and not (s -> 'turn' -> v_k ? 'by')
     and not coalesce((s -> 'turn' -> v_k ->> 'given')::boolean, false) then
    v_answers := coalesce(s -> 'turn' -> v_k -> 'answers', '{}'::jsonb) || jsonb_build_object(v_me, v_txt);
    s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || jsonb_build_object('answers', v_answers));
    v_here := public.g_here(p_party, v_week);
    if not exists (select 1 from unnest(v_here) h where not v_answers ? h::text) then
      s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || jsonb_build_object('by', v_me, 'text', v_txt));
      update public.gatherings set wait_until = now() + public.g_pace(st ->> 'answer') where party_id = p_party and week = v_week;
    end if;
    update public.gatherings set state = s, version = version + 1 where party_id = p_party and week = v_week;
  end if;
  perform public.g_advance(p_party, v_week);
  return public.g_view(p_party, v_week, auth.uid());
end;
$$;

-- The answers to the table's question at step p_i: shown once you have answered, or once the night's answer is out
-- (answer before peek, like the fire's pins). Names in party order.
create function public.gathering_answers(p_party uuid, p_i int) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); g public.gatherings; t jsonb; v_me text := auth.uid()::text;
begin
  if v_week is null then return '[]'::jsonb; end if;
  select * into g from public.gatherings where party_id = p_party and week = v_week;
  if not (coalesce(g.state -> 'order', '[]'::jsonb) ? v_me) then raise exception 'not now'; end if;
  t := g.state -> 'turn' -> p_i::text;
  if t is null or not (coalesce(t -> 'answers', '{}'::jsonb) ? v_me or t ? 'by' or coalesce((t ->> 'given')::boolean, false)) then
    return jsonb_build_object('mine', false, 'answers', '[]'::jsonb, 'count', coalesce((select count(*) from jsonb_object_keys(coalesce(t -> 'answers', '{}'::jsonb))), 0));
  end if;
  return jsonb_build_object('mine', coalesce(t -> 'answers', '{}'::jsonb) ? v_me,
    'answers', (select coalesce(jsonb_agg(jsonb_build_object('name', public.g_name(p_party, o.u), 'text', t -> 'answers' ->> o.u::text) order by o.ord), '[]'::jsonb)
                from unnest(public.g_party_order(p_party)) with ordinality o(u, ord) where t -> 'answers' ? o.u::text),
    'count', (select count(*) from jsonb_object_keys(t -> 'answers')));
end;
$$;

-- The vote's help (§11 "toolkit"): for each way in, the Attribute it rolls and the friend here who is best at it.
create function public.gathering_vote_help(p_party uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_week int := public.g_week(p_party); d jsonb; v_ways jsonb; v_here uuid[];
begin
  if v_week is null then return '[]'::jsonb; end if;
  if not exists (select 1 from public.party_members where party_id = p_party and user_id = auth.uid() and status = 'approved') then
    raise exception 'not in this party';
  end if;
  d := public.g_script(p_party, v_week);
  select s -> 'ways' into v_ways from jsonb_array_elements(d -> 'steps') s where s ->> 't' = 'approach' limit 1;
  if v_ways is null then return '[]'::jsonb; end if;
  v_here := public.g_here(p_party, v_week);
  if coalesce(array_length(v_here, 1), 0) = 0 then v_here := public.g_party_order(p_party); end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('attr', w ->> 'attr',
      'best', (select jsonb_build_object('name', public.g_name(p_party, u), 'score', public.g_score(p_party, u, w ->> 'attr'),
                 'bonus', public.tier_bonus(public.g_score(p_party, u, w ->> 'attr')))
               from unnest(v_here) u order by public.g_score(p_party, u, w ->> 'attr') desc limit 1)) order by o), '[]'::jsonb)
    from jsonb_array_elements(v_ways) with ordinality x(w, o));
end;
$$;

revoke execute on function public.gathering_go_on(uuid, int), public.gathering_answer(uuid, int, text),
  public.gathering_answers(uuid, int), public.gathering_vote_help(uuid) from public, anon;
grant execute on function public.gathering_go_on(uuid, int), public.gathering_answer(uuid, int, text),
  public.gathering_answers(uuid, int), public.gathering_vote_help(uuid) to authenticated;
