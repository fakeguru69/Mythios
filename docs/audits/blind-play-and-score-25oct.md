# Blind play-and-score audit, 25 Oct 2026: three blind reviewers, Claude's own play test, and the earlier reports compared

Fake Guru asked (25 Oct): "Do your own play facing testing audit, using agents who doesn't know the secrets and compare notes with other audits."

**This file holds the secret in places. Never publish it.**

## How it was done

**Blind reviewers.** An agent started inside this project is handed `CLAUDE.md`, which holds the secret. This was tested: a fresh agent quoted it. So the reviewers ran in three fresh cloud sessions, each on a temporary branch that held only:
- the player-facing week files;
- the rules and the glossary;
- the style guide, with every line that hints at deception cut out;
- the rhythm file;
- the finale file, in a folder opened only after Week 6.

There was no `CLAUDE.md` and no canon.

| Reviewer | Weeks scored | Context read first | Session |
|---|---|---|---|
| A | 1 and 2 | — | `session_01UkNdAUPSfHTk2UZL9QnP2g` |
| B | 3 and 4 | Weeks 1 and 2, in full | `session_01Q3cMZoAXf1pAhJcvmK57rF` |
| C | 5 and 6, then the finale and F1–F6 | Weeks 1 to 4 | `session_01S3Q9b7VcapQmiWKedyaua8` |

Each read its files to the end; none was cut short. Their full reports are the final messages of those sessions.

One leak: the style guide still said Garrick is likeable "until the reveal", which Reviewer A flagged. None of the three named the secret before Week 6. For the next blind run, cut that line too.

**Claude's own play test.** Two new players, Ana (a Sage) and Ben (a Warrior), played the real online screens on the local copy of the server, at phone size (390 × 844). The run covered:
- the cover and sign-in;
- starting a party and the invite link;
- Session Zero for both players;
- starting the story;
- Week 1 Day 1, the fight, the Challenge, the last light and the fire, alone;
- Week 1 Day 3 for both, then the fire together, with pins split, a piece left unanswered, and Garrick's new lines.

**The earlier reports.** Two read-mode reports came earlier the same day (`play-and-score-2026-10-25-weeks-1-2.md`, `play-and-score-2026-10-25-partial.md`). Earlier audits are listed in `docs/audits/`.

## The scores (blind reviewers)

| Week | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Gathering |
|---|---|---|---|---|---|---|---|
| 1 | 5 | 7 | 6.5 | 6 | 6.5 | 6 | 6.5 |
| 2 | 5.5 | 6.5 | 7 | 6.5 | 6.5 | 6 | 7.5 |
| 3 | 6 | 7 | 6 | 6 | 7 | 6 | 8 |
| 4 | 7 | 6 | 7 | 6 | 7 | 7 | 7 |
| 5 | 5.5 | 6.5 | 6.5 | 6 | 6.5 | 7 | 7.5 |
| 6 | 5.5 | 6 | 6.5 | 5.5 | 7 | 7 | 7.5 |

**Season (Reviewer C):**

| Code | Criterion | Score |
|---|---|---|
| F1 | Arc | 8 |
| F2 | Is the secret fair? | 9 (about 22 catchable clues) |
| F3 | Daily habit | 6 |
| F4 | Talk outside the game | 8 |
| F5 | Two friends as well as six | 5 |
| F6 | Still "what's next" buttons? | 5 |

**Averages:** weekdays about 6.3, Gatherings about 7.3. The prose scores 7 to 9 everywhere.

## Where every report agrees

The three blind reviewers, the two earlier reports and Claude's own reading of the rhythm all agree on these points.

1. **The writing and the mystery are the strength.** The secret is fair. The extra cup's payoff ("It was always for him.") is the season's best.
2. **The choices half work.** Roads that set the Attribute and cost a later card are clear and fair. But about fifteen forks still lead both ways to the same line:
   - W1D1;
   - two at W1D2, two at W1D6;
   - three at W2D1;
   - W2D6;
   - two at W3D1, one at W3D3, one at W3D6;
   - W5D1, W6D1, W6D4.

   Day 6's "read it out, or let a friend read it" is overheard either way, every week.
