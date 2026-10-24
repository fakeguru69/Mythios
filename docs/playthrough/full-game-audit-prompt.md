# Prompt: the full audit of *Tales of the Dark Moon* (story, play, the fire, the Gathering, the finale, the look, the pull)

Written 24 Oct 2026 for Fake Guru, from his brief of the same day, against `main` as AI Studio left it on 23 Oct. It replaces neither `audit-prompt.md` (the story audit)
nor `gameplay-audit-prompt.md` (the gameplay audit): it is the larger one that covers both and adds the look of the screens,
the notifications and the season as a daily habit.

## How to use it (for Fake Guru)

1. **Start a new chat** with the strongest AI you can, one that can read long files.
2. **Upload these four files first:**
   - `full-game-audit-prompt.md` (this file);
   - `season-part-1-weeks-1-2.md`;
   - `gameplay-rhythm.md`;
   - `docs/style/storybook-voice.md` (the voice the prose is meant to have).
3. **Upload screenshots too, if you can** (they are the only way the AI can judge the look). Take them on your phone,
   in one folder, named so the order is clear (for example `w1d1-01-cover.png`, `w1d1-02-story.png`). Good ones to have:
   the cover; signing in; Session Zero; a chapter mid-way; a Challenge card before and after the roll; a fight; the end
   of the day; the fire with friends' messages and a clue laid; the fragment in the Seeker Chest; the Record; the Bag;
   the Store; the party panel; a notification on the lock screen; the Gathering lobby, Battle, United Effort, Match and
   summary card. Without screenshots the AI will say what it cannot judge.
4. **Paste:** "Read `full-game-audit-prompt.md` and do exactly what it says, starting with Stage 0."
5. The AI works in stages and **stops after each one** and asks to go on. Reply **"go on"**. Do not hurry it: if a
   stage looks thin, reply "go deeper on this stage first".
6. When it asks, upload the next file:
   - `season-part-2-weeks-3-4.md` before Week 3;
   - `season-part-3-weeks-5-6.md` before Week 5;
   - `after-the-finale.md` **only after Week 6** (it holds the secret; the AI should meet the story the way a player does).
7. At the end it writes **`dark-moon-full-audit.md`**. Download it.
8. **Only then** upload the earlier audits it asks for in Stage 10 (`docs/design/full-game-audit-23oct.md`,
   `docs/design/campfire-experience-audit-22oct.md`, `docs/design/campfire-audit-22oct-evening.md`), so it judges with
   fresh eyes first and compares after. Bring both answers back to Claude.

If the AI works inside the repository (for example Google AI Studio with the GitHub repo), tell it the files are in
`docs/playthrough/` and `docs/style/`, and that it must still read them in the order above and must not open
`after-the-finale.md`, `docs/canon/garrick-deception-table.md`, `docs/canon/mythios-cult-bible.md`,
`docs/canon/mythios-season-reveal-map.md` or `src/data/garrickRecap.ts` before Stage 7, nor any earlier audit
(`docs/audits/`, `docs/design/*audit*`, `docs/playthrough/audit-prompt.md`) before Stage 10.

---

# For the auditor

## Your role

You are a team of one with four hats:

- a **senior narrative designer** who has written mysteries and serials (detective fiction, investigative podcasts,
  weekly television, *80 Days*, *Fallen London*, *Her Story*, *Return of the Obra Dinn*, Telltale);
- a **game designer** of tabletop roleplaying (D&D), murder-mystery parties and cooperative board games;
- a **designer of social and daily-habit mobile games** (group-chat games, daily puzzles, *Wordle*-style rituals,
  streaks and notifications);
- a **mobile UX and visual designer** who has shipped reading-heavy apps for small phones.

I am the designer of this game. I do not write code. Write in plain words, and explain any design term the first time
you use it, in one line.

**Do not rush.** I would rather have one week audited deeply than six weeks skimmed. Take every point below in turn
and answer it point by point, with evidence. If you run short of room, stop, say where you stopped, and wait for "go on".
Honesty is worth more to me than praise: a hard truth now is cheaper than after launch.

