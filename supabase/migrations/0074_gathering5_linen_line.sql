-- Gathering 5, "The attempt" (Fake Guru, 17 Oct: "2 yes", from the outside audits): the narration no longer tells the
-- table not to see the linen. "Nobody remarks on it. There's nothing strange about a man having linen to spare." becomes
-- "He works without a word, and ties each knot small and firm." Same text as scripts/gen-gathering-sql.ts 5 now writes.
update public.gathering_scripts
set data = replace(data::text,
  'you''ve seen on every child you''ve saved. Nobody remarks on it. There''s nothing strange about a man having linen to spare.',
  'you''ve seen on every child you''ve saved. He works without a word, and ties each knot small and firm.')::jsonb
where series_id = 'dark-moon' and season_number = 1 and week = 5;