3. **"One breath" carries no weight.** All four reviewers who saw it proposed the same fix:
   - each other friend taps an advice chip, and the chosen friend sees the counts;
   - each option gets a small mechanical edge in the United Effort.
4. **The fire's call never pays off.** It is read back at the Gathering, but nothing in the story answers it.
5. **The fire's clicks** (two pieces that together show something new):
   - they only ever join two last-light leads, never a road find, so the two fixes never meet;
   - several nights have none: W1D4, W2D4, W3D2, W4D3, W4D6, W5D4, W6D2;
   - a click often states the answer, which ends the argument;
   - with two friends the right pair turns up only about one night in four.
6. **Two questions a night.** The pinned question and an italic sub-question, and the click often answers the sub-question.
7. **The week's choices hardly reach the Gathering.** G7, payoff of the week, scores 3 to 5 throughout.
8. **The finale** lets the party solve the secret but not act on it:
   - GIVE IT TO HIM and CLOSE YOUR HAND end the same way;
   - "Nobody says aloud that you could leave it behind" closes off a choice.
9. **Long reads** at the ends of days, the same list everywhere: W4D1, W1D5, W3D1, W4D5, W1D3.
10. **Dominant or habitual roads:**
    - W4D1's Wren road gives an Aim Relic on an Aim card;
    - the patient road keeps paying a Relic (W1D5, W2D1).

**Where they differ.** The earlier read-mode report scored the prose a little higher and the Gatherings lower. It had read only six days, and took "One breath" for a bug. The blind reviewers read every day and scored more evenly.

## Claude's play test: what the real screens showed

**Fixed in this piece (live and on GitHub):**

| Slip | Fix |
|---|---|
| The first-step card said "Your character comes first" and then "Your own character comes first." | The second line now reads "Choose who you will be on the road, before your friends arrive." |
| Session Zero promised "+20" and "+15", but the card shows 14 and 12, which is what Core Rules says. | The labels now say 14 and 12, and "affinity" became "strength". |
| "What was a grandparent's name?" offered "A bone-handled knife" and "An iron signet". | Names only now. |
| The character card's label was "YOUR HERO COLLECTOR CARD". | Now "SESSION ZERO · DONE". |
| The day summary card began in lower case ("nothing was taken."). | Each line starts with a capital. |
| "The party earned the The Whole Table badge", and the same for "A Whole Week", "The Long Road", "A Clean Night". | Fixed (`0131`). |
| "Gave Ben a Aim Relic". | "an Aim" (`0131`). |
| Garrick's nudge showed twice at the fire, once without a name and once with ("Ana, he ran…"). | Shown once. |
| Garrick's split-fire lines appeared above the pins that caused them. | They now come after the last pin. |
| The unanswered-piece line read "a while: The second ring." | Now "the second ring". |

**Seen, and fine:**
- the cover;
- the invite page and letting a friend in;
- the story arriving at reading speed;
- the first fight's card, which is dense but clear;
- the 300g tutorial fight, which Core Rules §12 confirms;
- the last light and the first-letter hint;
- Garrick's split line and his unanswered-piece line, both triggered by real play.

The quiet-friend line was not triggered: both friends had laid a piece.

**Seen, and for Fake Guru:**
- **Two taps to start.** The cover's "Start a party" leads, after sign-in, to the series page and a second START A PARTY. The same happens to a friend with an invite: JOIN, sign in, then JOIN again.
- **The notifications card** is one very long sentence.
- **A noisy first shared fire.** In a party of two, nine crown and badge notices fill the stream ("Ana took the crown for Days Played", and so on).
- **A covered line.** The floating "↓ The fire" button covers a line of the day summary.
- **Recaps assume more than one other friend.** For example: "the rest of the list was waiting, each of them holding a torn page" when there is one. The recaps have no two-friend versions. This is approved story text, so it needs his word.
- **A doubled heading.** "The last light · the list, by the last light" says "last light" twice.

