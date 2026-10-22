# Campfire Week 4 Content — Forensic Audit & Final Spec (21 Oct)

**Scope:** Episode 4 — *The Water Stone* (`4-1` to `4-6`, Gathering 4, and Episode 6 long-fuse hold).  
**Standard Applied:** Strict five-rule verification against `docs/canon/episode-4-the-water-stone.md`:
1. **Read-Back Rule:** Every nightly pin and fragment meaning pin is read back at the exact narrative beat that answers it, quoting each friend's words by name without grading.
2. **Zero-Spoil Click Rule:** Every night (including Quiet Nights `4-3` and `4-6`) has a two-clue Click (`clicks`) that resolves a concrete physical/tactical question (`puzzle.q`) without answering or tilting the Dawn Pin (`questionTitle`). Conversely, `questionTitle` never pre-spoils a Fan Out clue or Click (fixed on `4-4`).
3. **Fair-Play Dilemma Rule:** No fork contradicts the day's canon chapter (fixed `4-2` cart weight and `4-3` grandmother's doorpost notches / shingle keel-marks) or asks a question the chapter already answered.
4. **Anti-Form Discipline:** Every `questionTitle` and every `FRAGMENT_MEANING_QUESTIONS` entry (`4-1` to `4-6`) is a single, crisp question (eliminated double-barrel `"What X, and who/when Y?"` prompts on `4-1`, `4-4`, `4-5`), and every `forkA` / `forkB` pair is balanced at 11–17 words.
5. **Tone Purity & Gate Integrity:** Quiet Nights (`4-3`, `4-6`) carry `tone: "quiet"`, `opener: null`, `narratedSilence`, and low declarative nudges from Garrick (no quiz questions or riddles). Layer D stays shelved on `4-1`, and `4-4` preserves the Episode 5/6 `"moon-blood"` twist.

---

## 1. Self-Audit Matrix Against the Five Criteria

| Rule | Initial Pass Issue Caught | Final Fix Verified |
| :--- | :--- | :--- |
| **1. Read-Back Rule** | `4-1`, `4-2`, `4-3`, `4-5`, `4-6` lacked explicit anchor lines in Gathering 4 (`The Verse of the Four` & `The Turn`). | Every pin now maps to a verbatim canon line: `4-5` on Day 6 arrival (*"there is nobody in it"*); `4-1`, `4-3`, `4-6` at Gathering 4's *The Verse of the Four* (*"We have waited for those who can open them"*); `4-2` at Gathering 4's *The Turn* (*"Count the boxes"*); `4-4` at Gathering 4 (for the four Stones) and **Episode 6 Finale** (for the fifth Stone / royal bloodline). |
| **2. Zero-Spoil Click Rule** | On `4-4`, putting *"then scratched out her next line until the paper tore"* inside `questionTitle` pre-spoiled Fan Out clue `4-4-3` and the Click (`4-4-2` + `4-4-3`) for players who hadn't unlocked them! | Removed the scratched-line spoiler from `4-4`'s `questionTitle`. `questionTitle` now uses only the chapter's baseline (Meira's gloss + the fragment's warning), while the Click (`4-4-2` + `4-4-3`) rewards investigators by revealing she began a second thought from a separate record and scratched it through the paper. |
| **3. Fair-Play Dilemmas** | On `4-3`, our first edit placed the eight knife-notches on the tower doorpost and mentioned a stone in the tower floor. In canon (`episode-4-the-water-stone.md` lines 271–328), the eight notches are cut into **Joss's grandmother's wooden doorpost** on shore, and the fresh evidence at the waterline is the **deep keel-marks on the shingle** beside her skiff. | Fixed `4-3-2` in `fanOutLeads.ts` to `" the fresh keel-marks on the shingle"` (*"Heavier than her skiff"*) and aligned `4-3`'s Click (`4-3-1` + `4-3-2`), nudge, and Dawn Pin with the canon chapter text. |
| **4. Anti-Form Discipline** | `FRAGMENT_MEANING_QUESTIONS` `4-1`, `4-4`, and `4-5` had double-barrel worksheet prompts (*"What needed holding, and what is the last lock?"*, *"What did it wake, and when?"*, *"A door to what, and who would want it opened?"*). Also, `4-1` and `4-2` forks were 24–33 words long with em-dash clauses. | Rewrote `4-1` to `4-6` in `fragmentMeaningQuestions.ts` into single, sharp questions, and tightened all `questionTitle` / `forkA` / `forkB` strings in `campfireDaysData.ts` to 11–18 words. |
| **5. Tone Purity** | On Quiet Night `4-3`, Garrick's `nudge` ended with a rhetorical quiz question (`"What is a watchman waiting to see?"`). | Changed `4-3`'s `nudge` to a quiet, declarative observation (`"{friend:Craft}, eight notches cut in her doorpost wood, and a boat heavier than her skiff touching the shingle by night."`), matching `4-6`. |

