-- Results that carry (Fake Guru, 17 Oct: "you decide the rest"; group C of docs/design/group-c-proposal-17oct.md):
-- * C1: in Week 6 a friend's own failed Challenge makes a later card one harder: Day 2 -> Day 3, Day 3 -> Day 5,
--   Day 5 -> Day 6 (Day 4 has no card). Each card says why in one line.
-- * C2: a lost United Effort at Gathering 1, 2 or 4 makes the next week's first card two harder (Week 2 Day 1,
--   Week 3 Day 2 since Week 3 Day 1 has no card, Week 5 Day 1), as Gatherings 3 and 5 already did.
-- * C6: Week 6 Day 6's card no longer says "The hardest yet." (its DC is the same as the days before it).
-- party_claims now also lists the caller's own failed Challenges ("6-2:challenge-failed", the demo's own key); a day
-- that closed by itself with the card never rolled is not a failure here. The cards are the episode files' text,
-- through scripts/gen-chapter-scripts.cjs; the chapters below match scripts/gen-chapters-sql.ts.
create or replace function public.party_claims(p_party uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(k), '[]'::jsonb) from (
    select 'G' || week || ':united-effort-lost' k from public.gatherings
    where party_id = p_party and state -> 'ue' ->> 'outcome' = 'lost'
    union all
    select week || '-' || day || ':challenge-failed' from public.member_days
    where party_id = p_party and user_id = auth.uid() and challenge is not null
      and not coalesce((challenge ->> 'pass')::boolean, false) and not coalesce((challenge ->> 'expired')::boolean, false)
  ) x;
$$;

update public.chapters set script = jsonb_set(script, '{steps,12}', $json${"t":"challenge","title":"THE MAN WITH THE AXE","desc":"He saw something on this road, and he has decided not to have seen it.","options":[{"attr":"Charm","verb":"get him talking"},{"attr":"Aim","verb":"watch where his eyes keep going, and look there first"}],"reward":"+500g","fail":"he tells you to be on your way, and means it","harderIf":{"key":"G1:united-effort-lost","has":true,"by":2,"line":"**Two harder.** You come down the road still grey with the mine's dust, and you look like the kind of trouble he wants no part of."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 2 and day = 1 and script -> 'steps' -> 12 ->> 't' = 'challenge';
update public.chapters set script = jsonb_set(script, '{steps,2}', $json${"t":"challenge","title":"THE LAST DOOR","desc":"She is on the other side of it, and she has not walked away.","options":[{"attr":"Charm","verb":"talk to her through the door until she opens it"},{"attr":"Intellect","verb":"know what will open it: the ledger's page, and her daughter's name in a stranger's hand"}],"reward":"+500g","fail":"the door stays shut, and you lose the day's light waiting","harderIf":{"key":"G2:united-effort-lost","has":true,"by":2,"line":"**Two harder.** Word of what happened under the hill has come over the hills ahead of you, and nobody in Ashcombe is quick to open a door."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 3 and day = 2 and script -> 'steps' -> 2 ->> 't' = 'challenge';
update public.chapters set script = jsonb_set(script, '{steps,6}', $json${"t":"challenge","title":"THE WAYSTONE","desc":"It said something once.","options":[{"attr":"Craft","verb":"charcoal and a sheet from Meira's notebook: take a rubbing, like the one you found on the forest road"},{"attr":"Intellect","verb":"read the old hand by the shapes it left, with the light held low across the stone"}],"reward":"+500g","fail":"the stone keeps its word","harderIf":{"key":"G4:united-effort-lost","has":true,"by":2,"line":"**Two harder.** Your hands still ache from the water-gate's pin, and the cold off the lake gets into them."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 5 and day = 1 and script -> 'steps' -> 6 ->> 't' = 'challenge';
update public.chapters set script = jsonb_set(script, '{steps,7}', $json${"t":"challenge","title":"THE SQUARE","desc":"Sixty paces to the hall's wall, past the fire.","options":[{"attr":"Agility","verb":"the fountain's shadow, then the open ground, fast"},{"attr":"Charm","verb":"keep everyone calm and still while the lantern goes by"}],"reward":"+500g","fail":"the lantern swings your way, and you lose an hour flat against the stone","harderIf":{"key":"6-2:challenge-failed","has":true,"by":1,"line":"**One harder.** The roof that came down yesterday was heard across the city, and tonight the square's watch is doubled."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 6 and day = 3 and script -> 'steps' -> 7 ->> 't' = 'challenge';
update public.chapters set script = jsonb_set(script, '{steps,4}', $json${"t":"challenge","title":"THE SKY-WATCHERS' WALL","desc":"Thousands of moons. One of them is not like the others.","options":[{"attr":"Craft","verb":"find it by the cut of the chisel"},{"attr":"Might","verb":"climb the watchers' ledges to the highest rows, and read them from there"}],"reward":"+500g","fail":"hours of faded marks by lamplight, in a tower the whole city can see","harderIf":{"key":"6-3:challenge-failed","has":true,"by":1,"line":"**One harder.** The two men the watchman called up have not gone back to their beds. They walk the streets below the tower now."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 6 and day = 5 and script -> 'steps' -> 4 ->> 't' = 'challenge';
update public.chapters set script = jsonb_set(script, '{steps,2}', $json${"t":"challenge","title":"THE STREET","desc":"There is no way round. There is only across.","options":[{"attr":"Agility","verb":"through a gap in the ranks, at their pace"},{"attr":"Might","verb":"go in where the ranks are thinnest, and take the knocks"}],"reward":"+500g · **and you strike first**","fail":"one of them sees you, and **it strikes first**","harderIf":{"key":"6-5:challenge-failed","has":true,"by":1,"line":"**One harder.** Someone saw your lamp in the tower last night, and tonight more eyes are on the street."}}$json$::jsonb)
where series_id = 'dark-moon' and season_number = 1 and week = 6 and day = 6 and script -> 'steps' -> 2 ->> 't' = 'challenge';
