# Week 2 (The Wind Stone): the audit claims checked against the files

Read-only check, 17 Oct. EP2 = `docs/canon/episode-2-the-wind-stone.md`, CS = `src/data/chapterScripts.ts`, GS = `src/data/gatheringScripts.ts`, CF = `src/data/campfire-days-v23.json`, PT = `docs/playthrough/season-part-1-weeks-1-2.md`. Rows kept here: every claim the check found TRUE, every new finding, and the wrong claims in brief.

## True, or new finding
| # | Day/part | Claim | Made by | Verdict | Evidence | Size | Recommended fix |
|---|---|---|---|---|---|---|---|
| 1 | D1 | Tamsin's three buttons do nothing; one fixed speech | Grok, Perplexity | TRUE | CS ~1076 mode "flavor" | Medium | Give each button an opening sentence of its own, then the shared speech. |
| 4 | D1 Challenge | A fail is soft (Garrick gets him talking) | DeepSeek, Perplexity | TRUE, within the rules | A fail loses only the dragging-wheel line | Small | Keep; optionally a fail also loses "Moving like they'd done it before". |
| 5 | D1 last light | The wooden horse by the gate goes nowhere | DeepSeek | TRUE | `fanOutLeads.ts:404` | Small | One line tying it to the farmhouse child. |
| 8 | D2 | The horn button comes even on a fail | DeepSeek, Perplexity | TRUE, but it must | Needed on Day 5 | — | Keep. |
| 9 | D2 | The three yard choices all play | Meta | TRUE | mode "auto" | Small | Only the picked one adds a second sentence. |
| 12 | D2 Campfire | Garrick's question (how the mark was cut) doesn't fit the pins (a list of birthdays / knew him personally) | Grok | TRUE | CF 2-2 | Medium | "He knew the night the boy was born. From a paper, or from knowing him?" |
| 13 | D2 riddle | (New) "I have teeth but cannot bite" can't be solved: it accepts only "comb (or a cog)" | — | TRUE | CF 2-2; the online check (`0024_campfire.sql:411`) and the demo check reject "comb" | Medium | Accept "comb", "a comb", "cog", "a cog"; regenerate and reload Week 2's Campfire; scan all 36 riddles. |
| 19 | D4 card | "Someone at the fire may have seen it" is false if nobody passed, and online the sharing isn't built at all | Grok | TRUE, worse online | Demo always shares (StoryAndPartyTabs ~1884); nothing online; Core Rules §3:138 requires it; 10 days in the season | Big | Build the online share at the fire, with a true fallback when nobody passed. |
| 20 | D4 Campfire | Garrick asks "what were they getting ready?"; the pins are about hurrying | Grok | TRUE | CF 2-4 | Medium | "They know you're here now. Will that make them hurry?" |
| 25 | D5 | Both choices play, but strike-first follows the pick, and "{F1} comes back off the hill" plays even when you walked the hill | Grok | DOC ERROR for the quote; the tension is TRUE | CS ~1690 | Medium | Tell the unpicked branch as a friend's. |
| 26 | D5 | The scout is a third silent runner | Qwen, DeepSeek, Perplexity | TRUE (repeats) | CS:477, :801 | Medium | Keep the flight (it starts the clock); a win keeps his lamp or shows where he goes. |
| 29 | D5 Campfire | The pins say "king" before the story does | Grok | TRUE as story, allowed by the gate | Chapter insists "only *him*" | Small | Pins: "erased by his enemies / by his own people". |
| 32 | D5 Pull | The Pull explains last week's puzzle like a tutorial | Grok | OPINION, mild agree | PT:2440 | Small | Optional trim. |
| 36 | D6 | The [PRESS ON] hollow is never used | Perplexity | TRUE | — | Small | One arrival line at Gathering 2. |
| 39 | D6 | (New) With two friends, "whoever else is on watch" refers to nobody | — | TRUE | CS ~1928 not in smallPartyLines | Small | Add a 1-friend version. |
| 41 | Campfire | Every night "wry"; the same four goodnights | DeepSeek, Grok | TRUE | CF; campfireDaysData ~74 | Small | Quiet tone on Days 4 and 6; add a few week-specific goodnights. |
| 42 | Riddles | Stock riddles | Qwen | TRUE | — | Small | Keep, but fix #13. |
| 46 | G2 United Effort | A loss costs nothing: the whole Verse still plays, the ledger in a lit niche, Corin "down here" while you're outside | Grok, DeepSeek | TRUE, and wider than they say | GS: no `ue` condition on those steps; the same in canon EP2:792 vs :881, :961 | Big | On a loss: read only "the leaves that came out whole"; Corin holds out the book; "down there". Same plot. |
| 47 | G2 Verse | The Verse is long | Grok, Perplexity, ChatGPT, DeepSeek | OPINION, mild agree | Already four [READ ON] chunks with two Matches | Medium | Optional trim to the Bag. |

## Wrong or doc errors (in brief)
- D1 "no Challenge on Day 1" (Meta): WRONG, there is one. D1 "repeated gag" (Meta): WRONG.
- D2 "the birth-night clue is only on a fail" (ChatGPT): WRONG, unconditional.
- D3 dog fight "forced, no way round" (Perplexity, DeepSeek, Meta, Grok): PARTLY WRONG: already non-lethal (the dog lies down), the setup is in the text; a fight on a Challenge day pays 0 by canon. Keep.
- D4 "the chant never explained" (Perplexity): WRONG, paid at Gathering 2.
- D5 "nobody reacts to the black circle" (DeepSeek): WRONG.
- D6 "the map is behind [PRESS ON]" (ChatGPT): WRONG; only the empty hollow is.
- D6 "sound carries is a fake threat" (Grok, DeepSeek): OPINION, disagree; a [PLANT] paid in Week 4.
- G2 map bonus (Perplexity, ChatGPT), "four robed figures" (ChatGPT): DOC ERRORS.
- G2 "sealed questions auto-answer" (Qwen): WRONG for Week 2, none sealed.
- G2 "Malakor too early" (Meta): OPINION, disagree (Fake Guru's gate).
- G2 "why don't they take us?" non-answer (DeepSeek, Meta): OPINION, disagree; "I don't know" is banned, and Meta's "witnesses" would be a lie.

## Week 2 top 5 real fixes
1. The missed-clue share at the fire, built online, with a true fallback.
2. A lost United Effort at Gathering 2: write the loss version of the Verse opening and the ledger scene.
3. The Day 2 riddle can't be solved: fix the accept list and reload.
4. Make Garrick's question match the pins on Days 2 and 4; take "king" out of the Day 5 pins.
5. Day 5: tell the unpicked branch as a friend's; let a win over the scout change one detail.
