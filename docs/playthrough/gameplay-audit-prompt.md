# Prompt: judge the QUALITY OF THE GAMEPLAY in *Tales of the Dark Moon*

*How to use it (for Fake Guru):*

1. *Start a new chat with another AI. Upload `gameplay-rhythm.md` and `season-part-1-weeks-1-2.md`, then paste everything below the line.*
2. *After each stage the AI stops and asks to go on. Reply "go on".*
3. *When it asks, upload `season-part-2-weeks-3-4.md` (before Stage 2), then `season-part-3-weeks-5-6.md` (before Stage 3), then `after-the-finale.md` (before Stage 4).*
4. *At the end it writes `dark-moon-gameplay-report.md`. Download it and bring it back to Claude.*

---

You are a senior game designer. You have shipped or studied:

- narrative games (*80 Days*, *Fallen London*, Telltale, *Inkle*'s games, visual novels);
- social and asynchronous mobile games (daily puzzles, group-chat games, *Wordle*-style habits);
- tabletop roleplaying and murder-mystery parties;
- cooperative board games.

I am the designer of a story game. I do not write code, so write in plain words, and explain any design term the first time you use it, in one line.

**This audit is about the quality of the gameplay only:** how it feels to play, and whether the mechanics and the pacing make a good game around the story. It is not about:

- the prose (it has had its own edit);
- plot holes (a separate audit covered them).

Mention those only where they hurt play.

## The game

*Tales of the Dark Moon* is a mystery played in a chat app by a fixed party of 2 to 6 real friends, over six weeks.

- An AI storyteller, MYTHIOS, tells it from **stored, pre-written text**. It does not improvise. Players cannot do just anything: their freedom lies in what they notice, decide, guess and say to each other.
- **A weekday** (Days 1 to 6) is played **alone, at any time that day**, in about 8 to 12 minutes. In order:
  - a chapter in your own thread, with one paid beat (a Challenge or a fight), sometimes an optional harder roll ([PRESS ON]), and the Pull (why tomorrow can't wait);
  - each day drops a **Seeker Fragment**, a short text with two scrambled words, into every friend's Seeker Chest. Six fragments make the week's map;
  - **the last light**: pick one of three leads and roll for a hint, or skip it;
  - **the Campfire**: a shared evening screen where friends pin theories, see each other's, solve a riddle, and leave notes. Friends visit it at different times.
- **The Gathering** (Day 7) is played **live, together**, in 20 to 30 minutes. It runs:
  1. an Approach (a vote and one roll);
  2. a Battle (each friend fights their own enemy at once, and can help the others);
  3. a United Effort (one shared job with two bars, taken in turns);
  4. a Lore Reveal, with Match (link a scripture line to a fragment) and Ask (questions to the innkeeper Garrick);
  5. a question to the table;
  6. a twist and a cliffhanger.
- **The numbers:**
  - six Attributes that grow;
  - gold, gear and Relics (one-use bonuses that can be given to friends);
  - everyone has 100 HP, and nobody dies.

## What you are given

- **`gameplay-rhythm.md`**: the rhythm of play, measured from the game's own data:
  - words read between taps, which taps are real decisions, reading time;
  - what the evening and each Gathering ask players to do.
  
  **Use these numbers.** Do not guess lengths.
- **The play-through, in three files** (two weeks each): every word a player reads, in playing order, with the gameplay.
  - `>` quoted text is what the player reads.
  - Lines marked *⚙* describe what the screen offers and the rules.
  - Branches are labelled. "Either way, every player reads this:" marks text that every player reads whatever happened before. A step marked "Only if…" happens for that outcome only. Do not read shared text as branch-only, or the reverse.
  - The sample party is four (you, Mei, Dev, Arjun); the game fills in real names and the party's size.
- **`after-the-finale.md`** (Stage 4 only): the season's secret. Garrick, the friendly innkeeper, leads the cult. Solving each week's map is what shows the cult where each Stone lies.

The files cannot show the screens, the timing, the sound, or friends talking. Say plainly where only a real playtest can answer.

**Rules for your claims:**
- Base every claim on the files: quote briefly and name the heading (for example "Week 2, Day 3, Your thread").
- Mark anything you infer, rather than read, as **(guess)**.

## The fixed limits: any proposal must keep these

- The plot is written in advance. Every branch reaches the same plot: choices change how you get there, what you learn, and what it costs, not where the story goes.
- Weekdays are played alone and asynchronously, on a phone, in about 10 minutes. Only the Gathering is live.
- Garrick never lies, promises or predicts.
- Parties of 2 to 6 must all work.
- Nobody dies. Failure costs gold, information, time or position, never the story.
- There is no free-text AI game master. Any new text is written in advance.

Within these limits, be bold. Propose changes to mechanics, rewards, pacing, the order of beats, and what each button does.

## The questions I most want answered

1. **Is it more game or more story, and is the balance right for this audience?** That is friends who want a mystery to share, not a puzzle to grind.
2. **Is there enough room for the story between the buttons, or too much?** An earlier reviewer feared it may feel like moving point to point. Check that against the rhythm numbers.
3. **Should the game be woven through the story** (decisions inside the scenes) **or come after it** (story first, then the evening's puzzles and talk), as it does now?
4. **Does every button earn its place?** Each one should be a real decision, a reveal, or a dramatic beat. Which should go, merge, or carry more weight?
5. **Do the dice matter?** Do Challenges, fights and [PRESS ON] change anything a player cares about, beyond gold?
6. **Do friends need each other?** Look at the weekdays, the Campfire, Relics and the Gathering. What would make them talk, trade and plan more?
7. **Does the week build to the Gathering?** Do the weekdays change how the Gathering plays, or only what it means?
8. **Would I come back every day for six weeks?** What brings me back, and what might make me drift away?

## The criteria: what makes good gameplay in this story game

Score the game against each criterion below. Each one says:
- what it means here;
- the questions to ask;
- what it looks like when it works and when it fails;
- where to look.

Use them all, and **add, remove or reword any you think is wrong or missing, and say why**.

### A. Agency: what the player decides

**1. Decisions that matter.**
- *Means:* a choice changes something the player can feel: the scene, what they learn, what it costs, or what their friends see. Because every branch reaches the same plot, the change lives in the *how*, not the *where*.
- *Ask:* does the player weigh options, or is one plainly best? Would they choose differently on a second play, or in another friend's shoes? Does anything they chose come back later?
- *Works:* "I took the hill, so I saw the riders; Mei took the river and found the boat. Now we compare."
- *Fails:* a button that only says "go on"; options that all lead to the same text; a choice whose effect the player never sees.
- *Look at:* choices (pick / each / auto / flavour), the Challenge's Attribute options, [PRESS ON], the last light, votes, Gathering 6's picks.

**2. Real stakes.**
- *Means:* the uncertain moments put something the player cares about at risk: a clue, a person, position, standing with friends, how the Gathering goes. Gold matters only if what it buys matters.
- *Ask:* what does a fail cost here, and does the player feel it? Does a result last past the moment, into the next day or the Gathering? Is a 95% win still exciting?
- *Works:* a failed roll means a scene told differently, a clue missed that a friend must supply, a harder Gathering.
- *Fails:* fail and pass reading almost the same; losses forgotten tomorrow; fights won almost every time with nothing riding on them.
- *Look at:* Challenge fail lines, fights and what follows them, the United Effort's two outcomes, what carries into later days.

### B. The mystery: what the player thinks

**3. The mystery is the game.**
- *Means:* players form theories, test them against clues, and are shown right or wrong. Attention pays.
- *Ask:* is there a clear question to work on each day and each week? Are clues fair and findable? Does being right do anything? Can a sharp party suspect the twist before it lands?
- *Works:* players argue a theory at the fire, and the Gathering proves one of them right. Rereading shows the clues were there.
- *Fails:* theories pinned and never paid back; answers simply told; clues hidden behind one optional roll.
- *Look at:* the day's question, Notice lines, the Seeker Fragments and maps, Campfire pins, Match, Ask, the week board, the hindsight file.

**4. Puzzles that feel good.**
- *Means:* the word-lock fragments, maps and riddles are satisfying to crack, neither trivial nor obscure, and solving them feeds the story.
- *Ask:* is the difficulty right? Is the "aha" earned? Does the puzzle tell you something about the world, or is it just a lock?
- *Look at:* the Seeker Fragments, the last light's hints, the riddles, Match.

### C. Together: what the friends do for each other

**5. Friends need each other.**
- *Means:* each friend holds something the others don't (a detail, a Relic, a skill, a theory) and has reasons to share, give, plan and talk. Playing alone at different times must still feel like playing together.
- *Ask:* what does one friend know or have that another needs? What would two friends say to each other after the day? At the Gathering, does every friend have a part, or do some watch?
- *Works:* "I noticed the knot. Did anyone else?"; a Relic given before a hard roll; a vote argued.
- *Fails:* everyone sees the same text and fills the same forms alone; the "social" part is a log of who did what.
- *Look at:* Notice lines, the Campfire board and pins, giving Relics, the party chat lines, the Battle's help-calls, the United Effort's turns, votes, the question to the table.

**6. Asynchronous play works.**
- *Means:* friends who play at 7am and 11pm both feel part of the same evening. Being first or last at the fire is still good.
- *Ask:* what does the first friend at the fire see, and the last? Does anything make you look forward to friends' answers?
- *Look at:* the Campfire's read-backs, the message in a bottle, the board, catch-up lines.

### D. Pace and shape: how it flows

**7. Rhythm between reading and doing.**
- *Means:* story and play take turns. Long reading comes where the story earns it; quick beats come where tension does; big moments get room to breathe.
- *Ask:* use `gameplay-rhythm.md`. Where are the long reads, and do they earn it? Where do taps come thick and empty? Is there a quiet beat at each big turn?
- *Works:* a short tense run of rolls, then a held moment of story.
- *Fails:* 400 words with no break; four "go on" taps in a row; a reveal rushed by a button.
- *Look at:* the strips in `gameplay-rhythm.md`, the Gathering reading time, held "alone" moments.

**8. Variety without confusion.**
- *Means:* days and weeks feel different (new places, new kinds of challenge, new twists to the mechanics) while the rules stay easy to follow.
- *Ask:* which beats repeat in the same shape (the same fight ending, the same fragment find, the same evening)? When does it start to feel like routine? Do the Gatherings' conditions and stories change the play, or only the words?
- *Look at:* fights across the season, fragment finds, Campfire nights, each Gathering's Battle condition and United Effort.

**9. The week builds to the Gathering, and the season to the finale.**
- *Means:* weekdays prepare the Gathering, and the Gathering pays them off and opens the next week. The finale pays off six weeks of play, not just six weeks of story.
- *Ask:* does what we did on the weekdays change how the Gathering plays (the map bonus, knowledge for Match and Ask, Relics saved)? Does the finale use what we built?
- *Look at:* the map +2, Match, Ask, what carries between weeks (a lost United Effort), Gathering 6.

### E. Fiction and feel: how the rules sit in the story

**10. The rules tell the story.**
- *Means:* a mechanic *is* the fiction, not machinery between scenes. The Seeker maps are the model: solving them is how the enemy finds the Stones.
- *Ask:* does each mechanic make sense inside the world? Would the player feel the story through it with the words removed? Where does the machinery show?
- *Look at:* every mechanic; read the hindsight file for the maps and the twist.

**11. Clear feedback.**
- *Means:* after every roll, tap and choice, the player knows what happened, why, and what it cost or won.
- *Ask:* are the odds shown before a roll? Is the cost of a fail clear? Is it clear what a choice changed?
- *Look at:* the Challenge card, the result lines, fight rounds, the United Effort bars, the summary cards.

**12. Growth that feels like your character.**
- *Means:* your character gets stronger and more *yours*: your class, your best Attribute, your gear, your Relics. Friends' characters feel different from each other.
- *Ask:* does growth change what you can do or how you play? Does a Warrior's day feel different from a Sage's?
- *Look at:* Attribute growth and tiers, classes, Notice lines by Attribute, gear, Relics.

### F. Habit: why you come back

**13. A reason to come back tomorrow.**
- *Means:* each day ends with a pull to the next (the story's hook, a friend's answer you want to read, a puzzle half done) and never with a chore.
- *Ask:* what makes me open the app tomorrow? What makes a day feel like homework? Is 8 to 12 minutes right?
- *Look at:* the Pull, the recap, the Campfire's next-day hooks, notifications, the fragment puzzle.

**14. Easy to come back to after a missed day.**
- *Means:* missing a day costs a little and never cuts you off from your friends or the story.
- *Ask:* what does a friend who missed two days see? Can they still help at the Gathering?
- *Look at:* the recaps, "You missed…" lines, a day that closes itself, a late friend at the Gathering.

### How to score

For every criterion, give a score out of 10, one line of why, and the one change that would raise it most.

## How to work: four stages, pausing after each

**Stage 1 (Weeks 1 and 2, with `gameplay-rhythm.md`).** First, describe the **core loop** in your own words: the day, the week, the season, and what the player does and feels at each step. Then go through Weeks 1 and 2. For each day and each Gathering, give:
- a **Play score out of 10**, with why, naming the criteria (by number) that the day meets or misses;
- the strongest and weakest moment of play, each quoted briefly;
- every button, roll or form that does not earn its place, with a concrete fix and a size (**Big**, **Medium** or **Small**).

Stop and ask: "Shall I go on to Stage 2?" Ask for the next file.

**Stage 2 (Weeks 3 and 4).** The same, and say what changes or wears thin compared with Weeks 1 and 2: repetition, rising difficulty, new mechanics. Stop and ask.

**Stage 3 (Weeks 5 and 6).** The same, with special care on the finale: does it pay off six weeks of play, and does every friend matter in it? Stop and ask for `after-the-finale.md`.

**Stage 4 (the whole season, with the secret).**
- Score every criterion for the whole season (the table for the report).
- Judge each mechanic across the season against the criteria:
  - the Challenge, fights, [PRESS ON], choices, Notice lines;
  - the Seeker Fragments and maps, the last light, the Campfire (each of its parts);
  - Relics and giving them, gold and gear;
  - the Approach, Battle, United Effort, Match, Ask, the question to the table, and Gathering 6's group choices.
- Now that you know the secret, judge whether the season's mechanics serve the twist.
- Then answer the eight questions above directly.

## The final report: one .md file named `dark-moon-gameplay-report.md`

If you can create files, give it to me as a file. If not, put the whole report in one Markdown code block.

In this order:

1. **The verdict in five lines:** is the gameplay good, is the balance of story and game right, and the single most important change.
2. **The criteria, scored:** a table with each criterion (mine, plus any you added), its score out of 10, one line of why, and the change that would raise it most. Then say what you changed in my list, and why.
3. **The core loop:** what works and what is missing, at the level of the day, the week and the season.
4. **Each mechanic:** a table with its score out of 10, what it does well, what it does badly, and keep / change / cut. For each change, the concrete proposal.
5. **Pacing:** story against play, using the rhythm numbers. Where the story needs more room and where less, and where play should move inside the scene.
6. **The eight questions, answered.**
7. **Proposals, ranked:** the ten changes that would most improve the play. Each one has:
   - what to change;
   - why it helps, by which criterion;
   - its cost, as Small (a few lines of text or a number), Medium (a new screen piece or new text across the season) or Big (a new system);
   - what could go wrong.
8. **What to test with real players:** the five questions only a playtest can answer, and how to watch for each.
9. **What must not change:** the mechanics that work best.
