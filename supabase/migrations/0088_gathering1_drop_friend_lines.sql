-- Gathering 1: the friend in the drop's own United Effort lines (Fake Guru, 17 Oct: "go with your suggestion"). They take
-- turns since 0085; on their turn the old lines described somebody else hauling them. New lines in
-- mythios-united-effort-stories.md, Part 2, "When Dev takes the turn"; g_ue_roll uses them for bands 1 to 3.
-- Applied live 17 Oct: the data through execute_sql in an equivalent form, the function through apply_migration; both md5-checked.
update public.gathering_scripts set data = jsonb_set(jsonb_set(data, '{ue,selfSuccess}', $p$["{RISK} gets an elbow onto sounder wood, then the other, and comes up a hand's breadth unaided.", "Somewhere down in the dark, {RISK} finds a crossbeam with one boot, and pushes. The boards groan. {RISK} rises with them.", "Inch by inch, {RISK} works a knee up over the timber's edge, and this time keeps it there.", "{RISK} hauls on a beam until the knuckles go white, and the hole gives up another hand's breadth."]$p$::jsonb), '{ue,selfFail}', $p$["{RISK} reaches for a better hold, and the board meant to give it snaps off clean and goes spinning down into the dark.", "{RISK} tries to lever up on one arm, and the arm will not take it. The boards close in again, tighter than before.", "A heave that should have worked costs {RISK} the skin from wrist to elbow, and gains nothing at all."]$p$::jsonb) where series_id = 'dark-moon' and season_number = 1 and week = 1;
create or replace function public.g_ue_roll(p_party uuid, s jsonb, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u jsonb := s -> 'ue'; v_roller uuid := (s -> 'ue' ->> 'next')::uuid; v_attr text := p_data -> 'meta' ->> 'ueAttr';
        v_dc int := (p_data -> 'meta' ->> 'ueDc')::int; v_score int; v_tier int; v_relic int := 0; v_d20 int; v_margin int;
        v_success boolean; v_dmg_roll int; v_dmg int; v_bar text; v_before int; v_after int; v_start int := (u ->> 'start')::int;
        v_band int; v_used int; v_line text; v_between text; v_turn int; v_gone jsonb; v_rollers jsonb := u -> 'rollers'; v_out text; v_self int;
begin
  -- A Relic armed for this roll (the roller's own matching one, or any Attribute Relic a friend gives): +4, spent now.
  if u -> 'relic' is not null and u -> 'relic' <> 'null'::jsonb then
    if public.g_spend(p_party, (u -> 'relic' ->> 'from')::uuid, u -> 'relic' ->> 'kind') then v_relic := 4; end if;
  end if;
  perform public.ensure_progress(p_party, v_roller);
  v_score := public.g_score(p_party, v_roller, v_attr);
  v_tier := public.tier_bonus(v_score);
  v_d20 := public.d20();
  v_margin := v_d20 + v_tier + v_relic - v_dc;
  v_success := v_margin >= 1;
  v_dmg_roll := public.d20();
  v_dmg := 10 + v_dmg_roll;
  v_bar := case when v_success then 'way' else 'risk' end;
  v_before := (u ->> v_bar)::int;
  v_after := greatest(0, v_before - v_dmg);
  v_band := case when v_after <= 0 then 0 when v_after <= v_start / 3.0 then 1 when v_after <= v_start * 2 / 3.0 then 2 else 3 end;
  select count(*) into v_used from jsonb_array_elements(u -> 'rolls') x
  where (x ->> 'success')::boolean = v_success and (x ->> 'band')::int = v_band;
  v_line := p_data -> 'ue' -> (case when v_success then 'success' else 'fail' end) -> v_band::text ->> v_used;
  -- Gathering 1: on the turn of the friend in the drop (they now roll too, 0085), their own lines for bands 1 to 3, in
  -- order and never twice; the lines above would describe somebody else hauling them.
  if v_band > 0 and p_data -> 'ue' ? 'selfSuccess' and v_roller::text = s ->> 'risk' then
    select count(*) into v_self from jsonb_array_elements(u -> 'rolls') x
    where x ->> 'by' = v_roller::text and (x ->> 'success')::boolean = v_success and (x ->> 'band')::int > 0;
    v_line := coalesce(p_data -> 'ue' -> (case when v_success then 'selfSuccess' else 'selfFail' end) ->> v_self, v_line);
  end if;
  v_turn := jsonb_array_length(u -> 'rolls') + 1;
  u := u || jsonb_build_object(v_bar, v_after);
  v_out := case when (u ->> 'way')::int <= 0 then 'won' when (u ->> 'risk')::int <= 0 then 'lost' else 'ongoing' end;
  if v_out = 'ongoing' and v_turn in (2, 4, 6) then v_between := p_data -> 'ue' -> 'between' ->> (v_turn / 2 - 1); end if;
  -- Nobody twice until everyone has gone once.
  v_gone := coalesce(u -> 'gone', '[]'::jsonb);
  if jsonb_array_length(v_gone) >= jsonb_array_length(v_rollers) then v_gone := '[]'::jsonb; end if;
  v_gone := v_gone || to_jsonb(v_roller::text);
  if jsonb_array_length(v_gone) >= jsonb_array_length(v_rollers) then v_gone := '[]'::jsonb; end if;
  u := u || jsonb_build_object('gone', v_gone, 'relic', null, 'outcome', v_out,
    'rolls', (u -> 'rolls') || jsonb_build_object('by', v_roller, 'name', public.g_name(p_party, v_roller), 'attr', v_attr,
      'score', v_score, 'bonus', v_tier, 'relic', v_relic, 'd20', v_d20, 'dc', v_dc, 'margin', v_margin, 'success', v_success,
      'damageRoll', v_dmg_roll, 'damage', v_dmg, 'bar', v_bar, 'before', v_before, 'after', v_after, 'band', v_band,
      'line', public.g_fill(p_party, v_line, s), 'between', public.g_fill(p_party, v_between, s)));
  if v_out = 'ongoing' then
    -- The friend who has just rolled hands on (10 seconds), or MYTHIOS names the next.
    u := u || jsonb_build_object('phase', 'handon', 'by', v_roller);
  else
    u := u || jsonb_build_object('phase', 'done', 'next', null);
  end if;
  return jsonb_set(s, '{ue}', u);
end;
$$;
