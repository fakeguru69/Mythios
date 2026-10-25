# Play *Tales of the Dark Moon* as a Player — Full Day-by-Day Audit & Score Report

- **Date:** 25 October 2026
- **Auditor:** Senior Game Designer & Narrative / Systems Auditor
- **Prompt Executed:** `docs/playthrough/play-and-score-audit-prompt.md` (Written 25 Oct 2026 for Fake Guru)
- **Progress:** All Stages Complete — Stage 0 (Set-up), Stages 1–6 (Weeks 1–6, All 42 Days), Stage 7 (Hindsight Check & Whole-Season Roll-Up), and Stage 8 (Comparison with Earlier Audits).

---

# Stage 0 — Set-up & Environment Report

- **Mode:** **Read + Local Code Inspection Mode** (hybrid inspection of the live TypeScript/SQL codebase in `/src/data/chapterScripts.ts`, `/src/data/campfireDaysData.ts`, `/src/data/gatheringScripts.ts`, `/scripts/gen-chapter-scripts.cjs`, `/supabase/migrations/0105`–`0111`, and the React UI screens in `/src/online/`, alongside `/docs/playthrough/season-part-*.md` and `/docs/playthrough/gameplay-rhythm.md`).
- **Why not live PostgreSQL mode:** The container environment does not have a local `postgres` / `psql` server binary installed, and `/app/applet` is a workspace snapshot without a `.git` remote to fetch commits pushed after 23 Oct 2026.
- **Snapshot Note:** All scores and quotes below are grounded in the **exact 23 Oct 2026 live codebase** (`src/data/chapterScripts.ts`, `src/data/campfireDaysData.ts`, `src/data/gatheringScripts.ts`, and `supabase/migrations/0105`–`0111`).

---

# Stage 1 — Week 1 (Days 1 to 7): *The List, the Child, and the Wall*

## 1. Week 1 Score Tables

### A. Weekday Scores (`W1D1` – `W1D6`)

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | M1 | M2 | M3 | M4 | M5 | M6 | M7 | Mech avg | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Fire avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W1D1** | 8 | 9 | 9 | 9 | 8 | 7 | 9 | **8.4** | 6 | 7 | 7 | 7 | 7 | 6 | 8 | **6.9** | 6 | 5 | 6 | 7 | 8 | 8 | 8 | **6.9** | **7.4** | **Best:** The ambush man who takes nothing and leaves your name on a torn page. **Worst:** No two-piece evening puzzle on Day 1 (`puzzle: null`) and a cosmetic fork where both choices converge on the exact same next sentence. |
| **W1D2** | 9 | 8 | 9 | 9 | 9 | 9 | 9 | **8.9** | 5 | 8 | 8 | 7 | 9 | 6 | 7 | **7.1** | 8 | 8 | 9 | 8 | 8 | 8 | 8 | **8.1** | **8.0** | **Best:** Garrick setting out the extra cup before anyone speaks, then reading Meira's shorthand without leaving the bar. **Worst:** Three forks (`ASK HIM ABOUT THE LIST` / `ASK WHO ELSE`, etc.) whose branches converge immediately onto identical dialogue. |
| **W1D3** | 8 | 8 | 9 | 9 | 8 | 9 | 9 | **8.6** | 8 | 8 | 8 | 8 | 6 | 8 | 8 | **7.7** | 8 | 8 | 8 | 7 | 8 | 8 | 8 | **7.9** | **8.0** | **Best:** Fitting the burned scrap from Day 1 against the cut stone at the Widow's Tooth and finding the weathered wooden horse. **Worst:** No `[PRESS ON]` beat (`M5=6`) and a pure Fight day with no non-combat skill roll. |
| **W1D4** | 9 | 8 | 9 | 9 | 9 | 8 | 9 | **8.7** | 7 | 8 | 8 | 8 | 6 | 7 | 8 | **7.4** | 7 | 5 | 8 | 8 | 9 | 9 | 8 | **7.7** | **8.0** | **Best:** The quiet Fenmark lane, the still-warm barley bowl, and Garrick's silent Campfire (`narratedSilence`) after learning nine-year-old Tamsin was taken. **Worst:** No two-piece Campfire puzzle (`C2=5`) and no `[PRESS ON]` beat (`M5=6`), plus the two later forks (`id: 1`, `id: 2`) have zero mechanical consequence. |
| **W1D5** | 8 | 8 | 9 | 9 | 9 | 9 | 8 | **8.6** | 9 | 8 | 9 | 8 | 6 | 8 | 9 | **8.1** | 8 | 8 | 8 | 8 | 8 | 8 | 9 | **8.1** | **8.3** | **Best:** Two back-to-back high-stakes forks—`LOOK AT THE PATH` earns first strike, and `HOLD OUT THE CARVED HORSE` rewards attention to Day 3's clue with an immediate Might Relic and her trust. **Worst:** No `[PRESS ON]` beat (`M5=6`) and a 4-card tap-to-continue stretch after she sits. |
| **W1D6** | 8 | 9 | 8 | 9 | 8 | 9 | 9 | **8.6** | 5 | 8 | 8 | 8 | 9 | 6 | 7 | **7.3** | 8 | 8 | 9 | 9 | 8 | 8 | 9 | **8.4** | **8.1** | **Best:** `[WADE OUT]` finding the gunwale paint scrape on the ford-stone, followed by the six Seeker Fragments sliding together into a map. **Worst:** Both evening inn forks (`ASK WHO IT IS FOR` / `LOOK AT THE EXTRA CUP` and `READ IT OUT` / `LET {F2} READ IT`) are purely cosmetic flavour before identical outcomes. |

### B. Gathering 1 Score Table (`W1D7` — *The Mine*)

| Gathering | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Gathering avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W1D7** | 9 | 9 | 9 | 9 | 9 | 8 | 9 | **8.9** | 8 | 8 | 9 | 9 | 9 | 8 | 9 | **8.6** | **8.7** | **Best:** Finding Tamsin alive and humming in the dark, then reading four children's names scratched below an empty wall socket—**"This was never about you."** **Worst:** The Approach vote (`WADE THE SHALLOWS` vs `THE LEDGE ABOVE`) converges on the exact same `THE LAST STRETCH` roll with identical pass/fail text. |

### C. Week 1 UX Scores (`U1` – `U7`)

| Week | U1 (Where to go) | U2 (Screen length) | U3 (Buttons & taps) | U4 (Stats & numbers) | U5 (Party presence) | U6 (Notifications) | U7 (Mood & look) | UX avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 1** | 8 | 8 | 7 | 8 | 8 | 6 | 9 | **7.7** |

---

## 2. Week 1 Score Justifications (Highs & Lows with Quotes)

### High Scores (8–9)
- **`W1D1` `S2=9, S3=9, S4=9, S7=9`:** The opening hook is spare, physical, and immediately intriguing: *"He does not ask for your purse. He comes out of the trees already swinging…"* and ends with a killer pull line: **`{N} names. Yours is one of them.`**
- **`W1D2` `S1=9, S5=9, S6=9, M5=9, C3=9`:** Garrick's introduction is a masterclass in understated NPC writing: *"There is one more cup than there are of you. He sets it at the empty place at the end of the table without a word."* The `[PRESS ON: READ THE STUBS]` beat (`M5=9`) materially changes how you read the mystery: *"Each stub has a faint straight line scored down it. She did not rip these out. She cut them against a rule, one at a time, with care. She meant to send them."* And that `[PRESS ON]` detail feeds directly into the evening Campfire as the fan-out clue (`C3=9`).
- **`W1D3` `S3=9, S6=9, M1=8, M6=8`:** The disguised fork at the Widow's Tooth (`GO TO THE MARKING` vs `FOLLOW THE CART-RUTS`) has real, logical tactical teeth: crouching under the overhang with your back to the bracken gives you the charcoal clue on your thumb (`"Charcoal in the cut"`) but costs you first strike (*"That is where you are, with your back to the bracken, when the bracken moves"*), while following the ruts spots the lookout in the bracken and grants first strike.
- **`W1D4` `S1=9, S4=9, S5=9, C5=9, C6=9`:** The emotional register shifts from road mystery to something quiet and human: *"They took Tamsin. She's nine. She was counting when they carried her out. She counts when she's frightened."* In the evening Campfire, `narratedSilence` (`C5=9, C6=9`) honors that shift instead of cracking a joke: *"Garrick sets a bowl in front of each of you, and for once he says nothing at all."*
- **`W1D5` `M1=9, M3=9, M7=9, C7=9`:** The best mechanical weekday of Week 1. First, `LOOK AT THE PATH` rewards the cautious tracker with first strike against the runner (`"His stride is long and low, and the mud at the turn is still oozing water into the heel-mark. He is here."`). Second, when the charcoal-burner steps out with her axe (`"Which of you carries the curved knife?"`), choosing **`HOLD OUT THE CARVED HORSE`** connects the object you found on `W1D3` to her missing nephew, immediately dropping her axe and awarding a `+1 Might` Relic (`"The carver's charm"`).
- **`W1D6` `S2=9, M5=9, C3=9, C4=9, C7=9`:** `[PRESS ON: WADE OUT]` (`M5=9`) solves an otherwise impossible tracking dead-end (*"Mid-stream, on the upstream side of the ford-stone, a scrape of fresh paint on the rock at the height of a gunwale. There was a boat."*). The Fragment assembly scene on the sun-warmed rock (`S2=9`) makes six days of collecting locked shards pay off visually and narratively.
- **`W1D7` `S2=9, S5=9, G3=9, G4=9, G5=9, G7=9`:** The United Effort (`THE ROTTEN GALLERY`, `G3=9`) makes a specific friend's name (`{RISK}`) hang over the river drop while the rest of the party lies flat on the planks to haul them back, and passing or failing visibly changes the Discovery room (`"The dust on the rim has settled again"` vs `"There was dust on the rim. Your own sleeves have wiped it"`). The Turn (`G5=9`) reframes the entire first week in five words: **`This was never about you.`**

### Low Scores (5–6)
- **`W1D1` `M1=6, M6=6, C1=6, C2=5`:** On Day 1, the newly added choice (`LOOK WHERE HE STOOD` vs `LOOK AT WHAT HE WAS AT`) occurs *after* the ambush fight has already ended, so it has no tactical effect (`M6=6`), and both branches drop into the exact same next card (`"Then you see what he was trying to light."`). And on Day 1's Campfire, `puzzle: null` and `clicks: []` mean there is no two-piece clue combination puzzle (`C2=5`) on the very first evening when players are learning the Campfire loop.
- **`W1D2` `M1=5, M6=6`:** All three choices (`id: 0`, `id: 1`, `id: 2`) in the Hollow Wake Inn are disguised forks added by `migration 0107`, and while each grants a `roadFind` clue for the evening board, **none of the three alters the conversation flow or mechanical state inside the chapter**.
- **`W1D4` `C2=5, M5=6`:** Day 4 has no two-piece Campfire puzzle (`puzzle: null`, `clicks: []` -> `C2=5`) and no `[PRESS ON]` option (`M5=6`). Also, in `choice id: 0` (`LOOK FOR FOOTPRINTS` vs `KNOCK NEXT DOOR`), the `changed` banner says `"You took the back lanes (Agility roll on the Challenge)"` or `"You knocked next door (Charm roll on the Challenge)"`, yet the `FIND WHO LEFT IT` Challenge card immediately afterward still lets the player pick *either* Agility or Charm freely regardless of the fork chosen.
- **`W1D6` `M1=5, M6=6`:** Neither of Day 6's two choices (`ASK WHO IT IS FOR` / `LOOK AT THE EXTRA CUP` and `READ IT OUT` / `LET {F2} READ IT`) has any mechanical effect in the chapter (`M6=6`), and in `id: 0` both choices produce the exact same spoken response from Garrick: `*"Family habit. We always pour one for whoever can't be with us."*`

---

## 3. Week 1 in a Paragraph

Week 1 feels like stepping into a low-magic, mud-and-wet-wool thriller where every day adds one concrete piece of a real investigation: an ambush over a list of your names (`W1D1`), a missing scholar's cut-out notebook at an inn (`W1D2`), a lookout at a split rock (`W1D3`), a silent village hiding the taking of a nine-year-old girl (`W1D4`), an aunt who lost her nephew to the same curved knife two winters ago (`W1D5`), a river crossing where six Seeker shards click into a map (`W1D6`), and a drowned mine (`W1D7`). **Its best moment** is the one-two punch at the end of Gathering 1 (`W1D7`): finding Tamsin alive and humming in the dark to keep from crying, and then looking at the wall behind her to discover an empty socket and four children's names scratched into the stone—realizing in a single heartbeat that *the list of four names in the mine isn't your party at all*. **Its worst moment** is the illusion of agency in the indoor conversation forks on `W1D2` and `W1D6`, where choosing between two distinct social approaches yields a one-sentence bridge followed by the exact same block of verbatim dialogue.

---

## 4. Open-Threads Ledger (End of Week 1)

| Thread / Clue / Promise / Fork | Opened | Paid Off in Week 1? | Legible to Player? | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Why are our `{N}` names on the list—and why did the highwayman try to burn it instead of robbing us?** | `W1D1` | **Partial (`W1D2`, `W1D7`)** | **Yes** | `W1D2` proves the list came from Meira's notebook (`{N}` cut stubs). `W1D7` twists it: there is a *second* list of four names on the mine wall (the children's), leaving open *why* Meira listed the party. |
| **The burned scrap with a strange shape (`W1D1` Challenge pass)** | `W1D1` | **Yes (`W1D3`, `W1D6`, `W1D7`)** | **Yes (10/10)** | Fits the rock carving at the Widow's Tooth (`W1D3`), matches the destination mark on the 6-fragment map (`W1D6`), and matches the empty wall socket in the mine (`W1D7`). |
| **Who is Meira, and why did she vanish 3 weeks ago with her notebook left in order?** | `W1D2` | **No (Open)** | **Yes** | Campfire 1-2 establishes she did not leave in a hurry (`"A woman packing in fear does not leave her book in order"`). |
| **Garrick's extra cup at the empty end of the table (`W1D2`, `W1D6`)** | `W1D2` | **No (Open)** | **Yes** | Poured on `W1D2` and `W1D6`; on `W1D6` he calls it `"Family habit. We always pour one for whoever can't be with us."` |
| **How could Garrick read Meira's private shorthand from across the bar?** | `W1D2` | **Partial (`W1D3`)** | **Yes** | Asked on `W1D3`, he deflects wryly: `"People tell a man with a cloth in his hand everything. They forget he's got ears."` Suspicion remains open. |
| **Meira's last two lines in two inks: *"Scattered on purpose..."* and *"They call them shards."*** | `W1D2` | **Partial (`W1D6`, `W1D7`)** | **Yes** | The 6 Seeker Fragments assemble into a map on `W1D6`, and `W1D7` reveals a shard-shaped socket in the mine wall that was recently emptied. |
| **The carved wooden horse found at the Widow's Tooth (`W1D3`)** | `W1D3` | **Yes (`W1D5`)** | **Yes (10/10)** | Holding it out on `W1D5` (`choice id: 1`, option 2) makes the charcoal-burner lower her axe at once—she carved it for her sister's boy taken two winters ago—and rewards a `+1 Might` Relic. |
| **The man with the curved, black-handled knife (`W1D4`, `W1D5`)** | `W1D4` | **No (Open)** | **Yes** | Took the charcoal-burner's nephew two winters ago (`W1D5`) and Tamsin three nights ago (`W1D4`). Still at large. |
| **Tamsin taken from Fenmark (`W1D4`)** | `W1D4` | **Yes (`W1D7`)** | **Yes (10/10)** | Rescued alive (with a bandaged cut on her palm) in the drowned mine during Gathering 1 (`W1D7`). |
| **The courier at the roadside inn who left without taking a bed (`W1D6`)** | `W1D6` | **Yes (`W1D7`)** | **Yes** | Explains why the chamber in the mine was emptied before you arrived and why a single horse gallops away from the mine mouth at the end of `W1D7`. |
| **What was lifted out of the chamber wall socket—and why did they only need a small cut on Tamsin's palm?** | `W1D7` | **No (Open -> Week 2)** | **Yes** | Newly opened at the climax of Gathering 1. |
| **Three more children's names scratched into the mine wall (`W1D7`)** | `W1D7` | **No (Open -> Week 2)** | **Yes** | Directly sets up Week 2's race (`"Tomorrow: three names, and somebody who knows which is next"`). |

