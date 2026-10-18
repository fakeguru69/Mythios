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
