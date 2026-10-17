# What makes our gameplay work: criteria, and how the game measures up (17 Oct)

Fake Guru asked (17 Oct): what makes the gameplay work, is this more game than story, should story sit between the game, and do the mechanics and the pacing achieve it? The numbers below come from `docs/playthrough/gameplay-rhythm.md` (`scripts/gen-gameplay-rhythm.ts`), measured from the data the game plays.

## 1. What kind of game this is

Tales of the Dark Moon is **a mystery told in daily chapters, solved together**. Its closest relatives are:
- *Fallen London* and *80 Days*: short daily or story sessions with light choices and stats;
- Telltale's games: a story first, with choices that colour it;
- a book club or murder-mystery party: friends piece it together between sessions.

D&D is a distant cousin. There is no game master improvising, so the players cannot do anything they think of. Their freedom lives in **what they notice, what they think, and what they say to each other**.

So the right question is not "is it more game than story?" The question is **whether every press of a button earns its place**.

## 2. The criteria (what good gameplay means for us)

The full rubric, with what each criterion means here, the questions to ask, signs it works or fails, and where to look, is in `docs/playthrough/gameplay-audit-prompt.md`. In short:

**A. Agency: what the player decides**
1. **Decisions that matter.** A choice changes the scene, what you learn, what it costs, or what friends see: the *how*, since every branch reaches the same plot.
2. **Real stakes.** Uncertain moments risk something you care about (a clue, position, the Gathering), not only gold. Gear barely matters, since weekday fights are won 95 to 99% of the time.

**B. The mystery: what the player thinks**
3. **The mystery is the game.** Form theories, test them, be shown right or wrong; attention pays.
4. **Puzzles that feel good.** Fragments, maps and riddles: neither trivial nor obscure, and each solve tells you about the world.

**C. Together: what the friends do for each other**
5. **Friends need each other.** Each holds something the others don't (a detail, a Relic, a theory), with reasons to share, give and plan.
6. **Asynchronous play works.** The first and the last friend at the fire both feel part of the same evening.

**D. Pace and shape: how it flows**
7. **Rhythm between reading and doing.** Long reads where the story earns them, quick beats for tension, room to breathe at big turns.
8. **Variety without confusion.** Days and weeks feel different, and the rules stay easy to follow.
9. **The week builds to the Gathering, and the season to the finale.** Weekdays change how the Gathering plays, not only what it means.

**E. Fiction and feel: how the rules sit in the story**
10. **The rules tell the story.** A mechanic is the fiction, not machinery. The Seeker maps are the model.
11. **Clear feedback.** You always know what happened, why, and what it cost.
12. **Growth that feels like your character.** Stronger, and more yours; a Warrior's day feels different from a Sage's.

**F. Habit: why you come back**
13. **A reason to come back tomorrow.** Each day ends on a pull, never a chore.
14. **Easy to come back to after a missed day.** A missed day costs a little, never everything.

## 3. What the numbers show

**A weekday chapter:**
- On average, 577 words of story (about 3 minutes of reading), broken by 6.5 taps.
- The longest stretch of reading before a tap runs from about 85 words (Week 6 Day 4) to 409 (Week 3 Day 2).
- **It is not "point to point with no story".** It is mostly story, with long reads between taps.
- **The problem is what the taps are:**
  - Most are "go on" buttons.
  - Across 36 days there are only 9 real choices, and 8 choices where every option leads to the same text.
  - The one real decision each day is which Attribute to roll with. Players will nearly always pick their best.

**Rolls that rarely change the story:**
- A failed Challenge loses information on only 11 of 29 days, and nothing carries into the next day.
- The 12 fights are won almost every time, and 6 of the first 7 end the same way: a silent man runs off.
- So the dice mostly move gold, and gold mostly buys gear the fights barely need.

**The evening:**
- This is where the thinking happens: the last light, the fragment puzzle, and the fire with five or six things to tap or write.
- The weekday is shaped like this: **story, then game, then talk**. The game is not woven through the story.

