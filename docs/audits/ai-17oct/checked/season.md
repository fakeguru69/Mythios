# Season-wide and system claims: checked against the files

Read-only check, 17 Oct. Counts come from `src/data/chapterScripts.ts`, `gatheringScripts.ts`, `campfire-days-v23.json`, `dayRecaps.ts`, `garrickRecap.ts` and the migrations. Grok's two fixes (the linen line, `0074`; Recap lines never said, `0075`) were already in before this check.

## True, or new finding
| # | Area | Claim | Made by | Verdict | Evidence | Size | Recommended fix |
|---|---|---|---|---|---|---|---|
| 1.1 | Fights | The silent attacker who fights and flees repeats | Qwen, DeepSeek | TRUE | 12 weekday fights. 6 are a silent man who flees (W1D1, W1D3, W1D5, W2D5, W3D1, W3D5). A 7th flees but isn't called silent (W4D5) | Medium | Keep the silence (the faithful can't lie). Give the Week 2–3 fights a different goal; don't cut them. |
| 1.2 | Fights | Defeat branches don't lead on | ChatGPT | WRONG; one gap | Only 2 of 12 fights have a loss-only line; 10 have a win-only line | Small | Optional short loss lines. |
| 2.1 | Challenges | A fail only costs gold | Qwen, DeepSeek | TRUE by design | Of the 29 Challenge days: 11 lose information, 3 lose the first strike, 15 lose only time or comfort. No fail carries forward | Medium | Let a few fails show up the next day, e.g. W6D2 "all of Highwall hears it". |
| 2.3 | Challenges | "Someone at the fire may have seen it" | Grok | TRUE | It ends 10 fail summaries. The fire never shows what the friend who passed saw | Medium | Put each passing friend's find on the board, or cut the sentence. |
| 3.1 | Choices | Colour choices change nothing | Grok, DeepSeek | TRUE | 23 choices; only 5 have any game effect. 8 are `flavor`, with no branch text at all. Core Rules:28 says each choice "must change something" | Medium | Give each `flavor` choice 1–3 lines of its own, or make it one button. |
| 3.3 | W5D6 | Lookout buttons | (new) | BUG | The line after the pick always names {F1}; a party of 2 sees three buttons with the same name | Small | One button per friend, and name the friend picked. |
| 4.1 | [PRESS ON] | It hides the best details | DeepSeek, ChatGPT | TRUE (details); WRONG (fragment) | 11 details, none used later and none a fragment. Their `fanOutClue` copies are read only by the workbench | Medium | Post a pressed detail to that night's board. |
| 5.2 | Fragments | The "housing opens to your palm" find repeats | Grok | TRUE | About 15 of 36 finds, Week 4 Days 2–5 in a row | Small | Vary 2–3 finds. |
| 6.1 | Campfire | It is overbuilt | DeepSeek, ChatGPT | TRUE as a count | About 12 sections, 7 places to tap or write | Medium | Fold the meaning pin into the case so far; make the riddle ask-only. |
| 6.2 | Campfire | Garrick's question doesn't match the pins | Grok | TRUE | 12 clear mismatches: 1-2, 1-6, 2-2, 2-4, 3-3, 3-5, 3-6, 4-2, 4-3, 5-5, 6-1, 6-4. Plus 6-6, which contradicts the story ("not one of the dead turned its head") | Medium | Rewrite the 13. Needs Fake Guru. |
| 6.3 | Campfire | The goodnights never vary | Grok | TRUE | 4 closers; each is heard about 9 times | Small | 1–2 closers per week. |
| 6.4 | Campfire | The openers are all one register | DeepSeek | mild TRUE | 30 of 36 are `wry` | Small | About 6 more quiet nights. |
| 6.5 | Riddles | The riddles are generic | Qwen, DeepSeek | TRUE | All 35 are stock riddles. "Piano" doesn't fit the world, and "light" is used twice (2-4, 6-1) | Small–Med | Replace "piano" and the second "light" first. |
| 6.6 | Week 5 question | It presumes the hope | Grok | TRUE | "What will it take for the fifth to end this?" | Small | "What will the fifth end?" |
| 7.1 | Recaps | Recaps state branch-only details | ChatGPT | TRUE (4 of 12 sampled) | W6D3 board strokes, W5D5 "eight", W1D6 the child's prints, W2D4 Corin in the chamber | Small | Reword so every route saw them. |
| 7.2 | Garrick's Recap | It lists lines he never says | Grok, Meta | mostly fixed | "She wrote it down. I'm telling you now." and "'Speak true, always.' It's their book." are still there: the generator counts GM notes as sayable | Small | The generator checks the played scripts and the router only. |
| 7.3 | Garrick's Recap | The cup and the linen are missing | Meta | TRUE | — | Small | Add both entries. |
| 8.3 | W4D2 | "Mei and Mei" | (new) | BUG | Stale `smallPartyLines.ts` entry | Small | Update the entry. |
| 8.4 | Finale | 20–30 minutes is not credible | ChatGPT | TRUE that it's untested | Gathering 6 is 2,226 words (about 9 minutes to read); passages move on after at most 20 s | Medium | A timed play at 2, 4 and 6 friends; consider a longer hold. |
| 9.2 | Meira's death | Clues are too hidden | ChatGPT, Perplexity | partly TRUE | "Did your people kill her?" "Yes." is on the Ask board that opens once the pen is found; that piece isn't built online | Small | Build it. |
| 9.3 | Garrick | He never mourns his people | DeepSeek | TRUE | At Gathering 5 a watchman dies and Garrick does nothing on the page | Small | One silent act: he closes the man's eyes. |
| 9.6 | G6 act | The three acts end the same | Grok | TRUE | The king's eyes open the same way every time | Small | One line per act. |

## Wrong, opinion-disagree or doc errors (in brief)
- The critical path can be missed (ChatGPT): WRONG. All 36 fragments and all 36 Pulls play on every branch.
- The countdown disagrees with itself (ChatGPT): WRONG. 9, then 8, 7, then 6 down to 1.
- The map makes the Approach harder (ChatGPT, Perplexity), surprise vs strike-first (ChatGPT), "four" and "Arjun" leaks (Grok, ChatGPT): DOC ERRORS.
- Three Matches at Gathering 4 (DeepSeek): WRONG. Ten in the season, two a night.
- Retire the six-fragment map (Perplexity, Meta): disagree; the maps are the plot.
- Make the Battle shared (Perplexity): it already is, through helping.
- Malakor only from Week 4 (Meta): against Fake Guru's gate.
- The Kiln escape (DeepSeek, Perplexity): WRONG; the clues are on the page. HOLD IT BACK skips the cup (Grok): WRONG.
- Random friend for the act, the hint after two quiet minutes: TRUE as facts; keep them.

## Auditor reliability
- **Grok:** the most accurate. Its counts held and its two biggest fixes are already in. Wrong on the cup.
- **ChatGPT:** good on structure. Its top claims rest on the play-through's layout errors, or are wrong. Recap drift and finale timing are real.
- **DeepSeek:** good on patterns. Wrong on several facts. Many of its fixes break the both-branches rule.
- **Meta:** a sound Recap check. Its timing advice goes against canon.
- **Perplexity:** short and unsupported. It misreads the map and the Battle.
- **Qwen:** shallow, with inflated scores. Its fixes would break the secret.
