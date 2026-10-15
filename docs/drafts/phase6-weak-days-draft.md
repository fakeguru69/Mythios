**APPROVED 15 Oct 2026 (Fake Guru: "yes to all") and applied.** See the tracker entry of the same day.

# Phase 6: the weak days (fix plan item 32), draft for Fake Guru

Drafted 15 Oct 2026. **Nothing here is applied.** No canon file and no code was changed.

Sources: `docs/audits/point-4-daily-arc.md` (all), `point-10-pacing-and-verdict.md`, `point-8-prose-quality.md`, the six episode files, `mythios-question-ladder.md`, `mythios-mythology-canon.md`, `mythios-campfire-table-v2.md`, and the build data in `src/data/`.

How to read it: for each day, **canon now** (exact text, file:line) beside **proposed** (the smallest change that does the job). Every proposed line uses only facts already in canon. No new places, names or lore. No new Garrick lines.

One thing to know first: the audits and canon disagree on two of these days. The question ladder says three outside reviewers called W3D4 "a model day" and two called W6D1 "a model day" (`mythios-question-ladder.md:284`, `:430`). The audits call them weak. So both changes below are small on purpose.

---

## 1. W3D4, the black ridges (audit: filler)

**The problem.** The day's best moment, the bone die, is hidden in the optional [PRESS ON]. Most players never see it. Without it, the room is just "the Seekers slept here".

| Canon now | Proposed |
|---|---|
| `episode-3-the-fire-stone.md:396-398`<br>> Whoever wrote your fragments slept here, walking this same country, a long time ago.<br>><br>> Between the niches, at chest height, is a housing. | > Whoever wrote your fragments slept here, walking this same country, a long time ago.<br>><br>> **In a crack in the nearest niche is a single die, carved from bone, its spots worn almost smooth by somebody's fingers.**<br>><br>> **Whoever slept here had long nights too.**<br>><br>> Between the niches, at chest height, is a housing. |
| `:406-414` the [PRESS ON] "THE CRACK IN THE NICHE", whose detail is the die | **Remove this [PRESS ON].** Week 3 still has [PRESS ON] on Days 3 and 5. |
| `:429` You learned: … And the people who wrote your fragments once slept in a room the riders rode straight past. | You learned: … And the people who wrote your fragments once slept in a room the riders rode straight past. **They had long nights too.** |

**What it does for the player:** the Seekers stop being names on fragments and become people who waited out long nights, like the party does by the same doorway fire that evening. It also sets up W6D2, where their bunks are "pulled into a rough circle round a cold hearth, as if the people who slept here wanted to be near each other" (`episode-6-the-finale.md:188`).

**Why not keep the press with something else in it:** any new press detail would be new writing. Dropping the press is the smaller change. (Cost: one fewer +200g chance in Week 3.)

**Checks:** no gated word. No Garrick line (his only beat is the extra cup, unchanged).

**Other data that would need changing (not changed):**
- `src/data/chapterScripts.ts`: regenerate from the episode file (`scripts/gen-chapter-scripts.cjs`).
- `src/data/mythiosChaptersData.ts:270-271`: `hasPressOn: true`, `pressOnTitle`, `pressOnDetail` for W3D4.
- `src/data/campfire-days-v23.json` (~line 479-485) and `campfireDaysData.ts`: the 3-4 `fanOutClue` is the die, marked `"source": "press-on"`. `CampfireEveningView.tsx:104` still reads it. Once the die is on the main path it is no longer a find. Swap it for one of the approved 3-4 Fan Out leads (for example "Scratched on the back", `fanOutLeads.ts` 3-4), or mark it main-path.
- Canon copies of the same clue: `mythios-campfire-table-v2.md:162` and `:479`, `campfire-build-bundle.md:235`, `:552`, `:1101`.
- `mythios-question-ladder.md:276-283` (W3D4 entry): add the die to "Twist".

---

## 2. W4D3, Reedham (audit: "lead with *they are waiting for something*")

**The problem.** The day's turn (eight notches = they are holding Joss and waiting) comes after a three-way "look at things" choice, the same shape as W2D2 and W3D5. It is also the third relative to say "by name … the night he was born".