---

## 2. Final Week 4 Specification (`src/data/campfireDaysData.ts`)

### Day 4-1 — Under the Kiln, then Ashcombe (`tone: "wry"`)
- **Opener:** `"Count yourselves. I will, too."`
- **Click (`4-1-1` + `4-1-3`):**
  - *Puzzle:* `"How did the prisoner get free in the dark?"`
  - *Click Text:* `"A lamp was just snuffed inside the side passage, and every rope was severed cleanly on the same side a finger's width from the knot. A second person stepped out of the passage in the dark and cut him loose."`
- **Nudge:** `"{friend:Craft}, cut rope ends all clean on the same side, a finger's width from the knot. Someone stepped out of that passage with a steady blade."`
- **Dawn Pin:** `"Someone stood among us in the dark with a bare blade, yet cut only rope. Why spare us?"`
  - **Fork A:** `"A lone rescuer couldn't risk a fight in the dark without losing the prisoner."`
  - **Fork B:** `"They had us at their mercy and were under orders not to harm us."`
- **Fragment 4-1 Question:** `"*\"We did not trust four locks to hold what needed five.\"* If the four marks were not enough, what is the fifth lock?"`
- **Read-Back:** **Gathering 4 (`The Verse of the Four`)** — right after *"Therefore the faithful have not waited for the ways to open. We have waited for those who can open them."*

---

### Day 4-2 — The north road (`tone: "wry"`, `cupNight: true`)
- **Opener:** `"Cold road. Put your hands round that cup."`
- **Click (`4-2-1` + `4-2-2`):**
  - *Puzzle:* `"How did the four riders guard the cart through the settlements?"`
  - *Click Text:* `"They rode with bare blades across their saddles in broad daylight, never speaking and never once looking at the road or the lake. Every eye stayed locked on the single small box in the cart-bed."`
- **Nudge:** `"{friend:Intellect}, bare swords across their saddles and eyes never leaving a single small box in the cart-bed. Why ride like that in broad daylight?"`
- **Dawn Pin:** `"Four armed riders guarded one small box from the Kiln, riding away from the lake. Why guard that box harder than the boy?"`
  - **Fork A:** `"The box holds what they actually came for; the child only wakes it."`
  - **Fork B:** `"The cart was an open-road decoy meant to draw our eyes off the lake."`
- **Fragment 4-2 Question:** `"*\"We feared it more than the other four together.\"* Why would the Seekers fear one of their own locks?"`
- **Read-Back:** **Gathering 4 (`The Turn`)** — at *"On the north road, the carter: four armed riders, and one closed box between them, 'no bigger than a bread crock' ... Every socket was empty. Where did they go?"*

---

### Day 4-3 — Reedham (`tone: "quiet"`)
- **Narrated Silence:** `"Garrick sits by the window looking out over the water, his arms folded in the quiet room."`
- **Click (`4-3-1` + `4-3-2`):**
  - *Puzzle:* `"What has been moving on the Stillwater after dark?"`
  - *Click Text:* `"Every evening just after dusk the fisherman hears oars on the water, and the fresh keel-mark on the shingle was pressed by a boat far heavier than her skiff. A crew has been rowing across this lake night after night."`
- **Nudge:** `"{friend:Craft}, eight notches cut in her doorpost wood, and a boat heavier than her skiff touching the shingle by night."`
- **Dawn Pin:** `"They took Joss eight nights ago — before we even reached the Kiln — and have kept him on the water ever since. What are they waiting for?"`
  - **Fork A:** `"A night or a water-level that hasn't come yet to reach the drowned chamber."`
  - **Fork B:** `"Someone else who had not reached Reedham yet: they have been waiting for us."`
- **Fragment 4-3 Question:** `"*\"So does anyone born in its dark.\"* What does a child born in the dark have in common with what fell?"`
- **Read-Back:** **Gathering 4 (`The Verse of the Four`)** — at *"We have waited for those who can open them. Where the Seekers' children walk, the faithful follow."*

