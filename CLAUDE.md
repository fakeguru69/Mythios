# CLAUDE.md: Tales of the Dark Moon (Mythios), handover for Claude Code

Prepared 14 Oct 2026 for the repo `fakeguru69/Mythios` (branch `main`, last checked commit `d7ce1c6`).
Put this file at the repo root as `CLAUDE.md`. Put the canon files from `mythios-canon.zip` in `docs/canon/`.
Read this whole file before touching code.

**This file is living.** The design is still changing. Fake Guru can change any rule, list or task here at any time; when he does, update this file in the same pass. Nothing here overrides what he tells you now.

---

## 1. Who you work for, and how

The designer is **Fake Guru** (formerly TV / TVMen). Call him Fake Guru. He is in Singapore (UTC+8). He designs; he does not write code. He decides fast from short, plain messages.

Rules he has set. Follow them in every reply:

1. **Keep explanations simple and plain.** No jargon unless needed, then explain it in one line.
2. **End every reply with a numbered list of exactly what he must do next**, so he can answer "1 yes, 2 no".
3. **Remind him of anything you are still waiting on from him**, simply.
4. **When he flags a mistake,** say plainly whether it was a real mistake, what it was, and how you fixed it.
5. **When you fix one instance of a problem, find and fix every other instance of the same kind** in the same pass, without being asked.
6. **When you change a rule or behaviour, update everything connected** in the same pass: data, card text, tooltips, glossary entries, comments, the Audit Workbench descriptions.
7. **When asked to check for mistakes, cover:** game logic and numbers, interface consistency, popups, card and bubble text, design consistency and legibility (font, weight, colour), and links between files.
8. **"Use your judgement and decide" means decide.** Apply it and report what you chose and why.
9. **Never claim something is done unless you verified it in the code.** The previous builder's commit said "Implement 14 Oct fix prompt" when 6 of 10 fixes were not touched. Do not repeat that. A commit message must say exactly what was done.
10. Never reassure a player before a risk in game text ("you can't lose"). No out-of-game talk inside the game.

---

## 2. The game in one page

**Tales of the Dark Moon** (engine name **Mythios**) is a story game played in a chat app by a fixed party of **2 to 6 real friends** over **6 weeks**. An AI storyteller called **MYTHIOS** tells it, from stored text.

- **A week** = 6 weekdays (Days 1 to 6) plus a live **Gathering** on Day 7.
- **A weekday** (played alone; was ~5 minutes, now about 8 to 12 with Fan Out, fragment and Campfire, and Fake Guru accepted the longer day on 14 Oct): a chapter, one paid beat (a **Challenge** or a **fight**), sometimes **[PRESS ON]** (an optional harder roll), the **Pull** (why tomorrow can't wait). Each day also drops a **Seeker Fragment** (a short text with two missing words, letters jumbled) into every friend's **Seeker Chest**. Six fragments make the week's map.
- **The build's additions, approved in principle on 8 Oct:** **Fan Out** after the main beat (a choice: an extra Challenge, an extra fight, or Head to the Campfire); ~~the Detour fight~~ (dropped 15 Oct: canon's fail already costs gold and a worse scene); the **Campfire** evening (stored lines only, see `docs/canon/mythios-campfire-table-v2.md`); riddles.
- **The Gathering** (~20 to 30 minutes, live): Approach (group choice, one Challenge), Battle (every friend fights their own enemy at once), United Effort (one shared job, turns), Lore Reveal with **Match** (match a scripture line to a fragment) and **Ask** (questions to Garrick), Twist, Cliffhanger.
- **Numbers:** six Attributes (Might, Craft, Intellect, Charm, Agility, Aim), five tiers, six classes (Warrior, Artificer, Sage, Trickster, Assassin, Archer), gear Level 1 to 5 on two tracks, seven Relic types, HP always 100, nobody dies.
- **Screens:** Story (your thread), Party, Record, Bag (Relics, Scroll Box, Seeker Chest), Store.

