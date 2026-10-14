# Point 5: Fan Out clues and their value at the Campfire

Audit of the live code on `main`, 14 Oct 2026 (Campfire data v2.3, `src/data/campfire-days-v23.json`; Fan Out flow in `src/data/soloLandmarkProse.ts`).
Part A is Claude's own audit. Part B checks it against the six outside AI audits in `Audit_5.md` (ChatGPT, DeepSeek, Meta, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. How a clue reaches the player today

- Each day has **one** clue. Fan Out's Challenge and Fight branches both give that same clue (plus +150g and the first letter of the day's Seeker word). "Head to the Campfire" gives no clue to you; you read it on the board.
- The Campfire board always shows the clue anyway, credited to **Mei** (`soloLandmarkProse.ts` ~434). So skipping Fan Out loses nothing except gold and the letter.
- **12 of the 36 clues are the day's [PRESS ON] text** (1-2, 1-6, 2-2, 2-6, 3-3, 3-4, 4-1, 4-4, 5-3, 5-4, 6-3, 6-5). Since [PRESS ON] is not built on the weekday, this is the only way those details reach players.

**Correction to my Point 1:** I said the [PRESS ON] details for W2D2, W3D3, W5D3, W5D4 and W6D3 never reach the player. That was wrong. They do reach players, as that day's Fan Out clue and on the Campfire board. They are still missing from the day's own story.

### A2. Problems with the Fan Out flow itself

1. **The clue's name is on the button before you find it.** For example, W1D3's choice reads "Investigate Widow's Tooth to uncover 'The second ring'". The discovery is announced before it is made.
2. **The same enemy every day.** The Fight branch is always a "Rear-Guard Lookout at {place}", 36 times. It is not in canon, it is not tied to the story, and on some days nobody should be there (for example W1D3, after the man has already run).
3. **An invented device.** "The Seeker mason's guide-letter" gives the first letter of the day's word. It is useful for the puzzle, but it is invented lore and it is not part of the investigation.
4. **The Fan Out Challenge uses the old wrong roll** ("Obstacle 39", raw Attribute). It is the same bug as Task 1.
5. **Everyone who fans out finds the same thing.** With 2 to 6 real friends, Fan Out gives no reason to split up, and nobody brings back something only they saw. The Campfire loses its best fuel: "I found X, you found Y, what does it mean together?"
6. **The lead-in text says "the four of you"** every day (party size, Point 1).

### A3. The 36 clues, judged

I judged each clue on two questions. Does it make that day's place more intriguing? Does it give the table something real to argue about (does it lean the evening's Fork A or Fork B)?

**Strong: a concrete thing you can see, and it moves the argument (19)**
- 1-1 The even hand: no crossing-out, the inn's line in the same hand. Planned, not hurried.
- 1-2 Read the stubs: cut against a rule. She meant to send them.
- 1-6 Wade out: paint at gunwale height. There was a boat.
- 2-2 The ruts: the same cart as Week 1.
- 2-3 The scratches: dozens of tries over many days. He could not open what opens for you.
- 2-5 The ground-flat face: erased long ago. Leans "his own people", one of the best clues.
- 2-6 Ear to the rock: a bigger, empty room below.
- 3-3 Read the scratches: one rider weighs almost nothing. A child.
- 3-5 Cut twice: her name cut twice, the second pass deeper. She meant it to last.
- 4-1 Follow them: no prints come in. Someone waited out on the glass.
- 4-5 Long curls: nobody hurried him.
- 4-6 The rings: rings already spreading, though your oars were still. Someone was already there.
- 5-1 The crisp edge: an old carving, freshly cut away.
- 5-3 Go down to it: every old bar kept, for centuries.
- 5-4 Stop beside one: every soldier stopped on the same step.
- 5-5 One hand: every stroke in one hand, gone over, never redrawn.
- 6-3 The fire: they were already coming for the night, not hunting you.
- 6-4 The untouched grit: your boots are the first marks.
- 6-6 Every helm to the hall: not one turned to the hill.

**Middling: fair, but it confirms more than it opens (11)**
1-3 The second ring, 1-4 The leaned bar, 1-5 The knife, not the face, 2-1 The steady horse, 2-4 The second lamp, 3-2 The boy at the well, 3-6 No horses, 4-2 Every eye on the cart, 4-3 The oars at dusk, 5-2 Heads down, 6-2 The swept racks.

