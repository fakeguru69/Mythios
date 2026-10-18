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
