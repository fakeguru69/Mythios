# Prompt: play *Tales of the Dark Moon* as a player, then score every day

Written 25 Oct 2026 for Fake Guru. **This file and everything in `docs/playthrough/` hold the season's secret. Never publish them.**

Other audit prompts in this folder cover different ground, and this one replaces none of them:

- `full-game-audit-prompt.md` (24 Oct) reads the season as text.
- This one asks an AI to **play** the real online game from a player's seat, the way a party of friends would.
- It then gives **a score for every day**, all 36 weekdays and all six Gatherings, against one fixed list of criteria. Two runs of it can be compared.

## How to use it (for Fake Guru)

**Which AI.** The AI needs two things:
- access to the GitHub repository `fakeguru69/Mythios`;
- ideally, a computer of its own to run the game on: a shell, Node, Postgres and a browser.

Good choices are Claude Code on the web, OpenAI Codex or Google Jules, given the repo.

An AI that can only *read* GitHub (a chat with a GitHub connector) can still do this. It works in **Read mode** (below): it judges from the play-through files instead of the live screens, and says which scores it could not give.

**Steps:**
1. Start a new session with the AI on the repository.
2. Paste: *"Read `docs/playthrough/play-and-score-audit-prompt.md` and do exactly what it says, starting with Stage 0."*
3. It stops after each stage. Reply **"go on"**, or "go deeper" if a stage looks thin.
4. At the end it writes **`docs/audits/play-and-score-<date>.md`** and tells you. Bring it back to Claude.

---

## For the AI: who you are and what you are doing

You are a senior game designer and a demanding reader. You have shipped or studied:
- narrative games: *80 Days*, *Fallen London*, Inkle's games, Telltale's, visual novels;
- social and asynchronous phone games: daily puzzles, group-chat games, *Wordle*-style habits;
- tabletop roleplaying and murder-mystery parties;
- cooperative board games.

The designer, Fake Guru, does not write code. Write in plain words, and explain any design term in one line the first time you use it.

**Your job:** play the game as a player, honestly, from Week 1 Day 1 to the finale. Feel where it is good and where it is "tap, read, tap". Then score every day against the criteria in Part 3 and write the report in Part 4.

**Rules you must keep:**
1. **Do not change anything.** No code, no story text, no database rows outside your own local copy. No commits and no pull requests; the only file you add is the report. Never touch the live server (Supabase project `toqeuurdsyeifhpecagr`) or the website.
2. **Meet the story as a player does.** Do not open these until Stage 7:
   - `docs/canon/garrick-deception-table.md`;
   - `docs/canon/mythios-cult-bible.md`;
   - `docs/canon/mythios-season-reveal-map.md`;
   - `docs/playthrough/after-the-finale.md`;
   - `src/data/garrickRecap.ts`.

   Do not open earlier audits (`docs/audits/`, `docs/design/*audit*`) until Stage 8. Judge with fresh eyes first, then compare.
3. **Score what a player meets,** not what the design documents promise. If a document says something exists and you cannot find it on screen, it does not exist for your score. Say so.
4. **Be specific.** Every low score names the moment: the day, the line or the screen, and a short quote. Every high score names what earns it. No score without a reason.
5. **Be honest, not kind.** The designer asked for this to find the weak places. "Fine" is not a finding.

## The game, in short

*Tales of the Dark Moon* is a mystery for a fixed party of **2 to 6 real friends**, played on phones over **6 weeks**. A storyteller voice called MYTHIOS tells it from stored text, and the AI is used only for Garrick's small talk.

**A week:**
- **Days 1 to 6** are played alone, about 8 to 12 minutes each:
  1. a chapter with real choices;
  2. one paid beat, a **Challenge** (d20 roll) or a **fight**, sometimes **[PRESS ON]** for a harder roll;
  3. the **last light**, one lead followed for a clue;
  4. the **Campfire**, where the friends lay what they found on a shared table, argue it out, and the party's call is made by dawn;
  5. a **Seeker Fragment**, a word-lock puzzle in the Seeker Chest.
- **Day 7 is the Gathering,** live, all friends at once, about 30 minutes: the Approach, the Battle, the United Effort, a "tell them what to do" moment, Match, Ask, the twist and the cliffhanger.

The rules and every number are in `docs/canon/mythios-core-rules.md` (§12 holds the numbers). The intended voice is `docs/style/storybook-voice.md`.

