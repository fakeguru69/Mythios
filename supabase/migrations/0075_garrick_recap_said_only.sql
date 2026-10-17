-- Garrick's Recap, 17 Oct (Fake Guru, "2 yes", from the outside audits): only lines he really says in the game.
-- scripts/gen-garrick-recap.cjs now leaves out four deception-table rows that nothing in the game lets him say: three
-- Week 1 answers to questions nobody can ask ("You {N} were on her list…", "She wrote them at that table…",
-- "She took her coat…") and Week 6's "I've known what the fifth was since before you found me." This removes the same
-- four entries from the server's copy, keeping the order; the result is identical to scripts/gen-garrick-recap-sql.ts.
update public.garrick_recaps gr
set data = (
  select jsonb_agg(jsonb_set(w, '{entries}', coalesce((
           select jsonb_agg(e order by o) from jsonb_array_elements(w -> 'entries') with ordinality x(e, o)
           where e ->> 'line' not in (
             '*"You {N} were on her list. That means something."*',
             '*"She wrote them at that table, and took them with her when she left."*',
             '*"She took her coat and those pages, and she didn''t come back."*',
             '*"I''ve known what the fifth was since before you found me."*')), '[]'::jsonb)) order by wo)
  from jsonb_array_elements(gr.data) with ordinality y(w, wo))
where series_id = 'dark-moon' and season_number = 1;
