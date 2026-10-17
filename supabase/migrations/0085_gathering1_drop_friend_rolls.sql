-- Gathering 1's United Effort: the friend in the drop takes turns too, working themselves up from below (gameplay
-- verdict 17 Oct: in a party of two the other friend made all eight rolls). g_advance as in 0032 with the one line that
-- removed them from the rollers taken out. The demo does the same (StoryAndPartyTabs.tsx).
create or replace function public.g_advance(p_party uuid, p_week int) returns void
language plpgsql security definer set search_path = '' as $$
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
        if s -> 'picks' -> v_k ? (s ->> 'chosen') then v_res := (s -> 'picks' -> v_k ->> (s ->> 'chosen'))::int;
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
$$;