---

## 5. "What's Next" Moments in Week 1

1. **`W1D1` (Opening — steps 1 to 3):** 3 consecutive `"say"` cards (`~195 words`) before `choice id: 0`.
2. **`W1D1` (Post-Challenge to Summary — steps 12 to 16):** 5 consecutive `"say"` cards (`~265 words`, 5 taps) from the locked box opening through the Fragment pickup and the pull line.
3. **`W1D2` (Ending sequence — steps 14 to 19):** 6 consecutive `"say"` cards (`~270 words`, 6 taps) from paying for the cups through the beam carving, the Fragment pickup, Meira's two-ink notes upstairs, and the pull line.
4. **`W1D3` (Post-Fight to Summary — steps 9 to 15):** 6 consecutive `"say"` cards (`~295 words`, 6 taps) after the bracken fight.
5. **`W1D5` (After the charcoal-burner sits — steps 10 to 16):** 6 consecutive `"say"` cards (`~310 words`, 6 taps) where she identifies the horse, explains her nephew's taking, and points north at dawn.
6. **`W1D6` (Post-Press On to the Roadside Inn — steps 9 to 15):** 7 consecutive `"say"` cards (`~330 words`, 7 taps) covering the lost trail at the river, the underwater Fragment, the six Fragments sliding into a map, and arriving at the roadside inn.

---

## 6. Week 1 Bugs, Slips & Builder's New Text Audit (Section G)

1. **Hardcoded `"Four"` in `W1D2` Campfire Opener (`src/data/campfireDaysData.ts` line 153):** Reads `"Four strangers, four torn pages, and an empty chair upstairs. Pull up to the hearth."` Breaks 2-, 3-, 5-, and 6-player parties.
2. **Misleading `changed` Banner on `W1D4` `choice id: 0` (`src/data/chapterScripts.ts` lines 683 & 694):** Flashes `"You took the back lanes (Agility roll on the Challenge)"` or `"You knocked next door (Charm roll on the Challenge)"`, yet the `FIND WHO LEFT IT` Challenge card does not lock or pre-select Agility or Charm, and its `pass` text always narrates following footprints behind the grain store even if you knocked next door and rolled Charm.
3. **`W1D5` `choice id: 1` Contradiction (`src/data/chapterScripts.ts` lines 1030 & 1041):** Branch 0 (`SHOW HER YOUR EMPTY HANDS`) says *"The axe comes down by inches... Then her eyes go to the carved horse in your other hand, and stop."* (Contradicts having just shown empty hands; the builder pasted the bridge line from Branch 2 into Branches 0 and 1.)

---

# Stage 2 — Week 2 (Days 1 to 7): *Corin, the Mill, and the Answering*

## 1. Week 2 Score Tables

### A. Weekday Scores (`W2D1` – `W2D6`)

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | M1 | M2 | M3 | M4 | M5 | M6 | M7 | Mech avg | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Fire avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W2D1** | 9 | 8 | 9 | 9 | 9 | 9 | 8 | **8.7** | 8 | 8 | 8 | 7 | 6 | 8 | 9 | **7.7** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **8.1** | **Best:** Waiting in silence by the wagon (`SAY NOTHING. WAIT.`) so Tamsin takes your sleeve on her own (+1 Charm Relic) and tells you she heard *"The mill boy next."* **Worst:** Forks `id: 0` and `id: 2` with Garrick converge immediately onto identical dialogue. |
| **W2D2** | 9 | 9 | 9 | 9 | 9 | 9 | 8 | **8.9** | 4 | 8 | 8 | 8 | 8 | 5 | 8 | **7.0** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **8.0** | **Best:** The empty mill wheel kept turning *"so that the house will not be quiet,"* and learning the kidnapper knew the night Corin was born better than his mother did. **Worst:** Zero player choices (`choice id: 0` is `mode: 'auto'`), so the player makes no narrative decision all day (`M1=4`). |
| **W2D3** | 8 | 9 | 9 | 9 | 8 | 8 | 8 | **8.4** | 3 | 8 | 8 | 8 | 6 | 8 | 8 | **7.0** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **7.8** | **Best:** Passing `WHERE THE TRACKS STOP` to come down from above and earn first strike on the chained dog, then finding the dead thief whose stone lock opens only for your hand. **Worst:** Not a single `choice` node in the entire chapter (`M1=3`) and no `[PRESS ON]` (`M5=6`). |
| **W2D4** | 8 | 8 | 9 | 9 | 8 | 8 | 8 | **8.3** | 3 | 8 | 8 | 7 | 6 | 5 | 7 | **6.3** | 7 | 5 | 8 | 7 | 9 | 9 | 8 | **7.6** | **7.4** | **Best:** Peering down the shaft to see Corin alive with his palms still uncut, followed by someone laughing in relief among the roots after you are driven back. **Worst:** Zero `choice` nodes (`M1=3`), no `[PRESS ON]` (`M5=6`), and no two-piece Campfire puzzle (`C2=5`). |
| **W2D5** | 8 | 9 | 8 | 9 | 8 | 8 | 8 | **8.3** | 4 | 7 | 5 | 8 | 6 | 6 | 8 | **6.3** | 8 | 9 | 8 | 8 | 8 | 8 | 8 | **8.1** | **7.6** | **Best:** Tearing the small black circle from the silent scout's coat and matching his snapped cuff thread to the horn button from the mill. **Worst:** `choice id: 0` (`WALK THE HILL` vs `READ MEIRA'S PAGES`) is set to `mode: 'auto'`, yet the fight's `strikeFirst` depends on it—punishing half the party for a choice the game made automatically (`M1=4, M3=5`). |
| **W2D6** | 8 | 8 | 8 | 9 | 8 | 8 | 9 | **8.3** | 5 | 8 | 8 | 8 | 9 | 6 | 7 | **7.3** | 8 | 8 | 9 | 9 | 8 | 8 | 9 | **8.4** | **8.0** | **Best:** `[PRESS ON: EAR TO THE ROCK]` hearing the larger, older silent hollow beneath the chanting room before the 6 fragments assemble into its map. **Worst:** Only one `choice` (`READ IT OUT` vs `LET {F3} READ IT`), which is purely cosmetic before `"It is said aloud, twice, across the dark"`. |

### B. Gathering 2 Score Table (`W2D7` — *Under the Mill Hill*)

| Gathering | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Gathering avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W2D7** | 9 | 10 | 9 | 10 | 10 | 9 | 9 | **9.4** | 9 | 9 | 8 | 9 | 10 | 9 | 9 | **9.0** | **9.2** | **Best:** Matching your own Seeker Fragments against *The Verse of the Answering*, discovering the erased king (Malakor), and realizing **"You're marked too. Every one of you."** **Worst:** A continuity bug if you lose the United Effort (`won: false` says you flee up the stair and Corin carries the ledger out, then the next section still takes place back inside the room with Corin pointing to the ledger in the wall niche). |

### C. Week 2 UX Scores (`U1` – `U7`)

| Week | U1 (Where to go) | U2 (Screen length) | U3 (Buttons & taps) | U4 (Stats & numbers) | U5 (Party presence) | U6 (Notifications) | U7 (Mood & look) | UX avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 2** | 8 | 8 | 7 | 8 | 8 | 6 | 9 | **7.7** |

---

## 2. Week 2 Score Justifications (Highs & Lows with Quotes)

### High Scores (9–10)
- **`W2D1` `S1=9, S5=9, S6=9, M7=9`:** In `choice id: 1`, picking **`SAY NOTHING. WAIT.`** (`M7=9`) respects a frightened child who has been counted and ordered around for days: *"You only wait with her in the road, while the carter shifts on his seat and the horse blows. After a while her good hand finds your sleeve, and holds on to a fold of it."* It awards a `+1 Charm` Relic (`"Her hand on your sleeve"`) and leads into her crucial whisper: *"One of them said, 'The mill boy next.'"* Also, `THE MAN WITH THE AXE` Challenge (`M6=8`) carries a live cross-week penalty (`harderIf: G1:united-effort-lost`).
- **`W2D2` `S1=9, S2=9, S4=9, S5=9, S6=9`:** The Notice lines and prose at the mill are hauntingly specific: Craft Notice (*"The wheel is turning, and there is nothing in the hopper. She keeps it running so that the house will not be quiet"*), Intellect Notice (*"The table behind her is laid for three. She has not been able to stop"*), and the revelation (*"He asked for my boy by name. And he knew the night he was born — knew it better than I did"*).
- **`W2D5` `C2=9`:** The Campfire two-piece puzzle (`"Were the stones broken or hidden?"`) delivers a genuine lore insight before Gathering 2: *"The carved monuments on the ridge were shattered with fire and mallet, but the cut stones in the sheepfold were laid face-inward against each other. Some were broken in anger, and some were hidden with care."*
- **`W2D6` `M5=9, C3=9, C4=9, C7=9`:** `[PRESS ON: EAR TO THE ROCK]` (`M5=9`) gives a chilling sensory clue—*"Above, it is muffled and close. Below it there is something else: a silence with room in it. Under the room with the lamps there is another hollow. It is bigger. And there is nobody in it at all."*
- **`W2D7` `S2=10, S4=10, S5=10, G5=10, G1=9, G2=9, G4=9, G6=9`:** Gathering 2 is a tour de force:
  - **The Approach (`G1=9`)** maps each vote to its own stat (`"NOW, UNDER THE CHANT"` -> `Agility`; `"WAIT, AND COUNT"` -> `Aim`), and passing earns first strike in the Battle (`G2=9`).
  - **The Scripture + Fragment Matching (`S2=10, S4=10`)** lets the party interrupt *The Verse of the Answering* twice to match their own Seeker Fragments against the Order's holy book.
  - **The Turn (`G5=10`)** synthesizes three separate clues from across two weeks into a single gut-punch realization: *"Every one of them is a night the moon went dark."* -> **`You're marked too. Every one of you.`**
  - **The `Ask` mechanic (`G6=9`)** lets each player spend one question on Garrick, who drops the erased king's name for the first time: **`"Malakor."` *"My grandmother taught me that name."***

### Low Scores (3–5)
- **`W2D3` `M1=3` and `W2D4` `M1=3, M6=5`:** Neither `W2D3` nor `W2D4` contains a single `choice` node in `src/data/chapterScripts.ts`.
- **`W2D2` `M1=4, M6=5` and `W2D5` `M1=4, M3=5`:** Both `W2D2` and `W2D5` use `"mode": "auto"`, which auto-assigns branches by party slot instead of letting the player choose. On `W2D5`, `THE ONE SENT UP TO LOOK` sets `strikeFirst` based on `choice 0, option 0` (`WALK THE HILL`)—meaning half the party is punished with losing first strike for a branch they never chose.
- **`W2D4` `C2=5`:** No two-piece Campfire puzzle (`puzzle: null`, `clicks: []`).

---

## 3. Week 2 in a Paragraph

Week 2 deepens the mystery from a local kidnapping into an ancient conspiracy with a frighteningly coherent logic, culminating in one of the strongest weekly finales in the game (`W2D7`, **9.2/10**). **Its best moment** is the sequence in Gathering 2 where the party reads *The Verse of the Answering* from the scorched black book, matches their own Seeker Fragments to prove the erased king was real, reads the word *given* beside generations of children's names in the oiled-leather ledger, and then connects the birthdates on Meira's list to realize that **every player in the party was born under a dark moon and carries the same mark as the children**. **Its worst moment** is the middle stretch of weekdays (`W2D2` through `W2D5`), which `migration 0111` largely skipped when adding interactive `mode: 'pick'` forks: `W2D3` and `W2D4` have zero `choice` nodes at all, and `W2D2` and `W2D5` leave their only choices on `"mode": "auto"`.

---

## 4. Open-Threads Ledger (End of Week 2)

