# START HERE: how to hand this build to another AI (written 18 Oct 2026)

For Fake Guru. You can use the files in this order. Everything the other AI needs is in these files; nothing depends on
the chat that made them.

## The files (download these)

| File | What it is | Use it for |
|---|---|---|
| `START-HERE-for-AI-Studio.md` | This page | You |
| `CLAUDE.md` | The project's rules, canon numbers, the secret, who you are and how to answer you | Upload it to every AI; it must read it first |
| `FULL-HANDOFF-18oct.md` | Five documents in one: the ordered list of pieces, the full brief, the Campfire redesign plan, the build status, the audit report of the redesign | The builder reads it all |
| `audit-prompt-for-another-ai-18oct.md` | The prompt that tells an AI to CHECK the code and the to-do list (it builds nothing) | The auditor |
| `next-build-prompt-18oct.md` and `handoff-ledger.md` | The same builder brief and the ordered list, as separate files (they are also inside the big file) | Optional: easier to read one at a time |

## If the AI works inside the repository (Google AI Studio with the GitHub repo)

1. Tell it to `git pull`. Pieces 0, 1 and 2 are on `main`. Piece 3 (scrolling) is half-written, untested, on the branch
   `ccr-a7850714-ouedaq` and not on `main`. Safest: pull `main` and redo piece 3 from the ledger's notes; or pull that
   branch, run the scroll test first, and fix what fails.
2. Paste the builder prompt below.

## If the AI cannot see the repository (it only has uploaded files)

It can read and plan from the files, but it cannot run or change the game's code. Use it as the **auditor**, or to
**draft content** (the Week 1 forks and fire content in phase E), and send the result back to Claude Code to build.

## Paste this to the BUILDER

> You are continuing the build of a story game called Tales of the Dark Moon for its designer, Fake Guru. Read, in this
> order: `CLAUDE.md` (the rules; they bind everything you do and the way you answer), then `FULL-HANDOFF-18oct.md` Part A
> (the ordered list of pieces) and Part B (the full brief). Part C is the Campfire redesign plan and Part E is the audit
> report of the redesign: read them before touching the fire.
> Do **one piece at a time**: the first row in the ledger whose status is TODO or IN PROGRESS. For each piece: build it,
> test it (`npm run lint`, `npm run build`, the online-only build and the leak check in `CLAUDE.md`, and the browser
> tests the piece touches), commit with a message that says exactly what was done, merge it, then update the ledger row
> (status, date, what was tested) in the same commit and say plainly what you did.
> Never invent numbers. Never change story text, Garrick's lines, fragments or Campfire lines without Fake Guru's
> say-so. Never show the secret (the word Malakor, "descendant", `bearsOnFork`, `qaNote`, `trueMeaning`) to a player or
> in the public website build. Never claim something is done unless you checked it in the code or ran it.
> End every reply to Fake Guru with a numbered list of exactly what he must do next, and remind him of what you are
> waiting on. Use plain, simple words.

## Paste this to the AUDITOR

> Read `audit-prompt-for-another-ai-18oct.md` and do exactly what it says. It tells you which files to read first
> (`CLAUDE.md`, then `FULL-HANDOFF-18oct.md`), what to check in the code and the list, and how to report. Do not change
> anything; report only.

## What is waiting on Fake Guru

Approve or change the solitary-night line ("You sit alone tonight. The others are on roads of their own."); the four
wording fixes in the stats document (Sunday, check/obstacle, quiz, stone charms); Google sign-in setup; terms and
privacy before launch; deleting the test accounts before launch; reading and approving each week's drafts in phase E.
