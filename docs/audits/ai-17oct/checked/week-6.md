# Week 6 (The Finale): the audit claims checked against the files

Read-only check, 17 Oct. Sources: `docs/canon/episode-6-the-finale.md`, `src/data/chapterScripts.ts`, `src/data/gatheringScripts.ts`, `scripts/gen-gathering-scripts.cjs`, `scripts/gen-gathering-sql.ts`, `supabase/migrations/0032_gatherings.sql`, `src/data/campfire-days-v23.json`, `src/data/garrickRecap.ts`.

## Key answers
1. **HOLD IT BACK does not skip the cup, the kneel or "One stayed close".** Only "He takes the fifth out of your hand…" is hold-only (`gatheringScripts.ts:2611`). The cup, the kneel and "One stayed close" are one unconditional step (`:2620`; canon episode-6:894-903). Grok misread the play-through, which never marked where the branch ended.
2. **The act goes to one random friend by design** (`0032:500-505`; Core Rules line 594; canon episode-6:907). The table gets 30 seconds to talk first. The real name fills {CHOSEN}.
3. **The Battle split:** alternating by join order, faithful first (`0032:325`). 1 friend = faithful; 3 = 2F+1H; 5 = 3F+2H.

## True, or new finding
| # | Part | Claim | Made by | Verdict | Size | Recommended fix |
|---|---|---|---|---|---|---|
| 1 | D7 vote | HOLD IT BACK promises a different outcome but plays the same | Grok, Meta, DeepSeek, ChatGPT | TRUE (canon's intent); agree on wording | Big | Give both buttons a line describing the action: GIVE "put it in his hand"; HOLD "keep your hand closed on it". One outcome. |
| 8 | D7 act | All three acts end the same at the king's eyes | Grok, Perplexity | TRUE | Medium | One line per act after "he opens his eyes". |
| 9 | D7 act | The act is kept only in the night's state | Qwen | TRUE | Small | Record g6_fifth / g6_act for Season 2. |
| 14 | D7 Battle | No story lines while it runs | Grok, Perplexity | partly agree | Medium | Two stored lines (the chant thinning, a hollowed rising). |
| 18 | D7 pacing | Canon's quiet minute after the four quotes isn't built (the step holds 5–20 s) | ChatGPT | TRUE | Medium | Hold 60 s as canon says (generator + server). |
| 19 | D7 length | Too dense for 20–30 minutes | ChatGPT | agree, needs a test | Medium | Time one real playtest. |
| 22 | Recap | Add the cup ("Family habit…") and the linen | Meta | TRUE | Small | Add "Family habit…" as a said line; a short "What you saw" section. |
| 24 | D1 fire | Question doesn't match the pins | Grok | TRUE | Medium | "He saw a light. Did he see us?" |
| 25 | D3 fire | Question doesn't match the pins | Grok | TRUE | Medium | "Is the front shut to everyone, or only to us?" |
| 26 | D4 fire | Question doesn't match the pins | Grok | TRUE | Medium | "Does that rock wait for its moon, or open because we're here?" |
| 27 | D6 fire | Garrick says "Not one of the dead turned its head", but one did and you fought it | Grok | TRUE: a near-false Garrick line | Medium | "Only one of them turned, and it turned for us. Tomorrow night, is that door ours?" |
| 28 | D6 | The flask's "last" is poured twice (sill in the chapter, then the cup night at the fire) | Grok | TRUE | Small | Set 6-6 cupNight false, or "The cup on the sill stays where he put it." |
| 30 | D7 Battle (new) | The chant counts all enemies; the episode file says "more than half of the faithful", Core Rules says "of the enemies" | — | Canon disagrees with itself | Small | Fake Guru decides; I'd count the faithful only in Week 6. |
| 31 | D7 (new) | "He never lied to us. He only never told us the price." never plays: a generator bug drops it | — | TRUE (bug) | Medium | Fix gen-gathering-scripts.cjs; regenerate; the act pick moves to step 62, so update the guard and the `{pick:61:` in g_view by a new migration. |
| 32 | D7 act (new) | A friend alone reads "Everyone else: you have thirty seconds" | — | TRUE | Small | An "alone" line; skip the 30 s. |
| 33 | D1 | "The Order has never known this room… It still does not": a reread cheat (Garrick is in the room) | ChatGPT | TRUE | Medium | "Its watchmen have never known this room was there." |
| 34 | D1 fire (new) | The callback "you crossed the wall and nobody heard" contradicts Gathering 5 | — | TRUE (a false recall) | Small | "Last night they came down the hill for us. Tonight one of them looked straight at this window." |
| 36 | D3/D5 | [PRESS ON] hides the best details (eleven; chisel) | DeepSeek, Perplexity | TRUE; disagree | Medium | Keep as rewards (texture, not plot). |
| 37 | D4/D6 fights | The result changes nothing | DeepSeek, ChatGPT | TRUE by design | Small | Optional loss-only line. |
| 39 | D2 | The failed collapse costs only gold | DeepSeek, Perplexity, ChatGPT | TRUE | Small | Optional fail line. |
| 40 | D2-D5 | The "palm opens a housing" find repeats four days | Grok | TRUE, agree | Small | Hide D2's fragment differently. |

## Wrong or doc errors (in brief)
- The hold branch skips the cup/kneel/"One stayed close" (Grok), the heartbeat isn't prepared on both branches (ChatGPT), hold should cost something (DeepSeek): WRONG.
- "Arjun" hard-coded (ChatGPT), enemy split unclear (ChatGPT), blank Battle title (Grok), map bonus (ChatGPT, Perplexity): DOC ERRORS.
- Fragments/facts behind optional wins on D3–D6 (ChatGPT): WRONG; all unconditional.
- Random friend for the act (DeepSeek, Perplexity): TRUE, but keep it (canon rule; the table talks first).
- Give and Hold should play differently (Meta, Grok): disagree; fix the labels.
- "Say a name" not tied to the act (DeepSeek): disagree; it's remembrance.

## Week 6 top 5 real fixes
1. Bring back "He never lied to us. He only never told us the price." (generator bug), with the step-number follow-ups.
2. Make the four fire questions match their pins; Day 6's "Not one of the dead turned its head" is untrue. Fix Day 1's false callback.
3. Word the vote honestly: describe the action, not the outcome.
4. One line per act after the king opens his eyes; a solo version of the act line.
5. Build canon's quiet minute; Fake Guru decides the chant rule; remove the double flask pour.
