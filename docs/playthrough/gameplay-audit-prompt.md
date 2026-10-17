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

## Criteria: use these, then challenge them

Here is my working list of what good gameplay means for this game. Use it, but **add, remove or reword anything you think is wrong or missing, and say why**:

1. Decisions that matter, now, later, or in what friends learn.
2. Real stakes, beyond gold.
3. The mystery is the game: form theories, test them, be shown right or wrong; attention pays.
4. Friends need each other: uneven information, giving, planning.
5. Rhythm: reading and doing take turns; room to breathe at big moments; variety from day to day.
6. The rules tell the story: mechanics that are the fiction, not machinery.
7. Clear feedback on what happened and why.
8. Growth that feels like your character.
9. The week builds to the Gathering.
10. Easy to come back to after a missed day.

## How to work: four stages, pausing after each

**Stage 1 (Weeks 1 and 2, with `gameplay-rhythm.md`).** First, describe the **core loop** in your own words: the day, the week, the season, and what the player does and feels at each step. Then go through Weeks 1 and 2. For each day and each Gathering, give:
- a **Play score out of 10**, with why;
- the strongest and weakest moment of play, each quoted briefly;
- every button, roll or form that does not earn its place, with a concrete fix and a size (**Big**, **Medium** or **Small**).

Stop and ask: "Shall I go on to Stage 2?" Ask for the next file.

**Stage 2 (Weeks 3 and 4).** The same, and say what changes or wears thin compared with Weeks 1 and 2: repetition, rising difficulty, new mechanics. Stop and ask.

**Stage 3 (Weeks 5 and 6).** The same, with special care on the finale: does it pay off six weeks of play, and does every friend matter in it? Stop and ask for `after-the-finale.md`.

**Stage 4 (the whole season, with the secret).**
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
2. **Your criteria:** the final list, with what you changed from mine and why.
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
