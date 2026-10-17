# Claude's independent gameplay check: systems across the season (17 Oct)

The counts come from scripts run on the game's data, plus 4,000 simulated seasons per class (a daily player who always picks their higher Attribute).

## 1. The Challenge choice
- There are 29 Challenges, each offering 2 Attributes: Agility 12, Aim 11, Craft 10, Might 9, Intellect 8, Charm 8.
- A class's main Attribute is on the card only 8 to 12 times in 29. In 67 to 78% of Challenges you roll something else.
- In 52 to 58% of them both options are in the same tier, so **the pick doesn't change the odds**, only which Attribute grows. Nothing on the card shows that.
- **The two options never lead to different text.**

## 2. Notice lines
- There are 216 lines (36 days × 6 Attributes). 206 have a second sentence, which **usually holds the conclusion**.
- That sentence shows only from 51 (Adept). Daily players see it 0% of the time in Weeks 1 and 2, 20 to 40% in Week 4, and 78 to 89% in Week 6.
- Most lines are real, different facts that bear on that night's question. W4D1's six lines are six separate clues to "He had help in the room / He didn't need any".
- **No friend's Notice line is ever shown to anyone else**, at the fire, in the chat or at the Gathering.
- Class identity drifts. A Warrior's Notice is Might only 33% of the time, an Assassin's Agility 28%; Artificers stay on Craft 74%.

## 3. The Campfire online
- The steps: the last light, then arriving, your find, the board, the fragment, tonight's question, the case so far, the riddle, an open question, a message in a bottle.
- From 2 to about 12 taps a night.
- The first friend to arrive sees only their own clue and no pins. The last often finds the riddle already solved.
- `fire_pins` and `fire_notes` are stored, but **nothing reads them after that night** except Day 6's 2 pins and the week line. The Gathering, Garrick and the summary never use them.
- **Being right about a theory never matters.**

## 4. The economy
- A daily player earns about 20,900g. Both gear tracks to Level 5 cost 12,400g, reached by about Week 4, so after that gold is idle.
- Buying the next gear step always wins, so shopping is never a decision.
- **Relics:**
  - On a Challenge, +4 flips 20% of rolls, worth about 130g on average against a price of 150g.
  - On [PRESS ON], about 40g against 150g.
  - [NOT NOW] lets you buy after seeing the card.
- **Giving a Relic matters in one place: the United Effort.** At a 55% pass rate it is lost 38% of the time. Gathering 5 rolls Charm against DC 9, and losing it makes Week 6 Day 1 harder.

## 5. Growth
- Classes reach Apprentice around Weeks 2 to 3, and main Attributes end the season at 44 to 59.
- Beyond the odds, a Warrior's season differs from a Sage's only in which cards suit them, the Notice line (which drifts), one United Effort week and two Approach options.

## 6. What carries over
- **Between weeks, only 2 story carries, both United Effort losses** (G3 → W4D1 text; G5 → W6D1 +2).
- About 5 systemic carries: the map +2, the Approach rotation, gold, gear and Attributes, growth that favours a returning player, and a day that closes itself.
- **No weekday choice or result ever reaches a later day.**

## 7. The fragments and maps
- 72 lock words, 5.5 letters on average; 44 are 4 to 5 letters, so easy. Some repeat ("fifth" 3 times).
- A friend may solve only one word on its day.
- The last-light first letter adds little.
- Solving earns 25g a word, the map +2, the meaning pin and Match.

## 8. Missed days and playing at different times
- A missed day loses about 285g of expected gold plus that day's lead and clue.
- The friend keeps every other part of the game, and the Approach rotation favours them at the Gathering.

## The best five changes for the cost
1. "Share what you noticed" at the fire, posting your stored line onto the board.
2. Show the second Notice sentence from 26 (Apprentice), and show "3 points to Apprentice" on Challenge options.
3. Read each friend's week line back at the Gathering's opening, and at Gathering 6 say who held which reading.
4. Let United Effort losses at Gatherings 1, 2 and 4 carry too (the existing `harderIf`), and announce "Tonight calls on X" from Day 5 so friends plan and give Relics.
5. A last-light pass reveals the clue of a lead nobody took.
