# Words that break the game's rules: the list for Fake Guru (24 Oct 2026)

Phase 0, step 5 of the make-it-great plan. Each line below breaks a rule you set: words a player sees before the story
reaches them, story names offered as the player's own, a count of four in a party of any size, out-of-game talk,
American spelling, or brackets in prose. **Decided 24 Oct** (Fake Guru: "use your judgement and proceed accordingly"): rows 1 to 16 and 18 as suggested
(migration `0116`, the data files, the canon copies, the play-through regenerated); **row 17 was first kept, wrongly** (canon has her killed on the road the night she left, so she could not pass
through Fenmark after; fixed in Phase 1 as "before the frosts", `docs/design/phase1-continuity-24oct.md` row 7); rows
19 to 21 take option (a): 19 in `0116`, 20 and 21 in the pieces that follow (see the handoff ledger).

Also waiting at the end: three game decisions from steps 3 and 4.

## A. Session Zero: the suggestions shown under each answer (`src/online/SessionZero.tsx`)

| # | Now | Why it breaks a rule | Suggested |
|---|---|---|---|
| 1 | Character name chips: **Kael**, Ren, Vael, Bran, Sira, **Rowan** | Kael and Rowan are cut lore (CLAUDE.md §8: "Oakhaven, Rowan, Kael … all cut") | Ren, Vael, Bran, Sira, **Edda**, **Tobin** (in no canon file) |
| 2 | Birthplace chips: Ashcombe, **Fenmark**, **Highwall**, **The Reeds**, Oldford | Fenmark is Week 1's village, Ashcombe a Week 3 and 4 place, The Reeds a canon place, and Highwall may not be said before Week 5 Day 1. A player born in the story's places breaks it. | Oldford, **Thornby**, **Brackwater**, **Kettlecross** (in no canon file; a name, because the line on Meira's list reads "Beside yours, in the same neat hand: …") |
| 3 | Grandparent chips: **Grandmother Meira**, **Grandfather Corin**, **A carved horse**, An iron signet | Meira is the woman whose list starts the story; Corin is a canon character (in 17 files); the carved horse is the object Week 1 Day 5 turns on | **Grandmother Wenna**, **Grandfather Aldric**, **A bone-handled knife**, An iron signet (none in canon) |
| 4 | The box's example text: "e.g. Grandmother Meira, a carved horse..." | the same | "e.g. Grandmother Wenna, an iron signet…" |

## B. At the fire: counting four (`src/data/campfireDaysData.ts`)

A party is two to six friends, and Garrick's lines must not count four (Campfire v2.3 §M).

| # | Where | Now | Suggested |
|---|---|---|---|
| 5 | W1D2, Garrick's opener | "Four strangers, four torn pages, and an empty chair upstairs. Pull up to the hearth." | "Strangers with torn pages in their hands, and an empty chair upstairs. Pull up to the hearth." |
| 6 | W2D4, tonight's question, reading A | "They have too many guards down there to fear four people." | "They have too many guards down there to fear a handful of strangers." |
| 7 | W2D4, Garrick's nudge | "…What matters more to them than four strangers at the lip?" | "…What matters more to them than a few strangers at the lip?" |

Note: 6 is word for word in canon's Campfire v2.3 (`campfire-days-v23.json`), so a yes changes the canon copy too.

## C. Out-of-game talk

| # | Where | Now | Suggested |
|---|---|---|---|
| 8 | W3D5, Garrick's opener at the fire | "For the first time all season, they ran. Sit down and breathe." ("season" is the app's word, not the world's) | "For the first time since this began, they ran. Sit down and breathe." |

Also word for word in canon's Campfire v2.3.

## D. American spelling (the storybook voice says British)

| # | Where | Now | Suggested |
|---|---|---|---|
| 9 | W1D4, the boy at the well: "What this changed" and the road find (`scripts/gen-chapter-scripts.cjs`) | "recognized" (twice) | "recognised" |
| 10 | W2D3, Garrick's opener at the fire | "Stone doesn't have favorites without a reason." | "favourites" |
| 11 | Fragment 5-1's meaning question (`fragmentMeaningQuestions.ts`) | "When did they realize…" | "realise" |

## E. Brackets in what a player reads

| # | Where | Now | Suggested |
|---|---|---|---|
| 12 | W1D4, "What this changed" | "You took the back lanes (Agility roll on the Challenge) and found grey wool on the shed nail." | "You took the back lanes, so the Challenge asks for Agility, and you found grey wool on the shed nail." |
| 13 | W1D4, "What this changed" | "You knocked next door (Charm roll on the Challenge) and saw the neighbour's barley pot." | "You knocked next door, so the Challenge asks for Charm, and you saw the neighbour's barley pot." |
| 14 | W1D5, "What this changed" | "…she trusted you at once (+1 Might Relic)." It also reads like "+1 Might", not a Relic | "…she trusted you at once, and pressed a Might Relic into your hand." |
| 15 | Week 6's fire places | "The wall room (Six nights)", "The barracks under the wall (Five nights)" … "The crack in the hill (One night)" | "The wall room, six nights left", … "The crack in the hill, one night left" |

## F. A name the Order already uses

| # | Where | Now | Why | Suggested |
|---|---|---|---|---|
| 16 | Season Title for most Gatherings attended (`mythiosRulesData.ts`, server `party_season_titles`) | **The Faithful** | "the faithful" is what the Order calls itself: the phrase is in the episode files 25 times ("Where the Seekers' children walk, the faithful follow."). At the finale a friend would be crowned with the cult's name. | **The Steadfast** |

## G. Story facts in the Week 1 rewrite (19 to 23 Oct; waiting with your approval of that text)

| # | Where | Now | Canon | Suggested |
|---|---|---|---|---|
| 17 | W1D4, the boy at the well | "…came through Fenmark two weeks back" (and "two weeks ago" in "What this changed") | Meira has been missing **three weeks** (episode 1: "Hasn't been back in three weeks.") | "three weeks back" / "three weeks ago" |
| 18 | W1D2, Garrick | "Nobody's asked for you… Only the woman who left them." | Not in the Deception Table; it suggests Meira left the list, when in canon a man put it in your box | Remove the line, or you write its truth into the Deception Table first |

## H. Game decisions from steps 3 and 4

| # | What | The problem | Options (my pick first) |
|---|---|---|---|
| 19 | **Never Enough** badge: "Clear 3 [PRESS ON] rolls in one week" | No week has more than two [PRESS ON] days, so nobody can earn it | **(a) Twice in one week** (possible in five weeks); (b) five in the season; (c) keep as is |
| 20 | **Two friends and the fire's click** | A click needs two particular clues on the table. Two friends lay two of the night's three leads, so on some nights the pair is never laid and the click never comes | **(a) Late in the evening, Garrick lays the missing piece**, with a stored line such as: *"I came back the long way tonight, past the place none of you went. You'll want to see what was lying there."* (b) The board offers the third lead to the first friend who comes back to the fire. (c) Leave it |
| 21 | **Six friends and the United Effort** | The bars are 100 whatever the party size. In simulation, with six friends one never gets a roll in 6% to 29% of Gatherings (more often late in the season, when rolls pass more), and with five in 1% to 4% | **(a) Each bar 20 higher for every friend past four** (five: 120, six: 140); (b) the night does not end until every friend has rolled once (the last rolls only add to the margin); (c) leave it |