## The game, and what it is trying to be

*Tales of the Dark Moon* is the first series of an app called **Mythios**. It is played in a chat-style app by a fixed
party of **2 to 6 real friends**, over **six weeks**. A storyteller called **MYTHIOS** tells it from stored,
pre-written text; it does not improvise the plot. An innkeeper called **Garrick** travels with the party and speaks in
stored lines (a little filtered AI small talk about the road, food and weather, never at the fire).

**The story is an investigation.** There is one central mystery for the season. Every day should reveal a little more
of it. Each week builds to a bigger reveal, often with a twist, at the week's **Gathering** on Day 7, which is played
live, together. The season builds to a final reveal and a gut punch in Week 6.

**Each week** is six weekdays and a Gathering:

1. **The day's game** (Days 1 to 6; each friend alone, at any time that day, about 8 to 12 minutes in all). Structured
   play: a chapter in your own thread, with one paid beat (a **Challenge**, a dice roll on an Attribute, or a **fight**),
   sometimes **[PRESS ON]** (an optional harder roll for one more detail), some choices, and the **Pull** (why tomorrow
   cannot wait). Each day also drops a **Seeker Fragment** (a short old text with two scrambled words) into every
   friend's Seeker Chest; six fragments make the week's map.
2. **The fire** (the Campfire; Days 1 to 6, after you finish the day's chapter). Meant to be the **organic** part, like a
   D&D table: the friends talk in a chat, lay the clues they found on the table, agree or doubt each other's, answer
   tonight's question, and work at the day's, the week's and the season's mysteries. Its job: a payoff at the end of
   the evening, and a **second pull** that makes you want tomorrow.
3. **The Gathering** (Day 7, live, 20 to 30 minutes, together). Meant to be **collaborative play** and the strongest piece
   of the week, in play and in story: an Approach (a group choice and one roll), a Battle (each friend fights their own
   enemy at once and can help the others), Notice and [LOOK CLOSER], a United Effort (one shared job, in turns), the
   Lore Reveal with **Match** (match a scripture line to a fragment) and **Ask** (questions to Garrick), the Twist and
   the Cliffhanger.

**The aim, in one sentence:** we are eager to play every day to chase the story, and the play is meaningful, builds the
story and pays off, at every step.

## What you are given, and how to read it

- `season-part-1-weeks-1-2.md`, `season-part-2-weeks-3-4.md`, `season-part-3-weeks-5-6.md`: the whole season in playing
  order, generated from the game's own data. Each starts with the rules in brief: read them first.
  - Quoted text (`>`) is exactly what a player reads.
  - Lines in *⚙ italics* describe the gameplay: what the screen offers, the rule, the numbers.
  - Every branch is given and labelled. The sample party is four friends (you, Mei, Dev and Arjun); the game fills in
    the real names and the party's size, and has shorter lines for small parties.
- `gameplay-rhythm.md`: the numbers of play: words read between taps, real choices against "go on" buttons, reading
  time, per day and per Gathering.
- `storybook-voice.md`: the voice the prose was rewritten into (agreed 16 Oct). Judge the prose against it, and say where
  the voice itself is wrong.
- Screenshots, if I give them. If I do not, say plainly which UX questions you cannot answer.
- `after-the-finale.md`, only after Week 6: the secret and what Garrick's lines really meant.

**What the files cannot show you:** the look, the timing, the sound of the chat, how long a friend waits for others.
Judge what is there, and say where something can only be judged by playing.

### The state of the build (read this; it saves you auditing things that are gone)

Some references you may meet in older notes are out of date:

- There is no `soloLandmarkProse.ts` any more (deleted 15 Oct). The day's prose is the episode files' text, played word
  for word (`chapterScripts.ts`, generated). Judge the prose in the season files.
- The **Detour fight** (+50g on a failed Challenge day) was dropped on 15 Oct. There is no "First-Strike" bonus: who
  strikes first is set by the day's story (a choice, or the day's Challenge) and, at a Gathering, by the Approach.
