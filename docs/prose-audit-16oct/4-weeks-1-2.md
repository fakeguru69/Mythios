# Prose audit: Weeks 1 and 2, Days 1 to 6

**Checked:** `docs/canon/episode-1-the-list.md` lines 30 to 716 and `docs/canon/episode-2-the-wind-stone.md` lines 30 to 607. That covers every narration block, fight and Challenge card, pass and fail branch, [PRESS ON], "What you notice" line, Pull and day summary, plus the lines spoken by Meira's notes, the boy, the elder, the charcoal woman, Tamsin, the farmer and the miller's wife. Garrick's own lines were left alone. Day 7 was skipped. That comes to about 190 passages.

**Overall verdict:** this is the strongest writing in the canon. The voice is plain, concrete and confident: short declaratives, sensory detail ("Cold beyond the cold of the river", "A brown tongue of river slides over the mud"), and clues shown rather than named. Most passages should stay exactly as they are. The real problems are few:
- the very first lines of the game are thin;
- Garrick is named on Day 3 without ever being introduced;
- one pass line ("So many at the lamps") reads like a number was left out;
- a continuity slip about fragment "housings";
- a handful of clumsy constructions and repeated tics.

Below are 21 proposals, grouped by day. Everything not listed is fine as it stands.

---

## Week 1 (`episode-1-the-list.md`)

### Day 1. The forest road

**1. The opening, line 38 (the first prose a player ever reads)**
- CURRENT: "The wagon axle snaps on the old forest road, and something is already moving in the treeline."
- PROPOSED: "Late in the day the old forest road narrows, and the trees lean in until the light comes down through them green and thin. The wagon is the only sound for miles.
  Then the axle snaps, and something is already moving in the treeline."
- WHY: this is the game's first impression, and two lines give no sense of place. One sentence of setting fits the later "the light is going" and "the trees have gone from green to black", and adds no facts. (The axle is still said to "snap"; the Aim notice line stays true.)

**2. Challenge pass, line 92**
- CURRENT: "It gives at the first try."
- PROPOSED: "It gives at the first try, and the lid comes up in your hands."
- WHY: it is too thin next to the vivid fail branch. The new clause works for both Might and Craft and leads straight into "You go through the box twice."

### Day 2. The Hollow Wake Inn

**3. The unreadable line, line 200**
- CURRENT: "On the facing leaf, one line will not be read at all. It is in some private shorthand, tight as wire."
- PROPOSED: "On the facing leaf, one line will not give itself up to any of you. It is in some private shorthand, tight as wire."
- WHY: "will not be read" sounds like a refusal or a prophecy. The intended meaning is "nobody can read it".

**4. After Garrick places the rock, line 212**
- CURRENT: "With the place put to it, the rest of the page can be read, and it names none of you."
- PROPOSED: "Once you know the place, the rest of the page gives way. It names none of you."
- WHY: "With the place put to it" is knotted. Splitting the sentence also lands "names none of you" as its own beat.

### Day 3. The Widow's Tooth

**5. Garrick named without an introduction, lines 276 to 280 (clarity, priority)**
- CURRENT: "It is the first time the [N] of you have walked anywhere together. The innkeeper has already complained about the road, his boots and the weather, in that order, and seems to be enjoying himself.
  Somebody must have asked him how he knew this place from a line of scribble, because he answers it to the air.
  *"People tell a man …"* Garrick says."
