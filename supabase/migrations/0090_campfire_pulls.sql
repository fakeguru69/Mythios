-- The fire's Pull, brought in line with the chapters (17 Oct; found in the Campfire content audit): the fire held a copy
-- loaded before the storybook pass. 11 nights; W1D6 said "by morning" (canon: "by nightfall") and W5D2 "It is nearer"
-- (canon: "The heartbeat is nearer"). scripts/gen-campfire-sql.ts already takes the Pull from chapterScripts.ts.
with v(week, day, pull) as (values
  (1, 1, $t$You sit a while on the stone with the list in one hand and the cold thing in the other. The dark comes down through the trees, and somewhere an owl tries its voice.

A man broke into your box to leave you a list with your name on it.

**One day north: the Hollow Wake Inn. Somebody wants you there.**$t$),
  (1, 3, $t$The morning is getting on, and this is the Widow's Tooth. Garrick has not gone back to his inn. He is standing in the road with his pack on, looking at the smoke.

**The ruts go that way. So did the man. He will be there before you, and every door will be shut when you come.**$t$),
  (1, 4, $t$It is long past noon when Fenmark lets you go, and the light is already thinning over the fen. Behind you, one by one, the shutters close.

**East. Two hours. He has half a day on you, and he is heading for the only other person alive who has seen that knife.**$t$),
  (1, 5, $t$Nobody sleeps much. At first light she walks you to the edge of the camp, and stands on the old charcoal road, grey with frost and ash, and points.

**North. The same man, the same country, the same season. If it comes round like a calendar, the time is now.**$t$),
  (1, 6, $t$**Cross at first light. You will be there by nightfall. Whatever is at the place the map marks, the season for it is now.**$t$),
  (4, 3, $t$Back on the shingle, beside the place her skiff was lying, there are keel-marks that are not hers. Fresh ones, pressed deep into the wet stones, and the lapping of the lake has not yet smoothed them.

Up the lane, the lamp burns on in her window, small and steady in the afternoon.

**Someone has been rowing out to the drowned village by night. Old Reedham, at the shallow end, tomorrow.**$t$),
  (5, 1, $t$You stay that night in Reedham. Up the lane, the lamp burns on in her window.

At dusk the heartbeat comes again, up through the floorboards and into the legs of your chair. It is louder than it was at dawn.

**What is left in a city where nothing grows and nobody goes? The old kingdom's road: two days north.**$t$),
  (5, 2, $t$**The heartbeat is nearer every dusk, and it is coming from inside the city. Highwall, by noon.**$t$),
  (5, 3, $t$You spend the night up on the wall-walk, in the lee of the parapet, with the barred gate beneath you and that one thread of smoke going up into the dark.

**Who bars a dead city from the inside, year after year? Down into the streets, following the wall.**$t$),
  (5, 5, $t$You stay in the rubble until full dark, and keep your watches there by turns, with the Order's fire showing red through the gaps all night.

**Counting down to what? You hold five pieces, and the trail began on the wall. The wall again.**$t$),
  (6, 3, $t$You cross back on the change of the watch, while the two men are looking at each other, and sleep in the wall room with the warmth of that stone still in your palm.

**He is on the other side of this wall. Inside, on the night the moon goes dark, with the fifth: that is the whole plan now. The cracked hill behind the hall.**$t$))
update public.campfire_days c set data = jsonb_set(c.data, '{pull}', to_jsonb(v.pull)) from v
where c.series_id = 'dark-moon' and c.season_number = 1 and c.week = v.week and c.day = v.day;
