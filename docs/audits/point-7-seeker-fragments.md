# Point 7: The 36 Seeker Fragments, hindsight and weekly gut-punch

Audit of the live code on `main`, 14 Oct 2026: `src/data/mythiosFragments.ts`, the Bag's word-lock puzzle, and the Gathering Match (`src/data/mythiosGatheringsAndAudit.ts`), compared with `docs/canon/mythios-fragment-registry.md` and the episode files.
Part A is Claude's own audit. Part B checks it against the outside AI audits in `Audit_7.md` (ChatGPT, DeepSeek, Meta, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. The fragments match canon exactly

I compared all 36 by script against the canon registry. **Every text, every pair of missing words and every letter jumble matches** (each jumble uses exactly the letters of its word, and none is already the answer). The fragments themselves are not a build problem. They are locked canon, and their weaknesses are design choices for Fake Guru.

### A2. The real problem: the payoff is cut from the Gatherings

Canon's rule is that a fragment pays off when a Gathering quotes it back word for word (each Gathering reads its strongest ones). The app's Match uses three per Gathering, but not canon's.

| Gathering | Canon quotes back | App's Match uses |
|---|---|---|
| 1 | 1-4, 1-5, 1-6 | 1-4, 1-3, 1-6 |
| 2 | 2-1, 2-3, 2-4, 2-6 (+1-4) | 2-1, 2-4, 2-2 |
| 3 | 3-1, 3-2, 3-3 (+1-2) | 3-1, 3-3, 3-6 |
| 4 | 4-2, 4-3 (+4-6 as the betrayal lands, per the registry) | 4-3, 4-2, 4-5 |
| 5 | 5-1, 5-3, 5-4, 5-5, 5-6 | 5-4, 5-5, 5-6 |
| **6 (finale)** | **1-5, 1-6, 3-3, 3-5, 4-4, 5-3, 6-1, 6-2, 6-6** | **6-2, 6-1, 6-4** |

