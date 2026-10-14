# Fix plan: Tales of the Dark Moon (Mythios)

Prepared 14 Oct 2026 from the ten audits in `docs/audits/` and the task list in `CLAUDE.md` §7. This plan replaces the order in `CLAUDE.md` §7; the task numbers there are kept in brackets so nothing is lost.

**Tags**
- **[Fix]**: the code plainly breaks a rule or number written in canon. No decision needed.
- **[Restore]**: canon already has the text or design; the app doesn't show it. No new writing.
- **[Decide]**: Fake Guru must choose before it is done.
- **[Story]**: changes story text. Only with Fake Guru's OK (`CLAUDE.md` §8).

**How each step is done:** one step at a time, on the `claude/...` branch. Check with `npm run lint` and `npm run build`, then commit with a message naming only that step, push, and report.

---

## Phase 0: decisions that shape the plan

**Decided by Fake Guru, 14 Oct:** D1 demo on one phone · D2 go (after Phase 1) · D3 fix the line (done) · D4 Priya and Theo · D5 the story delivers the reveal · D6 different finds per friend · D7 remove the private ballot. Fan Out and Campfire design: `docs/design/fan-out-and-campfire-proposal.md`, **approved 14 Oct**. Map +2 on the Approach: kept (Core Rules §15 item 7). Fight damage: margin × 5 (Core Rules §4).

| # | Decision | Why it matters | Recommendation |
|---|---|---|---|
| D1 | **Direction:** keep improving the 6-week demo on one phone, or start real friends on their own phones (Week 1 first, accounts, a shared clock)? | Real phones need a server, accounts and push notifications; much of Phase 4 changes shape. | Do Phases 1–3 on the demo first (they are needed either way), then decide. |
| D2 | **"Go" for the numbers pass** (the PENDING amounts in `economy.ts`: Fan Out, Detour, riddles, cache, W6D3 bonuses) | Phase 1 needs final numbers for these. | Do it after Phase 1's rule fixes, so the simulator runs on correct rules. |
| D3 | **Canon W1D2 "Yours is the third stub"** breaks with 2 players | Canon and app text. | "Your stub fits like a key." |
| D4 | **Sample friends 5 and 6** (replacing Tamsin and Rowan) | Task 7. | Decided: Priya and Theo. |
| D5 | **The Gathering's Table Question:** keep it as a three-choice quiz, or let the story deliver the reveal as canon does? | Phase 3. | Story, as canon; keep the friends' theories at the Campfire. |
| D6 | **Fan Out:** each friend who fans out finds a different piece, or keep one shared clue? Drop the fight branch? | Phases 4–5. | Different pieces (canon has the material: [PRESS ON], the "look" choices, the Fan Out clue); one quick choice, no generic fight. |
| D7 | **The private theory ballot** before the Campfire: keep or remove? | It spends the Fork before friends meet. | Remove. |

---

## Phase 1: rules and loopholes (code only, no story changes)

