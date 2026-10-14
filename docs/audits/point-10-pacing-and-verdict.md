# Point 10: Button-rushing, pacing, and the final verdict

Audit of the live code on `main`, 14 Oct 2026, drawing on Points 1 to 9 in this folder.
Part A is Claude's own audit. Part B checks it against the outside AI audits in `Audit_10.md` (DeepSeek, Meta, ChatGPT, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. How many taps a weekday takes (estimated from the code)

| Part of the day | Taps | Weight |
|---|---|---|
| Challenge: pick a skill, roll | 1–2 | Real choice, but generic stat buttons (Point 9) |
| Detour fight on a failed Challenge | 3–4 | None: the same "lookout" everywhere |
| Main fight: one ROLL tap per round (about 4 rounds on average) | 3–6 | None: pure dice maths. Canon says no per-round button (4 Oct). |
| Fan Out: pick a branch, then its roll or 2–3 fight rounds | 2–4 | Low: the same clue the board gives anyway (Point 5) |
| Seeker Fragment: open the Bag, tap letters for two words | 10–15 | Good: tactile and self-paced |
| Private theory prompt before the Campfire | 1–2 | Duplicates the Campfire's own Fork |
| Campfire: 8 steps (Next, pin a theory, riddle, fragment) | 8–14 | Mixed: the Fork is good; the rest is mostly Next |
| **Total** | **about 30–45** | |

**Where the density is too high:** fight rounds (taps with no decision), the second encounter in Fan Out, and the run of "Next" taps through the Campfire's eight steps.

**Where weighty choices are missing:** the three real decisions canon gives each day aren't offered. They are the "look here or look there" choice, "who strikes first", and [PRESS ON] (risk more for more). So the taps the player makes are mostly mechanical, and the ones that would matter are absent.

**Verdict on button-rushing:** yes, a day currently feels like a checklist. That's not because there are too many taps in total; the fragment taps are fine. It's because most taps carry no decision and the decisions were removed.

### A2. Would I be excited to open this every day for six weeks?

**The game as designed in canon: 8.5 / 10.** The mystery is excellent:
- a list that turns out to be about children
- your own blood opening locks
- a king being woken
- someone among you cutting the ropes
- a dead city counting down
- an innkeeper who never once lied

The Campfire is a real social idea, and the fragments are some of the best writing in it.

**The app as built today: 5.5 / 10.** It's lower than the other AIs' scores because the audit found that much of that mystery never reaches the screen:
- the day's Pull line
- Garrick's planted lines
- the dates beside your names, which Week 2's twist needs
- the "look" choices, [PRESS ON] and "What you notice"
- the child rescues
- canon's Lore and quote-backs, including the finale's whole season quote-back
- the Garrick Recap

The rules core is also off (the roll, damage, free rolls, replay rewards), and the party is stuck at four.

**What holds it back from 10:** the build replaced canon's day and Gathering structure with generic templates. Fixing that is mostly restoring what is already written, not new writing.

### A3. The top 5 highest-leverage changes

1. **Build each weekday from canon's episode text:**
   - scene
   - the "look" choice
   - the "What you notice" line
   - a Challenge card with canon's per-day verbs and fail cost
   - the result
   - the Pull
   - the day summary card ("You hold…")

   This brings back the dates and cup plants and the Pull, and fixes most of Points 2, 4, 8 and 9 with no new writing.
2. **Make each Gathering tell its week's story.** Show the rescue on screen, use canon's Lore, Twist and Cliffhanger, quote back canon's fragments (including the finale's full season quote-back), and stop the quiz from giving the twist away. Build the Garrick Recap as the season's ending.
3. **Fix the rules core.**
   - The canon roll (tier bonus against the DC, "You succeed on X+").
   - Fights that play out beat by beat with canon damage, with no per-round taps.
   - Close the loopholes: replay rewards, the rally button, free Fan Out rolls, Detour growth, unlimited fragment retries.
   - Then the numbers pass.