**Weak: atmosphere that does not touch the evening's question (6)**
- 3-1 The grey wool: confirms Ashcombe, which Corin already said.
- 3-4 The crack in the niche (bone die): lovely, but the fork is "are the chips for us or for herself?"
- 4-4 The small prints: moving, but the fork is about what "moon-blood" means.
- 5-6 The narrow slit: a hiding detail. Fork A and B ("hide the fifth / watch the hall") both survive it.
- 6-1 No light inside: barely touches "did he see us?"
- 6-5 The blank stone (chisel): the fork is "is the record a guess?". The chisel does not help decide.

### A4. Verdict

- The clue writing is good. About half the clues are strong and only six are weak. Most are physical and specific, as canon asks.
- **The system around the clues is the real problem:** one shared clue that the board hands to everyone anyway, the clue's name spoiled on the button, and the same invented "rear-guard" fight every day. So Fan Out feels like a reward machine (gold plus a letter) rather than an investigation.
- The highest-value fix is structural, not rewriting clues. For your decision:
  - Give each friend who fans out a **different** piece (canon already has material: the day's [PRESS ON], the "look here" choices, and the Fan Out clue).
  - Hide the clue's name until it is found.
  - Replace the generic rear-guard fight, or drop the fight branch.

---

## Part B: checked against the other AIs (`Audit_5.md`)

**Important:** ChatGPT, DeepSeek, Meta and Perplexity audited the **older clue set (v2.2)**. Their examples ("the fourth stub", "three pence", "four loaves", "unburned tallow", "the silent collar-bell", "pine/alder", "lead plugs") are **not in the current data**; I searched and found none. Their clue-by-clue verdicts no longer apply. Only Qwen audited the current v2.3 clues. Their general points still matter:

| Their point | Who | My view |
|---|---|---|
| Both branches give the same clue, and the board gives it to everyone anyway; Fan Out needs a clearer purpose | ChatGPT | **Agree.** Same as my main finding (A2.5, A4). |
| The first-letter hint should be shown as a separate reward from the clue | ChatGPT | **Agree.** |
| Some clues state a conclusion instead of an observation | ChatGPT | **Agree in principle.** Their examples are from v2.2. In v2.3 the clues are mostly observations. |
| Several clues duplicate the [PRESS ON] text | DeepSeek, Meta | **True, and bigger now: 12 of 36.** But it is deliberate in v2.3 (marked `source: press-on`), and since [PRESS ON] is not built, it is currently the only way those details reach players. Once [PRESS ON] is built, those 12 days need a new clue. |
| "Hearsay" clues ("the old man says", "the carter says", "she says") are weaker than things you see yourself | Qwen | **Partly agree.** Canon's rule is "a thing you can see, hear or count", so a witness is allowed. But 1-5, 2-1, 4-2 and 4-3 are the four flattest clues, and Qwen's proposed physical versions are stronger. Rewording is your call (story text). |
| 2-5 should lean "his own people", not "both" | Qwen | **Agree.** The weathered scars point to an old erasure. |
| 3-6 should become "only five sets of hoofprints come back down" | Qwen | **Disagree.** That invents a new fact (a rider who stayed in). Not without your OK. |
| 5-5 is redundant | Qwen | **Disagree.** "One hand, gone over for years, never redrawn" is new and eerie. One of the best clues. |
| Clues that lean "both" are a cop-out | Qwen | **Partly agree.** Some "both" clues are vague (3-2, 5-2). Others are deliberately two-sided (3-3, 5-3) and work. |
| "64% strong" score | DeepSeek | Not comparable: scored on the old set. On v2.3 I count 19 strong, 11 middling, 6 weak. |
| W3D3 clue claims "each child" before it is proven; W5D2 beasts need a cause; W6D2/W6D4 soldier and crack logic | Perplexity | These are about the chapters, not the Fan Out clues, and come from an older text. W5D2's chapter now gives a cause (the heartbeat). |

**Missed by all of them:** the clue's name on the button before you find it, the same "Rear-Guard Lookout" fight on all 36 days, the invented "mason's guide-letter", and the Fan Out Challenge using the old wrong roll.