**The designer's own critique, which this audit tests:** the game once felt like "a series of *what's next* buttons". Two fixes were made:

1. **Choices with stakes.** Forks shut the other road, and the road taken pays off later: a clue you have or lack, a harder card, a line at the Gathering. Failing a roll costs evidence.
2. **The Campfire as organic play.** Each friend brings a piece only they found, and the party argues to a call.

**Your central question:** did it work? Keep coming back to it.

---

## Part 1: Stage 0, set up (stop afterwards)

**Play mode** (if you can run code). Follow `tests/README.md`, "A local copy of the server":
1. Start Postgres and load every migration.
2. Start the stand-in, `node tests/online/local-server.cjs`, and the app with `VITE_SUPABASE_URL=http://localhost:54321 npm run dev`.
3. Optionally start Garrick: `npx tsx tests/online/local-garrick.ts`.

Then make your party:
- **Three players:** you, plus two you play yourself in other browser windows. Create them the way `tests/online/party-and-session-zero.cjs` does, or by SQL on your local copy only.
- Sign in with any password.
- Play on a phone-sized window, **390 × 844**, and take a screenshot of every new kind of screen. Save them in a scratch folder, not the repo.
- **To move through the season,** move your local party's clock back one whole day after each day is played:
  `update public.parties set day1_opens_at = day1_opens_at - interval '1 day' where id = '<party>'`.
  The day turns at 5:00am party time, so use whole days only.
- **The Gathering runs on a server timer:** call `select public.gathering_tick('<party>')` every two seconds, or let the stand-in do it, and play each friend's part.

**How to play the days:**
- Play the **main character honestly**, choosing what you would choose.
- With the other two, sometimes take the other road, sometimes fail on purpose, and once let a friend miss a day. That way you see the stakes, the failures and the catch-up.
- **At the fire, really talk** as all three: lay pieces, doubt each other, change sides. Watch what Garrick and the game do to get the talk going, and what happens when one friend stays silent.
- **Play at least one day in a party of two** and one Gathering in a party of six (with four pretend friends driven by SQL or scripts), to check the party-size wording.

**Read mode** (if you can only read). Use the play-through files, which show the season exactly as a player meets it, in order:
- `docs/playthrough/season-part-1-weeks-1-2.md`;
- `docs/playthrough/season-part-2-weeks-3-4.md`;
- `docs/playthrough/season-part-3-weeks-5-6.md`;
- the measured rhythm in `docs/playthrough/gameplay-rhythm.md`.

You cannot judge the look, the feel of the timers, or the live talk at the fire. Mark those scores **"n/a (read mode)"** and say what you would need to judge them.

**At the end of Stage 0, report:**
- which mode you are in;
- what ran and what did not;
- your party;
- anything that stopped you.

Then stop and ask to go on.

## Part 2: Stages 1 to 6, play one week each (stop after each)

For each week, play Days 1 to 7 in order. As you play, keep a **ledger of open threads**: every fork you took, and every clue, promise, question or mystery the story opened, with the day it opened. When a later day pays one off, tick it and note whether the payoff was **legible**.

A payoff is legible when you can see without being told that this is because of what you did. "Somebody on the slope watched you read the wheel-marks yesterday" names the cause: legible. A card that is simply harder, with nothing said, is not.

**After each week, write:**
1. **The week's score rows** (Part 3's table, one row per day, Days 1 to 7).
2. **The week in a paragraph:** how it felt to play, honestly, with its best moment and its worst moment.
3. **The open-threads ledger** as it stands: what opened, what paid off, and whether each payoff was legible.
4. **"What's next" moments:** every stretch where you were only tapping to move on, with where it was and how long it lasted, in words or taps.
5. **Bugs and slips:** anything broken, wrong or confusing on screen, such as wrong numbers, wrong names, the wrong friend count, text cut off, a button that did nothing, or a timer that felt wrong. Give the screen, what happened, and a screenshot name.

Then stop and ask to go on.

## Part 3: the criteria and the score sheet

Score each criterion **1 to 10**:
- **1–3:** weak, and a player would notice;
- **4–5:** works but forgettable;
- **6–7:** good;
- **8–9:** memorable;
- **10:** the best of its kind you know.

Use **n/a** only where a criterion cannot apply, and say why. Use the whole range; a page of 7s tells the designer nothing.

### A. Story (every day and every Gathering)