- The fire's **riddle** and **message in a bottle** were cut on 18 Oct (the chat does their job); **the case so far**
  moved to the Bag's casebook and is still read back at the Gathering's opening; the private **"word with Garrick"** was
  dropped. The fire's question still has the shape "reading A, reading B, or neither", pinned before you see the others'.
- A choice whose options are all seen in turn shows **one option at a time**, never side by side (18 Oct rule: two
  options shown together are a choice, and picking one closes the other).

**Built by 23 Oct** (so judge it as part of the game, not as a plan):

- the story arrives **message by message** with a typing dot (tap to read faster), story text at 18px, a colour key for
  MYTHIOS, Garrick, friends, your choices and the Notice; a **"…" lead-in** before every Challenge, fight and roll card;
- a **colour fight card** with both sides' numbers ("You hit on N+ / He hits on M+");
- an **end-of-day card** (three results, what you learned, what you carry, tomorrow) with one button to the fire;
- **the Notice as an easy roll** (DC 3; a Novice succeeds on 4+), with a first-time explanation, and "Lay it on the table";
- **forks as readable trades**: each real fork's paths have a "What this changed" line and a find of their own (the
  Bag's Found Along the Road shelf, which can be laid at the fire); the careful reading of one fork a week gives a Relic;
  Week 1 Day 1 opens with a disguised fork;
- the **Record** (twelve numbers that only go up, twelve badges, the next step shown), big moments announced in the chat
  (a natural 20, a badge, a crown taken, a new level), a near-miss line, "The Party, Yesterday" each morning, "The
  Week's Best" in the Gathering lobby, Season Titles;
- **the fire's content for all 36 nights**: tonight's question with a title, Garrick's nudges, a line when a particular
  clue is laid, read-backs of earlier nights, quiet nights, and **clicks** (two particular clues on the table together
  make a line appear, and one of them answers tonight's question);
- the Bag's shelves: the Seeker Chest, the Dark Moon Verses, Found Along the Road, the Journal (the fire's nights and
  your margin notes), Relics; a one-screen cover page; the party panel with each friend's status.

The season files show all of this where it is text (the fork lines, the road finds, the clicks). They do not show the
look: use the screenshots.

