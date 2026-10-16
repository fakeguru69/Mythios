# Prose audit: the short texts around each day

**What I checked**
- All 36 Seeker Fragments (`src/data/mythiosFragments.ts`).
- All 108 Fan Out leads: the place, the two verbs, the clue title and the clue text (`src/data/fanOutLeads.ts`, `APPROVED_FAN_OUT_LEADS`).
- The 4 late lines (`FAN_OUT_LATE_LINES`).
- The 36 meaning questions (`fragmentMeaningQuestions.ts`) and the 6 week questions (`weekQuestions.ts`).
- In `campfire-days-v23.json`, the 36 fork pairs (`forkA` and `forkB`) and the 36 `fanOutClue` title and text pairs.

That makes about 300 short passages. I checked the time of day, the first-use gates and the canon wording against the episode files.

**Overall verdict:** this is the strongest prose layer in the game.
- **Fragments.** They read like real scripture: spare and rhythmic, with a turn in the second sentence ("Morning came. The enemy did not."). I propose **no fragment changes**. Most of them are plants or carry double meanings ("They were only servants", "you are ours", "One stayed close"), and they work.
- **Fan Out clues.** The clues are hard, physical detail of the right kind (the leaned bar, the full pail, the swept fan). Being short is a strength here, because each one is a single observed fact.
- **The real problems are few:**
  - three time-of-day slips (a lead set "at first light" or "by daylight" when Fan Out happens at last light);
  - a late-line set that is too small, and says "see it" or "find it" on leads where you listen or talk;
  - a handful of clumsy sentences;
  - a few meaning questions and fork lines that are too thin ("Why not?", "It means something else.").

**Note on where the JSON is shown.** Every day now has three approved leads, so the JSON `fanOutClue` text is only a fallback (`fanOutLeadsFor`) plus the Audit Workbench. Players see the leads. I have left the JSON clues alone apart from one mismatch (section 5). The `closureInfo` field holds secret notes ("his royal bloodline"). I checked it: no screen shows it, and the online loader (`scripts/gen-fragments-sql.ts`) does not send it. Good.

---

## 1. Seeker Fragments (`mythiosFragments.ts`)

**No changes proposed.** Every lock word and every jumble stays.

- The two lines that could look odd are deliberate:
  - 1-4, "marked before the first cry's through": verse cadence, and a plant for the Week 2 Gathering.
  - 4-2, "Earth, wind, water, fire": "wind" matches the Wind Stone.
- Small Bag label note, for information only: three labels lean on "crack" ("The wall crack" 5-6, "The deep crack" 6-4, "The crack's end" 6-6). They are three separate finds in the same places, so they are accurate. I would leave them.

---

## 2. Fan Out leads (`fanOutLeads.ts`, `APPROVED_FAN_OUT_LEADS`)

### 2a. Time-of-day slips (clarity; the clue itself is unchanged)

Fan Out is "the last light": it happens at dusk, right before the fire. Three leads place the look at another hour.

**W5D2, lead 5-2-3 ("where the dogs came out of the dusk").** The dogs come at dusk (episode 5, ~line 183), and the fire is that same night.
- CURRENT verb (Aim): "read the ground at first light"
- PROPOSED: "read the ground by lamplight"
- CURRENT clue: "At first light their tracks come in together, in a straight line from the north. They go out scattered every way, the prints far apart."
- PROPOSED: "By lamplight the story is plain in the dirt. Their tracks come in together, in a straight line from the north. They go out scattered every way, the prints far apart."
- WHY: "first light" is tomorrow morning, yet the clue goes on the board tonight.

**W6D5, lead 6-5-2 ("the floor of the round room").**
- CURRENT verb (Intellect): "read the scratches by daylight"
- PROPOSED: "read the scratches by the last of the light"
- WHY: same slip; Fan Out is at dusk.

**W5D1, lead 5-1-3 ("the lane up from the shingle").**
- CURRENT: "Every window up the lane has a lamp burning at midday, as Reedham does only on a dark-moon night."
- PROPOSED: "Every window up the lane has had a lamp burning since morning, through the whole grey day, as Reedham does only on a dark-moon night."
- WHY: at last light, lit lamps are normal. The clue is that they have burned all day, and the new wording says so. It also echoes the day's "the dawn never finishes".

### 2b. Clumsy or unclear sentences

**1-6-1 "Threads on a thorn"**
- CURRENT: "On a thorn at the water's edge of the far bank, a little way along from the ruts, a few woollen threads hang at the height of a child."
- PROPOSED: "On the far bank, a little way along from the ruts, a thorn leans over the water. A few woollen threads hang from it, at the height of a child."
- WHY: the original stacks three place phrases before the subject.

**2-6-1 "One line"**
- CURRENT: "The strokes come from one place only, and each new stroke lands a little nearer the old shaft than the last."
- PROPOSED: "Lay your palm on the turf and you can feel the picks at work below. The strokes come from one place only, and each new stroke lands a little nearer the old shaft than the last."
- WHY: "the strokes" has nothing to refer to, so the player must guess what they are.

