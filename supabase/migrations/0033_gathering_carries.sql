-- What a Gathering carries into the weekdays (Core Rules §11 "One result carries into a weekday"; the episode files):
-- a lost United Effort at Gathering 3 changes Week 4 Day 1's lines (Wren is carried, cut), and at Gathering 5 makes
-- Week 6 Day 1's Challenge two harder. today() now hands out the party's claims; roll_card() applies harderIf.
-- Same shapes as before (0021, 0022), replaced in place.

create or replace function public.today(p_party uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_series text; v_season int; r jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  update public.member_days set opened_at = coalesce(opened_at, now())
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  select series_id, season_number into v_series, v_season from public.parties where id = p_party;
  select jsonb_build_object(
    'week', v_week, 'day', v_day,
    'chapter', (select jsonb_build_object('script', c.script, 'meta', c.meta) from public.chapters c
                where c.series_id = v_series and c.season_number = v_season and c.week = v_week and c.day = v_day),
    'progress', (select to_jsonb(mp) - 'party_id' - 'user_id' from public.member_progress mp where mp.party_id = p_party and mp.user_id = auth.uid()),
    'mine', (select to_jsonb(md) - 'party_id' - 'user_id' from public.member_days md
             where md.party_id = p_party and md.user_id = auth.uid() and md.week = v_week and md.day = v_day),
    'claims', public.party_claims(p_party),
    'daysPlayed', (select count(*) from public.member_days md where md.party_id = p_party and md.user_id = auth.uid() and md.finished_at is not null)
  ) into r;
  return r;
end;
$$;

create or replace function public.roll_card(p_party uuid, p_attr text, p_relic boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_week int; v_day int; v_step jsonb; v_meta jsonb; v_dc int; v_score int; v_bonus int; v_relic int := 0; v_d20 int; v_net int;
        v_pass boolean; v_growth int := 0; v_played int; v_base int; v_result jsonb;
begin
  select o_week, o_day into v_week, v_day from public.my_today_row(p_party);
  if (select challenge from public.member_days where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day) is not null then
    raise exception 'already rolled';
  end if;
  v_step := public.today_step(p_party, v_week, v_day, 'challenge');
  if v_step is null or not exists (select 1 from jsonb_array_elements(v_step -> 'options') o where o ->> 'attr' = p_attr) then
    raise exception 'not today''s Challenge';
  end if;
  if public.day_open_step(p_party, auth.uid(), v_week, v_day) <> 'card' then raise exception 'not yet'; end if;
  if p_relic then
    perform public.spend_relic(p_party, p_attr);
    v_relic := 4;
  end if;
  v_meta := public.today_meta(p_party, v_week, v_day);
  -- A Gathering's result can make a weekday's Challenge harder (Week 6 Day 1: two harder after a lost roll-call).
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
    set gold = gold + 500, attrs = jsonb_set(attrs, array[p_attr], to_jsonb(v_score + v_growth))
    where party_id = p_party and user_id = auth.uid();
  else
    update public.member_progress set gold = greatest(0, gold - 150) where party_id = p_party and user_id = auth.uid();
  end if;
  v_result := jsonb_build_object('attr', p_attr, 'score', v_score, 'bonus', v_bonus, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc,
                                 'net', v_net, 'pass', v_pass, 'growth', v_growth);
  update public.member_days set challenge = v_result, aside = false
  where party_id = p_party and user_id = auth.uid() and week = v_week and day = v_day;
  return v_result;
end;
$$;
