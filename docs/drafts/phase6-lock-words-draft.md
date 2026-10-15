# Draft: weaker fragment lock words (Phase 6)

**Status:** proposal only, for Fake Guru. Nothing here has been changed in canon or code.
**Date:** 15 Oct 2026.
**Source of the problem:** `docs/audits/point-7-seeker-fragments.md`, A4.
**Data:** `src/data/mythiosFragments.ts` (the game) and `docs/canon/mythios-fragment-registry.md` lines 137 to 186 (canon's "Fragment locks" table).

## The rules this draft follows

- **The fragment's words never change.** Only the choice of which two words are blanked.
- **Canon's own rules for choosing** (registry line 141): pick the words that carry the meaning. Each word must appear **only once** in its fragment, or the visible copy gives it away. Where a fragment turns on a pair, canon made the pair the lock on purpose.
- **A day never quotes its own fragment in full** (registry line 186). A lock word in ordinary narration is fine. A lock word in a Garrick line is not (that is why 6-5 moved from *always* to *there*).
- **First-use gates** (CLAUDE.md §6). None of the new words below is gated. All the fragments stay in the same week, so nothing shows earlier than it does today.
- **Prefer words of 4 letters or more** that the other blank does not give away.

## What the Gathering and the finale rely on (checked)

| Where | Which fragments | Does a changed blank break it? |
|---|---|---|
| Gathering Match (`src/data/gatheringScripts.ts` lines 568, 596, 1013, 1036, 1661, 1787, 2071, 2084, 2498, 2516) | 2-1, 2-4, 3-1, 3-3, 4-3, 4-2, 5-4, 5-5, 6-2, 6-1 | **No.** None of the nine flagged fragments is a Match. |
| Gathering 6 read-back, whole line | 4-4 (`gatheringScripts.ts:2445`), 1-6 and an echo of 4-6 in Garrick's line (`:2605`), 1-5 (`:2626`). Same lines in `episode-6-the-finale.md` 781, 888, 906. | **No.** They quote the whole fragment, not the blanks. |
| Day text that says a fragment aloud | 1-5: the charcoal woman says the whole line (`chapterScripts.ts:854`, `episode-1-the-list.md:569`). Canon keeps this on purpose (registry line 186). | Not a break, but it means **no blank choice can make 1-5 a real puzzle.** |
| Old Match list (`src/data/mythiosGatheringsAndAudit.ts:62-63`, 1-6) | Not played any more (the live Gathering uses only its United Effort and enemy fields). Whole line. | **No.** |
| Fire meaning question (`src/data/fragmentMeaningQuestions.ts`) | It is asked only once the fragment is complete. | **No.** It may quote a lock word, because the player has already solved it. |
| Fan Out first-letter hint (`src/data/fanOutLeads.ts`, `hintFor`) | `hintFor` says "word 1" or "word 2". The letter itself is read from the fragment data. | **No data change.** If a word changes, the hint letter changes by itself. |
| Garrick's Recap (`src/data/garrickRecap.ts`) | Garrick's lines only, no lock words. | **No.** |

I also checked each new word below against that day's chapter text, its three Fan Out leads and its Campfire day (`campfire-days-v23.json`): **none of them appears there.**

---

## 1-5 · Week 1 Day 5 · the hollow tree

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:51`, registry line 149) | The power that **gives** is also the power that **takes**. | The power that **gives** is **also** the power that takes. |
| Lock words | gives · takes | gives · also |
| Problem | One word gives away the other. | *Also* is a filler word. |
| Why canon chose it | It is Refrain 1, the season's first theme line. The pair *is* the meaning. *Power* cannot be blanked (it appears twice). | |

- **Bigger reason to keep:** the charcoal woman says the whole line aloud on this very day (`chapterScripts.ts:854`). Whatever is blanked, the player has just heard it.
- **Recommendation: keep.**

## 1-6 · Week 1 Day 6 · the ford-stone

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:59`, registry line 150) | The key that **locks** is also the key that **unlocks**. | The key that locks is **also** the key that **unlocks**. |
| Lock words | locks · unlocks | also · unlocks |
| Problem | *Unlocks* gives away *locks*, and the other way round. | *Also* is a filler word, and *unlocks* is still easy with *locks* showing. |
| Why canon chose it | Refrain 2, quoted back at the finale. The turn (lock / unlock) is the whole point. *Key* and *that* appear twice, so they cannot be blanked. | |

- *Unlocks* is 7 letters, so its jumble is not trivial.
- **Recommendation: keep.**

