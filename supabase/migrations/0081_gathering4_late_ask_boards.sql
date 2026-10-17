-- Gathering 4 (Fake Guru, 17 Oct, gameplay verdict group B): canon adds Ask questions later in the night ("Added when
-- the pen is found", "Added when the torn page is read"), but they sat on the first board, so a friend could ask
-- "IS SHE DEAD?" before the pen was found. They now make their own boards at the end of "The pen" and "The torn
-- page" (scripts/gen-gathering-scripts.cjs, splitLateAsks), under the same condition as the first board (the
-- United Effort won). The result is identical to scripts/gen-gathering-sql.ts 4.
update public.gathering_scripts
set data = jsonb_set(data, '{steps}',
  (select jsonb_agg(x order by o) from (
     select o, case when o = 31 then jsonb_set(x, '{rows}', (select jsonb_agg(r order by ro) from jsonb_array_elements(x -> 'rows') with ordinality rr(r, ro)
                                                            where coalesce(r ->> 'group', '') not like 'Added when%'))
                    else x end x
     from jsonb_array_elements(data -> 'steps') with ordinality a(x, o)
     union all select 54.5, '{"t":"ask","rows":[{"questions":["WHOSE IS THIS?"],"sealed":false,"note":"","answer":"*\"The scholar''s.\"*","group":"Added when the pen is found"},{"questions":["IS SHE DEAD?"],"sealed":false,"note":"","answer":"*\"Yes.\"*","group":"Added when the pen is found"},{"questions":["DID YOUR PEOPLE KILL HER?"],"sealed":false,"note":"","answer":"*\"Yes.\"* Asked why: silence.","group":"Added when the pen is found"},{"questions":["DID YOU KILL HER?"],"sealed":false,"note":"","answer":"*\"No.\"*","group":"Added when the pen is found"},{"questions":["WHERE DID YOU GET IT?"],"sealed":false,"note":"","answer":"*\"With her pages.\"*","group":"Added when the pen is found"}],"section":"The pen","cond":{"on":"ue","won":true}}'::jsonb
     union all select 62.5, '{"t":"ask","rows":[{"questions":["HOW DOES THE PAGE END?"],"sealed":false,"note":"","answer":"*\"I have never seen it whole.\"*","group":"Added when the torn page is read"},{"questions":["WILL THE FIFTH STOP HIM?"],"sealed":false,"note":"","answer":"Silence.","group":"Added when the torn page is read"},{"questions":["WHO GAVE YOU THIS PAGE?"],"sealed":false,"note":"","answer":"*\"It was given me to carry.\"*","group":"Added when the torn page is read"}],"section":"The torn page","cond":{"on":"ue","won":true}}'::jsonb
   ) z))
where series_id = 'dark-moon' and season_number = 1 and week = 4
  and jsonb_array_length(data -> 'steps' -> 30 -> 'rows') = 13;
