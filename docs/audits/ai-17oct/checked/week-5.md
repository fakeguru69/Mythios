# Week 5 (The King's Stone): the audit claims checked against the files

Read-only check, 17 Oct (ep5 = `docs/canon/episode-5-the-kings-stone.md`). Several "Big" claims are wrong: they came from the play-through's layout. It never said "everyone continues here" after a branch, so the Day 3 fragment, the Day 4 helm and the Day 6 timing looked gated. They are shared by every player. The countdown and moon timeline is consistent end to end.

## True, or new finding
| # | Part | Claim | Made by | Verdict | Size | Recommended fix |
|---|---|---|---|---|---|---|
| 3 | D1 card | "Someone at the fire may have seen it" promises more than the fire gives | ChatGPT | TRUE (minor) | Small | Say what was missed: "You did not read the stone yourself." (Season-wide: build the share.) |
| 6 | D2 | The new grave is pointed at and never paid off | Grok, Perplexity | TRUE | Small | Make it plainly the fleeing family's: "They dug it." |
| 12 | D3–D5 | The palm-opened housing is a daily stamp (three days running) | Grok, Perplexity | TRUE, agree | Medium | D3: put the fragment behind the newest bar, on the main path. |
| 20 | D5 | The exact count (eight) is shown only on a pass; the recap tells everyone | ChatGPT, DeepSeek | TRUE, harmless | Small | Optional: "eight are left" in the shared summary line. |
| 22 | D5–G6 | Countdown/moon: consistent; one clarity risk at ep5:892 ("seven nights from full, seven nights from swallowed whole" reads as two events) | ChatGPT, Perplexity | Mostly WRONG; one TRUE | Small–Med | "seven nights from full, and on that night, from swallowed whole." |
| 23 | D5 | The extra bedrolls never pay off | Perplexity | TRUE | Small | Leave, or one W6 line. |
| 25 | D6 | The lookout choice is false: Mei is always posted; a party of 2 sees three "POST Mei" buttons; friends 4–5 can never be posted | Grok, ChatGPT, DeepSeek, Perplexity | TRUE, worse than reported | Medium | One button per real friend; the lines name the friend picked, in the demo and online. |
| 30 | G5 | "Nothing strange about a man having linen to spare" | Grok | TRUE; already rewritten and live (0074) | — | Done. |
| 32 | G5 arrival | "The Order has never known the room was there" is said too many times | Grok | TRUE (repetition) | Small | Cut one of the two arrival lines. |
| 35 | G5 United Effort | Exact win/loss rules missing | ChatGPT | WRONG in the game; the doc didn't state them | — | Play-through: "Lost if Their Trust reaches 0 first." |
| 37 | G5 Match | Two Matches is a quiz | DeepSeek | The second plays only if the roll-call was won (doc didn't show it) | Small | Keep; show the condition in the doc. |
| 46 | Campfire | D1 and D3 questions don't match their pins | Grok | TRUE | Small | Reword those two questions. |
| 45 | Riddles | Stock riddles | Qwen | TRUE | Small | Fake Guru decides. |
| A | G5 recap (new) | "Your blood, which had woken the other four, did nothing to it." is wrong: the children's blood woke the four; yours opened the doors | — | TRUE (recap slip) | Medium | "The children's blood had woken the other four. Yours did nothing to this one." |
| B | G5 Garrick chat (new) | Canon's typed answers ("Meira thought so.", "The page says 'whose.' It doesn't say who.", "I'm not of your blood.") aren't in the router | — | TRUE (missing) | Medium | Add them as stored lines with week gates; sync and redeploy the function. |
| C | Play-through (new) | No "everyone" marker after branches; the second Match condition and the [LOOK CLOSER] "not offered if the roll-call was lost" missing; "their own The Hollowed" | — | DOC ERROR | Medium | Fix gen-playthrough.ts before any next audit round. |
| D | D6 fire (new) | The fragment meaning question "Why there, and why that night?" leads to Gathering 5's answer | — | OPINION | Small | Consider a question about "joined". |

## Wrong or opinion-disagree (in brief)
- D1 [ASK GARRICK] bypasses failure (Qwen, DeepSeek, Perplexity): disagree; canon needs the place either way, and a fail still costs the reading and 150g. "Make Garrick less certain": no (no fake doubt).
- D2 strike-first contradiction (ChatGPT): DOC ERROR. Replace the dog fight: disagree, no dog dies. Campsites the same: WRONG.
- D3 fragment behind [PRESS ON] (DeepSeek, ChatGPT): WRONG. Failing the climb costs nothing: WRONG.
- D4 helm only on press (ChatGPT): WRONG. Helm never settled: paid at G5; keep the doubt.
- D6 "tonight" vs tomorrow (ChatGPT): WRONG (story time). Wall crossing repeats Day 3 (DeepSeek): WRONG.
- G5 map bonus: DOC ERROR. Meta's linen Craft notice: disagree, it spends Week 6's payoff. Shared Battle: season decision. United Effort party size: mostly WRONG.
- Week question picks the rescue reading (Grok): mostly disagree; MYTHIOS asks it, and it sets up "The page said the fifth would end this."

## Week 5 top 5 real fixes
1. Day 6 lookout buttons: one per real friend; the lines name who was posted.
2. Gathering 5 recap: whose blood woke the four.
3. Garrick's three canon answers at Gathering 5 added to his stored lines.
4. The moon line at ep5:892.
5. Vary Day 3's fragment find.
