# EVERYTHING TO DO: the full handoff in one file (18 Oct 2026)

This file joins five documents so one download holds the whole picture: what is done, what is left, the Campfire redesign, and the audit report of that redesign. The separate prompt for an *auditing* AI is a different file: `docs/design/audit-prompt-for-another-ai-18oct.md`.

## Contents

1. A. The ordered list of pieces and their status (handoff ledger)
2. B. The full brief for the builder (fixes, phases C, D, E, going live)
3. C. The Campfire redesign: the plan, every piece of the old fire and where it goes, the chase, and the decisions locked with Fake Guru
4. D. Build status (what is live, what the builds left undone)
5. E. The audit report of the redesign (phases A and B): all 35 findings with the skeptics' checks

---



# PART A. The ordered list of pieces and their status (handoff ledger)

*(source file: `docs/design/handoff-ledger.md`)*

# Handoff ledger: the build in small pieces (started 18 Oct 2026)

**Why this file exists.** Fake Guru asked for the work to be done in small pieces, each merged to the website as it is
finished, so that if the session that is building runs out of room, Google AI Studio (or any other session) can
`git pull` and carry on from exactly here. **Update this file in every piece, in the same commit.** It is the single
place that says what is done and what is next.

## How to carry on (read this if you are the next builder)

1. `git pull` (the branch the piece lives on is merged to `main` when finished; `main` is what the website builds).
2. Read `CLAUDE.md` (rules, canon, secret), then `docs/design/next-build-prompt-18oct.md` (the full brief) and this
   ledger. The design record is `docs/design/one-thread-18oct.md`.
3. Take the **first row below whose status is TODO or IN PROGRESS** and do only that piece.
4. Test it: `npm run lint`, `npm run build`, the online-only build and leak grep (no `Malakor|descendant|bearsOnFork|
   qaNote|trueMeaning` in the output), and the browser tests in `tests/online/` that the piece touches
   (`tests/README.md`; local copy of the server; never the live database for tests).
5. Server changes: a new numbered migration in `supabase/migrations/` (next number after the highest one), additive
   only, security definer, `set search_path = ''`; apply it to the local copy first, then to the live project with the
   Supabase tool `apply_migration` (project id `toqeuurdsyeifhpecagr`); compare each function with `md5(prosrc)`.
   The Garrick Edge Function is redeployed with all four files.
6. Commit with a message that says exactly what was done. Merge to `main`. Set the row to DONE with the commit or
   pull request number and the date, add anything you found to the "Found on the way" list, and merge that too.
7. Tell Fake Guru in plain words what changed, and end with a numbered list of what he must do next.

If a piece turns out bigger than expected, split it into two rows here before starting; never leave a half-done piece
on `main`.

## Pieces (in order)

Status: TODO, IN PROGRESS, DONE, BLOCKED (say why).

