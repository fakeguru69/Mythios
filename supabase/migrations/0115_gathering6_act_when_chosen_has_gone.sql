-- 0115 (24 Oct, Phase 0.4 of the make-it-great plan): Gathering 6's act when the chosen friend has gone.
--
-- The light lets go of one friend, chosen from those here; after thirty seconds for the others to talk, that friend has
-- twenty to act, and no tap is [DO NOTHING]. A friend whose phone has dropped or who has left the night could so decide
-- the finale by being away. Now, if the chosen friend is no longer here when their time runs out, the act opens to every
-- friend still here for twenty seconds, and the first tap is what the chosen friend does (the story text still names the
-- chosen friend: the others tell them what to do). A chosen friend who is here and does not tap still does nothing.
--
-- gathering_do was changed on the live server by the old loader and was never in the repo: this file carries the live
-- copy (md5 db483c08 before this change) with the one change, so a rebuild from the repo has it.

CREATE OR REPLACE FUNCTION public.gathering_do(p_party uuid, p_action text, p_args jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_week int := public.g_week(p_party); g public.gatherings; s jsonb; d jsonb; st jsonb; v_me text := auth.uid()::text;
        v_k text; v_i int; v_opt int; v_kind text; v_to uuid; v_name text := public.g_name(p_party, auth.uid()); v_f jsonb;
        v_idx int; v_txt text; v_limit int; v_meta jsonb; v_attr text; v_score int; v_tier int; v_d20 int; v_net int;
begin
  if v_week is null then raise exception 'no gathering tonight'; end if;
  perform public.g_row(p_party, v_week);
  select * into g from public.gatherings where party_id = p_party and week = v_week for update;
  d := public.g_script(p_party, v_week); v_meta := d -> 'meta';
  s := g.state; v_k := g.cursor::text; st := d -> 'steps' -> g.cursor;
  v_i := (p_args ->> 'i')::int;

  if p_action = 'start' then
    if g.started_at is not null then return public.g_view(p_party, v_week, auth.uid()); end if;
    if not ((select host_id from public.parties where id = p_party) = auth.uid() or now() >= g.opens_at + interval '10 minutes') then
      raise exception 'only the host can start it yet';
    end if;
    insert into public.gathering_present (party_id, week, user_id) values (p_party, v_week, auth.uid())
    on conflict (party_id, week, user_id) do update set last_at = now();
    perform public.g_start(p_party, v_week);
    perform public.g_advance(p_party, v_week);
    return public.g_view(p_party, v_week, auth.uid());
  end if;
  if g.started_at is null or g.ended_at is not null then raise exception 'not now'; end if;
  if not (coalesce(s -> 'order', '[]'::jsonb) ? v_me) then raise exception 'not now'; end if;

  if p_action in ('go_on', 'tap', 'vote', 'pick', 'step_up', 'roll', 'ue_roll', 'hand_on', 'match', 'answer', 'ask', 'ask_done')
     and v_i is distinct from g.cursor then
    return public.g_view(p_party, v_week, auth.uid());
  end if;

  case p_action
    when 'go_on' then
      if st ->> 't' in ('say', 'notice', 'lookCloser') and (s -> 'log' -> -1 ->> 'i')::int = g.cursor then
        update public.gatherings set wait_until = now() where party_id = p_party and week = v_week;
      end if;
    when 'tap' then
      if st ->> 't' = 'act' and not (s -> 'tapped' ? v_k) then
        s := jsonb_set(s, array['tapped', v_k], to_jsonb(v_me));
        s := jsonb_set(s, array['tappedBy', v_k], to_jsonb(v_name));
        s := s || jsonb_build_object('tapper', v_name);
      end if;
    when 'vote' then
      v_opt := (p_args ->> 'o')::int;
      if st ->> 't' = 'pick' and st ->> 'mode' = 'vote' and not (s -> 'result' ? v_k) and not (s -> 'picks' -> v_k ? v_me)
         and v_opt between 0 and jsonb_array_length(st -> 'options') - 1 then
        s := jsonb_set(s, array['picks', v_k, v_me], to_jsonb(v_opt));
        s := jsonb_set(s, array['votes', v_k], coalesce(s -> 'votes' -> v_k, '[]'::jsonb) || jsonb_build_object('u', v_me, 'o', v_opt));
      end if;
    when 'pick' then
      v_opt := (p_args ->> 'o')::int;
      if st ->> 't' = 'pick' and st ->> 'mode' in ('private', 'each', 'chosen') and not (s -> 'result' ? v_k)
         and not (s -> 'picks' -> v_k ? v_me) and v_opt between 0 and jsonb_array_length(st -> 'options') - 1 then
        -- The act: the chosen friend, after thirty seconds; or, once the chosen friend has left the night, any friend
        -- (chosenOpen, set by g_advance).
        if st ->> 'mode' = 'chosen' and not coalesce((s ->> 'chosenOpen')::boolean, false)
           and (s ->> 'chosen' is distinct from v_me
                or now() < (s -> 'log' -> -1 ->> 'at')::timestamptz + interval '30 seconds') then
          raise exception 'not yet';
        end if;
        s := jsonb_set(s, array['picks', v_k, v_me], to_jsonb(v_opt));
      end if;
    when 'step_up' then
      if st ->> 't' = 'approach' and s -> 'approach' ->> 'phase' = 'volunteer'
         and not exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_me) then
        if jsonb_array_length(s -> 'approach' -> 'vols') = 0 then
          update public.gatherings set wait_until = least(wait_until, now() + interval '10 seconds') where party_id = p_party and week = v_week;
        end if;
        s := jsonb_set(s, '{approach,vols}', (s -> 'approach' -> 'vols') || jsonb_build_object('u', v_me));
      end if;
    when 'roll' then
      if st ->> 't' = 'approach' and s -> 'approach' ->> 'phase' = 'roll' and s -> 'approach' ->> 'roller' = v_me then
        s := public.g_approach_roll(p_party, v_week, s, d, coalesce((p_args ->> 'relic')::boolean, false));
        update public.gatherings set wait_until = now() where party_id = p_party and week = v_week;
      end if;
    when 'use_combat_relic', 'give_combat_relic' then
      v_to := case when p_action = 'use_combat_relic' then auth.uid() else (p_args ->> 'to')::uuid end;
      if s -> 'battle' ->> 'outcome' is distinct from 'ongoing' then raise exception 'not now'; end if;
      if p_action = 'give_combat_relic' and not exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'help') h where h ->> 'id' = v_to::text) then
        return public.g_view(p_party, v_week, auth.uid());
      end if;
      select o::int - 1, x into v_idx, v_f from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o) where x ->> 'id' = v_to::text;
      if v_f is null or (v_f ->> 'fallen')::boolean or v_f ->> 'relicFrom' is not null or v_f ->> 'relicPending' is not null then
        raise exception 'a relic is already helping';
      end if;
      if not public.g_spend(p_party, auth.uid(), 'Combat') then raise exception 'no relic of that kind'; end if;
      s := jsonb_set(s, array['battle', 'fighters', v_idx::text, 'relicPending'], to_jsonb(v_name));
      if p_action = 'give_combat_relic' then
        s := jsonb_set(s, '{battle,help}', (select coalesce(jsonb_agg(h), '[]'::jsonb) from jsonb_array_elements(s -> 'battle' -> 'help') h
                                           where h ->> 'id' <> v_to::text));
      end if;
    when 'ue_relic' then
      v_kind := p_args ->> 'kind';
      if s -> 'ue' ->> 'phase' <> 'roll' then raise exception 'not now'; end if;
      if s -> 'ue' -> 'relic' is not null and s -> 'ue' -> 'relic' <> 'null'::jsonb then
        if s -> 'ue' -> 'relic' ->> 'from' = v_me then s := jsonb_set(s, '{ue,relic}', 'null'::jsonb); end if;
      else
        if v_kind not in ('Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim') then raise exception 'no relic of that kind'; end if;
        if s -> 'ue' ->> 'next' = v_me and v_kind <> v_meta ->> 'ueAttr' then raise exception 'no relic of that kind'; end if;
        if public.g_relics(p_party, auth.uid(), v_kind) < 1 then raise exception 'no relic of that kind'; end if;
        s := jsonb_set(s, '{ue,relic}', jsonb_build_object('from', v_me, 'kind', v_kind));
      end if;
    when 'ue_roll' then
      if st ->> 't' = 'ue' and s -> 'ue' ->> 'phase' = 'roll' and s -> 'ue' ->> 'next' = v_me then
        s := public.g_ue_roll(p_party, s, d);
        if s -> 'ue' ->> 'outcome' = 'won' then
          for v_to in select x::uuid from jsonb_array_elements_text(s -> 'order') x loop s := public.g_earn(p_party, v_to, 300, s); end loop;
        end if;
        update public.gatherings set wait_until = now() + case when s -> 'ue' ->> 'outcome' = 'ongoing' then interval '10 seconds'
                                                               else interval '8 seconds' end
        where party_id = p_party and week = v_week;
      end if;
    when 'hand_on' then
      v_to := (p_args ->> 'to')::uuid;
      if st ->> 't' = 'ue' and s -> 'ue' ->> 'phase' = 'handon' and s -> 'ue' ->> 'by' = v_me
         and v_to::text = any(public.g_ue_eligible(s -> 'ue')) then
        s := jsonb_set(s, '{ue}', (s -> 'ue') || jsonb_build_object('phase', 'roll', 'next', v_to, 'named', false));
        update public.gatherings set wait_until = now() + interval '30 seconds' where party_id = p_party and week = v_week;
      end if;
    when 'look' then
      v_i := (p_args ->> 'i')::int;
      if not exists (select 1 from jsonb_array_elements(s -> 'log') x where (x ->> 'i')::int = v_i and x ->> 't' = 'lookCloser') then raise exception 'not now'; end if;
      if s -> 'look' ? v_me then return public.g_view(p_party, v_week, auth.uid()); end if;
      if exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = v_me and (x ->> 'fallen')::boolean)
         or (v_week = 5 and s -> 'ue' ->> 'outcome' = 'lost') then raise exception 'not now'; end if;
      if (p_args ->> 'leave')::boolean then
        s := jsonb_set(s, array['look', v_me], '{"left": true}');
      else
        v_attr := public.g_top_attr(p_party, auth.uid(), d -> 'steps' -> v_i -> 'lines');
        v_score := public.g_score(p_party, auth.uid(), v_attr);
        v_tier := public.tier_bonus(v_score);
        v_d20 := public.d20();
        v_net := v_d20 + v_tier - (v_meta ->> 'dc')::int;
        s := jsonb_set(s, array['look', v_me], jsonb_build_object('attr', v_attr, 'score', v_score, 'bonus', v_tier, 'd20', v_d20,
               'dc', (v_meta ->> 'dc')::int, 'net', v_net, 'pass', v_net >= 1));
        if v_net >= 1 then s := public.g_earn(p_party, auth.uid(), 75, s); end if;
      end if;
    when 'match' then
      if st ->> 't' = 'match' and not (s -> 'match' -> v_k -> 'picks' ? v_me) and not (s -> 'match' -> v_k ->> 'done')::boolean then
        s := jsonb_set(s, array['match', v_k, 'picks', v_me], to_jsonb(p_args ->> 'f'));
      end if;
    when 'answer' then
      v_txt := btrim(coalesce(p_args ->> 'text', ''));
      if char_length(v_txt) < 1 or char_length(v_txt) > 140 then raise exception 'an answer is 1 to 140 characters'; end if;
      if st ->> 't' = 'turn' and not (s -> 'turn' -> v_k ? 'by') and not coalesce((s -> 'turn' -> v_k ->> 'given')::boolean, false) then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || jsonb_build_object('by', v_me, 'text', v_txt));
        update public.gatherings set wait_until = now() + public.g_pace(st ->> 'answer') where party_id = p_party and week = v_week;
      end if;
    when 'ask' then
      v_opt := (p_args ->> 'r')::int;
      v_limit := case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end;
      if st ->> 't' = 'ask' and not (s -> 'ask' -> v_k ->> 'done')::boolean and v_opt between 0 and jsonb_array_length(st -> 'rows') - 1
         and not exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = v_opt)
         and (select count(*) from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where a ->> 'u' = v_me) < v_limit then
        s := jsonb_set(s, array['ask', v_k, 'asked'], (s -> 'ask' -> v_k -> 'asked') || jsonb_build_object('r', v_opt, 'u', v_me));
        update public.gatherings set wait_until = now() + interval '2 minutes' where party_id = p_party and week = v_week;
      end if;
    when 'ask_done' then
      if st ->> 't' = 'ask' then s := jsonb_set(s, array['ask', v_k, 'closing'], 'true'); end if;
    else
      raise exception 'not now';
  end case;

  update public.gatherings set state = s, version = version + 1 where party_id = p_party and week = v_week;
  perform public.g_advance(p_party, v_week);
  return public.g_view(p_party, v_week, auth.uid());
