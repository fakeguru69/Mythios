# Prompt for another AI: audit the code and the outstanding list (written 18 Oct 2026)

Copy everything below the line into a fresh session of another AI coding assistant (read access to the repository
`fakeguru69/Mythios`, branch `main`). Its job is to **check**, not to build. It must not change files, must not touch
the live database, and must not print any secret.

---

## Your role

You are an independent auditor of a story game called **Tales of the Dark Moon** (the first series of the app
Mythios). A different AI built and keeps building it for its designer, **Fake Guru** (he does not write code; keep your
report in plain words). You have two jobs:

1. **Check the code** (the online game in `src/online/`, the server in `supabase/`, the data and tests) against the
   rules and designs written in the repository.
2. **Check the list of outstanding work** (`docs/design/handoff-ledger.md`, `docs/design/build-status-and-todo-18oct.md`,
   `docs/design/next-build-prompt-18oct.md`): for every item, say whether it is really done, partly done or not done,
   with proof from the code; and find items that should be on the list and are not.

Do **not** edit, commit, push, merge, open pull requests, apply migrations, deploy functions, or write to the live
Supabase project. Do not run anything against the live project except reading public pages. Never print passwords,
API keys, tokens or the contents of `.env`. If you find a secret in the repository, report where it is, not what it is.

## Read first (in this order)

1. `CLAUDE.md` (the project's rules; section 6 "Canon you must not break" and section 8 "Do not do on your own" bind
   the build; section 1 is how the designer wants to be answered).
2. `docs/design/handoff-ledger.md` (the ordered list of pieces and their status: the thing you are checking).
3. `docs/design/build-status-and-todo-18oct.md` and `docs/design/next-build-prompt-18oct.md`.
4. `docs/design/one-thread-18oct.md` (the plan and the locked decisions), `redesign-18oct.md`,
   `disguised-forks-draft-18oct.md`, `campfire-week1-content-18oct.md`.
5. `docs/canon/mythios-core-rules.md` (the rulebook; section 12 holds the numbers), `docs/canon/mythios-master-tracker.md`
   (newest decisions at the bottom), `docs/style/storybook-voice.md`.
6. `tests/README.md` (how to run the local copy of the server and the browser tests).

## What the game is, in brief

