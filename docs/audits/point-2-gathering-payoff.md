# Point 2: Does each Gathering pay off its week?

Audit of the live code on `main`, 14 Oct 2026: the six weekday chapters of each week against what the Gathering screen actually shows (arrival, Approach, Battle, United Effort, three verse Matches, Table Question, reveal, cliffhanger), compared with `docs/canon/mythios-season-reveal-map.md` and the episode files.
Part A is Claude's own audit (with one correction). Part B checks it against the outside AI audits in `Audit_2.md` (ChatGPT, DeepSeek, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. Problems that hit every week

1. **The child is never rescued on screen.** Tamsin, Corin, Wren and Joss are saved off-screen; you learn it from the next morning's recap.
2. **The reveal is a three-choice quiz.** A wrong pick shows a hint and you pick again, so the choice changes nothing (this answers Task 11). The wrong answers are invented story.
3. **The same generic text appears every week.** Garrick's opening ("Mythios sets the trial before us… beside you four") is out-of-game talk and fixed at four. The verse always comes "from the fallen commander's satchel"; in canon each week's source differs and matters (the ledger, the dying watchman, Garrick's own copy).
4. **Canon's spoken story parts are missing:** the Lore Reveal speeches and Ask (questions to Garrick).

### A2. Week by week

| Week | Reveal | Verdict |
|---|---|---|
| 1 | "It's about children, not you" | Partly holds. The trail is solid, but W1D2 and W1D4 already say it's about children. "Three more" is the real hook. |
| 2 | "You're marked too" | **Corrected: not earned in the app** (see B1). Canon's ledger and the naming of the Order are also missing; the cliffhanger pockets a ledger never shown. |
| 3 | "He sleeps; they're waking him" | Holds on paper, weakened on screen. The carving is only a summary line, "the captive cannot lie" is told in the question itself, and the vent box is missing. |
| 4 | "The Stones were carried to him, through your blood" | Partly unearned and contradicts itself (children's blood vs your blood). It leans on the vent box and on "every socket", which you never saw. The cliffhanger is strong. |
| 5 | "Your blood fails: where he fell, under the dark moon, seven nights" | Holds, best paced. Only the count is wrong ("seven" said a day early). |
| 6 | "Garrick is the heir; you carried the fifth for him" | Doesn't land. The question gives the reveal away, and Garrick's weekday clues are mostly not shown (the extra cup does appear on 8 Campfire nights). |

**Revised ranking (holds up best to worst):** Week 5, Week 3, Week 1, Week 2, Week 4, Week 6.

**Overall:** canon's Gatherings are well built. The app uses one generic five-step template filled from data fields, which drops most of canon's story beats. The fix is to build each Gathering around its week's story.

---

## Part B: checked against the other AIs (`Audit_2.md`)

### B1. Where they corrected me

- **Week 2's twist is not earned in the app (Grok, ChatGPT). I was wrong to call it the best earned.** The twist depends on dates beside the players' names. Canon plants it on W1D2 ("The same names, each with a date beside it"), but the app never shows that line. The first mention is inside Gathering 2's question. Fix: show canon's W1D2 line.

### B2. Found by them, missed by me (confirmed)

| Finding | Who |
|---|---|
| Taking the fifth Stone happens off-screen | DeepSeek |
| Capturing Gathering 3's prisoner happens off-screen; he just appears at the Table Question | DeepSeek |
| Gathering 4's question cites a **"second boat" pulling away**. Canon has it (`episode-4`, lines 692 and 835); the app never shows it. | Grok |
| Gathering 2's **win** text leaves Corin out; only the lose text mentions him | Grok |
| Week 6's wrong-answer hint has Mei explain the whole twist out loud | Grok, ChatGPT |
| Week 6 wrong answer C (Garrick is a Hollowed soldier) contradicts six weeks of him eating and bleeding | Grok |

### B3. Where we agree

- Rescues happen off-screen (all).
- Week 1's twist was already known by Day 2 (Grok).
- Gathering 4 leans on evidence never shown (Grok, ChatGPT: "strengthen Week 4's evidence chain").
- Week 5 is the best-built Sunday (Grok: "the only Sunday that is the last scene of the week you just played").

### B4. Where I differ

- **ChatGPT rates Weeks 1, 3, 5 and 6 "Strong".** That judges canon's writing. The app's screen (quiz format, missing scenes) weakens all of them. Both views are true; the fix list should follow the app.
