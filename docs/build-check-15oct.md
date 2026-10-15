# Build check, 15 Oct 2026 (Task 12)

Every rule in `CLAUDE.md` §6 read against the code. The check started at commit 784837b and was done by three read-only checkers. Each finding was then confirmed by hand. Fixes went in at 14aed38 and in the commit that adds this file.

**Result:** 44 rules checked.
- 34 pass as found.
- 10 had a fault that is now **fixed** (marked FIXED).
- 9 points need Fake Guru's decision (listed at the end).

`npx tsc --noEmit` is clean for the first time since the handover. `vite build` passes.

Abbreviations: STP = `src/components/StoryAndPartyTabs.tsx`, CEV = `src/components/CampfireEveningView.tsx`, BST = `src/components/BagAndStoreTabs.tsx`.

## Challenge

| # | Rule | Result | Where |
|---|---|---|---|
| 1 | d20 + tier bonus (+4 Relic); never the raw score | PASS | `resolveChallengeRoll` mythiosRulesData.ts:136; STP:383 daily, :437 [PRESS ON], :888 Fan Out, :2167 Approach, :2192 [LOOK CLOSER]; gatheringEngine.ts:390 United Effort |
| 2 | Tiers +0/+2/+4/+6/+8; growth rates 100/100/60/30/10% | PASS | mythiosRulesData.ts:146-152 |
| 3 | DC 6,7,7,8,9,9; Gathering +2; Trial and [PRESS ON] +4 | PASS | mythiosRulesData.ts:24-29, 99-106; STP:1179 |
| 4 | Pass on net ≥ 1; a tie fails; no auto-pass on a 20 | PASS | server.ts:56-71; every roll site uses the same helper |
| 5 | "You succeed on X+" and the full roll line | PASS (one gap) | STP:1044, 1091, 955, 1190, 2231. Gap: the United Effort header shows "DC n" and has no X+ (STP:2603); [LOOK CLOSER] is a bare button. |
| 6 | +500 / −150 (gold never below 0); [PRESS ON] +200, no growth | PASS | STP:413-422, 457; App.tsx:1285, 1383 |
| 7 | Growth 12,9,7,5,4,3,3 × rate, only if the roll was uncertain | **FIXED** | The Approach used a fixed "day 7" (always 3). It now uses the roller's nth day played this week, like the daily Challenge (STP:2176). |

## Pay

