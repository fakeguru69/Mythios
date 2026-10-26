# Getting ready, and the app's three levels (26 Oct 2026)

Fake Guru tried the sign-in and invite with two phones and asked for both to be simple: "make sure the sign in and invite process work simply", and "the hierarchy is clear as how to operate it is intuitive". This is what was wrong and what was built.

## What went wrong on the night

- **The confirm-email button opened "Log in to Vercel".** The server's Site URL was a Vercel address that sits behind Vercel's own login. It is now `mythios.vercel.app`.
- **Signing up again with an email that already had an account** waited for an email that never came. It now signs in instead, or says "You already have an account with this email."
- **Email was hidden behind a "USE EMAIL AND A PASSWORD" button,** though it was the only way in. The form now shows at once, and the button returns only once Google sign-in is switched on.
- **START THE STORY was grey with no clear reason.** It said only "Needs two of you ready", and the day it would start was hidden behind the button.
- **Nothing told the host that a friend had knocked,** unless the host happened to be on the party page.
- **"← Your stories" sat on the friend's let-in screen** and led out of the party to the shelf. Nothing led back from making a character.
- **In the game, the party sheet hid behind small text** ("party name ▾"). Its sections were called "The Fellowship", "Chronicles of the Road" and "Campfire: Party & Character Settings", and the last clashed with the real Campfire.

## The three levels

1. **Mythios home** (your stories, start or join a party, your account). You see it only with no party yet or more than one; one party opens straight into it.
2. **Your party, before the story starts: "Getting ready".** One screen, numbered steps in the order they happen:
   - **① Your character:** MAKE YOUR CHARACTER, or "You play Rosa, Sage."
   - **② Your friends:** who is here and whether each is ready ("Making their character…"), anyone asking to join with LET IN / NOT THIS TIME, and the link with SHARE and COPY.
   - **③ Start the story:**
     - the day Day 1 opens, chosen right there;
     - START THE STORY;
     - one plain line saying why it cannot start yet ("Make your character first.", "Invite at least one friend.", "Waiting for Sam to finish making a character.").

   Once started, it says "The story starts tomorrow, at 5:00am." Alerts sit below, and **Party settings** fold away at the foot: the clock, your name, a new link, All your stories, Sign out, and Leave.

   Making a character opens from step ①, and its only way out is "‹ Back to the party".
3. **Your party, once started: the game.** It has four tabs (STORY · RECORD · BAG · STORE). One button, **☰ party name**, opens the party sheet:
   - **Your party:** friends and their status; the knock and invite on Days 1 and 2.
   - **This week:** the Gathering.
   - **Settings:** alerts, clock, name, Leave, All your stories, Sign out.

   A red dot on ☰ means someone is asking to join.

## Phone alerts while getting ready (`0140`)

| What happens | Who is told |
|---|---|
| A friend knocks: "Sam is asking to join The Lanterns." | The host |
| The host lets them in: "You're in The Lanterns. Make your character." | The friend |
| The host starts or moves the day: "The Lanterns sets off. Day 1 opens at 5:00am on Tuesday 27 October." | Every friend |

## Files

`src/online/OnlineApp.tsx` (Getting ready, the sign-in form, the party sheet's sections), `src/online/GameShell.tsx` (the ☰ button and its dot), `supabase/migrations/0140_alerts_for_getting_ready.sql`, `tests/data/getting-ready-alerts.sql`, and the browser tests (`party-and-session-zero.cjs` passes on the local copy; `party-chat.cjs` and `refresh.cjs` were brought up to date).

## Capital letters: one rule (26 Oct, Fake Guru: "check all capitalization consistent")

- **A button that does something** is short and in capitals: START A PARTY, MAKE THE INVITE, LET IN, NOT THIS TIME, SHARE, COPY, REMOVE, LEAVE THE PARTY, SIGN OUT, NEW INVITE LINK, NOT NOW, STRIKE INSTEAD, TAKE IT OUT.
- **A link that takes you somewhere** is in sentence case and starts with ‹: ‹ Back to the party, ‹ All your stories, ‹ Back. A question-style link is the same: "Already playing? Sign in", "Have an account? Sign in", "Forgot your password?".

  Before this, five styles were in use: ← The party, ← Back, BACK TO THE PARTY, Back, ‹ Back to the party.
- **Story choices stay in sentence case** (25 Oct). They are whole sentences, and capitals make them hard to read.
- **Headings** are in the gold Cinzel title style. Small labels above them (Getting ready, Your party, This week, Settings, Embark on an adventure, Featured series) are in small capitals.

## The cover (26 Oct)

Fake Guru: "didn't we have a nicer cover page… it's our first impression". The 24 Oct trim had taken out more than the spoiler, so the welcome is back:
- "Embark on an adventure";
- "A story told a little each day, to you and your friends.";
- "One party. Ten minutes a day. A dark fantasy told only to your group.";
- Featured series;
- one line on how it plays, without the "ritual" spoiler;
- "6 weeks · 2–6 players · Daily chapters";
- GATHER YOUR FRIENDS.

It still fits one screen on the smallest iPhone.
