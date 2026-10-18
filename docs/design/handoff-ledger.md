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
| 3 | **Scrolling.** Tab switches keep each tab's scroll; new chat messages (yours too) scroll into view above the composer; the "+" tray gets a maximum height and scrolls. | IN PROGRESS | The code was written (commit `3e67284` on branch `ccr-a7850714-ouedaq`: `GameShell.tsx` keeps each tab's scroll; `FireChat.tsx` has `useKeepNewInView` and a tray max height; `OnlineCampfire.tsx` uses it) and the test `tests/online/scroll.cjs` was written (commit `d393dd9`) but neither was run. They were set aside from the merge of 18 Oct (a revert commit) so untested code is not on the website; to resume, `git revert` that revert commit, run the scroll test on the local copy, fix what fails, merge. |
| 4 | **Fire stream correctness.** Each notice once (no duplicates of "finished the day" / "found a word"); events placed at when they happened, not at your arrival; Garrick's noticing and nudge lines stable once read. (Done 18 Oct, outside the piece: a solitary night, Week 1 Day 1, shows no friends' names, no "others" hints and no party promises; checked by `day1fire` test run.) | TODO | |
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
in the stats document (Sunday, check/obstacle, quiz, stone charms) are APPROVED and APPLIED (18 Oct): the stats file was never in the repo, so it was written from his pasted text as `stats-page-and-chase-18oct.md`; the solitary-night line is REMOVED (Fake Guru, 18 Oct: "keep it solitary, don't mention others": Week 1 Day 1's fire shows no friends' names, no 'came to the fire', no words-found names, no answers); reading and approving each week's drafts in E.
