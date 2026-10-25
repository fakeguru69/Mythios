# Week 1 pilot audit, 25 Oct 2026: what it found and what was done

An outside AI ran `docs/playthrough/week-1-audit-prompt.md` on `season-week-1.md` alone, without the repository, so it met the story blind. Fake Guru pasted its report. The paste stopped in section 3, item 6, so its list of twelve slips was not seen. Every claim that was seen was checked against the game's files.

**Its verdict:** Week 1 is strong, with Story 9 every day. Four of the six pilot changes work and should go to Weeks 2 to 6. Two half work: the road pairs are uneven, and One breath's edges were invisible and unbalanced.

**Scores (Story / Choices / Fire / Pacing):**

| Day | Story | Choices | Fire | Pacing |
|---|---|---|---|---|
| D1 | 9 | 6 | 7 | 8 |
| D2 | 9 | 5 | 8 | 7 |
| D3 | 9 | 9 | 9 | 9 |
| D4 | 9 | 7 | 7 | 8 |
| D5 | 9 | 9 | 8 | 8 |
| D6 | 9 | 7 | 8 | 8 |
| G1 | 9 | 8 | — | 9 |

## Fixed (live with migration `0135` and the regenerated Week 1)

| Finding | Verdict | Done |
|---|---|---|
| Day 4 pair "Men who want the easiest child do not walk past three" answers the night's question for the party | Real | Now "…to reach hers. Why walk past three to take the fourth?" |
| Day 6 pair "They laid that trail for whoever came after" tells | Real | Now "Why send an empty cart up the far bank at a run?" |
| Day 6 courier pair joins tonight's courier to the cart of days ago as if they were one moment | Real | Rewritten in time order: "Days ago a cart… Tonight a man by the chimney… Is someone still minding which way you go?" |
| Day 5 pair, and Garrick's Intellect nudge, assume the kitchen knife, which is seen only by a friend who won the fight | Real | The pair now asks "Was it the same blade both times?" The nudge: "she knows him by his knife and nothing else. Is that enough to know a man by?" |
| Day 4 Charm pass still narrates following the footprints | Real | The pass now opens "Everything you have found leads to the grain store at the end of the lane. You do not go straight at it." |
| Gathering 1: Tamsin hums "all the way out into the air", then the party is back in the gallery | Real | She hums "all the way back to the mine mouth, where the air comes in off the river"; "Out there the evening is cold and very wide." |
| The courier's horse stands "in the shadow of the mouth", while the Aim Notice puts the horse on the far bank | Real | Now "across the water from the mine mouth" |
| THE NEW PROP's passage reads as a trap | Half: the groan is a story cost, kept | "Dev gets one elbow over it, then the other, and the timber holds." The groan stays. |
| One breath edges invisible | Real in the read-through. The screen showed them only on the roll line. | The read-through prints them. The United Effort card now says the edge for all three picks. |
| One breath unbalanced | Real: GO OUT NOW (+2 on one roll) was worth about 4 points of a bar; THE NEW PROP 10; STAY about 2 a friend | GO OUT NOW is now +4 (about 8 points), so each pick wins in some party size. |
| Road pairs uneven | Half | Pairs were added for Day 4's SAY NOTHING (the stool and the covered cup), Day 5's TELL HER (the root-cellar stone and the older marks), and Day 6's READ IT OUT (the pin-hole and the cart). Day 1's fire is a told night with no table, so it can make no pairs (pairs written for it were taken out). Day 2's roads stay without pairs on purpose. |

## Kept, with the reason

- **Day 2's three conversation choices give the same Garrick reply.** By design: each road gives its own find about how he answered, and his words do not change. Joining those finds to a lead would point at him too early.
- **Day 6's ASK WHO IT IS FOR and LOOK AT THE EXTRA CUP give the same line,** for the same reason. The two finds differ.
- **Day 1's choice shows both things in a different order.** Noted for the Week 1 play-test. It is a quiet first choice before the party exists.
- **Day 3 has no [PRESS ON].** That is canon.

## Second pass: the full report, with its twelve slips (25 Oct)

Fake Guru then pasted the whole report. Slips 3, 5, 8, 11 and 12 were already fixed above. Slip 8 was fixed by making the fire not depend on the knife, which keeps the knife as a reward for winning the fight. The rest:

| # | Slip | Verdict | Done |
|---|---|---|---|
| 1 | Day 2: two pages both "folded small" | Not a contradiction: each friend folded their own page. | Kept |
| 2 | Days 2 and 6: Garrick pours a second extra cup at the fire, just after pouring one at the table | Real | The fire's line now looks at the cup already standing |
| 4 | Day 4: "Then he stops" after SAY NOTHING, when the boy has not spoken | Real | "For a while there is only the gate knocking on its post." |
| 6 | Day 5: "her eyes go past you to the carved horse at your belt", and then she takes a horse you never gave her | Real; the line was mine, from Phase 2 | "her eyes drop to the little carved horse showing at the mouth of your coat pocket, and stop. You draw it out and hold it toward her." |
| 7 | Day 5: a failed last light ends "until full dark", on a night that is already dark | Real; the same happens on W6D3 | Days whose last light is after dark (W1D5, W2D5, W6D3) skip the two lines about the light going |
| 9 | Day 6: the cup "he has set one every night since the Hollow Wake", but he did not | Real | "just as he set one at the Hollow Wake" |
| 10 | Day 6: the courier pays his bill twice for one road, and is "a courier" to the other road | Real | The find stops at the mug; the shared line is "a man in a riding-cloak, who came in for a bed, settles his bill" |
| — | Party of two: three lines name two friends | Already handled: `smallPartyLines.ts` has a short version of each, and the check passes | Kept |
| — | One breath: make the edges visible before the choice | Agreed | Under the advice buttons: what each pick does |
| — | One breath: THE NEW PROP to +20 | Not taken. +10 absorbs about half a failed roll; GO OUT NOW's +4 is worth about 8; STAY is about 2 a friend. They are close at four friends. | Kept at +10, for the play-test |
| — | Day 2's three conversation choices give the same reply | Kept, as above | — |