(A script found the canon list by searching each episode's Day 7 for the exact fragment text, so treat it as close, not exact.)

- **The finale loses its gut-punch.** In canon, Week 6 reads back the whole season's lines in their new meaning:
  - "The power that gives is also the power that takes" (1-5) and "The key that locks is also the key that unlocks" (1-6)
  - "He never lied to us. He only never told us the price" (3-3), which is exactly how Garrick worked
  - "Bloodlines outlast kingdoms" (3-5)
  - "Moon-blood woke it once…" (4-4)
  - "None of us gave to the fifth" (5-3)
  - "you are ours" (6-6)

  The app quotes none of these. The fragments that make the twist click in hindsight are never put in front of the player at the moment it lands.
- **Week 4 loses its betrayal line.** "We made our children the only key. We never asked what that would make them." (4-6) is the season's moral crux. Canon re-quotes it when the betrayal lands; the app doesn't.
- **Week 1 has a "Scripture Match"**, but canon says there is no Cult Bible yet in Week 1. The app shows Order scripture a week early, from "the fallen commander's satchel" (Point 2).
- **The Garrick Recap** (canon: after the finale, show each fragment beside its payoff) is not built.

### A3. The puzzle and its rewards

- ~~The Day 6 map forms whether or not you solved anything.~~ **Correction (14 Oct):** this is canon, not a bug. Core Rules §6: "At the end of Day 6 anything unsolved completes itself, with no gold and no name on it, and the six fragments form the week's map." Solving still matters for the 25g per word and, since 14 Oct, the +2 map bonus on the Approach.
- **The hints stack up:** Fan Out gives the first letter of word 1, and retries are unlimited (Point 1). Canon's rule is "after 5 wrong tries, wait 2 minutes", and the server checks the answer.
- **Canon says each friend may fill one word per fragment until the day ends,** then anyone may fill the rest. The app lets one player fill both at once. With 2 to 6 friends this rule is what makes fragments a shared, social puzzle.
- Everything solved is credited to "Jennifer".

### A4. The fragments themselves (judgement, for Fake Guru)

- **Strongest:**
  - 2-4 (he went down alone; his hand was bleeding)
  - 2-6 ("Morning came. The enemy did not.")
  - 3-1 (they stopped being ours)
  - 3-3 (never lied, only never told the price)
  - 3-6 (no grave; our blood will have to hold him)
  - 4-5 (a lock that is also a door)
  - 4-6 (our children the only key)
  - 5-3 (none of us gave to the fifth)
  - 5-4 (we left them standing)
  - 6-6 (you are ours; finish what we could not)
- **Weakest as reading:** 1-2, 3-2, 3-4, 5-1, 5-2 and 6-3. They're abstract or deliberately oblique. Note that canon *requires* 3-4 and the Week 6 lines to stay oblique (the party must not work out "royal blood" before the finale).
- **Weakest as puzzles:** pairs where one word gives away the other: locks/unlocks (1-6), woke/wake (4-4), four/five (4-1), gives/takes (1-5), gave/take (5-1). Also very short or obvious words: "hid" (3-4), "key" (4-6), "dark" (6-5). In 5-2 the two blanks sit side by side ("We had ___ ___ every one of them"), which reads badly. Canon chose the pairs on purpose ("where a fragment turns on a pair, the pair is the lock"), so this is a puzzle-versus-meaning trade-off.

### A5. Verdict

The fragments are some of the best writing in the game and are carried over faithfully. What's broken is the payoff. The finale and Week 4 don't quote back the lines that make the season click, the Day 6 map doesn't need them, and the puzzle is too easy to skip or brute-force. Restoring canon's quote-backs costs no new writing.

---

## Part B: checked against the other AIs (`Audit_7.md`)

| Their point | Who | My view |
|---|---|---|
| The key fragments are "buried": 5-3 (the finale's crux), 6-6 (the emotional payload), 4-6 (the ethical crux) | DeepSeek | **Agree, and the cause is in the app.** Canon fixes this by quoting them back at the finale and the Week 4 betrayal. The app's Match drops all three. Restore canon's quote-backs rather than reorder the fragments. |
| Weak lock-word pairs: locks/unlocks, woke/wake, four/five, gives/takes, gave/take, dark/there | DeepSeek, Meta, Perplexity, Qwen | **Agree** as puzzles (A4). Canon picked them on purpose; your call. |
| Vague lines: 5-1, 3-2, 6-1, 1-5 | DeepSeek, Perplexity | **Partly.** 5-1 and 3-2 are weak. 6-1 is deliberately vague (canon forbids hinting the royal heir early) and the app pays it off at Gathering 6 ("We were only servants, they said"). 1-5 is a refrain whose meaning lands in Week 3 and the finale. |
| 1-1 ("four scattered, one stayed close") contradicts 6-3 ("we carried the five away") | ChatGPT | **Disagree.** They agree: all five were carried out of the hall; four were then scattered, and one (the fifth) was kept close at Highwall (5-5). |
| Rewrite 5-3 because it's too opaque | ChatGPT | **Disagree.** It must stay opaque: it's the finale's fair-play clue, and canon forbids revealing royal blood before Week 6. |
| Replace "shards" with "Stones" in 6-2 | ChatGPT, DeepSeek | **Disagree.** "Shard" is canon (the Stones are shards of the moon; Meira's notes make the link). |
| Rewrite 6-1 to link the household to the bloodline explicitly | DeepSeek | **Disagree.** That gives away the finale before Week 6. |
| Week 2's fragments are the strongest set | DeepSeek | **Agree.** |
| The registry is "exceptionally strong"; the problems are lock-words | Qwen | **Agree** on the writing. The bigger problem is the missing payoff (A2). |

**Missed by all of them:** the app's Gathering Match uses different fragments from canon and drops the finale's whole quote-back (A2); the Day 6 map forms without solving anything; and the app ignores canon's "one word per friend per day" rule that makes fragments a group puzzle.

**Agreed by all:** the fragment writing is strong, especially Weeks 2 to 5.