4. **A real party of 2 to 6.**
   - One party list everywhere.
   - Nudges that rotate.
   - Canon's "one fragment word per friend per day".
   - Fan Out that sends different friends to different pieces, so each brings something only they saw to the fire.
5. **Cut the empty taps:** auto-play fights, one meaningful Fan Out choice (drop the generic rear-guard), remove the free-text "Tell Mythios" box, and drop the private theory ballot that spends the Fork before the friends meet.

---

## Part B: checked against the other AIs (`Audit_10.md`)

### B1. Scores

| AI | Score | Their reasoning |
|---|---|---|
| DeepSeek | 6.5 | "A 10/10 mystery wrapped in a 4/10 prose experience" |
| Meta | 6.5 | "A 9/10 mystery and a 6.5/10 daily loop" |
| ChatGPT | 6.5 | Too many beats competing for attention; the Campfire can become a form |
| Qwen | 7.2 | Story 9, social design 8, mechanics 5 |
| Grok | 6 | "The mystery is ahead of the loop" |
| Perplexity | none | **Off-topic.** Its answer is a writing plan for the question ladder, not Point 10. |
| **Claude** | **5.5 today (8.5 as designed)** | Same view of the mystery; lower because much of it never reaches the screen in the current build (A2). |

**All agree:** the mystery is far stronger than the daily loop. They differ only on how much of the mystery the app actually delivers. They scored the older 10 Oct bundle and mostly judged the written content. I checked what reaches the screen.

### B2. Their top changes compared with mine

| Their change | Who | My view |
|---|---|---|
| Rewrite every day's prose as a scene | DeepSeek, Grok ("let the chapter line be the whole narration") | **Agree on the goal.** But canon's episode prose already exists. Show it rather than write new (my change 1). |
| Fix the 2–6 player scaling | DeepSeek, Qwen | **Agree** (my change 4). |
| Rebuild the Gathering around the story's real beats; add the missing scenes (prisoner capture, taking the fifth Stone, the finale's third act) | DeepSeek | **Agree** (my change 2). Canon already writes these scenes. |
| One roll function using tier bonuses everywhere; close the replay loophole | Qwen | **Agree** (my change 3). |
| Make the party "four specific people, not a chorus" | DeepSeek | **Disagree.** The party is 2 to 6 real friends. Specific moments should come from each friend's own choices and finds, not a fixed cast. |
| Drop the second full encounter (Fan Out); "one morning, one verb, one new fact" | Grok | **Partly.** Agree it needs cutting back. Canon's day has one paid beat. Fan Out was approved in principle on 8 Oct, so keep it as one quick, meaningful choice (my change 5). Your call. |
| Kill the private theory ballot; ask the question once, at the fire | Grok | **Agree** (my change 5). |
| Make tomorrow's first line depend on today's last choice; failure should cost something you carry | Grok | **Agree in spirit.** Canon keeps failure light (gold and time; nobody dies). The lines that open each day already differ on pass and fail. Showing the Pull and the "You hold" line would make that visible. |
| "The stone is a fuse": one missing word per fragment, read where it was found | Grok | **Disagree.** Two words per fragment and the Seeker Chest are canon (Core Rules §6) and the best-liked mechanic in the build. Canon's "one word per friend per day" rule already makes it social. |
| The Campfire's eight steps can feel like a form | ChatGPT, Qwen | **Agree.** Keep the Fork, cut the run of "Next" steps. |
| The fragment puzzle is the best-paced part | Qwen | **Agree.** |
| Skipping optional content must not feel like falling behind | ChatGPT | **Agree.** |

### B3. Missed by all of them

What all of them missed is that canon already contains the solution to most of their top-five lists:
- the scene prose
- per-day button verbs and fail costs
- the Pull and the day summary card
- the Gathering scenes, Lore and quote-backs
- the Garrick Recap design

The highest-leverage work is building the app from canon, not rewriting the game.