| # | Piece | Status | Done in |
|---|---|---|---|
| 0 | This ledger and the auditor prompt (`audit-prompt-for-another-ai-18oct.md`) | DONE | 18 Oct (the pull request that adds them) |
| 1 | **Day 7 presence.** Do not mount the live Gathering until the friend taps to join (before that, a card with the time and "Join the Gathering"); fix the party panel's Gathering button. | DONE | 18 Oct (PR for piece 1). The Gathering is mounted only after a join tap (`GameShell.tsx`, `joined`); `tests/online/gathering.cjs` asserts no tick before joining and ticks after; the panel button joins and closes the panel. |
| 2 | **Story refresh.** Reload today at the 5:00am rollover, on a failed first load, and when the app returns to the foreground. | DONE | 18 Oct (PR for piece 2). `GameShell.tsx` reloads the story at the party's 5:00am (timer) and when the app returns to the front on a new day; `OnlineDay.tsx` retries a failed first load every 8 seconds and offers Try again; `tests/online/refresh.cjs` tests all three. |
| 3 | **Scrolling.** Tab switches keep each tab's scroll; new chat messages (yours too) scroll into view above the composer; the "+" tray gets a maximum height and scrolls. | IN PROGRESS | Code written on branch `ccr-a7850714-ouedaq`, NOT merged and NOT tested yet: `GameShell.tsx` keeps each tab's scroll; `FireChat.tsx` has `useKeepNewInView` and a max height on the tray; `OnlineCampfire.tsx` uses it. `tests/online/scroll.cjs` is written (tab keeps its place, own message follows to the foot, a friend's line does not move you while you read, tray max height) but has NOT been run. Still to do: run it on the local copy (play a day first with `play-today.cjs`, then `scroll.cjs`), fix what fails, then merge. |
| 4 | **Fire stream correctness.** Each notice once (no duplicates of "finished the day" / "found a word"); events placed at when they happened, not at your arrival; Garrick's noticing and nudge lines stable once read; no friends' names or party promises on a solitary night. | TODO | |
| 5 | **Errors and refresh.** Clear an error after a later success; ignore a slow reply that arrives after a newer one; a failed chat load must not empty the chat; reserve space for "Last night" so the screen does not jump; the top-bar gold and Record gear refresh after a purchase or reward. | TODO | |
| 6 | **Garrick at the fire, decided by the server** (migration + function): the server decides "at the fire" (the friend has finished the day), marks each Garrick reply with where it was said, the fire shows only fire-safe replies; stored lines only; never "Malakor" there; remove the client flag. A friend who has not finished the day sees Garrick's reply to their own question. | TODO | |
| 7 | **Spoiler hardening on the server** (migration): a friend who has not finished today's chapter cannot read today's fire talk through the data connection (a read function; close direct reads of those rows). | TODO | |
| 8 | **Tests that assert.** Every check fails the run when false (`campfire.cjs`, `store-and-relics.cjs`, `gathering.cjs`); the "names hidden before you pick" check can fail; replace or retire `party-chat.cjs`; wait on state, not fixed sleeps; run all tests. | TODO | |
| 9 | **Re-run the independent review** (workflow `review-phase-ab`, or the auditor prompt) over the finished pieces 1 to 8. | TODO | |
| C1 | Text sizes (story 18px, other 16px) and the voice key (colour for MYTHIOS, Garrick, friends, your choices, the Notice). | TODO | |
| C2 | Story arrives message by message with a typing indicator; tap to read faster; keep the last-read place; no cut-off text at the top. | TODO | |
| C3 | The fight card: both sides' numbers in colour, "You hit on N+ / He hits on M+". | TODO | |
| C4 | The end-of-day card (three coloured results, learned, carry, tomorrow) with one button to the fire; no repeated Pull. | TODO | |
| C5 | The "…" lead-in before every Challenge, fight and roll card (all 36 days, through the generator, not by hand). | TODO | |
| C6 | The Notice roll (server function, DC 3), pass/fail lines, first-time card, skill label, "Lay it on the table" at the fire. | TODO | |
| C7 | The cover page (one screen). | TODO | |
| C8 | Party panel polish (friend rows with status, Remove behind a menu, one notification button). | TODO | |
| C9 | The "what this changed" line slot after a fork (wording now, data in E). | TODO | |
| D1 | The Record screen online (banner, Attributes with next step, gear, twelve numbers, twelve badges, tap explanations). | TODO | |
| D2 | Server counting of the twelve numbers and the badges (migration). | TODO | |
| D3 | Big moments in the chat (natural 20, badge, crown taken, new level); the lost crown told privately; the near-miss line; the first-time Record card. | TODO | |
| D4 | "The Party, Yesterday", the Week's Best at the Gathering lobby, Season Titles. | TODO | |
| E1 | Load Week 1's fire data (questions, read-backs, new leads, clicks, Garrick nudges, the narrated Fenmark night; Days 5 and 6 first answers at Gathering 1). | TODO | |
| E2 | Week 1's 7 forks drafted as readable trades (for Fake Guru to read first), then built. | TODO | |
| E3 | Week 1 Day 1 as a disguised fork; the 77 single buttons sorted and built (Fake Guru approves the writing first). | TODO | |
| E4 | Weeks 2 to 6 fire content, one week at a time, each approved first. | TODO | |
| E5 | The Bag's Verses and Found Along the Road shelves; Relics into the Bag. | TODO | |

## Found on the way

(Add anything you find while working a piece: what, where, and which piece it belongs to.)

## Needs Fake Guru (remind him, simply)

Google sign-in setup; terms and privacy before launch; deleting the test accounts before launch; the four wording fixes
in the stats document (Sunday, check/obstacle, quiz, stone charms); approval of the solitary-night line ("You sit alone
tonight. The others are on roads of their own."); reading and approving each week's drafts in E.



# PART B. The full brief for the builder (fixes, phases C, D, E, going live)

*(source file: `docs/design/next-build-prompt-18oct.md`)*

# Prompt for the next build session (written 18 Oct 2026)

Copy everything below the line into a new Claude Code session on the repo `fakeguru69/Mythios`. It is self-contained:
it says where things stand, what to fix first, and then the phases in order, each with what "done" means.

---

## Who you work for, and how

You work for **Fake Guru**, the designer of **Tales of the Dark Moon** (the first series of the app Mythios). He is in
Singapore (UTC+8). He designs and does not write code. Read `CLAUDE.md` first: its section 1 rules bind every reply
(plain words; end every reply with a numbered list of exactly what he must do next; remind him of anything you are
waiting on; say plainly whether a flagged mistake was real and how it was fixed; when you fix one instance fix every
instance; update everything connected; never claim something is done unless you verified it in the code; storybook
voice, no brackets in prose; Garrick is likeable). Never invent numbers (ask). Never change story text, Garrick lines,
fragments or Campfire lines without his say-so. Never show the secret (Malakor, descendant, `bearsOnFork`,
`trueMeaning`, Deception Table meanings) to a player or to the public website bundle.

Work on the branch the session gives you; never push to `main`; open a pull request only when he asks. Every pull
request: run `npm run lint`, `npm run build`, and the online-only build
(`VITE_ONLINE_ONLY=1 npx vite build --outDir <somewhere>`) and grep its output for `Malakor|descendant|bearsOnFork|
trueMeaning`; there must be none.

The server is Supabase project `toqeuurdsyeifhpecagr`. Changes are new numbered files in `supabase/migrations/`
(next number after `0094`), additive only (new functions, `create or replace`, grants; never drop or delete), applied
with the Supabase tool `apply_migration`, security definer, `set search_path = ''`. Test on the local copy first
(`tests/README.md`, "A local copy of the server": local Postgres on port 5544, stand-in on 54321, local Garrick on
54322, Vite on 3000; scratch `start.sh`). Then compare each live function with the local one by `md5(prosrc)`. Players
never write to tables directly. The Garrick function (`supabase/functions/garrick`) is redeployed with all four files
(`index.ts`, `handler.ts`, `garrickRouter.ts`, `garrickPrompt.ts`); after changing `src/data/garrickRouter.ts` or
`garrickPrompt.ts` run `node scripts/sync-garrick-function.cjs` first.

Fake Guru's test accounts on the live project: `host@mythios.test` and `mei@mythios.test` (password set by him; ask
him), party "Lantern 39209". Before any public launch the test accounts are deleted (listed in `CLAUDE.md` section 9).

## What the game now is (decided 18 Oct; full record in `docs/design/one-thread-18oct.md`, `redesign-18oct.md`)

One thread from morning to the fire. After signing in a friend lands in the game, not on a party page. The game shell
has a top bar (series title; party name with a drop-down arrow and "Week N, Day N"; gold) and four tabs: **STORY ·
RECORD · BAG · STORE**. STORY plays today's chapter; when the day is finished the fire follows below, in the same
scrolling view; on Day 7 STORY holds the Gathering. Tapping the party name opens the party panel (friends, invite,
notifications, the Gathering time and the Day 4 vote, the party clock, your name, leave the party, Your stories). The
fire opens only after the friend has finished the day's chapter. The fire is the party chat: one stream, one composer.
No "A word with Garrick", no riddle, no open question, no message in a bottle. The Bag has four shelves: **The Seeker
Chest**, **The Dark Moon Verses**, **Found Along the Road**, **The Journal** (with "Nights by the fire" and "Your
margin notes"). Never use the day card's words ("You learned", "You hold", "Tomorrow") for shelves.

Choice rule: two options shown together are a choice, and picking one closes the other (never go back to the second).
Forks may rejoin later but must never feel as if the choice did not matter; each path leaves something of its own.

## Where the build stands

On `main` and live: the Safari zoom fix, the repeated Pull removed, Garrick not answering before he is met (migration
`0094`), "look at both" steps offering one action at a time, and (merged with the PR that carries this file) phases A
and B below, the Day 7 chat fix and the timestamp fix, plus the Garrick function redeployed (version 7).

- **Phase A, the shell** (`src/online/GameShell.tsx`): built, tested locally, merged.
- **Phase B, the fire as one chat** (`OnlineCampfire.tsx`, `FireChat.tsx`, `LastNight.tsx`): built, tested locally,
  merged. Test helper for a busy fire: `tests/online/fire-friends.cjs` (pretend friend; configurable by environment).
- **Known problems in A and B** (from an independent review; 11 of 13 double-checked findings were real, 22 findings
  were not double-checked). Section 1 below lists what is still to fix.
- Phases C, D, E not started.

The full status list is in `docs/design/build-status-and-todo-18oct.md`.

---

## Section 1. First: fix what the review found (do this before phase C)

Do these in order. For each: write a test that fails before the fix and passes after, on the local copy.

1. **Garrick at the fire must be decided by the server.** Today `handler.ts` trusts a client flag `atFire`, and a
   reply made under the daytime rules (AI small talk, the once-only "Malakor" line) can appear in the fire stream.
   Decide on the server whether a message is "at the fire" (the friend has finished today's chapter and the party's
   fire is open: reuse `my_fire_day` / `fan_outs`), and mark each Garrick reply row with where it was said so the fire
   stream shows only fire-safe replies. Stored lines only at the fire; never "Malakor" there. Remove the client flag
   (or ignore it). Add a migration if a column or function is needed.
2. **Spoiler rule on the server.** An unfinished friend must not be able to read today's fire talk (messages after the
   5:00am day start from friends who have finished the day), even through the data connection. Make `party_messages`
   reads respect it (a security-definer read function used by the fire and the earlier-fire view, with the table's
   read access closed for those rows), or an equivalent server-side rule. Keep the earlier-fire view working.
3. **A friend who has not finished the day can ask Garrick but does not see his reply** (his reply has no author, so
   the earlier-fire filter drops it). Show Garrick's replies to that friend's own questions.
4. **Presence at the Gathering.** Opening the app on Day 7 must not count the friend as present. Do not mount the
   live Gathering (its two-second tick registers presence) until the friend taps to join; before that show a card
   ("The Gathering begins at 8:00pm" / "Join the Gathering"). The party panel's Gathering button must do something.
5. **The story must refresh at the 5:00am rollover** and after a failed first load (a timer and a visibility check),
   not only when the STORY tab is tapped again.
6. **Scrolling.** A tab switch must not jump to the top (keep each tab's scroll); new chat messages, including your
   own, scroll into view above the composer; the "+" tray gets a maximum height and scrolls.
7. **Duplicate lines.** "Finished the day" and "found a word" notices appear as chat notices and as the fire's own
   lines; show each once.
8. **Smaller items** (each with its file and line in `build-status-and-todo-18oct.md` section 2.11): a late joiner on
   Week 1 Day 1 sees the chat and Garrick before meeting him; gold and gear on the top bar and Record do not update
   after a purchase; an error line stays after a later success; a slow reply can overwrite a newer one; a failed chat
   load wipes the chat; "Last night" loads late and shifts the screen about 109px (reserve its space); friends' names
   and party promises show on a solitary (narrated) night; later events are placed at your arrival time, not when
   they happened; Garrick's noticing and nudge lines can change after being read (make them stable per night).
9. **Tests must assert.** Several new checks only log true or false and never fail; the "names hidden before you pick"
   check in `campfire.cjs` can never fail; `party-chat.cjs` is stale; the store check "store closed at the card"
   is a timing problem in the test (wait for the state, not fixed sleeps). Make every check fail the run when false.
   Run `gathering.cjs` and `notifications.cjs`, which were updated but not run.
10. **The review was resumed and finished (18 Oct): 35 findings, 29 confirmed, 6 refuted.** Refuted or narrowed: the
    late-joiner chat on Week 1 Day 1 (a friend admitted later never plays Day 1 that way; narrowed to a check, not a
    fix); the "today's talk readable through the data connection" finding (confirmed true but it is not new in this
    diff: `party_messages` read rules were already membership-only, so item 2 above stays as a hardening task); the
    store-test timing (the test file did not change in this diff); the string-compare and Day 7 chat findings
    (fixed on 18 Oct). Everything else confirmed is in items 1 to 9 above. Re-check after fixing.
10b. **Resume the review** (the workflow script
    `~/.claude/projects/.../workflows/scripts/review-phase-ab-wf_5428fb64-c5b.js`, or write a fresh one) over the
    findings that were never double-checked, after the fixes.

Done means: all of the above fixed or explicitly refuted with a reason; lint, build, online build and leak grep clean;
every test in `tests/online/` run and passing; screenshots at 375px of STORY, the fire, BAG, STORE, the party panel,
and Day 7 before and after joining; a short report.

## Section 2. Phase C: how reading feels

Mockup for the look: https://claude.ai/artifact/RTCsCbQerDNsiBSAqbSVEB (nine screens; files are not in the repo;
the numbers below are the spec).

1. **Story arrives message by message.** Each paragraph appears as its own message after a short typing indicator (three
   dots); tapping anywhere shows it at once; the screen scrolls only far enough to show the top of the new message and
   keeps the friend's place (last read) when they leave and return. No text is cut off at the top. Never auto-scroll
   past text the friend has not read.
2. **The voice key.** MYTHIOS telling the story: one serif, 18px, white, no italics, no side bar. How-to lines: a small
   gold "HOW IT WORKS" strip. Garrick: a warm amber bubble with his name. Friends: bubbles with names. Your own
   choice: your bubble on the right ("You look where he stood."). The Notice: a blue card. Tomorrow: a gold label.
3. **Text sizes.** Story 18px, all other text 16px (one size up from today), text boxes 16px (iPhone Safari zoom).
4. **The fight card.** Both sides' numbers in colour, as the old demo: Weapon gold, Armour blue, Defence orange, Attack
   purple; show "You hit on N+ / He hits on M+" (X = DC + 1 minus bonus, clamped 2 to 20, as the Challenge card does);
   round lines in colour. The foe's stats stay shown like Defence and Attack, not hidden.
5. **The end-of-day card.** Three coloured results (gold, growth, fragment), then what you learned, what you carry, and
   tomorrow. Do not reuse these words for Bag shelves. One button to the fire: "One more look" or "Sit by the fire".
   Make sure the last paragraph (the Pull) is not repeated after it.
6. **The "…" lead-in.** The narration before every Challenge, fight or roll card ends on a lead-in "…" line, so the card
   feels like the next beat. Check all 36 days; add the lead-in where the generated chapter text lacks it by changing the
   generator or the card, not by hand-editing generated files. Do not change story text without asking.
7. **The Notice.** One a day, six versions (one per Attribute). The friend sees their strongest Attribute's version
   after an easy roll: d20 + tier bonus against DC 3 (a Novice, bonus 0, succeeds on 4 or more). Pass: the line (a second
   sentence from Apprentice, 26 points). Fail: "Nothing catches your eye." A Novice who passes also sees "A more
   practised eye would see more here." Pays no gold; no growth. A first-time card explains it once ("Each day you
   notice one thing others may miss…"); the card names the skill ("Charm, your best"); at the fire a button "Lay it on
   the table" turns it into a piece the friend can lay. The server rolls it (add a function; never roll on the phone).
8. **"What this changed."** After a real fork choice, one short line shows the effect of the choice (what you now have
   or what the story now remembers). Needs the fork data of phase E; build the slot and wording now.
9. **Single action buttons.** Replace per the sort in phase E item 3. "Strike the page" (Week 6) keeps its button.
10. **The cover page.** One screen (no scrolling at iPhone 13 mini size): MYTHIOS, one line on what it is (a story told
    a little each day to you and your friends), Tales of the Dark Moon as a featured series with a hook, "Season 1",
    "6 weeks", "2 to 6 friends", and two buttons ("Gather your friends", "Already playing? Sign in"). Do not explain
    the days.
11. **Party panel polish.** "TestMei - ready" style lines become friend rows with an avatar letter, class, and a status
    ("At the fire", "Reading Day 2"); Remove sits behind the row's menu; the notification button is one button that
    disappears once on (shown highlighted while not on).

Done means: each of the above shown in a 375px screenshot against the mockup; a test per behaviour (the Notice roll on
the server with fixed dice; the lead-in on every day; the typing indicator and tap-to-skip); text sizes checked with
computed styles; no horizontal scroll at 375px; lint, builds and leak grep clean.

## Section 3. Phase D: the Record and the chase

Spec: `docs/canon/mythios-core-rules.md` (the Record section; twelve numbers and twelve badges), `docs/canon/
mythios-stats-and-badges-proposal.md`, and the stats document Fake Guru pasted on 18 Oct
(`docs/mythios-stats-page-and-chase-architecture.md`: if it is not in the repo ask him for it). The demo's
`src/components/RecordTabView.tsx` is the visual reference; nothing of the Record exists online yet.

1. **RECORD tab.** Banner (emblem, name, class, series and week), six Attributes as coloured bars with tier, bonus and
   points (next tier shown: "Charm 48: two points from Adept"), gear tiles ("Lv. 2 · Weapon 15"), the twelve numbers on
   one joined slab (four across, three rows, thin dividers, gold number with a crown where you lead the party, heading
   "RECORD" with "3 where you lead the party"), the twelve badges as round medals (earned bright, unearned grey with
   the name; tap any number or badge for a short explanation and your progress).
2. **Server side.** Count the numbers (Days Played, Best Streak, Gatherings Attended, Fragments Solved; Relics Given,
   Times Stepped Up, Fragments Matched, Battles Won; Challenges Cleared, Challenges Pressed On, Enemies Defeated,
   Perfect Rolls (each natural 20 on a Challenge or an attack; damage rolls do not count)) and award the badges
   (First Light, A Whole Week, The Long Road, Sharpened; Open Hand, Lifeline, The Whole Table, A Clean Night; Perfect,
   Never Enough, Many Hands, Down to a Thread). No number records a failure or an absence; none goes down. Badges pay
   no gold. A badge is earned once. "The Whole Table" and "A Clean Night" belong to the whole party. Crowns: a tie
   shares the crown.
3. **Big moments in the chat only** (decided 18 Oct): a natural 20; a badge earned; a crown taken ("Mei took the crown
   for Best Streak."); a new level reached ("Dev's Charm reached Adept."). Never a loss line in public. Never a phone
   notification for these.
4. **The chase, privately.** The friend who lost a crown gets a private nudge only: "Mei leads Best Streak by one. Play
   tomorrow to draw level." At most one near-miss line on the friend's own end-of-day card, only when close ("One more
   day for A Whole Week."). The first time the Record opens, a short card says why it matters (your Attributes are your
   rolls; the rest is the party's memory of who you were this season; at the end each friend is given a title by it).
5. **Morning and ceremony.** "The Party, Yesterday": one card after the recap each morning, good news only, up to five
   lines, never repeating what the friend already saw, none if nothing happened. The Week's Best: one true achievement
   for every friend present, read in the Gathering's waiting room before Beat 1. Season Titles at the end (The Steady
   Feet, The Unbroken, The Open Hand, The Keen Eye, The Bold, The Lucky One).
6. **Update the rules.** Core Rules: the MINE/PARTY switch and the ticker retire (the day and the fire are one thread);
   "Fastest Fight / Closest Call" party bests are dropped; the chat announcements are big moments only. Fix the stats
   document's four wording slips if Fake Guru says yes: "Sunday Gathering" (the Gathering is Day 7, the host picks the
   start day), "landmark obstacle checks" (Challenge), "scripture quiz" (Match), "stone charms" (Relics).

Done means: the Record screenshot at 375px, tap explanations, crowns with a test of a tie; every number counted in a
server test with fake events; each big moment posted once; the private nudge visible only to its friend (test with two
accounts); nothing in the public bundle that spoils the story.

## Section 4. Phase E: content (always draft for Fake Guru to read first)

