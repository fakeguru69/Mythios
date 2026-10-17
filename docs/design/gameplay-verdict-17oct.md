# The gameplay verdict (17 Oct): Claude's audit, with the four outside reports weighed

**Sources:**
- Four independent checks by Claude, run on the game's data and code without reading any earlier write-up or outside report (`docs/audits/ai-17oct-gameplay/claude-checks/`):
  - the weekdays of Weeks 1 to 3, and of Weeks 4 to 6;
  - the six Gatherings, timed from the server code;
  - the systems across the season.
- The four outside reports (Meta, Qwen, DeepSeek, ChatGPT), in the same folder.

## 1. How far to trust the outside reports

- **Meta** saw only Claude's own write-up, not the play-through, and says so.
- **Qwen** and **DeepSeek** mostly restate Claude's write-up, its numbers and phrases. Their agreement proves little.
- **ChatGPT** did the real work: a day-by-day table, with useful points. It also has factual errors:
  - "the first friend to tap" gets the finale's act: wrong, the server picks at random;
  - "a W1D6 fail may block the deduction": wrong;
  - it calls Match "Connect", an old word.
- **Several outside proposals break the game's rules:**
  - Meta: a help-call costs a Relic, [PRESS ON] failing reveals your Notice to everyone, a new "Mercy costs gold" ending;
  - Qwen: Relics required to pass Gathering challenges.
- **What they all got right, and the independent checks confirm:**
  - uneven information isn't shared;
  - failures don't travel;
  - theories are never paid back;
  - fights and choices are thin.

## 2. The diagnosis, in five findings

**1. The game's best design is built but has no outlet.**
- Each friend sees a different Notice line: 216 lines, mostly real clues on that night's question.
- Each friend takes a different last-light lead.
- A friend who passed sees what a friend who failed missed.
- **Yet no screen ever shows one friend's Notice or pass line to another.** The "Someone at the fire may have seen it" promise (10 days) works only in the demo.
- The second Notice sentence, which usually holds the conclusion, shows only from 51. Daily players see it 0% of the time in Weeks 1 and 2.
- This is the cheapest big win: the text already exists.

**2. Nothing travels.**
- No weekday choice or result ever reaches a later day.
- Across the season there are 2 story carries, both United Effort losses.
- Campfire pins and notes are stored, then never read again. Being right never matters.
- Week 6's failures describe new danger ("all of Highwall hears it", "two more men") that never touches a later roll.

**3. The Gathering plays like a fast audiobook with a few buttons.**
- Passages move on after at most 20 seconds; the prose needs 1.25 to 1.6 times that to read.
- Any friend's [GO ON] skips the passage for everyone.
- There is **no chat on the Gathering screen**, though canon's 20 to 30 minutes assumes the table is talking.
- The Battle needs no input.
- In a party of six, friends sit about 5 to 6 minutes with one roll each.
- With fast taps a night runs 9 to 17 minutes, about 12 to 23 with real waits. G3 and G6 are genuinely good nights.

**4. Decisions are thin.**
- The two Attribute options never change the text, and more than half the time not even the odds.
- 41 dead taps in Weeks 4 to 6, 37 in Weeks 1 to 3.
- 7 flavour choices and 4 order-only menus.
- 6 of 7 early fights end with the same silent runner.
- [PRESS ON] costs nothing to fail, and its details are never used again.
- Shopping has one obvious answer. Relics are close to neutral except in the United Effort, where giving one is a real plan.

**5. Only the story escalates.** The DC stays 9 from Week 5 Day 1 to Week 6 Day 6 while bonuses rise, so **the play gets easier as the story gets darker**. Week 6 Day 6 says "The hardest yet." on the same DC.

Also: **the fragment is a race.** A friend may solve one word on its day, so in a party of three or more somebody gets nothing that day.

## 3. What already works (protect it)

- The Seeker maps: solving them is the twist.
- The United Effort: real turns, Relics given in the moment, a loss that can carry.
- Notice lines as uneven information.
- The Campfire board: split leads assembling the night's evidence.
- The handling of missed days.
- Gathering 6's act ("Say a name") and Gathering 3's "faithful shall not lie" turn.
- The best weekdays: W1D5, W2D3, W2D4, W3D5, W4D5, W5D2, W5D5.

## 4. The changes, in order of value for cost

### A. Make information travel (mostly building; the text already exists)
1. **Share at the fire.**
   - A friend's Notice line ("Mei noticed: …") and a passer's pass line ("Dev saw: …") go onto the board, with any [PRESS ON] detail.
   - This keeps the "Someone at the fire" promise online.
2. **Show the second Notice sentence from 26 (Apprentice), not 51.** One number, but a rule change: your call.
3. **Read back at the Gathering:**
   - each friend's week line at the opening;
   - at Gathering 6, who held which reading.
   - It may need one stored line of framing: your approval.

### B. Fix the live night (building, and two canon gaps)
4. Hold each passage for its reading time, with no 20-second cap.
   - [GO ON] moves only your own phone, or needs a majority.
   - No auto-scroll after a friend scrolls up.
5. A chat strip on the Gathering screen.
6. The vote card shows each option's Attribute and the party's best friend in it. **Canon already requires this.**
7. Gathering 4's Ask questions about the pen and the torn page appear only once those are found. **Canon already says so.**
8. The table's question: every friend answers, and the answers show together (like Match), not first to type.
9. Gathering 1 with two friends: the friend in the drop also rolls.

### C. Make results matter (numbers and a little text; your approval)
10. **Week 6's failures carry:** a failed W6D2 makes W6D3 one step harder, and so on, using the existing `harderIf`. The number is yours.
11. United Effort losses at Gatherings 1, 2 and 4 carry to the next Day 1, as at 3 and 5.
12. Announce "Tonight calls on X" from Day 5, so friends plan and give Relics.
13. A last-light pass reveals the clue of a lead nobody took.
14. Fix the fragment race: each friend may solve any word.

### D. Rewrite (story text; drafts for your approval)
15. Give each flavour choice a line of its own, starting with W1D4, as canon promised.
16. Vary the silent-runner fights; give a few a choice or a loss line of their own.
17. Make "the hardest yet" true or reword it, and decide whether Week 6's DC should rise.
18. Read the [PRESS ON] details back at the Gathering, or post them on the board (covered by 1).

## 5. Leave for a playtest
- Does the Campfire produce talk once sharing exists?
- Is the night 20 to 30 minutes once it is paced for reading and has a chat?
- Are fights tense or a chore?
- Is the 10-minute day right?