## 3-4 · Week 3 Day 4 · the black-ridge niche

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:143`, registry line 160) | What we **hid**, we **locked** with what we are. | What we hid, we **locked** with what we **are**. |
| Lock words | hid · locked | locked · are |
| Problem | *Hid* is 3 letters and easy. | *Are* is also 3 letters and even easier. |
| Why canon chose it | Canon notes this itself (registry line 182): the fragment has no longer word that matters as much. *What* and *we* repeat, so they cannot be blanked. | |

- Canon also wants this line kept oblique (registry line 66).
- **Recommendation: keep.**

## 4-1 · Week 4 Day 1 · the last black rock

| | Keep as canon | Proposed |
|---|---|---|
| Fragment (`mythiosFragments.ts:169`, registry line 163) | We did not trust **four** locks to hold what needed **five**. | We did not **trust** four locks to hold what needed **five**. |
| Lock words | four · five | trust · five |
| Problem | Four and five are a counting pair, so each gives the other away. | *Five* is still guessable, but *trust* is a real puzzle. |
| Why canon chose it | The fragment turns on four against five (the false hope that a fifth exists). | |

- **Meaning kept:** *five* (a fifth exists) stays a lock. *Trust* is the Seekers' doubt, which is what the fragment is really about.
- **Gates:** *five* is allowed from W3D3. *Four* becomes visible; it is allowed from W2D1. Both fine in Week 4.
- **What else changes:** word 1, its jumble (for example T S U R T), and the hint letter for word 1 (F becomes T; leads 4-1-1 and 4-1-3, `fanOutLeads.ts:1060` and `:1096`). The registry row (line 163). The fire question (`fragmentMeaningQuestions.ts:25`) quotes "needed five": still fine, as it is asked after solving.
- **Small catch:** *trust* has an anagram, *strut*. It does not fit the sentence, so it should not confuse anyone.
- **Recommendation: change.**

## 4-4 · Week 4 Day 4 · the market cross

| | Keep as canon | Proposed |
|---|---|---|
| Fragment (`mythiosFragments.ts:193`, registry line 166) | Moon-blood **woke** it once. Moon-blood will **wake** it again, if it is ever let near. | Moon-blood **woke** it once. Moon-blood will wake it again, if it is ever let **near**. |
| Lock words | woke · wake | woke · near |
| Problem | *Woke* and *wake* are the same word, so solving one solves the other. | *Woke* is still easy with *wake* showing, but *near* is new. It is also the warning's real condition: keep it away. |
| Why canon chose it | The pair; the line is the anchor of the misdirection. *Moon-blood* appears twice, so it cannot be blanked. | |

- **Meaning kept:** *woke* stays. *Near* is the part the finale turns on (Garrick is the moon-blood that was let near).
- **Gates:** *moon-blood* is allowed from W4D4, which is this day. *Wake* becomes visible; it is not gated.
- **What else changes:** word 2, its jumble (for example R A E N), and the hint letter for word 2 (W becomes N; lead 4-4-2, `fanOutLeads.ts:1246`). The registry row (line 166). The designer's note in `episode-4-the-water-stone.md:432` names *woke* and *wake* as the lock words and would need updating. The Gathering 6 read-back (`gatheringScripts.ts:2445`) quotes the whole line and is unaffected. The fire question quotes "woke it once": still fine.
- **Small catch:** *near* has an anagram, *earn*. It does not fit the sentence.
- **Recommendation: change.**

## 4-6 · Week 4 Day 6 · the tower stair

| | Keep as canon | Proposed |
|---|---|---|
| Fragment (`mythiosFragments.ts:209`, registry line 168) | We made our **children** the only **key**. We never asked what that would make them. | We made our **children** the only key. We never **asked** what that would make them. |
| Lock words | children · key | children · asked |
| Problem | *Key* is 3 letters, and after a season of locks and keys anyone will guess it. | Both words are real puzzles. |
| Why canon chose it | *Key* links to Refrain 2 and the finale's "You were the key." | |

- **Meaning kept:** *children* stays. *Asked* is the moral weight: they never asked.
- *Key* stays visible, so the link to "the only key" and the finale is read anyway. The finale quotes Garrick's whole line (`gatheringScripts.ts:2605`) and is unaffected.
- **Avoided:** *make*, because *made* is visible and would give it away.
- **What else changes:** word 2, its jumble (for example D E K S A), and the hint letter for word 2 (K becomes A; lead 4-6-2, `fanOutLeads.ts:1358`). The registry row (line 168), and the registry note at line 182 that names *key* as a 3-letter word. The fire question (`fragmentMeaningQuestions.ts:30`) quotes "We never asked…": still fine, as it is asked after solving.
- **Recommendation: change.**

## 5-1 · Week 5 Day 1 · the waystone

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:219`, registry line 169) | He **gave** us the war. Then it began to **take**. | He gave us the **war**. Then it began to **take**. |
| Lock words | gave · take | war · take |
| Problem | Give / take pair, and after 1-5 the player already knows the refrain. | *War* does not give away *take*, but it is only 3 letters and easy after Week 2. |
| Why canon chose it | It is a trimmed echo of Refrain 1. Solving the pair is hearing the refrain again, which is the point. | |

