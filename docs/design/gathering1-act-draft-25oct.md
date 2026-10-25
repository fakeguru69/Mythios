# Gathering 1: one heartbeat, one act (draft for Fake Guru, 25 Oct 2026)

*Renamed in the 25 Oct audit: the moment is now "One breath", and its lines say "One breath before…". "Heartbeat" may not be said before Week 4 Day 6 (CLAUDE.md §6), and Gatherings 1 to 3 come before it. The text below is the draft as approved; the episode files hold the words in play.*

Phase 4, part 1, option (a): one "tell them what to do" moment in every Gathering, on Gathering 6's model (one friend
acts, the others have thirty seconds to say what). This is Gathering 1's, for you to read before anything is built.
Nothing here is in the game yet.

## Where it goes

In "The United Effort", straight after the floor gives under the friend in the drop and before "This is a United
Effort." The friend in the drop is canon's Dev ({RISK} in the game); the friend who acts is another friend, picked at
random (in a party of two, the other friend; alone, the moment is skipped).

## The scene

> Mei is nearest. One heartbeat before the boards go again.
>
> **Everyone else: you have thirty seconds. Tell Mei what to do.**

*After thirty seconds, in Mei's own thread, and Mei's alone to choose. Mei has twenty seconds; no tap is* stay where
you are*:*

> `[GO OUT NOW]` flat on your belly, onto the boards, before anyone has your ankles
> `[THE NEW PROP]` wrench the new pit-prop loose and lay it across the hole
> `[STAY WHERE YOU ARE]`

*Go out now:*
> Mei is out on the boards before anyone can say a word, flat, arms reaching. A board cracks under one knee, and holds. Mei's fingers close round Dev's wrist, and do not let go.

*The new prop:*
> The prop comes away from the wall with a shriek of new nails. Mei slides it out across the hole, and Dev gets one elbow over it. Above you, the roof gives a long, low groan, and a trickle of grit runs down where the prop used to be.

*Stay where you are:*
> Mei does not move. In the time it takes to breathe out, the rest of you are there too, at the stone edge, together, and nobody is out on the boards alone.

## What it changes (no numbers)

- **Go out now:** Mei takes the United Effort's first turn (today the first turn goes to the friend lightest on their feet).
- **The new prop:** the line about the prop is said, and in "The discovery" the slab's line gains one sentence: *"Grit is still falling from the place the prop came out of."*
- **Stay where you are:** nothing more; the night goes on as written.

The bars, the rolls and the pay stay exactly as Core Rules §5 sets them.

## To build, once you say yes

The engine's one-friend pick (Gathering 6's act) is tied to that night in three places (`gen-gathering-sql.ts`, the
`{CHOSEN}` token, and the summary card's `{pick:N}`). Gathering 1 needs it to work for any Gathering, plus the first-turn
rule. About one migration and one generator change, tested on the local copy before it goes live.
