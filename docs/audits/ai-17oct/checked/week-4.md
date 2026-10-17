# Week 4 (The Water Stone): the audit claims checked against the files

Read-only check, 17 Oct. Sources: ep4 = `docs/canon/episode-4-the-water-stone.md`, CS = `src/data/chapterScripts.ts`, GS = `src/data/gatheringScripts.ts`, CF = `src/data/campfire-days-v23.json`, `src/data/smallPartyLines.ts`, `src/data/garrickRouter.ts`, `src/data/garrickRecap.ts`, Core Rules, the server migrations. Meta numbers its Week 4 days wrongly (its "Day 3" is Day 4); its claims are filed under the right day. Rows marked "(new)" were found by the check, not by an auditor.

## True, or new finding
| # | Day/part | Claim | Made by | Verdict | Evidence | Size | Recommended fix |
|---|---|---|---|---|---|---|---|
| 1 | D1 → G4 | The blade that "cut rope" is never paid off; the Kiln escape stays unexplained | Grok, ChatGPT, Perplexity | TRUE | ep4:96; nothing in W5–W6; the turn's recall list (GS ~1727) leaves it out | Medium | One recall line before the page line: "Under the Kiln: a blade in the dark, and it cut only rope." No narrator explanation (canon cut it, ep4:977). |
| 6 | D1 (new) | Garrick's Recap places the knives line at "when someone says the Order could have killed them"; that friend line was cut | — | TRUE | `garrickRecap.ts`; ep4:141; CS:3040 | Small | Deception table row: "Day 1, under the Kiln"; regenerate the Recap. |
| 7 | D2 fire | Question (the coin) doesn't match the pins (box vs swords) | Grok | TRUE | CF:589-602 | Medium | "Four armed men for one little box: what is the message, the box or the bare blades?" |
| 8 | D2 | Prose says "three men", the fight is one bar | ChatGPT | TRUE | CS ~3113 | Small | Card second line: "Three of them, and they fight as one." |
| 10 | D2 (new) | **"Mei and Mei take the lake road"**: in a party of 2 or 3 one friend is named twice | — | TRUE (game bug) | CS:3147, 3155 `{F1} and {F3}`; the short-party entry in `smallPartyLines.ts:63-66` still holds the old text, so it never matches | **Big** | Update the entry to the current lines (1 friend "{F1} takes…/comes back…"; 2 friends "{F1} and {F2}…"); check every other entry against CS. |
| 15 | D3 fire | Question (the skiff) doesn't match the pins (right night vs right child) | Grok | TRUE | CF:620-633 | Medium | "Eight nights, and still waiting. For the right night, or the right child?" |
| 16 | D3 | Cut "They are waiting for something." | Grok | OPINION, agree | ep4:284, :343 | Small | Cut from the chapter, keep on the card. |
| 17 | D3 | Shelf / Window is a false choice | ChatGPT | TRUE | CS:3284 mode `each` | Small | Present it as looking round the room. |
| 19 | D2–D5 | The fragment sits in a housing that opens at your touch every day | Grok, Perplexity | OPINION, agree | D2, D3, D4, D5 alike; only D6 differs | Medium | Rewrite one or two like D6 (found loose, in the silt). Canon text: Fake Guru. |
| 20 | D4 card | The card calls the fragment "a warning" before it is solved | Grok | OPINION, half agree | ep4:452 | Small | Card: "Meira called it the old songs' word for the marked." |
| 22 | D4 fire | The fire asks the moon-blood clue several ways | ChatGPT | TRUE | Opener, question, pins and `fragmentMeaningQuestions.ts:28` | Small | Change the opener; keep one moon-blood question. |
| 24 | D4 | Lead players to the market cross | Perplexity | OPINION, slight agree | Only the Craft notice names it | Small | One shared line placing the cross earlier. |
| 25 | D4 (new) | Meira's notes hold "every word", yet the player still unscrambles it | — | TRUE (small gap) | ep4:452 | Small | "She had this line already, half of it smudged past reading…" |
| 29 | D6 → G4 (new) | The Pull says "Now.", then a Campfire night and a day pass before a Gathering that opens "already rowing" | — | TRUE (same pattern as W3/W5) | CS:3793 | Medium | Pull: "…after that sound, at nightfall tomorrow: together." |
| 34 | G4 | "He did not wake" reads as the king | ChatGPT | TRUE (wording) | 0059; GS:1872 | Small | "…the water-gate: the man lived, but could not answer." |
| 35 | G4 | A lost Ask board isn't signposted | DeepSeek | Mostly WRONG; one real cost | The sealed flinch at the socket is on the board only (`ue won`) | Small | Optional: add the flinch to the lost branch. |
| 38 | G4 turn | Give the turn a quiet beat | DeepSeek | TRUE (game differs from canon) | ep4:880 "one quiet minute"; the server holds ~5 s (0032:171, 514) | Medium | Hold an `alone` step 60 s or until [GO ON] (also G1, G6). |
| 40 | G4 Ask | Trim the board | Perplexity | OPINION, partly agree | 13 rows | Small | Fold the five pen questions into three. |
| 42 | G4 | Don't withhold the pen on a lost gate | Grok | Already right | ep4:748/759 | — | Protect it. |
| 46 | Recap | Two Recap entries are never sayable: "She wrote it down. I'm telling you now." and "'Speak true, always.' It's their book." | Grok | TRUE | No router route; counted as said because they appear in an ep4 GM note (:991); 0075 missed them | Medium | Add the two router routes canon intends, sync and redeploy Garrick; or drop them from the Recap. |
| 47 | G4 (new) | Party of 2: "Two of you take his shoulders. Somebody finds a knife" leaves nobody for the pin | — | TRUE | GS:1476 | Small | 2 friends: "One of you takes his shoulders. The other finds a knife with a good point." |
| 48 | Riddles | Stock riddles (towel, sponge) | Qwen | OPINION, partly agree | — | Small | Replace D3 and D4 with lake or lamp riddles. |
| 49 | Campfire | The same goodnights every night | Grok | TRUE | — | Small | Season-wide: week-specific goodnights. |