**The secret (never show to players before Week 6):** Garrick, the warm innkeeper who guides the party, is the last living descendant of the sleeping king **Malakor** and the hidden leader of the **Order**, the cult that wants the king woken. He **never lies**. The whole season deceives through true statements and withheld meaning. Every rescue still helps the ritual, because the party's solving of the maps shows the Order where each Stone is. At the finale, the ritual that locked the king releases him ("the key that locks is also the key that unlocks").

---

## 3. Where to look (and who decides)

The list below says where each kind of fact usually lives. It is a guide for where to look first, not a fixed winner. **When two sources disagree (code vs canon, or canon vs canon), do not pick one yourself: show Fake Guru both versions side by side, say which you would choose and why, and let him decide.** Then update every file that holds the losing version.

**Canon is the starting point, not a cage** (Fake Guru, 15 Oct). Stick to canon by default, but look at it critically. Where the build already does something better, or a better idea comes up, say so: show canon's version and the better one side by side, say why, and let him decide. Never swap canon out on your own.

1. `docs/canon/mythios-core-rules.md` is the rulebook. **§12 holds every number in force.** §15 lists the 8 Oct approvals that are "approved in principle, numbers pending": §12 stays the number source until a numbers pass.
2. The six episode files (`episode-1-the-list.md` … `episode-6-the-finale.md`) are the master story text, Days 1 to 7.
3. `garrick-deception-table.md` is the truth for every Garrick line and what it secretly means. `garrick-stored-lines.md` holds the router rules and stored lines.
4. `mythios-glossary-proposal.md` is the only source of player-facing words (Challenge not Check; Week not Episode; Match not Connect; Record not Card).
5. `mythios-campfire-table-v2.md` and `campfire-build-bundle.md` (v2.3) are the Campfire master. `src/data/campfire-days-v23.json` in the repo is v2.3. (The zip's `campfire-days.json` was v2.2, older, and was deliberately not copied into `docs/canon/`.)
6. `mythios-master-tracker.md` is the dated decision log (newest at the bottom).
7. `review-build-audit-9oct.md` is the first audit of this build, with line references.

Fixing code that plainly breaks a number or rule written in canon (the tasks in §7) does not need asking each time; anything where the right answer is unclear does.

---

## 4. Repo map (14 Oct, commit d7ce1c6)

Stack: React 19 + TypeScript + Vite + Tailwind 4, Express server (`server.ts`, run with `tsx`), Google Gemini (`@google/genai`) for Garrick small talk only. Built in Google AI Studio. Needs `GEMINI_API_KEY` in `.env`. Scripts: `npm run dev` (server + app), `npm run build`, `npm run lint` (= `tsc --noEmit`).

- `server.ts` (251 lines): Express. `POST /api/roll-challenge` (**correct canon roll**, already: d20 + bonus − DC, success when net ≥ 1, +500 / −150), `POST /api/resolve-fight`, `POST /api/garrick-ask` (router first, Gemini only for small talk, then a banned-phrase filter), audit bundle download.
- `src/App.tsx` (1,493): app shell, save/load in localStorage (`mythios_dark_moon_save_v2`), gold, attributes, relics, party messages, layout switcher (PHONE_ONLY / SPLIT / AUDIT_ONLY), badges.
- `src/components/StoryAndPartyTabs.tsx` (~4,700): the weekday chapter (the chapter script, Challenge, [PRESS ON], fights, Fan Out) and the Gathering (Approach, Battle, United Effort, Lore, "Phase 5 Table Question"). Most fixes are here.
- `src/components/CampfireEveningView.tsx` (1,611): the Campfire evening.
- `src/components/BagAndStoreTabs.tsx` (1,013): Bag, Seeker Chest word-lock puzzle (the best part of the build, protect it), Store, scripture verses (correctly gated by week).
- `src/components/RecordTabView.tsx` (573): the Record.
- `src/components/AuditWorkbench.tsx` (1,417): internal QA screen. Shows Garrick's hidden meanings. **Must never be reachable by a player.**
- `src/data/economy.ts`: every gold amount, one constant each. Good. Use it everywhere.
- `src/data/mythiosRulesData.ts`: tiers (`getTierInfo`), `WEEKDAY_DC_BY_WEEK`, `calculateAttributeGrowth` (correct), `PartyFriend`, `ALL_SAMPLE_HEROES` (Jennifer, Mei, Dev, Arjun, Priya, Theo), `buildParty(size, you)` (the party in play, 2–6; App keeps `partySize` in the save and passes `party` to every screen), `SAMPLE_FRIEND_SCORES`, glossary, badges.
- `src/data/chapterScripts.ts` (15 Oct): the 36 weekday chapters as canon writes them, generated from the episode files by `scripts/gen-chapter-scripts.cjs`. **The Story screen plays these.** Never edit by hand: change the episode file and run the script.
- `src/data/gatheringScripts.ts` (15 Oct): the six Gatherings as canon writes them (Day 7 of each episode file), generated by `scripts/gen-gathering-scripts.cjs`. **The Party screen's Gathering plays these.** Never edit by hand.
- `src/data/gatheringEngine.ts` + `unitedEffortStories.ts` (15 Oct): the Gathering Battle and United Effort rules, and the United Effort story lines generated from canon.
- `src/data/garrickRecap.ts` (15 Oct): Garrick's Recap (every line he said and what it meant), generated from `garrick-deception-table.md` by `scripts/gen-garrick-recap.cjs`. Shown only from the Gathering 6 summary card. Never edit by hand.
- `src/data/mythiosChaptersData.ts`: the build's short summary of each weekday (`WEEKDAY_INVENTORY`): Challenge Attributes, fight pay, place names. Still used for rules and the workbench; its story fields are no longer shown in the day.
- `src/data/soloLandmarkProse.ts`: generated arrival and result prose around each chapter.
- `src/data/narrativeContinuityAudit.ts`: the old continuity patches. **All retired** (L4–L6 on 14 Oct, L1 and L3 on 15 Oct; L2 became canon); the day now plays canon text, so nothing is patched.
- `src/data/campfireDaysData.ts` + `campfire-days-v23.json`: Campfire v2.3 (correct) plus first-use checks.
- `src/data/garrickRouter.ts`: deterministic router for Garrick questions with story-state guards. (`garrickCampfirePrompts.ts` and `garrickDailyRiddles.ts`, the old unused Campfire prompt bank and riddles, were deleted 15 Oct.) `gmMemoryEngine.ts` (memory digest; has made-up token figures), `mythiosFragments.ts`, `mythiosGatheringsAndAudit.ts`.
- `public/*.md`: audit bundles (old snapshots, ignore). `docs/`: a few older docs. `simulators/g_final.py`: the economy simulator.

---

## 5. Current state

**Good and must be kept:** the Seeker word-lock puzzle; Campfire v2.3 data (exact); `economy.ts`; the growth formula; gold never below 0; verses gated by week; Garrick present all of Week 6 (no empty seat); Malakor's name gated to Gathering 2 or later; continuity fixes reach the player view; the Gathering boss only loses at 0 HP; Fan Out's "Head to the Campfire" shown as a finished day; 0 HP = "Bruised Scrape", story goes on.

**Broken at the 14 Oct handover (each is a task in §7; progress is ticked in `docs/fix-plan.md`):** the Challenge roll; result-card numbers; seven hard-coded gold amounts; Combat Relic never spent; United Effort not canon; party fixed at four; `[N]` replaced with "the company"; sample friends named after story characters; continuity patches L4 and L5 wrong and on; Store-lock switch left over; Audit Workbench reachable; small text errors. *(15 Oct: all fixed except the small text errors (Phase 7). The party of 2–6 and the sample names were fixed 15 Oct; its wording lists wait on Fake Guru.)*

**Not verified yet:** whether the Gathering "Phase 5 Table Question" choice changes anything (the 9 Oct audit said the first button revealed the same twist whatever was chosen).

---

## 6. Canon you must not break

**Challenge (Core Rules §3, §12):**
- Roll = d20 + the chosen Attribute's **tier bonus** (+4 if an Attribute Relic is used). Never the raw Attribute number.
- Tiers: Novice 1–25 = +0; Apprentice 26–50 = +2; Adept 51–75 = +4; Expert 76–100 = +6; Master 101+ = +8. Growth rate: 100% / 100% / 60% / 30% / 10%.
- Weekday DC by week: 6, 7, 7, 8, 9, 9. Gathering Challenge = +2. Trial and [PRESS ON] = +4.
- **Success when d20 + bonus − DC is 1 or more. A tie fails. No automatic success on a natural 20.**
- The card shows "You succeed on X+" (X = DC + 1 − bonus, clamped 2 to 20). The roll line shows the score and its bonus: "🎲 13 + Charm 38 (+2) − DC 7 = +8" (Fake Guru, 14 Oct).
- Pass: +500g, Attribute grows. Fail: −150g (gold never below 0). [PRESS ON] pass: +200g, no growth.
- Growth on a passed Daily Challenge only: 12, 9, 7, 5, 4, 3, 3 for the player's 1st to 7th day played that week, × tier rate, rounded, minimum 1; only if the roll was truly uncertain (a 1 could fail and a 20 could pass, judged before Relics).

**Fights (§4):** 100 HP each side. Hit when d20 + Weapon − DEF ≥ 1 (enemy: d20 + ATK − Armor ≥ 1); tie misses. Damage = the hit's margin × 5 (changed 14 Oct by Fake Guru; was d20 × 2). One tap per round with a short roll pause (Fake Guru, 14 Oct). Who strikes first is set by the day as canon writes it (a choice, or the day's Challenge; otherwise the player); at a Gathering, by the Approach. No +2 Weapon / −15 HP (dropped 15 Oct). Gear: Weapon 14–18, Armor 27–31 (Level 1–5); step-up costs 950, 1,100, 1,750, 2,400 per track. Weekday enemy DEF/ATK by week: 21/14, 22/15, 23/16, 23/16, 24/17, 24/17. Gathering enemy: one higher each; reward 380, 520, 740, 740, 1,030, 1,030.