- *Began* is the only other 4+ word, and it carries no meaning.
- *Take* appears in the day's ordinary narration ("TAKE IT", "take a rubbing"). That is allowed and the same either way.
- **Recommendation: keep.** The alternative swaps one easy word for another, and loses the echo.

## 5-2 · Week 5 Day 2 · the grave block

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:227`, registry line 170) | We had **fought** **beside** every one of them. That is why it had to be us. | We had **fought** beside **every** one of them. That is why it had to be us. |
| Lock words | fought · beside | fought · every |
| Problem | The two blanks sit side by side, which reads badly. | *Every* is a filler word, and this day's own Intellect notice says "knew every one of them" (`chapterScripts.ts:3996`), which gives it away. |
| Why canon chose it | Fought beside = they were comrades. The two words carry the line, and canon's note (`episode-5-the-kings-stone.md:221`) says the player understands it by solving them. | |

- The second sentence has no word of 4 letters or more worth blanking (*that*, *why*, *be*, *us*). *Had* appears twice.
- **Recommendation: keep.** If the side-by-side blanks bother you, the fix is in the layout, not the words: show them as two clearly separate locks. That is a screen change, not a canon change.

## 6-5 · Week 6 Day 5 · the moon ledge

| | Keep as canon | Alternative |
|---|---|---|
| Fragment (`mythiosFragments.ts:301`, registry line 179) | The **dark** moon comes back. It always comes back. Be **there** when it does. | The dark **moon** comes back. It always comes back. Be **there** when it does. |
| Lock words | dark · there | moon · there |
| Problem | *Dark* is easy: "dark moon" is the game's own name. | *Moon* is just as easy, and the day's text says it 14 times. |
| Why canon chose it | *Always* was the lock word until 5 Oct, then moved to *there* because Garrick says "It always comes back" that day (`episode-6-the-finale.md:517`). *Comes back* appears twice. | |

- The only other choices are *when* and *does*, which carry no meaning.
- Week 6 lines must stay oblique, so the easy word does no harm here.
- **Recommendation: keep.**

---

## Summary

| Fragment | Now | Proposed | Recommend |
|---|---|---|---|
| 1-5 | gives · takes | gives · also | **Keep** (said aloud that same day; refrain) |
| 1-6 | locks · unlocks | also · unlocks | **Keep** (refrain; no better word) |
| 3-4 | hid · locked | locked · are | **Keep** (no longer word that matters) |
| 4-1 | four · five | **trust · five** | **Change** |
| 4-4 | woke · wake | **woke · near** | **Change** |
| 4-6 | children · key | **children · asked** | **Change** |
| 5-1 | gave · take | war · take | **Keep** (echo is the point) |
| 5-2 | fought · beside | fought · every | **Keep** (fix the layout instead) |
| 6-5 | dark · there | moon · there | **Keep** (no better word) |

**If the three changes are approved, these are the files to update in one pass:**
1. `docs/canon/mythios-fragment-registry.md`: rows at lines 163, 166 and 168, plus the note at line 182 (drop *key* from the 3-letter words).
2. `src/data/mythiosFragments.ts`: `displayTemplate`, `word1` or `word2` and the jumble for 4-1 (lines 170 to 171), 4-4 (194 to 196) and 4-6 (210 to 212).
3. `docs/canon/episode-4-the-water-stone.md:432`: the designer's note naming *woke* and *wake*.
4. `docs/canon/mythios-master-tracker.md`: a dated line for the decision.
5. Nothing to change in `fanOutLeads.ts`, `fragmentMeaningQuestions.ts`, `gatheringScripts.ts` or the Campfire data. The built-in check in `mythiosGatheringsAndAudit.ts:511` will confirm that the new jumbles use the right letters.
