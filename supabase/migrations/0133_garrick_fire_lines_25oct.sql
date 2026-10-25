-- 0133 (25 Oct 2026, the plan after the audits, Phase 2; Fake Guru: "use your best judgement and decide"): three of
-- Garrick's stored lines at the fire. W2D5's callback named game days ("On Day 2 … on Day 3"); W3D3's and W4D2's
-- openers were flat. Only these strings change; the rest of each night's data is left as it is live.
update public.campfire_days set data = replace(data::text,
  'On Day 2 a horn button, on Day 3 a dead stranger. Tonight, a circle.',
  'At the mill a horn button, on the river path a dead stranger. Tonight, a circle.')::jsonb
where series_id = 'dark-moon' and week = 2 and day = 5 and data::text like '%On Day 2 a horn button%';
update public.campfire_days set data = replace(data::text,
  'Mind your hands on that glass, all of you.',
  'Sit, before that glass has the rest of your boots, and mind your hands on it.')::jsonb
where series_id = 'dark-moon' and week = 3 and day = 3 and data::text like '%Mind your hands on that glass%';
update public.campfire_days set data = replace(data::text,
  'Cold road. Put your hands round that cup.',
  'Cold road. Hands round that cup first, and get the warmth back into them. The rest will keep.')::jsonb
where series_id = 'dark-moon' and week = 4 and day = 2 and data::text like '%Cold road. Put your hands%';