| Canon now | Proposed |
|---|---|
| `episode-4-the-water-stone.md:258-262`<br>> Joss's grandmother keeps the house at the top of the lane. She lets you in, and says one thing.<br>><br>> *"They asked for him by name,"* she says, *"and they knew the night he was born."*<br>><br>> After that she only stands, and lets you look. | > Joss's grandmother keeps the house at the top of the lane. She lets you in, and says one thing.<br>><br>> *"They asked for him by name,"* she says, *"and they knew the night he was born."*<br>><br>> **You have heard those words before: at the mill, and in Ashcombe.**<br>><br>> **After that she only stands, with her hand on the doorpost.** |
| `:264` `[THE SHELF]` `[THE WINDOW]` `[THE DOORPOST]` and `:266` *All three are seen.* | **Show the doorpost first, with no button** (move `:276-279` here: "Notches, cut with a kitchen knife … Eight."), then **move the count up** (`:289-293`, unchanged: "Eight nights. He was taken before you had even found Wren. … They are waiting for something.").<br>Then the choice becomes `[THE SHELF]` `[THE WINDOW]` (*The player looks at one first. Both are seen.*) |
| `:289-293` (after the notice line) | Moved up, as above. The notice line and the skiff follow as now. |

**What it does for the player:** the day opens on its question (why are they keeping him?) instead of finding it after a search. The repeated "by name, by birth night" line turns from a repeat into a pattern the player notices.

**Checks:** her line stays word for word (approved text, `:340`). The new narration line names no meaning, only that the words were heard before; the "marked" meaning was already given at Gathering 2. The twist still says "waiting for something", never "waiting for us" (ladder rule, `mythios-question-ladder.md:332`). No gated word. Garrick's skiff line (`:311`) unchanged.

**Other data that would need changing (not changed):**
- `chapterScripts.ts`: regenerate.
- `episode-4-the-water-stone.md:337` designer's notes ("a Choice of what to look at"), and `mythios-question-ladder.md:327` ("Player does").
- Campfire 4-3 (`campfire-days-v23.json` ~615): opener, forks and callback all still fit. No change.
- Fan Out 4-3 leads (the fisherman, the lane, the tower sill): none quotes the moved text. No change.

---

## 3. Week 6, Days 1 to 3 (audit: too alike)

The idea: each day gets its own feeling. **Day 1 fear** (are we found?), **Day 2 horror** (the dead walk), **Day 3 dread** (he is right there, and alive). Day 2 already does its job (audit ✔, and ChatGPT's "do not touch" list). So only Days 1 and 3 change.

### W6D1, Six nights: hold the fear

**The problem.** The fear is settled in the first ten lines. "It still does not. You have a safe room" comes *before* a Challenge whose failure is "the boots come back". That is reassuring the player before a risk (CLAUDE.md §1 rule 10).

| Canon now | Proposed |
|---|---|
| `episode-6-the-finale.md:50-54`<br>`[PLANT]` *(the Order does not know where you are)*<br>> It is a long wall, and from the square every slit in it looks the same. In all its centuries here the Order has never known this room was there. It still does not.<br>><br>> You have a safe room in the enemy's city. | **Move these lines, unchanged, to after Garrick's tally line (`:111`)**, just before the clock `[PLANT]` (`:113`). Nothing else changes. |

**What it does for the player:** they spend the whole Challenge not knowing if they are found. The relief comes at dusk, after the stroke, when it has been earned.

**Checks:** no words changed, only order. Both Garrick lines unchanged and in the same order. The Challenge's fail text (`:87-89`, the boots return and walk on) now carries real fear. The summary card (`:120`, "you are not found") still holds, because the answer still arrives that day.

**Other data:** `chapterScripts.ts` regenerate. Campfire 6-1 (fork "They think the light was nothing / They know someone's in the wall") fits better than before. No change.

### W6D2, Five nights: horror (no change)

Leave as is. The soldier in the doorway and "every helm is turned to the hall" already do it.

### W6D3, Four nights: make it dread

**The problem.** The theory barely moves (ChatGPT). The hand on the wall finds warmth, which W5 already hinted. The heartbeat is in the day's first line (`:234`) but never meets the player's hand.

| Canon now | Proposed |
|---|---|
| `episode-6-the-finale.md:290-292`<br>> The stone is warm.<br>><br>> Not sun-warm. There has been no sun for days. Something on the other side of this wall is warm, and has been for a very long time. | > The stone is warm.<br>><br>> Not sun-warm. There has been no sun for days. Something on the other side of this wall is warm, and has been for a very long time.<br>><br>> **Then the heartbeat comes, and you feel it in the stone under your hand before you hear it.** |
| `:309` You learned: **the hall's wall is warm.** Something behind it has been warm for a very long time. … | You learned: **the hall's wall is warm, and the heartbeat comes through it.** Something behind it has been warm for a very long time. … |

**What it does for the player:** "He is on the other side of this wall" (`:304`) stops being a guess and becomes something the player has felt in their own palm, four nights out.

**Checks:** this is canon already. The heartbeat comes "from behind" the hall's doors (`episode-5-the-kings-stone.md:437`), and "when the beat comes, the ground moves with it" (`:211`). "Heartbeat" is gated from W4D6, so W6 is fine. It gives only what a hand can know (the ladder's version 3 rule, `mythios-question-ladder.md:448`). No Garrick line. It fits the approved Fan Out lead "Warm low down" (`fanOutLeads.ts` 6-3).