**The Gathering:**
- It holds the most real play: group votes, a shared United Effort, Matches that reward attention, the Ask board, a question to the table.
- It is also the longest reading: 880 to 2,230 words. Gatherings 2 and 6 run about 10 minutes of reading before any talk or play.

## 4. Each mechanic against the criteria

| Mechanic | What works | What doesn't |
|---|---|---|
| **Seeker Fragments and the maps** | The best piece. A real puzzle that builds over the week. Solving it is the twist (it shows the Order the way). It rewards attention at the Match. | It happens in the Bag, apart from the chapter. Nothing in the day's scene asks for it. |
| **The Challenge** | Clear, fair odds, and it grows your character. | The choice is nearly always "my best skill". A fail usually costs only gold and a little comfort, and it is forgotten tomorrow. |
| **Fights** | The fights are short and readable, and each is planted for a later payoff. | Won 95–99% of the time, with no choice inside them, and the result rarely matters. The same escape repeats. |
| **[PRESS ON]** | Push-your-luck is a good shape. | It is safe (a fail costs nothing), and what you win is seen by nobody else. |
| **Notice lines** | Each friend sees a different detail for their best skill. That is uneven information, the strongest social spark we have. | Nothing asks friends to pool them, so they stay private texture. |
| **Choices** | The 9 real ones (who strikes first, which way) are good. | The 8 flavour choices break Core Rules' own "each Choice must change something". |
| **Relics, and giving them** | Generosity between friends, with a real (+4) effect. | It is rarely needed. It works as a gift, not a plan. |
| **The last light** | A small extra roll that feeds the fragment puzzle. | Another roll with little at stake. |
| **The Campfire** | Pinning theories and seeing friends' pins is the mystery game at its best. | Too many forms. The question often doesn't match its pins. Pins are never paid back (being right changes nothing), and the clue-sharing online isn't built. |
| **The United Effort** | Truly shared: turns, two bars, story lines that change as the bars fall, a felt win or loss that sometimes carries on. | Each turn is still just a roll; the only decision is when to spend a Relic. |
| **The Battle** | Lockstep rounds, help-calls and reinforcements make it social. | It is tapping, with little to decide, and no story while it runs. |
| **Match, Ask, the table question** | Match rewards attention. Ask lets players choose what they learn. The table question starts real talk. | Ask boards can be long, and two Matches a night can feel like a quiz. |
| **Gathering 6's choices** | Real group decisions with weight: the fifth, the act. | The act ends the same whichever is chosen, and the vote's labels promise more than happens. |

## 5. Is it more game than story? Should story sit between the game?

**It is more story than game, and that is right for this audience.** Friends sign up for a mystery to share, not a puzzle to grind. The fix is not more story between buttons. **Each button should carry story weight:**

- **Fewer, heavier taps.** Every button should be a decision, a reveal, or a dramatic beat. A plain "go on" fits only where a pause helps: before a reveal, after a death.
- **Rolls that change the story, not just the gold.** On a fail, show a different scene, lose a clue, or leave a mark that turns up the next day or at the Gathering.
- **Uneven information as the core.** What each friend notices, wins or presses into should feed the fire, so the evening becomes "I saw something you didn't". The Notice lines and [PRESS ON] details already exist; the board just has to carry them.
- **Theories that pay.** A pinned theory that proves right should be acknowledged at the Gathering: Garrick's nod, a Match bonus, a line in the summary.
- **The game woven into the scene.** The fragment moment could ask for a word in the chapter itself. A Challenge's Attribute could choose how you learn something (different detail), not just whether you pass.
- **Breathing room at the big turns.** Canon's quiet minute, a held line, a scene with no button.

## 6. What only playing can tell us

- Does the day feel long or short?
- Do friends actually talk at the fire?
- Does the Gathering fit in 30 minutes?
- Is tapping through a fight boring or tense?

A small real playtest (three or four friends, Week 1 and Gathering 1) would answer these. An outside AI can judge the design on paper, and the prompt in `docs/playthrough/gameplay-audit-prompt.md` asks it to.