| # | Rule | Result | Where |
|---|---|---|---|
| 8 | Weekday fight: 300 on a day with no Challenge, 0 on a day with one | PASS | mythiosChaptersData.ts (12 fight days: 8 pay, W2D3/W4D2/W4D5/W6D6 pay 0; W1D1 pays as canon's tutorial) |
| 9 | [LOOK CLOSER] 75, Match 50, United Effort 300, word 25, Relic 150, Fan Out 0 | PASS (one gap) | STP:2197, 2301, 2104; App.tsx:643; BST:936. Gap: Match never pays the 100g "every friend right" rate (STP:2301). The sample friends don't pick in the prototype, so "every friend" can't be judged yet. |
| 10 | No gold literals | **FIXED** | Weekday fight pay was 300/0 typed into the data; it now reads `GOLD_WEEKDAY_FIGHT_ONLY_WIN` / `GOLD_WEEKDAY_FIGHT_WITH_CHALLENGE_WIN`. Left as they are: server.ts:69 (unused by the app) and the workbench's mid-season preset (a test tool). |
| 11 | Player text shows the real numbers | **FIXED** | The "Recent Roll" banner called a passed roll "Hard Road" and could show "+0". It now reads "Passed (Charm +3)" (App.tsx). The Record share card showed made-up 6/6/4 for a new player; it now shows the real counts (RecordTabView.tsx). The fail line still says "−150g" when gold was under 150; the rule is −150 and gold stops at 0. |

## Fights

| # | Rule | Result | Where |
|---|---|---|---|
| 12 | 100 HP each side | PASS | STP:466-472; gatheringEngine.ts:105, 119 |
| 13 | Hit on net ≥ 1, tie misses | PASS | STP:476-493; gatheringEngine.ts:178, 213 |
| 14 | Damage = margin × 5 | PASS | STP:488, 494; gatheringEngine.ts:183, 218 |
| 15 | One tap per round, short pause | PASS | STP:532-551 (420 ms); 2013-2024 (360 ms) |
| 16 | Who strikes first | PASS | STP:342-348 (the day's choice or Challenge); STP:2009 (the Approach) |
| 17 | No +2 Weapon / −15 HP | PASS | gone (comment only, STP:331) |
| 18 | Gear 14–18 / 27–31; costs 950/1,100/1,750/2,400 | **FIXED** | Table and Store were right, but a new game started at Level 2. Canon: "Both start at Level 1". Now Level 1 (App.tsx:148; STP:1707). |
| 19 | Weekday enemy DEF/ATK 21/14 … 24/17; Gathering +1; rewards | **FIXED** | Weekday enemy DEF was 2 lower than canon (19…22), which made every weekday fight easier. Now `epMeta.wDef` (STP:337). ATK, Gathering numbers and rewards were right. |
| 20 | 0 HP = Bruised Scrape, the story goes on | **FIXED** | "Down, not dead" played right, but a lost fight never reached the fire. It is now recorded, and that evening's fire uses the Bruised Scrape line (STP:548, 3254). The test toggle read "Bruised Arm"; it now reads "Bruised Scrape". |

## Relics

| # | Rule | Result | Where |
|---|---|---|---|
| 21 | Attribute Relic +4, once, removed | PASS | STP:384-392, 438-444; App.tsx:1302 |
| 22 | Combat Relic +1/+1 for one fight, removed, disabled at 0 | PASS | Weekday STP:534, 746-759; Gathering STP:2027-2038, gatheringEngine.ts:148-157 |
| 23 | Relics can be given; gold cannot | PASS | App.tsx:652-661; BST:401-424 |

## United Effort

| # | Rule | Result | Where |
|---|---|---|---|
| 24 | Bars at 100 (60 for one friend) | PASS | gatheringEngine.ts:371-374 |
| 25 | Turns from the party list; nobody twice until all have gone | PASS | gatheringEngine.ts:377-401 |
| 26 | A normal Challenge at the weekday DC | PASS | gatheringEngine.ts:391 |
| 27 | Success 10+d20 to "in the way", fail to "at risk"; ends at 0 | PASS | gatheringEngine.ts:394-427 |
| 28 | +300g only if won | PASS | STP:2102-2105 |
| 29 | One Relic per roll, spent either way; no growth | PASS | STP:2058-2092 |

## Garrick

| # | Rule | Result | Where |
|---|---|---|---|
| 30 | Banned phrases | **FIXED** | No stored Garrick line has one. The AI filter lacked "possibly", "couldn't say" and "wouldn't know", and missed curly apostrophes (I don’t know). All are added and tested (garrickRouter.ts:25-80; the Gemini prompt in gmMemoryEngine.ts:14). |
| 31 | Keeps an inn, not "retired" | PASS | (Task 10) |
| 32 | Present all of Week 6 | PASS | campfire-days-v23.json; CEV:120 |
| 33 | Store never locked; old saves load | PASS | App.tsx:55 |
| 34 | "Malakor" line from Gathering 2; never at the Campfire | **FIXED** | From Week 3, the Campfire answered "Who is the king?" with the Malakor line. The router now never says it at the fire (garrickRouter.ts:562; CEV:546). The Gathering path was already right. |

## First-use gates and the Highwall tally

| # | Rule | Result | Where |
|---|---|---|---|
| 35 | The build's own text (108 leads, late lines, 36 questions, week questions, Campfire data) | PASS | none early (scanned) |
| 36 | The Bag verses | **FIXED** | Each week's verse showed from Day 1 of that week, so Week 2's "one king" came before the Day 5 gate. Canon reads each verse at the Gathering; a verse now joins the Bag on Day 7 (BST:542). |
| 37 | Garrick router at the fire | **FIXED** | The fire said the ledger was open from W1D2, so "Why take children?" got "Look at the ledger…" weeks early. It now opens after Gathering 2 (CEV:539). |
| 38 | Highwall 8 / 7 / 6 | PASS | chapterScripts.ts:4526; gatheringScripts.ts:2166; chapterScripts.ts:4832 |

## Party, secrets, words

| # | Rule | Result | Where |
|---|---|---|---|
| 39 | Party 2–6, `{N}` filled | PASS | mythiosRulesData.ts:62-71; ChapterScriptParts.tsx:16-29 |
| 40 | Sample friends Jennifer, Mei, Dev, Arjun, Priya, Theo | PASS | mythiosRulesData.ts:51-58 |
| 41 | Workbench only with `?dev=1`; no hidden meanings on screen | PASS (in the app) | App.tsx:85-88, 707, 922. Outside the app, see decision 6. |
| 42 | No retired things, no invented lore | PASS | (grep) |
| 43 | Player words (Challenge, Week, Match, Record) | **FIXED** | "SHARE HERO RECORD CARD" → "SHARE MY RECORD". |
| 44 | Days by number, never weekday names | PASS | (grep) |

Also fixed while checking: on W1D1, the fire showed an empty "Garrick remembers" box (that day has no callback). It is now hidden.

## Needs Fake Guru's decision

**Decided 15 Oct ("as per your suggestion"):** 1 canon lines, done. 2 from W2D5, done. 3 gates bind Garrick, the Campfire and the build's text, not the episode files. 4 a draft is in `docs/drafts/bag-verses-draft.md`. 5 first time only, done. 6 bundles behind `?dev=1`, out of the build, and the workbench in its own file, done. 7 kept for the demo. 8 and 9 come with the multiplayer work.

1. **Garrick's "noticing" lines at the fire.** All five differ from the Campfire master (`mythios-campfire-table-v2.md` §C). Canon has the full line "…you're favouring that arm. Sit nearer the fire."; the build drops the second sentence. Side by side:

   | Moment | Canon | Build |
   |---|---|---|
   | Bruised Scrape | "{friend}, you're favouring that arm. Sit nearer the fire." | "{friend}, you're favouring that arm." |
   | Fragment first | "{friend} had the Fragment before the rest of us were seated." | "{friend} got the stone-words first today." |
   | Lent a Relic | "{friend} gave a hand today. I saw." | "{friend} handed over a Relic today." |
   | Back after a missed day | "{friend}. Good to see you." | "Back with us, {friend}. Kettle is still hot." |
   | Not here yet | "{friend} isn't here yet. There's room." | "{friend} isn't by the fire yet." |

   Recommendation: canon. Its lines are in Garrick's voice, and "Fragment" is the glossary word.
2. **"I've a bar, a roof and a fire. Kings have had less."** This stored line (garrick-stored-lines.md:75) has no week limit, so it can come up before the W2D5 "king" gate. That is canon against canon. Recommendation: allow it only from W2D5.
3. **Canon text that breaks its own gates:** Gathering 1 says "four names" (gate W2D1); Gathering 2 says "Highwall" (gate W5D1); fragment 1-1 opens "Five fell" (gate W3D3). Recommendation: the gates describe Garrick's and the Campfire's words, not the episode files. Keep the story text and note the exception in Core Rules.
4. **The Bag verses' text.** "Verse of the First Oath" (Week 1) is not in canon, and Week 3's "Verse of the Price" is canon's "Verse of the Fall" (`mythios-cult-bible.md:126`). Several lines are rewordings. Recommendation: replace them with canon's verse text word for word (a draft to approve first).
5. **The Malakor line "the first time he is asked".** At the Gathering, Garrick gives it every time he is asked. Recommendation: first time only; after that, a stored deflection.
6. **Secrets outside the app.** The server hands out the old audit bundles (`/mythios-full-audit-bundle-14oct.md` and `public/*.md`) to anyone. They hold the whole secret. The player's download also contains the workbench code. On screen nothing leaks. Recommendation: before anyone outside the team plays, serve the bundles only with `?dev=1` and keep the workbench out of the player build.
7. **The Campfire's "Party Seat & Test Controls" panel** shows in the player view. It lets one phone act as each friend. Recommendation: keep it for the one-phone demo, but show it only with `?dev=1` once real friends play.
8. **The Match 100g rate** (every friend right) can't be judged until friends pick for real. Recommendation: leave it until multiplayer.
9. **The dice source.** Core Rules §12a says the server rolls every die. Today only the daily Challenge, [PRESS ON] and Fan Out ask the server; the Approach, [LOOK CLOSER], United Effort and fights roll in the phone. Recommendation: move all rolls to the server with the multiplayer work.

## Old, unused data (no player sees it)

- `GLOSSARY_TERMS` (mythiosRulesData.ts:211) has outdated text ("about five minutes", "Highwall Keep").
- `watchPageStrokesLeft` (App.tsx:179).
- The old Gathering quiz text (mythiosGatheringsAndAudit.ts).
- `asymmetricChoices` (mythiosChaptersData.ts:564).
- `runMythiosVerifier`'s "Garrick absent only W1D1" check reads the retired summaries and reports a false fail in the workbench.
- `POST /api/resolve-fight` (server.ts) is unused.

Recommendation: delete these in one clean-up pass, with Fake Guru's OK.

**Done 15 Oct (Fake Guru: "yes").** All deleted. `runMythiosVerifier` now checks the build's own player text (Fan Out leads, late lines, meaning questions, week questions) for gate leaks, counts canon's real Match steps (10), and reads Garrick's absence from the Campfire data; its W1D1 check now passes. Garrick's Gemini memory slice and the workbench read canon's day facts (`canonDayFacts.ts`), not the old summaries (one of which said the hidden door "opens only for your blood", not canon).
