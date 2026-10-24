-- Phase 0.1 (docs/design/handoff-ledger.md, 24 Oct 2026): close two holes, and bring the live server up to the repo's code.
--
-- Found on 24 Oct: several functions in migrations 0102-0110 never reached the live project (their files were edited after
-- they were applied, or applied out of order), so live still ran older versions. Players hit this: weekday fights ran the
-- 0103 draft (wrong strike-first rule key, dice fields the screen does not read, Combat Relic ignored); the Notice roll
-- lacked 0102's party check; road finds never reached the hand at the fire; read-backs of earlier nights never showed.
-- This file sets each of them to the repo's latest version (taken from a local copy built from 0001-0111), with these
-- changes on top:
--   * g_view: the live 0104 version plus the read-backs line (0105's rewrite of g_view was broken and is not used);
--   * campfire(): also returns the night's questionTitle (the screen already shows it; the server never sent it);
--   * casebook(): the answer to a night's puzzle is shown only for nights already past, never tonight's;
--   * a four-value fire_fork_pieces_for(party, user, week, day) for bag_shelves (0109 calls it; it did not exist, so the
--     Bag's Verses and Found Along the Road shelves failed).
-- Holes closed: roll_challenge and roll_press (the old rolls, closed in 0021, reopened in 0103; no screen calls them) and
-- the read-back functions (only other server functions call them; one was open even to visitors not signed in).
-- The Record's functions (my_record, compute_member_record, check_member_big_moments) are left as live has them; they are
-- repaired in Phase 0.3. Chapters and the Week 1 fire data also differ between live and the repo; that is story text, and
-- waits for Fake Guru. Additive: create or replace and revoke only.

CREATE OR REPLACE FUNCTION public.fight_round(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_row public.member_days; v_rule jsonb; v_enemy_first boolean;
        v_fight jsonb; v_rounds jsonb; v_php int; v_ehp int; v_weapon int; v_armor int; v_def int; v_atk int;
        v_d20 int; v_ed20 int; v_margin int; v_emargin int; v_hit boolean := false; v_ehit boolean := false;
        v_pstruck boolean := false; v_estruck boolean := false; v_round jsonb; v_done boolean; v_won boolean; v_relic boolean;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  select * into v_row from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  v_step := public.today_step(p_party, v_week, v_day, 'fight');
  if v_step is null then raise exception 'no fight today'; end if;
  v_fight := coalesce(v_row.fight, jsonb_build_object('rounds', '[]'::jsonb, 'done', false));
  if (v_fight ->> 'done')::boolean then raise exception 'the fight is over'; end if;
  v_rule := v_step -> 'strikeFirst';
  if v_rule ->> 'on' = 'challenge' then
    if v_row.challenge is null then raise exception 'not yet'; end if;
    v_enemy_first := not (v_row.challenge ->> 'pass')::boolean;
  elsif v_rule ->> 'on' = 'choice' then
    if not (v_row.picks ? (v_rule ->> 'choice')) then raise exception 'not yet'; end if;
    v_enemy_first := not ((v_rule -> 'options') @> ((v_row.picks -> (v_rule ->> 'choice')) -> 0));
  else
    v_enemy_first := false;
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  v_def := (v_meta ->> 'wDef')::int; v_atk := (v_meta ->> 'wAtk')::int;
  v_rounds := v_fight -> 'rounds';
  v_relic := v_fight ? 'relicFrom' and jsonb_array_length(v_rounds) + 1 >= (v_fight ->> 'relicFrom')::int;
  select 13 + weapon_level + (case when v_relic then 1 else 0 end), 26 + armor_level + (case when v_relic then 1 else 0 end)
    into v_weapon, v_armor from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_php := coalesce((v_rounds -> -1 ->> 'playerHpAfter')::int, 100);
  v_ehp := coalesce((v_rounds -> -1 ->> 'enemyHpAfter')::int, 100);
  v_d20 := public.d20(); v_ed20 := public.d20();
  v_margin := v_d20 + v_weapon - v_def; v_emargin := v_ed20 + v_atk - v_armor;
  for i in 1..2 loop
    if (i = 1) = v_enemy_first then
      if v_ehp > 0 then v_estruck := true; v_ehit := v_emargin > 0; if v_ehit then v_php := greatest(0, v_php - v_emargin * 5); end if; end if;
    else
      if v_php > 0 then v_pstruck := true; v_hit := v_margin > 0; if v_hit then v_ehp := greatest(0, v_ehp - v_margin * 5); end if; end if;
    end if;
  end loop;
  v_round := jsonb_build_object('round', jsonb_array_length(v_rounds) + 1, 'enemyFirst', v_enemy_first,
    'd20', v_d20, 'playerAtk', v_weapon, 'enemyDef', v_def, 'margin', v_margin, 'hit', v_hit, 'playerStruck', v_pstruck,
    'enemyD20', v_ed20, 'enemyAtk', v_atk, 'playerArmor', v_armor, 'enemyMargin', v_emargin, 'enemyHit', v_ehit, 'enemyStruck', v_estruck,
    'playerHpAfter', v_php, 'enemyHpAfter', v_ehp, 'relic', v_relic);
  v_done := v_php <= 0 or v_ehp <= 0;
  v_won := v_ehp <= 0;
  v_fight := v_fight || jsonb_build_object('rounds', v_rounds || v_round, 'done', v_done, 'won', v_won);
  if v_done and v_won and coalesce((v_meta ->> 'fightReward')::int, 0) > 0 then
    update public.member_progress set gold = gold + (v_meta ->> 'fightReward')::int where party_id = p_party and user_id = auth.uid();
    v_fight := v_fight || jsonb_build_object('gold', (v_meta ->> 'fightReward')::int);
  end if;
  update public.member_days set fight = v_fight, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  if v_pstruck and v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'fight:' || v_week || ':' || v_day || ':' || (jsonb_array_length(v_rounds) + 1));
  end if;
  if v_done and v_won then
    perform public.check_member_big_moments(p_party, auth.uid());
  end if;

  return v_fight;
end;
$function$;

CREATE OR REPLACE FUNCTION public.roll_notice(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_week int;
  v_day int;
  v_user uuid := auth.uid();
  v_existing jsonb;
  v_attrs jsonb;
  v_class text;
  v_class_attr text;
  v_best text;
  v_top int := -1;
  v_d20 int;
  v_bonus int := 0;
  v_total int;
  v_pass boolean;
  v_notice_line jsonb;
  v_text text;
  v_novice_note text := null;
  v_res jsonb;
begin
  if v_user is null then raise exception 'not signed in'; end if;

  if not exists (
    select 1 from public.party_members
    where party_id = p_party and user_id = v_user and status = 'approved'
  ) then
    raise exception 'not in party';
  end if;

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null then raise exception 'the story has not started'; end if;

  select notice into v_existing from public.member_days
  where party_id = p_party and user_id = v_user and week = v_week and day = v_day;

  if v_existing is not null then
    return v_existing;
  end if;

  select attrs into v_attrs from public.member_progress where party_id = p_party and user_id = v_user;
  select class into v_class from public.party_members where party_id = p_party and user_id = v_user;
  v_class_attr := public.class_attribute(v_class);

  v_notice_line := public.notice_line_for(p_party, v_user, v_week, v_day);
  if v_notice_line is not null and v_notice_line ? 'attr' then
    v_best := v_notice_line ->> 'attr';
  else
    v_best := coalesce(v_class_attr, 'Intellect');
  end if;

  v_top := coalesce((v_attrs ->> v_best)::int, 10);

  v_bonus := case
    when v_top >= 101 then 8
    when v_top >= 76 then 6
    when v_top >= 51 then 4
    when v_top >= 26 then 2
    else 0
  end;

  v_d20 := floor(random() * 20 + 1)::int;
  v_total := v_d20 + v_bonus;
  v_pass := (v_total >= 4);

  if v_pass then
    if v_notice_line is not null and coalesce(v_notice_line ->> 'text', '') <> '' then
      v_text := v_notice_line ->> 'text';
    else
      v_text := 'You notice subtle details in your surroundings.';
    end if;
    if v_top < 26 then
      v_novice_note := 'At Apprentice (26), you would catch more.';
    end if;
  else
    v_text := 'Nothing catches your eye.';
  end if;

  v_res := jsonb_build_object(
    'attr', v_best,
    'score', v_top,
    'd20', v_d20,
    'bonus', v_bonus,
    'total', v_total,
    'dc', 3,
    'pass', v_pass,
    'text', v_text,
    'noviceNote', v_novice_note
  );

  insert into public.member_days (party_id, user_id, week, day, notice)
  values (p_party, v_user, v_week, v_day, v_res)
  on conflict (party_id, user_id, week, day)
  do update set notice = v_res;

  return v_res;
end;
$function$;

CREATE OR REPLACE FUNCTION public.roll_card(p_party uuid, p_attr text, p_relic boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_week int; v_day int; v_step jsonb; v_meta jsonb; v_dc int; v_score int; v_bonus int; v_relic int := 0; v_d20 int; v_net int;
  v_pass boolean; v_growth int := 0; v_played int; v_base int; v_result jsonb;
  v_steps jsonb; v_idx int; v_prev_step jsonb; v_picks jsonb; v_fit_opt int; v_forced_attr text;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if (select challenge from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) is not null then
    raise exception 'already rolled';
  end if;
  v_step := public.today_step(p_party, v_week, v_day, 'challenge');

  -- Check if a 'pick' Fit fork immediately precedes the Challenge card in today's chapter
  select c.script -> 'steps' into v_steps
  from public.chapters c
  join public.parties p on p.series_id = c.series_id and p.season_number = c.season_number
  where p.id = p_party and c.week = v_week and c.day = v_day;

  select (ord - 1)::int into v_idx
  from jsonb_array_elements(coalesce(v_steps, '[]'::jsonb)) with ordinality as t(elem, ord)
  where elem ->> 't' = 'challenge'
  limit 1;

  if v_idx is not null and v_idx > 0 then
    v_prev_step := v_steps -> (v_idx - 1);
    if (v_prev_step ->> 't') = 'choice'
       and (v_prev_step ->> 'mode') = 'pick'
       and jsonb_array_length(coalesce(v_prev_step -> 'labels', '[]'::jsonb)) = jsonb_array_length(coalesce(v_step -> 'options', '[]'::jsonb))
    then
      select picks into v_picks
      from public.member_days
      where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

      if jsonb_array_length(coalesce(v_picks -> (v_prev_step ->> 'id'), '[]'::jsonb)) > 0 then
        v_fit_opt := (v_picks -> (v_prev_step ->> 'id') ->> 0)::int;
        v_forced_attr := v_step -> 'options' -> v_fit_opt ->> 'attr';
        if v_forced_attr is not null then
          p_attr := v_forced_attr;
        end if;
      end if;
    end if;
  end if;

  if v_step is null or not exists (select 1 from jsonb_array_elements(v_step -> 'options') o where o ->> 'attr' = p_attr) then
    raise exception 'not today''s Challenge';
  end if;
  if public.day_open_step(p_party, auth.uid(), v_week, v_day) <> 'card' then raise exception 'not yet'; end if;
  if p_relic then
    perform public.spend_relic(p_party, p_attr);
    v_relic := 4;
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  v_dc := (v_meta ->> 'dc')::int
          + case when v_step ? 'harderIf' and (public.party_claims(p_party) ? (v_step -> 'harderIf' ->> 'key')) = (v_step -> 'harderIf' ->> 'has')::boolean
                 then (v_step -> 'harderIf' ->> 'by')::int else 0 end;
  select (attrs ->> p_attr)::int into v_score from public.member_progress where party_id = p_party and user_id = auth.uid();
  v_bonus := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_net := v_d20 + v_bonus + v_relic - v_dc;
  v_pass := v_net >= 1;
  if v_pass then
    if 1 + v_bonus - v_dc < 1 and 20 + v_bonus - v_dc >= 1 then
      select count(*) + 1 into v_played from public.member_days
      where party_id = p_party and user_id = auth.uid() and week = v_week and finished_at is not null;
      v_base := (array[12, 9, 7, 5, 4, 3, 3])[least(7, greatest(1, v_played))];
      v_growth := greatest(1, round(v_base * public.tier_rate(v_score))::int);
    end if;
    update public.member_progress
    set gold = gold + 500, attrs = jsonb_set(attrs, array[p_attr], to_jsonb(least(100, v_score + v_growth)))
    where party_id = p_party and user_id = auth.uid();
  else
    update public.member_progress set gold = greatest(0, gold - 150) where party_id = p_party and user_id = auth.uid();
  end if;
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;

  if v_d20 = 20 then
    perform public.post_natural_20(p_party, auth.uid(), 'challenge:' || v_week || ':' || v_day);
  end if;
  perform public.check_member_big_moments(p_party, auth.uid());

  return v_result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.party_chat_messages(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := auth.uid();
  v_week int;
  v_day int;
  v_check_day int;
  v_start timestamptz;
  v_can_see_today boolean := false;
  v_res jsonb;
  v_max_id bigint;
  v_curr_seq bigint;
begin
  if v_me is null or not public.is_party_member(p_party) or not public.party_chat_open(p_party) then
    return '[]'::jsonb;
  end if;

  -- Lock today's morning snapshot first so opening the app in the morning preserves "The Party, Yesterday"
  perform public.lock_today_seen_snapshot(p_party, v_me);

  select t.week, t.day into v_week, v_day from public.party_today(p_party) t;
  if v_week is null or v_day > 6 then
    v_can_see_today := true;
  else
    v_check_day := case when public.is_late_day1(p_party, v_me) then 1 else v_day end;
    v_can_see_today := exists (
      select 1 from public.member_days md
      where md.party_id = p_party and md.user_id = v_me
        and md.week = v_week and md.day = v_check_day and md.finished_at is not null
    );
    v_start := public.party_day_start(p_party, v_week, v_day);
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', x.id,
        'party_id', x.party_id,
        'author_id', x.author_id,
        'kind', x.kind,
        'speaker', x.speaker,
        'body', x.body,
        'created_at', x.created_at,
        'at_fire', x.at_fire,
        'reply_to_user', x.reply_to_user
      )
      order by x.created_at desc, x.id desc
    ),
    '[]'::jsonb
  ),
  max(x.id)
  into v_res, v_max_id
  from (
    select m.id, m.party_id, m.author_id, m.kind, m.speaker, m.body, m.created_at, m.at_fire, m.reply_to_user
    from public.party_messages m
    where m.party_id = p_party
      and (
        case
          when m.kind = 'nudge' or (m.reply_to_user is not null and m.speaker is null and m.author_id is null) then
            (m.reply_to_user = v_me or m.author_id = v_me)
          else
            (
              v_can_see_today
              or m.created_at < v_start
              or m.author_id = v_me
              or m.reply_to_user = v_me
            )
        end
      )
    order by m.created_at desc, m.id desc
    limit 200
  ) x;

  if v_max_id is not null then
    update public.member_progress
       set chat_seen_msg_id = greatest(chat_seen_msg_id, v_max_id)
     where party_id = p_party and user_id = v_me;
  end if;

  if v_can_see_today then
    select case when is_called then last_value else 0 end into v_curr_seq from public.party_activity_seq;
    update public.member_progress
       set chat_seen_seq = greatest(chat_seen_seq, coalesce(v_curr_seq, 0))
     where party_id = p_party and user_id = v_me;
  end if;

  return v_res;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fire_table(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_week int; v_day int; v_me uuid := auth.uid(); v_data jsonb; v_narrated boolean; v_pieces jsonb;
        v_mine_pin public.fire_pins; v_passed boolean; v_pressed boolean; v_notice_passed boolean; v_notice jsonb; v_hands jsonb := '[]'::jsonb;
        v_press jsonb; v_prev_w int; v_prev_d int; v_readings jsonb; v_kinds int;
        v_fork record;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  if not exists (select 1 from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
    raise exception 'not at the fire';
  end if;
  v_data := public.campfire_data(p_party, v_week, v_day);
  v_narrated := coalesce((v_data ->> 'narrated')::boolean, false);
  perform public.fire_check_clicks(p_party, v_week, v_day);
  v_pieces := public.fire_pieces(p_party, v_week, v_day);
  if v_narrated then
    select coalesce(jsonb_agg(p), '[]'::jsonb) into v_pieces from jsonb_array_elements(v_pieces) p
    where exists (select 1 from jsonb_array_elements(p -> 'by') b where b ->> 'id' = v_me::text);
  end if;
  select coalesce(jsonb_agg(p || jsonb_build_object(
      'mine', exists (select 1 from jsonb_array_elements(p -> 'by') b where b ->> 'id' = v_me::text),
      'agree', (select coalesce(jsonb_agg(m.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                join public.party_members m on m.party_id = r.party_id and m.user_id = r.user_id
                where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = p ->> 'key' and r.kind = 'agree'),
      'doubt', (select coalesce(jsonb_agg(m.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                join public.party_members m on m.party_id = r.party_id and m.user_id = r.user_id
                where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = p ->> 'key' and r.kind = 'doubt'),
      'myReaction', (select kind from public.fire_reactions where party_id = p_party and user_id = v_me and week = v_week and day = v_day
                     and target = p ->> 'key' and kind <> 'none')) order by p ->> 'at'), '[]'::jsonb)
    into v_pieces from jsonb_array_elements(v_pieces) p;

  if not v_narrated then
    select coalesce((notice ->> 'pass')::boolean, false),
           coalesce((challenge ->> 'pass')::boolean, false),
           coalesce((press ->> 'pass')::boolean, false)
      into v_notice_passed, v_passed, v_pressed
      from public.member_days
     where party_id = p_party and user_id = v_me and week = v_week and day = v_day;

    if coalesce(v_notice_passed, false) then
      v_notice := public.notice_line_for(p_party, v_me, v_week, v_day);
      if v_notice is not null and not exists (select 1 from public.fire_shares where party_id = p_party and user_id = v_me and week = v_week and day = v_day) then
        v_hands := v_hands || jsonb_build_object('kind', 'notice', 'title', 'What you noticed', 'attr', v_notice ->> 'attr', 'text', v_notice ->> 'text');
      end if;
    end if;

    if v_passed and public.fire_pass_text(p_party, v_week, v_day) is not null
       and not exists (select 1 from public.fire_laid where party_id = p_party and user_id = v_me and week = v_week and day = v_day and kind = 'pass') then
      v_hands := v_hands || jsonb_build_object('kind', 'pass', 'title', 'What you heard, because you passed', 'text', public.fire_pass_text(p_party, v_week, v_day));
    end if;
    v_press := public.fire_press_piece(p_party, v_week, v_day);
    if v_pressed and v_press is not null
       and not exists (select 1 from public.fire_laid where party_id = p_party and user_id = v_me and week = v_week and day = v_day and kind = 'press') then
      v_hands := v_hands || jsonb_build_object('kind', 'press', 'title', v_press ->> 'title', 'text', v_press ->> 'text');
    end if;

    -- Fork road finds held by this player that have not yet been laid on the table
    for v_fork in
      select fp.key, fp.title, fp.body
      from public.fire_fork_pieces_for(p_party, v_week, v_day) fp
      where fp.user_id = v_me
        and not exists (
          select 1 from public.fire_laid l
          where l.party_id = p_party and l.user_id = v_me and l.week = v_week and l.day = v_day and l.kind = fp.key
        )
    loop
      v_hands := v_hands || jsonb_build_object('kind', v_fork.key, 'title', v_fork.title, 'text', v_fork.body);
    end loop;
  end if;

  select * into v_mine_pin from public.fire_pins where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
  if v_mine_pin.user_id is not null and not v_narrated then
    select coalesce(jsonb_agg(jsonb_build_object('id', fp.user_id, 'name', m.character_name, 'reading', fp.reading, 'line', fp.line,
        'mine', fp.user_id = v_me,
        'agree', (select coalesce(jsonb_agg(rm.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                  join public.party_members rm on rm.party_id = r.party_id and rm.user_id = r.user_id
                  where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = 'pin:' || fp.user_id and r.kind = 'agree'),
        'doubt', (select coalesce(jsonb_agg(rm.character_name order by r.at), '[]'::jsonb) from public.fire_reactions r
                  join public.party_members rm on rm.party_id = r.party_id and rm.user_id = r.user_id
                  where r.party_id = p_party and r.week = v_week and r.day = v_day and r.target = 'pin:' || fp.user_id and r.kind = 'doubt'),
        'myReaction', (select kind from public.fire_reactions where party_id = p_party and user_id = v_me and week = v_week and day = v_day
                       and target = 'pin:' || fp.user_id and kind <> 'none')) order by fp.at), '[]'::jsonb)
      into v_readings
    from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
    where fp.party_id = p_party and fp.week = v_week and fp.day = v_day;
  end if;
  select count(distinct reading) into v_kinds from public.fire_pins where party_id = p_party and week = v_week and day = v_day;

  if v_day > 1 then v_prev_w := v_week; v_prev_d := v_day - 1;
  elsif v_week > 1 then v_prev_w := v_week - 1; v_prev_d := 6;
  end if;

  return jsonb_build_object('week', v_week, 'day', v_day, 'narrated', v_narrated,
    'evening', (select extract(hour from now() at time zone time_zone) >= 20 from public.parties where id = p_party),
    'pieces', v_pieces,
    'hands', v_hands,
    'clicks', (select coalesce(jsonb_agg(jsonb_build_object('text', (v_data -> 'clicks' -> (k.idx - 1)) ->> 'text',
                 'names', to_jsonb(k.names), 'solves', coalesce(((v_data -> 'clicks' -> (k.idx - 1)) ->> 'solves')::boolean, false)) order by k.at), '[]'::jsonb)
               from public.fire_clicks k where k.party_id = p_party and k.week = v_week and k.day = v_day),
    'puzzle', v_data -> 'puzzle',
    'thread', case when v_narrated then '[]'::jsonb else (
      select coalesce(jsonb_agg(t.item order by t.at), '[]'::jsonb) from (
        select x.at, x.item from (
          select th.at, jsonb_build_object('kind', th.kind, 'name', m.character_name, 'mine', th.user_id = v_me, 'body', th.body, 'at', th.at) item
          from public.fire_thread th left join public.party_members m on m.party_id = th.party_id and m.user_id = th.user_id
          where th.party_id = p_party and th.week = v_week and th.day = v_day
          union all
          select f.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', f.user_id = v_me, 'body', l ->> 'clueTitle', 'at', f.at)
          from public.fan_outs f join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
          join lateral jsonb_array_elements(v_data -> 'leads') l on l ->> 'id' = f.lead_id
          where f.party_id = p_party and f.week = v_week and f.day = v_day
          union all
          select s.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', s.user_id = v_me, 'body', 'What ' || m.character_name || ' noticed', 'at', s.at)
          from public.fire_shares s join public.party_members m on m.party_id = s.party_id and m.user_id = s.user_id
          where s.party_id = p_party and s.week = v_week and s.day = v_day
          union all
          select l.at, jsonb_build_object('kind', 'laid', 'name', m.character_name, 'mine', l.user_id = v_me,
                   'body', case
                     when l.kind = 'pass' then 'What the passers heard'
                     when l.kind = 'press' then coalesce(public.fire_press_piece(p_party, v_week, v_day) ->> 'title', 'A find')
                     else coalesce((select fp.title from public.fire_fork_pieces_for(p_party, v_week, v_day) fp where fp.key = l.kind limit 1), 'A find')
                   end, 'at', l.at)
          from public.fire_laid l join public.party_members m on m.party_id = l.party_id and m.user_id = l.user_id
          where l.party_id = p_party and l.week = v_week and l.day = v_day
        ) x order by x.at desc limit 200) t) end,
    'pinned', (select coalesce(jsonb_agg(m.character_name order by fp.at), '[]'::jsonb) from public.fire_pins fp
               join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
               where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and not v_narrated),
    'readings', v_readings,
    'leaning', case when v_narrated then null when v_kinds > 1 then 'split'
                    when v_kinds = 1 and v_mine_pin.user_id is not null
                         and (select count(*) from public.fire_pins where party_id = p_party and week = v_week and day = v_day) >= 2 then 'same' end,
    'lastCall', case when v_prev_w is not null then public.fire_call(p_party, v_prev_w, v_prev_d) end);
end;
$function$;

CREATE OR REPLACE FUNCTION public.today(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_week int;
  v_day int;
  v_series text;
  v_season int;
  r jsonb;
  v_recaps jsonb;
  v_missed int;
  v_yesterday jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  perform public.lock_today_seen_snapshot(p_party, auth.uid());
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  perform public.garrick_morning(p_party);
  select o_recaps, o_missed into v_recaps, v_missed from public.my_recaps(p_party);
  if v_week = 1 and v_day = 1 then v_recaps := '[]'::jsonb; v_missed := 0; end if;
  v_yesterday := public.party_yesterday(p_party);
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'claims', public.party_claims(p_party),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null),
    'recaps', v_recaps,
    'missed', v_missed,
    'partyYesterday', v_yesterday,
    'readBacks', public.party_read_backs(p_party, v_week, v_day)
  ) into r;
  return r;
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

CREATE OR REPLACE FUNCTION public.party_read_backs(p_party uuid, p_week integer, p_day integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_out jsonb := '[]'::jsonb;
begin
  if p_week = 1 and p_day = 2 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'So the list is hers.',
      'day', 1,
      'text', public.fire_read_back_line(p_party, 1, 1, 'Last night you called it', 'Last night you called it', 'B')
    ));
  elsif p_week = 1 and p_day = 4 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'He has half a day on you',
      'day', 3,
      'text', public.fire_read_back_line(p_party, 1, 3, 'On Day 3 you called it', 'The fire''s call on Day 3', 'B')
    ));
  elsif p_week = 1 and p_day = 5 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'About the last one.',
      'day', 2,
      'text', public.fire_read_back_line(p_party, 1, 2, 'On Day 2 you called it', 'The fire''s call on Day 2', 'B')
    ));
  elsif p_week = 2 and p_day = 2 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'knew the night he was born',
      'day', 1,
      'text', public.fire_read_back_line(p_party, 2, 1, 'Last night you called it', 'The fire''s call on Day 1', 'B')
    ));
  elsif p_week = 3 and p_day = 2 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'passed within a mile of her own door.',
      'day', 1,
      'text', public.fire_read_back_line(p_party, 3, 1, 'Last night you called it', 'The fire''s call on Day 1', 'B')
    ));
  elsif p_week = 4 and p_day = 6 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'there is nobody in it',
      'day', 5,
      'text', public.fire_read_back_line(p_party, 4, 5, 'Last night you called it', 'The fire''s call on Day 5', 'A')
    ));
  elsif p_week = 5 and p_day = 5 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'They have made their camp facing the doors',
      'day', 3,
      'text', public.fire_read_back_line(p_party, 5, 3, 'On Day 3 you called it', 'The fire''s call on Day 3', 'A')
    ));
  elsif p_week = 6 and p_day = 3 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'there are twice as many round it as there were.',
      'day', 1,
      'text', public.fire_read_back_line(p_party, 6, 1, 'On Day 1 you called it', 'The fire''s call on Day 1', 'B')
    ));
  elsif p_week = 6 and p_day = 6 then
    v_out := jsonb_build_array(jsonb_build_object(
      'anchor', 'At the mouth of the crack, one soldier has stopped walking, and turned round.',
      'day', 4,
      'text', public.fire_read_back_line(p_party, 6, 4, 'On Day 4 you called it', 'The fire''s call on Day 4', 'B')
    ));
  end if;
  return v_out;