**4-4-2 "Two records"**
- CURRENT: "Two pages back, she copied \"the marked\" out of a different record. The two words never appear in the same copied line."
- PROPOSED: "Two pages back, she copied \"the marked\" out of a different record. Nowhere in all her copying do \"the marked\" and \"moon-blood\" share a line."
- WHY: "the two words" is unclear. The clue (two separate sources) stays exactly as it is. "Moon-blood" is at its gate (W4D4).

**4-6-1 "The rings"**
- CURRENT: "...rings are already spreading from the dark under its wall, and your oars have been still for a minute."
- PROPOSED: "...rings are already spreading from the dark under its wall, though your oars have been still for a minute."
- WHY: "and" hides the point. "Though" makes the strangeness clear.

**5-1-2 "The rime stays"**
- CURRENT: "Long after the fragment is out, the rime stays in the crack, in a mild wind. It is the same cold you have felt at every hiding place since the forest road."
- PROPOSED: "The fragment is long out of the crack and the wind is mild, but the rime has not melted. It is the same cold you have felt at every hiding place since the forest road."
- WHY: "stays in the crack, in a mild wind" is awkward. The fact is unchanged.

**5-3-3 "Knocked out"**
- CURRENT: "Every break shows the bite of a hammer, weathered smooth."
- PROPOSED: "Every break shows the bite of a hammer, long since weathered smooth."
- WHY: "bite… weathered smooth" reads as a contradiction until "long since" gives the time.

### 2c. Thin clues worth a touch of texture (fact unchanged)

**3-6-1 "No horses"**
- CURRENT: "Not one horse is tethered at the foot of the Kiln."
- PROPOSED: "In the last of the light you walk the whole foot of the Kiln, round to where the shadow swallows the slope. No horse is tethered anywhere below it. Not one."
- WHY: this is the barest clue of all 108, one bald line. See also section 5: the JSON version adds "though six rode this way".

**3-5-1 "Cut twice"**
- CURRENT: "Each stroke of the name has been cut twice, the second pass deeper than the first."
- PROPOSED: "Low on the doorframe, every stroke of the name has been cut twice: once lightly, then again along the same line, deeper."
- WHY: it places the name and shows the action. It adds no reading of its own (the clue leans A, and the wording stays neutral).

**Verb, 3-3-2 (Intellect)**
- CURRENT: "look it over before you step away"
- PROPOSED: "study it closely before you step away"
- WHY: the flattest verb in the set.

Everything else in the leads I would leave as it is. The best ones should stay word for word: 1-4-3 "Fresh bark", 2-3-2 "Silver in his purse", 3-2-3 "Sacking on the stones", 4-5-2 "Folded dry", 5-4-3 "No two alike", 6-2-3 "Bowls never filled", 6-6-3 "Every post empty".

---

## 3. Late lines (`FAN_OUT_LATE_LINES`)

**The problems**
- **Too few.** There are 4 lines for 36 days, so each one comes back 9 times in a season. The rotation is per day, so every friend sees the same line on the same day.
- **Mismatched verbs.** Two lines say "find" or "see". On listening and talking leads that reads wrongly. For example:
  - 1-5-1, the woman by the fire;
  - 2-4-3, the chant;
  - 4-3-1, the fisherman;
  - 6-2-2 and 6-4-3, the heartbeat.

**PROPOSED set:** 5 lines. With 5, `lateLineFor` still rotates, and a given weekday does not always get the same line (6 lines would). Every line fits any kind of lead.

CURRENT:
1. "It takes you until full dark, but you find it."
2. "You almost give up. Then, at the last of the light, there it is."
3. "You go over the same ground twice before you see it."
4. "By the time you find it, the fire is the only light left."

PROPOSED:
1. "It takes you until full dark, but you have it."
2. "You almost give up. Then, at the last of the light, it comes."
3. "You go over the same ground twice before it falls into place."
4. "By the time you have it, the fire is the only light left."
5. "It costs you the last of the light, but you come away with it."

WHY: the wording fits seeing, hearing and asking alike. The fifth line gives more variety, and needs no code change.

---

## 4. Meaning questions and week questions

**Meaning questions.** They are crisp and do not give answers. I propose changes only to the thinnest and the repeated ones.

| Fragment | CURRENT | PROPOSED | WHY |
|---|---|---|---|
| 1-3 | *"Some locks already know their key."* Whose key? | *"Some locks already know their key."* What lock, and what kind of key would it know? | "Whose key?" is too bare for a fresh player |
| 1-6 | *"The key that locks."* What is locked, and who holds the key? | *"The key that locks is also the key that unlocks."* What is locked, and who holds the key? | the quote cuts the refrain in half, and the turn is the point of it |
| 3-4 | *"We locked with what we are."* What are they? | *"We locked with what we are."* What are they, that they could lock something with it? | too bare; the new wording links "what we are" to the lock without answering |
| 3-6 | *"We never dug him a grave."* Why not? | *"We never dug him a grave."* Why no grave, and what would their blood have to hold? | "Why not?" is used twice (also 5-4); this asks about the second sentence too |
| 5-2 | *"That is why it had to be us."* Had to be them, for what? | *"That is why it had to be us."* What could only the ones who fought beside them do? | the original is clumsy to read aloud |
| 5-4 | *"We could not bring ourselves to break them."* Why not? | *"We could not bring ourselves to break them."* What were those soldiers to the people who left them standing? | removes the repeat; makes players look at the soldiers. No answer given |