**Pay (§12):** weekday fight on a day with no Challenge 300g win / 0 loss; **weekday fight on a day that also has a Challenge pays nothing**; [LOOK CLOSER] +75g; Match 50g per right pick (100g if every friend present is right); United Effort +300g each if done; fragment lock word +25g; Relic 150g. Untested (PENDING in `economy.ts`): Fan Out cache 150, riddles 10/15, hidden cache 25, W6D3 +1 bonuses.

**Relics (§5):** Attribute Relic +4 on one Challenge of its Attribute, used once. Combat Relic = +1 Weapon and +1 Armor for the rest of one fight, used once. Relics can be given; gold cannot.

**United Effort (§5):** two bars at 100 (the thing in the way, the thing at risk; both 60 for a friend alone). Friends take turns, nobody twice until all have gone. Each turn is a normal Challenge in the night's Attribute against the weekday DC. Success: 10 + d20 to the thing in the way. Fail: 10 + d20 to the thing at risk. Ends when either reaches 0. +300g to every friend present only if the thing in the way hits 0. One Relic per roll (+4), spent either way. No growth. Stories and lines: `docs/canon/mythios-united-effort-stories.md`.

**Garrick:** never promises, never predicts, never denies knowing, never invents facts about himself, no sarcasm, no fake doubt. Banned phrases include "maybe", "perhaps", "possibly", "I don't know", "I've never", "I've heard", "I wouldn't know", "I couldn't say". He keeps an inn (not "retired"). He is with the party all of Week 6. The Store is never locked. He may say "Malakor. My grandmother taught me that name." the first time he is asked, from Gathering 2 on, never before.