| Thread / Clue / Promise / Fork | Opened | Paid Off in Week 2? | Legible to Player? | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Why were our `{N}` names on Meira's list?** | `W1D1` | **Yes (`W2D7`)** | **Yes (10/10)** | Meira wrote the night each of you was born beside your name—every one of you was born on a night the moon went dark (`"You're marked too. Every one of you."`). |
| **Why don't the kidnappers take us if we are marked too?** | `W2D7` | **Yes (`W2D7` Ask)** | **Yes (9/10)** | Asking Garrick `"WHY DON'T THEY TAKE US? WE'RE MARKED TOO"` yields: `*"Look at the ledger. Every name in it is a child's."*` |
| **Three more children's names on the mine wall (`W1D7`)** | `W1D7` | **Partial (`W2D1`–`W2D7`)** | **Yes (10/10)** | Name #2 (**Corin**, the miller's boy) is tracked all week and rescued alive in `W2D7`. Two names remain. |
| **Why did they only need a shallow cut on Tamsin's palm (`W1D7`) and Corin's palm (`W2D7`)?** | `W1D7` | **Partial (`W2D7`)** | **Yes (9/10)** | *The Verse of the Answering* reveals the rite: *"Blood beneath the dark moon — and it answers... So the faithful remember him, and give the marked blood in his name. Until the throne rise whole."* |
| **Who are the kidnappers, and why do they never speak when fighting?** | `W1D3` | **Yes (`W2D5`, `W2D7`)** | **Yes (10/10)** | Named in `W2D7` via the black circle (`W2D5`) and scorched scripture: **The Order of the Dark Moon**. |
| **Who is the nameless "him" scraped from every record (`W2D5` Meira's margin)?** | `W2D5` | **Yes (`W2D7`)** | **Yes (10/10)** | The last king at Highwall who cut his palm under the dark moon to save the world. In the `Ask` section, Garrick names him: **Malakor**. |
| **How does Garrick know Malakor's name, the Order's name, and Meira's shorthand (`W1D2`, `W2D7`)?** | `W1D2` / `W2D7` | **No (Deepened)** | **Yes** | Garrick says `"My grandmother taught me that name"` and `"My family's been in these hills longer than the roads have"`. |
| **Why did the ancient stone lock on the hillside (`W2D3`) refuse the dead thief's pick for days, yet open at once under your bare hand?** | `W2D3` | **Partial (`W2D3` Fire, `W2D7`)** | **Yes** | Campfire `2-3` debates whether it woke to the fragments or to your hand; `W2D7` reveals you are dark-moon-marked. |
| **What sat inside the empty shard-shaped sockets in the drowned mine (`W1D7`) and under the mill hill (`W2D7`)?** | `W1D7` / `W2D7` | **No (Open)** | **Yes** | Both sockets match Meira's rubbing and had their contents removed recently. |
| **The third child: the girl held with Corin who was told she was going *"somewhere warm"* (`W2D7` Cliffhanger)** | `W2D7` | **No (Open -> Week 3)** | **Yes** | Directly sets up `W3D1` (*Somewhere warm* / Wren in the burned hills). |

---

## 5. "What's Next" Moments in Week 2

1. **`W2D1` (Post-Challenge to Summary — steps 11 to 20):** 9 consecutive `"say"` cards (`~310 words`, 9 taps).
2. **`W2D3` (Post-Fight to Summary — steps 10 to 16):** 6 consecutive `"say"` cards (`~225 words`, 6 taps).
3. **`W2D4` (Post-Challenge to Summary — steps 7 to 14):** 7 consecutive `"say"` cards (`~240 words`, 7 taps).
4. **`W2D5` (Post-Fight to Summary — steps 10 to 16):** 6 consecutive `"say"` cards (`~220 words`, 6 taps).
5. **`W2D6` (Post-Choice to Summary — steps 13 to 19):** 6 consecutive `"say"` cards (`~215 words`, 6 taps).

---

## 6. Week 2 Bugs, Slips & Builder's New Text Audit (Section G)

1. **Gathering 2 (`W2D7`) United Effort Failure Continuity Bug (`src/data/gatheringScripts.ts` lines 552 vs 641):** On `ue` `won: false` (line 552), you flee up the soft stair to the lip of the old shaft in the night air and Corin is already holding the oiled-leather ledger he took from the niche as you carried him past. Two sections later (`The ledger`, line 641), the unconditional text places the party back inside the underground chamber and has Corin point to the ledger in the wall niche for the first time.
2. **`W2D5` `choice id: 0` Is `"mode": "auto"` But Controls Combat `strikeFirst` (`src/data/chapterScripts.ts` lines 2043 & 2112):** Players assigned slot 1 (`READ MEIRA'S PAGES`) lose first strike without ever making a choice.
3. **Hardcoded `"four"` in `W2D4` Campfire (`src/data/campfireDaysData.ts` lines 459 & 466):** `forkA` (`"fear four people"`) and `nudgeIfLaid` (`"four strangers at the lip"`) break non-4-player parties.

---

# Stage 3 — Week 3 (Days 1 to 7): *Wren, the Blackglass, and the Kiln*

## 1. Week 3 Score Tables

### A. Weekday Scores (`W3D1` – `W3D6`)

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | M1 | M2 | M3 | M4 | M5 | M6 | M7 | Mech avg | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Fire avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W3D1** | 9 | 8 | 9 | 9 | 9 | 9 | 9 | **8.9** | 5 | 7 | 7 | 7 | 6 | 6 | 7 | **6.4** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **7.8** | **Best:** Corin riding on `{F2}`'s shoulders repeating your names like knots, and his mother's wordless reunion at the mill. **Worst:** Both choices (`id: 0`, `id: 1`) are cosmetic forks that immediately repeat identical dialogue, and the fight (`strikeFirst: player`) has no tactical setup. |
| **W3D2** | 9 | 9 | 9 | 9 | 9 | 9 | 9 | **9.0** | 6 | 8 | 8 | 8 | 6 | 7 | 8 | **7.3** | 7 | 5 | 8 | 8 | 9 | 9 | 8 | **7.7** | **8.0** | **Best:** Wren's mother explaining how dark-moon babies in Ashcombe are given a chip of black glass before their first cry, and the dusted row of glass chips on her windowsill. **Worst:** `choice id: 0` is an `each` click-through menu (not a real fork), and Campfire `3-2` has `puzzle: null` (`C2=5`). |
| **W3D3** | 9 | 9 | 9 | 9 | 9 | 9 | 9 | **9.0** | 5 | 8 | 8 | 8 | 9 | 6 | 7 | **7.3** | 8 | 8 | 9 | 9 | 8 | 8 | 8 | **8.3** | **8.2** | **Best:** Crossing the warm rippled Blackglass with your reflection walking upside down beneath your boots, Meira's *"Five fell / Every other record says four"* margin note, and Garrick stitching your split boot while you sleep. **Worst:** `choice id: 0` (`THANK HIM` vs `HOLD UP THE MENDED BOOT`) is purely cosmetic before `*"Needed doing."*` |
| **W3D4** | 9 | 9 | 9 | 9 | 8 | 9 | 9 | **8.9** | 6 | 8 | 8 | 8 | 6 | 6 | 7 | **7.0** | 8 | 9 | 9 | 9 | 8 | 8 | 9 | **8.6** | **8.1** | **Best:** Discovering Wren is deliberately spacing and numbering her black glass chips along the trail, then sleeping in the ancient Seekers' rock-cut niches with their worn bone die. **Worst:** The builder's new `roadFind` text (`"The third chip on the trail"`) calls Wren's black glass chip `"a third twist of shaved wood"`! |
| **W3D5** | 9 | 9 | 9 | 9 | 8 | 9 | 9 | **8.9** | 9 | 8 | 9 | 8 | 6 | 9 | 9 | **8.3** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **8.4** | **Best:** Choosing `WREN'S LINE` down the steep goat-track to ambush `THE GREY COAT ON THE RIDGE` (`strikeFirst` + Agility Relic), then finding **WREN** scratched twice into the doorframe and realizing the Order ran because they saw your fire. **Worst:** The builder's `roadFind` on `WREN'S LINE` again calls her glass chips `"five more twists of shaved wood"`. |
| **W3D6** | 8 | 8 | 9 | 9 | 8 | 8 | 9 | **8.4** | 5 | 8 | 8 | 8 | 6 | 6 | 7 | **6.9** | 8 | 8 | 8 | 8 | 8 | 8 | 9 | **8.1** | **7.8** | **Best:** Reaching the cairn to see the round black hill (`The Kiln`) shimmering like a forge, and watching a single lamp climb its flank and go inside after dark. **Worst:** No `[PRESS ON]` beat (`M5=6`) and the only choice (`READ IT OUT` vs `LET {F1} READ IT`) is a cosmetic bridge before identical text. |

### B. Gathering 3 Score Table (`W3D7` — *Under the Kiln*)

| Gathering | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Gathering avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W3D7** | 9 | 10 | 9 | 10 | 9 | 9 | 10 | **9.4** | 9 | 9 | 9 | 9 | 7 | 10 | 10 | **9.0** | **9.2** | **Best:** Returning Wren's eight glass chips into her hand, opening the seamless stone case to hear *"Seeker blood,"* and interrogating a captive bound by *"the faithful shall not lie"* before every lamp goes out at once. **Worst:** `The turn` section has no interactive `turn` prompt (`G5=7`)—it is just four passive `say` cards because the `Ask` section already gave away the answers. |

### C. Week 3 UX Scores (`U1` – `U7`)

| Week | U1 (Where to go) | U2 (Screen length) | U3 (Buttons & taps) | U4 (Stats & numbers) | U5 (Party presence) | U6 (Notifications) | U7 (Mood & look) | UX avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 3** | 8 | 8 | 8 | 8 | 9 | 6 | 9 | **8.0** |

---

## 2. Week 3 Score Justifications (Highs & Lows with Quotes)

### High Scores (9–10)
- **`W3D1` `S1=9, S4=9, S5=9, S6=9, S7=9`:** The return of Corin to the mill is deeply moving and earned: *"On the walk down, riding on {F2}'s shoulders, Corin says your names over to himself, one by one, the way you would tie a knot to keep it... His mother sees him from the yard before you are halfway across the field, and the sound she makes is one none of you will forget."*
- **`W3D2` `S1=9, S2=9, S4=9, S5=9, S6=9`:** Ashcombe feels immediately distinct—warm stone underfoot, hot springs steaming in the trough, roofs weighted with heavy slabs—and Wren's mother's testimony reframes the kidnappers' psychology: *"He said they'd no wish to keep her. That they'd only need her the once... He looked me in the eye when he said it. I've been lied to by better men than him. That wasn't what this was."*
- **`W3D3` `S1=9, S2=9, S5=9, M5=9, C3=9`:** Two huge lore seeds are planted naturally in one day: first, **three children beside three Seeker marks** (`"The places Meira marked and the children in the ledger are one list"`); second, Meira's margin note on the first Seeker Fragment (*"Five, the fragment says. Every other record I can find says four. I cannot find a fifth anywhere"*). And `[PRESS ON: READ THE SCRATCHES]` (`M5=9`) gives a sharp tracker's detail: *"Six horses. One of them is carrying double, and the second rider weighs almost nothing."*
- **`W3D4` `S2=9, S4=9, C2=9, C3=9, C4=9, C7=9`:** Finding the Seekers' ancient rock-cut sleeping niches with a bone die worn smooth in a crack humanizes the ancient writers (*"They had long nights here too"*). In the evening Campfire (`C2=9, C3=9`), turning Wren's glass chips over to find she scratched `I, II, III` on the backs (`"She is laying a numbered line across the dark"`) makes the nine-year-old girl an active partner in her own rescue.
- **`W3D5` `M1=9, M3=9, M6=9, M7=9, S2=9`:** Choosing `WREN'S LINE` (`choice id: 0`, option 1) rewards the player for trusting Wren's trail of glass chips over the riders' hoof-scratches: you take the steep goat-track no horse could use, pick up five more chips, ambush `THE GREY COAT ON THE RIDGE` (`strikeFirst`), and earn a `+1 Agility` Relic. Inside the hut, the realization that **your own campfire in the Seekers' doorway the night before tipped off the Order** (*"From the doorway you can see straight back across the ridges to the one you slept under last night. They saw your fire."*) is a brilliant reversal of the hunter/hunted dynamic.
- **`W3D7` `S2=10, S4=10, S7=10, G3=9, G6=10, G7=10`:** Gathering 3 is packed with unforgettable moments:
  - **United Effort (`G3=9`):** Belaying one blade at a time up a shifting slope of loose black glass (`"like a great many plates being stacked very gently"`) to reach Wren before the slide carries her down.
  - **Emotional payoff (`S4=10`):** `[GIVE HER BACK THE EIGHT]`—putting the eight glass chips you picked up across Days 4 and 5 back into Wren's hand while Garrick wraps his coat around her.
  - **The Seamless Stone Case + *The Verse of the Fall* (`S2=10`):** When `{F1}` touches the captive's stone case and it springs open empty (`"Seeker blood"`), and you match your Fragments against *The Verse of the Fall* (*"First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours"*), the entire mythology clicks together: **Malakor is not dead—he sleeps where he fell, the players are the bloodline of the Seekers who struck him down, and the Order cannot lie** (*"A kept silence is not a lie. But it is a seam... Therefore the faithful shall not lie"*).
  - **The Interrogation (`G6=10`) & Cliffhanger (`S7=10, G7=10`):** Armed with the rule that the captive cannot lie, the 15-question `Ask` matrix lets the party extract devastating truths (*"He sleeps." "To wake him." "Already with us."*—and of the charcoal-burner's nephew from Week 1: *"Him we lost. Not by our choosing."*). And then the cliffhanger: **`"We're not finished with you."`** Every lamp in the chamber goes out at once, and when a light is struck again, his ropes are cut clean and one set of footprints leads away through the ash.

### Low Scores (5–7)
- **`W3D1` `M1=5, M6=6`:** Both choices (`KNEEL DOWN TO HIM` / `SIT ON THE STEP BESIDE HIM` and `ASK ABOUT THE FOURTH NAME` / `LOOK AT THE FOURTH ENTRY`) are builder-added forks whose branches immediately repeat the exact same multi-line dialogue word-for-word, and the dawn fight (`THE ONE WHO CAME UP AFTER YOU`) has `strikeFirst: { on: "player" }` unconditionally with no tactical setup (`M6=6`).
- **`W3D2` `M1=6, C2=5`:** `choice id: 0` (`WHO TOOK HER?` / `WHY HER?` / `WHAT DID THEY SAY?`) is `"mode": "each"` (an examine-all list, not a choice between paths), and Campfire `3-2` has `puzzle: null` (`C2=5`).
- **`W3D4` `M1=6, M6=6`:** Choosing `KEEP TO THE TRAIL` vs `GO TO THE DOORWAY` changes only whether you or `{F2}` walks the extra mile to pick up the third chip; both branches immediately converge on `THE BURIED DOORWAY` Challenge with no modifier (`M6=6`).
- **`W3D7` `G5=7`:** Unlike Gatherings 1 and 2, `The turn` section in `W3D7` (`lines 1286–1310`) has **no interactive `"t": "turn"` question card**—it is just four passive `"say"` cards ending on `*Rise.*`, because the three `sealed: true` questions in the `Ask` section just before it already revealed that Malakor sleeps and the children's blood is meant to wake him.

---

## 3. Week 3 in a Paragraph

Week 3 is the most atmospheric and emotionally resonant week of the first half of the season: the shift into the volcanic, ash-grey burned country of Ashcombe and the Blackglass gives every scene a tactile sense of heat, glass, and ancient ruin, and nine-year-old Wren—leaving a numbered trail of black glass chips (`I, II, III`) down a goat-track and scratching her name twice into the shepherd's doorframe—is a child the whole party genuinely cares about saving. **Its best moment** is the second half of Gathering 3 (`W3D7`): putting Wren's eight glass chips back into her hand, watching the captive's seamless Seeker case spring open at `{F1}`'s touch (*"Seeker blood"*), reading *The Verse of the Fall* to learn that **the faithful cannot lie**, and then interrogating the kneeling captive before every lamp in the Kiln goes out at once and someone cuts his ropes in pitch darkness. **Its worst moment** is an immersion-breaking continuity blunder in the builder's newly written `roadFind` clues on `W3D4` and `W3D5`, where the builder misread Wren's *"chips"* (which are chips of black volcanic glass from Ashcombe) as *"twists of shaved wood"*!

---

## 4. Open-Threads Ledger (End of Week 3)

| Thread / Clue / Promise / Fork | Opened | Paid Off in Week 3? | Legible to Player? | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **The third child taken *"somewhere warm"* (`W2D7`)** | `W2D7` | **Yes (`W3D1`–`W3D7`)** | **Yes (10/10)** | Identified as **Wren** of Ashcombe (`W3D1`), tracked by her black glass chips (`W3D2`–`W3D5`), and rescued alive (with a bandaged palm cut) in the Kiln (`W3D7`). |
| **Why did ancient stone locks (`W2D3`, `W3D3`, `W3D4`) open only for your bare hands?** | `W2D3` | **Yes (`W3D7`)** | **Yes (10/10)** | *The Verse of the Fall* + the captive's stone case reveal: *"And the Seekers hid their work, and set their own blood as the lock upon every way they left behind, so that no hand but their children's could ever open it."* **You are Seeker blood.** |
| **Why did the Order tell Wren's mother *"they'd only need her the once"* (`W3D2`)—and why did she believe they weren't lying?** | `W3D2` | **Yes (`W3D7`)** | **Yes (10/10)** | BecauseMalakor's fall came through a kept silence, the Order's highest commandment is: **"Therefore the faithful shall not lie. Speak true, always. Hide inside the truth."** And once a child has given blood once, they let the child go (`"She has given. She may go."`). |
| **What happened to the charcoal-burner's nephew taken two winters ago (`W1D5`) if the Order lets children go?** | `W1D5` | **Partial (`W3D7` Ask)** | **Yes (9/10)** | Asking the captive `"THE OTHERS YOU TOOK, BEFORE"` yields: `*"Most went home." ... "Him we lost. Not by our choosing."*` (Opens a deeper question: *how* did they lose him?) |
| **Why is the Order bleeding dark-moon-marked children across generations (`W1D7`, `W2D7`)?** | `W1D7` / `W2D7` | **Yes (`W3D7`)** | **Yes (10/10)** | Malakor is not dead; **he sleeps where he fell**, and they are giving marked blood in his name **to wake him** (*"Until the throne rise whole"*). |
| **Why do the places Meira marked (`Widow's Tooth`, `Mill`, `Blackglass`) match the homes of the children in the ledger (`W3D3`)?** | `W3D3` | **Partial (`W3D3`, `W3D7`)** | **Yes** | Every taken child lived beside an ancient Seeker mark/socket; in each underground chamber (`W1D7`, `W2D7`, `W3D7`), a robed figure has just lifted something small out of that socket in a box (`W3D7` Arrival: *"a robed figure hauling himself away up a vent in the rock... a small box clutched to his chest"*). |
| **Meira's margin note (`W3D3`): *"Five, the fragment says. Every other record I can find says four. I cannot find a fifth anywhere."*** | `W3D3` | **No (Open)** | **Yes (9/10)** | Major mid-season mystery seed: why does the first Seeker Fragment say *"Five fell"* when every other record says four? |
| **Garrick mending your split boot while you sleep with a cobbler's stitch (`W3D3`), knowing the shepherds' forks (`W3D2`), and pouring the extra cup (`W3D4`)** | `W1D2` / `W3D3` | **No (Deepened)** | **Yes** | In `W3D7` Ask, asking the captive `"DO YOU KNOW THIS MAN?"` (of Garrick) under the no-lie rule yields: `*"No."*` |
| **The fourth child in the ledger (`W3D1` *"a place far to the north"*; `W3D7` Ask: *"Already with us"*)** | `W3D1` / `W3D7` | **No (Open -> Week 4)** | **Yes** | Directly sets up Week 4's journey north to Reedham. |
| **Who snuffed all the lamps in the Kiln at once and cut the captive's ropes in pitch darkness (`W3D7` Cliffhanger)?** | `W3D7` | **No (Open -> `W4D1`)** | **Yes (10/10)** | Directly sets up `W4D1` (*Not finished*). |

---

## 5. "What's Next" Moments in Week 3

1. **`W3D1` (Post-Fight to Summary — steps 10 to 18):** 8 consecutive `"say"` cards + 1 `notice` (`~340 words`, 8 taps) from the dawn fight through following the cart tracks west, carrying Corin on `{F2}`'s shoulders, the reunion with his mother at the mill, the wayside shrine Fragment, and the pull line.
2. **`W3D2` (Post-Menu to Summary — steps 9 to 17):** 9 consecutive `"say"` cards (`~345 words`, 9 taps) from the row of glass chips on the sill through the boy at the well, the empty cart below the black road, Garrick's comment on the shepherds' fork, the warm pound-wall stones, the cold Fragment, and the pull line.
3. **`W3D3` (Post-Challenge to Press On — steps 6 to 11):** 6 consecutive `"say"` cards (`~235 words`, 6 taps) from crossing the Blackglass through Garrick rubbing his knees, finding the Seeker mark and housing, realizing *"Three children. Three marks,"* and spotting the hoof-scratches.
4. **`W3D4` (Post-Challenge to Summary — steps 8 to 14):** 7 consecutive `"say"` cards (`~280 words`, 7 taps) exploring the Seekers' rock-cut sleeping niches, the bone die, the 4th Fragment, spotting the smoke of the shepherd's hut, sleeping in the doorway, and the pull line.
5. **`W3D5` (Post-Menu to Summary — steps 11 to 17):** 7 consecutive `"say"` cards (`~165 words`, 7 taps) realizing the Order ran because they saw your fire in the Seekers' doorway, finding the 5th Fragment under the hearthstone, and looking up toward the cairn.

---

## 6. Week 3 Bugs, Slips & Builder's New Text Audit (Section G)

### A. Major Continuity Bug in Builder's New Text (`W3D4` & `W3D5` `roadFind` Clues)
- **What happened (`src/data/chapterScripts.ts` lines 2944 & 3071; `scripts/gen-chapter-scripts.cjs` lines 239 & 252):**
  - Throughout Week 3 (`W3D2` to `W3D7`), Wren carries and drops **chips of black volcanic glass** from the Blackglass hill (`"a chip of black glass, worn smooth by a thumb"`, `"three of Wren's chips"`, `"eight of Wren's chips"`).
  - When the builder wrote the `FORK_BRANCH_META` entries for `W3D4` and `W3D5`, they saw the word `"chip"` in the chapter text (`"find a third chip"`, `"find five more of them"`) without checking `W3D2`, and assumed `"chip"` meant a **wood shaving**!
  - As a result, `W3D4` `roadFind` (`"The third chip on the trail"`, line 2944) reads:
    > `"Following the hoof-scratches a mile past the buried doorway, you found a third twist of shaved wood dropped where the riders never looked back."`
  - And `W3D5` `roadFind` (`"Five chips on the goat-track"`, line 3071) reads:
    > `"Down the steep goat-track where no horse could go, five more twists of shaved wood marked the path Wren walked on her own feet."`
  - **Impact:** Directly contradicts the chapter prose on the very same screen and the Campfire puzzle on `W3D4` (`"Each chip was set on high bare rock where the starlight catches it, and the backs are scored with tiny knife-scratches"`).

### B. Other Week 3 Slips & Builder Text Notes
1. **Copy-paste convergence in `W3D1` (`id: 0`, `id: 1`), `W3D3` (`id: 0`), and `W3D6` (`id: 0`):** Just like in Weeks 1 and 2, the builder's social forks on `W3D1` (kneeling vs sitting beside Corin; asking about the 4th name vs tracing the drier ink) and `W3D3` (thanking Garrick vs holding up the mended boot) paste the exact same multi-sentence dialogue into both branches.
2. **Missing interactive `turn` node in `W3D7` (`src/data/gatheringScripts.ts` lines 1286–1310):** `The turn` section in Gathering 3 has no `"t": "turn"` question card—only four passive `"t": "say"` cards—because the `Ask` section is placed *before* `The turn` in `W3D7` (whereas in `W2D7`, `The turn` came *before* `Ask`).


---

# Stage 4 — Week 4 (Days 1 to 7): *Joss, the Stillwater, and the Four Stones*

## 1. Week 4 Score Tables

### A. Weekday Scores (`W4D1` – `W4D6`)

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | M1 | M2 | M3 | M4 | M5 | M6 | M7 | Mech avg | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Fire avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W4D1** | 9 | 9 | 9 | 9 | 9 | 9 | 9 | **9.0** | 8 | 8 | 8 | 8 | 9 | 8 | 9 | **8.3** | 8 | 8 | 9 | 9 | 8 | 8 | 8 | **8.3** | **8.5** | **Best:** Carrying Wren up to the cool air first (`+1 Aim` Relic), `[FOLLOW THEM]` finding the prints end on bare black glass where the rescuer waited, and Wren's mother kneeling in the road outside Ashcombe. **Worst:** A 5-card passive stretch between the crack Fragment and the end of the day. |
| **W4D2** | 8 | 9 | 9 | 8 | 9 | 8 | 9 | **8.6** | 3 | 8 | 7 | 7 | 6 | 6 | 8 | **6.4** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **7.7** | **Best:** The hungry ford bandits who apologize when beaten, the carter describing four armed riders guarding one small bread-crock box, and the coin with Malakor's face scraped off. **Worst:** Zero `choice` nodes (`M1=3`)—the road fork at the ford (`{F1} and {F3} take the lake road. You take the other`) happens automatically without letting the player pick! |
| **W4D3** | 9 | 9 | 9 | 9 | 9 | 9 | 9 | **9.0** | 5 | 8 | 8 | 8 | 6 | 6 | 8 | **7.0** | 7 | 5 | 8 | 8 | 9 | 9 | 8 | **7.7** | **7.9** | **Best:** Eight kitchen-knife notches in Joss's grandmother's doorpost, the lamp burning in her window at noon for a dark-moon child, and Garrick bailing the leaky skiff with a tin cup. **Worst:** Only an `each` examine-both menu (`THE SHELF` / `THE WINDOW`) with no mutually exclusive choice (`M1=5`), and no two-piece Campfire puzzle (`C2=5`). |
| **W4D4** | 9 | 9 | 9 | 9 | 8 | 9 | 9 | **8.9** | 3 | 8 | 8 | 8 | 10 | 7 | 8 | **7.4** | 8 | 8 | 9 | 9 | 8 | 8 | 8 | **8.3** | **8.2** | **Best:** `[PRESS ON: THE SMALL PRINTS]` (`M5=10`)—standing where Joss dug his heels into the drowned lane and seeing his grandmother's window lamp burning on shore, plus Meira's *"moon-blood"* note. **Worst:** Zero `choice` nodes in the entire chapter (`M1=3`). |
| **W4D5** | 9 | 8 | 9 | 9 | 8 | 9 | 9 | **8.7** | 3 | 8 | 8 | 8 | 6 | 8 | 8 | **7.0** | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8.0** | **7.9** | **Best:** Navigating the white fog (`THE FOG` Challenge) to earn first strike, capturing the Order's black-circle ferry boat, and finding Joss's fresh wood curls and split toy hull inside. **Worst:** Zero `choice` nodes in the entire chapter (`M1=3`) and no `[PRESS ON]` (`M5=6`). |
| **W4D6** | 9 | 9 | 9 | 9 | 8 | 9 | 10 | **9.0** | 3 | 8 | 8 | 8 | 6 | 6 | 7 | **6.6** | 7 | 5 | 9 | 9 | 9 | 9 | 9 | **8.1** | **7.9** | **Best:** The gust taking the lamp in the bell chamber, followed immediately by wood knocking on wood in the black water directly beneath the tower—someone was floating under you listening to the map being read aloud. **Worst:** Zero `choice` nodes (`M1=3`, not even the usual Day 6 `"READ IT OUT / LET {F1} READ IT"` fork) and `puzzle: null` at the Campfire (`C2=5`). |

### B. Gathering 4 Score Table (`W4D7` — *The Drowned Undercroft*)

| Gathering | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Gathering avg | Overall | One line: best / worst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **W4D7** | 9 | 10 | 10 | 10 | 9 | 9 | 10 | **9.6** | 9 | 9 | 10 | 10 | 10 | 10 | 10 | **9.7** | **9.6** | **Best:** The highest-stakes Gathering in the game: freeing the pinned Order member under water (`THE WATER-GATE`) to unlock three waves of live interrogation, finding Meira's brass pen (*"Is she dead?" "Yes."*), discovering the fifth Stone (*"What the four begin, the fifth shall end—"*), and the dawn freezing grey as a slow heartbeat sounds from the north. **Worst:** A slight logical blur in the Turn's wording (*"through a door that only your blood could open"*) when the Order actually used your Seeker blood to open the *map housings* and overheard you read the maps aloud. |

### C. Week 4 UX Scores (`U1` – `U7`)

| Week | U1 (Where to go) | U2 (Screen length) | U3 (Buttons & taps) | U4 (Stats & numbers) | U5 (Party presence) | U6 (Notifications) | U7 (Mood & look) | UX avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 4** | 8 | 8 | 7 | 8 | 8 | 6 | 9 | **7.7** |

---

## 2. Week 4 Score Justifications (Highs & Lows with Quotes)

### High Scores (9–10)
- **`W4D1` `S1=9, S4=9, M5=9, M7=9`:** Choosing `TAKE WREN UP FIRST` (`choice id: 0`, option 1) rewards putting the traumatized child ahead of the investigation: `{F1}` guards the ash so you lose nothing, and your care earns a `+1 Aim` Relic. `[PRESS ON: FOLLOW THEM]` (`M5=9`) delivers a locked-room chiller: *"You follow them with the lamp held low until the ash thins to a grey breath on the floor, and the rock turns to bare black glass. There they end... No prints come in. Whoever cut him loose came over the glass, and was waiting there before the lamps went out."* And Garrick's quiet observation (`S5=9`) plants a major seed: *"Every time they've had knives out at you, not one of you has died."*
- **`W4D3` `S1=9, S4=9, S5=9, S6=9`:** Reedham and Joss's grandmother are drawn with aching economy: *"After that she only stands, with her hand on the doorpost. Under her fingers are notches, cut with a kitchen knife, fresh and pale in the old wood. One for every night. Eight."* Her Agility Notice (*"She crosses the room without once passing in front of the window. She will not put herself between that lamp and the lake"*) and Garrick bailing with his tin cup (`"I didn't leave a warm bar to drown in a lake. I'd like that noted."`) are top-tier writing.
- **`W4D4` `M5=10, S4=9, S6=9`:** The single best `[PRESS ON]` beat in the entire game (`THE SMALL PRINTS`, `M5=10`):
  > *"In one place the small prints stop, and turn, with both heels dug in. Stand where he stood. From here, and from nowhere else in the lane, you can see one window on the shore with a lamp in it."*
  It connects directly back to the grandmother's noon lamp on `W4D3` and forward to the evening Campfire fan-out clue (`C3=9`).
- **`W4D6` `S7=10, C3=9, C4=9, C7=9`:** The ending of `W4D6` solves a four-week mystery (how does the Order always reach the chamber at the end of the Seeker map just ahead of you?) in a single visceral sound cue:
  > *"Then a gust takes the lamp. And in the dark, close, so close that it must have been lying in the black water right under the tower: wood knocks on wood. Then oars. Not careful now. Pulling hard, away from you, toward the drowned village. Somebody was beneath you, and heard every word."*
- **`W4D7` `S2=10, S3=10, S4=10, S7=10, G3=10, G4=10, G5=10, G6=10, G7=10`:** Gathering 4 is the dramatic peak of the mid-season (**9.6/10**):
  - **United Effort (`G3=10, G4=10`):** Holding your breath underwater to work a single iron pin out of the jammed water-gate groove before the pinned Order member drowns. Winning or losing has a massive, non-cosmetic consequence: if you fail (`won: false`), he is pulled up unconscious (`"Whatever he could have told you, he will not tell it tonight"`) and **all three `Ask` interrogation blocks in the Gathering are locked out**.
  - **The Turn (`G5=10`):** *The Verse of the Four* reveals why the sockets were empty and why the Order never killed you on the road: *"Where the Seekers' children walk, the faithful follow, closer to them than their own shadows. Where a shard is uncovered, a marked child is brought to it, and the shard drinks, and wakes, and is carried home to him."*
  - **Meira's Pen (`S4=10, G6=10`):** Finding her brass pen stained with brown ink in the waxed pouch and asking the truth-bound captive `"IS SHE DEAD?"` -> `*"Yes."*` `"DID YOUR PEOPLE KILL HER?"` -> `*"Yes."*`
  - **The Torn Page & Cliffhanger (`S2=10, S7=10, G7=10`):** Discovering that Meira's Week 3 Blackglass footnote (*"Five, the fragment says..."*) was right all along—**"The fifth heeds no element at all, but blood alone, and remembers whose. What the four begin, the fifth shall end—"**—followed by the sunrise stopping grey over the Stillwater as two slow, enormous heartbeats shake the lake from the north.

### Low Scores (3–5)
- **`W4D2`, `W4D4`, `W4D5`, `W4D6` `M1=3`:** Four of the six weekdays in Week 4 have **zero `choice` nodes** in `src/data/chapterScripts.ts`. On `W4D2` (`line 3639`), the text literally narrates a road fork—*"Beyond the ford the road forks. {F1} and {F3} take the lake road, the one to Reedham. You take the other."*—without giving the player a button to choose which fork to take! And on `W4D6` (`line 4212`), unlike `W1D6`, `W2D6`, and `W3D6`, there isn't even a `"READ IT OUT / LET {F1} READ IT"` choice node.
- **`W4D3` `C2=5` and `W4D6` `C2=5`:** Week 4 has **two** quiet Campfires (`4-3` and `4-6`) with `puzzle: null` and `clicks: []`, meaning two of the six evenings in Week 4 have no two-piece clue combination puzzle.

---

## 3. Week 4 in a Paragraph

Week 4 is a tale of two halves: its narrative architecture, emotional beats (Wren's reunion at Ashcombe, Joss's grandmother's lamp in the window, Joss digging his heels into the drowned street to look back at that lamp, and the eerie fog and black water of the Stillwater) and its explosive Gathering (`W4D7`, **9.6/10**) are the best writing in the game so far; yet mechanically, **Days 2, 3, 4, 5, and 6 were completely skipped by `migration 0111`'s fork pass**, leaving five consecutive weekdays without a single mutually exclusive `mode: 'pick'` choice. **Its best moment** is the cascade of revelations in Gathering 4 (`W4D7`): realizing the Order has been shadowing you all season because only your Seeker blood could unlock the maps to the four Stones, finding Meira's brass pen and confirming her murder under the Order's no-lie rule, reading the burned page about the **fifth Stone** (*"What the four begin, the fifth shall end—"*), and coming up onto the lake at dawn as the sunrise stops halfway and Malakor's heartbeat sounds from the north. **Its worst moment** is `W4D2` (`line 3639`), where the party reaches a literal fork in the road (*"Beyond the ford the road forks"*) and the prose simply assigns you a road without a choice button.

---

## 4. Open-Threads Ledger (End of Week 4)

| Thread / Clue / Promise / Fork | Opened | Paid Off in Week 4? | Legible to Player? | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Who snuffed the lamps in the Kiln and cut the captive's ropes in pitch darkness—and why didn't they kill us (`W3D7`)?** | `W3D7` | **Yes (`W4D1`, `W4D7`)** | **Yes (10/10)** | `W4D1` shows a second person waited on the bare black glass and cut only rope; `W4D7` (*The Verse of the Four*) reveals **why** the Order has kept you alive all season: they needed your Seeker blood to open the ways! |
| **The fourth child in the ledger (`W3D1`, `W3D7`)** | `W3D1` | **Yes (`W4D1`–`W4D7`)** | **Yes (10/10)** | Identified as **Joss** of Reedham (`W4D1`), tracked across the drowned village and reed island (`W4D3`–`W4D6`), and rescued alive in the flooded undercroft (`W4D7`). All four children are now safe! |
| **What sat in the four empty wall sockets (`W1D7`–`W4D7`), and what was in the small boxes (`W3D7`, `W4D2`)?** | `W1D7` | **Yes (`W4D7`)** | **Yes (10/10)** | **The four elemental Stones (shards of the broken moon).** Each socket held one; a marked child's blood woke each shard, and the Order carried all four north to Malakor in those small boxes. |
| **How did the Order always reach the chamber at the end of each week's Seeker map just ahead of the party?** | `W1D7` | **Yes (`W4D6`, `W4D7`)** | **Yes (10/10)** | They shadowed you (`"Where the Seekers' children walk, the faithful follow"`) and listened as you read each assembled map aloud (confirmed on `W4D6` when the boat hidden under the bell tower rows away the instant `{F1}` finishes reading the map). |
| **What happened to Meira (`W1D2`)?** | `W1D2` | **Yes (`W4D7`)** | **Yes (10/10)** | Her brass pen is found in the captive's waxed pouch (`W4D7` *The pen*); under the no-lie commandment, the captive confirms **she is dead and the Order killed her** when they took her pages. |
| **Meira's Blackglass footnote (`W3D3`): *"Five, the fragment says. Every other record I can find says four."*** | `W3D3` | **Yes (`W4D7`)** | **Yes (10/10)** | Paid off by the burned torn page in `W4D7`: **"Four were given to the wind, the water, the fire, and the earth... The fifth heeds no element at all, but blood alone, and remembers whose. What the four begin, the fifth shall end—"** |
| **How does the torn page end (`"What the four begin, the fifth shall end—"`)? Will the fifth Stone stop Malakor, or finish waking him?** | `W4D7` | **No (Open -> Week 5)** | **Yes (10/10)** | When asked `"WILL THE FIFTH STOP HIM?"`, the captive opens his mouth, closes it, and says nothing; Garrick says `"I won't promise you that."` |
| **Where is Malakor sleeping, and where is the fifth Stone (`W4D7` Cliffhanger)?** | `W4D7` | **No (Open -> Week 5)** | **Yes (10/10)** | The dawn freezes grey and a slow, enormous heartbeat sounds from far to the north (Highwall). |
| **Why did the charcoal-burner's nephew (`W1D5`) die two winters ago (`"Him we lost. Not by our choosing"`, repeated in `W3D7` and `W4D7`)?** | `W1D5` / `W3D7` | **No (Open)** | **Yes** | Repeated verbatim in `W4D7`'s `Ask` block—still an open mystery why that boy was lost. |
| **Who is the unseen leader of the Order (`"One whose face I've never seen"`, `W3D7` & `W4D7` Ask), and why does Garrick pour the extra cup (`W4D2`)?** | `W1D2` / `W3D7` | **No (Open)** | **Yes** | Both captives swear under the no-lie rule that they do not know Garrick (`"No"`) and have never seen their leader's face. |

---

## 5. "What's Next" Moments in Week 4

1. **`W4D1` (Post-Press On to Summary — steps 12 to 18):** 7 consecutive `"say"` cards (`~340 words`, 7 taps) bringing Wren out of the Kiln, finding the Fragment at the edge of the burned country, the emotional reunion with her mother outside Ashcombe, opening the ledger to *Joss — Reedham*, and the pull line.
2. **`W4D2` (Post-Challenge to Summary — steps 12 to 18):** 7 consecutive `"say"` cards (`~265 words`, 7 taps) where the carter describes the bread-crock box, gives you the scraped coin, you connect the box to the Kiln vent, Garrick passes his flask and pours the extra cup by the dry-stone wall, and the pull line.
3. **`W4D4` (Post-Press On to Summary — steps 10 to 15):** 6 consecutive `"say"` cards (`~205 words`, 6 taps) opening the market-cross housing for the 4th Fragment, drying off by Garrick's shingle fire, reading Meira's *"moon-blood"* note, and looking out toward the reed island.
4. **`W4D5` (Post-Fight to Summary — steps 9 to 16):** 7 consecutive `"say"` cards + 1 `notice` (`~245 words`, 8 taps) after taking the Order's boat—inspecting Joss's wood curls and split toy hull, finding the willow-root Fragment, and watching the lamp move toward the drowned tower at dusk.
5. **`W4D6` (Post-Challenge to Summary — steps 9 to 14):** 6 consecutive `"say"` cards (`~150 words`, 6 taps) from reading the map to the drowned church undercroft, the gust blowing out the lamp, the boat knocking against the tower wall below, and racing down the stair.

---

## 6. Week 4 Bugs, Slips & Builder's New Text Audit (Section G)

### A. Coverage Gap in Builder's New Forks (`W4D2` – `W4D6`)
- In `scripts/gen-chapter-scripts.cjs` (`FORK_BRANCH_META`), **only `W4D1` (`choice id: 0`: `READ THE ASH` vs `TAKE WREN UP FIRST`) was given a `mode: 'pick'` fork in Week 4**.
- **`W4D2`, `W4D4`, `W4D5`, and `W4D6` have zero `choice` nodes of any kind**, and `W4D3` has only a 2-item `"mode": "each"` examine list (`THE SHELF` / `THE WINDOW`).
- This is most jarring on **`W4D2` (`line 3639`)**, where the party reaches a fork in the road (`"Beyond the ford the road forks. {F1} and {F3} take the lake road, the one to Reedham. You take the other."`) and on **`W4D6` (`line 4212`)**, where `{F1}` reads the assembled map without the usual Day 6 `"READ IT OUT / LET {F1} READ IT"` choice.

### B. Minor Wording Blur in `W4D7` Turn Answer (`src/data/gatheringScripts.ts` line 1678)
- The Turn question asks: `*Every socket was empty. Where did they go?*` and the answer reads: `"Carried home to him. Every one, through a door that only your blood could open."`
- **Nuance:** In Weeks 1–4, your Seeker blood opened the **six Fragment housings** that formed each week's map (and the Order eavesdropped when you read each map aloud on Day 6), whereas the underground chambers themselves were entered via an open river mine (`W1D7`), a pick-dug tunnel (`W2D7`), an open volcanic crack (`W3D7`), and a flooded church stair (`W4D7`). Calling them *"a door that only your blood could open"* is slightly metaphorical (the maps were the "way/door"), though the underlying twist (*"Where the Seekers' children walk, the faithful follow"*) lands with huge force.


---

# Stage 5 — Week 5 (Days 1 to 7): *Highwall*

### 1. Week 5 Score Table

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | M1 | M2 | M3 | M4 | M5 | M6 | M7 | C1 | C2 | C3 | C4 | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **W5D1** | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 5 | 8 | 7 | 7 | 7 | 6 | 8 | 8 | 8 | 8 | 8 | - | - | - | - | - | - | - | **7.9** |
| **W5D2** | 9 | 8 | 8 | 9 | 9 | 8 | 9 | 8 | 8 | 8 | 7 | 6 | 8 | 8 | 8 | 8 | 8 | 8 | - | - | - | - | - | - | - | **8.1** |
| **W5D3** | 9 | 9 | 8 | 9 | 9 | 8 | 8 | 3 | 8 | 8 | 7 | 9 | 5 | 8 | 8 | 8 | 8 | 8 | - | - | - | - | - | - | - | **7.8** |
| **W5D4** | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 5 | 8 | 7 | - | - | - | - | - | - | - | **8.3** |
| **W5D5** | 9 | 9 | 8 | 9 | 9 | 8 | 9 | 3 | 8 | 7 | 7 | 6 | 5 | 9 | 8 | 8 | 8 | 8 | - | - | - | - | - | - | - | **7.7** |
| **W5D6** | 9 | 9 | 8 | 9 | 8 | 8 | 9 | 3 | 8 | 7 | 8 | 6 | 4 | 9 | 8 | 8 | 8 | 8 | - | - | - | - | - | - | - | **7.6** |
| **W5D7** | 9 | 10 | 9 | 10 | 9 | 9 | 10 | - | - | - | - | - | - | - | - | - | - | - | 8 | 9 | 10 | 9 | 9 | 5 | 10 | **9.0** |
| **Avg** | **9.0** | **9.0** | **8.4** | **9.1** | **8.9** | **8.3** | **9.0** | **5.0** | **8.0** | **7.5** | **7.3** | **7.2** | **6.2** | **8.3** | **8.0** | **7.5** | **8.0** | **7.8** | **8.0** | **9.0** | **10.0** | **9.0** | **9.0** | **5.0** | **10.0** | **8.1** |

| Week UX Row | U1 | U2 | U3 | U4 | U5 | U6 | Avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 5 UX** | 8 (code) | 8 (code) | 8 (code) | 8 (code) | 9 (code) | 8 (code) | **8.2** |

---

### 2. Score Justifications (Every Score Below 6 and Every 9 or 10)

- **W5D1 (`S1=9, S2=9, S3=9, S4=9, S5=9, S7=9` | `M1=5, M6=6`):**
  - *Why 9s on Story:* The cold, pewter-grey morning on Lake Stillwater is unforgettable. Halfway back to the north jetty, a single slow heartbeat presses up through the soles of your boots (`"Something very deep under the water moves—one slow beat, and then nothing. Nobody speaks of it"`). Returning Joss to his grandmother (`"She doesn't thank you. She pulls him against her apron, looks once at the dark water, and shuts the door"`), watching Garrick give Joss his own bowl of broth first, and discovering `HIGHWALL` above a chiselled-out second line on the waystone set an extraordinary tone for Week 5.
  - *Why `M1=5, M6=6`:* `choice id: 0` (`ASK GARRICK WHERE A FIFTH WOULD BE` vs `LOOK NORTH ALONG THE ROAD`, `src/data/chapterScripts.ts` lines 4312–4325) is `mode: "pick"`, gives one sentence of flavor, and immediately converges on Garrick saying the exact same speech (`"The fifth wasn't hidden in the hills like the others"`).
- **W5D2 (`S1=9, S4=9, S5=9, S7=9`):**
  - *Why 9s:* Everything on the northern road feels cursed in a quiet, believable way: the fleeing farmer whose six-year-old family dog looked at his son `"like she didn't know him"`, the hundreds of straight war-grave mounds where a single mound was dug open with a spade this week, and the heartbreaking end of the fight with `WHAT WAS A FARM DOG` (`"The one you beat is the last to go. It looks back at you from the edge of the dark and wags its tail, once, as if asking what it has done"`). Better still, `choice id: 1` (`CAMP AT THE HEAD OF THE ROWS` vs `CAMP ON THE OPEN ROAD`) is a genuine unspoiled tactical fork (`M1=8, M6=8`) where camping on the open road gives you sightlines to spot the pack coming and grants `strikeFirst`.
- **W5D3 (`S1=9, S2=9, S4=9, S5=9, M5=9` | `M1=3, M6=5`):**
  - *Why 9s:* Highwall rising out of bare rock where even the moss stops a mile back, the gate barred from the inside with fresh pale timber in iron brackets worn bright, and `[PRESS ON: GO DOWN TO IT]` (`M5=9`), where dropping into the dark courtyard reveals dozens of old gate-bars stacked against the wall (`"The lowest is rotted to a brown line. The topmost still has bark on its edge. Whoever changes the bar has kept every one"`).
  - *Why `M1=3, M6=5`:* **Zero `choice` nodes in the entire chapter (`choices: []`).**
- **W5D4 (`S1=9, S2=9, S3=9, S4=9, S5=9, S6=9, S7=9, M5=9, M6=9` | `C2=5`):**
  - *Why 9s:* The best weekday of Week 5. Walking down an avenue of Malakor's armoured soldiers frozen mid-stride in open doorways since the night he fell (`"Nobody has moved them. Nobody has taken their swords"`), risking `[PRESS ON: STOP BESIDE ONE]` (`"Its left foot is forward, the heel just lifted... They all stopped on the same step"`), and looking back from the top of the street to see the nearest helm turned slightly further toward you is top-tier dread. In the shuttered room above, `choice id: 0` (`"WHAT ARE THEY?"`, `"WHO IS THE CUP FOR?"`, `SAY NOTHING`) is a real 3-way fork (`M1=8, M6=9`) where `"WHAT ARE THEY?"` connects the soldiers to the Kiln page and awards a persistent `+1 Intellect` Relic, and `"WHO IS THE CUP FOR?"` catches Garrick setting a cup of water on the sill facing the great hall (`"My family's waited a long time for something. I'd like to live to see it"`).
  - *Why `C2=5`:* Campfire `5-4` has `puzzle: null`. Also note a small Campfire text bug on `5-4` (`C4=7`): `opener` is `null`, and `narratedSilence` (`src/data/campfireDaysData.ts` line 1123) includes spoken dialogue from Garrick (`"Family habit. We always pour one for whoever can't be with us."`) inside a field meant for silent narration.
- **W5D5 (`S1=9, S2=9, S4=9, S5=9, S7=9, M7=9` | `M1=3, M6=5`):**
  - *Why 9s:* Crawling to the roof edge above the windowless great hall and realizing that the three iron bars across the doors are rusted into their sockets **from the outside** (`"The doors are barred to keep something in"`), while the Order's greybeard watchman crosses off one chalk stroke at dusk (`"eight strokes are left"`) and Fragment 5 warns: *"Do not open what we have shut. When five are brought, the vigil ends."*
  - *Why `M1=3, M6=5`:* **Zero `choice` nodes in `W5D5` (`choices: []`).**
- **W5D6 (`S1=9, S2=9, S4=9, S7=9, M7=9` | `M1=3, M6=4`):**
  - *Why 9s:* Two superb payoffs: (1) when the 6 fragments assemble into a map of Highwall on the parapet, the party remembers how they were overheard under the tower on `W4D6`—*"Nobody reads it out. It goes from hand to hand along the parapet"* (`S4=9`); and (2) the map points not to the great hall, but to a dry seam in the outer wall twenty paces from where you climbed over on Day 3 (`"We stood on top of it"`).
  - *Why `M1=3, M6=4`:* **`choice id: 0` (`POST {F1}`, `POST {F2}`, `POST {F3}`, `src/data/chapterScripts.ts` line 5081) is broken:** it has `"mode": "flavor"` and `"branches": []`, and two paragraphs later (`lines 5093` and `5163`) the script hardcodes `"{F1} crouches at the corner of the gate-tower"` and `"{F1} comes last of all"` even if the player clicked `POST {F2}` or `POST {F3}`!
- **W5D7 — Gathering 5 (`S2=10, S4=10, S7=10, G3=10, G7=10` and `S1=9, S3=9, S5=9, S6=9, G2=9, G4=9, G5=9` | `G6=5`):**
  - *Why 10s and 9s:* Gathering 5 is a masterclass in tension and reversal:
    - **The Battle (`THE HOLLOWED`, `G2=9`):** The armoured soldiers from `W5D4` come marching down the street toward the sound of iron (`"You cut one, and it does not bleed. You knock its helm off, and there is nothing inside the mail but dark and a smell of old ash"`).
    - **United Effort (`G3=10, G4=9`):** The Order's horn sounds on the hill and the watch-post call (`"Keep the dark"` -> `"It keeps us"`) comes down the wall. Every friend has to take a dead watchman's post in the wind and answer in a flat voice (`Agility`, `Charm`, `Intellect`, `Craft`) so the lanterns on the hill stop coming down. Winning lets you hear the old watchman's dying prayer (`"Until the throne rise whole"`) and unlocks a conditional second Fragment Match (`line 2160`, `cond: { on: "ue", won: true }`).
    - **The Attempt & The Turn (`S2=10, S4=10`):** You lift the fifth Stone from its grey wool, press `[OPEN YOUR PALM]`, hold your bleeding hands over it—and **nothing happens** (`"your blood runs off it like rain off glass"`). Immediately after, Garrick binds your cut palms in **"the same neat white linen you've seen on every child you've saved"** (`line 2145`), and the wall inscription reveals why the Stone stayed cold: `"Where he fell, under the dark moon, the five were joined." Not here. Not now.`
    - **Cliffhanger (`S7=10, G7=10`):** Looking down from the slit window at the square (`"Seven strokes left on the tally... We're early"`), a fresh watchman crosses off tonight's stroke at the board, turns with his lantern raised, and looks straight down the hill at your wall.
  - *Why `G6=5`:* `W5D7` has **no `Ask` section at all** (`The turn` follows directly after `Match`; the dying watchman expires on `"Until the throne rise whole"` before the party can question him).

---

### 3. Week 5 Summary Paragraph

Week 5 (*Highwall*) is the atmospheric and structural peak of the season before the finale. The slow escalation from the single heartbeat under Lake Stillwater (`W5D1`) and the farm dog wagging its tail in the dark after attacking you (`W5D2`) to the dead city of Highwall—with its chronological stack of replaced gate-bars (`W5D3`), its street of frozen Hollowed soldiers (`W5D4`), and the revelation that the Order's iron bars on the great hall are keeping something *in* (`W5D5`)—makes the player feel the weight of centuries. Better still, Gathering 5 (`W5D7`, **9.0**) pulls the rug out from under the four-week formula at the exact right moment: when you finally cut your palms over the fifth Stone and your blood runs off it like rain off glass while Garrick wraps your hands in the same neat white linen used to bind the four children, every suspicious detail from Weeks 1 to 5 snaps into focus. Only three mechanical blemishes hold the weekdays back: `W5D3` and `W5D5` have zero choice nodes (`M1=3`), and `W5D6` has a broken `"mode": "flavor"` choice (`POST {F1}` / `POST {F2}` / `POST {F3}`) that ignores your button press and hardcodes `{F1}` as the lookout anyway.

---

### 4. Open-Threads Ledger (End of Week 5)

| Thread / Question | Planted | Status at End of Week 5 |
| :--- | :--- | :--- |
| **Why didn't the fifth Stone wake when we bled over it?** | `W5D7` | **Resolved in-scene:** The wall inscription states `"Where he fell, under the dark moon, the five were joined"`—it can only be woken inside the Hall below on the night of the dark moon (7 days away). |
| **Why is the Order barring the Hall from the outside (`"Do not open what we have shut"`)?** | `W5D5`–`W5D7` | **Active / Escalated:** Fragment 5 (`"Do not open what we have shut. When five are brought, the vigil ends"`) and the dying watchman's words (`"He made us swear—until the five are brought—until the throne rise whole"`) strongly imply that bringing all five Stones into the Hall on the dark moon will **raise Malakor's throne**, not destroy him! |
| **Garrick's white linen, extra cup on the sill, and steering the party into the Hall** | `W1D7`–`W5D7` | **Escalated to near-certainty:** On `W5D4`, Garrick pours an extra cup facing the Hall (`"My family's waited a long time for something. I'd like to live to see it"`). On `W5D7`, he wraps your bleeding palms in **"the same neat white linen you've seen on every child you've saved"**, and urges you to carry all five Stones into the Hall on the dark moon. |
| **The Hollowed soldiers waking up** | `W5D4`, `W5D7` | **Active:** Frozen mid-stride since the night Malakor fell (`W5D4`), they turned their heads as you left and marched down the street to fight you on `W5D7`. |
| **The fresh watchman looking straight at our slit window** | `W5D7` | **Immediate cliffhanger:** Seven days remain until the dark moon, and the Order in the square below knows someone is inside the outer wall. |

---

### 5. Stretches Where I Stopped Caring What Happened Next

- **None in the story text.** Every single day of Week 5 lands a haunting image or a major lore revelation.
- **Mechanically on `W5D3`, `W5D5`, and `W5D6`:** Having zero choices on `W5D3` and `W5D5`, followed on `W5D6` by a choice (`POST {F1}` / `POST {F2}` / `POST {F3}`) that blatantly ignores picking `{F2}` or `{F3}`, makes the player feel like a passenger between `W5D4` and Gathering 5.

---

### 6. Bugs, Broken State, and Builder-Text Audit (Week 5)

1. **`W5D6` Broken `"mode": "flavor"` Choice & Hardcoded `{F1}` (`src/data/chapterScripts.ts` lines 5081–5163):**
   - `choice id: 0` offers `"POST {F1}"`, `"POST {F2}"`, and `"POST {F3}"`, but its `mode` is `"flavor"` with `"branches": []`.
   - Two lines later (`line 5093`), unconditional narration states: `"{F1} crouches at the corner of the gate-tower where the steps come up."` And at `line 5163`, unconditional narration states: `"{F1} comes last of all, slipping in from the gate-tower with a hand raised: four pairs of boots coming along the wall-walk, and a lantern."` If the player chose `POST {F2}` or `POST {F3}`, the text directly contradicts their choice.
2. **`W5D4` Campfire (`5-4`) Spoken Dialogue Inside `narratedSilence` (`src/data/campfireDaysData.ts` line 1123):**
   - On Campfire `5-4`, `opener` is `null` and `narratedSilence` reads: `"Garrick sets a cup of water on the sill before he sits. \"Family habit. We always pour one for whoever can't be with us.\""` Because `narratedSilence` renders as italicized stage direction when Garrick is supposed to be silent, putting a spoken quote inside it breaks the Campfire UI convention.
3. **Zero Choice Nodes in `W5D3` and `W5D5` (`src/data/chapterScripts.ts` lines 4695 and 5042):**
   - Both `W5D3` (`The herald's gate`) and `W5D5` (`Below the hall`) have `"choices": []`.
4. **No `Ask` Section in `W5D7` (`src/data/gatheringScripts.ts` lines 2170–2210):**
   - Unlike Gatherings 1–4, Gathering 5 (`W5D7`) has no `Ask` section (`G6=5`). While narratively justified because the old watchman dies on `"Until the throne rise whole"`, players lose one of the core social beats of the Gathering template.


---

# Stage 6 — Week 6 (Days 1 to 7): *His Hall (The Finale)*

### 1. Week 6 Score Table

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | M1 | M2 | M3 | M4 | M5 | M6 | M7 | C1 | C2 | C3 | C4 | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **W6D1** | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 5 | 8 | 8 | 8 | 6 | 6 | 9 | 8 | 9 | 8 | 8 | - | - | - | - | - | - | - | **8.1** |
| **W6D2** | 9 | 9 | 8 | 10 | 9 | 8 | 9 | 3 | 8 | 8 | 8 | 6 | 7 | 9 | 9 | 5 | 8 | 8 | - | - | - | - | - | - | - | **7.8** |
| **W6D3** | 9 | 9 | 8 | 9 | 9 | 9 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 9 | 9 | 9 | 9 | 8 | - | - | - | - | - | - | - | **8.7** |
| **W6D4** | 9 | 9 | 9 | 9 | 9 | 8 | 9 | 5 | 8 | 7 | 8 | 6 | 6 | 9 | 9 | 9 | 9 | 8 | - | - | - | - | - | - | - | **8.1** |
| **W6D5** | 10 | 9 | 9 | 10 | 9 | 9 | 9 | 3 | 8 | 8 | 9 | 9 | 7 | 9 | 9 | 9 | 9 | 8 | - | - | - | - | - | - | - | **8.5** |
| **W6D6** | 10 | 9 | 9 | 10 | 9 | 9 | 10 | 3 | 9 | 8 | 9 | 6 | 7 | 9 | 9 | 9 | 9 | 9 | - | - | - | - | - | - | - | **8.5** |
| **W6D7** | 10 | 10 | 10 | 10 | 10 | 9 | 10 | - | - | - | - | - | - | - | - | - | - | - | 9 | 9 | 9 | 8 | 10 | 7 | 10 | **9.4** |
| **Avg** | **9.4** | **9.1** | **8.9** | **9.6** | **9.1** | **8.6** | **9.3** | **4.5** | **8.2** | **7.8** | **8.3** | **7.0** | **7.0** | **9.0** | **8.8** | **8.3** | **8.7** | **8.3** | **9.0** | **9.0** | **9.0** | **8.0** | **10.0** | **7.0** | **10.0** | **8.4** |

| Week UX Row | U1 | U2 | U3 | U4 | U5 | U6 | Avg |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 6 UX** | 8 (code) | 9 (code) | 9 (code) | 8 (code) | 9 (code) | 9 (code) | **8.7** |

---

### 2. Score Justifications (Every Score Below 6 and Every 9 or 10)

- **W6D1 (`S1=9, S2=9, S3=9, S4=9, S5=9, S7=9, M7=9, C2=9` | `M1=5, M6=6`):**
  - *Why 9s:* Sitting in the pitch-black wall room while Order boots scrape twice past the hidden door (`"Nobody lights a candle that night"`), reading the `Charm` notice line (`"Your palm is stiff under its white linen. All of you are wearing it now. The same linen as the children"`), and taking a burnt stick at dusk to `[STRIKE THE PAGE]` from seven down to **Six** (`"You are keeping the enemy's count now"`) while Garrick remarks, `*"I kept a tally behind my bar for years. Most of it was who owed me."*` Fragment `6-1` (`"His household ran the night we came to the hall. We let them go. They were only servants"`) and Campfire `6-1`'s click puzzle (`6-1-1` + `6-1-3` proving a hidden candle burned in the niche for generations) are both top-notch.
  - *Why `M1=5, M6=6`:* `choice id: 0` (`ASK WHERE ANYONE WOULD RUN TO` vs `TRACE THE ARROW IN THE STONE`, `src/data/chapterScripts.ts` lines 5313–5343) is a cosmetic fork where both branches converge on Garrick saying the exact same line (`"Somewhere they'd never be found"`).
- **W6D2 (`S4=10` and `S1=9, S2=9, S5=9, S7=9, M7=9, C1=9` | `M1=3, C2=5`):**
  - *Why `S4=10` and 9s:* After `THE COLLAPSE` in the defenders' barracks, a Hollowed soldier comes down the stair behind you (`"iron on stone. Slow. One step at a time"`), stands in the doorway in green-and-black armour with its helm turned to the fallen stone—**not to you**—and when the heartbeat comes, turns and climbs the stair toward the hall (`"They are not coming for you. They are going to him"`). Combined with the `Craft` notice (`"Where each one stood, the cobbles are a shade paler, in the shape of two boots"`) and the `6-2-2` fan-out lead (`"When the heartbeat comes, you hear iron move all over the city at once: one scrape of a foot from every street, then quiet"`), this is peak dread.
  - *Why `M1=3, C2=5`:* **Zero `choice` nodes in `W6D2` (`choices: []`)**, and Campfire `6-2` has `puzzle: null`. (Note: `M6=7` because failing `THE COLLAPSE` sets `6-2:challenge-failed`, making tomorrow's `THE SQUARE` Challenge `+1 harder`.)
- **W6D3 (`S1=9, S2=9, S4=9, S5=9, S6=9, S7=9, M5=9, M6=9, M7=9, C1=9, C2=9, C3=9`):**
  - *Why 9s across the board:* The finest weekday of Week 6 (**8.7**). Timing the watch-change (`choice id: 0`: `THE WATCH` vs `THE BOARD`) rewards observational play with a `+1 Craft` Relic (`M6=9`), `[PRESS ON: THE FIRE]` (`M5=9`) reveals that six of the eleven watchmen just arrived from the road with unrolled packs (`"They did not send for more men to hunt you. These were already coming"`), and pressing your palm to the great hall's outer wall reveals **the stone is warm from the inside** (`"Then the heartbeat comes, and you feel it in the stone under your hand before you hear it"`). Campfire `6-3`'s click puzzle (`The unbroken drift` + `Warm low down`) proves the four Stones are already set on the floor inside.
- **W6D4 (`S1=9, S2=9, S3=9, S4=9, S5=9, S7=9, M7=9, C1=9, C2=9, C3=9` | `M1=5, M6=6`):**
  - *Why 9s:* Walking the back lanes with a lit lamp at noon (`"By noon it is as dim as dusk"`), finding the one straight crack in the heaved rock where a single Hollowed soldier stands **facing out** (`"Every one of them in this city faces the hall. This one has its back to it. It is facing you"`), and discovering the dead end of blank rock with a full moon scored dark while Garrick says: `*"The Seekers sealed the doors they knew about."*`
  - *Why `M1=5, M6=6`:* `choice id: 0` (`ASK HOW THE ORDER CARRIED FOUR STONES IN` vs `LOOK AT THE BLANK ROCK`, `lines 5796–5826`) is another cosmetic fork converging on Garrick's identical line.
- **W6D5 (`S1=10, S4=10` and `S2=9, S3=9, S5=9, S6=9, S7=9, M4=9, M5=9, M7=9, C1=9, C2=9, C3=9` | `M1=3`):**
  - *Why `S1=10, S4=10` and 9s:* Climbing the open-roofed moon-tower while the heartbeat shakes the city at noon, finding the deeply chiselled dark moon where the sky-watchers' record stops (`"After it, the wall is blank. They never carved another. It is the night he fell"`), finding the chisel and mallet still lying on the ledge via `[PRESS ON: THE BLANK STONE]` (`M5=9`, `"Nobody came back for them"`), and **counting forward with your finger across the bare stone wall** at the sky-watchers' spacing until your finger stops on the doorpost: **that same dark moon returns in two nights.**
  - *Why `M1=3`:* **Zero `choice` nodes in `W6D5` (`choices: []`).**
- **W6D6 (`S1=10, S4=10, S7=10` and `S2=9, S3=9, S5=9, S6=9, M2=9, M4=9, M7=9, C1=9, C2=9, C3=9, C4=9` | `M1=3`):**
  - *Why 10s and 9s:* Slipping through the moving gaps between ranks of marching Hollowed soldiers (`THE STREET` Challenge granting `strikeFirst` in `THE ONE THAT TURNED` Fight, `M2=9`), assembling the 6th map inside the crack (`"It shows that the blank rock at the end of it is not rock. It is a door... Worn into it, in the Seekers' plain hand, is one word: here"`), striking the page down to **One**, and Garrick pouring the last of his flask into the tin cups—**"one for each of you, and one more, which he sets on the sill of the slit window, where nobody is sitting. *'Drinks are on me,'* he says. *'Don't get used to it.'*"**
  - *Why `M1=3`:* **Zero `choice` nodes in `W6D6` (`choices: []`).**
- **W6D7 — Gathering 6: The Finale (`S1=10, S2=10, S3=10, S4=10, S5=10, S7=10, G5=10, G7=10` and `S6=9, G1=9, G2=9, G3=9`):**
  - *Why 10s across Story and Finale Payoff:* One of the finest double-twist finales in interactive fiction:
    - **The First Twist (`S2=10, S3=10, S4=10`):** When your Seeker blood runs off the fifth Stone onto the floor beside the sleeping king, Garrick crouches beside you (`"You've carried it far enough... Let me"`), cuts his own palm with a quick, practised stroke, and **the fifth Stone answers him with a flood of cold light** that pins the party kneeling in the ring. Every clue from 42 days locks together: **"Moon-blood" was never a word for marked children**—it was Malakor's royal title and bloodline (`"You read them as one... The word outlived him and wandered off onto any child born in the dark. Your Meira used it that way"`). Garrick is the last of Malakor's house, the faithful bow to him (`"Keep the dark." / "It keeps us."`), he never spoke a literal lie (`"The faithful don't"`), and his people killed Meira on the road (`"Her pen is in that satchel still, with the rest of her"`).
    - **The Verse of the Name & Second Twist (`G5=10, S4=10`):** Reading his family's untorn scripture past the drowned-village tear—**"What the four begin, the fifth shall end, and the throne rise whole"**—setting the extra tin cup beside the sleeping king (`"Every night on the road, one more cup than there were people. It was always for him"`), and closing the king's open hand around the fifth Stone (`"One stayed close. It always did"`).
    - **The Act & Final Image (`G4=8, S7=10, G7=10`):** The 30-second party call for `{F3}` (`TEAR THE PAGE`, `BREAK THE RING`, or `DO NOTHING`), followed by the king opening his eyes and looking past Garrick straight at you (`"Whatever he is now, he knows Seeker blood when he sees it"`), while Garrick looks at the white linen knotted at every wrist: `*"You saved every child you were sent to save."*`

---

### 3. Week 6 Summary Paragraph

Week 6 (*His Hall*) is a towering achievement in slow-burn dread and fair-play mystery payoff. Turning the Order's chalk countdown into an interactive daily ritual (`[STRIKE THE PAGE]`: *Six, Five, Four, Three, Two, One*) gives the final week a relentless heartbeat—literally, as Malakor's pulse moves from dusk (`W6D1`) to noon (`W6D5`) and draws the entire dead garrison marching up the hill (`W6D2`–`W6D6`). The Campfire puzzles in Week 6 (`6-1`, `6-3`, `6-4`, `6-5`, `6-6`) are the sharpest in the season, letting observant players deduce *before* the Gathering that the four Stones are already warming the floor inside the sealed hall and that bringing the fifth Stone in on the dark moon will wake the king rather than bind him. And Gathering 6 (`W6D7`, **9.4**) delivers a devastating, earned double twist where every cup Garrick set out, every strip of white linen he tied on a child's wrist, and every torn verse from Weeks 1 to 5 pays off without a single cheap retcon. The only structural weakness in Week 6 is weekday choice agency (`M1=4.5`): three weekdays (`W6D2`, `W6D5`, `W6D6`) have zero `choice` nodes, and two (`W6D1`, `W6D4`) have cosmetic forks that converge on identical Garrick lines.

---

### 4. Open-Threads Ledger (End of Week 6 — Season 1 Finale)

| Thread / Question | Planted | Status at End of Season 1 (`W6D7`) |
| :--- | :--- | :--- |
| **Who is Garrick, and why did he carry Meira's satchel and the white linen?** | `W1D1`–`W5D7` | **PAID OFF IN FULL (`W6D7`):** Garrick is the last descendant of Malakor's royal house (*Moon-blood*), head of the Order of the Dark Moon. His people killed Meira on the road (`"Her pen is in that satchel still, with the rest of her"`), and he used the party's Seeker blood to find the four scattered Stones, open the fifth in Highwall's rampart, and open the Seekers' blood-door into the Hall. |
| **Why did Garrick always set out one extra cup?** | `W1D6`–`W6D6` | **PAID OFF IN FULL (`W6D7`):** `"Every night on the road, one more cup than there were people. It was always for him."` He sets the tin cup on the floor beside the sleeping king. |
| **What did `"moon-blood"` and the torn page actually mean?** | `W1D2`–`W5D7` | **PAID OFF IN FULL (`W6D7`):** `"Moon-blood"` was Malakor's personal royal title and bloodline, not Marked children. And the untorn verse ends: *"What the four begin, the fifth shall end, and the throne rise whole."* |
| **Why did Garrick bind the four Marked children's wrists (and ours) in the same white linen with the same knot?** | `W1D7`–`W6D7` | **Hooks into Season 2 (`W6D7`):** `"You saved every child you were sent to save... Tamsin's hand. Corin's. Wren's. Joss's. Yours. The same linen. The same careful knot, every time."` |
| **What happens now that Malakor has opened his eyes and `{F3}` took the final Act (`TEAR THE PAGE` / `BREAK THE RING` / `DO NOTHING`)?** | `W6D7` | **Hooks into Season 2 (`W6D7`):** Malakor looks past Garrick straight at the Seeker party (`"Whatever he is now, he knows Seeker blood when he sees it"`), while the household's open trapdoor stands twenty paces behind the faithful (`Agility` last notice). |

---

### 5. Stretches Where I Stopped Caring What Happened Next

- **Never in the story or Campfire.** Week 6 is gripping from the first line of `W6D1` (`"Nobody breathes"`) to the final `"To be continued"` of `W6D7`.
- **Choice buttons on `W6D1` and `W6D4`:** Tapping `ASK WHERE ANYONE WOULD RUN TO` vs `TRACE THE ARROW IN THE STONE` (`W6D1`) or `ASK HOW THE ORDER CARRIED FOUR STONES IN` vs `LOOK AT THE BLANK ROCK` (`W6D4`) only to watch Garrick deliver the exact same sentence in both branches feels like a fake button.

---

### 6. Bugs, Broken State, and Builder-Text Audit (Week 6)

1. **`W6D7` (Gathering 6) Missing `"cond"` on `"SAY A NAME."` Responses (`src/data/gatheringScripts.ts` lines 2760–2802):**
   - At the climax of the finale (`line 2760`), the player is given a 4-option `"t": "pick"` card: `"SAY A NAME."` (`TAMSIN`, `CORIN`, `WREN`, `JOSS`).
   - Immediately following the pick (`lines 2784–2802`), there are four `"t": "say"` cards (`"**Tamsin,** humming her counting song..."`, `"**Corin,** saying your names back..."`, `"**Wren,** pressing a chip of black glass..."`, `"**Joss,** holding on to his little boat."`), **none of which has a `"cond": { "on": "pick", "option": 0/1/2/3 }` filter**! As a result, whichever child's name the player chooses, the engine renders all four lines one after another unconditionally.
2. **Three Weekdays in Week 6 Have Zero Choice Nodes (`src/data/chapterScripts.ts`):**
   - `W6D2` (*Five nights*), `W6D5` (*Two nights*), and `W6D6` (*One night*) have zero `"t": "choice"` steps (`M1=3`).
3. **Two Weekdays in Week 6 Have Cosmetic Builder Forks With Identical Convergence (`src/data/chapterScripts.ts`):**
   - `W6D1` `choice id: 0` (`lines 5313–5343`) and `W6D4` `choice id: 0` (`lines 5796–5826`) both end with identical Garrick dialogue regardless of which option you pick. Only `W6D3` (`THE WATCH` vs `THE BOARD`, `lines 5539–5570`) has a genuine mechanical fork (`+1 Craft` Relic).


---

# Stage 7 — Hindsight Check (`after-the-finale.md` & Secret Canon) and Whole-Season Roll-Up

## Part 1: The Hindsight Check (After Reading `after-the-finale.md`, `garrick-deception-table.md`, `mythios-cult-bible.md`, `mythios-season-reveal-map.md`, and `garrickRecap.ts`)

### 1.1 Garrick's Lines & Clues in Hindsight — Does He Keep the No-Lie Rule?
- **Verdict on the Scripted Chapter & Gathering Lines (`chapterScripts.ts`, `gatheringScripts.ts`, `garrickRecap.ts`):** **10 / 10.** Every single scripted line Garrick speaks in the chapter and Gathering scripts obeys the three-verb rule (never predicts, never promises, never denies knowledge) and is literally true on reread:
  - **Best Plants:**
    1. **The Extra Cup (`W1D2`, `W1D6`, `W2D1`, `W2D6`, `W3D4`, `W4D2`, `W5D4`, `W6D6` -> `W6D7`):** *"Family habit. We always pour one for whoever can't be with us."* Players assume the cup is for Meira; on `W6D7`, he sets the tin cup on the stone floor beside the sleeping king.
    2. **The White Linen & Careful Knot (`W1D7`, `W2D7`, `W3D7`, `W4D7`, `W5D7` -> `W6D7`):** After your blood fails on the fifth Stone at Gathering 5 (`W5D7`), Garrick binds your palms himself in *"the same neat white linen you've seen on every child you've saved"*. On `W6D1`, the `Charm` notice underscores it (*"All of you are wearing it now. The same linen as the children"*), and on `W6D7` the final lines tie all five knots together.
    3. **The Truth-Bound Captive Clearing Garrick (`W3D7`, `W4D7`):** Teaching the party in `W3D7` that *"the faithful shall not lie"* and immediately letting them ask the captive `"DO YOU KNOW THIS MAN?"` (`"No"`) and `"WHO LEADS YOU?"` (`"One whose face I've never seen"`) is brilliant fair-play misdirection: the party uses the enemy's own rule as a lie-detector and clears Garrick right before their eyes.
    4. **Garrick's `"We're early"` (`W5D7`) and `"My family's waited a long time for something. I'd like to live to see it"` (`W5D4`):** Both read as warm solidarity on first pass and chill the spine on reread.
- **One Hindsight Slip in Campfire Data (`W5D4` Campfire `5-4`):**
  - On Campfire `5-4` (`src/data/campfireDaysData.ts` line 1123), `opener` is `null` and `narratedSilence` reads: `"Garrick sets a cup of water on the sill before he sits. \"Family habit. We always pour one for whoever can't be with us.\""` Aside from putting spoken dialogue inside `narratedSilence`, this repeats the `W1D6` explanation unasked on a night meant to be silent.

### 1.2 All 36 Seeker Fragments in Hindsight
- **Overall Quality:** **9.2 / 10.** The 36 Seeker Fragments in `src/data/mythiosFragments.ts` are the single best piece of micro-writing in the game. The two refrains (`1-5` *"The power that gives is also the power that takes"* and `1-6` *"The key that locks is also the key that unlocks"`), the war sequence in Week 2 (`2-6` *"Morning came. The enemy did not"*), the corruption in Week 3 (`3-1` *"First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours"*), the misdirection anchor in Week 4 (`4-4` *"Moon-blood woke it once. Moon-blood will wake it again, if it is ever let near"*), and the household escape in Week 6 (`6-1` *"His household ran the night we came to the hall. We let them go. They were only servants"*) all land with tremendous weight when quoted back at the Gatherings.
- **Fragments / Lock Words That Need Attention:**
  1. **Duplicate Lock Word on `5-3` and `5-5` (`src/data/mythiosFragments.ts` lines 241 & 257):** Both Fragment `5-3` (`word1: 'none', word2: 'fifth'`) and Fragment `5-5` (`word1: 'kept', word2: 'fifth'`) use **`fifth`** as `word2` in the same week! On `5-5` (`"We kept the fifth where we could watch it, and watch him"`), change `word2` from `fifth` to **`watch`** (`displayTemplate: "We {0} the fifth where we could {1} it, and watch him."`).
  2. **Three-Letter Lock Word on `3-4` (`src/data/mythiosFragments.ts` line 145):** Fragment `3-4` (`"What we hid, we locked with what we are"`) uses a 3-letter lock word (`word1: 'hid'`, `jumble1: ['D', 'H', 'I']`), which is trivial to brute-force in 2 taps.

### 1.3 Fairness of the Double Twist
- **Is the Finale Fair?** **Yes (9.5 / 10).** The distinction between **`marked` blood** (which the four elemental Stones drink) and **`moon-blood`** (Malakor's royal title and bloodline, which the fifth Stone drinks) sits in plain sight in the Layer 2 older-hand insets from `W4D7` and `W5D7`, while Meira's `W4D4` gloss (*"'Moon-blood' — the old songs' word for the marked"*) gives the party a completely natural reason to conflate them. Similarly, the liturgical close *"Until the throne rise whole"* appears at the end of every scripture reading from Week 2 to Week 5, so when Garrick reads past the tear on `W6D7` (*"What the four begin, the fifth shall end, and the throne rise whole"*), the player recognizes the phrase immediately.

---

## Part 2: Whole-Season Score Roll-Up (All 42 Days & 6 Weeks)

### 2.1 Weekly Summary Table (Story, Mechanics, Campfire, Gathering, UX, Overall)

| Week | Title / Arc | Story Avg (`S1`–`S7`) | Mech Avg (`M1`–`M7`) | Fire Avg (`C1`–`C4`/`C7`) | Weekday Avg (D1–D6) | Gathering Score (D7) | UX Avg | **Week Overall (All 7 Days)** |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 1** | *The List, the Child, and the Wall* | 8.7 | 7.4 | 7.9 | **8.0** | **8.7** | 7.7 | **8.1** |
| **Week 2** | *Corin, the Mill, and the Answering* | 8.6 | 7.0 | 8.0 | **7.8** | **9.2** | 7.7 | **8.0** |
| **Week 3** | *Wren, the Blackglass, and the Kiln* | 8.9 | 7.2 | 8.1 | **8.1** | **9.2** | 8.0 | **8.2** |
| **Week 4** | *Joss, the Stillwater, and the Four Stones* | 9.0 | 7.1 | 8.1 | **8.0** | **9.6** | 7.7 | **8.2** |
| **Week 5** | *Highwall* | 9.0 | 7.1 | 7.8 | **7.9** | **9.0** | 8.2 | **8.1** |
| **Week 6** | *His Hall (The Finale)* | 9.1 | 7.4 | 8.5 | **8.3** | **9.4** | 8.7 | **8.4** |
| **SEASON** | **All 42 Days (Weeks 1–6)** | **8.9** | **7.2** | **8.1** | **8.0** | **9.2** | **8.0** | **8.2** |

### 2.2 All 42 Days Ranked — Top 10 Best Days & Bottom 7 Weakest Days

#### Top 10 Highest-Scoring Days of the Season:
1. **`W4D7` — Gathering 4: *The Drowned Undercroft* (`9.6`):** The water-gate United Effort where failing costs you the prisoner's interrogation, finding Meira's brass pen, the fifth Stone torn page, and the sunrise freezing grey as the heartbeat sounds from the north.
2. **`W6D7` — Gathering 6: *His Hall (The Finale)* (`9.4`):** The double twist (*moon-blood* = Malakor's royal house; *"and the throne rise whole"*), the extra tin cup set beside the sleeping king, the 30-second Act for `{F3}`, and the white linen knots.
3. **`W2D7` — Gathering 2: *Under the Mill Hill* (`9.2`):** *The Verse of the Answering*, the oiled-leather ledger of *given* children, and the realization that **"You're marked too. Every one of you."**
4. **`W3D7` — Gathering 3: *Under the Kiln* (`9.2`):** Returning Wren's eight glass chips, the stone case springing open to *Seeker blood*, interrogating a captive who cannot lie, and every lamp going out at once.
5. **`W5D7` — Gathering 5: *The Wall at Highwall* (`9.0`):** Answering the Order's roll-call (`"Keep the dark"` / `"It keeps us"`) in the wind for dead watchmen, and your blood running off the fifth Stone like rain off glass while Garrick wraps your palms in the children's white linen.
6. **`W1D7` — Gathering 1: *The Mine* (`8.7`):** Finding Tamsin humming in the dark and reading four children's names under the empty wall socket (*"This was never about you"*).
7. **`W6D3` — *Four nights* (`8.7`):** Timing the watch-change for a Craft Relic, counting the eleven watchmen via `[PRESS ON]`, feeling the warm stone wall of the hall, and proving via the Campfire click that the four Stones are already on the floor inside.
8. **`W4D1` — *Not finished* (`8.5`):** Carrying Wren up first (+1 Aim Relic), following the rescuer's prints to bare black glass (`[PRESS ON]`), and Wren's mother kneeling in the road outside Ashcombe.
9. **`W6D5` — *Two nights* (`8.5`):** Counting forward with your finger across the blank stone of the moon-tower wall until it lands on the doorpost (*two nights*).
10. **`W6D6` — *One night* (`8.5`):** Crossing through the ranks of marching Hollowed soldiers, assembling the final map (`*here*`), striking the page to *One*, and Garrick pouring the last extra cup.

#### Bottom 7 Lowest-Scoring Weekdays of the Season (and Why):
1. **`W1D1` (`7.4`):** Strong opening hook, but pulled down by having no two-piece Campfire puzzle (`puzzle: null` on solitary Night 1) and a post-fight choice whose two branches immediately merge into the same sentence.
2. **`W2D4` (`7.4`):** Zero `choice` nodes (`M1=3`), no `[PRESS ON]` (`M5=6`), no two-piece Campfire puzzle (`C2=5`), and hardcoded `"four"` in the Campfire text.
3. **`W2D5` (`7.6`):** `choice id: 0` (`WALK THE HILL` vs `READ MEIRA'S PAGES`) is left on `"mode": "auto"`, punishing players in slot 1 by taking away `strikeFirst` without letting them choose.
4. **`W5D6` (`7.6`):** `choice id: 0` (`POST {F1}`, `POST {F2}`, `POST {F3}`) is `"mode": "flavor"` with empty branches and hardcodes `{F1}` as the lookout two lines later even if you picked `{F2}` or `{F3}`.
5. **`W4D2` (`7.7`):** Zero `choice` nodes (`M1=3`) even though the prose literally narrates a fork in the road (`"Beyond the ford the road forks. {F1} and {F3} take the lake road. You take the other"`).
6. **`W5D5` (`7.7`):** Great story reveal at the Hall doors, but zero `choice` nodes (`M1=3`) and no `[PRESS ON]` (`M5=6`).
7. **`W2D3`, `W3D1`, `W3D6`, `W5D3`, `W6D2` (`7.8`):** Weekdays with zero `choice` nodes (`W2D3`, `W5D3`, `W6D2`) or purely cosmetic choices (`W3D1`, `W3D6`) and no `[PRESS ON]`.

### 2.3 Weekly Endings Ranked (Strongest to Weakest)
1. **Week 6 (`W6D7` — *His Hall*, `10/10`):** The double twist, the king opening his eyes and recognizing Seeker blood, and the white linen knots across all four children and the party.
2. **Week 4 (`W4D7` — *The Drowned Undercroft*, `10/10`):** The torn fifth-Stone page, followed by the sunrise stopping grey over Lake Stillwater and two slow heartbeats from the north.
3. **Week 5 (`W5D7` — *The Wall at Highwall*, `10/10`):** Blood running off the fifth Stone like rain off glass, `"Seven strokes left... We're early,"` and the watchman at the board raising his lantern to look straight down the hill at your slit window.
4. **Week 3 (`W3D7` — *Under the Kiln*, `10/10`):** `"We're not finished with you"`—every lamp in the chamber going out at once, and the captive's ropes cut clean in the dark.
5. **Week 1 (`W1D7` — *The Mine*, `9/10`):** `"This was never about you"`—three more children's names under the empty socket, and a horse galloping away from the mine mouth.
6. **Week 2 (`W2D7` — *Under the Mill Hill*, `9/10`):** `"You're marked too. Every one of you,"` and Corin remembering a girl held with him who was told she was going *"somewhere warm."*

---

## Part 3: Master List of Every Code Bug, Continuity Slip, and Mechanical Flaw Found Across All 42 Days

| # | Severity | Where (Week / Day / File & Line) | The Problem | Concrete Fix |
| :---: | :---: | :--- | :--- | :--- |
| **1** | **BIG (Bug)** | **`W6D7` (Finale)** `src/data/gatheringScripts.ts` lines 2760–2802 | **Missing `"cond"` filters after `"SAY A NAME."`:** When the player picks one of the four children (`TAMSIN`, `CORIN`, `WREN`, `JOSS`) at the climax of the finale, the four `"t": "say"` cards that follow (`lines 2784–2802`) have no `"cond": { "on": "pick", "option": 0/1/2/3 }` property. All four lines print one after another regardless of which child you chose. | Add `"cond": { "on": "pick", "option": 0 }` to Tamsin (`line 2784`), `option: 1` to Corin (`line 2789`), `option: 2` to Wren (`line 2794`), and `option: 3` to Joss (`line 2799`). |
| **2** | **BIG (Bug)** | **`W5D6`** `src/data/chapterScripts.ts` lines 5081–5163 | **Broken `"mode": "flavor"` choice & hardcoded `{F1}`:** `choice id: 0` offers `POST {F1}`, `POST {F2}`, `POST {F3}` with `"mode": "flavor"` and `"branches": []`, and `lines 5093` and `5163` hardcode `"{F1} crouches at the corner of the gate-tower"` and `"{F1} comes last of all"` even if the player clicked `POST {F2}` or `POST {F3}`. | Change `choice id: 0` to `"mode": "pick"` with three branches that substitute `{F1}`, `{F2}`, or `{F3}` into the lookout lines, or store the chosen friend in state. |
| **3** | **BIG (Bug)** | **`W3D4` & `W3D5`** `src/data/chapterScripts.ts` lines 2944 & 3071 (`scripts/gen-chapter-scripts.cjs` lines 239 & 252) | **Builder `roadFind` continuity blunder (glass chips called shaved wood):** Wren drops **chips of black volcanic glass** from Ashcombe (`"a chip of black glass"`), but the builder misread `"chip"` as wood shavings and wrote `"a third twist of shaved wood"` (`W3D4`) and `"five more twists of shaved wood"` (`W3D5`). | Replace `"twist(s) of shaved wood"` with `"chip(s) of black glass"` in `scripts/gen-chapter-scripts.cjs` (`lines 239, 252`), `src/data/chapterScripts.ts` (`lines 2944, 3071`), and Supabase migration `0111`. |
| **4** | **BIG (Bug)** | **`W2D7` (Gathering 2)** `src/data/gatheringScripts.ts` lines 552 vs 641 | **United Effort failure continuity bug:** On `ue` `won: false` (`line 552`), the party flees up the stair out of the chamber to the shaft mouth and Corin is already holding the oiled-leather ledger he grabbed on the way out. Two sections later (`The ledger`, `line 641`), unconditional prose places the party back inside the underground chamber with Corin pointing to the ledger in the wall niche for the first time. | Make `The ledger` opening conditional on `ue` `won: true` vs `won: false`, or have `won: false` stay in the chamber after the roof-prop dust settles. |
| **5** | **BIG (Bug)** | **`W1D5`** `src/data/chapterScripts.ts` lines 1030 & 1041 | **Contradictory branch text on `choice id: 1`:** Branch 0 (`SHOW HER YOUR EMPTY HANDS`) and Branch 1 (`TELL HER WHO YOU JUST DROVE OFF`) both end with *"Then her eyes go to the carved horse in your other hand, and stop"*—directly contradicting having just shown empty hands (pasted from Branch 2 `HOLD OUT THE CARVED HORSE`). | In Branches 0 and 1, change that bridge sentence to: *"Then her eyes catch the carved wooden horse sticking out of your pack, and stop."* |
| **6** | **BIG (Agency)** | **11 Weekdays Across Weeks 2–6** (`W2D3`, `W2D4`, `W4D2`, `W4D4`, `W4D5`, `W4D6`, `W5D3`, `W5D5`, `W6D2`, `W6D5`, `W6D6`) | **Eleven weekdays have zero `"t": "choice"` nodes (`M1=3`):** Players read and roll dice without making a single narrative choice all chapter. Worst of all, `W4D2` (`line 3639`) narrates `"Beyond the ford the road forks. {F1} and {F3} take the lake road. You take the other"` without giving the player a choice button! | Add at least one meaningful `mode: "pick"` fork to each of those 11 weekdays (starting with the literal road fork on `W4D2`). |
| **7** | **MEDIUM (Bug)** | **`W2D5`** `src/data/chapterScripts.ts` lines 2043 & 2112 | **Auto-assigned choice controls combat `strikeFirst`:** `choice id: 0` (`WALK THE HILL` vs `READ MEIRA'S PAGES`) is `"mode": "auto"`, yet `THE ONE SENT UP TO LOOK` sets `strikeFirst` based on `choice 0, options: [0]`. Half the party loses first strike for a choice the game made automatically. | Change `W2D5` `choice id: 0` (and `W2D2` `choice id: 0`) from `"mode": "auto"` to `"mode": "pick"`. |
| **8** | **MEDIUM (Bug)** | **`W1D4`** `src/data/chapterScripts.ts` lines 683–730 | **Misleading `changed` banner & mismatched `pass` prose on `choice id: 0`:** Picking `LOOK FOR FOOTPRINTS` or `KNOCK NEXT DOOR` flashes `"Agility roll on the Challenge"` or `"Charm roll on the Challenge"`, but `FIND WHO LEFT IT` lets you roll either stat freely and its `pass` text always narrates following footprints behind the grain store even if you knocked next door and rolled Charm. | Either lock the Challenge stat to the fork chosen or split the `pass` text by the attribute rolled (`Agility` vs `Charm`). |
| **9** | **MEDIUM (Party Size)** | **`W1D2` & `W2D4` Campfires** `src/data/campfireDaysData.ts` lines 153, 459, 466 | **Hardcoded `"Four"` / `"four"` in Campfire data:** `1-2` opener (`"Four strangers, four torn pages"`), `2-4` `forkA` (`"fear four people"`), and `2-4` `nudgeIfLaid` (`"four strangers at the lip"`) break 2-, 3-, 5-, and 6-player parties. | Replace hardcoded `"four"` with dynamic party-count templating or party-size-agnostic wording (`"A table of strangers, each with a torn page"`, `"strangers at the lip"`). |
| **10** | **MEDIUM (Campfire)** | **`W5D4` Campfire (`5-4`)** `src/data/campfireDaysData.ts` line 1123 | **Spoken dialogue inside `narratedSilence`:** On quiet night `5-4`, `opener` is `null` and `narratedSilence` contains spoken dialogue (`"Garrick sets a cup of water on the sill before he sits. \"Family habit. We always pour one for whoever can't be with us.\""`). | Keep `narratedSilence` purely silent stage direction (`"Garrick sets a cup of water on the sill facing the hall before he sits, and says nothing at all."`). |
| **11** | **MEDIUM (Agency)** | **Cosmetic Builder Forks** (`W1D1`, `W1D2`, `W1D6`, `W2D1`, `W2D6`, `W3D1`, `W3D3`, `W3D6`, `W5D1`, `W6D1`, `W6D4`) | **15+ `mode: "pick"` choices converge on identical verbatim dialogue 1 sentence later:** In these forks, both branches end with the exact same multi-sentence speech from Garrick or an NPC, making the `changed` banner feel padded. | Differentiate the NPC's answer by branch so each option reveals a distinct angle (as `W5D4` `choice id: 0` and `W6D3` `choice id: 0` already do well). |
| **12** | **SMALL (Gathering)** | **`W3D7` (Gathering 3)** `src/data/gatheringScripts.ts` lines 1286–1310 | **`The turn` section has no interactive `"t": "turn"` question card:** Because `Ask` is placed before `The turn` in `W3D7`, `The turn` is just four passive `"say"` cards (`G5=7`). | Place an interactive `"t": "turn"` card at the climax of `The turn` (or move `The turn` before the unsealed `Ask` wave, as in `W2D7` and `W4D7`). |
| **13** | **SMALL (Gathering)** | **`W4D7` (Gathering 4)** `src/data/gatheringScripts.ts` line 1732 | **Blurred wording on how the Order used Seeker blood:** `The turn` says *"every one of the four was waiting behind a door that only your blood could open"*, whereas canon (`mythios-season-reveal-map.md` line 16) states the blood-lock guards the *fragment housings/maps*, and the Order overheard the party read each map aloud and lifted the Stones from open sockets before the party arrived. | Change `"behind a door that only your blood could open"` to `"at the end of a way that only your blood could uncover"`. |
| **14** | **SMALL (Fragments)** | **`W5D3` & `W5D5` Fragments** `src/data/mythiosFragments.ts` lines 241 & 257 | **Duplicate lock word (`fifth`) in the same week:** Both `5-3` and `5-5` use `fifth` as `word2`. | Change `5-5` `word2` from `fifth` to `watch`. |
| **15** | **SMALL (UX)** | **Notifications Deep-Linking** | **Notifications open the root Story thread instead of the target screen:** When a player taps `"The table clicked: two pieces belong together"` or `"Mei has come to the fire"`, the app opens at the top of the Story tab rather than jumping directly to the Campfire or Seeker Chest. | Pass a deep-link query/hash (`?tab=fire` or `?tab=bag&shelf=chest`) in notification payloads so tapping a Campfire notification lands directly at the fire. |

---

# Stage 8 — Comparison With Earlier Audits (`docs/audits/` & `docs/design/*audit*`)

Having completed Stages 0–7 with fresh eyes before opening the earlier audit files (`docs/audits/point-1` to `point-10`, `docs/design/campfire-experience-audit-22oct.md`, and `docs/design/campfire-audit-22oct-evening.md`), here is how our findings compare:

### 1. What Earlier Audits Flagged That Has Already Been Fixed in the 23 Oct Build
- **The 14 Oct Audit (`docs/audits/point-1` & `point-10`) audited a much older pre-script build (`soloLandmarkProse.ts`, fixed 4-player Mei/Dev/Arjun strings, missing `[PRESS ON]`, missing child rescues, missing Garrick plants, missing Garrick Recap).**
  - Between 15 Oct and 23 Oct (`migrations 0105`–`0111` and `chapterScripts.ts` / `gatheringScripts.ts`), **nearly all of the 14 Oct structural gaps were fixed**: `soloLandmarkProse.ts` was deleted, full episode scripts (`chapterScripts.ts` and `gatheringScripts.ts`) were generated from canon, `[PRESS ON]` is live on weekdays, all four child rescues and scripture matches are live in the Gatherings, `garrickRecap.ts` is built and unlocked after the finale, and `{F1}`–`{F3}` / `{N}` dynamic party slots replaced the hardcoded `Mei, Dev, Arjun` strings in the chapters.
- **The 22 Oct Morning Campfire Audit (`campfire-experience-audit-22oct.md`)** flagged 5 mismatched clicks (`2-1`, `4-2`, `5-5`, `6-1`, `6-6`), missing `nudgeIfLaid` entries (only 2 of 36 nights had them), and `2-4` talking on a quiet night. By the **22 Oct Evening Rewrite (`campfire-audit-22oct-evening.md` / `migration 0110`)**, 35 of 36 nights gained `nudgeIfLaid` hooks, `2-4` was made silent, and those 5 clicks were repaired.

### 2. What Our Day-by-Day Play-and-Score Audit Found That Earlier Audits Missed
Because the 22–23 Oct migrations (`0110` and `0111`) landed *after* the 14 Oct and 22 Oct audits, our play-through caught **seven post-21 Oct regressions and script bugs** that no prior audit had seen:
1. **`W6D7` (Finale) Missing `"cond"` on `"SAY A NAME."` (`src/data/gatheringScripts.ts` lines 2760–2802):** Choosing Tamsin, Corin, Wren, or Joss at the climax prints all four children's lines unconditionally.
2. **`W3D4` & `W3D5` `roadFind` Continuity Blunder (`src/data/chapterScripts.ts` lines 2944 & 3071):** Migration `0111` / `gen-chapter-scripts.cjs` misread Wren's black volcanic glass chips as *"twists of shaved wood"*.
3. **`W1D5` `choice id: 1` Contradiction (`src/data/chapterScripts.ts` lines 1030 & 1041):** Migration `0106`/`0107` pasted *"Then her eyes go to the carved horse in your other hand"* into the `"SHOW HER YOUR EMPTY HANDS"` branch.
4. **`W5D6` Broken `"mode": "flavor"` Choice (`src/data/chapterScripts.ts` lines 5081–5163):** Clicking `POST {F2}` or `POST {F3}` does nothing and hardcodes `{F1}` as the lookout two lines later.
5. **`W2D7` (Gathering 2) United Effort Failure Continuity Bug (`src/data/gatheringScripts.ts` lines 552 vs 641):** Fleeing the room with the ledger on `ue` `won: false`, then teleporting back inside the room to discover the ledger in the wall niche at `line 641`.
6. **Uneven Fork Coverage in `migration 0111`:** While Week 1 (`0106`/`0107`) and Week 3 got forks on every day, `0111` left **11 weekdays across Weeks 2, 4, 5, and 6 with zero `choice` nodes** (including `W4D2`'s literal road fork) and left `W2D5`'s combat-affecting choice on `"mode": "auto"`.
7. **Remaining Hardcoded `"Four"`s in `campfireDaysData.ts` (`1-2` line 153 and `2-4` lines 459, 466) and spoken dialogue inside `5-4`'s `narratedSilence` (`line 1123`).**

### 3. Where We Agree With the 22 Oct Evening Campfire Audit
We strongly agree with `campfire-audit-22oct-evening.md` on the Campfire's remaining UX bottleneck: **the prose of the 108 fan-out leads and the 28 click syntheses is 9/10, but the Campfire screen still announces the `MYTHIOS · SOMETHING CLICKS` paragraph automatically the instant two cards land, instead of pausing to let the players say the connection first.** Fixing the 7 script/continuity bugs above and giving the 11 zero-choice weekdays one real decision each will lift *Tales of the Dark Moon* from a **8.2 / 10** build (with a **9.2 / 10** Gathering spine and a **9.4 / 10** Finale) to a **9.5 / 10** masterpiece.