The other 30 stay. Week 6 ones were rechecked: none leads toward "royal blood".

**Week questions:** keep all six. They are clear and parallel ("What do they need Wren for?" / "…Joss for?"), and right for a running board.

---

## 5. Campfire non-Garrick text (`campfire-days-v23.json`)

### 5a. Fork lines (shown as "Reading A / Reading B" at the fire)

These are canon (`mythios-campfire-table-v2.md`), so each change needs Fake Guru's yes. Most work well: short, opposed theories, each easy to choose between. Only the weak ones are below.

**W2D2**
- CURRENT: A "They had a list with birthdays." / B "They knew him personally."
- PROPOSED: A "They came knowing the night he was born." / B "They knew the boy himself."
- WHY: "birthdays" is not the day's word. The miller's wife says "the night he was born" (episode 2, ~line 195), and canon keeps "birth night" unnamed until the Gathering. "Personally" is flat office-speak.

**W2D4**
- CURRENT: B "They won't change a thing for us."
- PROPOSED: B "They won't change a thing on our account."
- WHY: it now reads as a firm reply to A, "Now they'll hurry."

**W3D2**
- CURRENT: A "The manners were real." / B "The manners are the trick."
- PROPOSED: A "The manners were real." / B "The manners were the trick."
- WHY: the tenses don't match, so the pair doesn't read as a clean either/or.

**W4D4**
- CURRENT: B "It means something else."
- PROPOSED: B "It means more than the marked."
- WHY: the thinnest fork line in the set. The new wording keeps the same reading without saying what "more" is.

**W6D6**
- CURRENT: B "The door is not ours to open tomorrow."
- PROPOSED: B "Tomorrow night, that door is not ours to open."
- WHY: it now matches A's "tomorrow night". Moving "tomorrow" to the front also stops it reading as "maybe some other day".

### 5b. Fan Out clue texts in the JSON

- The `press-on` entries copy canon's [PRESS ON] detail word for word. Leave them.
- The `new` and `fan-out` entries are the same as lead 1 of each day, with one mismatch:
  - **3-6 "No horses".** The JSON reads "Not one horse is tethered at the foot of the Kiln, though six rode this way." The lead (what players see) leaves out the second half.
  - The "six" comes from the W3D3 [PRESS ON] clue ("Six horses…"), so only players who passed that roll know it.
  - **My choice:** the lead's version is right, so drop "though six rode this way" from the JSON too (or use the 2c wording in both places). The fallback and the workbench should then match the player view.

`bearsOnFork` and `qaNote` are not used in any proposal.

---

## (a) Lines that break a rule as written

None break a first-use gate, a placeholder or the no-reassurance rule. I checked:
- "king" first at W2D5;
- "the Order" first at W6D3 in this set;
- "five" or "fifth" from W4D1;
- "moon-blood" at W4D4;
- "heartbeat" in Week 6 only;
- no "Highwall" anywhere.

The closest to a rule problem are canon-wording and time-of-day mismatches rather than breaks:
1. The W2D2 fork "birthdays" is not the canon term; canon says the night he was born, and keeps "birth night" for the Gathering.
2. Lead 5-2-3 and lead 6-5-2 set the look at "first light" or "by daylight", which is not possible in "the last light".
3. The two versions of 3-6 "No horses" disagree. The JSON fallback assumes a [PRESS ON] fact that not every player has.

## (b) The changes I would do first

1. **Late lines:** use the 5-line set (section 3). It is seen often, it currently repeats 9 times a season, and two lines are wrong for listening and talking leads.
2. **Fix the time-of-day slips:** 5-2-3, 6-5-2 and 5-1-3 (section 2a).
3. **Clarity fixes in four clues:** 2-6-1 "the strokes", 4-4-2 "the two words", 1-6-1 "the thorn" and 4-6-1 "and" to "though" (section 2b).
4. **Meaning questions:** replace the two "Why not?" questions and the half-quoted refrain 1-6 (section 4).
5. **Fork lines:** W2D2 to canon's own wording, and W4D4 B no longer "something else" (section 5a). Then align the 3-6 JSON clue with the lead.

**Reminder for whoever applies these.** After changing the leads, meaning questions or week questions, rerun `scripts/gen-campfire-sql.ts <week>` and load the result again (CLAUDE.md §4). The fork changes also go into `docs/canon/mythios-campfire-table-v2.md`, `campfire-build-bundle.md` and `src/data/campfireDaysData.ts`, which holds its own copy.
