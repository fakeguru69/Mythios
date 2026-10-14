# Review: the build, audited against canon (9 Oct 2026)

**What was audited:** `mythios-full-audit-bundle` (15 source files, 13,220 lines), plus the other AI's audit of it (`tales_of_dark_moon_audit.md`). Every claim below was checked in the bundle with a line number. **Canon wins:** where the audit prompt itself disagrees with `mythios-core-rules.md`, the Deception Table or the reveal map, canon is used.

## A. The audit prompt carries wrong canon (do not reuse it as written)
1. "Garrick vanishes after W6·D2, Store locks, empty seat at Campfire W6·D3–D6." Not canon. Canon has Garrick with the party all of Week 6 (Ep6 Day 4 "The Seekers sealed the doors they knew about", Day 5 "It always comes back", Day 6 "Drinks are on me", the extra cup poured on Day 6, and Gathering 6 takes the cup from his coat). Canon has no Store lock. **The code does this** (`App.tsx:1320` store lock from W6D3; `StoryAndPartyTabs.tsx:4792` "GARRICK'S SEAT BY THE FIRE IS EMPTY"; `:6647` removes him from the speaker bar). The other AI's P0 #5 ("make Garrick's absence authoritative") would lock in the error. The right fix is the opposite: remove the absence.
2. "Garrick is bound by a First Oath: never a literal lie." Canon's rule is the three-verb rule: he never promises, predicts or denies knowing, and invents no facts about himself. Not the same thing.
3. The Gathering is described as a "5-phase state machine" with a "3-fragment scripture deduction" and a "Table Question hypothesis" with three theories. Canon's Gathering is Approach, Battle, United Effort, Lore Reveal, Twist, Cliffhanger, with 10 Scripture Matches across the season. Treat the 5-phase shell as the build's own design, not a handover item.

## B. Where the other AI's audit is wrong (my corrections)
- **"W2 Campfire says 'four children' = leak."** Not a leak. Gathering 1 (end of Week 1) shows four names. "Four children" is earned from W2D1. (The W1 leak is real; see D.)
- **"W3D3 says 'Five' = leak."** Not a leak. It is canon: Meira's footnote, "A poet's count, perhaps" (reveal map, Thread 3, row 2). It is what makes Garrick's Ep4 "she wrote about it" true.
- **"Malakor at episode ≥ 2 = must gate to Week 6."** Half right. Canon lets Garrick give the name the first time he is asked, from the Ep2 Gathering (Deception Table lines 260, 290). It is wrong from W2D1–D6 (`garrickRouter.ts:11986` gates on episode, not on Gathering 2). Gate it to "Gathering 2 or later", not Week 6.
- **"Ask for the Campfire 3rd wave."** Canon never called for three waves. Two waves is fine.
- **"Order/Highwall leaks are not a problem."** Wrong on one point: see D.
- **My own earlier error, corrected:** I said "My grandmother taught me that name" was in no canon doc. It is canon (Deception Table lines 260, 290, 323).

## C. Confirmed real bugs in the build (all verified in the bundle)
**P0, rules and economy**
1. **Challenge roll is wrong.** `StoryAndPartyTabs.tsx:1713` `obstacleTarget = 35 + week × 5`; `:1773` rolls d20 + the raw Attribute number. Canon (Core Rules §3, §2): d20 + tier bonus (0/+2/+4/+6/+8) against DC 6/7/7/8/9/9. A fresh Novice passes about 25% instead of about 75%. Every +1 Attribute point changes the roll, which canon forbids. The Record screen shows tiers while the roll ignores them.
2. **Challenge pay is wrong.** `:1801` pays +150g on a clear; canon is +500g (§12). A failed Challenge pays 0 (canon −150g, but see section E: your 8 Oct approval changes this). Growth is a flat +3 (`:1799`); canon is tier-rate growth with a minimum of 1.
3. **~~Zero-pay weekday fights~~ RETRACTED 9 Oct.** I first reported `fightReward: 0` on W2D3, W4D2, W4D5, W6D6 as missing income, copying the other AI's loophole L4. Core Rules §4 and §12 (lines 223, 676) say a weekday fight on a day that also has a Challenge pays NOTHING (one paid beat a day). So 0 is correct and L4's "fix" (300g) would be wrong. My error, not the build's.
4. **Continuity fixes L1 to L6 never reach the player.** (Of the six, L4 and L5 are themselves wrong against canon and must not be applied: L4 as above; L5 says the Highwall count skips seven, but canon has 8 left at Ep5 Day 5, 7 at the end of Gathering 5, 6 at Week 6 Day 1. L1, L2, L3, L6 are sound ideas, to be checked against the episode text before applying.) `getChapterWithContinuityFixes` is defined at `narrativeContinuityAudit.ts:12960` and only called at `:13049` inside the Audit Workbench matrix. The story view reads the raw data. The workbench says "6 / 6 Active" while the player sees none.
5. **Gathering boss "wins" at round 3.** `StoryAndPartyTabs.tsx:4619` `enemyHp <= 0 || nextRoundNum >= 3` sets the battle done and pays gold even if the boss is alive.
6. **Gathering Combat Relic is never spent.** `:4540` reads `battleRelicUsed`; no consume call (only `:6042` toggles it). Free +1 every battle.
7. **United Effort does not match canon.** `:4647` rolls 7 to 20, doubles each hero's result and adds the four. Canon (§5, §12): two bars of 100, damage 10 + d20 against the weekday DC, one roll per friend as they act, 90/83/73/62% by episode. The build's version is almost always a win and has no shared job feel.
8. **Gathering Phase 5 has no agency.** `:6486` the first button reveals the same twist whatever was chosen.

