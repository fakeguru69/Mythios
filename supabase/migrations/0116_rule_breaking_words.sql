-- 0116 (24 Oct): the rule-breaking words (docs/design/rule-breaking-words-24oct.md), decided by Claude on Fake Guru's
-- "use your judgement and proceed accordingly".
--
-- 1. Data on the server, changed in place (each a plain text swap on the rows that hold it; the rest of each row is left
--    exactly as it is, so the Week 1 text still waiting on Fake Guru is not loaded by this):
--    the fire's "four" lines (2-4), "all season" (3-5), "favorites" (2-3), "realize" (5-1's meaning question), Week 6's
--    fire places "(Six nights)" … "(One night)", and in the chapters "recognized", the two "(… roll on the Challenge)"
--    brackets (1-4) and "(+1 Might Relic)" (1-5).
-- 2. Never Enough: [PRESS ON] passed twice in one week (was three; no week has more than two [PRESS ON] days).
-- 3. The Season Title for most Gatherings attended: "The Steadfast" (was "The Faithful", the Order's name for itself).
-- Functions are changed by swapping the one line in their current text, and the swap is checked.

do $mig$
declare
  r record;
  d text;
  n text;
  swaps text[][] := array[
    ['They have too many guards down there to fear four people.', 'They have too many guards down there to fear a handful of strangers.'],
    ['What matters more to them than four strangers at the lip?', 'What matters more to them than a few strangers at the lip?'],
    ['For the first time all season, they ran.', 'For the first time since this began, they ran.'],
    ['Stone doesn''t have favorites without a reason.', 'Stone doesn''t have favourites without a reason.'],
    ['When did they realize the man', 'When did they realise the man'],
    [' (Six nights)', ', six nights left'],
    [' (Five nights)', ', five nights left'],
    [' (Four nights)', ', four nights left'],
    [' (Three nights)', ', three nights left'],
    [' (Two nights)', ', two nights left'],
    [' (One night)', ', one night left'],
    ['he recognized her paper', 'he recognised her paper'],
    ['The boy at the well recognized the paper', 'The boy at the well recognised the paper'],
    ['You took the back lanes (Agility roll on the Challenge) and found', 'You took the back lanes, so the Challenge asks for Agility, and you found'],
    ['You knocked next door (Charm roll on the Challenge) and saw', 'You knocked next door, so the Challenge asks for Charm, and you saw'],
    ['she trusted you at once (+1 Might Relic).', 'she trusted you at once, and pressed a Might Relic into your hand.']
  ];
  i int;
begin
  for i in 1 .. array_length(swaps, 1) loop
    update public.campfire_days set data = replace(data::text, swaps[i][1], swaps[i][2])::jsonb
    where data::text like '%' || swaps[i][1] || '%';
    update public.chapters set script = replace(script::text, swaps[i][1], swaps[i][2])::jsonb
    where script::text like '%' || swaps[i][1] || '%';
    update public.chapters set meta = replace(meta::text, swaps[i][1], swaps[i][2])::jsonb
    where meta::text like '%' || swaps[i][1] || '%';
  end loop;

  d := pg_get_functiondef('public.compute_member_record(uuid,uuid)'::regprocedure);
  n := replace(replace(d,
    'if v_week_press_max >= 3 then v_badges := v_badges || ''never-enough''::text; end if;',
    'if v_week_press_max >= 2 then v_badges := v_badges || ''never-enough''::text; end if;'),
    '-- Never Enough: three [PRESS ON] passes in one week (no week has more than two [PRESS ON] days; waiting on Fake Guru).',
    '-- Never Enough: [PRESS ON] passed twice in one week (24 Oct: was three, when no week has more than two).');
  if n = d then raise exception 'compute_member_record: text not found'; end if;
  execute n;

  d := pg_get_functiondef('public.party_season_titles(uuid)'::regprocedure);
  n := replace(d, '''Gatherings Attended'', ''The Faithful''', '''Gatherings Attended'', ''The Steadfast''');
  if n = d then raise exception 'party_season_titles: text not found'; end if;
  execute n;
end
$mig$;