1. **Forks are readable trades, never hidden luck.** A fork is one of three kinds: a trade the wording shows (what you
   gain, what you risk), a fit (each road suits a different Attribute; a fork before a Challenge picks which of the
   Challenge's two Attributes you roll with), or who you are (no numbers; the story remembers). A fork whose outcome
   cannot be guessed from its words is not allowed. No +2 / -2 on rolls. Every path leaves something of its own (a
   clue only that road finds, carried to the fire) and one short line hides where the paths rejoin. About one fork in
   three carries a stake (who strikes first in a fight, the skill you roll with, a clue missed); some are remembered
   days later by one line. The 23 choices today (4 "look at both", 2 "look at all", 16 real forks, 1 friend-pick) are in
   `src/data/chapterScripts.ts` (steps with `t: 'choice'`; count them by `mode`). Draft Week 1's 7 forks first.
2. **A Relic as the occasional reward for reading a fork well.** At most one road a week hides a Relic (150g value),
   on the road a careful reader would take; the other road still gets its own clue. No gold found (it would move the
   gear curve; `docs/numbers-pass-15oct.md`). Show the Relic through the normal Relic path.
3. **Single action buttons.** The season has 77. Sort them: questions and talk (13) become disguised forks (two
   questions on screen together; both answers still come, in the order your road takes); fragment taking (about 36),
   Day 6 laying out (6) and the rest (about 17) become story with no button, the fragment card saying it is in your
   Chest; "Strike the page" (5, Week 6) keeps its button. The sample for Week 1 Day 1 (both roads reach both finds,
   each with a detail of its own) is in `docs/design/disguised-forks-draft-18oct.md`; get Fake Guru's yes to the
   writing before changing chapters. Text changes go through the episode files and `scripts/gen-chapter-scripts.cjs`
   (never hand-edit `chapterScripts.ts`), then `scripts/gen-chapters-sql.ts`, then load, per `CLAUDE.md`.
4. **The fire's data for Week 1.** Load into `campfire_days` (generator `scripts/gen-campfire-sql.ts 1`) what is drafted
   in `docs/design/campfire-week1-content-18oct.md`: each night's question and its two readings, the read-back points,
   the new leads (No hurry, The thumbed leaf, Past three doors, The worn bar), the clicks (Days 2, 3, 5 and 6), Garrick's
   new nudges and the narrated silence for Fenmark, with the Days 5 and 6 first answers at Gathering 1 (Day 5 at "Whoever
   tied them has tied a great many."; Day 6 at "None of them is yours."). Drop the riddle parts. Keep the fragment card
   with its meaning question (`fragmentMeaningQuestions.ts`). Each night's question must pay off within its week and
   offer a slightly better revelation each day (Fake Guru's rule); do not set a question that is already answered.
5. **Weeks 2 to 6 fire content**, in the same format, one week at a time, each read and approved by Fake Guru before it
   is built in (the same checks: first-use gates, Garrick's rules, the payoff rule).
6. **The Bag shelves.** The Dark Moon Verses (from `src/data/bagVerses.ts`, gated to each Gathering read to its end)
   and Found Along the Road (the things you carry and every clue found; check each clue against the episode files and
   report any not in canon instead of rewriting it). Relics move from the Store to the Bag when it is ready.

Done means: each draft in a doc with the canon line it relies on; first-use gates checked by `tests/data` scripts
(run `tests/data/check-small-party-lines.ts` after any episode-file change); loaded data md5-compared with the local
copy; the Week 1 fire played end to end by two accounts and a pretend friend.

## Section 5. Going live (every phase)

1. Local tests all pass (`tests/online/*.cjs`; make the helper scripts work from a fresh checkout).
2. Migrations applied locally, then live (parts for large data), each function compared by md5; Garrick redeployed with
   all four files when changed.
3. Online-only build and leak grep clean; pull request; merge when Fake Guru says; check the website
   (https://mythios.vercel.app) after Vercel builds.
4. Give Fake Guru plain steps to try it: signing in as `host@` on one phone and `mei@` on another (his test party), the
   pretend friend script for a busy fire, and what to look for.
5. Update `CLAUDE.md` (repo map, current state), `docs/canon/mythios-master-tracker.md` (dated decisions) and
   `docs/design/build-status-and-todo-18oct.md` in the same pass.

## Section 6. Still waiting on Fake Guru (remind him, simply)

Google sign-in setup; terms and privacy before any public launch; deleting the test accounts before launch; his
answer on the four wording fixes in the stats document; his approval of the solitary-night line ("You sit alone
tonight. The others are on roads of their own."); reading and approving each week's drafts in phase E.



# PART C. The Campfire redesign: the plan, every piece of the old fire and where it goes, the chase, and the decisions locked with Fake Guru

*(source file: `docs/design/one-thread-18oct.md`)*

# One thread from morning to the fire: the build plan (18 Oct)

Fake Guru, 18 Oct: "do build new design (pay particular attention on how you fold the complicated campfire into one
chat interface, think like a strong and experienced UX designer)"; "streamline the campfire, but relook what is good
to keep (day recap, day summary) and where to present it"; chat announcements for big moments, "say maybe you took the
crown"; "have we made it in such a way that players will want to chase stats?". Mockup:
https://claude.ai/artifact/RTCsCbQerDNsiBSAqbSVEB. Earlier decisions: `redesign-18oct.md`.

## The principle for the fire

A chat has one job: people talking. Everything else the fire does must either **be a message in that chat** (said
once, at the moment it happens) or **sit behind one button** (the + beside the text box). Nothing is a tab, nothing is
a panel that is always open, and at most one thing is pinned. You arrive, you see who is here and what they found, you
talk, you make your call before dawn. That is the whole fire.

## Every piece of the fire today, and where it goes

| Today (version 3) | Keep? | Where it goes |
|---|---|---|
| The last light (one Fan Out lead, a roll, the clue comes back) | Keep | Before the fire, in the thread: "The light is going" with "One more look" (the leads, as a fork) or "Sit by the fire". |
| Arrival, who is here | Keep | A divider line: "Evening · the fire · Mei and Dev are here". |
| What we did today (one line per friend) | Keep | The first card at the fire: "Around the fire tonight", good news only. |
| Garrick's opener, nudges, "he notices", the cup, his closer | Keep | Messages from Garrick in the chat, at their moment (stored lines only, as now). Narrated nights (no Garrick): MYTHIOS narration messages. |
| Tonight's question (A, B or neither; pin before peek; changes until dawn) | Keep: the night's one main thing | The one pinned strip at the top while at the fire. Tap to choose; after you choose, it shows who chose what. |
| The party's call at dawn ("Last night") | Keep | A message at the top of the next day: "Last night the fire called it: …". |
| The table: pieces laid (Notice lines, pass lines, [PRESS ON] finds, last-light clues) | Keep | Laying a piece posts a card into the chat ("Mei laid down: The thumbed leaf"), with Agree and Doubt under it. Your pieces wait behind the + button. |
| Agree and doubt, "changed sides" | Keep | Reactions under the card; a changed side is a small line in the chat. |
| Clicks (two pieces together show something new) | Keep: the best moment | A gold MYTHIOS message: "Something clicks." and the line. |
| Garrick's card for your next step | Change | Gone as a card. The + button glows when you have a piece not yet laid; the pinned question glows until you choose. |
| Today's fragment and its meaning pin | Change | The fragment stays in the Bag (Seeker Chest). A word found posts one line in the chat ("Mei found a missing word."). The meaning pin is cut: one question a night is enough. |
| The case so far (the week's question) | Move | Top of the Bag's casebook; still read back at the Gathering's opening. |
| The riddle | Cut | The chat does its job. |
| An open question | Cut | The chat is the open question. |
| A message in a bottle | Cut | The chat does its job. |
| Resting for the night, the Pull again | Cut | The thread simply carries on; the next morning opens below. |
| A quiet word with Garrick | Keep | Behind the + button; opens a private sheet; nothing reaches the chat. |
| The casebook and my notebook | Keep | In the Bag. Marking a line stays: long-press any message. |
| The party chat (a separate screen) | Merge | The fire is the party chat. |
| The fire's alerts | Keep | Unchanged. |

## Good things to keep elsewhere

- **The road so far (yesterday's recap, missed days):** opens each new day at the top of the thread, as now.
- **The Party, Yesterday** (canon, good news only, up to five lines): one card after the recap.
- **The day's summary card:** ends each day, in the thread, before "The light is going".
- **The Week's Best** in the Gathering's waiting room; **Season Titles** at the season's end (canon).

## The chase: will players want to chase their numbers?

What canon already has (5 Oct): twelve numbers that only go up, crowns where you lead, twelve badges shown grey until
earned, the Party Yesterday card, the Week's Best, Season Titles. What is missing for the chase:

1. **Big moments in the chat** (decided 18 Oct: big moments only). A natural 20; a badge earned; **a crown taken**
   ("Mei took the crown for Best Streak."); **a new tier** ("Dev's Charm reached Adept."). Never a loss line in public.
2. **The friend who lost a crown hears it privately, as a chase, never as shame:** "Mei leads Best Streak by one. Play
   tomorrow to draw level."
3. **Near misses on your own day card:** at most one line, only when close: "One more day for A Whole Week." "Charm 48:
   two points from Adept."
4. **The Record shows the next step** for every number and badge: how far to the next tier, the next badge, the crown.
5. **Why it matters is said once**, the first time the Record opens: your Attributes are your rolls; the rest is the
   party's memory of who you were this season, and at the end each friend is given a title by it.

Not yet built online: the Record and badges themselves (the demo has them, `RecordTabView.tsx`). Built in phase D.

## The Notice (answer for Fake Guru)

One a day, in the chapter. You see the version for your strongest Attribute; no roll, because it is a gift of your
build, not a test, and it never holds a fact the story needs. From Apprentice it gains a second sentence. At a
Gathering it comes with an optional [LOOK CLOSER] roll. Fixes in phase C: a first-time explanation, the skill named on
the card, and it becomes a piece you can lay on the fire.

## Phases

- **A. The shell.** Four tabs (STORY · RECORD · BAG · STORE); the top bar (series, party, day, gold); the party panel
  from the party name; signing in opens the story; no party page, no "back to the party".
- **B. The fire as chat.** As the table above, below the day in the same thread.
- **C. Reading.** Messages arrive one at a time with a typing dot, the screen stays where you read; the voice key,
  18px story, the colour fight card, the Notice fixes.
- **D. The Record.** Numbers, crowns, badges, the chase lines and the big-moment messages (server).
- **E. Content.** Disguised forks and the single buttons sorted (`disguised-forks-draft-18oct.md`), Week 1 first.

Each phase is tested in a browser against the local server, then merged.

## Locked with Fake Guru (18 Oct, "BUILD")

- **Forks are readable trades, never hidden luck.** Three kinds: a trade the wording shows (what you gain, what you
  risk), a fit (each road suits a different skill: the fork before a Challenge picks which skill you roll), or who you
  are (no numbers; the story remembers). A fork whose outcome cannot be guessed from its words is not allowed. Week 1's
  seven forks are redrafted on this rule (phase E). No +2 / −2.
- **Strike the page** (Week 6's tally) keeps its button.
- **The Notice gets an easy roll** on your strongest skill: a Novice succeeds on 4 or more (DC 3; a higher tier adds
  its bonus as usual). Pass: your line, and from Apprentice its second sentence. Fail: "Nothing catches your eye." A
  Novice also sees "A more practised eye would see more here." Pays nothing. (Phase C.)
- **The fragment's meaning stays**: when the party completes the day's fragment, it posts into the fire chat as a card
  with its meaning question under it. Tonight's question stays the one pinned thing. (Replaces "the meaning pin is cut"
  in the table above.)
- **A quiet word with Garrick is dropped** (too many things). The server keeps it, unused.
- **No "week so far" page**: each day already opens with the recap.
- **The "…" lead-in**: the narration before every Challenge, fight or roll card ends on a "…" lead-in (phase C; every
  day checked).
- **The Bag's four shelves**, named to say what they hold, in the story's voice, and never with the day card's words
  ("You learned", "You hold", "Tomorrow"):
  - **The Seeker Chest**: the fragments.
  - **The Dark Moon Verses**: the cult's scripture, a passage after each Gathering.
  - **Found Along the Road**: the things you carry and every clue found.
  - **The Journal**: "Nights by the fire" (the party's nights: the question, what was laid, what clicked, the call)
    and "Your margin notes" (lines you marked, with your notes; private).
- **Testing the fire**: a test party with pretend friends, moved by a script, so one person can play a busy fire.
- **The chase list: yes** (Fake Guru: "think what works effectively"). Built in phase D as written above: big moments
  in the chat (a natural 20, a badge, a crown taken, a new tier), the lost crown told privately as a chase, one
  near-miss line at most on your day card, the next step shown on the Record.
- **A fork read well can pay a Relic** (Fake Guru: "yes to reward since fork is due to discernment"). Checked with the
  numbers: a Daily player earns about 20,900g a season and has about 7,000g spare that already goes on Relics (150g
  each; `docs/numbers-pass-15oct.md`). One Relic a week found on a road is about 900g of value a season, under 5%,
  and it adds no gold, so gear timing does not change. So: at most one road a week carries a Relic, on a trade fork,
  on the road a careful reader would take; the other road still gets its own clue. **No gold found** (it would move
  the gear curve).
- **Every night's question pays off within its week** (Fake Guru's rule; the Week 1 check and its two fixes are in
  `campfire-week1-content-18oct.md`).



# PART D. Build status (what is live, what the builds left undone)

*(source file: `docs/design/build-status-and-todo-18oct.md`)*

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



# PART E. The audit report of the redesign (phases A and B): all 35 findings with the skeptics' checks

*(source file: `docs/design/review-phase-ab-full-report-18oct.md`)*

# Independent review of phases A and B: the full report (18 Oct 2026)

Four independent reviewers read the diff of the new game shell (phase A) and the fire as one chat (phase B), looking at
regressions, spoilers and access, the fire's logic, and tests and the player experience. A separate skeptic then tried to
refute each finding. **35 findings: 29 confirmed, 6 refuted.** The verdicts were made
against the code as it stood when each skeptic ran: two findings (the Day 7 chat and the time comparison) were fixed on
18 Oct and are marked. Plain words first; the file and line are for the builder.

## Confirmed findings (most serious first)

### 1. [MAJOR] Garrick replies produced under the non-fire rules (AI free text, the one-time "Malakor" line) are shown in the fire stream, which renders every Garrick message in party_messages since 5:00am.

- **Where:** `src/online/FireChat.tsx`:313 (found by the *fire-logic* reviewer)
- **What goes wrong:** In Week 3, Mei has not finished her day yet, so she sees EarlierFire. She types "Garrick, who is Malakor?". sendChat(..., false) sends atFire=false, so handler.ts routes with atCampfire=false and posts "Malakor. My grandmother taught me that name." to party_messages (speaker garrick). Dev is sitting at the fire. OnlineCampfire.tsx:393-397 puts that message into his stream as a GarrickBubble, and Mei sees it there too once she finishes. The same path lets an AI small-talk reply (free text, not a stored line) land at the fire. handler.ts:154-159 only restricts the call that came from the fire composer, so the invariant that Garrick at the fire is stored-lines-only and never says Malakor does not hold.
- **The skeptic's check:** I could not refute it. The path is real in the code, although the reviewer's example question is slightly wrong.
1. **What the non-fire composer does.** `EarlierFire` in src/online/FireChat.tsx:313 calls `sendChat(partyId, t, false)`. That invokes the `garrick` function with `atFire: false`. In supabase/functions/garrick/handler.ts:154-159 this means `atCampfire` stays false (the story state sets it false), so the router's Malakor guard at src/data/garrickRouter.ts:579 (`!state.atCampfire && !malakorNameGiven && episode > 2 ...`) lets the Malakor line through. The AI branch (`!atFire && AI_SMALL_TALK`) is also open. The reply is posted by `garrick_post` (migration 0042) into `party_messages` with `kind='chat'`, `speaker='garrick'` and `author_id=null`.
   - I ran the router in Week 3. With `atCampfire=false`, "Garrick, who was the king?" returns "Malakor. My grandmother taught me that name." With `atCampfire=true` it returns a stored deflection.
   - "Garrick, who is Malakor?" does not trigger the Malakor line in either mode. It gets a stored deflection, so the exact question in the claim is wrong, but "who was the king?" does the job.
2. **What the fire stream shows.** OnlineCampfire.tsx:393-397 puts every `party_messages` row with `created_at >= partyDayStart` into the fire stream, with no filter on `speaker`. `ChatBubble` (FireChat.tsx:113) renders `speaker === 'garrick'` rows as a `GarrickBubble`. The only exclusion is the "pinned a theory" notice. `useChatMessages` is enabled whenever `atFire && together`, which holds on any Garrick night once a friend has chosen to sit at the fire.
3. **The invariant is only half enforced.** The handler comment says the fire is the party chat, so there he answers from stored lines only and never says "Malakor", citing Campfire table §E. The guard is applied only to messages typed in the fire composer (OnlineCampfire.tsx:567, `atFire=true`). Anything typed elsewhere reaches the same stream: `EarlierFire`, the party-page PartyChat at OnlineApp.tsx:824, and any Gathering chat that falls on the same party day. AI small talk and the one-time Malakor line posted earlier in the day show up under the evening's fire. Canon says "Malakor" is never used at the Campfire, and §E says no AI free text there.
4. **A related symptom.** `EarlierFire` only shows the asker's own lines since 5:00am (`author_id === userId`). Garrick's reply has `author_id=null`, so Mei does not see his answer where she asked. It appears later in the fire stream, for Dev and for Mei once she finishes her day.
5. **The one argument for "by design".** The one-thread design merges the day's chat into the fire, and canon §E bans AI replies "inside the Campfire script", which a daytime chat reply arguably is not. That softens the severity. The code still contradicts the invariant the diff declares for itself, and it shows the Malakor line and AI free text in the fire stream.

### 2. [MAJOR] EarlierFire's filter hides Garrick's reply to a question asked from its own composer: the reply has author_id null, so it fails the author_id === userId test.

- **Where:** `src/online/FireChat.tsx`:296 (found by the *fire-logic* reviewer)
- **What goes wrong:** Before finishing her day, Mei types "Garrick, is it cold tonight?" in EarlierFire. Her own bubble appears, but Garrick's reply (garrick_post inserts author_id null) is neither in last night's window nor authored by her, so she never sees an answer. She asks again and burns the party's 12-a-day AI cap and the no-repeat rotation. The answer only appears hours later in the fire stream.
- **The skeptic's check:** Confirmed in the code. EarlierFire (src/online/FireChat.tsx:280-318) shows a message only if it is in last night's window, or it was created since this morning's cutoff and has author_id === userId. Its composer calls sendChat(partyId, t, false). When the text names Garrick, sendChat goes through the 'garrick' edge function (lines 197-199). That function posts the reply with author_id null and speaker 'garrick' (migration 0042 line 92). The reply is created now, so it is after the cutoff and its author_id is null. It fails both branches of the filter and is never rendered. The user's own bubble does appear, because it has their author_id. GameShell.tsx:165 mounts EarlierFire before the day is finished, so the path is realistic. The refetch after send does not help, because the filter drops the reply regardless. The claimed consequences (repeat asks, spending the 12-a-day cap) follow from that.

### 3. [MAJOR] Nothing scrolls the thread when a message arrives or is sent, so new messages, including your own, sit under the sticky composer.

- **Where:** `src/online/FireChat.tsx`:214 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** There is no scrollIntoView or scrollTo in FireChat.tsx or OnlineCampfire.tsx; the old PartyChat had one. At 375x667, scrolled to the bottom of the fire, I sent a line. scrollY stayed 3908, the new bubble landed at y 578–619 and the composer starts at y 602, so about 17px of it is covered. The next incoming or sent message is fully behind the composer. Friends' realtime messages append below the fold the same way. The sender cannot see what they just sent without scrolling by hand, which makes the chat read as if send failed.
- **The skeptic's check:** Confirmed in code. FireChat.tsx has no scroll logic anywhere. Its Composer sets text and busy state after send and does nothing else. useChatMessages only updates state on realtime INSERT or the 15-second reload. OnlineCampfire.tsx (which renders the thread and Composer at lines 165 and 563) has no scroll call either. A search of src/online finds scrollIntoView or scrollTo only in PartyChat, OnlineGathering, OnlineDay and GameShell, none of them used by the fire thread. The composer is `sticky bottom-0 z-10` with an opaque background, so a newly appended message at the foot of the page sits at or under it. The only gap in the claim is the exact pixel figures, which I did not reproduce in a browser. Even so, the missing auto-scroll after send or arrival is real. The impact is a usability defect where the sender's own line can be partly hidden, which fits "major" or somewhat less.

### 4. [MAJOR] The Gathering in the shell is rendered without userId and members, so the party chat that sat on the Gathering screen (canon §11, 'the party chat sits on the same screen for the table's talk') no longer renders.

- **Where:** `src/online/GameShell.tsx`:146 (found by the *regressions* reviewer)
- **What goes wrong:** Day 7, any friend opens STORY. OnlineGathering is mounted as `<OnlineGathering partyId onClose embedded />`. The chat block in OnlineGathering.tsx (~line 690) needs `userId && members`, so it is skipped. The old OnlineApp passed both props. With the party page gone, nothing else shows party_messages on Day 7: the shell shows neither EarlierFire nor the fire when `info.gathering` is true. During the Battle and the table question, friends cannot talk, read the host's 'time changed' notices, or press-and-hold to report a message.
- **The skeptic's check:** Confirmed in the code. src/online/GameShell.tsx:146 mounts `<OnlineGathering partyId={party.id} onClose={() => undefined} embedded />` with no `userId` or `members`, although GameShell has both in scope (`userId` is a prop, `members` is a prop) and passes them to OnlineCampfire and EarlierFire. In src/online/OnlineGathering.tsx:690 the table-talk block (`data-gathering-chat`, containing PartyChat) renders only when `userId && members && !view.endedAt`. Both props are undefined in the shell, so the chat is skipped for the whole Gathering.
I found no other chat on Day 7:
- PartyChat is imported only by OnlineApp.tsx and OnlineGathering.tsx. OnlineApp's PartyChat (line ~824) is in the old waiting-room path. That path is unreachable once `started && !beforeDayOne && me.session_zero_done_at`, because OnlineApp returns GameShell first at line 752.
- The `panel` built in OnlineApp.tsx (lines 684-751) holds friends, invite, GatheringCard, GarrickRecap and the party clock, with no PartyChat. The shell's party panel therefore has no chat.
- In GameShell, EarlierFire is gated by `!info.gathering` and OnlineCampfire by `!info.gathering && info.finished`. Neither shows on Day 7, when `info.gathering` is true (OnlineDay.tsx:173, `gathering: !today.chapter`).
- On origin/main, OnlineApp mounted OnlineGathering with `userId={userId}` and `members={approved}`, so the Gathering chat worked before this diff. The branch regressed it.
The only change to OnlineGathering in the diff is the new `embedded` prop, which hides the header and the "BACK TO THE PARTY" button. Nothing replaces the chat. No test references `data-gathering-chat`, so nothing catches the loss.
Effect: during a Gathering in the shell, friends cannot talk, read the host's "time changed" notices, or report messages. Passing `userId={userId} members={members}` at line 146 would fix it. Note that PartyChat sits inside the NotebookProvider, which the line-146 call already is.

### 5. [MAJOR] The Gathering is now mounted automatically for anyone who opens the app on Day 7. Its 2-second gathering_tick registers presence, which defeats the 'missed it' recap and counts an absent friend as present.

- **Where:** `src/online/GameShell.tsx`:146 (found by the *regressions* reviewer)
- **What goes wrong:** Day 7, 8:00am: a friend taps the morning notification and the app lands on STORY, where `info.gathering` is true and OnlineGathering is mounted. gathering_tick inserts a gathering_present row (first_at=8am) unconditionally. The friend skips the 8pm Gathering. At 11pm, after it has ended, they open the app. The 'missed' branch in gathering_tick (0072) requires NO presence row with first_at <= ended_at, but the morning row exists. They get the full night's log instead of the recap, and Day 7 is marked finished (played, toward the 'A Whole Week' badge). Before this change they had to tap THE GATHERING. The story pane is also only hidden, not unmounted, so the heartbeat continues on the Store, Bag and Record tabs, and g_start/g_here count them as 'here'.
- **The skeptic's check:** Confirmed in the code. I found no guard that stops it.
Mounting (new in this diff):
- GameShell.tsx:146 mounts `<OnlineGathering embedded />` whenever `info?.gathering` is true.
- OnlineDay.tsx:173 sets `gathering: !today.chapter`. Day 7 has no chapter row, so it is true for anyone who opens the app on Day 7.
- The shell opens on the 'story' tab by default (GameShell.tsx:59).
- On origin/main, OnlineGathering mounted only after a tap on the GatheringCard button (`setInGathering(true)`).
- OnlineGathering.tsx:105-113 polls `gathering_tick` on mount and then every 2 seconds.
Presence row:
- In 0072 `gathering_tick`, the insert into `gathering_present` runs unconditionally once the friend is past the `missed` branch.
- Nothing checks `opens_at`. At 8am the call inserts a row with `first_at` = 8am.
Missed recap defeated:
- The `missed` branch (0072 lines 137-145) fires only if `g.ended_at` is set and there is no presence row with `first_at <= g.ended_at`.
- The 8am row satisfies that, so a friend who skips the 8pm Gathering and opens the app at 11pm gets the full-night view, not the recap.
- The same call then runs the `member_days` upsert (`g.started_at` is not null), so Day 7 is marked finished for someone who was absent.
Same row, a second effect:
- `my_recaps` (0045 lines 36-37) treats any `gathering_present` row as attendance. The next morning's "road so far" therefore leaves out the Day 7 recap for this friend.
- Core Rules §11 says a friend who missed the Gathering gets its recap first.
Heartbeat on other tabs:
- GameShell.tsx:123 hides the story pane with the class 'hidden' and does not unmount it.
- The 2-second interval therefore keeps running on Store, Bag and Record, and `g_here` (30-second window) counts that friend as here.
Limits on the claim:
- Before this diff, the GatheringCard button was open all of Day 7 (`gathering_info.open` = `v_day = 7`). A friend who tapped it at 8am hit the same gap, so the weakness already existed in 0072.
- This diff makes it automatic for every Day 7 visit, which is the regression.
- Counting a friend with the app open on another tab as "here" at the start matches canon's "present but silent", so that part is weaker than the main claim.
- I did not check the "A Whole Week" badge. It is computed only from demo data, and the online Record is still a placeholder.
- The claim is still real on the recap, the finished Day 7 and the next-morning recap.

### 6. [MAJOR] The story pane reloads `today` only when the STORY tab is re-selected. It never reloads at the 5:00am rollover or after a failed first load, and its Back button is a no-op.

- **Where:** `src/online/GameShell.tsx`:68 (found by the *regressions* reviewer)
- **What goes wrong:** A friend finishes Day 3 at the fire and leaves the PWA open. At 5:00am Day 4 opens, and tapping the 8:00am push only focuses the existing window (pwa/sw.js `open.focus()`). OnlineDay has no interval or visibility refresh, so the shell still shows Day 3's chapter, the Day 3 fire and the Day 3 header. The fire's 12-second `campfire` poll now hits Day 4 and shows 'The fire opens once your own day is done.' under Day 3's thread. On Day 6 to Day 7 the Gathering never appears until the player switches tabs. If the first `today()` call fails (a network blip), OnlineDay shows the error plus a 'Back' button wired to `onClose={() => undefined}` (OnlineDay.tsx:196). The shell has no gold, day or fire, and no way to retry except changing tab.
- **The skeptic's check:** I could not refute any part of the claim. The one overstatement is the word "never": a tab switch or a full reload does recover the view.
What the code shows:
- **Refresh trigger:** `OnlineDay.load` (src/online/OnlineDay.tsx:153-160) depends only on `[partyId, reloadKey]`. It also runs after `call()` (line 182) and after finishing a day (line 753). Nothing else calls it.
- **No polling:** There is no `setInterval` in OnlineDay or GameShell. The only `visibilitychange` or `pageshow` hits in the repo are in the grep's own pattern, so no code listens for them. `location.reload` has no hits either.
- **Reload key:** In GameShell the only thing that bumps `storyKey` is `show('story')` when the previous tab was not the story (GameShell.tsx:66-71).
- **Poll doesn't reach it:** PartyPage's 5-second poll (OnlineApp.tsx:421-422) hands GameShell new `party` and `members` objects. That does not change `partyId`, so it does not refetch `today`.
- **Clock-driven day:** The server decides the day by the clock. `party_today` (0012_days_online.sql:56) rolls the day over at 5:00am party time, and `today()` calls `my_today_row`, which uses it. So the shell really does keep showing yesterday's week and day after 5:00am.
- **Push tap:** The service worker (pwa/sw.js:28-33) only runs `open.focus()` on an already-open window. It does not reload, so tapping the 8:00am push shows the stale page.
- **Stale fire:** The fire's 12-second `campfire` poll (OnlineCampfire.tsx:159) calls `my_fire_day`. That raises 'finish your day first' once the server is on an unfinished Day 4 (0024_campfire.sql:129), and the client maps it to 'The fire opens once your own day is done.' (line 125). Because `fire` is already set, the screen keeps Day 3's fire and renders that error under it (line 560).
- **Day 7:** The Gathering shows only when `info.gathering` is true, which comes from `today.chapter` being null. That never updates without a reload of `today`, so the Gathering does not appear on Day 6 to Day 7 until a tab switch.
- **No-op Back:** On a failed first load, OnlineDay renders the error plus a Back button wired to `onClose` (lines 192-201). GameShell passes `onClose={() => undefined}` (line 133), so the button does nothing and the shell has no gold, day or fire.
- **Regression:** On origin/main, OnlineDay was mounted fresh each time the player opened it from the party page, so this staleness is new with the always-mounted shell. The diff also adds `embedded`, but it only hides the header and the Gathering button. It does not hide this error Back button.
I rate it a genuine defect and fairly realistic, since the game is played over days, the PWA is meant to stay installed, and resuming a backgrounded PWA keeps its React state. The first-load failure case is also real, though less common.
Recovery paths exist: switching to another tab and back, or reloading the app. The tab switch is not obvious to a player. That makes it a missing refresh on resume and at the day rollover rather than data corruption.
One thing I did not trace: any tap in the stale chapter calls an RPC and then `load()`, so it would refresh to the new day. I did not check what the tapped RPC does to the new day's row first.

### 7. [MAJOR] Every tab switch calls window.scrollTo({top:0}), including back to STORY, so a player returning from the Bag or Store lands at the top of the day instead of where they were in the thread.

- **Where:** `src/online/GameShell.tsx`:70 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** The fire sits under the whole chapter in one document, so it is thousands of pixels down; I measured scrollY 3961 at the composer. The fire's '+' tray has 'Your fragment', which calls onOpenChest and show('bag'). Coming back via STORY gives scrollY 0 (verified in Chromium): the Last night card and the start of the chapter, with the fire thousands of pixels below. The same happens after THE STORE from a set-aside card or a trip to the Journal. The comment says the mounted pane means 'coming back finds your place in the thread', but the scroll position is not kept.
- **The skeptic's check:** Confirmed in src/online/GameShell.tsx. The `show()` function (lines 66-71) always calls `window.scrollTo({ top: 0 })`, and that includes the switch back to 'story'. Nothing saves or restores the scroll position. A grep of src/online found no other scrollTo or scrollY handling for the shell. The story pane is only hidden with CSS (`hidden`), so the document shrinks while another tab is open and the browser's scroll position is lost. The comment at line 122 says the thread keeps your place, but the scroll reset undoes that. The `onOpenChest` path calls `show('bag')`, and returning via the STORY tab then lands at the top. The same happens after the Store. Returning to the story also bumps `storyKey`, which may remount the day and add to the reset. The fire sits far below the chapter, so the player has to scroll back down.

### 8. [MAJOR] Garrick's morning line is never shown anywhere. It is stamped exactly at the 5:00 day boundary, and the fire compares ISO strings of different formats, so the boundary message fails `>=`.

- **Where:** `src/online/OnlineCampfire.tsx`:396 (found by the *regressions* reviewer)
- **What goes wrong:** garrick_morning stamps the line at exactly 05:00:00 party time, which PostgREST and realtime return as '2026-10-18T21:00:00+00:00'. partyDayStart() returns toISOString(), '2026-10-18T21:00:00.000Z'. The string comparison `created_at >= since` is false because '+' sorts before '.' (checked in node). The line is filtered out of the fire's stream. FireChat.tsx:296 also excludes it from EarlierFire, because it sits at the cutoff and has a null author. With PartyChat gone from the shell, the approved morning line (one a day) no longer reaches a player. Fix: compare with Date.parse.
- **The skeptic's check:** The core defect holds, but the claim overstates its impact and gets one detail wrong.
Confirmed at OnlineCampfire.tsx:396.
- `garrick_morning` (migration 0043) stamps the line at exactly 05:00 party time: `(((now - 5h)::date + time '05:00') at time zone v_tz)`.
- `partyDayStart()` (FireChat.tsx:55-69) returns that same instant, but as `toISOString()`, e.g. '2026-10-18T21:00:00.000Z'.
- PostgREST and realtime return the stored value as '2026-10-18T21:00:00+00:00'.
- `m.created_at >= since` is a string comparison. In node, `'2026-10-18T21:00:00+00:00' >= '2026-10-18T21:00:00.000Z'` is false, because '+' sorts before '.'. `Date.parse` shows the two are the same instant.
- So the morning line, the only message sitting exactly on the boundary, is dropped from the fire's stream. Later messages are unaffected.
- The line was meant to appear there: the code comment says "the party's talk since this morning", and the multiplayer plan says it is stamped 5:00am "so it sits first in that day's chat".
Wrong in the claim: the line is not excluded from EarlierFire.
- `EarlierFire` (FireChat.tsx:296) keeps a message when `created_at >= yesterday && created_at < cutoff`. The same '+' vs '.' quirk makes `'…21:00:00+00:00' < '…21:00:00.000Z'` true. I ran it and the first clause is true.
- So the morning line does show in EarlierFire, under the "LAST NIGHT AT THE FIRE" header, for any friend whose day is not finished and whose chat is open. That is a mislabel, and the same string-comparison bug causes it.
- It is therefore not true that "the line no longer reaches a player". It reaches players only before they finish their day. Once the day is finished the fire replaces EarlierFire and the line disappears.
Other surfaces: `PartyChat` is no longer rendered in the game shell. `OnlineApp` mounts it only on the pre-game page, where `chatOpen` is false. `GameShell` passes no `userId` or `members` to `OnlineGathering`, so the Gathering's embedded chat is off too. The only places the line can appear are the fire stream and EarlierFire.
The bug is real, but the impact is narrower than the claim says. The fix is to compare with `Date.parse` (or `new Date(...).getTime()`) in both places. After that, the line shows at the fire and no longer leaks into the "last night" block.

### 9. [MAJOR] The stream weaves in every party_messages notice except "pinned a theory". finish_day and solve_word notices therefore duplicate the fire's own lines and put a loss line in public.

- **Where:** `src/online/OnlineCampfire.tsx`:396 (found by the *fire-logic* reviewer)
- **What goes wrong:** Dev fails today's Challenge and finishes at 9am. finish_day (0012) posts the notice "Dev failed today's Challenge.", which ChatBubble renders as a SmallLine in everyone's fire stream. This breaks the "Around the fire tonight: good news only" rule. When Mei passes, "Mei passed today's Challenge." appears next to the Around card's "Mei passed today's Challenge at <place>.". When Mei finds a word, solve_word posts "Mei found a missing word in the Week 1, Day 3 fragment." and line 408 also adds "Mei found a missing word." from frag.solvers. Two lines for one event, at two different positions in the stream.
- **The skeptic's check:** Confirmed in code. OnlineCampfire.tsx:396 only drops notices ending in " pinned a theory.", so all other party_messages notices from the party's day start are rendered through ChatBubble. FireChat.tsx:114 turns every notice into a SmallLine. finish_day (supabase/migrations/0012_days_online.sql:310-312) inserts a 'notice' reading "<name> passed today's Challenge." or "<name> failed today's Challenge." into party_messages, so a failure line shows publicly in every friend's fire stream. The Around card (OnlineCampfire.tsx:274) already says "passed today's Challenge at <place>", so a pass shows twice. I found no later migration that redefines finish_day or drops that notice. solve_word (0019, 0083, 0086, 0091) also posts "<name> found a missing word in the Week N, Day N fragment." as a notice. Line 408 separately adds "<s> found a missing word." from frag.solvers, so one find shows twice, at different positions in the stream.

### 10. [MAJOR] The server takes "at the fire" from a client-sent boolean, and the shipped client sends false from the shared fire stream, so Malakor and AI text can still land at the fire.

- **Where:** `supabase/functions/garrick/handler.ts`:154 (found by the *spoilers* reviewer)
- **What goes wrong:** The function never checks that the caller is at the fire. It only reads `body.atFire === true`, where `garrick_private_open('fire')` checks the caller's fan_outs row. (1) Forging: any signed-in member can call `functions.invoke('garrick', {party, text:'Garrick, who was the king?'})` without `atFire`. After Gathering 2 (episode > 2) the router returns 'Malakor. My grandmother taught me that name.', and small talk goes to Gemini. Both are posted by garrick_post into the party_messages stream that the fire displays. Setting `atFire` to true only narrows the reply, so forging it gains nothing. (2) The shipped UI does the same. EarlierFire (FireChat.tsx:313) calls `sendChat(partyId, t, false)`. A friend who has not finished the day asks 'Garrick, who is the king?' at 9am on Week 3 Day 2. Garrick posts the Malakor line, or an AI reply, into party_messages. At 8pm the friends at the fire see it, because OnlineCampfire.tsx:396 shows every message since this morning. That breaks 'never Malakor / no AI free text at the campfire'. It also uses up the party's one-time Malakor line (`malakorNameGiven` reads garrick_log) on a reply that was posted in the morning. Fix: the server should decide. For example, treat the public chat path as the fire (`atCampfire` always true, no AI), or set it from the caller's own fan_outs row (as `garrick_private_open` does) and tag replies posted before the fire so the fire stream does not show them.
- **The skeptic's check:** Confirmed in code, with two corrections to the reviewer's framing. The server does take "at the fire" from `body.atFire === true` (handler.ts:154) and never checks the caller. Forging it only narrows the reply, so that part is not a vulnerability. The real defect is that the fire is not protected from replies posted elsewhere.
1. `garrick_state` hard-codes `'atCampfire', false` (0042_garrick_chat.sql:65). So any Garrick-naming message sent without `atFire` gets the full router. I ran the router in-repo for Week 3 Day 2 with `atCampfire` unset: "Garrick, who was the king?" returns 'Malakor. My grandmother taught me that name.' With `atCampfire: true` it returns a stored deflection. Small talk goes to Gemini whenever `!atFire`. `garrick_post` writes the reply to `party_messages` with `speaker = 'garrick'`.
2. The shipped UI has a non-fire sender. `EarlierFire` (FireChat.tsx:313) calls `sendChat(partyId, t, false)`. GameShell.tsx:165 shows it to any friend who has not finished today's day (`!info.finished && chatOpen`). The reviewer called this "the shared fire stream", which is wrong: the fire composer (OnlineCampfire.tsx:567) does send `true`. The consequence still holds. The fire stream (OnlineCampfire.tsx:396) renders every `party_messages` row since `partyDayStart`, with no filter on author or on whether the sender was at the fire. Garrick rows render as `GarrickBubble` (FireChat.tsx:113). The stream is sorted only by timestamp (OnlineCampfire.tsx ~458).
3. Realistic path, with no forging: Mei is at the 8pm fire, where her messages carry `atFire` true. Dev has not finished his day and is in `EarlierFire`. He types "Garrick, who was the king?" The handler sees no `atFire`, so Garrick posts the Malakor line, or an AI reply for small talk. The fire's realtime subscription puts it into Mei's fire thread live. A morning ask also stays in the stream all day and is shown at night. This breaks the "never Malakor / no AI free text at the fire" rule (CLAUDE.md §6, Campfire table §E), which this diff's own comment at handler.ts:152 says it enforces. Before the diff, the Campfire did not show party chat at all (origin/main OnlineCampfire.tsx has no `useChatMessages`), so the diff introduced the exposure.
4. Not a defect: using up the one-time Malakor line (`malakorNameGiven`) on an earlier chat reply is the intended "first time he is asked" behaviour. The OnlineApp.tsx:824 `PartyChat` is only reachable before the game shell, so it is not a path here. The Gathering's `PartyChat` is on Day 7, which has no fire stream.
Fix direction: decide "at the fire" on the server, as `garrick_private_open('fire')` does from the caller's fan_outs row. Or tag replies posted before the fire so the fire stream does not show them, or treat the shared chat path as stored-lines-only.

### 11. [MAJOR] The fire rule (stored lines only, never Malakor) depends on a client-sent atFire flag, but replies are shared with the whole party. A friend still on their chapter posts through EarlierFire with atFire=false.

- **Where:** `supabase/functions/garrick/handler.ts`:154 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** EarlierFire's composer calls sendChat(partyId, t, false) (FireChat.tsx:313) and the handler trusts `body.atFire`. From Week 3 (when Malakor is allowed) Dev, still reading his chapter, types 'Garrick, who is Malakor?'. The router runs with atCampfire false and replies 'Malakor. My grandmother taught me that name.' into party_messages. Mei, sitting at the fire, sees that line in her fire stream (messages since day start), so Garrick says the name at the fire, and the once-only first-time line is used up. AI small talk can reach the fire the same way. Dev himself never sees the reply: the EarlierFire filter (FireChat.tsx:296) keeps only others' last-night messages and his own, so Garrick's answer, with author null, is hidden from the person who asked.
- **The skeptic's check:** Confirmed in the code. The handler decides "at the fire" only from the client flag: `atFire = body.atFire === true` (handler.ts:154). The server-side state never sets it, because migration 0042 line 65 hard-codes `'atCampfire', false`. EarlierFire, used by a friend whose day is not finished, sends `sendChat(..., false)` (FireChat.tsx:316), so `atCampfire` is false. In garrickRouter.ts:579 the "Malakor. My grandmother taught me that name." line fires when `!atCampfire`, `!malakorNameGiven` and the story is past Gathering 2. The AI small-talk branch (handler.ts:159) also runs when `atFire` is false. Both replies are posted to party_messages for the whole party. The fire stream (OnlineCampfire.tsx:394-396) shows every message since the party day start, so Mei at the fire sees Garrick's line. EarlierFire's filter (FireChat.tsx:296-298) keeps only last night's messages and the asker's own, so Garrick's reply, which has author null, is hidden from Dev. The once-only name line is used up. I found nothing that refutes this.

### 12. [MAJOR] The pin-before-peek negative check can never fail: the regex /TestHost\n/ does not match the rendered text even when the name is shown.

- **Where:** `tests/online/campfire.cjs`:96 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** The reading-option button renders the fork text followed by a block span with the names, so innerText is "They're digging to find something that's already there.\nTestHost" with no trailing newline. I rendered it with myPick set and readings naming TestHost. The text shows the name, yet /TestHost\n/.test(...) is false, so `!/TestHost\n/.test(...)` is always true. If the server or client leaked others' picks before the viewer's own pick, Mei's run would still log true. The host-side companion check only looks for the word 'you', which cannot detect other friends' names. Pin-before-peek, the fire's central rule, has no working test.
- **The skeptic's check:** Confirmed. In OnlineCampfire.tsx lines 511-512 the button's last child is the names span, rendered as a block with nothing after it. Its innerText therefore ends with the name, as in "...there.\nTestHost", with no trailing newline. The test regex /TestHost\n/ at campfire.cjs:96 needs a newline after the name, so it can never match. `!/TestHost\n/.test(...)` is always true, even if the server or client leaked others' picks before the viewer's own pick. The companion host check at line 86 only looks for 'you'. Today the app is correct: names are empty until myPick is set (line 493), so the check passes. But it would not catch a regression, so pin-before-peek has no working negative test.

### 13. [MAJOR] The rewritten fire, store and gathering tests only log booleans. The process exits non-zero only on a Playwright timeout or exception, and the new server behaviour (atFire) is never exercised.

- **Where:** `tests/online/campfire.cjs`:137 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** Every result in campfire.cjs, store-and-relics.cjs and gathering.cjs goes through log(); there is no assert and no exit(1) except in the catch. If Garrick stopped answering, the host's piece never appeared, the strip did not fold, or the Gathering chat vanished (see the GameShell finding), the run would still print and exit 0, as if green. The 'mei: no host piece to react to' branch silently skips the Agree/Doubt checks. The only handler.ts change in this diff is atFire (stored lines only, never Malakor at the fire). Mei's question 'what do you make of this list?' routes to a stored line either way, in Week 1, before Malakor can be said. Dropping `atFire` from sendChat or the handler would pass every check.
- **The skeptic's check:** The claim holds in the code. In tests/online/campfire.cjs every result goes through log(), and the only process.exit(1) is in the .catch at line 137. store-and-relics.cjs has the same shape (exit only at line 78 in the catch). gathering.cjs has no assert and only exit(0). The Garrick check at lines 112-117 logs `gl === before + 1` as a boolean and does not fail on false. The `if (hostPiece…) … else log('mei: no host piece to react to')` branch skips the Agree/Doubt checks silently. `atFire` is passed in FireChat.tsx:199 and read in handler.ts:154-155. The test message "Garrick, what do you make of this list?" is Week 1 small talk or a story question. It would route to a stored line whether or not atFire is set, so removing atFire would not change the logged output. The run would print and exit 0 even if Garrick stopped answering. This is a test-quality weakness (the scripts are manual logs a human reads), not a runtime bug, so major severity is arguable. The substance is accurate.

### 14. [MAJOR] party-chat.cjs was not updated and can no longer pass, and the README still lists it as covering the chat, reporting, name notices and leaving.

- **Where:** `tests/online/party-chat.cjs`:89 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** The test waits up to 40 reloads for the heading /Party chat/. That heading exists only in PartyChat.tsx:120, rendered at OnlineApp.tsx:822 in the non-shell branch. Once the chat is open (Day 2 read, season started, Session Zero done) the party always renders GameShell, so the branch is unreachable and ok stays false. The test then fills `input.last()` and clicks the exact name 'SEND'. The new composer button is aria-label 'Send', and exact matching is case-sensitive, so it times out and fails. Press-and-hold report (now in FireChat ChatBubble/ReportBox), the name-change notice and the leave notices, which moved into the panel, now have no coverage.
- **The skeptic's check:** Confirmed in the code. OnlineApp.tsx:681 returns GameShell once the season has started and Session Zero is done. PartyChat is rendered only in the later non-shell branch (OnlineApp.tsx:822-824), so the "Party chat" heading (PartyChat.tsx:120, the only place that text appears in src/online) never shows. The test's 40-reload loop for /Party chat/ therefore fails. The composer button in FireChat.tsx:265 has aria-label "Send" and shows an arrow. The test clicks it with getByRole('button', {name: 'SEND', exact: true}), which does not match. The test file has no changes in this branch; its last commit is 51e54ac. The press-and-hold report, name-change notice and leave notice steps depend on the same dead path and are not covered.

### 15. [MINOR] EarlierFire shows only the friend's own messages since the 5:00 cutoff, so Garrick's reply to a question put to him in the morning thread is filtered out.

- **Where:** `src/online/FireChat.tsx`:296 (found by the *regressions* reviewer)
- **What goes wrong:** Before finishing the day, a friend types 'Garrick, what's for breakfast?' in EarlierFire. sendChat invokes the garrick function, which posts the friend's message and Garrick's reply (author_id null, speaker 'garrick') after the cutoff. The filter `(created_at >= cutoff && author_id === userId)` keeps the question and drops the reply. The friend sees their question unanswered, and the reply uses one of the party's 12 daily small-talk slots. The reply only appears later, once their day is finished and the fire opens.
- **The skeptic's check:** Confirmed in the code. In src/online/FireChat.tsx (EarlierFire, line 296), `shown` is `(created_at >= yesterday && created_at < cutoff) || (created_at >= cutoff && author_id === userId)`. The garrick Edge Function (supabase/functions/garrick/handler.ts) is called by `sendChat(partyId, t, false)` whenever the text matches /\bgarrick\b/i. It first posts the friend's message through `post_message`, as theirs. Then it posts the reply through `garrick_post` (migration 0042 line 92), which inserts `author_id = null, speaker = 'garrick'` with a now timestamp, so after the 5:00am cutoff. The friend's question matches the second clause and is shown. Garrick's reply has `author_id` null, so it fails the second clause and is not in the first window either, and it is dropped. `ChatBubble` would render it as a GarrickBubble, but it never receives it. Realtime and the 15s reload both feed the same unfiltered `messages` list, so the filter is the only thing hiding it. A friend who asks Garrick in the morning thread sees an unanswered question until their day is finished and the fire opens (OnlineCampfire uses the full thread). This is not intended: the comment says "your own lines" and the composer is deliberately offered, while the design doc (one-thread-18oct.md) says Garrick answers when named. The AI-slot claim also holds. `atFire` is false here, so an AI_SMALL_TALK route can call Gemini and count toward the 12 a day while the friend never sees the answer. The impact is small (the reply shows later and nothing breaks), so it is real but minor. The fix is to also keep Garrick messages posted after the cutoff that reply to the user's own question, or to treat a `speaker === 'garrick'` message from the `garrick_log` question as visible.

### 16. [MINOR] A friend who has not finished the day can talk to Garrick, and the shared fire chat plays back, but the filter drops every Garrick reply, so the asker never sees an answer.

- **Where:** `src/online/FireChat.tsx`:296 (found by the *spoilers* reviewer)
- **What goes wrong:** EarlierFire keeps only last night's messages and today's messages whose `author_id === userId`. Garrick's replies have `author_id` null and `speaker` 'garrick'. A friend on an unfinished day types 'Garrick, how is the weather?' into the composer. Their own line shows. The function posts and logs his reply (and uses one of the party's 12 AI replies a day), but the reply is filtered out of their view. The asker sees no answer. The reply then appears in the stream of everyone who reaches the fire later.
- **The skeptic's check:** Confirmed in the code. In src/online/FireChat.tsx, EarlierFire (line 296) keeps only messages from last night, plus today's messages where `m.author_id === userId`. EarlierFire is rendered in GameShell.tsx:165 for a friend whose day is not finished and whose chat is open. Its composer calls `sendChat(partyId, t, false)`, and because the text names Garrick, that goes to the `garrick` edge function (FireChat.tsx:198-199). The handler (supabase/functions/garrick/handler.ts) posts the friend's own line through `post_message`, then runs the router. With atFire false, small talk may go to the AI, and that counts against the party's 12 a day. It then calls `garrick_post`, which inserts the reply into party_messages with `author_id = null` and `speaker = 'garrick'` (migration 0042, line 92). The reply is created after the party-day start, so it is today's. `null === userId` is false, so the filter drops it, and the realtime INSERT handler only adds it to the same state that is then filtered. The asker sees their own line and no answer. Nothing else on that screen shows Garrick's replies, and there is no test covering this path. The reply does show up later in the OnlineCampfire stream for anyone whose day is finished. The claim is real but minor, because the loss is only that the reply is hidden for that player until they reach the fire.

### 17. [MINOR] useChatMessages.load ignores the query error: a failed select returns data null and setMessages([]) wipes the stream's chat.

- **Where:** `src/online/FireChat.tsx`:33 (found by the *fire-logic* reviewer)
- **What goes wrong:** During a 15s poll the party_messages select fails (network drop or token refresh). `data` is null, so setMessages([]) runs and every friend message, Garrick reply and notice vanishes from the fire stream until the next successful poll.
- **The skeptic's check:** The code matches the claim. In `/home/user/Mythios/src/online/FireChat.tsx` lines 27-33, `load` reads only `{ data }` from the `party_messages` select and never checks `error`. supabase-js returns `{ data: null, error }` on a network failure or an expired token instead of throwing. `setMessages(((data as ChatMessage[] | null) ?? []).reverse())` then sets the state to an empty list. `load` also runs on a 15-second interval (line 45), so any failed poll empties the chat stream. The stream stays empty until the next successful poll, apart from any messages the realtime insert handler appends in the meantime. The effect is temporary and cosmetic, which fits the "minor" severity. The fix is to return early when `error` is set or `data` is null.

### 18. [MINOR] The + tray is rendered inside a sticky bottom-0 composer with no max-height or scrolling. Several unlaid hands can make it taller than a small phone's viewport, which clips the top hand's "Lay it on the table" button.

- **Where:** `src/online/FireChat.tsx`:240 (found by the *fire-logic* reviewer)
- **What goes wrong:** On a day with a Notice line, pass lines and a [PRESS ON] find all unlaid (for example Week 2 Day 6, where pass and press text are 193 and 274 characters), the tray plus fragment button plus input is roughly 750px. On a 375x667 phone the first hand's button sits above the top of the viewport and cannot be scrolled to, because the sticky element is anchored to the bottom. The Notice can only be laid after the lower hands are gone.
- **The skeptic's check:** The code matches the claim. The Composer root in src/online/FireChat.tsx (about line 240) is "sticky bottom-0 z-10". The tray div inside it (data-tray) has no max-height or overflow. The only caller that passes a tray is src/online/OnlineCampfire.tsx (about lines 563-615). It renders one bordered card per unlaid hand (notice, pass, press), each with the full text and its own "Lay it on the table" button, plus a "Your fragment" button and the input row. With three long hands, the 15px text at phone width gives cards of roughly 190-230px each. The tray is then taller than a short phone viewport. A bottom-pinned sticky element taller than the viewport has its top clipped, and scrolling the page cannot bring that part into view. So the first hand's button becomes unreachable until the lower hands are laid and removed. The scenario needs several unlaid hands and a small screen, so the severity stays minor.

### 19. [MINOR] Every tab switch calls `window.scrollTo(0)`, including the return to STORY. The story pane is kept mounted, so OnlineDay's scroll-to-end effect (keyed on stepCount) does not run again.

- **Where:** `src/online/GameShell.tsx`:70 (found by the *regressions* reviewer)
- **What goes wrong:** Mid-chapter the friend taps [OPEN THE SEEKER CHEST], solves a word, and taps STORY. Or they tap 'Your fragment' from the composer at the bottom of the fire. Back on STORY the page is at scrollTop 0, the top of the chapter. The reload bumps storyKey but leaves `today.mine` unchanged, so nothing scrolls back to the current step or the composer. They must scroll through the whole chapter and fire again. Before, remounting OnlineDay re-ran the scroll effect and landed at the end of the thread. The code comment says coming back 'finds your place', which is not true.
- **The skeptic's check:** Confirmed in the code. GameShell.tsx:66-71 `show()` calls `window.scrollTo({ top: 0 })` on every tab change, including the return to STORY, and bumps `storyKey` when coming back to the story tab. The story pane stays mounted, hidden with a class (GameShell.tsx:123), so OnlineDay never remounts. The only scroll-to-end is OnlineDay.tsx:187-190, an effect keyed on `stepCount = JSON.stringify(today.mine).length`. The reload from `reloadKey` (OnlineDay.tsx:157-160) re-runs `load()`, which sets a new `today` object, but `stepCount` only changes if `today.mine` changed. `today.mine` is the `member_days` row (migration 0072:116). `solve_word` (0091:33) writes only `member_progress` (gold) and `fragment_words`. The Store's buy functions write gold and gear to `member_progress` too. So after a Chest solve or a Store visit, `today.mine` is identical, `stepCount` is unchanged, and the effect does not run. The page stays at scrollTop 0. Both paths in the claim reach this. OnlineDay.tsx:294 puts the [OPEN THE SEEKER CHEST] button mid-chapter at the fragment step. OnlineCampfire.tsx:600 puts "Your fragment" in the fire composer at the bottom of the thread. Both call `show('bag')`, and tapping STORY then lands at the top of the chapter, with no `scrollIntoView` or scroll restoration anywhere to bring the friend back. A grep of src/online shows no other scroll handling for the story pane. Before this change OnlineDay was remounted on return, so `stepCount` went from 0 to N and the effect ran. The comment at GameShell.tsx:122 ("coming back finds your place in the thread") is therefore wrong. The effect is a usability regression, not data loss, so "minor" is fair.

### 20. [MINOR] The RECORD tab's gear levels and the top-bar gold come from the `info` snapshot taken by OnlineDay. Store purchases and Chest rewards do not update `info`, only the gold figure for the Store.

- **Where:** `src/online/GameShell.tsx`:204 (found by the *regressions* reviewer)
- **What goes wrong:** On the STORE tab a friend buys Weapon Level 2 (gold updates via onGold). They tap RECORD, which reads `info.weaponLevel` and `info.armorLevel` from the last `today()` and shows 'Level 1 of 5'. Solving a Seeker Chest word (+25g) in BAG likewise leaves the header gold unchanged. Only a visit to STORY (storyKey bump, then reload) corrects it.
- **The skeptic's check:** Confirmed in the code, and I could not refute it. It is minor, as the reviewer says.
Record tab: in `src/online/GameShell.tsx` the RECORD pane draws its gear tiles from `info.weaponLevel` and `info.armorLevel`. `info` is set only by `onInfo`, which `OnlineDay` calls after each `today()` load (`OnlineDay.tsx` lines 163-175). `show()` bumps `storyKey` only when the target tab is 'story', so going STORE to RECORD triggers no reload. A purchase in `OnlineStore` (`buy_gear`, which raises `weapon_level` or `armor_level` on the server) calls `setState` locally and passes only the gold up through `onGold`. So after buying Weapon Level 2, RECORD still reads "Level 1 of 5" until the friend visits STORY.
Header gold: the sticky header shows `gold`, which is set by `onInfo` or by `onGold`. `OnlineChest` has no gold callback at all (props are only `partyId`, `onClose`, `embedded`). `solve_word` adds 25 to `member_progress.gold` on the server, but the header keeps the old figure until STORY is revisited.
Two parts of the claim need a small correction. Opening STORE refreshes the header gold, because `OnlineStore` calls `onGold` on mount, so the gold part is only stale after Chest rewards. Attributes on the RECORD tab are not stale, since they change only inside STORY, which does call `onInfo`. The stale pieces are the gear levels after a Store purchase and the header gold after a Chest solve.
I did not modify any file.

### 21. [MINOR] LastNight loads after the chapter has painted and inserts a card above it, moving the tap target about 109px.

- **Where:** `src/online/GameShell.tsx`:125 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** LastNight renders null until its casebook RPC returns, while OnlineDay is already showing the first '…' tap button. With casebook delayed 900 ms the first script button's document y went from 1034 to 1143 when the card appeared (measured). A player who taps the button as it moves can hit something else; on a day that opens with a choice, the choice buttons are irreversible (a pick closes the other option). The page is often at scrollY 0 on load, where scroll anchoring does not apply.
- **The skeptic's check:** The code confirms the mechanism. GameShell.tsx:125 renders `<LastNight>` directly above `<OnlineDay>` in the same column. LastNight.tsx:48 returns null until its own `casebook` RPC resolves (lines 24-46). That RPC runs only after `info` is set, which comes from OnlineDay's `onInfo`, so the chapter and its first tap button are already painted when LastNight mounts. The card is then inserted above the chapter, with no reserved height or placeholder, and it shifts everything below it. The card appears only on days where the previous night has a fire call, so this is minor and not every-day. The 109px figure and the irreversible-choice risk are plausible but I did not run the page to measure them. The shift itself is real and the severity "minor" fits.

### 22. [MINOR] In the party panel, GatheringCard's `onOpen` is `window.scrollTo({top:0})`, so the primary 'THE GATHERING / JOIN THE GATHERING / TONIGHT'S GATHERING' button does nothing visible.

- **Where:** `src/online/OnlineApp.tsx`:733 (found by the *regressions* reviewer)
- **What goes wrong:** Day 7: the friend opens the party panel (a fixed full-screen overlay owned by GameShell's panelOpen state) and taps the gold JOIN THE GATHERING button that GatheringCard shows when `info.open`. The handler scrolls the page behind the overlay, and the panel never closes. The panel lives in OnlineApp but its open state is in GameShell, so `onOpen` cannot close it. The button looks broken until the friend dismisses the panel by hand.
- **The skeptic's check:** Confirmed in the code. OnlineApp.tsx:733 passes `onOpen={() => window.scrollTo({ top: 0 })}` to GatheringCard, which is rendered inside the `panel` node. GameShell.tsx:269-283 renders that node in a `fixed inset-0 z-40` dialog, so a window scroll does not move it. `panelOpen` is private state in GameShell (line 56), and no close callback reaches the panel node or GatheringCard. On origin/main the same prop was `() => setInGathering(true)`, which opened the Gathering. In HEAD the Gathering is embedded in the Story tab (GameShell.tsx:146: `info?.gathering && <OnlineGathering ... embedded />`). The gold button (OnlineGathering.tsx:~915, shown when `info.open`) therefore scrolls the page behind the overlay, leaves the panel open and does not take the friend to the Gathering. It is a real but minor defect: the primary Gathering button in the panel is effectively dead, and the friend must close the panel by hand.

### 23. [MINOR] The party panel's Gathering card has a dead gold button on Day 7, and the Day 4 and 5 time poll is reachable only from that panel.

- **Where:** `src/online/OnlineApp.tsx`:733 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** GatheringCard shows its gold 'THE GATHERING' or 'JOIN THE GATHERING' button when info.open (Day 7), but onOpen is `() => window.scrollTo({top:0})`. It neither closes the panel nor switches to STORY, where the Gathering lives. With the Gathering mocked open I tapped it in the panel from the RECORD tab: the panel stayed open and the active tab stayed RECORD, so nothing visibly happened. The poll (GatheringPoll) renders only inside that card, behind the 'Party ▾' text in the top bar. The Day 4 push says the day 'adds the poll', but the thread has no pointer to it, so friends who do not open the panel never vote.
- **The skeptic's check:** Both parts hold up in the code. I did not run it.
1. Dead button. The party panel is rendered by GameShell.tsx as a fixed overlay (lines 269-283), opened by `panelOpen`. OnlineApp.tsx:733 passes `onOpen={() => window.scrollTo({ top: 0 })}` to GatheringCard. That callback does not close the panel and does not call `show('story')`, so it changes nothing on screen. The gold button renders when `info.open` (OnlineGathering.tsx:913-917), which is Day 7.
2. Poll reachability. `GatheringPoll` is used in one place, OnlineGathering.tsx:934, inside GatheringCard. GatheringCard is used in one place, the panel at OnlineApp.tsx:733. The panel opens only from the 'Party ▾' text in the header (GameShell.tsx:88-95). The story thread on Days 4 and 5 does not render the poll. OnlineGathering is shown in the thread only when `info.gathering` is true, which is Day 7. A friend who never opens the panel therefore never sees the poll.
Impact is minor. Day 7's thread already shows the Gathering, so the dead button only misleads. The poll is the bigger gap, because the Day 4 push says the day 'adds the poll' but the thread gives no pointer to it. I did not check whether the push text is shown in-app.

### 24. [MINOR] Events that happen later are anchored to the viewer's arrival time (arrival+10ms and arrival+20ms) instead of to when they happened, so they are inserted far up the stream.

- **Where:** `src/online/OnlineCampfire.tsx`:413 (found by the *fire-logic* reviewer)
- **What goes wrong:** Mei sat down at 7:00pm and the party chats for two hours. At 9:00pm Dev finds the second word. The "TODAY'S FRAGMENT IS WHOLE" card with the meaning question, one of the night's two main prompts, is stamped 7:00pm+20ms. It appears above two hours of chat, off-screen and nowhere near the bottom where Mei is reading. The word-found SmallLines (line 408) do the same. Mei is unlikely to notice the card.
- **The skeptic's check:** Confirmed in OnlineCampfire.tsx. `arrival` is the viewer's `me.visitedAt` (line 267). The fragment card is added at `later(arrival, 20)` (line 413) and the word-found lines at `later(arrival, 10+i)` (line 408). The fragment data has only `solvers: string[]`, with no solve timestamp, so these items cannot be placed by when they happened. Party chat messages are inserted by their real `created_at` (line 397) and the stream is sorted by `at` (line 458). So a card for a word found at 9pm sorts at 7:00pm+20ms, above two hours of later chat. The claim holds as stated. It is minor, because the fragment also has its own tab and the card still renders.

### 25. [MINOR] Garrick's "said" lines are recomputed from live state on every poll and are not stable in the stream: noticings and nudge change after being read, the nudge relocates, and the closer is stamped with new Date() on every render.

- **Where:** `src/online/OnlineCampfire.tsx`:402 (found by the *fire-logic* reviewer)
- **What goes wrong:** Mei sits down first. campfire() returns the noticings "Dev isn't here yet. There's room." and a generic nudge. When Dev arrives, the next 12s poll replaces or removes that Garrick line, and the nudge is rewritten to address whoever now has the highest named Attribute ("Dev, how would you…"). With no lead of her own, her nudge also jumps from arrival+5ms to firstPiece+5ms, below chat she has already read. The closer (line 456, hour >= 20) uses new Date() each render, so it sits after every new message, including Garrick's own reply to a question. It looks as if he says last call again after each message.
- **The skeptic's check:** The code matches the claim. I traced it in src/online/OnlineCampfire.tsx and did not check the server SQL for how noticings and nudge are built. The stream is rebuilt from live state on every render, and the page polls every 12s (line 159). Garrick's "said" lines get their timestamps from state, not from when they were first shown. (1) The closer (line 456) is stamped with new Date().toISOString() on each render, so after the 8:00pm cutoff it sorts after every message, including Garrick's own reply to a question. It never duplicates, but it stays the last bubble, so it reads as "last call" repeated under each new message. (2) The nudge (line 402) is placed at max(arrival, firstPieceAt) + 5ms. If you have no lead of your own and a piece is laid after you arrived, it jumps from just after arrival to just after the first piece, below chat you have already read. The callback is anchored to the same time. (3) Noticings are keyed to the live members list (lines 293-296) and the text of fire.nudge comes from the server on each poll. Neither is stored, so when a friend arrives they can be replaced or rewritten. The effect is cosmetic ordering and wording drift, with no data or game-logic impact, so minor severity is right.

### 26. [MINOR] load() sets an error on failure but never clears it on a later success. One failed poll leaves the error line on screen until the user acts. At dawn the stale fire stays up with a misleading message.

- **Where:** `src/online/OnlineCampfire.tsx`:149 (found by the *fire-logic* reviewer)
- **What goes wrong:** Mei returns to the backgrounded PWA, the first campfire poll fails, and a network error line is shown under the stream. Every later poll succeeds but nothing calls setError(null), so the red line stays. At 5:00am with the screen still open on last night's fire, the poll returns 'finish your day first' and the fire shows "The fire opens once your own day is done." beneath last night's question, which still says "You can change it until dawn".
- **The skeptic's check:** Confirmed in src/online/OnlineCampfire.tsx. load() (lines 147-155) calls setError on an rpc failure at line 149. On success it never calls setError(null). The 12-second poll at line 159 only runs load. Only the user-triggered call() and callTable() clear the error (lines 169, 181). So one failed poll leaves ErrorLine visible at lines 249 and 560 until the user taps something, even though later polls succeed. The dawn case also holds. If the poll returns 'finish your day first', load() sets "The fire opens once your own day is done." and returns before setFire. The old fire state stays rendered, including line 517's "You can change it until dawn", with the error line under it. The impact is cosmetic and minor. It is a real but small bug.

### 27. [MINOR] The 12s load() has no in-flight or ordering guard, and setFire/setTable are applied unconditionally. A response that started before a tap but returns after it overwrites the tap's result.

- **Where:** `src/online/OnlineCampfire.tsx`:159 (found by the *fire-logic* reviewer)
- **What goes wrong:** Mei taps "Sit by the fire". A poll that began 100ms earlier returns after the tap's response with chosen:false, so the "One more look / Sit by the fire" fork reappears with both buttons enabled for up to 12s. Taking "One more look" then fails with 'already chosen'. The same overwrite reverts a just-made pin (the strip re-opens with no names) or a just-tapped Agree. Two heavy volatile RPCs per client every 12s, plus the 15s chat poll that calls garrick_morning each time, can also overlap on a slow server.
- **The skeptic's check:** The race exists in the code, but it is narrow and self-heals within 12 seconds, so it is minor. In `src/online/OnlineCampfire.tsx`, `load()` (lines 147-155) has no in-flight guard, no sequence counter and no cancel flag. The 12s `setInterval` (line 159) calls it. It does `setFire(data)` unconditionally, then awaits `fire_table` and does `setTable(tb)` unconditionally. The tap handlers `call()` and `callTable()` (lines 167-186) also write `setFire` and `setTable` straight from their own responses. No code reconciles the two writers, so a poll that started before a tap and finishes after it will overwrite the tap's newer state. Concrete case: `fan_out_fire` returns `chosen:true`, then a stale poll returns `chosen:false` and `setFire` puts the fork back on screen. At line 196 `!fire.chosen` renders the fork again with both buttons enabled, because `busy` is already false. Tapping "One more look" then calls the roll, which the server would reject as already chosen. The same stale write can revert a pin or an Agree through `table`. It needs a poll that overlaps a tap in a window of roughly 100-300ms, so it is infrequent. The next poll corrects it. The extra concern about overlapping polls on a slow server is real but speculative. I did not check the chat poll's `garrick_morning` calls.

### 28. [MINOR] On the narrated (solitary) night the fire still prints other friends' names from fragment.solvers and promises party features that never arrive.

- **Where:** `src/online/OnlineCampfire.tsx`:408 (found by the *fire-logic* reviewer)
- **What goes wrong:** On Week 1 Day 1 (the only narrated night) Dev has already solved a word. Mei's fire says "You sit alone tonight. The others are on roads of their own." but also shows "Dev found a missing word." (the solvers list is not filtered for narrated nights, unlike the board and notes). The question strip tells her "pick to see the others'" and "The fire's call is made then." although names, readings and the call are all withheld on a narrated night.
- **The skeptic's check:** Confirmed in the code. In `campfire()`, `fragment.solvers` is built from `fragment_words` with no narrated filter (`0086_fragment_race_back.sql:268`). The client renders every solver as "X found a missing word." with no narrated guard (`OnlineCampfire.tsx:408`). By contrast, notes (`0086:263`), the thread, pins and reactions (`0092:223,243,274`) are all hidden or limited on narrated nights. On a narrated night, `pin_theory` still lets you pin, and the question strip still says "pick to see the others'" (`OnlineCampfire.tsx:487`) and "The fire's call is made then." (`:517`). Narrated nights are skipped by the dawn call (`0092:432`), and the client hides the names (`:493`). So the leak of friends' names next to "You sit alone tonight" (`:610`) and the misleading promises are both real. The impact is cosmetic and minor.

### 29. [MINOR] 'X found a missing word.' and the fragment card with its meaning question are timestamped arrival+10ms and arrival+20ms, so they appear near the top of the stream whenever they happen, not at the moment they happen.

- **Where:** `src/online/OnlineCampfire.tsx`:408 (found by the *tests-and-ux* reviewer)
- **What goes wrong:** The stream is sorted by `at`. Mei sits at the fire from 7pm; at 9pm Dev completes the fragment. `later(arrival, 10+i)` and `later(arrival, 20)` use the viewer's own arrival time, so I rendered them directly after Garrick's opener and before 'Mei came to the fire.' and all the chat. The viewer scrolled to the bottom, reading the live talk, never sees 'found a missing word' appear. The meaning question, a main interactive piece of the night, is added hundreds of pixels above them. On iOS Safari, which has no scroll anchoring, the text they are reading also shifts down as the card is inserted.
- **The skeptic's check:** Confirmed in src/online/OnlineCampfire.tsx. Lines 408 and 413 stamp "found a missing word" and the fragment card at `later(arrival, 10+i)` and `later(arrival, 20)`. `arrival` is the viewer's own `visitedAt` (line 267), and `frag.solvers` (line 81) is only a list of names with no timestamps. The stream is sorted by `at` (line 458). Chat messages, pieces and "came to the fire" lines carry real timestamps, so these entries sort a few milliseconds after the viewer's arrival, before all later talk. A viewer who arrived at 7pm, when the fragment completes at 9pm, gets the meaning card inserted high in the stream, above the live chat. I did not check scroll behaviour or iOS Safari. The placement is deliberate, since it was written to keep the fragment near the top, but it matches the described behaviour and is a minor UX flaw.

## Refuted or narrowed findings

- `src/online/GameShell.tsx`: EarlierFire keys on the party calendar, not the friend's own story position, so a late joiner playing Week 1 Day 1 sees the chat, Garrick and the party's later nights before they have met him.
  - *Why not a defect:* The claim's scenario cannot happen as written, and the gate it asks for would not change real behaviour.

1. A friend admitted on party Day 4 never plays Week 1 Day 1. `is_late_day1` (supabase/migrations/0072_gathering_pieces_late_day1.sql:15-22) is true only while `party_today` is exactly Week 1 Day 2, and only if the friend finished Session Zero after Day 2 opened. `my_today_row` (0072:65-86) sets `o_day := 1` only in that case. On Day 4, `is_late_day1` is false, so the friend gets the party's Day 4 with missed-day recaps. `close_past_days` also closes a stale Day 1 once the party reaches Day 3 (0072:35).

2. On party Day 2, the only time a late joiner plays Day 1, `party_chat_open` is false. Migration 0044 requires a calendar difference of at least 2 days (party Day 3 or later), or the caller having finished Week 1 Day 2. A late joiner on Day 1 has done neither. The shell's `chatOpen` is therefore false, and `GameShell.tsx:164` does not render `EarlierFire`. `OnlineApp` loads `chatOpen` from `party_chat_open` (`OnlineApp.tsx:406`), so it follows the same rule.

3. The calendar gate is deliberate. The comment in 0044 reads "From Day 3 on it is open to every friend, read or not (a friend who missed Day 2 is not shut out)." On origin/main, `OnlineApp.tsx:750` already showed the full `PartyChat` whenever `chatOpen` was true, whatever the friend had played. `EarlierFire` follows the same rule in the new shell, so the diff adds no regression.

4. The only way to get Week 1 Day 1 and `chatOpen` together is a transient. A late joiner mid-Day 1, or sitting on the "ON TO" button, has the page open across the 5:00am Day 3 turnover. `OnlineApp` polls every 5 seconds, but `OnlineDay` only reloads `info` on mount, a tap or `reloadKey`, so `info` can be stale for a short while. That is a narrow edge, and the chat opens to everyone at that moment by design anyway.

5. Migration 0094's "never on your Week 1 Day 1" guard covers the private `garrick_private_open` path. The shared chat was deliberately left on the calendar rule.

A strict per-user gate in `GameShell` would be harmless but is not needed for correctness.
- `src/online/FireChat.tsx`: Today's chat is hidden from an unfinished friend only in the render. party_messages has no per-day rule, so any member can read today's fire talk through the API, and the old unfiltered PartyChat is still on the page for some members.
  - *Why not a defect:* The facts are mostly true, but I don't count them as a defect in this diff.

Confirmed in the code:
- `party_messages` has only two read rules (0007 membership, 0008 `party_chat_open`). Neither looks at a per-friend day.
- `useChatMessages` loads the newest 200 rows and `EarlierFire` (FireChat.tsx ~L296-300) hides today's talk in a render filter only.
- `fire_say` would write to a server-gated table (`fire_thread`, which requires a `fan_outs` row), but the UI never calls it. The fire composer posts to `party_messages` through `sendChat`.

Why I still say not real:
1. It is not a regression. On origin/main, `PartyChat` (OnlineApp.tsx ~L750) showed every message to every member whose chat was open. The diff adds migrations: none. It narrows what the UI shows and leaves the table's rules as they were. The commit message and FireChat header describe this as a UI gate ("tonight's fire opens once your day is finished") and never claim server enforcement.
2. Nothing secret is exposed. Everything gated server-side (pieces, thread, readings, casebook, fragment words, `fire_table` and `my_fire_day`) really is gated. What stays readable is a party member reading their own party's talk. That is friends' free text plus content-free notices ("pinned a theory", "found a missing word in the Week 1, Day 3 fragment"), under the membership RLS. No other player is harmed and no privilege boundary is crossed. A friend can already read the same talk in any other chat. The only effect is a self-inflicted spoiler.
3. The path needs a deliberate API call. The app never shows today's rows to an unfinished friend, so only someone in devtools or a script can see them. That is not a realistic player flow.
4. The Session Zero half is wrong as stated. A non-host who has not done Session Zero returns early at OnlineApp.tsx ~L513 ("has let you in") and never reaches L824. Only a host without Session Zero can fall through to the unfiltered `PartyChat`. That host has no character, so they cannot play or finish any day and have nothing to spoil. The path is unchanged from origin/main, and 0044 deliberately opens the chat to everyone from Day 3 "read or not".

Minor leftover worth a note, not a bug report: if the design really wants talk gated per friend, the fire's chat would need to go through a server function such as `fire_say`.
- `src/online/OnlineCampfire.tsx`: Messages are compared to the day start as strings in mixed ISO formats. A row stamped exactly 5:00:00 (Garrick's morning line) fails `>= since` and passes `< cutoff` in EarlierFire.
  - *Why not a defect:* The code does not compare strings. OnlineCampfire.tsx:394-396 parses both sides with `new Date(...).getTime()` before `>= since`. FireChat.tsx:293-298 does the same for `cutoff` and `yesterday`. A row stamped "2026-10-18T21:00:00+00:00" therefore equals `since` numerically and passes `>=`, so the morning line is kept in the fire stream and is not shown under "Last night". The only string comparison left is the `localeCompare` sort in FireChat.tsx:42 and PartyChat.tsx:63. That sort could misorder rows by under a second when the timestamp formats differ. It does not drop or misplace any message, which was the claimed bug.
- `src/online/GameShell.tsx`: The shell mounts OnlineGathering without userId and members, so the table-talk chat on the Gathering screen is gone.
  - *Why not a defect:* Refuted. GameShell.tsx:146 does pass userId and members to OnlineGathering: `<OnlineGathering partyId={party.id} userId={userId} members={members} onClose={...} embedded />`. OnlineGathering.tsx:690-693 therefore renders PartyChat (with data-gathering-chat) whenever the Gathering has not ended. The claim that only partyId, onClose and embedded are passed does not match the code. The missing test coverage for [data-gathering-chat] may be true, but it does not affect this finding.
- `tests/online/store-and-relics.cjs`: The 'store closed at the card' check reads the Store once after fixed sleeps. I found no race in the shell or store code behind it; the flake is in the test.
  - *Why not a defect:* tests/online/store-and-relics.cjs has no changes in origin/main...HEAD, so the diff does not introduce this. The reviewer also concedes there is no product bug. The remaining claim is a timing weakness in a manual browser test script: it sleeps 2.5 s in total and reads the page once. That could log false against the slow local stand-in, but it is not a defect in shipped code. A rerun on the same day also failing is expected for a script that says it is best run on a fresh Week 1 Day 6.
- `src/online/OnlineCampfire.tsx`: Day-boundary filters compare ISO strings in different formats, so Garrick's 5:00am morning line is filed under 'Last night' and dropped from the evening fire.
  - *Why not a defect:* The claim is wrong about the code. OnlineCampfire.tsx:394-396 builds `since` as `new Date(partyDayStart(timeZone)).getTime()` and compares it with `new Date(m.created_at).getTime()`. The comparison is numeric, so '+00:00' versus '.000Z' makes no difference, and a message stamped exactly at day start passes `>= since`. FireChat.tsx:293-298 also compares epoch milliseconds (`cutoff`, `t >= cutoff`, `t < cutoff`). No string comparison of ISO timestamps happens on either path. The only `localeCompare` is at FireChat.tsx:42, which sorts messages by `created_at` among themselves; those strings come from the same source, so they share one format. The 5:00am morning line therefore lands on the correct side of the day boundary.

## Status after 18 Oct

Fixed: the Day 7 Gathering chat, and the real-time comparison (Garrick's 5:00am morning line). Everything else is open and is listed, grouped, in `docs/design/handoff-ledger.md` (pieces 1 to 9) and Section 1 of `docs/design/next-build-prompt-18oct.md`.