**P0, story**
9. **All six scripture verses are in the Bag from Week 1** (`BagAndStoreTabs.tsx:6741`, mapped at `:7308` with no week filter). Shows endgame lines early.
10. **W6 Garrick absence** (A.1 above): a canon contradiction, in the wrong direction.
11. **Hidden Garrick meanings visible in the Audit Workbench** (`:9288` "Why it is true / Recap meaning", with text such as "last living descendant of Malakor's royal line", `garrickRouter.ts:11543`, and "The cup is for the sleeping king Malakor", `:11721`). If this screen can be reached in the player build, it spoils the finale. Gate behind a dev flag.

**P1**
12. **"Jo" is still in the data** (`mythiosChaptersData.ts:1543, 9688, 9725, 9758, 9759, 9762, 9774, 9899, 9900, 9968, 9969` and the audit log `:11022`). The party is Mei / Dev / Arjun.
13. **Week 1 and Week 2 recaps leak the Order** (`soloLandmarkProse.ts`, Gathering 1 recap: "rescued nine-year-old Tamsin from the Order"). The Order is named at Gathering 2. Also `W1D6` enemy "Order Ferry Sentry" and `W2D6` plant "the Order's watchers".
14. **Boilerplate arrival line** (`soloLandmarkProse.ts`, arrivalLead): W1D1 is handled correctly (no Garrick), but every other day uses one of three templates, so W1D2 (inside the inn) says "fan out to examine the ground while Garrick keeps a quiet eye on the road", and night scenes say "dusk". Also `cleanQuestion` replaces "[N]" with the word "four": the list is of [N] = the party's size, not four, and "four" is an early leak.
15. **W6 prose and Campfire contradict each other** (empty seat versus "Garrick keeps watch at the slit-window").
16. **Reward copy mismatch:** ticker "+10g" (`App.tsx:531`) versus "+15g" (`:4946`); glossary "+25g" per fragment and "+15g" riddles (`mythiosRulesData.ts:12565`) match nothing in Core Rules §12.
17. **System prefix calls Garrick a "retired innkeeper"** (`gmMemoryEngine.ts:13104`). Canon: he keeps an inn.
18. **Hard-coded token numbers** (442, +65, +30, 45,000, 98.4%) in `gmMemoryEngine.ts` are not measurements.

## D. Better or worse than canon (the build's own additions)
- **Fan-Out (3 branches) with first-letter hint:** BETTER. Keep, as optional depth. You approved it 8 Oct. Needs to stop being a content tax: one setup line, one action, one payoff. First-letter hint goes inside [PRESS ON] / [LOOK CLOSER] so there is one extra beat a day, not two.
- **Detour fight on a failed Challenge-only day:** BETTER for drama, but adds a fight and pays 150g/75g that no canon number covers. Keep with a 10-second, one-round fight; pay is "pending numbers pass".
- **Multi-paragraph prose:** better atmosphere, worse pacing; several lines explain the clue to the player. Keep the first paragraph, cut the explaining one.
- **Bruised Scrape (0 HP, story continues):** BETTER than a hard defeat; matches Core Rules §4 ("nobody dies").
- **Seeker word-lock tapping puzzle:** BEST part of the build. Protect it.
- **Notice-before-choice (C6) and sharper failure branches (C7):** BETTER. Keep.
- **Campfire template and wave stances (`garrickCampfirePrompts.ts`):** WORSE. Wrong places, invented lore (Oakhaven, Rowan, Kael, Captain Vance, Iron Gate), week-agnostic chips that leak. Replace with `mythios-campfire-table.md`.
- **Player-chosen stakes (Rowan/Kael/Vance):** invented lore not in canon. Cut unless it becomes a plain name field with no story claim.

## E. Collision between your 8 Oct approvals and the Core Rules
You approved (in principle): a failed Challenge pays nothing, the Detour fight, the ambush/first-strike numbers, Fan Out, riddle/fragment gold, and the W6D3 +1 bonuses. These contradict Core Rules §12 (failed Challenge −150g; Challenge +500g) and the 5 Oct cut of optional play. **The build also pays only 150g per Challenge, which on its own would break the 12,400g gear curve.** None of these numbers have been simulated. So they are recorded as **approved in principle, numbers pending**, and Core Rules §12 stays the number source until a numbers pass.

## F. Season spine versus canon (the six Gatherings)
G1 Tamsin, G2 Corin, G3 Wren, G4 Joss, G5 the wall, G6 His Hall all match the Gathering scripts at the level the other audit checked. The one structural contradiction is Week 6 Garrick (C.10).

## G. Pacing
Mandatory play now has recap, opening, challenge, a possible detour fight, Fan-Out, Campfire waves, riddles and fragments. Too long for about five minutes. Sweet spot: Campfire is the "I'm done" option; Fan-Out and riddles are optional depth.

## H. Fix order for the other AI
1. Challenge math (C.1, C.2) after the numbers pass. 2. Apply L1, L2, L3 and L6 (not L4 or L5) to the player view (C.4). 3. Boss end condition and relic (C.5, C.6). 4. Gate verses by week, gate workbench (C.9, C.11). 5. Remove the W6 Garrick absence and the store lock (C.10). 6. Fix the Malakor gate to Gathering 2 (B). 7. Name sweep for "Jo" (C.12). 8. Gate "the Order" before Gathering 2 (C.13). 9. Garrick at W1D1 (C.14). 10. Replace the Campfire seeds with the table. 11. Rewrite United Effort to canon (C.7). 12. Make the Phase 5 choice change the reply (C.8).