**First-use gates (never earlier):** "the Order" from W3D1 (named at Gathering 2 in story; not in Week 1–2 recaps); "four children / four names" from W2D1; "king" W2D5; "Malakor" never at the Campfire; "fifth / five" W3D3 (Meira's count); "moon-blood" W4D4; "Highwall" W5D1; "heartbeat" W4D6.

**Highwall tally (canon):** 8 left at Week 5 Day 5, 7 left at the end of Gathering 5, 6 left at Week 6 Day 1.

**Party size (Campfire v2.3 §M):** 2 to 6 friends. No hard-coded four. `[N]` = the party size as a word (two … six). Lines about the four children or four Stones are story facts and stay.

**Real people:** Mei, Dev and Arjun are Fake Guru's real friends; the sample party (You/Jennifer, Mei, Dev, Arjun) is for testing.

---

## 7. Tasks, in order

**Order now set by `docs/fix-plan.md` (14 Oct), built from the ten audits in `docs/audits/`.** The tasks below are still the detail for each step; the fix plan says which comes first and adds the audit findings. Update both together.

Do them in this order. After each task: run `npm run lint` and `npm run build`, fix any error you caused, and commit with a message naming only that task.

**Task 1. Fix the Challenge roll.** `StoryAndPartyTabs.tsx` ~line 422 (`obstacleTarget = 36 + currentWeek * 6`), ~485 (`d20 + attrPoints`), ~487 (`|| d20 === 20`); the Fan Out roll ~868–870 has the same faults; [PRESS ON] too. Use §6 rules. Get the die and result from `POST /api/roll-challenge` (keep a local fallback only if the server is unreachable, and make it use the same rule). Replace "Obstacle N" and its progress bar with "You succeed on X+". Growth already uses `WEEKDAY_DC_BY_WEEK`; after this the roll will too.
*Check:* a Novice in Week 1 succeeds on 7+ (70%); in Week 6 on 10+ (55%).

**Task 2. Turn off continuity patches L4 and L5.** In `narrativeContinuityAudit.ts`, L4 pays 300g on the four days that have both a Challenge and a fight (W2D3, W4D2, W4D5, W6D6). Canon pays 0 there. L5 makes W5D6 say "seven left" before Gathering 5; canon has 8 at W5D5, 7 at the end of Gathering 5, 6 at W6D1. Remove L4 and L5 from the default list in `App.tsx` ~line 86, or delete them. Keep L1, L2, L3, L6, but read each against the episode file first and report any that contradict it.

**Task 3. Result cards show the real numbers.** ~line 1318–1320 shows "+3 {Attribute}" and "+150g"; ~2216 "PASSED · +150g". Show the real growth given and `GOLD_CHALLENGE_WIN`; show "−150g" on a fail. Add the first-Challenge line: "A Challenge. Pick the skill you trust and roll. Pass, and you earn 500 gold and that skill grows. Fail, and it costs 150 gold." Search every file for other "+150g", "+3", "+10g", "+15g" in player text and make them match `economy.ts`.

**Task 4. No hard-coded gold.** Replace `onEarnGold(150)` (~885, ~960), `onEarnGold(15)` (~3092), `onEarnGold(300)` (~3270, ~3289), `onEarnGold(75)` (~3303, ~4329) with constants. Search the project for any other literal passed to `onEarnGold` or `setGold`.

**Task 5. Combat Relic is spent.** `battleRelicUsed` (~2745, ~3137, ~3938): when used in the Battle, remove one Combat Relic from the Bag at once; +1 Weapon and +1 Armor for the rest of that fight; disabled when the player has none. Check the weekday fight does the same.

**Task 6. United Effort to canon.** Rewrite `handleRollUnitedEffort` (~3228) per §6. Use the party list, not four fixed names. Bar names from `mythios-united-effort-stories.md` if available, otherwise "In the way" / "At risk". The fake friends in the prototype may roll automatically, one at a time, with their tier bonus from their stats.

**Task 7. Party of 2 to 6.**
- Make `PartyFriend[]` the single party list in app state; `FriendId` becomes a string id.
- Every loop over friends uses it (Campfire, United Effort, Battle, Party chat, fragments, Match).
- `[N]` becomes the party size as a word everywhere (`soloLandmarkProse.ts` now wrongly writes "the company", giving "a list of the company names").
- Reword lines that count players: "With all four torn stubs", "granting all four heroes +1 WEP", "all four of you must now combine" (`StoryAndPartyTabs.tsx`); the oath "all four marked children" (`App.tsx` ~30; the children are a story fact, check the sentence still reads right); "all four of us" (`garrickCampfirePrompts.ts` ~108, ~471). Search for "four", "three other", "Mei, Dev", "Mei, Dev, and Arjun".
- Rename sample friends 5 and 6 in `ALL_SAMPLE_HEROES`: "Tamsin" (a kidnapped child in the story) → "Priya"; "Rowan" (cut lore) → "Theo" (decided 14 Oct).
- Follow Campfire §M: nudges pick from friends at the fire and rotate; at most 3 pins read aloud; catch-up names at most 2; the same clue found by several friends is one board card; riddle shared, 3 tries per friend; Garrick posts capped at 12 in the shared room.
- Add a workbench switch to set the party to 2, 3, 4, 5 or 6.
*Check:* play W1D1, W2D1 Campfire, and Gathering 1 at 2, 4 and 6 friends; no text counts the wrong number.

**Task 8. Remove the Store-lock switch.** Delete `storeLocked` from `App.tsx` (~48, 115, 251, 320, 367, 1339) and `BagAndStoreTabs.tsx` (~814, 826, 897, 932, 998). Old saves containing `storeLocked` must still load.

**Task 9. Hide the workbench from players.** The workbench and layout switcher show only when the URL has `?dev=1`. Without it the app opens in phone view, with no route to any "true meaning" text.

**Task 10. Small fixes.** "retired innkeeper" → "innkeeper" (`AuditWorkbench.tsx` ~838; check `gmMemoryEngine.ts`). Label 442 / 45,000 / "98.4% Saved" / "0 tokens on ~85% of turns" as estimates. Note in the workbench: "Garrick Ask: not yet in the player view."

**Task 11. Check Gathering Phase 5.** Find out whether the player's choice in "Phase 5 · The Table Question" changes what happens. Report; do not redesign without asking.

**Task 13 (do before Task 12). Personal stakes and the clue shelf (decided 14 Oct).**
- Remove the three pre-written stakes in `App.tsx` `PERSONAL_STAKES` (they invent lore: "quiet riders", "Mill-Valley", Meira's sealed warning, and lean on Tamsin). Build the stake from the player's two optional Session Zero answers (birthplace, a grandparent's name; Core Rules Session Zero step 4), shown beside their name on Meira's list. Skipped answers are allowed; check the canon wording for that case and ask if there is none.
- Rename the Bag's "Physical Evidence & Keepsakes" section to "Clues" (keepsakes stay retired).
- Check every clue on that shelf against the episode files; report any not in canon (for example "The Hollow Wake Inn Guest Ledger") instead of rewriting it.

**Task 12. Full check and report.** Re-read every item in §6 against the code. Write `docs/build-check-<date>.md`: each rule, pass or fail, with file and line. Then report to Fake Guru in plain words.

---

## 8. Do not do on your own

These are not locked forever; the design is still moving. They mean: do not do these without Fake Guru saying so. If he asks for one (for example "bring back keepsakes" or "rewrite this line"), do it, and update this list and everything connected.

- Do not change story text, Garrick lines, fragments or Campfire lines. If one looks wrong, report it with the canon file and line.
- Do not invent numbers. If a number is not in §6 or `economy.ts`, ask.
- Do not bring back anything retired (Core Rules §14): optional Bonus Challenges, keepsakes, free help, the one-roll United Effort, Signature Power, "the Six", the empty seat, the Store lock.
- Do not show `bearsOnFork`, `qaNote`, "true meaning" or any Deception Table meaning to players.
- Do not edit the old audit bundles in `public/`.
- Do not add invented lore (the old build had Oakhaven, Rowan, Kael, Captain Vance, Iron Gate; all cut).

---

## 9. Waiting on Fake Guru (remind him)

1. ~~"Go" for the numbers pass~~ Given 14 Oct: do it after the Phase 1 rule fixes (`docs/fix-plan.md`).
2. ~~Direction~~ Decided 14 Oct: the 6-week demo on one phone.
3. ~~Sample names~~ Decided 14 Oct: friends 5 and 6 are **Priya** and **Theo**.
4. Before any public launch: technology for real multiplayer (backend, accounts, push), terms and privacy.

## 10. Git

Work on the session's `claude/...` branch and push after every task; never push straight to `main`. Fake Guru also edits through Google AI Studio, which pushes to `main`: fetch `main` before starting, and avoid working in the same files at the same time.
