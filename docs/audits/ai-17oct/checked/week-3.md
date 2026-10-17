# Week 3 (The Fire Stone): the audit claims checked against the files

Read-only check, 17 Oct. Main sources: `docs/playthrough/season-part-2-weeks-3-4.md` (PT), `docs/canon/episode-3-the-fire-stone.md` (EP3), `src/data/chapterScripts.ts` (CS), `src/data/gatheringScripts.ts` (GS), `src/data/campfire-days-v23.json` (CF), `docs/canon/garrick-deception-table.md` (DT), `docs/canon/episode-4-the-water-stone.md` (EP4).

Auditors: G = Grok, Q = Qwen, P = Perplexity, M = Meta, D = DeepSeek, C = ChatGPT.

| # | Day/part | Claim | Made by | Verdict | Evidence | Size | Recommended fix |
|---|---|---|---|---|---|---|---|
| 1 | D5 fight | The strike-first rule and the prose are reversed | G, C | DOC ERROR | CS:2627: option 1 (WREN'S LINE) lets the player strike first; matches `firstLines[0]`. The server is the same. | — | None. |
| 2 | D3 Campfire | Garrick's question about "five" doesn't fit the pins (place vs children) | G | TRUE | CF 3-3 nudge vs forkA/forkB | Medium | Keep the question; rewrite the pins, e.g. "Meira miscounted / There is a fifth nobody found". |
| 3 | D5 Campfire | "What tool cuts letters like that?" doesn't fit the pins (bed left as a message / left in a hurry) | G | TRUE | CF 3-5 | Medium | "One blanket folded, one thrown down. Did they leave that room for us to read, or did they just run?" |
| 4 | D6 Campfire | "Whose was it?" (the lamp) doesn't fit the pins (go in now / watch first) | G | TRUE | CF 3-6 | Medium | "A lamp went into the hill ahead of us. Do we follow it now, or watch first?" |
| 5 | D6 Pull | "Into the Kiln, tonight" clashes with the Gathering being tomorrow | C | WRONG as a story fault; a mixed signal on the card | Story time is one night (W2 and W5 use the same pattern); only the card prints "tonight" beside "Tomorrow: THE GATHERING" | Small | Card: "Next: THE GATHERING" (Weeks 2, 3 and 5). |
| 6 | D6 last light | The clue "No way down in the dark" says the knife-edge can't be crossed at night, yet the party goes in that night | (helper) | TRUE (minor) | fanOutLeads vs Gathering arrival | Small | Add: "The scree is the only way down tonight." |
| 7 | D6 thread | Reading the way aloud is a threat that is never paid | G, D, P | WRONG: it is paid | EP3:653 [PLANT]; DT:275; paid at Gathering 4 (EP4:847, 967) and the finale | — | Keep it: the season's core mechanism. |
| 8 | D6 thread | The read-it-out choice is misleading | D, P | Mostly a doc artefact | "The story is the same" was a ⚙ note, not player text | Small | None. |
| 9 | D1 fight | The fight changes nothing (a "limp" never mentioned again); cut it | G, M, D, P, Q | TRUE (no consequence); disagree with cutting | CS:2033; Day 1's only paid beat | Medium | Keep it; let the win show the limp later (a dragging print, or the card). |
| 10 | D1/D5 fights | No defeat line: the text after a loss assumes he broke off | (helper) | TRUE | CS: the steps after both fights are unconditional | Small | Add a short line for a loss: "You are on the wet grass. He does not finish it." |
| 11 | D5 fight | The grey coat flees again (the sixth silent attacker) | D, Q, P | TRUE (pattern); partly agree | Grok argues the repetition is the plot until W4 | Small | Keep him silent; give the hat with the stitched letters a later echo. |
| 12 | D5 choice | The riders' line has no reward | P | TRUE | Enemy strikes first, no upside | Small | Give the open line one detail of its own. |
| 13 | D5 hut | A loss gives no route to the hut and the fragment | C | WRONG | CS:2635–2660: all unconditional | — | None. |
| 14 | D5 thread | The search is a menu, not a choice | G | TRUE; keep | All three finds feed the Gathering | Small | Keep. |
| 15 | D5 | "Until the throne rise whole" is underused | D, P | WRONG: paid at Gathering 3's turn | PT:1523 | — | None. |
| 16 | D2 thread | Three questions you must all tap is a fake choice | G | TRUE; keep | "Only need her the once" must reach everyone | Small | Keep. |
| 17 | D2 Challenge | A fail gives the same as a pass | D | Partly WRONG: a fail loses the house and the chips | PT:317–321 | — | None. |
| 18 | D2 card | The chapter hedges ("If Wren was in that cart…"), the card and the recap state it as fact | (helper) | TRUE (minor) | PT:329, 353, 453 | Small | Card: "Wren was most likely in it". |
| 19 | D2 | The boy talks too easily | D | OPINION, disagree | He's a child who saw it | — | None. |
| 20 | D2 | The black-glass custom needs planting earlier | M | OPINION, disagree | Planted D1, paid D4 and G3 | — | None. |
| 21 | D2 | Garrick's knowledge should feel uneasy | P | Already done | "My family's been in these hills longer than the roads have." | — | None. |
| 22 | D3 | "Under the Widow's Tooth" breaks the map | G | Mostly WRONG | Fenmark's smoke is visible from the rock | Small | Optional: "below the Widow's Tooth". |
| 23 | D3 | Meira's "five" note is optional | C, D, P, M | WRONG: unconditional | CS:2397–2399 | — | None. |
| 24 | D3 | Nobody reacts to the riders passing | D | WRONG | The Pull, the card and Garrick's recall | — | None. |
| 25 | D3 [PRESS ON] | "Carrying double" should be on the main path | P | WRONG for Week 3 | Extra by design | — | None. |
| 26 | D3 | A failed crossing should cost a clue | P | OPINION, disagree | Canon retired carried costs on 3 Oct | — | None. |
| 27 | D4 choice | Trail or doorway isn't a real fork | G, P | TRUE; accept as a colour choice | Both give the chip and the door | Small | Accept. |
| 28 | D4 | "Your own fire… shows just as plainly" blames the party | G | OPINION, partly disagree | Deliberate pressure | Small | Optional softer touch. |
| 29 | D4 | The riders missing the doorway is unexplained | P | TRUE; deliberate | Explained at Gathering 4 | — | None. |
| 30 | D4 | The bone die has no follow-up | D | TRUE; keep as texture | — | Small | Keep. |
| 31 | D6 | A third six-fragment map | P, M | OPINION; partly addressed | — | Medium | Season-wide. |
| 32 | D6 Challenge | A fail has no consequence | P | Partly WRONG: a fail arrives in the dark | PT:1111 | Small | None. |
| 33 | Riddles | Stock tavern riddles | Q | TRUE; quips tie to the day | — | Small | Optional riddle pass; keep the quips. |
| 34 | G3 Approach | The map makes the DC harder | C, P | DOC ERROR | +2 is to the roll | — | None. |
| 35 | G3 Battle | "Four robed figures" vs one enemy each | C | DOC ERROR | GS:882 `{N}` | — | None. |
| 36 | G3 Battle | It should be one shared fight | P | OPINION (season-wide) | — | — | Season-wide. |
| 37 | G3 United Effort | The bars aren't tested for 2–6 friends | C | Mostly WRONG | The odds don't depend on party size; the simulator only runs four | Small | Add 2- and 6-friend simulator runs. |
| 38 | G3 United Effort | A loss is soft | D | Partly WRONG | It carries into W4D1 (Wren carried, her cuts bound) | — | Keep. |
| 39 | G3 | Wren should be sitting, not tied | M | WRONG: she's never tied | PT:1328 | — | None. |
| 40 | G3 Verse | The Verse of the Fall is long | G | OPINION, partly agree | Broken up by Matches and [READ ON] | Small | Optional trim. |
| 41 | G3 Ask | "WHO LEADS YOU?" gets a riddle | D | WRONG | "One whose face I've never seen.": concrete and true | — | None. |
| 42 | G3 Ask | Trim the Ask board | P | OPINION, partly agree | — | Small | After a timed test. |
| 43 | G3 Cliffhanger | The escape is unexplained | D, P, G | WRONG: W4D1 opens on it | EP3:1021 | — | None. |
| 44 | D1 | Give the fourth name a lead | P | OPINION, disagree | Garrick's "one road at a time" depends on it | — | None. |
| 45 | Garrick | All Week 3 lines true, with no promise or prediction | M | TRUE | DT Week 3 | — | None. |
| 46 | Party size | Hard-coded friend names | C, G | DOC ERROR | `{F1}`–`{F3}`, smallPartyLines | — | None. |
| 47 | Fragments | The fragment depends on the result | — | DOC ERROR | All unconditional | — | None. |

## Week 3 top 5 real fixes
1. Make Garrick's question match the pins on Days 3, 5 and 6.
2. Give the Day 1 fight's win a real effect.
3. Add defeat lines after the Day 1 and Day 5 fights.
4. Fix the Day 6 night-route clash (one clause in the clue) and show "Next:" on the Day 6 card (Weeks 2, 3 and 5).
5. Polish: a reward for the riders' line; Day 2's card "most likely".