**Notifications today** (so you can judge them; each is sent once): at 8:00am party time "Week N, Day N is open. The road
goes on." (Week 1 Day 1: "Your story begins today. Week 1, Day 1 is open."; Day 5 names the Attribute the Gathering will
call on; "Last night's call is in." is added for a friend who pinned at last night's fire; none to a friend who has
already played the day); on Day 4 the poll for the Gathering's time, in the chat; "Tonight: the Gathering, at …" on Day 7
and "The Gathering begins soon, at …" an hour before. When a friend sits down at the fire, to every friend not at it
right now: "Mei has come to the fire." (with "Your day is still waiting." for a friend who has not played; never on Week 1
Day 1's solitary night). To friends who sat at tonight's fire and have left: "The table clicked:
two pieces belong together.", "Mei doubted your reading.", "Dev changed sides." (never to which), and from 8:00pm "Last
call: the fire's call closes at dawn, and you haven't pinned." No daily limit; quiet hours 10:00pm to 8:00am.
**Every notification opens the app at its start** (the story thread), not at the exact screen it is about.

### Rules of the world you must respect in any rewrite you propose

- Garrick **never lies**, never promises, never predicts, never denies knowing, never invents facts about himself; no
  "maybe", "perhaps", "I don't know". He is likeable: warm, dry and kind, never curt or bossy.
- **Nobody dies.** HP is always 100; at 0 HP, "DEFEATED.", and the story goes on.
- **No brackets in prose.** No out-of-game talk inside the game. Never reassure a player before a risk.
- Words have first-use gates (some names and facts are not said before a set day). If you think a reveal should come
  earlier or later, say so as a proposal; do not assume a gate is a mistake.
- The numbers are the designer's: propose changes as proposals, with the reason.

## How to work: the stages

Work in this order. **Stop at the end of every stage and ask "Shall I go on to Stage N?"**, then wait.

- **Stage 0. Read the rules and the voice guide.** Then tell me, in ten lines or fewer, what you understand the game to
  be and what you expect a good day, a good fire and a good Gathering to feel like. I will correct you if you are wrong.
- **Stages 1 to 6. One week each** (Week 1 to Week 6). Audit only the week you are on; do not read ahead, even when the
  next week is in the same file. Judge it **as a player who has played only up to that point**: say what a player
  believes at each step, and whether that is fair. Ask for the next file before Weeks 3 and 5.
- **Stage 7. The hindsight check**, after I give you `after-the-finale.md`.
- **Stage 8. The whole game**, through every lens in Part C.
- **Stage 9. The report** (Part D).
- **Stage 10. Compare** (only after the report is written): I will then give you the earlier audits
  (`docs/design/full-game-audit-23oct.md`, `docs/design/campfire-experience-audit-22oct.md`,
  `docs/design/campfire-audit-22oct-evening.md`). Do not ask for them before. Say what they found that you missed, where
  you disagree and why, and which of their fixes have already been made in the files you read.

Keep running notes: a **ledger of every open question the story raises** (who raised it, on which day, when it is
answered, or never), a **ledger of what the party holds** (objects, names, facts), and an **intrigue score for every
day** (Part A, question 13). You will need all three at the end.

**For every finding, give:** where it is (Week, Day, and the file's heading, for example "Week 2, Day 3, Your thread"),
a short quote, what is wrong and why it matters to a player, a concrete fix (rewritten text where it is text, in the
storybook voice), a size (**Big**, **Medium**, **Small**) and how sure you are (**sure**, **likely**, **a hunch**).

---

## Part A. Every weekday (Days 1 to 6), point by point

For each day, answer these in order. Short answers are fine where there is little to say; never skip a number.

### The story of the day

1. **The day in one line**, and **the question the day asks** (and whether it answers it, or hands it on).
2. **Did I learn something new today?** Name the new piece of the mystery. Is it a real step (a fact, a reveal, a
   twist, a deeper question) or the same thing said again? Is it **concrete** enough to talk about at the fire?
3. **The day's role in its week:** opener, complication, false lead, turn, deepening, set-up for the Gathering? Does it
   play that role well? Is it **more intriguing than the day before**: does it open a deeper mystery, explain an
   earlier question, or twist what the party believed?
4. **Filler check:** does the day feel like walking from one place to the next without the mystery moving? If so, say
   how to fix it (what one new fact or turn would earn its place).

### The play of the day

5. **Every choice, Challenge and fight, one by one:** is it meaningful, or a "go next" button in disguise?
   - Does it belong in the story at this moment, or is it machinery? Would the day be better without it?
   - **Does the right choice give a payoff, and does the wrong one sting** (a worse scene, a lost find, a cost the player
     feels), without being unfair? Can a player tell, from the words alone, what they are choosing between?
   - Do passing and failing a Challenge feel different enough to matter? Is a lost fight felt?
   - Is [PRESS ON] worth the risk? Is the extra detail it gives worth having?
   - With `gameplay-rhythm.md` beside you: count the taps that only move the story on against the real decisions.
     Where is the button density too high for the payoff, and where is there too much reading before anything happens?
6. **Prose and actions (the bridge):** does the prose lead into each action and out of it, so the action lives inside
   the scene? For example "The lock will not give to your fingers…" before a Craft roll, and "The door gives to your
   shoulder…" after it. Mark every transition that is missing or generic, along the day's path: the opening and recap,
   any choice, the Challenge, after the Challenge, any choice before the fight, the fight rounds, after the fight, the
   fragment, the last light, the way into the fire. Show the bridge you would write.
7. **Prose quality:** is it a pleasure to read, and a scene a player can **inhabit** (place, light, sound, smell,
   weather, the other people), rather than instructions or a summary? Is it clear enough to follow on a phone? Point
   to anything rushed, flat, over-written, repetitive or unclear. Check grammar and stitching errors (a capital letter
   mid-sentence such as "at The forest road", a name filled into the wrong place, a line that only works for four friends).
8. **Names, places and things:** should key places, people and objects blend into the prose, or be marked (a colour,
   bold, a small tag) so a reader on a phone can follow the investigation? Recommend a rule, with a before-and-after
   example from this day.

### The evening of the day

9. **The last light** (one optional lead, with a roll; the clue always comes back): do the three leads and their clues
   add to the day's mystery? Is each clue concrete and provocative enough to start a real conversation at the fire, or
   is it trivial, redundant or off the plot? Quote any weak clue and write a sharper one.
10. **The fire:** imagine two friends, then six, arriving at different times.
    - Is **tonight's question** a real question, rooted in what the players just saw, with two readings a reasonable
      friend could each hold? Or a false choice, a question with an obvious answer, or one that goes nowhere? Does it
      **pay off within the week** (the designer's rule)?
    - Do Garrick's opener, nudge and callback make sense in this exact moment, and spark theories, or are they banter?
    - Would real friends **want to talk** here? What would they say? What on the screen gives them something to argue
      about (clues laid, Agree and Doubt, the fragment's meaning question)? Where does it feel like filling in a form?
    - **Organic play:** does it feel like a table where players act freely, or like a script? Is that the right trade
      for a stored-text game, and what could add freedom without losing the written story?
    - **Payoff and second pull:** does the evening end with something gained (a click, a conclusion, a new question)
      that makes tomorrow urgent? Or does it just stop?
11. **The Seeker Fragment:** is the text good, and the two words worth finding? Is it clear now, or only in hindsight
    (note which; check again in Stage 7)? Is the word puzzle fair?
12. **The Pull and the next morning's recap:** is the Pull a real reason tomorrow cannot wait? Does the next morning's
    recap ("the road so far") remind without retelling everything?

### The day's scores

13. Give scores out of 10, each with a sentence of why: **Story**, **Play**, **Prose**, **Fire**, **Intrigue** (how much
    more I want to know than this morning), **Pull** (would I open the app tomorrow?). Then the day's **best moment**
    (quoted) and its **biggest fix**.

## Part B. Every week, after its six days and its Gathering

### The Gathering (Day 7)

14. **Does the reveal hold up** logically and emotionally against Days 1 to 6? Do the clues of the week **earn** it, or
    does it feel disconnected, unearned or contradictory? Could an attentive party have half-guessed it, and is that the
    right amount?
15. **The twist:** is there one, does it land, and does it change what the party believed? Is it fair?
16. **The play, device by device:** the Approach, the Battle, Notice and [LOOK CLOSER], the United Effort, Match, Ask,
    the question to the table, and any group choice. For each: is it meaningful, does it make the night better, or is it
    machinery between story beats? **Does every friend have something to do, at every moment**, or do some watch? Is it
    truly collaborative (do friends need each other, talk, decide together), or several solo plays at once? Does it
    work for two friends, and for six?
17. **Is it the strongest piece of the week**, in play and in story? What would make it a night the friends talk about
    the next day?
18. **The cliffhanger:** does the week end with a strong reason to come back: a true cliffhanger or a change of how
    everything looks? Or is it resolved too neatly? Then read the next week's Day 1 recap (in the next part): does it
    pick the thread up with force?

### The week as a whole

19. **The week's arc:** list each day's role in one line, and draw the intrigue curve (the seven Intrigue scores). Does
    it build, sag, or repeat? Which day is the weakest link?
20. **Contradictions and loopholes in this week:** who knows what when; names, ages and timelines of the children;
    objects carried forward (does anything appear before it is found, or vanish?); Garrick's presence (is he where the
    story says he is, and does the party meet him on the right day?); the party's formation (Day 1 is played alone; is
    every line consistent with that?); places and travel times; anything said before it can be known.
21. **Party size:** every line that assumes four friends (for example "the four of you", "three other travellers", "the
    fourth stub", a choice that needs three companions) where the party may be 2 to 6. Lines about the four children or
    the four Stones are story facts and are fine.
22. **Mechanical loopholes:** broken incentives in the dice and the numbers this week (is any choice always right? is
    any roll pointless? can a player farm gold? is a Relic ever wasted by the rules? do Notice, the last light, the
    Seeker Chest or the United Effort have an exploit, or a dead end?).
23. **The week's score** out of 10, and its **three biggest fixes**, in order.

## Part C. The whole game (Stage 7, then Stage 8)

### Stage 7: the hindsight check (after `after-the-finale.md`)

24. **Clues and Garrick's lines in hindsight:** which land well, which feel like cheating, which are too hidden ever to
    find? Does Garrick keep his rule (never a lie) in every line, read again with the secret known?
25. **The 36 fragments in hindsight:** are they clear once the truth is known? Assembled week by week at the Gathering,
    do they give a **gut punch** each week? Name the vague, clunky or weak ones and propose better wording or lock words.
26. **Fairness:** is the hidden truth fair once known? Could an attentive party have suspected it, and when? Is that the
    right moment?
27. **Loopholes the secret opens or fails to close**, with the days they touch.
28. **The finale (Week 6):** is it well written and well presented? **Is the gut punch clear** to a player who has
    followed the story, and to one who skimmed? Is it earned? Does it leave the friends wanting the next series? What
    would make it unforgettable?

### Stage 8: the lenses

29. **The investigation as a design.** Is the mystery clear enough to follow day by day? Is there always a question the
    party is trying to answer, at the scale of the day, the week and the season? Is the information given at the right
    rate (too much, too little, too late)? Are there red herrings, and are they fair? Use your open-question ledger:
    which questions are never answered, answered too late, or answered without anyone having asked? Are the **micro
    payoffs** (each day's small answers) strong enough to keep a player going between the big ones?
30. **Every step towards revelation.** Using all 42 intrigue scores: is every day building intrigue? Where is the season's
    sagging middle, if any? Rank the six weekly endings **from strongest to weakest**, and write a concrete rewrite for
    each ending that is flat or too neat.
31. **The daily game over six weeks.** Is it interesting and meaningful to play every day? Does it wear thin (the same
    shapes, the same kinds of roll)? Do gold, gear, Relics and Attributes stay interesting? Is the difficulty curve
    right? Are there real stakes, and does the player feel them?
32. **Button pushing.** All in all, is it too much button pushing? Does pushing feel like "go on next" without real
    choices and consequences? Where the day is structured, does the fire leave enough room for organic play and talk?
33. **The fire over six weeks.** Is it interesting and meaningful to play? Does it give a payoff each night? Does it
    become a routine? What happens when only one friend comes, or when friends come hours apart?
34. **The Gathering over six weeks.** Is the gameplay strong and meaningful, and the narrative strong, every week? Does
    it vary enough from week to week? Is it worth fixing a time with friends for?
35. **Social design.** Does the season make friends play together, talk and care, or play side by side? Two friends
    against six: what breaks? A quiet friend, a dominant friend, a friend who misses three days, a friend who joins late:
    what happens to each? Is the race for fragment words friendly or a source of resentment?
36. **Garrick across the season.** Is he likeable and alive, or a repeating computer character? Where is the risk of
    stiffness, repetition or answers off the point greatest, and how could it be lowered?
37. **Teaching the game.** Does Week 1 teach the game without a manual? Is every rule met for the first time at a good
    moment, and explained once, in the story's voice? What will a new player not understand?
38. **The UX: is it pretty, and is it clear?** From the screenshots (or say you cannot):
    - First impression: the cover and the first minute. Would I want to go on?
    - Hierarchy: on each screen, is it obvious what to read, what to tap, and what matters most?
    - Legibility on a small phone (an iPhone 13 mini, 375px wide): sizes, weights, contrast, line length, colour.
    - The one thread from morning to the fire: is it clear where the day ends and the fire begins? Can a player find
      their place again after a break?
    - The four tabs (STORY, RECORD, BAG, STORE), the top bar and the party panel: are they clear, and is anything hidden
      that should be found, or shown that should be hidden?
    - The cards (Challenge, fight, Notice, fragment, end of day, Gathering summary): do they explain the numbers simply?
    - The visual style as a whole: does it feel like a dark storybook, consistent from screen to screen? What would make
      it beautiful?
    - Accessibility: colour-blind readers, older eyes, one hand, a poor connection.
39. **Notifications and the return loop.** Do the notifications (listed above) motivate a friend to come back, to play
    the day and to revisit the fire? Are they too many, too few, mistimed, or flat in tone? Should they be written in the
    story's voice? Do they bring the friend to the right screen (today they all open the start of the story thread): say
    where each one should land. What one notification would most raise return visits?
40. **The habit.** Is a day the right length for a weekday? Is there a reason to open the app every single day for six
    weeks: the story, the friends, the chase (streaks, crowns, badges), the fear of missing out? What makes a friend skip
    a day, and what happens to the party when one does?
41. **Tone and care.** The story has children taken from their homes. Is it handled with care? What age and content
    rating would you give it? Anything to soften or to sharpen?
42. **Criteria I have missed.** Think as the lead of a studio that ships narrative games. What would you judge that this
    prompt does not ask? (For example: replay value, word of mouth, cost per party of the AI, the first-week drop-off,
    how it ends for a friend who loses badly, whether the series format will carry to a second series.) Add them, and
    audit them.

### The verdict

43. **The ultimate question.** All in all, across the mystery, the daily game, the fragments, the fire with 2 to 6
    friends and the Gathering: **would you be genuinely excited to open this and play every day for six weeks? Are you
    excited to play the next day?** Give an honest score out of 10, say what holds it back from 10 today, and list the
    **five changes with the most leverage** that would turn it into a habit friends cannot put down.

## Part D. The report (Stage 9)

Write the final report as **one Markdown file named `dark-moon-full-audit.md`**. If you can create files, give it to me to
download; if not, put the whole report in one Markdown code block that I can save.

It contains, in this order:

1. **The verdict in five lines:** is it a good game, a good story, a good daily habit; the single most important change.
2. **Scores** (a table, each with one line of why): the story; the investigation; the daily game; the fire; the
   Gathering; the finale; the prose; Garrick; the UX (look); the UX (clarity); the notifications; "would I open it
   every day"; "would I play it with my friends to the end"; overall.
3. **The ultimate question** (point 43) in full: the score, what holds it back, the five changes.
4. **The intrigue curve:** a table of all 42 days with their Intrigue score and one line each, and what the curve shows.
5. **The weekly endings ranked**, strongest to weakest, with the rewrites (point 30).
6. **The whole game, by lens** (points 29 to 42).
7. **The hindsight check** (points 24 to 28), with the fragments that need rewriting.
8. **Week by week:** each week's score, a short summary, its day-by-day scores as a table, its Gathering, its
   cliffhanger, and every Big and Medium problem with its fix.
9. **Contradictions and loopholes, in one list** (story, timeline, party size, mechanics), each with where and the fix.
10. **Every problem found, in one list:** week, day, heading, size, sureness, the problem, the fix; Big first.
11. **Rewrites:** every passage you rewrote, the old and the new side by side.
12. **The fifteen most important fixes for the whole game, in order,** each with what to change, why, and what it costs
    to change (story text, a rule, a screen, or the server).
13. **What must not change:** the parts that work best and should be protected.
14. **What you could not judge** (for example the look without screenshots, timing, the AI small talk) and how I could
    let you judge it.

Answer point by point, with the numbers above, so I can reply "1 yes, 2 no". Be specific: praise is useful only when it
says exactly what works.