1. ✅ **Done 14 Oct.** **[Fix] The Challenge roll** (Task 1). Also fixed a crash that stopped every passed Challenge from paying, growing or finishing the day. The Approach now uses its roller's own bonus; the map +2 is kept pending Fake Guru (not in canon). d20 + tier bonus against the week's DC; success on a margin of 1 or more; no automatic 20; "You succeed on X+". The same rule for [PRESS ON], Fan Out and the Gathering Approach. Remove the "Obstacle" bar.
2. **Fights.** *(Revised 14 Oct.)* Fake Guru keeps the build's round line and its damage: "YOU: 🎲 15 + WEP 15 − DEF 19 = +11 · HIT +11 × 5 = 55. FOE HP 100 → 45". Damage is now **margin × 5** in canon (Core Rules §4). The +2 Weapon on a passed Challenge and the −15 HP on a failed one, on days with a Challenge and a fight, stay: they were approved in principle on 8 Oct (Core Rules §15 item 3; the audit wrongly called them invented). Their numbers, and the enemies' DEF and ATK (the build uses 2 below canon's DEF), go to the numbers pass. **Decided 14 Oct:** keep one tap per round with a short roll pause.
3. ✅ **Done 14 Oct.** Result cards show the real growth and +500g / −150g; the W1D1 first-Challenge line added; every gold amount comes from `economy.ts` (Match now 50g per right pick, canon; was 75g); starting gold 0 (canon; was 1,240 / 600). **[Fix] Pay.** Turn off patch L4 so fights on Challenge-and-fight days pay 0 (Task 2). Result cards show the real numbers (Task 3). No hard-coded gold (Task 4).
4. ✅ **Done 14 Oct.** Every reward is paid once per day and per Gathering (saved with the game); the rally button is removed; no growth from Fan Out or Detour; fragment words pay once and lock for 2 minutes after 5 wrong tries (Bag and Campfire); gear stops at Level 5. **[Fix] Loopholes.**
   - A finished day pays nothing when replayed.
   - The United Effort "rally" no longer wins for free.
   - No Attribute growth from Fan Out or Detour (canon: growth on the main Challenge only).
   - Fragment words: five wrong tries, then a 2-minute wait; each word pays once.
   - Gear can't be bought at Level 5.
5. **[Fix] The Combat Relic is spent** when used (Task 5).
6. **[Fix] United Effort to canon:** turns, bars, 10 + d20 (Task 6). Battle enemies roll as in canon.
7. ✅ **Done 14 Oct (with the fight-pay part of step 3).** Patches L4, L5, L6 removed; fights on Challenge-and-fight days pay 0 in the chapter data. L1–L3 add story text not in canon: waiting on Fake Guru. W1D6's fight is not in canon: waiting on Fake Guru. **[Fix] Continuity patches.** Turn off L5 (the "seven left" said a day early). Turn off L6 (it rewrites the W4D1 escape against canon). Check L1–L3 against the episode files.
8. **[Fix] The word checker's first-use days** match canon ("king" W2D5, "throne" W3D5, and so on).
9. **[Fix] Remove the Store-lock switch** (Task 8). **Hide the Audit Workbench** unless `?dev=1` (Task 9).

## Phase 2: build the weekday from canon (restores the story)

10. **[Restore] Canon's day shape**, from the episode files:
    - scene
    - the two "look" choices
    - the "What you notice" line
    - a Challenge card with canon's verb for each skill and the cost on failure
    - the result
    - [PRESS ON] where canon has it
    - "who strikes first" before fights
    - [PULL IT OUT] for the fragment
    - **the Pull**
    - **the day summary card** (You earned · You learned · You hold · Fragment · Tomorrow)
11. **[Restore] Lost plants:** the dates beside your names and the extra cup (W1D2); the vent box (G3); the second boat (W4D6); Garrick's weekday lines (W1D6, W3D2, W4D1, W5D4, and the rest).
12. **[Fix] Remove the template frame:** "Following yesterday's lead…", "One urgent question…", "Relying on your…", rules text in the story, summaries in brackets, "heavy boots come running", the capital "The" mid-sentence, and day labels inside place names. Store descriptive places without "The".
13. **[Fix] Remove the "Tell Mythios what you do" box** (canon cut free play).
14. **[Fix] Names follow canon's style guide:** plain text in sentences; gold only for what you hold; italic serif for written pages.

## Phase 3: the Gatherings tell their week's story

15. **[Restore] On screen, from canon's scripts:** each child's rescue, the prisoner's capture (G3), taking the fifth Stone (G5), the ledger and naming the Order (G2), the Lore Reveal and Ask.
16. **[Restore] Canon's quote-backs:** Week 4's "We made our children the only key…"; the finale's season quote-back (1-5, 1-6, 3-3, 3-5, 4-4, 5-3, 6-6). No Order scripture in Week 1.
17. **[Fix] Gathering 4's answer:** "your blood", not "the children's blood".
18. **[Decide D5] The Table Question:** stop the quiz, and the Week 6 hint, from giving the twist away.
19. **[Fix] Recaps and dropped lines:**
    - The W3 recap: Corin, not "the watchers".
    - The W5D1 recap carries the stopped dawn and the heartbeat.
    - Restore Garrick's "This isn't new, and it isn't finished" (G2) and "Tamsin's hand… the same linen" (G6).
    - Remove Garrick's out-of-game opener ("Mythios sets the trial… beside you four").
20. **[Fix] Invented wrong answers:** replace "road-wardens", "Seeker elders", "Meira's ring" and the like with options drawn from that week's evidence.
21. **[Restore] The Garrick Recap** after the finale (canon `mythios-garrick-recap.md`; its presentation design is still open).

## Phase 4: a real party of 2 to 6

22. **[Fix] One party list everywhere** (Task 7): Battle, United Effort, Campfire, Match, fragments, chat. `[N]` as the party size in words. Remove "the four of you" and the fixed Mei, Dev and Arjun lines. A workbench switch for 2–6. Sample friends 5 and 6 are Priya and Theo.
23. **[Fix] Campfire §M rules:** nudges rotate among friends at the fire; at most 3 pins read aloud; the riddle is shared with 3 tries each.
24. **[Fix] Fragments:** canon's "one word per friend per day", credited to the real player, not "Jennifer".
25. **[Decide D6] Fan Out by friend:** different finds per friend, so each brings something to the fire.

## Phase 5: Campfire and Fan Out polish

26. **[Fix] Prompts about hidden clues:** the W3D3 "doubtful number" and the W3D6 "watcher" are shown in the day (Phase 2), or the prompt changes.
27. **[Fix] Fan Out:** don't name the clue on the button before it's found; drop the generic "Rear-Guard Lookout" and the invented "mason's guide-letter" (or show the letter as a separate reward); W1D1's nudge doesn't address a friend you haven't met.
28. **[Decide D7] The private theory ballot.**
29. **[Fix] Remove dead code:** the old Campfire prompts and the unused recovery and next-move options.
30. **[Story] Proposals for Fake Guru**, one by one, never changed without OK:
    - the 10 weak Campfire forks (Point 6)
    - callbacks that only recap
    - the 21 practical nudges
    - the "hearsay" clues (1-5, 2-1, 4-2, 4-3)
    - clue 2-5 should lean "his own people"

## Phase 6: story-level proposals (only with Fake Guru's OK)

31. **[Story]** Grok's Week 5 ending ("We are not hidden. We are early.").
32. **[Story]** Weak days: W3D4 (filler), W4D3, W6D1–D3 alike, W2D1; the repeated "family of a missing child" scene; the repeated slot shapes.
33. **[Story]** Lock-word pairs that give each other away (locks/unlocks, woke/wake, four/five, gives/takes, gave/take).

## Phase 7: finish

34. **[Fix] Small fixes** (Task 10): "retired innkeeper", estimate labels, the workbench note.
35. **Personal stakes and the clue shelf** (Task 13): stakes from the Session Zero answers; "Keepsakes" becomes "Clues"; check each clue against canon; remove the Day 1 stakes that leak the story.
36. **Report on Gathering 5's Table Question** (Task 11). Answered by the audits: the choice changes nothing; a wrong pick just shows a hint.
37. **Full check and report** (Task 12): every rule in `CLAUDE.md` §6 against the code, pass or fail with file and line.

---

## Suggested start

Phase 1, step 1 (the Challenge roll). It needs no decision and touches only game code.
