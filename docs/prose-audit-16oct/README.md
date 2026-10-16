# Prose audit, 16 Oct 2026

**Asked by Fake Guru:** "Mythios and all text and prose (say cult scripture, lore etc) needs to be well written. Nice description and good world building and a pleasure to read. And yet it's clear for players to follow the story. It doesn't need to be lengthy but don't rush it with just a one or two liner. Dun make it too short too. Audit all lines to make sure they are a pleasure to read." Also: Garrick is likeable (pleasant, light humour).

**Nothing in the game has been changed by this audit.** Every file below is a list of proposals (the line now, the line proposed, why), for Fake Guru to approve. The rules each helper kept: no new plot, lore, clues or numbers; [PLANT] lines, double meanings and the Deception Table's Garrick lines keep their exact words; the first-use gates hold; Garrick never lies, promises or predicts.

## The verdict

The writing is already good, often very good: the Gatherings, the cult scripture and the fragments read like the real thing, and Weeks 5 and 6 are the strongest weekdays. The weak spots are the build's short linking text and a scatter of rushed one-line passes, thin openings, and a few unclear sentences.

| # | File | Checked | Proposed |
|---|---|---|---|
| 1 | [Garrick in the story](1-garrick-story.md) | 64 lines | 3 rewrites, 6 framing touches, 5 new warm moments |
| 2 | [Garrick at the Campfire](2-garrick-campfire.md) | 158 lines | 36 rewrites |
| 3 | [Garrick in the chat](3-garrick-chat.md) | about 50 lines | 10 rewrites |
| 4 | [Weeks 1–2 weekdays](4-weeks-1-2.md) | about 190 passages | 21 |
| 5 | [Weeks 3–4 weekdays](5-weeks-3-4.md) | about 190 passages | 25 |
| 6 | [Weeks 5–6 weekdays](6-weeks-5-6.md) | about 190 passages | 17 |
| 7 | [The Gatherings and the scripture](7-gatherings-and-scripture.md) | about 230 passages | 31 |
| 8 | [Fragments, Fan Out leads, questions, Campfire forks](8-fragments-leads-questions.md) | about 300 | fragments none; leads, late lines, questions and forks about 25 |
| 9 | [The online screens' own text](9-online-screens.md) | about 230 strings | about 40 |

Garrick's morning lines (29) were rewritten three times to this standard and are in `docs/design/garrick-morning-lines-proposal.md`.

## Real mistakes found (rule breaks as written)

**In the build (fixed 16 Oct without asking, as they break canon's written rules; tested in a browser on the local copy):**
- Two of canon's first-time lines never show (after the first fight; after the first passed Challenge; Core Rules §7).
- The weekday fight online does not use canon's round line and result card (Core Rules §4).
- An armed Relic is labelled USED before it is spent (Core Rules §12a: a second tap takes it back).
- A friend in the Gathering lobby is told "Only the host can do that." instead of the written 10-minute line.
- Still a question: a lost weekday fight shows the build's "BRUISED SCRAPE" (kept as good in CLAUDE.md §5); canon §4's card says "DEFEATED." Left as it is until Fake Guru picks.

**In canon text (need Fake Guru's yes):**
- Garrick at the Campfire: 4-1 "Count yourselves. I will, too." and the closer "Sleep. I'll mind the fire." are promises; 6-1 "I'll take it." uses "I'll"; 6-6 "What do they know that we don't?" pretends not to know; 4-5 "Yours is on loan." is untrue (the boat was taken); 2-3 "It opened for you." repeats the day's own line three times in one evening; jokes on the quiet days 1-4 and 3-2.
- Week 5 Day 6: "Her hand drops." assumes the lookout friend is a woman.
- Gathering 3: "There is no fight left in it, and no roll." is game talk inside the story.
- The United Effort stories file: "she/her" for whichever friend is named (4 lines); the finale's bands still on the old 60 scale; one job short of its three between-turn lines; five places where it tells a scene differently from the episode file (one contradicts a clue: the tunnel dug "in two nights" against "a night and a day"). The game plays the episode text; the file should match it.
- Gathering 4: the Might notice says the faithful "stood until the last of them fell", but the last one surrendered.
- Week 1 Day 3: the narrator calls him "Garrick" though no line has named him yet (Day 2 leaves him unnamed on purpose).
- Week 2 Day 3: "the housings your own fragments came out of": no earlier fragment came from a carved housing.
- The Deception Table puts "That went about as well as it looked." on Week 2 Day 5; the episode has it on Day 4.
- Four of Garrick's story lines have no Deception Table row, so they are missing from Garrick's Recap: "Three more." (Gathering 1), "I know what that page says." (Gathering 2), "One stayed close. It always did." and "Your Seekers made their children the only key… You were the key." (Gathering 6).
- Three Fan Out leads are set at the wrong hour (5-2-3 "at first light", 6-5-2 "by daylight", 5-1-3 "at midday"; Fan Out is at last light).

## Questions for Fake Guru inside the files

- Week 5's day summary cards have "On a failure: … Someone at the fire may have seen it."; Week 6's have none. On purpose?
- Week 2 Day 3: was a carved housing at every fragment site meant?
- "A locked Seeker Fragment": the glossary says fragments are solved, not unlocked (about 12 lines).
- The Mythios intro and the series card: two light touches and one hook line (file 9, 1d).

## How approved changes are applied

Episode files first, then the generators (`scripts/gen-chapter-scripts.cjs`, `gen-gathering-scripts.cjs`, `gen-garrick-recap.cjs`), then the online loaders (`gen-chapters-sql.ts`, `gen-gathering-sql.ts`, `gen-campfire-sql.ts`) and a new migration for each. Campfire changes go in `campfire-days-v23.json`, `campfireDaysData.ts`, `mythios-campfire-table-v2.md` and `campfire-build-bundle.md` together. Garrick's chat lines in `garrickRouter.ts` (then `scripts/sync-garrick-function.cjs` and a redeploy) and `garrick-stored-lines.md`.
