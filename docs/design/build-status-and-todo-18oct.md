# Build status and what is left (18 Oct 2026)

Compiled for Fake Guru. Written from what is in the repository, the review of phases A and B, and the decisions in
`docs/design/one-thread-18oct.md`, `redesign-18oct.md`, `disguised-forks-draft-18oct.md` and
`campfire-week1-content-18oct.md`.

## 1. Where things stand

| Thing | State |
|---|---|
| Safari zoom fix, repeated Pull removed, Garrick not answering before he is met (migration `0094`) | **Live** (PR #55, #56 merged; `0094` applied and checked) |
| "Look at both" shows one action at a time | **Live** (PR #56) |
| Phase A: the game shell (STORY · RECORD · BAG · STORE, party panel, no party page) | **Merged and on the website (18 Oct, with the fixes below)** |
| Phase B: the fire as one chat inside STORY | **Merged and on the website (18 Oct)** |
| Garrick function change for phase B (`atFire`) | **Deployed, version 7 (18 Oct)**; it still trusts a client flag, see 2.3 |
| Fixed after the review (18 Oct) | The Day 7 chat (2.1) and Garrick's morning line / time comparison (2.2). Everything else in section 2 is still open |
| Independent review of phases A and B | Done. 35 problems reported; 13 double-checked (11 real); 22 not double-checked because the session limit ran out |
| Phases C, D, E | Not started |

The website shows phases A and B from 18 Oct. The remaining items in section 2 are still open; the next session's full prompt is `next-build-prompt-18oct.md`.

## 2. Phase A and B: to fix before they go on the website

From the review. Items 1 to 9 matter most.

1. **Day 7 has no chat.** The shell mounts the Gathering without the user and members, so the table-talk chat on the
   Gathering screen is gone. (`GameShell.tsx:146`; confirmed.)
2. **Garrick's morning line never shows at the fire, and is filed under "Last night".** It is stamped exactly at the
   5:00am boundary; the fire compares times as text in two different formats. Compare real times. (`OnlineCampfire.tsx`
   :396, `FireChat.tsx`:296; confirmed.)
3. **Garrick's fire rule rests on a flag the phone sends.** `atFire` is sent by the client, and replies are shared with
   the whole party, so a reply made under the daytime rules (AI small talk, the once-only "Malakor" line) can appear in
   the fire. The server must decide, and the fire must show only fire-safe replies. (`handler.ts`:154; `FireChat.tsx`
   :313.)
4. **A friend who has not finished the day can ask Garrick but never sees his answer** (his reply has no author, so
   the earlier-fire filter drops it). (`FireChat.tsx`:296; confirmed.)
5. **Opening the app on Day 7 counts the friend as at the Gathering** (the Gathering is mounted at once and its two
   second tick registers presence), which breaks the "missed it" rules. Presence must start only when the friend steps
   in. (`GameShell.tsx`:146.)
6. **Today's fire talk is hidden from an unfinished friend only on screen.** The chat table has no per-day rule, so a
   member could read it through the data connection. Enforce on the server. (`FireChat.tsx`:296.)
7. **The story does not refresh at the 5:00am rollover** or after a failed first load; it reloads only when the STORY
   tab is tapped again. (`GameShell.tsx`:68.)
8. **Scrolling.** A tab switch always scrolls to the top (even back to STORY); new chat messages, including your own,
   sit under the sticky box; the "+" tray has no maximum height on a small phone. (`GameShell.tsx`:70,
   `FireChat.tsx`:214, 240.)
9. **Duplicate lines:** "finished the day" and "found a word" notices appear both as chat notices and as the fire's
   own lines. (`OnlineCampfire.tsx`:396.)
10. **Tests are weak.** Several new checks only print true or false and never fail the run; the "names hidden before
    you pick" check can never fail (`campfire.cjs`:96); `party-chat.cjs` is out of date and the README still lists it;
    the store check that passed 2 of 3 runs is a timing problem in the test, not in the game. Make every check assert.
11. **Smaller items:**
    - a late joiner playing Week 1 Day 1 sees the chat and Garrick before meeting him (`GameShell.tsx`:165);
    - gold and gear on the top bar and the Record do not update after a purchase or reward (`GameShell.tsx`:204);
    - the party panel's Gathering button does nothing on Day 7 (`OnlineApp.tsx`:733);
    - an error line stays on screen after a later success; a slow reply can overwrite a newer one
      (`OnlineCampfire.tsx`:149, 159);
    - a failed chat load wipes the chat (`FireChat.tsx`:33);
    - "Last night" loads late and shifts the screen about 109px (`GameShell.tsx`:125);
    - friends' names and party promises show on a solitary (narrated) night (`OnlineCampfire.tsx`:408);
    - later events are placed at your arrival time, not when they happened; Garrick's noticing and nudge lines can
      change after they have been read (`OnlineCampfire.tsx`:402, 413).
12. **The 22 findings that were not double-checked have now been checked (18 Oct): 35 findings in all, 29 confirmed,
    6 refuted.** Fixed since: the Day 7 chat and the real-time comparison. Refuted or narrowed: the late-joiner chat,
    the store-test timing (not from this diff), and the string-compare and Day 7 chat findings once fixed. Today's
    talk readable through the data connection is true but was already so before this work (item 6 stays as hardening).

## 3. Phase A and B: left undone by the builds

- The Bag's **The Dark Moon Verses** and **Found Along the Road** shelves are placeholders.
- Relics still sit in the Store, not the Bag.
- The Record tab shows only the six skills, weapon and armour (the full Record is phase D).
- **Week 1 nights have no tonight's-question text and no clicks in the game data**, so the pinned question shows only
  the A / B / neither readings. The data build is in phase E.
- "Word found" lines have no real times; they sit just after your arrival.
- A new line for a solitary night ("You sit alone tonight. The others are on roads of their own.") needs Fake Guru's
  approval.
- `gathering.cjs` and `notifications.cjs` were updated for the shell but not run.

## 4. To go live (after section 2)

1. Fix, test and re-run the review.
2. Apply any new migration to the local copy, then live (additive only, checked by md5).
3. Redeploy the Garrick function (all four files: `index.ts`, `handler.ts`, `garrickRouter.ts`, `garrickPrompt.ts`).
4. Online-only build, leak grep (no Malakor, descendant, bearsOnFork, trueMeaning).
5. Pull request, merge, check the website after it updates.
6. Give Fake Guru the steps to play the fire alone: `tests/online/fire-friends.cjs` as a pretend friend (it needs the
   test accounts' passwords; make the live run configurable).

## 5. Phase C: how reading feels

1. Story messages arrive one at a time with a typing dot; tap to read faster; the screen stays at the last read; text
   aligned to the top, paragraph by paragraph.
2. The colour key: story white, one serif, no italics for ordinary story; how-to lines in a gold strip; Garrick amber
   with his name; friends in bubbles with names; your own choices on the right; the Notice as a blue card.
3. Text one size up (story 18px, other 16px), everywhere.
4. The fight card: both sides' numbers in colour (Weapon gold, Armour blue, Defence orange, Attack purple), "You hit on
   9+ / He hits on 13+", round lines in colour.
5. The end-of-day card: three coloured results (gold, growth, fragment), what you learned, what you carry, tomorrow.
   Use words different from the Bag's shelves.
6. The "…" lead-in at the end of the narration before every Challenge, fight or roll card (check all 36 days).
7. The Notice: an easy roll on your strongest skill (a Novice succeeds on 4 or more, DC 3); pass shows your line (a
   second sentence from Apprentice); fail "Nothing catches your eye."; a Novice sees "A more practised eye would see
   more here."; pays nothing; a first-time explanation; the skill named on the card; it can be laid on the fire.
8. The "what this changed" line after a fork choice (decided yes).
9. Party panel and top bar polish; the cover page (one screen, Tales of the Dark Moon as the featured series).
10. Choice rule everywhere: two options shown together are a choice and the other closes; single action buttons are
    replaced under the rule in section 7 (Strike the page keeps its button).

## 6. Phase D: the Record and the chase

Spec: Core Rules "The Record" (12 numbers, 12 badges) and the stats document Fake Guru pasted (not yet in the repo).

1. The Record screen online: banner, six skills with next-step, gear, twelve numbers (crowns where you lead), twelve
   badges (grey until earned, tap to see what earns them and your progress).
2. Server side: counting the twelve numbers and the badges.
3. Big moments in the chat only: a natural 20, a badge earned, a crown taken, a new level reached.
4. A lost crown is told privately as a chase, never named in public; one near-miss line at most on the day card;
   a first-time line on why the Record matters.
5. "The Party, Yesterday" card after the recap each morning (good news only, up to five lines); the Week's Best in the
   Gathering lobby; Season Titles at the end.
6. Update Core Rules and the glossary to match (ticker and MINE/PARTY switch retire; the "fastest fight / closest
   call" party best is dropped).
7. Fix the stats document's four wording slips (Sunday, check/obstacle, quiz, stone charms) once Fake Guru says yes.

## 7. Phase E: content

1. **Forks as readable trades** (a trade shown in the words, a fit for your skills, or who you are; never hidden luck;
   no +2 / -2; before a Challenge the fork picks which of the two skills you roll). Redraft Week 1's 7 forks, then the
   other weeks, for Fake Guru to read first.
2. **A Relic as the occasional reward** for reading a fork well: at most one road a week, on the road a careful reader
   would take; the other road still gets its own clue; no gold found.
3. **Disguised forks replace single buttons.** Week 1 Day 1's sample is drafted in `disguised-forks-draft-18oct.md`
   (both roads reach both finds, each with a detail of its own). Sort all 77 single buttons: questions and talk (13)
   become forks; fragment taking (about 36), Day 6 laying out (6) and the rest become story with no button; Strike
   the page (5) keeps its button.
4. **The fire's data.** Load Week 1's questions, read-backs, clicks, leads and Garrick nudges into the game
   (`campfire_days`), with the Days 5 and 6 first answers at Gathering 1; the fragment card's meaning questions; drop
   the riddle parts.
5. **Weeks 2 to 6 fire content**, each question checked against Fake Guru's rule: no filler, a payoff within the week,
   every night we know a bit more.
6. The Bag: fill the Verses and Found Along the Road shelves.

## 8. Rules now in force (decided 18 Oct)

- The game is one thread from morning to the fire; tabs STORY, RECORD, BAG, STORE; no party tab (a panel from the
  party name).
- The fire opens only after your day's chapter is finished; no "quiet word with Garrick"; no riddle, open question or
  message in a bottle; "the case so far" lives in the Journal and the Gathering opening.
- The Bag's shelves: The Seeker Chest, The Dark Moon Verses, Found Along the Road, The Journal ("Nights by the fire",
  "Your margin notes").
- No "week so far" page: every day opens with the recap.
- Chat announcements: big moments only.

## 9. Waiting on Fake Guru

1. "Go" on section 2 (fix, then put phases A and B on the website).
2. The four wording fixes in the stats document: yes or no.
3. Approval of the new solitary-night line.
4. Google sign-in setup (steps in the 16 Oct chat).
5. Terms and privacy before any public launch.
6. Deleting the test accounts before launch (`@mythios.test`, `claude-test@`, `claude-test2@` and the party
   "Claude Garrick test").