- PROPOSED: "It is the first time the [N] of you have walked anywhere together. The innkeeper (Garrick, he has told you somewhere along the road, as if it were hardly worth mentioning) has already complained about the road, his boots and the weather, in that order, and seems to be enjoying himself.
  Somewhere along the way the question gets asked: how did he know this place from one line of scribble? He answers it to the air."
  (Garrick's line itself is unchanged.)
- WHY: Day 2 deliberately leaves him unnamed (see the Designer's notes there). Here "Garrick says" appears with no beat that names him, so a careful reader will ask "who is Garrick?" The aside gives him his name and a touch of his dry manner. "Must have asked him… because" is also an awkward way round the rule that the game never speaks for friends; the passive "the question gets asked" does the same job cleanly.

### Day 4. Fenmark

**6. The standoff, line 444**
- CURRENT: "Nobody draws. Nobody needs to. It is a very clear message."
- PROPOSED: "Nobody draws. Nobody needs to. The message is plain enough."
- WHY: "a very clear message" sounds modern and flat in a voice that is otherwise spare and old-fashioned.

**7. The summary card, lines 466 to 467 (data, not prose)**
- CURRENT: "You earned: **+500g** · **Charm 14 → 26** · *Apprentice reached: +2 on every Charm roll*" and "You can now afford: … *450g more for Weapon Lv. 2*"
- PROPOSED: "You earned: `[gold]` · Agility or Charm `[growth]`", like the other days. Delete the "You can now afford" line from canon, or mark it plainly as an example.
- WHY: these are worked example figures (see the Designer's notes) and they sit in the generated `chapterScripts.ts` (lines 701 to 702). The demo (`StoryAndPartyTabs.tsx` ~1298) and the online day (`OnlineDay.tsx` ~580) already overwrite or drop both lines, so no player sees them today. Any new reader of the script would, though. Low priority.

### Day 5. The old charcoal camp

**8. Arrival, lines 489 to 491**
- CURRENT: "At the edge of the clearing is a shed. You get there after dark. Nobody answers."
- PROPOSED: "You reach it after dark. At the edge of the clearing stands a shed, with no light in it. You knock. Nobody answers."
- WHY: the order is back to front (the shed comes before the arrival), and "Nobody answers" comes before anyone has knocked. "No light in it" is minor detail that fits the banked fire and the closed shutters.

**9. The woman appears, line 533**
- CURRENT: "She is at the edge of your firelight, and she has been there for some time."
- PROPOSED: "She is at the edge of the trees, where the light gives out, and she has been there for some time."
- WHY: the party has lit no fire at this point. The only fire is hers, banked, and Garrick "builds the fire up" later. "Your firelight" muddles the scene. The new wording also pays off the Aim notice ("You are being looked at through it now").

**10. A repeated tic, line 551**
- CURRENT: "It comes out fast and low."
- PROPOSED: "Then it comes all at once, as if she has been holding it for two winters."
- WHY: Day 4 has "It comes out low and fast" (line 412) and Week 2 Day 1 has "It comes out a piece at a time". Three days in a row with the same frame is too many. "Two winters" restates her own words that follow, so nothing new is added.

### Day 6. The ford

No changes. This is the best day of the fortnight: the map moving, the rubbing laid beside it, the courier. Leave it.

---

## Week 2 (`episode-2-the-wind-stone.md`)

### Day 1. The second name

**11. Opening orientation, line 35**
- CURRENT: "The hoofbeats are long gone. Garrick's count is still hanging in the dark."
- PROPOSED: "The mine is quiet again. The hoofbeats are long gone, but Garrick's count is still hanging in the dark."
- WHY: this is the first line of a new Week, read days after the Gathering. One word of place ("the mine", as in the week table) tells a returning player where they are.

**12. Passive voice, line 43**
- CURRENT: "At first light a carter bound for Fenmark is found to take Tamsin home. She is still humming."
- PROPOSED: "At first light you find a carter bound for Fenmark who will take Tamsin home. She is still humming."
- WHY: "is found to take" is stiff and reads as if it were "found to be taking". The active voice is clearer. (It is kept as "you" rather than "Garrick" so that no new action is given to him.)

**13. The road, line 67**
- CURRENT: "Two days down the mill road, through country that gets emptier the further you go."
- PROPOSED: "Two days down the mill road, through country that gets emptier the further you go: fewer farms, then fewer fences, then only sheep and wind."
- WHY: this is a two-day journey and the week's only stretch of road, and it has no texture. One clause of landscape, nothing more.

### Day 2. The mill

**14. Functional framing, line 152**
- CURRENT: "There are three things here that might tell you something before anybody does."
- PROPOSED: "Nobody comes out to meet you. Three things in the yard might speak before anybody does."
- WHY: as written it is a menu prompt. The new version keeps the function but makes the silence of the yard part of the scene.

**15. Repeated phrase, line 169**
- CURRENT: "A woman is standing in the mill door. She has been there for some time."
- PROPOSED: "A woman is standing in the mill door. She has been watching you since you came into the yard."
- WHY: "She has been there for some time" is the exact line used for the charcoal woman eight days earlier (W1D5, line 533). Here it reads as a template.

### Day 3. Upriver

**16. "Housings", line 306 and summary line 325 (continuity, priority)**
- CURRENT: "It is the same work. The same carving as the housings your own fragments came out of, sealed the same way."
- PROPOSED (wording only; Fake Guru to confirm the intent): "It is old work, the same as the old stone at every place your fragments have lain: the boundary stone, the well, the ford-stone. And it is sealed."
- WHY: no earlier fragment came out of a carved "housing". They came from cracks and hollows (a boundary stone, a door beam, the rock, the well, a dead tree, under the ford-stone). A player who remembers those will be confused. If a hidden carving at each site was always intended, it needs planting in Week 1 instead, and that is a story change for Fake Guru. The summary line "a lock like the ones your fragments come from" has the same problem; it could become "a stone lock as old as the places your fragments lay".

### Day 4. What the hillside hides

**17. Opening, line 346**
- CURRENT: "The path ends at a hole in the hill."
- PROPOSED: "The path climbs for an hour through bracken and scree, and ends at a hole in the hill."
- WHY: this is the week's big reveal day and it opens on a single bare line. A short climb gives the moment some weight and uses only things already on this hill (bracken and scree come from Day 5).

**18. Finding the fragment, line 390**
- CURRENT: "You are all down in the roots at the shaft's mouth. It is your hand that finds it."
- PROPOSED: "You are all flat among the roots at the shaft's mouth, getting your breath back, when your hand closes on something in the dark."
- WHY: "down in the roots" is unclear after "driven back from the shaft". The new line says what the bodies are doing and leads into the [CLOSE YOUR FINGERS ON IT] button. (Optional: if the button should still do the closing, use "your hand finds something in the dark".)

### Day 5. The hillside by night

No changes. The scout's fight, the teeth, the lamp flashed twice and "You have five" are all excellent.

### Day 6. The other way in

**19. The pass line, line 535 (clarity, priority)**
- CURRENT: "You have them. So many at the lamps. So many beyond. One who does not move at all, and is small."
- PROPOSED: "You have them: a knot of them at the lamps, a steady stream beyond, all going the same way. And one who does not move at all, and is small."
- WHY: "So many… So many" reads like a template where a number was meant to go in ("[so many] at the lamps"). A pass has to feel like it bought something exact. The new line gives a picture without inventing a count. ("All going the same way" restates the Aim notice.)

**20. The sixth fragment, lines 548 to 552 (optional)**
- CURRENT: `[PICK IT UP]`, then straight to "**A locked Seeker Fragment has been added to your Chest.**"
- PROPOSED: add one line after the button: "Cold, as they all are. Colder than the night."
- WHY: every other fragment of the fortnight gets one line of feel (cold, weight, frost). This is the only one with none, and it is the one that completes a map. Skip this if its plainness is meant to signal that it was dropped by the Order. The "not hidden, this time" line suggests that may be so.

**21. The friends on watch, line 562**
- CURRENT: "The others are spread along the hillside on watch. They have to have it too."
- PROPOSED: "The others are strung out along the hillside on watch, too far to pass a map between. They have to have it too."
- WHY: this sets up why the way must be said aloud, which is the [PLANT]. The Designer's notes use "strung along"; putting the reason in the prose makes the plant feel natural rather than forced. The [PLANT] line itself is unchanged.

---

## (a) Lines that break a rule as written

1. **Glossary, "locked":** "A locked Seeker Fragment has been added to your Chest" (every fragment line, both weeks) and the summary "Fragment: 1 found, locked". The glossary (`mythios-glossary-proposal.md` line 39) says the missing word is a **word** that you **solve**, not a "lock". "Locked" is arguably a state rather than the noun the glossary bans, but it pulls toward "lock-picking", which is what Fake Guru objected to. Suggest "**A Seeker Fragment has been added to your Chest. Two of its words are missing.**" (first time only), then "A Seeker Fragment has been added to your Chest." For Fake Guru to decide. It touches about 12 lines and the generated scripts.
2. **Cross-file mismatch (not prose):** `garrick-deception-table.md` line 187 places "That went about as well as it looked." at **Ep2 D5**, but the episode file has it on **Day 4** (line 388, after being driven back from the shaft). Line 151 of the table also says "(after a bad Challenge)", yet in the episode the line plays whatever the roll. The episode placement reads correctly; the table should be updated (Fake Guru to confirm).
3. **W1D4 Designer's note** mentions "a dog still barking where the lookout ran through". The text has no dog; it has the gate left swinging. This is a stale note, not player text.
4. **Spelling:** "south-east" (Ep2 line 59) and "southeast" (Ep2 line 3, a header). Pick one; British canon elsewhere uses "south-east".
5. **No breaches found** of first-use gates, reassurance, out-of-game talk, placeholders or [PLANT] wording in the weekday narration.

## (b) The changes I'd prioritise

1. **#5:** introduce Garrick by name on W1D3. Players currently meet "Garrick says" with no introduction.
2. **#19:** fix the W2D6 "So many at the lamps" pass line, which reads like a missing number.
3. **#16:** the "housings" continuity slip on W2D3 (needs Fake Guru's call on intent).
4. **#1:** a fuller opening for W1D1, the first two lines of the whole game.
5. **#8 and #9:** the W1D5 arrival order and the "your firelight" slip.
