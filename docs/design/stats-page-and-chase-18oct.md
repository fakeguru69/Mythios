# The stats page (the Record) and the chase: the specification (Fake Guru, compiled 18 Oct 2026)

Source: the summary Fake Guru pasted on 18 Oct from Google AI Studio, which said it had written
`docs/mythios-stats-page-and-chase-architecture.md` (that file was never in this repository, so this is the copy, written
from the pasted text). **Four wording fixes he approved on 18 Oct are applied** (marked ✎): the agreed player-facing words
come from `docs/canon/mythios-glossary-proposal.md`. The older, matching rules are in `docs/canon/mythios-core-rules.md`
("The Record"). This file is the spec for **phase D** in `docs/design/next-build-prompt-18oct.md`.

## 1. What we are trying to achieve

- **From accounting ledger to social engine.** A traditional RPG sheet is a static inventory players open only when told
  to. The Record is an active social engine that drives the daily return habit, friendly rivalry between friends, and
  loyalty to the party across all six weeks.
- **The chase.** Stats are not historical totals; they are targets to pursue: advancing Attribute tiers, holding an
  unbroken streak, earning crowns over friends.
- **Bragging rights.** The game celebrates accomplishments in front of friends automatically. Players never have to brag
  by hand or screenshot a private menu.

## 2. The three unbreakable design tenets

1. **Zero negative stats (no shame).** No number records a miss, a wound, a failure or an absence. Numbers only go up.
2. **Active player agency.** Every stat reflects an intentional choice (choosing to Press On, giving a Relic, Stepping Up
   for the party).
3. **A live in-game voice.** Stats are announced in the party chat when they happen. **Decided 18 Oct: only big moments
   are announced** (a natural 20, a badge earned, a crown taken, a new level reached); everyday counts are not, so the
   fire's chat stays a place to talk. A lost crown is never announced in public.

## 3. The twelve numbers (one ruled scoreboard plate)

One slab (purple `#180F29`, thin `#3A2555` dividers, gold Cinzel 700 numbers), four across in three rows, heading RECORD,
no row headings on the screen (the rows below are for us):

- **Show up:** **Days Played** (total days read to the last line over the season) · **Best Streak** (longest run of
  consecutive days; never drops) · **Gatherings Attended** ✎ (Gatherings you joined; was "live Sunday Gathering finales":
  the Gathering is Day 7, and the host picks the start day) · **Fragments Solved** (missing lock-words unjumbled in the
  Seeker Chest or at the fire, +25g each).
- **Together:** **Relics Given** ✎ (Relics given to friends; was "stone charms") · **Times Stepped Up** (taking the opening
  Approach roll for the party) · **Fragments Matched** ✎ (scripture lines matched at the Gathering's **Match**; was "the
  live 60-second Gathering quiz") · **Battles Won** (Gathering Battles won side by side).
- **Glory:** **Challenges Cleared** ✎ (Challenges passed; was "landmark obstacle checks") · **Challenges Pressed On**
  (the harder optional road, +4 DC, attempted, cleared or not) · **Enemies Defeated** (foes you brought down yourself) ·
  **Perfect Rolls** (each natural 20 on a Challenge or an attack; damage rolls do not count).

**Dropped, and why:** Finds (roadside clutter), Gold Earned (Days Played in disguise), Fastest Fight and Closest Call
(confusing inverted measures), Rescues (merged into Relics Given and the Lifeline badge).

## 4. The twelve badges

- An even 4 × 3 grid of round medals.
- **Unearned badges are never hidden:** shown grey with their name, as a quiet nudge.
- Tapping any badge opens what earns it and your live progress ("Charm is 38: 13 points from Adept").
- **Whole-party badges:** **The Whole Table** (every friend plays the same day) and **A Clean Night** (a flawless
  Gathering) belong to the whole party equally.
- The twelve: First Light · A Whole Week · The Long Road · Sharpened (Show up); Open Hand · Lifeline · The Whole Table ·
  A Clean Night (Together); Perfect · Never Enough · Many Hands · Down to a Thread (Glory). Each is earned once and pays
  no gold. Definitions: `docs/canon/mythios-stats-and-badges-proposal.md`.

## 5. The four bragging engines

1. **In-play chase nudges** on the cards ("Mei and Dev pressed on today." "One more Relic given and the crown is yours.").
   Build rule (18 Oct): at most one near-miss line on your own end-of-day card, only when you are close.
2. **"The Party, Yesterday"**: one card after the recap each morning, good news only, up to five lines, never repeating
   what you already saw (badges, perfect rolls, crown changes).
3. **"The Week's Best"**: in the Gathering lobby before the first beat, MYTHIOS reads one true achievement for every friend
   present (everyone gets a moment; nobody is ranked last).
4. **Season Titles**: permanent end-of-season honours (The Steady Feet, The Unbroken, The Open Hand, The Keen Eye, The
   Bold, The Lucky One).

## 6. Points where this spec and the older rules differ (for Fake Guru; decided 18 Oct unless noted)

| Topic | This spec (as pasted) | Core Rules (5 Oct) | Decided |
|---|---|---|---|
| What the chat announces | Every stat, the moment it occurs | Standout moments only (a natural 20, a badge, a new party best) | Big moments only (18 Oct) |
| "Fastest Fight / Closest Call" party bests | Dropped | Still listed as a notable moment | Dropped; the Core Rules line goes (phase D item 6) |
| The MINE / PARTY switch and the ticker | Not mentioned | Described | Retired: the day and the fire are one thread |
| The four wrong words | Present in the pasted text | Not present | Fixed here ✎ |