## Wrong, opinion-disagree or doc errors (in brief)
- D1 branches unclear (ChatGPT), the two choices unbalanced (Perplexity), Garrick suspected of the cutting (Meta; fair play), a soft ash fail (DeepSeek): WRONG or disagree.
- D2 fragment tied to the fight (ChatGPT): WRONG/DOC ERROR. Fight optional (DeepSeek), carter keeps the coin on a fail (breaks W5D1), fragment too early (Meta; it is the second Match), ford fight specific (Perplexity; already done): disagree.
- D3 soft skiff fail, earn the grandmother's trust (DeepSeek, Perplexity): disagree.
- D4 moon-blood lands quietly (DeepSeek, Perplexity): WRONG. A fail differs only in detail (DeepSeek): WRONG.
- D5 boat and carving behind the fight (ChatGPT): WRONG. The boatman flees (Qwen, DeepSeek, Perplexity): disagree; Qwen's "to the death" breaks the tone. Fog fail and the Order's boat (Perplexity): WRONG.
- D6 flame fail meaningless (Qwen, DeepSeek), explain the listener (Perplexity): disagree.
- G4 map modifier (ChatGPT, Perplexity), "four of them" (Battle): DOC ERRORS. Bars untested by party size (ChatGPT): WRONG (Core Rules:755). Three Matches (DeepSeek): WRONG, two. Meira's death needs a beat (Perplexity): WRONG. Shared Battle: season-wide.
- "This was never about you" a slogan (Grok), "Malakor" first here (Meta), change Meira's footnote, tone down the drowning (Meta): disagree.
- The sealed-question timer answers the lore (Qwen): WRONG for Week 4.

## Week 4 top 5 real fixes
1. The "Mei and Mei" bug on Day 2: update the stale short-party lines and re-check every other entry.
2. Day 1's blade: one recall line at the Gathering turn.
3. The Day 2 and Day 3 fire questions: match their pins.
4. Day 6 → Gathering timing: the Pull says "Now." a night and a day too early.
5. Garrick's two Recap answers with no route, and canon's quiet minute at the turn.
