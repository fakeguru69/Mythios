-- Gathering 5's second Match only if the roll-call was answered (episode 5: "only if the roll-call was answered and the
-- watchman said the Verse himself"). Same result as the regenerated 0038_gathering_week5.sql (applied before this fix).
update public.gathering_scripts set data = jsonb_set(data, '{steps,35,cond}', '{"on": "ue", "won": true}')
where series_id = 'dark-moon' and season_number = 1 and week = 5 and data -> 'steps' -> 35 ->> 'answer' = '5-5';
