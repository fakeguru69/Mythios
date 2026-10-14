# Full Handoff Audit Record (Creative, Narrative, Gameplay & Technical)

**Date:** 5 Oct 2026
**Designer & Decision-Maker:** Fake Guru (formerly TV / TVMen)
**Status:** APPROVED by Fake Guru ("proceed") and APPLIED across the scripts, rules, simulator, and screen specifications.

---

## 1. Naming Rule Updated
- The designer is now addressed as **Fake Guru** (replacing "TV" / "TVMen" in active workflow rules; in-game sample party lines use player character names such as `Jennifer`, `Mei`, `Arjun`, `Dev`, `Jo`, or `Fake Guru`).

---

## 2. Creative, Narrative, Gameplay & Retention Fixes (`C1–C11`) — APPLIED

| ID | Area | Real Issue Found | Fix Applied |
|---|---|---|---|
| **C1** | Story Loophole (Weeks 2 & 3 Day 6) | Characters shouted the secret map across the dark hillside twice right above the enemy's shaft (Week 2 Day 6) and down the cairn ridge (Week 3 Day 6) even after knowing the Order was watching them. | Week 1 Day 6 (inn courier) and Week 4 Day 6 (calling over the storm wind in the bell-tower) keep the overheard aloud reading. In **Week 2 Day 6**, they trace the map in silence by a shuttered chink of light and the watchers hear/spot them shifting the fallen stone from the second shaft mouth. In **Week 3 Day 6**, the map is passed hand to hand and the watcher on the ridge below sees them descend straight toward the Kiln. |
| **C2** | Story Loophole (Ep1 D2 vs D5 Timeline) | Ep1 Day 2 read as if a child were currently held at the Widow's Tooth three weeks ago, while Day 5 said Meira was writing about the charcoal woman's nephew from two winters ago. | Ep1 Day 2 now states Meira's page records two things: a boy held near that rock two winters back, and a warning that another child born on the same dark-moon night lives in Fenmark under its shadow (Tamsin). Day 5 connects both cleanly. |
| **C3** | Story Pacing (Week 4 Day 4 Old Reedham) | Following 4-day-old footprints in the mud to learn "Joss was walked here alive" repeated what Gathering 3 and Day 3's 8 notches already proved. | Reworked Week 4 Day 4 so the party spots the Order's night ferrymen in the drowned streets at dusk; `THE LOWEST LANE` Challenge shadows them to mark their reed-island landing (while still finding Joss's shoe-print on the cobbles), directly setting up capturing their boat on Day 5. |
| **C4** | Story Logic (Week 6 Day 1 Safe Room) | Relied only on "every slit looks the same from the square" when watchmen walked past the hidden door twice. | Added the explicit reminder that even when a watchman's hand brushes the stone, the door is Seeker work that only opens for Seeker blood. |
| **C5** | Weekday Agency ("Fake Choices") | `Ep1 D1`, `Ep3 D5`, and `Ep4 D3` had multi-button menus where "all three are seen, only the order changes", and `Ep6 D3` (`[THE WATCH]` vs `[THE BOARD]`) changed nothing on the roll. | `Ep1 D1`, `Ep3 D5`, and `Ep4 D3` now use the Week 2 Day 2 asymmetric team pattern (you inspect your pick in full detail; Mei/Dev/Jo report the others in one line). On `Ep6 D3`, `[THE WATCH]` gives **+1 Agility** and `[THE BOARD]` gives **+1 Charm** on `THE SQUARE`. |
| **C6** | Fight-Only Days (Blind 50/50 Guesses) | On `Ep1 D3`, `Ep1 D5`, `Ep2 D5`, `Ep3 D5`, and `Ep5 D2`, the Notice clue came *after* the pre-fight choice, making first-strike a blind coin flip; `Ep3 D1` and `Ep6 D4` had no pre-fight choice at all. | Moved **What you notice** *before* the pre-fight Choice on all 5 days so attentive players can deduce the first-strike option, and added a 2-option tactical pre-fight choice to `Ep3 D1` (`[WATCH THE SHAFT MOUTH]` vs `[PACK THE HORSES FIRST]`) and `Ep6 D4` (`[DRAW BEFORE IT TURNS]` vs `[TRY TO SLIP PAST ITS SHOULDER]`). |
| **C7** | Challenge Failure Branches | On 6 Challenge days (`Ep1 D2`, `Ep2 D2`, `Ep3 D3`, `Ep3 D4`, `Ep4 D3`, `Ep6 D2`), failing said only that it took longer or made dust while the next beat played identically. | Sharpened all 6 failure branches so failing changes your footing or social standing in the next beat (e.g., on `Ep1 D2` Garrick looks to Mei instead of you; on `Ep2 D2` the miller's wife shuts the door and speaks only to Jo at dusk without showing the horn button). |
| **C8** | Gathering 2 & 6 United Effort Stakes | Losing `THE BREACH` in Gathering 2 had almost no cost, and losing `THE HAWSER` in Gathering 6 had zero effect. | In Gathering 2, losing the room means **no time to `[LOOK CLOSER]`** (losing the +75g roll and room clues, matching Gathering 5). In Gathering 6, winning records `The Lamp Came Down` on the Season Summary Card; losing `Your Line` leaves a friend's palm already bleeding for the handover beat. |
| **C9** | Gathering Battle & Fight Interactivity | `Fight.dc.html` omitted the `[USE COMBAT RELIC]` button described in Core Rules §5. | Added `[USE COMBAT RELIC]` under the active round bubble whenever held, and enabled giving a Combat Relic from the `PARTY` Battle board. |
| **C10** | Daily Social Loop (`[SHARE WITH PARTY]`) | Private `[PRESS ON]`, `[LOOK CLOSER]`, and Adept Notice discoveries were trapped in `MINE` chat unless retyped manually. | Added a one-tap **`[SHARE WITH PARTY]`** button under unlocked `[PRESS ON]`, `[LOOK CLOSER]`, and Adept Notice clues that posts the discovery as a pill/card in `PARTY` chat. |
| **C11** | Engagement Devices & Garrick Recap | The 4 engagement devices in `mythios-garrick-recap.md` were undecided for v1. | Included all 4 (**Daily Theory Prompt**, **Weekly Suspicion Poll**, **Personal Stake**, and **1:1 Garrick Chat**) so the post-finale Garrick Recap displays the party's own theories, poll votes, and chat logs alongside the Deception Table. |

---

## 3. Technical, Rules, Simulator, Wording & Screen Fixes (`B1–B15`) — APPLIED

1. **`mythios-gathering-scripts.md` Synced**: Replaced all 11 remaining `[sim]` tags with exact Audit G numbers (`+500g`, `+75g`, Battle condition rules), updated Gathering 6's United Effort from `60/60` to `100/100`, and replaced the 4 leftover `Connect` occurrences with `Match`.
2. **`mythios-united-effort-stories.md` Part 7 Bands Fixed**: Updated Part 7 (`THE HAWSER`) table bands from `40–59 / 20–39 / 1–19` to `67–99 / 34–66 / 1–33` to match the `100/100` bar start.
3. **Episode 1 Day 1 Class Openings Merged**: Merged all 6 class openings from `review-content-pass-2.md` (with `Check` updated to `Challenge`) into `episode-1-the-list.md` Day 1, and aligned the Day 1 summary card to `Might or Craft`.
4. **Stray Bonus-Seed Bullet Deleted**: Removed `- *(Seed changed 5 Oct...)*` from `episode-2-the-wind-stone.md` Day 2.
5. **Extra Cup Day Number Fixed**: Updated `Ep2 D2` to `Ep2 D1` (the farmer's barn on the mill road) in both tables of `garrick-deception-table.md`.
6. **Router Paper-Test Prompt State 2 Fixed**: Updated `garrick-router-test-prompt.md` State 2 (Episode 3 Day 4) from *Verse of the Four* to *Verse of the Answering*.
7. **Ep5 Heir Clue Quote Aligned**: Standardized *"The fifth wasn't hidden in the hills like the others."* across `mythios-mythology-canon.md` and `mythios-season-reveal-map.md`.
8. **Enemy Card `[NOT NOW]` Removed**: Removed `[NOT NOW]` from the sample Enemy Card in `mythios-core-rules.md` §4 so weekday fights show `[FIGHT]` only.
9. **Cut Optional-Play Remnants Removed**: Stripped leftover references to player `notes`, `Lure`, `Finds`, `Connect`, and the `Card` tab from `mythios-core-rules.md`, `mythios-build-notes.md`, `mythios-glossary-proposal.md`, and `review-content-pass-3.md`.
10. **Core Rules §13 Open Items Closed**:
    - Attribute growth on Record shows the updated value and tier progress bar (while the Day Summary Card shows the `14 → 26` transition).
    - A friend's Combat Relic is marked in fight round lines as `Weapon 15 (+1 Mei)` / `Armor 28 (+1 Mei)`.
    - "Hold the line" is dropped and moved to §14 Retired Rules.
11. **Simulator Input & Condition Keys Fixed**: Updated `bundle_new.md` Ep1 D6 to `Aim or Agility` and fixed `g_final.py` condition keys from `1..5` to `2..6`.
12. **Party-Chat Result Wording Standardized**: Updated `"passed / failed today's Challenge"` to `"cleared / did not clear today's Challenge"` in `mythios-core-rules.md` and `00-START-HERE.md`.
13. **Fragment Solved Wording Standardized**: Aligned `"solved a word"` / `"solved by Mei"` across screens and docs to match the stat **Fragments Solved**.
14. **Retired Mechanics Removed from Screens**: Updated `Fight` screen from `BONUS FIGHT` / `note` reward to a weekday `FIGHT` / `+300g` reward, and updated `Story` storyboard to show automatic beat-by-beat tumbling dice and `[PRESS ON]` instead of manual per-round `[ROLL]` and `[ASK THE PARTY]`.
15. **Screen Week/Day Labels & Style Guide Consolidated**: Updated *The Mill* from `Week 2 · Day 3` to `Week 2 · Day 2` and the first fragment from `Week 2 · Day 1` to `Week 1 · Day 1`; consolidated `mythios-visual-style-guide.md` into a clean design-token and component specification.


---

## Part 3 — Locked Narrative Continuity Fixes (`L1–L6`) & 4-Layer Tiny-Token GM Memory Architecture

### Locked Narrative Continuity Fixes (`L1–L6`)
- **`L1` (W1D6 & W2D2 — Ford Cart-Ruts Callback)**: Planted the heavy cart with a pulling left wheel backing down the high bank above the ford on **Week 1 · Day 6**, and updated **Week 2 · Day 2 `[PRESS ON: THE RUTS]`** to connect the lopsided rut across **The Widow's Tooth (W1D3)**, **the high bank above the ford (W1D6)**, and **the mill road (W2D1)**.
- **`L2` (W2D2 → W2D5 — Horn Button Payoff)**: Recorded `youHold: "a horn button from the taker's sleeve"` on **Week 2 · Day 2** and paid it off on **Week 2 · Day 5 (`The One Sent Up to Look`)** when tearing the black circle from his coat cuff beside the snapped horn-button thread.
- **`L3` (W2D2 → W2D3 — Coming Weather Hook)**: Connected **Week 2 · Day 2**'s *"and there is weather coming"* cliffhanger to **Week 2 · Day 3 (`Where the Tracks Stop`)**, opening under the first cold river squall beginning to blur the four-night-old ruts.
- **`L4` (W2D3, W4D2, W4D5, W6D6 — Dual-Day Fight Reward Parity)**: Restored `fightReward: 300` (`+300g` win / `+150g` loss) and explicit Challenge-to-Fight first-strike rules across all four Dual Challenge+Fight days.
- **`L5` (W5D5 → W5D6 → W6D1 — Highwall Watch-Page 7th Stroke)**: Accounted for the 7th chalk stroke crossed out at dusk on **Week 5 · Day 6** (`watch-board: seven left`) between **W5D5 (`eight left`)** and **W6D1 (`six left`)**.
- **`L6` (W4D1 — Prisoner Rope-Cutting Watch Clue)**: Anchored the severed rope in **Week 4 · Day 1 (`[THE ASH]`)** beside Garrick's watch-blanket at the passage mouth, with his belt-knife already buckled in its sheath before the alarm was raised.

### 4-Layer Tiny-Token GM Memory & Context-Caching Architecture (`src/data/gmMemoryEngine.ts` + `server.ts`)
1. **Layer 1 — Deterministic 0-Token Router (~85% of turns)**: All 36 chapters, challenges, fights, and Buckets 1–4 of the Garrick Router resolve in local TypeScript for `0` API tokens.
2. **Layer 2 — Byte-Identical Static System Prefix (`442 tokens`, Free Automatic Gemini Implicit Prefix Cache)**: `GARRICK_IMPLICIT_CACHE_SYSTEM_PREFIX` is placed at the top of `systemInstruction` on `gemini-3-flash-preview` calls so automatic prefix caching reuses it with zero storage fees.
3. **Layer 3 — Episode-Scoped Scene Slice (`~150 tokens`)**: Injects only the active Day's 3-line scene context + 9 Story Flags, preventing future-episode spoilers and saving ~38,000 tokens of unused scripts.
4. **Layer 4 — Compact JSON Party Memory Digest (`~120 tokens`)**: Tracks `personalStakeShort`, `recentRolls`, `relicsGiven`, `solvedFragmentsCount`, `garrickTopicsAsked`, and `last4ChatTurns`, achieving a **98.4% token reduction** compared to a ~45,000-token full-history prompt.