| Code | Criterion | What to look for |
|---|---|---|
| S1 | **Prose quality** | Clear, vivid, textured; reads aloud well; British spelling; no brackets in prose; matches `storybook-voice.md`. Neither rushed into one-liners nor padded. |
| S2 | **Build-up** | Does the day raise a question, a danger or a want that pulls you through it? Is there tension? |
| S3 | **Payoff** | Does the day pay off something set up earlier, the same day or days before? Is the payoff earned and legible? |
| S4 | **Characters** | Do the people feel real and distinct: Garrick (warm, dry, kind, never curt), Meira, the children, the enemies, your friends as written into the story? |
| S5 | **World** | Does the place feel like somewhere, with weather, sound and smell, its own history? Is it consistent with earlier days? |
| S6 | **Clarity** | Could a player who reads at an ordinary pace follow what happened and why it matters? Note anything confusing. |
| S7 | **The Pull** | At the day's end, do you want tomorrow? Name what pulls you, or why nothing does. |

### B. Game mechanics (every weekday)

| Code | Criterion | What to look for |
|---|---|---|
| M1 | **Meaningful choices** | How many real choices were there, ones that shut another road or change what comes later, and not flavour? Did you have a reason to prefer one road? Was it a trade, or a guess? |
| M2 | **Stakes you can feel** | At the moment of choosing or rolling, did you know something was at risk? Did the result land: gold, growth, a clue gained or lost, a harder card? |
| M3 | **Payoff of earlier choices** | Did this day show the results of choices from earlier days? Was it legible, the "aha, that's because I…" moment? Or did it happen unseen? |
| M4 | **Rhythm** | The balance of reading against doing: the longest stretch of tapping only to move on, and whether the reading felt like a reward or a wait. |
| M5 | **Rolls and fights** | Is the Challenge card clear ("You succeed on X+")? Does the roll feel tense? Do fights feel like a contest or a chore? Strike or Cover, Relics, [PRESS ON]: are they real decisions? |
| M6 | **Fairness and numbers** | Do the numbers on screen follow Core Rules §12: DC, bonus, gold, growth, damage? Does losing feel fair? Is gold worth earning, so that the Store matters? |
| M7 | **The fragment** | Is the Seeker Fragment's word-lock fun? Does the fragment add to the mystery, or is it a chore? |

### C. The Campfire (every weekday)

| Code | Criterion | What to look for |
|---|---|---|
| C1 | **Reasons to talk** | Did each friend bring something the others did not have? Did tonight's question invite a real argument, with two fair readings? |
| C2 | **Garrick as host** | Does he open the night, notice pieces, react when the fire splits or agrees too fast, and draw in a silent friend? Do his lines feel warm and natural, or mechanical? Does he ever say too much? |
| C3 | **A quiet fire** | When one friend lays a piece and nobody answers, or a friend says nothing all night, what does the game do? Does a two-friend party still work? Does a friend who comes late find enough to join in? |
| C4 | **The click and the call** | When two pieces together show something new (the click), is it satisfying? Does the party's call at dawn feel like the party's own conclusion? Is it read back later, and does that matter? |
| C5 | **Story build-up at the fire** | Does the fire deepen the mystery, with theories that are fair, tempting and sometimes wrong, without giving the reveal away? |
| C6 | **Payoff of the fire** | Do the night's calls and pins come back at the Gathering or later, so that arguing was worth it? |
| C7 | **Free play versus script** | How much of the fire is the friends' own play, and how much is reading? Would real friends spend ten minutes here? |

### D. The Gathering (each of the six)

| Code | Criterion | What to look for |
|---|---|---|
| G1 | **Build-up** | Does the week's mystery come to a head? Is the case so far read back well? Does the opening grip? |
| G2 | **Group decisions** | How many times does the party really decide together: the vote, the Approach, "tell them what to do", Match, Ask, the question to the table? Do the decisions matter? |
| G3 | **Live play** | The Battle in lockstep, the United Effort's turns, the timers. Does it feel like playing together, or watching? Is everyone involved, in a party of two and a party of six? |
| G4 | **The twist and the payoff** | Does the reveal pay off clues the party really held? Does a player who paid attention feel clever, and one who did not still follow? |
| G5 | **The cliffhanger** | Does it make next week necessary? |
| G6 | **Pacing** | Reading against doing over the night; the longest [GO ON] stretch; the total time. |
| G7 | **Payoff of the week's choices** | Do the week's forks, failures, fire calls and the "tell them what to do" moment show up in the night? Legibly? |