---

### Day 4-4 — Old Reedham (`tone: "wry"`)
- **Opener:** `"Drowned roofs under the keel, and a page of Meira's notes that survived the ash. Let's hear what you found."`
- **Click (`4-4-2` + `4-4-3`):**
  - *Puzzle:* `"Was Meira sure of her own note on 'moon-blood'?"`
  - *Click Text:* `"Meira copied 'the marked' and 'moon-blood' from two separate old records, and under her gloss she began a second thought before scratching it out through the paper. She had a second thought she never finished."`
- **Nudge:** `"{friend:Intellect}, she copied 'the marked' on one page and 'moon-blood' on another, then crossed out her second line in the margin until the nib tore through."`
- **Dawn Pin:** `"Meira's note says 'moon-blood' is the old word for the marked, and the fragment warns against letting it near. What is the fragment warning against?"`
  - **Fork A:** `"Letting a marked child's blood touch the Stones — the Order is doing what the Seekers feared."`
  - **Fork B:** `"Letting a specific bloodline from the old songs near — 'moon-blood' may mean more than the birth-mark."`
- **Fragment 4-4 Question:** `"*\"If it is ever let near.\"* Let near to what?"`
- **Read-Back:** Dual payoff — first at **Gathering 4 (`The Torn Page`)** (*"Four were given to the wind, the water, the fire, and the earth, and drink deep whichever marked blood finds them first. The fifth heeds no element at all, but blood alone, and remembers whose"*), and held for final read-back in the **Episode 6 Finale** (*"Not marked. Moon-blood. It was a title... his house's"*).

---

### Day 4-5 — The reed island (`tone: "wry"`)
- **Opener:** `"Pale curls of whittled wood. Somebody's still carving."`
- **Click (`4-5-1` + `4-5-3`):**
  - *Puzzle:* `"How has Joss been kept on the reed island?"`
  - *Click Text:* `"The willow has had fresh shoots cut three days running, and the long shavings in the boat's bilge were carved without haste. They have kept him dry and unharmed on the island by day while moving him across the lake by night."`
- **Nudge:** `"{friend:Aim}, three willow cuts—one grey, one brown, one white—and tonight a single lamp moving out toward the tower."`
- **Dawn Pin:** `"They ferry Joss between the island and the drowned streets by night, yet tonight a lamp is crossing to the empty tower. Why the tower tonight?"`
  - **Fork A:** `"They shift their watch-post across the lake so no one on shore can fix where the boy is held."`
  - **Fork B:** `"They know we took their boat on the island today and are setting a watch for us at the tower."`
- **Fragment 4-5 Question:** `"*\"Pray no one ever learns it is also a door.\"* Why build a lock that can still be opened like a door?"`
- **Read-Back:** **Day 4-6 (`The tower at night`)** — when the party climbs the tower stair (*"The lamp is out long before you reach the tower. When you climb in onto its stair, there is nobody in it"*) and discovers at the end of the night that the boat lay under the wall waiting for them to read the map aloud.

---

### Day 4-6 — The tower at night (`tone: "quiet"`)
- **Narrated Silence:** `"Garrick stands in the doorway looking out into the mist where the water laps at the wall."`
- **Click (`4-6-1` + `4-6-2`):**
  - *Puzzle:* `"Was the boat under the tower alone on the lake?"`
  - *Click Text:* `"Water rings were already spreading under the tower wall before our oars stopped, and a brief light answered out toward the reed island. A hidden boat lay beneath the stones and signaled across the dark before pulling for the drowned village."`
- **Nudge:** `"{friend:Aim}, water rings spreading under the stones while our oars were already still, and a brief light out toward the island. Someone was down there before us."`
- **Dawn Pin:** `"A boat lay in the black water right under the tower wall while the map was read aloud. Why was it waiting under an empty tower?"`
  - **Fork A:** `"They posted a listener at the tower waiting for us to assemble the map and speak the way aloud."`
  - **Fork B:** `"They were keeping watch on the shore road and hid under the wall when they heard our oars."`
- **Fragment 4-6 Question:** `"*\"We never asked what that would make them.\"* What has it made them?"`
- **Read-Back:** **Gathering 4 (`The Verse of the Four`)** — at *"Therefore the faithful have not waited for the ways to open. We have waited for those who can open them. Where the Seekers' children walk, the faithful follow, closer to them than their own shadows."*