**Other data:** `chapterScripts.ts` regenerate. `mythios-question-ladder.md:445` ("Answer") could add the line. Campfire 6-3 opener "The hall's warm from within…" still fits. No change needed.

---

## 4. W2D1, the mill road (audit: a bridge day)

**The problem.** The day's twist (the farmer uses the Fenmark boy's words, so these are the same people) is in the text but never said or kept. The summary card leaves it out, so the day reads as "a cart went upriver".

| Canon now | Proposed |
|---|---|
| `episode-2-the-wind-stone.md:106-110`<br>> *No lamps. Moving like they'd done it before.*<br>><br>> The boy at Fenmark said that, in nearly those words, a week ago and a whole county away.<br><br>> You are too late to stop it. But you know which way it turned. | > *No lamps. Moving like they'd done it before.*<br>><br>> The boy at Fenmark said that, in nearly those words, a week ago and a whole county away.<br>><br>> **The same people.**<br><br>> You are too late to stop it. But you know which way it turned. |
| `:127` You learned: the next name is **Corin**, the miller's boy. A cart with no lamps went up to the mill three nights ago and came back before dawn. It turned upriver. | You learned: the next name is **Corin**, the miller's boy. A cart with no lamps went up to the mill three nights ago and came back before dawn. It turned upriver. **The same people who took Tamsin.** |

**What it does for the player:** the day gives one real step: it is not one village's trouble, it is one group working across the country. That leads into Week 2's "a faith, not a ring".

**Checks:** "The same people" is the ladder's own approved twist (`mythios-question-ladder.md:195`). No gated word ("the Order" is not used; that waits for W3D1). Garrick's lines unchanged.

**Other data:** `chapterScripts.ts` regenerate. Campfire 2-1 callback (Tamsin's "the mill boy next") still fits. No change.

---

## 5. The repeated "family of a missing child" scene

The five the audit lists are not all the same:

| Day | Who | Verdict |
|---|---|---|
| W1D4 | a boy who saw it (a witness, not family) | Keep. Different shape: a chase, then a standoff. |
| W1D5 | the aunt of the *earlier* child | Keep. It is the week's best twist ("it has happened before"). |
| W2D2 | the miller's wife: "by name … the night he was born" | Keep. First time the line is heard. |
| W3D2 | Wren's mother: same line, plus "only the once" | Keep. She gives the season's key clue, in three questions the player picks. |
| W4D3 | Joss's grandmother: same line | **Vary this one** (section 2): she says only the line, the narration names it as the third time, and the doorpost does the rest. |

**Recommendation: change only W4D3.** Canon has already cut her to one line (designer's notes, `episode-4-the-water-stone.md:339`). Section 2 finishes that job. Changing W2D2 or W3D2 would cut approved lines that later days depend on.

---

## 6. The repeated slot shapes

- **Day 4 often doesn't change the question (W2D4, W3D4).** W2D4: leave it (first sight of the ritual, Corin alive; the audit already disagrees with DeepSeek here). W3D4: fixed by section 1.
- **"Inspect three things" (W2D2, W3D5, W4D3; W1D5 too).** Change only W4D3 (to two, with the doorpost given, section 2). W2D2 is the first time the shape appears. W3D5 is one of the season's strongest days, and its three looks hold the "Until the throne rise whole" reveal. W1D5's looks decide how the fight opens, so they do a job.
- **Every Day 6 is "six fragments form a map".** Leave it. It is a ritual the player learns to expect, and canon already makes each one different (`mythios-question-ladder.md:497`: discovery, a race, a sighting, reading aloud overheard, silence, a door). The map needs to be the same act each week, because the season's secret is that this act is what the Order watches for.

Not in this task but flagged by the audits, left alone: W1D4 ("facts, little inference"), W3D3 (travel over deduction; its best detail already reaches players as a Fan Out clue), W5D3 and W5D4 (two exploration days in a row), W5D6.

---

## 7. Ranked recommendation

1. **W6D1: move the "safe room" lines to dusk.** No new words, only order. It also fixes a rule break (reassuring before a risk). Highest value, lowest risk.
2. **W4D3: lead with the doorpost and the count; two looks, not three; one recognition line.** Fixes three audit points at once: the weak day, the family repeat and the slot repeat.
3. **W6D3: the heartbeat under the palm.** One line, all canon, gives the finale run-up its dread.
4. **W3D4: the bone die onto the main path, drop that day's [PRESS ON].** Good, but it touches the most data (campfire clue, press flags, canon copies).
5. **W2D1: say "The same people."** Small gain. The day already has a clear direction.
6. **Leave as is:** W6D2, W2D2, W3D2, W3D5, W2D4, and the Day 6 map shape.