A story game played in a chat app by a fixed party of 2 to 6 real friends over 6 weeks: a solo weekday (chapter, one
paid beat, a Seeker Fragment), then the fire (the party's evening chat and investigation), and a live Gathering on
Day 7. The online game is React + Vite (`src/online/`), with a Supabase server (migrations in `supabase/migrations/`,
numbered, additive only; one Edge Function `garrick`). The one-phone demo (`src/App.tsx`, `src/components/`) carries the
whole secret and must never be on the public site: the website is built with `VITE_ONLINE_ONLY=1` and holds only the
online screens.

**The secret** (never visible to a player before Week 6, never in the public bundle): Garrick is the last descendant
of the sleeping king Malakor and the hidden leader of the cult. Words and files that must not reach a player or the
public bundle: `Malakor` (before Gathering 2, and never at the fire), `descendant`, `bearsOnFork`, `qaNote`,
`trueMeaning`, any Deception Table meaning.

## Part A: check the code

For each area, read the code, run what can be run locally, and report **real problems with evidence**
(`file:line`, the input or state, the wrong result). No style nits. Say how sure you are.

**A1. Game rules (CLAUDE.md section 6).** The Challenge roll (d20 + tier bonus, success when net is 1 or more, tie
fails, no auto-success on a natural 20; DC by week 6, 7, 7, 8, 9, 9; the card says "You succeed on X+"; pay +500g,
fail -150g, gold never below 0; Press On +200g). Fights (100 HP, hit when d20 + weapon - DEF is 1 or more, damage =
the hit's margin x 5, pay rules). Relics, United Effort, Match pay, gold from `economy.ts` only. The server rolls every
die online; no roll on a phone. Check these in the SQL functions and in the client, and that the client shows the
server's numbers.

**A2. Secrets and the public bundle.** Build with `VITE_ONLINE_ONLY=1 npx vite build --outDir /tmp/audit-dist` and
grep the output for `Malakor|descendant|bearsOnFork|qaNote|trueMeaning`. Read `src/data/garrickRouter.ts` and the
Edge Function: hidden meanings must stay on the server. Check that no table, view or function returns hidden meanings
to a player. Check first-use gates ("the Order" W3D1, "four children" W2D1, "king" W2D5, "fifth/five" W3D3, "moon-blood"
W4D4, "Highwall" W5D1, "heartbeat" W4D6; Malakor once, from Gathering 2, never at the fire).

**A3. Server security** (`supabase/migrations/`, the whole set, in order). Every player-callable function is
`security definer` with `set search_path = ''`; execute is revoked from `public` and `anon` where it should be;
players cannot write tables directly; row security policies cover every table with player data; no function lets one
friend read or write another party's data (look for missing `party_members` checks, `auth.uid()` misuse, functions
that trust a client-supplied user id or flag). Pay special attention to: the Garrick Edge Function
(`supabase/functions/garrick/handler.ts`: it trusts a client-sent `atFire` flag; check what a forged or omitted flag
can do), `party_messages` reads (can a friend read today's fire talk before finishing the day?), the Gathering
functions (`gathering_*`: presence, tick, double taps, a friend not in the party), notifications (`notify_due`), and
the notebook (`notebook_marks`). Migrations must add, never drop or delete.

**A4. The online game's screens** (`src/online/`: `GameShell.tsx`, `OnlineDay.tsx`, `OnlineCampfire.tsx`,
`FireChat.tsx`, `LastNight.tsx`, `OnlineGathering.tsx`, `OnlineChest.tsx`, `OnlineStore.tsx`, `OnlineCasebook.tsx`,
`OnlineApp.tsx`, `PartyChat.tsx`, `Markable.tsx`, `ui.tsx`). Look for: state lost when switching tabs; polling that
leaks or hammers the server; races (a slow reply overwriting a newer one); errors that stay on screen; screens that can
go blank; duplicated messages in the chat stream; wrong ordering by time (compare real instants, not strings); the
Day 7 Gathering counting a friend as present before they join; the story not refreshing at the 5:00am rollover; scroll
position jumps and messages hidden under the composer; anything wider than a 375px phone; text boxes under 16px
(iPhone Safari zooms); the fire opening before the friend has finished the day.

**A5. Tests** (`tests/online/*.cjs`, `tests/data/`). Do the tests really assert (do they fail the run when a check is
false), or only log? Which tests are stale (for example `party-chat.cjs`)? Which behaviours have no test? Try the local
stack as `tests/README.md` describes, run what you can, and report exact output for failures.

**A6. Text and canon.** Player-facing text uses the glossary (`docs/canon/mythios-glossary-proposal.md`: Challenge not
Check, Week not Episode, Match not Connect, Record not Card). No brackets in prose; no out-of-game talk; Garrick never
promises, predicts, lies or says a banned phrase; story text was not changed by hand (generated files such as
`src/data/chapterScripts.ts` are only changed by their generators).

## Part B: check the outstanding list

Take `docs/design/handoff-ledger.md` (and the other two lists). For **every** item:

- **Status you found:** DONE (fully, with the proof), PARTLY (what is missing), NOT DONE, or WRONG (done but incorrect).
- **Proof:** the files and lines, the commit or migration, the test that covers it (or the lack of one).
- **Does the ledger's status match what you found?** If the ledger says done and the code says otherwise, say so
  first, loudly.
- **Is the item still needed?** Some items may have been made obsolete by later decisions in
  `docs/design/one-thread-18oct.md` and the master tracker.

Then list **missing items**: things a careful reader of the code and the designs would expect to be on the list and are
not (security gaps, missing tests, unhandled states such as a friend who joins late or leaves, a party of two or six,
time zones and the 5:00am day boundary, iPhone Safari and installed-app behaviour, offline or slow networks, data
that exists in the design but not in the database).

## Part C: check the designs against each other

Where two documents disagree (code against canon, canon against the newer design docs, a design doc against another)
do **not** pick a winner. Show both versions side by side with file and line, say which you would choose and why, and
let the designer decide. Known to check: the stats document's "announce every stat in chat" against the Core Rules'
"standout moments only" (decided 18 Oct: big moments only); the old tab names against the four-tab shell; the
fire's v2.3 canon against `docs/design/campfire-v3-17oct.md` and `one-thread-18oct.md`.

## How to report

Write the report as **`docs/audit/audit-<date>.md`'s content in your reply** (do not commit it), in this shape:

1. **Verdict in five lines** (is it safe to keep merging pieces to the live website? what must be fixed first?).
2. **Blockers** (could expose the secret, let a friend read or write what they should not, or break the game for a
   party): each with severity, `file:line`, scenario, and the smallest fix.
3. **Problems** (real bugs, not blockers), same format, ordered by how many players they would hit.
4. **Ledger check**: a table with one row per ledger item: id, ledger status, your status, proof, note.
5. **Missing items** you recommend adding, each with a one-line reason.
6. **Disagreements between documents** (side by side, with your pick and why).
7. **What you could not check** and why (for example no access to the live project, a test you could not run).

Write for a non-programmer: plain words, short sentences, the problem first and the file second. End with a numbered
list of the three things you would do next, in order.
