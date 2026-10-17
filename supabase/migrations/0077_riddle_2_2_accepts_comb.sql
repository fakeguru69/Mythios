-- Week 2 Day 2's riddle ("I have teeth but cannot bite") could not be solved: it accepted only "a comb (or a cog)".
-- It now accepts comb, a comb, cog and a cog, and shows the answer as "a comb, or a cog" (no brackets in the game's text).
-- Same riddle as scripts/gen-campfire-sql.ts 2 now writes.
update public.campfire_days
set data = jsonb_set(data, '{riddle}', '{"q":"I have teeth but cannot bite. What am I?","a":"a comb, or a cog","quip":"A mill''s full of them.","accept":["a comb","comb","a cog","cog"],"maxTries":3}'::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 2 and day = 2;