end;
$function$;

CREATE OR REPLACE FUNCTION public.g_advance(p_party uuid, p_week integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare g public.gatherings; d jsonb; steps jsonb; n int; st jsonb; t text; s jsonb; v_cursor int; v_wait timestamptz;
        shown boolean; here uuid[]; v_guard int := 0; v_changed boolean := false; v_text text; v_k text; v_res int;
        v_cnt int; v_top int; v_pick jsonb; v_u uuid; v_list uuid[]; v_at timestamptz; v_entry jsonb; v_meta jsonb;
        v_b jsonb; v_elig text[]; v_limit int; v_sealed jsonb; v_fid text;
begin
  select * into g from public.gatherings where party_id = p_party and week = p_week for update;
  if g.started_at is null or g.ended_at is not null then return; end if;
  d := public.g_script(p_party, p_week); steps := d -> 'steps'; n := jsonb_array_length(steps); v_meta := d -> 'meta';
  s := g.state; v_cursor := g.cursor; v_wait := g.wait_until;
  here := public.g_here(p_party, p_week);

  -- Friends who arrive after the start join the night (and, during the Battle, fight as reinforcers).
  for v_u in select x from unnest(here) x where not (coalesce(s -> 'order', '[]'::jsonb) ? x::text) loop
    s := jsonb_set(s, '{order}', coalesce(s -> 'order', '[]'::jsonb) || to_jsonb(v_u::text));
    if s -> 'battle' is not null and s -> 'battle' ->> 'outcome' = 'ongoing' then
      s := jsonb_set(s, '{battle}', public.g_battle_join(p_party, p_week, s -> 'battle', v_u, v_meta, true));
    end if;
    v_changed := true;
  end loop;

  <<steps_loop>>
  loop
    v_guard := v_guard + 1;
    exit when v_guard > 400;
    if v_cursor >= n then
      update public.gatherings set ended_at = coalesce(ended_at, now()) where party_id = p_party and week = p_week;
      v_changed := true;
      exit;
    end if;
    st := steps -> v_cursor; t := st ->> 't';
    shown := (s -> 'log' -> -1 ->> 'i')::int is not distinct from v_cursor;
    if not shown and st ? 'cond' and not public.g_cond(st -> 'cond', s) then v_cursor := v_cursor + 1; continue; end if;
    if not shown and (st ->> 'ifTapped')::boolean and not (s -> 'tapped' ? (v_cursor - 1)::text) then v_cursor := v_cursor + 1; continue; end if;

    if t in ('tonight', 'ueEnd') then
      v_cursor := v_cursor + 1;
    elsif t = 'section' then
      s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'section', 'title', st ->> 'title'));
      v_cursor := v_cursor + 1; v_changed := true;

    elsif t in ('say', 'notice', 'lookCloser') then
      if not shown then
        if t = 'say' then
          -- Gathering 6's act: the light lets go of one friend, chosen at random, leaving out the Approach's roller
          -- (in a party of two or one, from everyone). "It is not a race."
          if st ->> 'text' like '%{CHOSEN}%' and not s ? 'chosen' then
            select x into v_u from unnest(here) x
            where coalesce(array_length(here, 1), 0) <= 2 or x::text is distinct from s -> 'approach' ->> 'roller'
            order by random() limit 1;
            if v_u is null then select x::uuid into v_u from jsonb_array_elements_text(s -> 'order') x order by random() limit 1; end if;
            s := s || jsonb_build_object('chosen', v_u);
          end if;
          v_text := public.g_fill(p_party, st ->> 'text', s);
          if st ? 'nameOf' then
            -- "Say a name": each line with the friends who said it; a name nobody picked is posted all the same.
            select array_agg(key::uuid) into v_list from jsonb_each(coalesce(s -> 'picks' -> (s ->> 'namesAt'), '{}'::jsonb))
            where value::int = (st ->> 'nameOf')::int;
            if v_list is not null then v_text := v_text || ' *' || public.g_names(p_party, v_list) || '.*'; end if;
          end if;
          s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'say', 'text', v_text, 'alone', coalesce((st ->> 'alone')::boolean, false)));
          v_wait := now() + public.g_pace(v_text);
        else
          s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', t));
          v_wait := now() + interval '8 seconds';
        end if;
        v_changed := true;
        exit;
      elsif now() >= v_wait then
        v_cursor := v_cursor + 1;
      else
        exit;
      end if;

    elsif t = 'act' then
      -- [LOOK CLOSER] is offered by the roll card that follows it, to each friend in their own thread.
      if st ->> 'label' = 'LOOK CLOSER' and steps -> (v_cursor + 1) ->> 't' = 'lookCloser' then v_cursor := v_cursor + 1; continue; end if;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'act', 'label', public.g_fill(p_party, st ->> 'label', s)));
        v_wait := case when st ? 'timeout' then now() + make_interval(secs => (st ->> 'timeout')::int) else null end;
        v_changed := true;
        exit;
      elsif s -> 'tapped' ? v_cursor::text then
        v_cursor := v_cursor + 1;
      elsif v_wait is not null and now() >= v_wait then
        v_cursor := v_cursor + 1;
      else
        exit;
      end if;

    elsif t = 'pick' then
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'pick'));
        s := jsonb_set(s, array['picks', v_k], '{}'::jsonb);
        v_wait := now() + case st ->> 'mode' when 'vote' then interval '30 seconds' when 'private' then interval '30 seconds'
                                             when 'chosen' then interval '50 seconds' else interval '20 seconds' end;
        if st ->> 'mode' = 'each' then s := s || jsonb_build_object('namesAt', v_k); end if;
        v_changed := true;
        exit;
      end if;
      if s -> 'result' ? v_k then v_cursor := v_cursor + 1; continue; end if;
      select count(*) into v_cnt from jsonb_object_keys(s -> 'picks' -> v_k);
      v_res := null;
      if st ->> 'mode' = 'vote' then
        -- The group Choice: the majority after 30 seconds, or sooner once everyone here has tapped; a tie goes to the
        -- first vote cast. With no vote yet, it waits for the first.
        if v_cnt > 0 and (now() >= v_wait or v_cnt >= coalesce(array_length(here, 1), 0)) then
          select (x.value ->> 'o')::int into v_res from (
            select v.value, count(*) over (partition by v.value ->> 'o') c, v.ordinality o
            from jsonb_array_elements(s -> 'votes' -> v_k) with ordinality v) x
          order by x.c desc, x.o limit 1;
          s := s || jsonb_build_object('way', v_res);
        end if;
      elsif st ->> 'mode' = 'private' then
        -- Gathering 6, the fifth: private picks, shown together after 30 seconds; the majority decides, a tie holds it back.
        if now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0)) then
          select case when count(*) filter (where value::int = 0) > count(*) filter (where value::int = 1) then 0 else 1 end
          into v_res from jsonb_each(s -> 'picks' -> v_k);
        end if;
      elsif st ->> 'mode' = 'chosen' then
        -- Gathering 6, the act: thirty seconds for the others to talk, then twenty for the chosen friend; no tap is [DO NOTHING].
        -- 24 Oct: if the chosen friend has left the night by then, the act opens to every friend still here for twenty
        -- seconds, and the first tap is what the chosen friend does. A chosen friend who is here and does not tap still
        -- does nothing, as canon has it.
        if s -> 'picks' -> v_k ? (s ->> 'chosen') then v_res := (s -> 'picks' -> v_k ->> (s ->> 'chosen'))::int;
        elsif coalesce((s ->> 'chosenOpen')::boolean, false) and v_cnt > 0 then
          select value::int into v_res from jsonb_each_text(s -> 'picks' -> v_k) limit 1;
          s := s || jsonb_build_object('actedFor', (select key from jsonb_each_text(s -> 'picks' -> v_k) limit 1));
        elsif now() >= v_wait and not coalesce((s ->> 'chosenOpen')::boolean, false)
              and not ((s ->> 'chosen')::uuid = any(here)) and coalesce(array_length(here, 1), 0) > 0 then
          s := s || jsonb_build_object('chosenOpen', true);
          v_wait := now() + interval '20 seconds';
          v_changed := true;
          exit;
        elsif now() >= v_wait then v_res := jsonb_array_length(st -> 'options') - 1;
        end if;
      else
        -- "Say a name": every friend picks in private; after twenty seconds (or once all have) the lines are posted.
        if now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0)) then v_res := -1; end if;
      end if;
      if v_res is null then exit; end if;
      s := jsonb_set(s, array['result', v_k], to_jsonb(v_res));
      if st ->> 'mode' <> 'vote' and v_res >= 0 then s := s || jsonb_build_object('lastPick', v_res); end if;
      v_cursor := v_cursor + 1; v_changed := true;

    elsif t = 'approach' then
      v_u := null;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'approach'));
        s := s || jsonb_build_object('approach', jsonb_build_object('i', v_cursor, 'phase', 'volunteer', 'vols', '[]'::jsonb));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'approach' ->> 'phase' = 'volunteer' then
        -- Who rolls (§11): of those who step up, whoever has rolled fewest Approaches this season (a tie: the first tap).
        -- The window closes 30 seconds after the card, 10 seconds after the first step-up, or once everyone has stepped up.
        if jsonb_array_length(s -> 'approach' -> 'vols') > 0 and (now() >= v_wait
           or jsonb_array_length(s -> 'approach' -> 'vols') >= coalesce(array_length(here, 1), 0)) then
          select (v.value ->> 'u')::uuid into v_u from jsonb_array_elements(s -> 'approach' -> 'vols') with ordinality v
          order by (select count(*) from public.gatherings g2 where g2.party_id = p_party and g2.week <> p_week
                    and g2.state -> 'approach' ->> 'roller' = v.value ->> 'u'), v.ordinality limit 1;
        elsif now() >= v_wait then
          -- Nobody stepped up: the friend who has rolled fewest at Gatherings this season, then the party list.
          select x into v_u from unnest(case when coalesce(array_length(here, 1), 0) > 0 then here
                                        else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end)
                 with ordinality o(x, ord)
          order by (select count(*) from public.gatherings g2 where g2.party_id = p_party and g2.week <> p_week
                    and g2.state -> 'approach' ->> 'roller' = x::text), ord limit 1;
        end if;
        if v_u is null then exit; end if;
        s := jsonb_set(s, '{approach}', (s -> 'approach') || jsonb_build_object('phase', 'roll', 'roller', v_u,
               'stepped', exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_u::text)));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      elsif s -> 'approach' ->> 'phase' = 'roll' then
        -- The roller taps [ROLL]; if they do not within 30 seconds, the server rolls for them (no Relic).
        if now() >= v_wait then
          s := public.g_approach_roll(p_party, p_week, s, d, false);
          v_changed := true;
        else
          exit;
        end if;
      else
        v_cursor := v_cursor + 1;
      end if;

    elsif t = 'battle' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'battle'));
        v_b := jsonb_build_object('round', 0, 'partyFirst', coalesce((s -> 'approach' -> 'roll' ->> 'pass')::boolean, true),
                                  'outcome', 'ongoing', 'fighters', '[]'::jsonb, 'foes', '[]'::jsonb, 'rounds', '[]'::jsonb, 'help', '[]'::jsonb);
        for v_u in select x from unnest(case when coalesce(array_length(here, 1), 0) > 0 then here
                                        else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end) x loop
          v_b := public.g_battle_join(p_party, p_week, v_b, v_u, v_meta, false);
        end loop;
        s := s || jsonb_build_object('battle', v_b);
        v_wait := now() + interval '10 seconds'; -- "The fight begins in 10 seconds"
        v_changed := true;
        exit;
      end if;
      if s -> 'battle' ->> 'outcome' = 'ongoing' then
        if now() < v_wait then exit; end if;
        s := jsonb_set(s, '{battle}', public.g_battle_round(p_party, p_week, s -> 'battle'));
        if p_week = 1 and s -> 'battle' ->> 'outcome' <> 'ongoing' then
          -- Gathering 1: the friend in the drop is the one who fell in the Battle, or else who finished it with the least
          -- HP (set now, as the scene before the United Effort already names them).
          select (x ->> 'id')::uuid into v_u from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o)
          where not coalesce((x ->> 'late')::boolean, false)
          order by (x ->> 'fallen')::boolean desc, (x ->> 'hp')::int, o limit 1;
          s := s || jsonb_build_object('risk', v_u);
        end if;
        if s -> 'battle' ->> 'outcome' = 'won' then
          -- Every friend in the Battle is paid its reward when the party wins, whoever landed the last blow.
          for v_u in select (x ->> 'id')::uuid from jsonb_array_elements(s -> 'battle' -> 'fighters') x loop
            s := public.g_earn(p_party, v_u, (v_meta ->> 'reward')::int, s);
          end loop;
        end if;
        v_wait := now() + interval '10 seconds'; -- a shared pause between rounds, and after the last before the night goes on
        v_changed := true;
        exit;
      end if;
      if now() < v_wait then exit; end if;
      v_cursor := v_cursor + 1;

    elsif t = 'ue' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'ue'));
        v_list := case when coalesce(array_length(here, 1), 0) > 0 then here
                       else (select array_agg(y::uuid) from jsonb_array_elements_text(s -> 'order') y) end;
        -- Gathering 1: the friend in the drop is the one who fell in the Battle, or else who finished it with the least HP.
        -- Since 17 Oct they take their turns too, working themselves up from below (gameplay verdict: in a party of two
        -- the other friend made every roll), so nobody sits the United Effort out.
        if p_week = 1 then
          if not s ? 'risk' then s := s || jsonb_build_object('risk', v_list[1]); end if;
        end if;
        -- MYTHIOS names the first friend: at random from those who have not rolled tonight.
        select x into v_u from unnest(v_list) x order by (x::text is not distinct from s -> 'approach' ->> 'roller'), random() limit 1;
        s := s || jsonb_build_object('ue', jsonb_build_object('start', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'way', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'risk', case when coalesce((s ->> 'n')::int, 1) <= 1 then 60 else 100 end,
          'rollers', to_jsonb(v_list::text[]), 'gone', '[]'::jsonb, 'rolls', '[]'::jsonb, 'outcome', 'ongoing',
          'phase', 'roll', 'next', v_u, 'relic', null));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'ue' ->> 'phase' = 'roll' then
        if now() < v_wait then exit; end if;
        s := public.g_ue_roll(p_party, s, d); -- the roller did not tap in 30 seconds: the server rolls for them
        v_wait := now() + interval '10 seconds';
        v_changed := true;
        if s -> 'ue' ->> 'outcome' <> 'ongoing' then
          if s -> 'ue' ->> 'outcome' = 'won' then
            for v_u in select x::uuid from jsonb_array_elements_text(s -> 'order') x loop s := public.g_earn(p_party, v_u, 300, s); end loop;
          end if;
          v_wait := now() + interval '8 seconds';
        end if;
        exit;
      elsif s -> 'ue' ->> 'phase' = 'handon' then
        if now() < v_wait then exit; end if;
        v_elig := public.g_ue_eligible(s -> 'ue');
        s := jsonb_set(s, '{ue}', (s -> 'ue') || jsonb_build_object('phase', 'roll', 'next', v_elig[1], 'named', true));
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      else
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
      end if;

    elsif t = 'match' then
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'match'));
        s := jsonb_set(s, array['match', v_k], jsonb_build_object('picks', '{}'::jsonb, 'done', false));
        v_wait := now() + interval '60 seconds';
        v_changed := true;
        exit;
      end if;
      if (s -> 'match' -> v_k ->> 'done')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
        continue;
      end if;
      select count(*) into v_cnt from jsonb_object_keys(s -> 'match' -> v_k -> 'picks');
      if not (now() >= v_wait or (v_cnt > 0 and v_cnt >= coalesce(array_length(here, 1), 0))) then exit; end if;
      -- The right row lights up with those who matched it; a wrong pick is never shown. 50g a right pick, 100g if every
      -- friend here is right.
      v_fid := st ->> 'answer';
      select array_agg(key::uuid) into v_list from jsonb_each_text(s -> 'match' -> v_k -> 'picks') where value = v_fid;
      v_top := case when v_list is not null and coalesce(array_length(here, 1), 0) > 0
                     and here <@ v_list then 100 else 50 end;
      if v_list is not null then
        foreach v_u in array v_list loop
          s := public.g_earn(p_party, v_u, v_top, s);
          s := jsonb_set(s, array['earned', v_u::text, 'match'], to_jsonb(coalesce((s -> 'earned' -> v_u::text ->> 'match')::int, 0) + 1));
        end loop;
      end if;
      s := jsonb_set(s, array['match', v_k], (s -> 'match' -> v_k) || jsonb_build_object('done', true,
             'right', to_jsonb(coalesce(v_list, '{}')::text[]), 'all', v_list is not null and here <@ v_list, 'pay', v_top));
      s := s || jsonb_build_object('matches', coalesce((s ->> 'matches')::int, 0) + 1);
      v_wait := now() + interval '6 seconds';
      v_changed := true;
      exit;

    elsif t = 'turn' then
      -- A question to the table (§11): it holds until a friend answers; one nudge after sixty quiet seconds, the
      -- answer after ninety. MYTHIOS never grades what a friend says.
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'turn'));
        s := jsonb_set(s, array['turn', v_k], '{}'::jsonb);
        v_wait := now() + interval '60 seconds';
        v_changed := true;
        exit;
      end if;
      if s -> 'turn' -> v_k ? 'by' or (s -> 'turn' -> v_k ->> 'given')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
      elsif now() >= v_wait and not coalesce((s -> 'turn' -> v_k ->> 'nudged')::boolean, false) and st ? 'nudge' then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || '{"nudged": true}');
        v_wait := now() + interval '30 seconds';
        v_changed := true;
        exit;
      elsif now() >= v_wait then
        s := jsonb_set(s, array['turn', v_k], (s -> 'turn' -> v_k) || '{"given": true}');
        v_wait := now() + public.g_pace(st ->> 'answer');
        v_changed := true;
        exit;
      else
        exit;
      end if;

    elsif t = 'ask' then
      -- The Ask board (§11): one question per friend (two each in a party of two, four alone). It closes when every
      -- friend has asked, on [GO ON], or after two quiet minutes; a sealed question nobody asked is answered anyway.
      v_k := v_cursor::text;
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'ask'));
        s := jsonb_set(s, array['ask', v_k], jsonb_build_object('asked', '[]'::jsonb, 'done', false));
        v_wait := now() + interval '2 minutes';
        v_changed := true;
        exit;
      end if;
      if (s -> 'ask' -> v_k ->> 'done')::boolean then
        if now() < v_wait then exit; end if;
        v_cursor := v_cursor + 1;
        continue;
      end if;
      v_limit := case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end;
      if now() >= v_wait or (s -> 'ask' -> v_k ->> 'closing')::boolean
         or jsonb_array_length(s -> 'ask' -> v_k -> 'asked') >= least(jsonb_array_length(st -> 'rows'),
              v_limit * greatest(1, jsonb_array_length(coalesce(s -> 'order', '[]'::jsonb)))) then
        select coalesce(jsonb_agg(o - 1 order by o), '[]'::jsonb) into v_sealed
        from jsonb_array_elements(st -> 'rows') with ordinality r(x, o)
        where (x ->> 'sealed')::boolean
          and not exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1);
        s := jsonb_set(s, array['ask', v_k], (s -> 'ask' -> v_k) || jsonb_build_object('done', true, 'unasked', v_sealed));
        v_wait := now() + interval '5 seconds' + jsonb_array_length(v_sealed) * interval '6 seconds';
        v_changed := true;
      end if;
      exit;

    elsif t = 'summary' then
      if not shown then
        s := public.g_log(s, jsonb_build_object('i', v_cursor, 't', 'summary'));
        v_changed := true;
      end if;
      v_cursor := v_cursor + 1;
    else
      v_cursor := v_cursor + 1;
    end if;
  end loop;

  if v_changed or v_cursor <> g.cursor or v_wait is distinct from g.wait_until then
    update public.gatherings set state = s, cursor = v_cursor, wait_until = v_wait, version = version + 1
    where party_id = p_party and week = p_week;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.g_view(p_party uuid, p_week integer, p_user uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare g public.gatherings; d jsonb; s jsonb; steps jsonb; meta jsonb; e jsonb; st jsonb; out jsonb := '[]'::jsonb; item jsonb;
        here uuid[]; v_k text; v_attr text; v_fell boolean; v_series text; v_season int; v_rows jsonb; v_res int; v_me text := p_user::text;
        v_earn jsonb; v_lines jsonb; v_line text; v_gold int; v_parts text[]; v_tz text; v_ue_won boolean; v_asked int;
begin
  select * into g from public.gatherings where party_id = p_party and week = p_week;
  d := public.g_script(p_party, p_week); steps := d -> 'steps'; meta := d -> 'meta'; s := g.state;
  here := public.g_here(p_party, p_week);
  select series_id, season_number, time_zone into v_series, v_season, v_tz from public.parties where id = p_party;
  v_fell := exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = v_me and (x ->> 'fallen')::boolean);
  v_ue_won := s -> 'ue' ->> 'outcome' = 'won';

  for e in select x from jsonb_array_elements(coalesce(s -> 'log', '[]'::jsonb)) x loop
    st := steps -> (e ->> 'i')::int; v_k := e ->> 'i'; item := e;
    case e ->> 't'
      when 'act' then
        item := item || jsonb_build_object('by', s -> 'tappedBy' -> v_k, 'tapped', s -> 'tapped' ? v_k);
      when 'notice' then
        if v_fell and st -> 'lines' ? 'floor' then
          item := item || jsonb_build_object('attr', 'floor', 'text', public.g_fill(p_party, st -> 'lines' ->> 'floor', s));
        else
          v_attr := public.g_top_attr(p_party, p_user, st -> 'lines');
          item := item || jsonb_build_object('attr', v_attr, 'text', public.g_fill(p_party, st -> 'lines' ->> v_attr, s));
        end if;
      when 'lookCloser' then
        v_attr := public.g_top_attr(p_party, p_user, st -> 'lines');
        item := item || jsonb_build_object('attr', v_attr,
          'offered', not v_fell and not (p_week = 5 and s -> 'ue' ->> 'outcome' = 'lost') and s -> 'order' ? v_me,
          'mine', s -> 'look' -> v_me,
          'line', case when (s -> 'look' -> v_me ->> 'pass')::boolean then public.g_fill(p_party, st -> 'lines' ->> (s -> 'look' -> v_me ->> 'attr'), s) end,
          'score', public.g_score(p_party, p_user, v_attr), 'dc', (meta ->> 'dc')::int);
      when 'pick' then
        v_res := (s -> 'result' ->> v_k)::int;
        item := item || jsonb_build_object('mode', st ->> 'mode', 'question', st ->> 'question', 'options', st -> 'options',
          'mine', s -> 'picks' -> v_k -> v_me, 'result', v_res, 'count', (select count(*) from jsonb_object_keys(coalesce(s -> 'picks' -> v_k, '{}'::jsonb))),
          'chosen', case when st ->> 'mode' = 'chosen' then public.g_name(p_party, (s ->> 'chosen')::uuid) end,
          'chosenIsMe', st ->> 'mode' = 'chosen' and s ->> 'chosen' = v_me,
          'openToAll', st ->> 'mode' = 'chosen' and coalesce((s ->> 'chosenOpen')::boolean, false),
          'chooseFrom', case when st ->> 'mode' = 'chosen' then (e ->> 'at')::timestamptz + interval '30 seconds' end,
          'votes', case when st ->> 'mode' = 'vote' or v_res is not null then
            (select coalesce(jsonb_agg(jsonb_build_object('name', public.g_name(p_party, key::uuid), 'o', value::int)), '[]'::jsonb)
             from jsonb_each(coalesce(s -> 'picks' -> v_k, '{}'::jsonb))) end);
      when 'approach' then
        item := item || jsonb_build_object('title', st ->> 'title', 'ways', st -> 'ways', 'reward', st ->> 'reward', 'fail', public.g_fill(p_party, st ->> 'fail', s),
          'way', coalesce((s ->> 'way')::int, 0), 'phase', s -> 'approach' ->> 'phase',
          'stepped', (select coalesce(jsonb_agg(public.g_name(p_party, (v.value ->> 'u')::uuid)), '[]'::jsonb) from jsonb_array_elements(s -> 'approach' -> 'vols') v),
          'iStepped', exists (select 1 from jsonb_array_elements(s -> 'approach' -> 'vols') v where v.value ->> 'u' = v_me),
          'roller', public.g_name(p_party, (s -> 'approach' ->> 'roller')::uuid), 'rollerIsMe', s -> 'approach' ->> 'roller' = v_me,
          'roll', s -> 'approach' -> 'roll', 'dc', (meta ->> 'dc')::int,
          'map', (select count(*) from public.fragment_words fw join public.fragments fr on fr.id = fw.fragment_id
                  and fr.series_id = v_series and fr.season_number = v_season
                  where fw.party_id = p_party and fr.week = p_week and fw.solved_by is not null) >= 12);
      when 'battle' then
        item := item || jsonb_build_object('name', coalesce(nullif(st ->> 'name', ''), meta ->> 'enemy'),
          'desc', public.g_fill(p_party, st ->> 'desc', s), 'condition', meta ->> 'condition',
          'firstLine', case when st -> 'firstLines' is not null and st -> 'firstLines' <> 'null'::jsonb then
            st -> 'firstLines' ->> (case when (s -> 'battle' ->> 'partyFirst')::boolean then 0 else 1 end) end,
          'def', (meta ->> 'def')::int, 'atk', (meta ->> 'atk')::int, 'reward', (meta ->> 'reward')::int,
          'round', s -> 'battle' -> 'round', 'outcome', s -> 'battle' ->> 'outcome', 'partyFirst', s -> 'battle' -> 'partyFirst',
          'fighters', (select jsonb_agg(jsonb_build_object('id', x ->> 'id', 'name', x ->> 'name', 'hp', x -> 'hp', 'fallen', x -> 'fallen',
                         'weapon', x -> 'weapon', 'armor', x -> 'armor', 'relic', x ->> 'relicFrom', 'relicPending', x ->> 'relicPending',
                         'late', x -> 'late', 'foe', (s -> 'battle' -> 'foes' -> (o::int - 1)) - 'owner'))
                       from jsonb_array_elements(s -> 'battle' -> 'fighters') with ordinality a(x, o)),
          'myRounds', (select coalesce(jsonb_agg(jsonb_build_object('round', r -> 'round', 'lines',
                         coalesce(r -> 'lines' -> v_me, '[]'::jsonb) || (select coalesce(jsonb_agg(l), '[]'::jsonb) from jsonb_each(r -> 'lines') fl,
                           jsonb_array_elements(fl.value) l where fl.key <> v_me and l ->> 'attacker' = public.g_name(p_party, p_user)))
                         order by (r ->> 'round')::int), '[]'::jsonb)
                       from jsonb_array_elements(s -> 'battle' -> 'rounds') r where r -> 'lines' ? v_me),
          'help', (select coalesce(jsonb_agg(h || jsonb_build_object('name', public.g_name(p_party, (h ->> 'id')::uuid),
                     'canTake', exists (select 1 from jsonb_array_elements(s -> 'battle' -> 'fighters') x where x ->> 'id' = h ->> 'id'
                       and not (x ->> 'fallen')::boolean and x ->> 'relicFrom' is null and x ->> 'relicPending' is null))), '[]'::jsonb)
                   from jsonb_array_elements(coalesce(s -> 'battle' -> 'help', '[]'::jsonb)) h));
      when 'ue' then
        item := item || jsonb_build_object('title', meta ->> 'ueTitle', 'attr', meta ->> 'ueAttr', 'dc', (meta ->> 'ueDc')::int,
          'barWay', meta ->> 'barWay', 'barRisk', public.g_fill(p_party, meta ->> 'barRisk', s),
          'start', s -> 'ue' -> 'start', 'way', s -> 'ue' -> 'way', 'risk', s -> 'ue' -> 'risk', 'outcome', s -> 'ue' ->> 'outcome',
          'phase', s -> 'ue' ->> 'phase', 'next', public.g_name(p_party, (s -> 'ue' ->> 'next')::uuid), 'nextIsMe', s -> 'ue' ->> 'next' = v_me,
          'named', coalesce((s -> 'ue' ->> 'named')::boolean, false),
          'handerIsMe', s -> 'ue' ->> 'phase' = 'handon' and s -> 'ue' ->> 'by' = v_me,
          'eligible', (select coalesce(jsonb_agg(jsonb_build_object('id', x, 'name', public.g_name(p_party, x::uuid))), '[]'::jsonb)
                       from unnest(public.g_ue_eligible(s -> 'ue')) x),
          'rolls', s -> 'ue' -> 'rolls', 'relic', case when s -> 'ue' -> 'relic' is not null and s -> 'ue' -> 'relic' <> 'null'::jsonb then
            jsonb_build_object('kind', s -> 'ue' -> 'relic' ->> 'kind', 'from', public.g_name(p_party, (s -> 'ue' -> 'relic' ->> 'from')::uuid),
                               'mine', s -> 'ue' -> 'relic' ->> 'from' = v_me) end,
          'myScore', public.g_score(p_party, p_user, meta ->> 'ueAttr'),
          'nextScore', public.g_score(p_party, (s -> 'ue' ->> 'next')::uuid, meta ->> 'ueAttr'));
      when 'match' then
        select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'day', f.day, 'place', f.place_label,
                 'text', replace(replace(f.template, '{0}', f.word1), '{1}', f.word2)) order by f.day), '[]'::jsonb)
          into v_rows from public.fragments f where f.series_id = v_series and f.season_number = v_season and f.week = p_week;
        item := item || jsonb_build_object('question', st ->> 'question', 'quote', st ->> 'quote', 'rows', v_rows,
          'mine', s -> 'match' -> v_k -> 'picks' ->> v_me,
          'picked', (select coalesce(jsonb_agg(public.g_name(p_party, key::uuid)), '[]'::jsonb) from jsonb_object_keys(s -> 'match' -> v_k -> 'picks') key),
          'done', s -> 'match' -> v_k -> 'done');
        if (s -> 'match' -> v_k ->> 'done')::boolean then
          item := item || jsonb_build_object('answer', st ->> 'answer', 'source', st ->> 'source', 'all', s -> 'match' -> v_k -> 'all',
            'pay', s -> 'match' -> v_k -> 'pay', 'iMatched', s -> 'match' -> v_k -> 'right' ? v_me,
            'right', (select coalesce(jsonb_agg(public.g_name(p_party, x::uuid)), '[]'::jsonb) from jsonb_array_elements_text(s -> 'match' -> v_k -> 'right') x),
            'rightNames', public.g_names(p_party, (select array_agg(x::uuid) from jsonb_array_elements_text(s -> 'match' -> v_k -> 'right') x)));
        end if;
      when 'turn' then
        item := item || jsonb_build_object('question', st ->> 'question',
          'nudge', case when (s -> 'turn' -> v_k ->> 'nudged')::boolean then st ->> 'nudge' end,
          'by', public.g_name(p_party, (s -> 'turn' -> v_k ->> 'by')::uuid), 'said', s -> 'turn' -> v_k ->> 'text',
          'answer', case when s -> 'turn' -> v_k ? 'by' or (s -> 'turn' -> v_k ->> 'given')::boolean then st ->> 'answer' end);
      when 'ask' then
        select count(*) into v_asked from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where a ->> 'u' = v_me;
        item := item || jsonb_build_object(
          'rows', (select jsonb_agg(jsonb_build_object('q', public.g_fill(p_party, x -> 'questions' ->> 0, s), 'sealed', x -> 'sealed',
                     'note', x ->> 'note', 'group', x ->> 'group',
                     'by', (select public.g_name(p_party, (a ->> 'u')::uuid) from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1),
                     'answer', case when exists (select 1 from jsonb_array_elements(s -> 'ask' -> v_k -> 'asked') a where (a ->> 'r')::int = o - 1)
                                      or (s -> 'ask' -> v_k -> 'unasked') @> to_jsonb(o - 1) then public.g_fill(p_party, x ->> 'answer', s) end) order by o)
                   from jsonb_array_elements(st -> 'rows') with ordinality r(x, o)),
          'asked', s -> 'ask' -> v_k -> 'asked', 'done', s -> 'ask' -> v_k -> 'done', 'unasked', s -> 'ask' -> v_k -> 'unasked',
          'unaskedLine', public.g_fill(p_party, st ->> 'unaskedLine', s),
          'left', case when coalesce((s ->> 'n')::int, 1) <= 1 then 4 when (s ->> 'n')::int = 2 then 2 else 1 end - v_asked);
      when 'summary' then
        v_earn := coalesce(s -> 'earned' -> v_me, '{}'::jsonb);
        v_gold := coalesce((v_earn ->> 'gold')::int, 0);
        v_parts := '{}';
        if v_gold <> 0 then v_parts := v_parts || (case when v_gold > 0 then '+' else '−' end || to_char(abs(v_gold), 'FM999,999') || 'g'); end if;
        if coalesce((v_earn ->> 'growth')::int, 0) > 0 then v_parts := v_parts || ((v_earn ->> 'attr') || ' +' || (v_earn ->> 'growth')); end if;
        if coalesce((s ->> 'matches')::int, 0) > 0 then
          v_parts := v_parts || ('Match: ' || coalesce((v_earn ->> 'match')::int, 0) || ' of ' || (s ->> 'matches'));
        end if;
        select jsonb_agg(case
            when l = '{EARNED}' then 'You earned: ' || case when cardinality(v_parts) = 0 then 'nothing new' else array_to_string(v_parts, ' · ') end
            else regexp_replace(regexp_replace(regexp_replace(
                   replace(replace(public.g_fill(p_party, l, s), '{battle}', case when s -> 'battle' ->> 'outcome' = 'won' then 'won' else 'lost' end),
                           '{asked}', coalesce((select sum(jsonb_array_length(v.value -> 'asked')) from jsonb_each(coalesce(s -> 'ask', '{}'::jsonb)) v), 0)::text),
                   '\{ue:([^|}]*)\|([^}]*)\}', case when v_ue_won then '\1' else '\2' end, 'g'),
                   '\{pick:31:([^|}]*)\|([^}]*)\}', case when (s -> 'result' ->> '31')::int = 0 then '\1' else '\2' end, 'g'),
                   '\{pick:61:([^|}]*)\|([^|}]*)\|([^}]*)\}',
                     case (s -> 'result' ->> '61')::int when 0 then '\1' when 1 then '\2' else '\3' end, 'g') end order by o)
          into v_lines from jsonb_array_elements_text(st -> 'lines') with ordinality z(l, o);
        item := item || jsonb_build_object('lines', v_lines);
      else null;
    end case;
    out := out || item;
  end loop;

  return jsonb_build_object(
    'week', p_week, 'version', g.version, 'now', now(), 'opensAt', g.opens_at, 'startedAt', g.started_at, 'endedAt', g.ended_at,
    'cursor', g.cursor, 'waitUntil', g.wait_until, 'timeZone', v_tz,
    'tonight', (select x ->> 'text' from jsonb_array_elements(steps) x where x ->> 't' = 'tonight' limit 1),
    'ueAttr', meta ->> 'ueAttr',
    'party', (select jsonb_agg(jsonb_build_object('id', o.u, 'name', public.g_name(p_party, o.u), 'here', o.u = any(here),
                'in', coalesce(s -> 'order', '[]'::jsonb) ? o.u::text) order by o.ord)
              from unnest(public.g_party_order(p_party)) with ordinality o(u, ord)),
    'me', v_me, 'isHost', (select host_id = p_user from public.parties where id = p_party),
    'n', s -> 'n', 'log', out,
    'readBacks', public.gathering_read_backs(p_party, p_week),
    'weeksBest', public.gathering_weeks_best(p_party, p_week),
    'seasonTitles', case when p_week = 6 then public.party_season_titles(p_party) else '[]'::jsonb end,
    'progress', (select jsonb_build_object('gold', gold, 'attrs', attrs, 'relics', relics, 'weapon', 13 + weapon_level, 'armor', 26 + armor_level)
                 from public.member_progress where party_id = p_party and user_id = p_user));
end;
$function$;