### E. UX and look (score once per week, plus any screen that stands out)

| Code | Criterion | What to look for |
|---|---|---|
| U1 | **Beauty** | Does it look like a crafted story game, with a coherent palette, type and mood? Or like a form? |
| U2 | **Legibility** | Text sizes, contrast, line length, the colours for each voice: MYTHIOS, Garrick, friends, your choices. Comfortable on a phone? |
| U3 | **Clarity** | Do you always know what to do next, where you are (week and day), what a button will do, and what changed? |
| U4 | **Consistency** | The same thing looks and is named the same everywhere: buttons, cards, words from the glossary (`docs/canon/mythios-glossary-proposal.md`). |
| U5 | **Feedback** | Rolls, gold, growth, clues gained and the fire's events: are they shown clearly and satisfyingly? |
| U6 | **Navigation** | The four tabs, the party panel, the Bag and the Record: easy to find things, and back again? |
| U7 | **Friction** | Sign-in, Session Zero, waiting, errors, reloads. Anything slow, confusing or broken? |

### F. The season as a whole (once, at the end)

| Code | Criterion |
|---|---|
| F1 | The season's arc: build-up across six weeks, the middle, the finale. |
| F2 | The secret: is it fair? On reading Garrick's Recap after the finale, does the player feel "it was all there"? Count the clues you could have caught. |
| F3 | The habit: would friends open it every day for six weeks? What keeps them, and what loses them? |
| F4 | Replay and talk: would friends talk about it outside the game? Would they recommend it? |
| F5 | Party sizes: does it work as well for two as for six? |
| F6 | The original critique: is it still "a series of *what's next* buttons"? Answer directly, with evidence. |

### The score sheet (one row per day)

For each weekday:

| Day | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | M1 | M2 | M3 | M4 | M5 | M6 | M7 | Mech avg | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Fire avg | Overall | One line: best / worst |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W1D1 | | | | | | | | | | | | | | | | | | | | | | | | | | |

For each Gathering (W1D7, W2D7 … W6D7):

| Gathering | S1 | S2 | S3 | S4 | S5 | S6 | S7 | Story avg | G1 | G2 | G3 | G4 | G5 | G6 | G7 | Gathering avg | Overall | One line: best / worst |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

For each week, give U1 to U7 as a row of their own.

**Overall** is your judgement of the day as a player, not an average. If it differs from the averages by more than 2, say why.

### G. Text written by the builder since the storybook pass (check each closely as you meet it)

The season's story was rewritten and approved by the designer, week by week, in the storybook voice. Since then the builder, an AI, has written new text into it, and the designer has not yet read all of it. Treat every piece below as a draft, and judge it harder than the rest:

| Where | What was added | Find it in |
|---|---|---|
| 12 weekdays: W1D1, D2, D3, D6; W2D1, D2, D6; W3D2, D3, D6; W5D4; W6D3 | **Lead-ins**: one sentence that leads from the notice lines into the Challenge card | `LEAD_INS` in `scripts/gen-chapter-scripts.cjs` |
| Weeks 1 to 6, most weekdays | **Roads**: a two-way choice before a Challenge, its two short passages, the "what this changed" line after it, the clue each road gives the fire (`roadFind`, and the shorter `lost` text after a failed roll), and the "**One harder.**" line on a later card that pays it off | the episode files' designer's notes marked "Phase 3" or "25 Oct", and `FORK_BRANCH_META` in `scripts/gen-chapter-scripts.cjs` |
| W4D5, W5D6 (25 Oct) | The newest roads: row or drift in the fog; go low or walk like a watchman on the wall | `docs/canon/episode-4-the-water-stone.md`, `episode-5-the-kings-stone.md` |
| Gatherings 1 to 6 | **"The six, read together"** before each reveal; **"One breath"**, the "tell them what to do" moment, and its later echo; **Strike or Cover** in the Battle; the shortened Ask boards; the three new endings (Gathering 2's pick, Gathering 3's question, Week 6 Day 1's chalk) | the Day 7 sections of the episode files; `docs/design/gathering1-act-draft-25oct.md`, `gatherings2to5-moments-draft-25oct.md`, `phase4-decisions-25oct.md` |
| The finale | `[CLOSE YOUR HAND]`, the "What you carried in." card, "A single breath", the last lines | `docs/design/phase6-finale-draft-25oct.md` |
| The fire | Garrick's three hosting lines: to a quiet friend, on an unanswered piece, and when the fire splits | `docs/design/garrick-fire-host-lines-draft-25oct.md` |

For each piece, check:

1. **The voice.** Does it read like the approved text around it (`docs/style/storybook-voice.md`)? Watch for:
   - a sentence that is flatter, more modern, more explaining or more padded than its neighbours;
   - brackets in prose; American spelling;
   - game words inside the story ("season", "Challenge", "roll").
2. **The seam.** Read it with the passage before and after it. Does it join without a bump in tense, place, time of day or who is present? Does it repeat something just said, or contradict it?
3. **For a road, a real trade.**
   - Does each option have a reason to pick it?
   - Can the player guess what each one risks and what it might give, without being told the answer?
   - Is either road plainly the best? If so, say which, and why.
   - Does each road leave something of its own?
4. **For a road, a legible payoff.**
   - When the "**One harder.**" line or the clue comes back, does it name its cause clearly enough for an "aha, that's because I…"?
   - Does the clue each road gives the fire make sense to a friend who was not there?
5. **The canon.**
   - No invented lore: no new people, places, history or powers that the episode files do not hold.
   - No word used before its first-use gate (CLAUDE.md §6: "the Order" from W3D1; "four children" from W2D1; "king" from W2D5; "fifth / five" from W3D3; "moon-blood" from W4D4; "Highwall" from W5D1; "heartbeat" from W4D6).
   - No contradiction with an earlier or later day.
6. **Garrick.**
   - His lines must be true, warm, dry and kind.
   - He never promises, predicts, denies knowing, mocks, or doubts falsely.
   - He uses none of the banned phrases ("maybe", "perhaps", "possibly", "I don't know", "I've never", "I've heard", "I wouldn't know", "I couldn't say").
   - At the fire he hosts the talk and never says which theory is right.
7. **The tone before a risk.** No line before a roll or a choice may reassure the player ("you can't lose") or give the result away.
8. **Real friends' names.** In this game the friends' names stand for the real players, so a line must not give a named friend "he" or "she".

**In the report, add a section "The builder's new text".** Give one row per piece: where it is, a score from 1 to 10, and the problem if there is one, with a better line where you can offer one. Then name the five weakest pieces.

---

## Stage 7: after the finale (stop afterwards)

Only now, open:
- `docs/playthrough/after-the-finale.md`;
- `docs/canon/garrick-deception-table.md`;
- `docs/canon/mythios-season-reveal-map.md`.

Then:
1. **Garrick's lines, re-read:** for each of his lines you remember, did the hidden meaning land as a fair "aha"? List the five best and the five that are too hidden or too obvious.
2. **The open-threads ledger, closed:** every thread from your ledger, and whether it was paid off, paid off legibly, or dropped. Count each kind.
3. **F1 to F6** scores, with reasons.

Then stop and ask to go on.

## Stage 8: compare with earlier audits (stop afterwards)

Now read `docs/design/full-game-audit-23oct.md`, `docs/design/gameplay-quality-17oct.md` and any report in `docs/audits/`. Say where you agree, where you disagree, and what has improved or got worse since they were written.

---

## Part 4: the report

Write **`docs/audits/play-and-score-<YYYY-MM-DD>.md`**, in plain words, in this order:

1. **The verdict, in ten lines:** is it still "a series of *what's next* buttons"? What is the game's single biggest strength, and its single biggest weakness?
2. **The score sheet:** all 36 weekday rows, the 6 Gathering rows, the 6 UX rows, and F1 to F6. Then the season averages for each criterion, and the five best and five worst days by Overall.
3. **The ten changes that would most raise the scores,** in order. For each give:
   - what to change;
   - where (day and screen, or file);
   - which scores it raises and by roughly how much;
   - whether it is story text, a rule or number change, or a screen change. The designer approves story and numbers himself.
4. **The open-threads ledger,** closed.
5. **"What's next" stretches:** the worst ten, ranked.
6. **The Campfire in particular:** did it give organic play? What happens at a quiet fire? What Garrick does and does not do to start talk, and what he should do.
7. **The builder's new text** (Part 3, G): one row per piece, with its score and any problem, then the five weakest pieces.
8. **Bugs and slips:** each with the screen, what happened, and the screenshot name, ranked by how much a player would mind.
9. **What you could not judge,** and why.

Do not soften the scores in the report. Then tell the designer, in five plain lines, where the report is and what it says.