## Fixed from the blind reports in this piece

**Read-through files:**
- they now say "an Aim", "an Intellect" and "an Agility";
- a failed [PRESS ON] now loses the pass piece online;
- the United Effort bars now read 120 for five friends and 140 for six;
- "Armour".

**The builder's own fork text:**
- 57 dash asides made into sentences;
- "a third chip of black glass", not "shaved wood";
- "standing soldiers", not "standing stones";
- "practised";
- the W5D4 Relic line no longer explains itself;
- "stepped clear of the cart".

**The rulebook caught up with decisions already approved:**
- roads and failed rolls that make a later card harder;
- which lost United Efforts carry over: Gatherings 1, 2, 4 and 5 make a card two harder, Gathering 3 changes the next day's opening.

**Checked and not a bug:**
- "He strikes first" at the Battle (each friend fights their own enemy);
- the Match card's source line (it shows only after the pick);
- the gate words in Weeks 1 and 2 (Fake Guru's exceptions of 15 Oct).

## Story slips the reviewers found, for Fake Guru's word (approved text, not changed)

1. **W1D5:** "Show her your empty hands", then "the carved horse in your other hand".
2. **W1D6:** the ford is rising, yet the fragment lies where you would see it only "in a low year".
3. **W1D3:** the charcoal was pressed "not many days ago", but Meira has been gone three weeks.
4. **Gathering 2:** the scene is on the hillside and in the room at once. Also "like a win", which is modern.
5. **W2D1:** two days' walk inside one day. The cart's timeline against "The mill boy *next*".
6. **Week 5:** the countdown is one night off (W5D5, W5D6, Gathering 5).
7. **W5D4:** "light no fire", then a Campfire with firelight.
8. **W6D6:** the click says "its back to you"; Gathering 6 says every face turns toward you.
9. **Gathering 6:** linen "at every wrist" (it was on palms).
10. **The W5D1 recap** says "Meira is dead" before Gathering 6.
11. **Gathering 4:** "This was never about you." repeats Gathering 1's line with the opposite meaning. Suggested: "You were never the quarry. You were the key."
12. **The dark moon becomes an eclipse** in Weeks 5 and 6 without one plain line saying so.
13. **Garrick's fire lines, by game day.** "On Day 2 a horn button" uses game words; suggested: "At the mill a horn button, on the river path a dead stranger". The W3D3 and W4D2 openers are flat. These are Garrick lines, so they need approval.
14. **Unpaid threads:**
    - the line cut away under HIGHWALL;
    - the new grave;
    - the chalk stroke;
    - the soldier facing out;
    - who the sky-watchers counted for.

## The decisions this leaves for Fake Guru, in Claude's order

1. **"One breath" with weight.** Advice chips for the other friends, plus a small edge for each option in the United Effort. This needs numbers, which are his.
2. **The fire's clicks** join a road find to a lead, and there is a click every night. This is story content, a week at a time.
3. **One question a night at the fire** (drop the italic sub-question).
4. **Arm or cut the flavour forks.** Start with Day 6's read-aloud, which could become read aloud or pass it hand to hand in silence.
5. **The fire's call and the week's roads reach the Gathering:** two to four lines each night.
6. **The finale's agency.** For example [TAKE THE FIFTH] or [HIDE IT IN THE WALL ROOM], or a Week 6 pin that names Garrick, read back in the hall. This is the biggest story decision.
7. **The continuity list above.** Claude would draft the fixes for him to read.
8. **Two-friend versions of the recaps.**
9. **Small screen fixes:**
   - one tap from the cover to a party;
   - fewer crown notices in Week 1;
   - the floating button not covering text.