end;
$function$;

CREATE OR REPLACE FUNCTION public.gathering_read_backs(p_party uuid, p_week integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_out jsonb := '[]'::jsonb;
begin
  if p_week = 1 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'The first is Tamsin''s.', 'day', 4,
        'text', public.fire_read_back_line(p_party, 1, 4, 'On Day 4 you called it', 'The fire called it on Day 4', 'A')),
      jsonb_build_object('anchor', 'Whoever tied them has tied a great many.', 'day', 5,
        'text', public.fire_read_back_line(p_party, 1, 5, 'On Day 5 you called it', 'The fire called it on Day 5', 'B')),
      jsonb_build_object('anchor', 'None of them is yours.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 1, 6, 'Your case, after Week 1', 'The fire''s case, after Week 1', 'B'))
    );
  elsif p_week = 2 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'have done this many times before.', 'day', 4,
        'text', public.fire_read_back_line(p_party, 2, 4, 'On Day 4 you called it', 'The fire called it on Day 4', 'B')),
      jsonb_build_object('anchor', 'Whatever sat here left recently, not centuries ago.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 2, 6, 'Last night you called it', 'The fire called it on Day 6', 'A')),
      jsonb_build_object('anchor', 'scraped it from its stones', 'day', 5,
        'text', public.fire_read_back_line(p_party, 2, 5, 'On Day 5 you called it', 'The fire called it on Day 5', 'A')),
      jsonb_build_object('anchor', 'Beside each place, a date', 'day', 2,
        'text', public.fire_read_back_line(p_party, 2, 2, 'On Day 2 you called it', 'The fire called it on Day 2', 'A')),
      jsonb_build_object('anchor', 'Every one of you.', 'day', 3,
        'text', public.fire_read_back_line(p_party, 2, 3, 'On Day 3 you called it', 'The fire called it on Day 3', 'B'))
    );
  elsif p_week = 3 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'They are waiting for you.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 3, 6, 'Last night you called it', 'The fire called it on Day 6', 'A')),
      jsonb_build_object('anchor', 'puts the eight from the ridges into her other hand', 'day', 4,
        'text', public.fire_read_back_line(p_party, 3, 4, 'On Day 4 you called it', 'The fire called it on Day 4', 'A')),
      jsonb_build_object('anchor', 'every sealed thing of theirs has opened for you', 'day', 3,
        'text', public.fire_read_back_line(p_party, 3, 3, 'On Day 3 you called it', 'The fire called it on Day 3', 'A')),
      jsonb_build_object('anchor', 'Therefore the faithful shall not lie.', 'day', 2,
        'text', public.fire_read_back_line(p_party, 3, 2, 'On Day 2 you called it', 'The fire called it on Day 2', 'A')),
      jsonb_build_object('anchor', 'Until the throne rise whole.', 'day', 5,
        'text', public.fire_read_back_line(p_party, 3, 5, 'On Day 5 you called it', 'The fire called it on Day 5', 'B'))
    );
  elsif p_week = 4 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'Those still on their feet do not stand, as they stood under the Kiln.', 'day', 1,
        'text', public.fire_read_back_line(p_party, 4, 1, 'On Day 1 you called it', 'The fire called it on Day 1', 'B')),
      jsonb_build_object('anchor', 'We have waited for those who can open them.', 'day', 3,
        'text', public.fire_read_back_line(p_party, 4, 3, 'On Day 3 you called it', 'The fire called it on Day 3', 'B')),
      jsonb_build_object('anchor', 'four armed riders, and one closed box between them', 'day', 2,
        'text', public.fire_read_back_line(p_party, 4, 2, 'On Day 2 you called it', 'The fire called it on Day 2', 'A')),
      jsonb_build_object('anchor', 'Where the Seekers'' children walk, the faithful follow.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 4, 6, 'Last night you called it', 'The fire called it on Day 6', 'A')),
      jsonb_build_object('anchor', 'The fifth heeds no element at all', 'day', 4,
        'text', public.fire_read_back_line(p_party, 4, 4, 'On Day 4 you called it', 'The fire called it on Day 4', 'B'))
    );
  elsif p_week = 5 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'They kept it near him, under their own eyes.', 'day', 1,
        'text', public.fire_read_back_line(p_party, 5, 1, 'On Day 1 you called it', 'The fire called it on Day 1', 'A')),
      jsonb_build_object('anchor', 'Tonight they were moving.', 'day', 4,
        'text', public.fire_read_back_line(p_party, 5, 4, 'On Day 4 you called it', 'The fire called it on Day 4', 'B')),
      jsonb_build_object('anchor', 'your blood runs off it like rain off glass.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 5, 6, 'Last night you called it', 'The fire called it on Day 6', 'B')),
      jsonb_build_object('anchor', 'The sleep is thinnest when the moon goes dark.', 'day', 5,
        'text', public.fire_read_back_line(p_party, 5, 5, 'On Day 5 you called it', 'The fire called it on Day 5', 'A'))
    );
  elsif p_week = 6 then
    v_out := jsonb_build_array(
      jsonb_build_object('anchor', 'At its edge, a sliver of it has already gone dark, and the dark is spreading.', 'day', 5,
        'text', public.fire_read_back_line(p_party, 6, 5, 'On Day 5 you called it', 'The fire called it on Day 5', 'A')),
      jsonb_build_object('anchor', 'his soldiers from the last war, still standing their watch after all these centuries.', 'day', 2,
        'text', public.fire_read_back_line(p_party, 6, 2, 'On Day 2 you called it', 'The fire called it on Day 2', 'A')),
      jsonb_build_object('anchor', 'Around him, set in a ring, faintly glowing, are the four Stones.', 'day', 3,
        'text', public.fire_read_back_line(p_party, 6, 3, 'On Day 3 you called it', 'The fire called it on Day 3', 'A')),
      jsonb_build_object('anchor', 'What the four begin, the fifth shall end', 'day', 2,
        'text', public.fire_read_back_line(p_party, 5, 2, 'In Week 5 you called it', 'The fire''s call in Week 5', 'A')),
      jsonb_build_object('anchor', 'Same key. Turned the other way.', 'day', 6,
        'text', public.fire_read_back_line(p_party, 6, 6, 'Last night you called it', 'The fire called it on Day 6', 'B'))
    );
  end if;
  return v_out;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fire_read_back_line(p_party uuid, p_week integer, p_day integer, p_solo_prefix text, p_party_prefix text, p_default text DEFAULT 'A'::text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_call jsonb := public.fire_call(p_party, p_week, p_day);
  v_data jsonb := public.campfire_data(p_party, p_week, p_day);
  v_members int;
  v_my_reading text;
  v_fork text;
  v_names_a text;
  v_names_b text;
begin
  select count(*) into v_members from public.party_members where party_id = p_party;
  if v_members <= 1 or (p_week = 1 and p_day = 1) then
    select reading into v_my_reading from public.fire_pins
    where party_id = p_party and user_id = auth.uid() and week = p_week and day = p_day;
    v_fork := case coalesce(v_my_reading, p_default)
      when 'A' then v_data ->> 'forkA'
      else v_data ->> 'forkB'
    end;
    return p_solo_prefix || ': ' || coalesce(v_fork, '');
  end if;

  if v_call ->> 'reading' = 'A' then
    return p_party_prefix || ': ' || coalesce(v_data ->> 'forkA', '');
  elsif v_call ->> 'reading' = 'B' then
    return p_party_prefix || ': ' || coalesce(v_data ->> 'forkB', '');
  elsif coalesce((v_call ->> 'split')::boolean, false) then
    select string_agg(x, ', ') into v_names_a from jsonb_array_elements_text(coalesce(v_call -> 'backers' -> 'A', '[]'::jsonb)) x;
    select string_agg(x, ', ') into v_names_b from jsonb_array_elements_text(coalesce(v_call -> 'backers' -> 'B', '[]'::jsonb)) x;
    if v_names_a is not null and v_names_b is not null then
      return 'The fire was split on Day ' || p_day || ': ' || v_names_a || ' backed “' || coalesce(v_data ->> 'forkA', '') || '”; ' || v_names_b || ' backed “' || coalesce(v_data ->> 'forkB', '') || '”.';
    end if;
    return 'The fire was split on Day ' || p_day || '.';
  else
    v_fork := case p_default when 'A' then v_data ->> 'forkA' else v_data ->> 'forkB' end;
    return p_party_prefix || ': ' || coalesce(v_fork, '');
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.campfire(p_party uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_week int; v_day int; v_data jsonb; v_me uuid := auth.uid(); v_fan public.fan_outs; v_frag public.fragments;
        v_series text; v_season int; v_start timestamptz; v_narrated boolean; v_mine_pin public.fire_pins;
        v_members jsonb; v_riddle jsonb; v_tries public.fire_riddle_tries; v_solved public.fire_riddles; v_show_answer boolean;
        v_notice jsonb := '[]'::jsonb; v_named uuid[] := '{}'; v_cand record; v_nudge text; v_attr text; v_best text;
        v_at_fire int; v_words int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_fire_day(p_party);
  v_data := public.campfire_data(p_party, v_week, v_day);
  v_narrated := coalesce((v_data ->> 'narrated')::boolean, false);
  select * into v_fan from public.fan_outs where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select * into v_frag from public.fragments where series_id = v_series and season_number = v_season and id = v_week || '-' || v_day;
  v_start := public.party_day_start(p_party, v_week, v_day);

  -- Not chosen yet: the last light only (the leads, without their clues).
  if v_fan.user_id is null then
    return jsonb_build_object('week', v_week, 'day', v_day, 'place', v_data -> 'place', 'narrated', v_narrated,
      'chosen', false,
      'leads', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place', 'actions', l -> 'actions'))
                from jsonb_array_elements(v_data -> 'leads') l),
      'progress', (select jsonb_build_object('attrs', attrs) from public.member_progress where party_id = p_party and user_id = v_me),
      'dc', (public.today_meta(p_party, v_week, v_day) ->> 'dc')::int);
  end if;

  insert into public.fire_visits (party_id, user_id, week, day) values (p_party, v_me, v_week, v_day)
  on conflict (party_id, user_id, week, day) do update set last_at = now();
  select * into v_mine_pin from public.fire_pins where party_id = p_party and user_id = v_me and week = v_week and day = v_day;

  -- The party, in party-list order, with what each did today.
  select jsonb_agg(jsonb_build_object(
      'id', m.user_id, 'name', m.character_name, 'me', m.user_id = v_me,
      'visitedAt', v.first_at, 'here', v.last_at > now() - interval '3 minutes',
      'finished', md.finished_at is not null,
      'passed', coalesce((md.challenge ->> 'pass')::boolean, false),
      'scraped', coalesce((md.fight ->> 'done')::boolean, false) and not coalesce((md.fight ->> 'won')::boolean, false),
      'lead', f.lead_id,
      'gaveTo', (select string_agg(coalesce(tm.character_name, 'a friend'), ', ') from public.relic_gifts g
                 left join public.party_members tm on tm.party_id = p_party and tm.user_id = g.to_user
                 where g.party_id = p_party and g.from_user = m.user_id and g.given_at >= v_start),
      'words', (select count(*) from public.fragment_words w where w.party_id = p_party and w.fragment_id = v_week || '-' || v_day
                and w.solved_by = m.user_id),
      'missedYesterday', v_day > 1 and md.finished_at is not null and not exists (
                 select 1 from public.member_days y where y.party_id = p_party and y.user_id = m.user_id
                 and y.week = v_week and y.day = v_day - 1 and y.finished_at is not null)
    ) order by (m.user_id = p.host_id) desc, m.session_zero_done_at nulls last, m.joined_at) into v_members
  from public.party_members m
  join public.parties p on p.id = m.party_id
  left join public.fire_visits v on v.party_id = m.party_id and v.user_id = m.user_id and v.week = v_week and v.day = v_day
  left join public.member_days md on md.party_id = m.party_id and md.user_id = m.user_id and md.week = v_week and md.day = v_day
  left join public.fan_outs f on f.party_id = m.party_id and f.user_id = m.user_id and f.week = v_week and f.day = v_day
  where m.party_id = p_party and m.status = 'approved' and m.session_zero_done_at is not null;

  -- He notices people (v2.3 §C): at most two true lines, two different friends, in this order.
  if not v_narrated then
    for v_cand in
      select 'bruisedScrape' k, (x ->> 'id')::uuid id, x ->> 'name' n, 1 o from jsonb_array_elements(v_members) x where (x ->> 'scraped')::boolean
      union all
      select 'solvedFragmentFirst', w.solved_by, m.character_name, 2 from (
        select solved_by from public.fragment_words where party_id = p_party and fragment_id = v_week || '-' || v_day and solved_by is not null
        order by solved_at limit 1) w join public.party_members m on m.party_id = p_party and m.user_id = w.solved_by
      union all
      select 'lentRelic', (x ->> 'id')::uuid, x ->> 'name', 3 from jsonb_array_elements(v_members) x where x ->> 'gaveTo' is not null
      union all
      select 'backAfterMissedDay', (x ->> 'id')::uuid, x ->> 'name', 4 from jsonb_array_elements(v_members) x where (x ->> 'missedYesterday')::boolean
      union all
      select 'notYetArrived', (x ->> 'id')::uuid, x ->> 'name', 5 from jsonb_array_elements(v_members) x where x ->> 'visitedAt' is null
      order by 4
    loop
      exit when jsonb_array_length(v_notice) >= 2;
      if not v_cand.id = any (v_named) then
        v_notice := v_notice || jsonb_build_object('kind', v_cand.k, 'name', v_cand.n);
        v_named := v_named || v_cand.id;
      end if;
    end loop;
  end if;

  -- The nudge (v2.3 §M): the friend at the fire tonight with the highest of the named Attribute; alone, no name.
  v_attr := substring(v_data ->> 'nudge' from '\{friend:([A-Za-z]+)\}');
  select count(*) into v_at_fire from public.fire_visits where party_id = p_party and week = v_week and day = v_day;
  if v_attr is not null then
    if v_at_fire <= 1 or v_narrated then
      v_nudge := regexp_replace(v_data ->> 'nudge', '\{friend:[A-Za-z]+\},?\s*', '');
      v_nudge := upper(left(v_nudge, 1)) || substr(v_nudge, 2);
    else
      select m.character_name into v_best from public.fire_visits v
      join public.member_progress mp on mp.party_id = v.party_id and mp.user_id = v.user_id
      join public.party_members m on m.party_id = v.party_id and m.user_id = v.user_id
      where v.party_id = p_party and v.week = v_week and v.day = v_day
      order by (mp.attrs ->> v_attr)::int desc, v.first_at limit 1;
      v_nudge := regexp_replace(v_data ->> 'nudge', '\{friend:[A-Za-z]+\}', coalesce(v_best, 'someone'), 'g');
    end if;
  end if;

  -- The riddle: the answer and Garrick's reply only once it is solved, or the caller is out of tries or gave up.
  if v_data -> 'riddle' <> 'null'::jsonb then
    select * into v_solved from public.fire_riddles where party_id = p_party and week = v_week and day = v_day;
    select * into v_tries from public.fire_riddle_tries where party_id = p_party and user_id = v_me and week = v_week and day = v_day;
    v_show_answer := v_solved.party_id is not null or coalesce(v_tries.gave_up, false)
                     or coalesce(v_tries.wrong, 0) >= (v_data -> 'riddle' ->> 'maxTries')::int;
    v_riddle := jsonb_build_object('q', v_data -> 'riddle' -> 'q', 'maxTries', v_data -> 'riddle' -> 'maxTries',
      'wrong', coalesce(v_tries.wrong, 0), 'gaveUp', coalesce(v_tries.gave_up, false),
      'solvedBy', (select character_name from public.party_members where party_id = p_party and user_id = v_solved.solved_by),
      'solved', v_solved.party_id is not null,
      'answer', case when v_show_answer then v_data -> 'riddle' -> 'a' end,
      'quip', case when v_show_answer then v_data -> 'riddle' -> 'quip' end);
  end if;

  select count(*) into v_words from public.fragment_words where party_id = p_party and fragment_id = v_week || '-' || v_day;

  select jsonb_build_object(
    'week', v_week, 'day', v_day, 'chosen', true,
    'place', v_data -> 'place', 'narrated', v_narrated, 'tone', v_data -> 'tone', 'cupNight', v_data -> 'cupNight',
    'opener', v_data -> 'opener', 'forkA', v_data -> 'forkA', 'forkB', v_data -> 'forkB', 'questionTitle', v_data -> 'questionTitle', 'callback', v_data -> 'callback',
    'nudge', v_nudge, 'riddle', v_riddle, 'pull', v_data -> 'pull',
    'members', v_members,
    'firstHere', not exists (select 1 from public.fire_visits where party_id = p_party and week = v_week and day = v_day
                             and user_id <> v_me and first_at < (select first_at from public.fire_visits where party_id = p_party
                             and user_id = v_me and week = v_week and day = v_day)),
    'myFanOut', jsonb_build_object('lead', v_fan.lead_id, 'roll', v_fan.roll, 'hint', v_fan.hint, 'glimpse', v_fan.roll ->> 'glimpse',
      'letter', case v_fan.hint when 1 then upper(left(v_frag.word1, 1)) when 2 then upper(left(v_frag.word2, 1)) end,
      'lateLine', (select l -> 'lateLine' from jsonb_array_elements(v_data -> 'leads') l where l ->> 'id' = v_fan.lead_id)),
    -- The board: one card per lead with every finder's name; a lead nobody took shows only its place.
    'board', (select jsonb_agg(jsonb_build_object('id', l -> 'id', 'place', l -> 'place',
                'finders', (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                            join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                            where f.party_id = p_party and f.week = v_week and f.day = v_day and f.lead_id = l ->> 'id'
                              and (not v_narrated or f.user_id = v_me)),
                -- C4: friends whose pass at the last light also showed them this lead.
                'glimpsedBy', (select coalesce(jsonb_agg(m.character_name order by f.at), '[]'::jsonb) from public.fan_outs f
                            join public.party_members m on m.party_id = f.party_id and m.user_id = f.user_id
                            where f.party_id = p_party and f.week = v_week and f.day = v_day and f.roll ->> 'glimpse' = l ->> 'id'
                              and (not v_narrated or f.user_id = v_me)),
                'clueTitle', l -> 'clueTitle', 'clueText', l -> 'clueText'))
              from jsonb_array_elements(v_data -> 'leads') l),
    -- Tonight's question: names under each reading, never a count or a winner; others' pins only after your own (§D).
    'myPin', case when v_mine_pin.user_id is not null then jsonb_build_object('reading', v_mine_pin.reading, 'line', v_mine_pin.line) end,
    'pins', (select coalesce(jsonb_agg(jsonb_build_object('name', m.character_name, 'reading', fp.reading, 'line', fp.line) order by fp.at desc), '[]'::jsonb)
             from public.fire_pins fp join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
             where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and fp.user_id <> v_me
               and v_mine_pin.user_id is not null and not v_narrated),
    -- The catch-up line on arrival (v2.3 §M): at most two earlier friends, newest first.
    'catchUp', (select coalesce(jsonb_agg(jsonb_build_object('name', x.n, 'reading', x.reading)), '[]'::jsonb) from (
                 select m.character_name n, fp.reading from public.fire_pins fp
                 join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
                 where fp.party_id = p_party and fp.week = v_week and fp.day = v_day and fp.user_id <> v_me and not v_narrated
                 order by fp.at desc limit 2) x),
    'pinCount', (select count(*) from public.fire_pins where party_id = p_party and week = v_week and day = v_day and user_id <> v_me),
    -- Day 6: two pins from the week, read by name (v2.3 §E).
    'weekPins', case when v_day = 6 then (select coalesce(jsonb_agg(jsonb_build_object('name', x.n, 'day', x.day, 'reading', x.reading, 'week', v_week)), '[]'::jsonb) from (
                 select m.character_name n, fp.day, fp.reading from public.fire_pins fp
                 join public.party_members m on m.party_id = fp.party_id and m.user_id = fp.user_id
                 where fp.party_id = p_party and fp.week = v_week and fp.day < 6 order by fp.at desc limit 2) x) end,
    'weekForks', case when v_day = 6 then (select jsonb_object_agg(c.day, jsonb_build_object('A', c.data -> 'forkA', 'B', c.data -> 'forkB'))
                 from public.campfire_days c where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day < 6) end,
    'notes', (select coalesce(jsonb_agg(jsonb_build_object('kind', n.kind, 'name', m.character_name, 'body', n.body, 'mine', n.user_id = v_me, 'day', n.day)
                order by n.at desc), '[]'::jsonb)
              from public.fire_notes n join public.party_members m on m.party_id = n.party_id and m.user_id = n.user_id
              where n.party_id = p_party and n.week = v_week and (not v_narrated or n.user_id = v_me)
                and (n.day = v_day or (n.kind = 'week' and n.day = (select max(n2.day) from public.fire_notes n2 where n2.party_id = p_party
                     and n2.user_id = n.user_id and n2.week = v_week and n2.kind = 'week')))),
    'fragment', jsonb_build_object('words', v_words,
      'text', case when v_words >= 2 then replace(replace(v_frag.template, '{0}', v_frag.word1), '{1}', v_frag.word2) end,
      'solvers', (select coalesce(jsonb_agg(m.character_name order by w.solved_at), '[]'::jsonb) from public.fragment_words w
                  join public.party_members m on m.party_id = w.party_id and m.user_id = w.solved_by
                  where w.party_id = p_party and w.fragment_id = v_week || '-' || v_day),
      'hintOpen', v_fan.hint is not null and not exists (select 1 from public.fragment_words where party_id = p_party
                  and fragment_id = v_week || '-' || v_day and slot = v_fan.hint)),
    'meaningQuestion', v_data -> 'meaningQuestion', 'weekQuestion', v_data -> 'weekQuestion',
    'noticings', v_notice,
    'atFire', v_at_fire
  ) into r;
  return r;
end;
$function$;

CREATE OR REPLACE FUNCTION public.casebook(p_party uuid, p_week integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_week int; v_day int; v_last int; v_out jsonb := '[]'::jsonb; d int; v_data jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if p_week = 0 then p_week := v_week; end if;
  if p_week < 1 or p_week > v_week then raise exception 'not yet'; end if;
  v_last := case when p_week < v_week then 6 else least(v_day, 6) end;
  if p_week = v_week and not exists (select 1 from public.member_days where party_id = p_party and user_id = auth.uid()
                                     and week = v_week and day = v_day and finished_at is not null) then
    v_last := least(v_day - 1, 6);
  end if;
  for d in 1 .. v_last loop
    v_data := public.campfire_data(p_party, p_week, d);
    continue when v_data is null or coalesce((v_data ->> 'narrated')::boolean, false);
    v_out := v_out || jsonb_build_object(
      'day', d,
      'place', v_data ->> 'place',
      'forkA', v_data ->> 'forkA',
      'forkB', v_data ->> 'forkB',
      'pieces', (select coalesce(jsonb_agg(jsonb_build_object('title', p ->> 'title',
                   'names', (select jsonb_agg(b ->> 'name') from jsonb_array_elements(p -> 'by') b))), '[]'::jsonb)
                 from jsonb_array_elements(public.fire_pieces(p_party, p_week, d)) p),
      'clicks', (select coalesce(jsonb_agg(jsonb_build_object('text', (v_data -> 'clicks' -> (k.idx - 1)) ->> 'text', 'names', to_jsonb(k.names)) order by k.at), '[]'::jsonb)
                 from public.fire_clicks k where k.party_id = p_party and k.week = p_week and k.day = d),
      'puzzle', v_data -> 'puzzle',
      'call', public.fire_call(p_party, p_week, d),
      'unsolvedClick', case when v_data -> 'puzzle' is not null and (p_week < v_week or d < v_day) and not exists (
         select 1 from public.fire_clicks fc where fc.party_id = p_party and fc.week = p_week and fc.day = d
       ) then (select c ->> 'text' from jsonb_array_elements(v_data -> 'clicks') c where coalesce((c ->> 'solves')::boolean, false) limit 1) end
    );
  end loop;
  return jsonb_build_object('week', p_week, 'currentWeek', v_week, 'weekQuestion', (public.campfire_data(p_party, p_week, 1) ->> 'weekQuestion'), 'nights', v_out);
end;
$function$;

create or replace function public.fire_fork_pieces_for(p_party uuid, p_user uuid, p_week int, p_day int) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('kind', f.key, 'title', f.title, 'text', f.body) order by f.key), '[]'::jsonb)
  from public.fire_fork_pieces_for(p_party, p_week, p_day) f
  where f.user_id = p_user;
$$;
revoke execute on function public.fire_fork_pieces_for(uuid, uuid, int, int) from public, anon, authenticated;

revoke execute on function public.roll_challenge(uuid, text) from public, anon, authenticated;
revoke execute on function public.roll_press(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.party_read_backs(uuid, int, int) from public, anon, authenticated;
revoke execute on function public.gathering_read_backs(uuid, int) from public, anon, authenticated;
revoke execute on function public.fire_read_back_line(uuid, int, int, text, text, text) from public, anon, authenticated;
