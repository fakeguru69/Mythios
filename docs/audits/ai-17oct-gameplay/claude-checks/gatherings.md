# Claude's independent gameplay check: the six Gatherings, live (17 Oct)

Timings come from the server code (`0032_gatherings.sql`), simulations of the United Effort (200,000 runs), and the numbers pass for the Battle.

## Facts
- **Pacing:** a passage stays up for its characters ÷ 25 seconds, at least 5 and at most 20 (`g_pace`, line 171), then the next one follows by itself.
  - [GO ON] from any friend skips the passage for everyone.
  - Every phone scrolls to the bottom whenever something new arrives.
  - A button step waits with no time limit, except WHY WOULD YOURS WORK?, which gives up after 30 seconds.
- **Text is shown faster than people read it.** The prose needs 1.25 to 1.6 times as long as it stays up, and 4 to 10 passages a night are cut more than 5 seconds short. Several passages are over canon's 120-word limit: G1 182 and 169 words, G2 217, 203 and 183, G4 217, G5 251.
- **The length of a night,** with fast taps and no extra talk:

  | Gathering | Minutes |
  |---|---|
  | G1 | about 9 |
  | G2 | about 16 |
  | G3 | about 14 |
  | G4 | about 15 |
  | G5 | about 13 |
  | G6 | about 17 |

  With real taps and waits: G1 about 12 to 15, the others 16 to 23. Party size barely changes it. **As built, the 20 to 30 minute target is reached only with slack.**
- **The United Effort takes about 8 rolls** whatever the party size. With 6 friends each rolls about 1.3 times; with 2, about 4. In Gathering 1 with two friends, the friend in the drop never rolls, so the other makes all 8 rolls.
- **The Battle needs no input** apart from using or giving a Combat Relic. It runs about 6 to 8 rounds, and the party wins 96 to 100% of the time.
- **The question to the table:** the first friend to type closes it.
- **Ask:** one question per friend (two in a party of two).
- **Gaps between the build and canon:**
  1. The vote doesn't show the Attribute or the party's strongest friend in it, though canon requires both.
  2. The vote changes no text, only which Attribute is rolled.
  3. Gathering 4's Ask board shows the questions about the pen and the torn page before either is found.
  4. **There is no chat on the Gathering screen.** A friend who leaves for more than 30 seconds stops counting as there. Gathering 6's "Tell them what to do" has nowhere to happen.
- **What the weekdays bring to the Gathering:** the map +2 on one roll (about +10 points), Relics, gear, Attribute odds and Notice lines. The weekdays change the night's odds a little and its story not at all.
- **What the Gathering carries forward:** a lost United Effort changes Week 4 Day 1 (after G3) or makes Week 6 Day 1 harder (after G5). A loss at G4 removes the Ask board; a loss at G5 removes the second Match and [LOOK CLOSER].

## Who sits idle
A 6-friend party goes about 5 to 6 minutes, from the Battle to the end of the United Effort, with one roll each.

## Play score out of 10
| Gathering | Score | Best moment | The most valuable change |
|---|---|---|---|
| G1 | 5 | "four names" on the wall | With two friends, let the hauled friend roll too |
| G2 | 6 | TELL HIM YOUR NAME, then "You're marked too" | Hold each Verse page until [READ ON] |
| G3 | 7 | "Therefore the faithful shall not lie", then THEN WHY ARE WE STILL ALIVE? | Let friends ask in turns up to a fixed count |
| G4 | 6.5 | "My grandmother taught me that name" | Add the pen and torn-page questions only once those are found |
| G5 | 6.5 | OPEN YOUR PALM, then "Nothing." | Pace the 251-word verse by [READ ON] |
| G6 | 8 | The act: thirty seconds of advice, then "Say a name" | A quick-reply box for the advice |

## Judgement
- The structure suits a live night. G3 and G6 are genuinely good.
- But as built it plays like **a fast audiobook with a few buttons**. The fixes:
  - pace text for reading time;
  - make [GO ON] need a majority, or move only your own phone on;
  - stop the auto-scroll when a friend has scrolled up;
  - add a chat strip on the screen;
  - show each option's Attribute and best friend on the vote;
  - give each friend one Battle choice;
  - cap United Effort turns per friend;
  - let every friend answer the table's question.
