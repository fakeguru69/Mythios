# Mythios Campfire v2.2 & Fan Out Clue System

Replace the legacy Campfire and placeholder Fan Out clues with the canonical 36-evening Campfire v2.2 experience where real friends and Garrick gather after each day's landmark to pool Fan Out clues, pin theories and questions to the shared board, solve the Seeker Fragment word-lock, and trade optional riddles—with zero AI-written replies on theories, zero scripted speech for real friends, and zero gold attached to theories or riddles.

## User Review & Critical Decisions

> [!IMPORTANT]
> All three conflict resolutions have been confirmed and locked into this plan:

- **Confirmed Decision 1 — Use `campfire-days.json` for All 36 Fan Out Clues**: Both the Challenge branch and Fight branch of every day's Fan Out will hand over the exact titled `fanOutClue` (`title` + `text`) from `campfire-days.json`. The *Head to Campfire* branch awards no clue and learns it from the Campfire board. The QA-only fields (`bearsOnFork` and `qaNote`) are never rendered in the player UI, and all generic fallbacks ("courier box", "Perimeter Note") are removed.
- **Confirmed Decision 2 — Keep `PARTY` Locked Until `W1·D2` Inn; Carry `1-1` Clue & Pin to `W1·D2` Board**: On `W1·D1` (*The forest road*), the player travels solo: they can earn the `1-1` Fan Out clue (*"The folded list"*) and answer the `1-1` private daily theory prompt (*"The list is a warning."* vs. *"The list is an invitation."*), while `PARTY` remains locked until the four friends and Garrick meet at *The Hollow Wake Inn* on `W1·D2`. When the first Campfire opens on `W1·D2`, the `1-1` clue and `1-1` theory pins are carried onto the Inn's board alongside `1-2` (while the underlying `1-1` data entry retains `narratedNoGarrick: true` and `riddle: null` so all 36 data entries and Acceptance Test 4 pass).
- **Confirmed Decision 3 — Pour Week 2's Extra Cup on `W2·D1` (Matching `campfire-days.json` & Barn Scene)**: The eight Cup Nights are **W1D2, W1D6, W2D1, W2D6, W3D4, W4D2, W5D4, W6D6**. On these nights, Garrick pouring one extra cup and setting it at the empty place is shown as an action-only beat with no spoken line.
- **Party Seat & Arrival Switcher for Testing Real Friends (No Scripted AI Speech)**: All scripted AI speech for Mei, Dev, and Arjun is removed. To let you test multi-friend mechanics in a single browser (**Acceptance Test 6: Pin-before-peek**, **Acceptance Test 7: Alone at the fire / message in a bottle**, **Catch-up lines**, and **Noticing templates**), the Campfire includes a clean Party Seat & Arrival Switcher so you can act as **You, Mei, Dev, or Arjun**, toggle which friends have arrived at the fire, and toggle evening state flags (*5:00am Dawn Cutoff*, *Bruised Scrape*, *Missed Yesterday*).
- **Flagged Canon Audit Notes (Preserved Unchanged per Brief)**:
  - **W3·D1 (`"The warm one"`)**: Adds Corin's remark that the men called Wren *"the warm one"* without saying why; flagged in the report against Episode 3 Day 1 chapter text and left unchanged.
  - **W2·D2 (`"The ruts"`) & W4·D1 (`"Follow them"`)**: Reuse existing `[PRESS ON]` details noted in continuity items L1 and L6; flagged in the report and left unchanged as instructed.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the evening Campfire in the party chat into a 2-to-4-minute structured, skippable investigation scene driven entirely by stored canon lines from `campfire-days.json` and the Stored-Line Engine.
- **Target Audience / Persona**: A fixed party of four real friends (**You, Mei, Dev, Arjun**) playing asynchronously or together after completing their own weekday landmark, accompanied by **Garrick** (present across all six weeks, including `W6·D3–D6`).
- **Key Value**:
  - Makes every day's Fan Out clue meaningful at the fire by pinning the exact 36 authored clues under the discovering friend's name.
  - Protects Garrick's constrained-honesty doctrine: every line he speaks at the fire is stored text—never grading theories, never answering the case question, never predicting, promising, or denying knowledge, and never using sarcasm.
  - Eliminates all unapproved Campfire/Riddle gold numbers (`+10g`, `+15g`, `+25g` in Campfire UI, ticker, and glossary).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Day Gating & Private Theory Sync**:
     - The Campfire opens for a friend only after they complete their own day's beat (or choose *Head to Campfire* in Fan Out), starting from `W1·D2` when the party forms at *The Hollow Wake Inn*.
     - If a friend already answered the private daily theory prompt in their own thread (including on `W1·D1`), that choice (`A`, `B`, or `Neither` + optional note) automatically counts as their Campfire theory pin so nobody answers twice.
  2. **Always-Visible Pacing & Navigation**:
     - Every step of the 8-part evening flow has a **Skip Step** control, and a persistent **Leave the fire** action is always visible in the Campfire header/footer, immediately concluding the evening with a rotated stored closer (*"Enough for one day."*, *"Off to bed, the lot of you."*, *"Sleep. I'll mind the fire."*, *"Same fire tomorrow?"*).
  3. **The 8-Step Evening Flow**:
     - **Step 1 — Opener (+ Cup Night & Noticing)**:
       - If the active friend is **first to arrive** at a quiet fire, Garrick opens with *"You're first. Pull up a log."* followed by the day's stored opener.
       - If the friend is **alone at the fire**, displays the **Message in a bottle** prompt (*"Leave one for the others. It goes on the board."*), delivering that note to the next friend who arrives.
       - If arriving after another friend who pinned a theory, Garrick delivers the catch-up line (*"{friend} thinks {reading}."*).
       - On the 8 **Cup Nights** (`W1D2, W1D6, W2D1, W2D6, W3D4, W4D2, W5D4, W6D6`), renders the action-only stage direction of Garrick pouring one extra cup and setting it at the empty place.
       - Fires at most **two** true **Noticing templates** (Bruised Scrape arm, solved Seeker Fragment first, lent a Relic today, back after a missed day, or naming a friend who hasn't arrived yet).
     - **Step 2 — The Board of Clues**:
       - Displays the day's Fan Out clue (`fanOutClue.title` and `fanOutClue.text`) pinned under the name of each friend who completed the Challenge or Fight branch of Fan Out today (plus the carried-over `1-1` *"The folded list"* clue on `W1·D2`). Friends who chose *Head to Campfire* learn the clue here from the board.
     - **Step 3 — The Fork & Theory Board (Pin-Before-Peek + Question Pin)**:
       - Presents the day's two readings (**Fork A**, **Fork B**) plus **Neither**, an optional one-line note in the friend's own words, and the attribute-targeted **Nudge** (`{friend:Attribute}` resolved dynamically to the friend with the highest score in that Attribute).
       - **Pin-Before-Peek**: Other friends' theory pins remain hidden until the active friend pins their own reading (or until the **5:00am party time** dawn cutoff locks the board for late readers).
       - When a theory is pinned, Garrick replies with a rotated stored acknowledgement (*"Pinned."*, *"That's on the board."*, *"Pinned under your name, {friend}."*, *"On the board. What would change your mind?"*, *"Written up where everyone can see."*)—never grading or confirming.
       - **Question Pin**: Any friend can pin an open question to the board. When the next friend arrives, Garrick reads the unanswered question aloud without answering it.
       - **Day 6 Weekly Pin Revisit**: On Day 6 evenings only, Garrick reads two pins from earlier in the week by friend name and says only: *"Those are on the board."*
     - **Step 4 — The Callback**:
       - Displays Garrick's stored callback line tying today's discovery to an earlier day.
     - **Step 5 — The Seeker Fragment Word-Lock**:
       - Displays today's Seeker Fragment and interactive letter-tile word-lock puzzle. If the friend cleared either the Challenge or Fight branch of today's Fan Out, the **first-letter hint** is wired directly into the Fragment lock-words here (with no gold badge shown at the Campfire).
     - **Step 6 — The Riddle (Tone-Aware)**:
       - On **Quiet Days** (`W1D4, W3D2, W4D3, W4D6, W5D4, W6D2`), no riddle is shown unless a friend explicitly taps **"Ask for a riddle?"**.
       - On **Wry Days** (or after tapping *"Ask for a riddle?"* on a quiet day), presents the day's canonical riddle (`riddle.q`). The player can type an answer (accepting `riddle.accept` variants case-insensitively) or tap **Give up**. After 3 wrong tries or **Give up**, reveals `riddle.a` followed by Garrick's `riddle.quip`. Awards no gold.
     - **Step 7 — What We Did Today**:
       - Displays one factual summary line per friend strictly for actions actually taken today (Challenge rolled, Fragment word solved, Relic given, Fan Out clue brought back), obeying the Match-label rule.
     - **Step 8 — Closer & Season Telemetry**:
       - Concludes with a rotated stored closer and logs evening telemetry to the Season Tracker (friends attended, theories pinned, questions pinned, riddles tried/solved, time at fire, Garrick message count capped at $\le 8$ per friend, and *Leave the fire* taps).
  4. **Gathering Opening — Reading the Week's Theory Board**:
     - At the start of each Day 7 Gathering, reads the week's pinned theories aloud by friend name and day with **no right/wrong marks and no gold**.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Dark, atmospheric tabletop ledger and hearthlight UI (`#0D0714` deep night canvas, `#150D22` structural surfaces, `#1E1232` party cards, `#D4B876` aged brass borders, `#F0A552` hearth amber for Garrick).
  - *Typography & Hierarchy*: `Cinzel` for chapter headers and structural labels, `Cormorant Garamond` for narrative prose, clues, and Garrick's spoken lines, and `Plus Jakarta Sans` / tabular monospace numerals for interactive controls and counts.
  - *Restraint & Anti-Slop Discipline*: Clean unboxed metadata with middle-dot (`·`) separators, single-level card elevation, no thick left borders, and plain human control labels (*"Pin to Board"*, *"Skip Step"*, *"Give up"*, *"Leave the fire"*).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Pure Stored-Line Engine at the Fire**:
  - *Chosen Approach*: Every line Garrick speaks during the Campfire flow comes from `campfire-days.json` or the locked Section I / Section C stored pools, with stateful rotation so the same line is never sent twice in a row and Garrick sends at most 8 messages to one friend per evening.
  - *Why*: Guarantees 100% compliance with Garrick's three-verb rule (never predicts, never promises, never denies knowing) and prevents any AI hallucination or theory grading.
- **Decision 2 — Identical Fan Out Clue Across Challenge and Fight Branches**:
  - *Chosen Approach*: Refactor the Fan Out data model so both Branch A (Challenge) and Branch B (Fight) reference the single canonical `fanOutClue` (`title` and `text`) for that day from `campfire-days.json`, while Branch C (*Head to Campfire*) yields no clue.
  - *Why*: Ensures every friend who takes an optional Fan Out risk brings back the exact authored clue vetted against the 7 mystery tests and the first-use week map.
- **Decision 3 — Full Week 6 Garrick Presence**:
  - *Chosen Approach*: Remove all `W6·D3–D6` Garrick-absence flags, remove the *"GARRICK'S SEAT BY THE FIRE IS EMPTY"* banner, keep Garrick in the Campfire speaker bar for all weeks, and keep the Store open throughout Week 6.
  - *Why*: Aligns with canonical Episode 6 scenes where Garrick remains with the party right up to the Episode 6 Gathering reveal.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                   Canonical Campfire Data & Rule Layer                    │
│  ┌──────────────────────────────┐   ┌──────────────────────────────────┐  │
│  │   36-Evening Canon Dataset   │   │   Stored-Line & Noticing Engine  │  │
│  │  (Opener, Fork A/B, Callback,│   │  • No-repeat rotation (Sec I)    │  │
│  │   Riddle, Nudge, Cup Night,  │   │  • Max 2 true Noticings (Sec C)  │  │
│  │   Tone, Exact FanOutClue)    │   │  • Max 8 Garrick msgs / evening  │  │
│  └──────────────┬───────────────┘   └─────────────────┬────────────────┘  │
└─────────────────┼─────────────────────────────────────┼───────────────────┘
                  │                                     │
                  ▼                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Shared Party & Evening State Store                     │
│  • Per-Friend Day Completion Gate & Arrival Roster (You, Mei, Dev, Arjun) │
│  • Private Daily Theory Prompt ↔ Campfire Theory Pin Sync (A / B / Neither│
│    + optional own-words line, locked at 5:00am party time)                │
│  • W1·D1 Solo Clue & Pin Carryover onto W1·D2 Hollow Wake Inn Board       │
│  • Question Pins & Message-in-a-Bottle Queue (for solo arrival)           │
│  • Fan Out Clue Board (Challenge === Fight clue; Head to Campfire = none) │
│  • Evening Telemetry Logger (Season Tracker metrics & 2–4 min timer)      │
└─────────────────┬─────────────────────────────────────┬───────────────────┘
                  │                                     │
                  ▼                                     ▼
┌────────────────────────────────────┐ ┌────────────────────────────────────┐
│     Campfire 8-Step Evening UI     │ │     Gathering Opening & Audits     │
│  1. Opener + Cup Night + Noticing  │ │  • Reads Week's Theory Board aloud │
│  2. Board of Pinned Fan Out Clues  │ │    at Gathering start (no gold,    │
│  3. Fork (Pin-before-peek) & Q-Pin │ │    no grading marks)               │
│  4. Callback                       │ │  • Automated 36-Day QA & First-Use │
│  5. Seeker Fragment + 1st-Letter   │ │    Verification Suite (banned      │
│  6. Riddle (3 tries / Give up)     │ │    words, early names, gold,       │
│  7. What We Did Today (factual)    │ │    Challenge === Fight clue test)  │
│  8. Closer + Always-on Leave Fire  │ │                                    │
└────────────────────────────────────┘ └────────────────────────────────────┘
```

### Data Model & State
- **Canonical Evening Record (`CampfireDayEntry`)**: Stores `week`, `day`, `id`, `place`, `narratedNoGarrick`, `tone` (`'wry' | 'quiet'`), `cupNight`, `opener`, `forkA`, `forkB`, `callback`, `riddle` (`q`, `a`, `quip`, `accept`, `maxTries`), `nudge`, and `fanOutClue` (`title`, `text`, `source`, plus internal QA-only `bearsOnFork` and `qaNote` excluded from UI props).
- **Theory & Question Board State (`DayBoardState`)**:
  - `theoryPins`: Map of friend ID (`YOU | MEI | DEV | ARJUN`) to `{ reading: 'A' | 'B' | 'NEITHER'; customLine?: string; timestamp: string; fromPrivatePrompt?: boolean }`.
  - `questionPins`: Array of `{ id: string; author: FriendId; questionText: string; readToNextArrival: boolean }`.
  - `bottleMessage`: Optional `{ author: FriendId; text: string }` left when a friend is alone at the fire and shown to the next arriving friend.
  - `isPastDawnCutoff`: Boolean toggle representing 5:00am party time (locks new pins while allowing late friends to read the board).
- **Evening Telemetry (`CampfireEveningTelemetry`)**: Tracks `friendsAttended`, `pinsCount`, `questionsPinnedCount`, `riddleTries`, `riddleSolved`, `durationSeconds`, `garrickMessagesSent` (enforcing $\le 8$), and `leaveFireTaps`.

### Interactive Component & State Mapping
- **Fan Out Payoff Synchronization**: Completing either the Challenge branch or the Fight branch in `StoryTabView` unlocks the day's first-letter Seeker hint and pins `dayEntry.fanOutClue` (`title` + `text`) to the day's Campfire Clue Board under the active friend's name. Choosing *Head to Campfire* marks the day finished and opens the Campfire immediately without pinning a clue.
- **Attribute Nudge Resolution**: Parses `{friend:Attribute}` tokens in `nudge` against the party's current Attribute scores (`You`, `Mei`, `Dev`, `Arjun`) and substitutes the name of the friend with the highest score in that Attribute today.
- **Automated Verification Script**: A standalone verification script and in-app QA verifier that programmatically audits all 36 evenings and all 36 clues against:
  1. The Part 2 **First-Use Map** (`Order` < W3D1, `four children`/`four names` < W2D1, `king` < W2D5, `Malakor` never, `fifth`/`five` < W3D3, `moon-blood` < W4D4, `Highwall` < W5D1, `heartbeat` < W4D6).
  2. The **Banned Phrase List** (`maybe`, `perhaps`, `possibly`, `"I promise"`, `"I don't know"`, `"couldn't say"`, `"wouldn't know"`).
  3. **Zero Gold Mentions** (`+\d+g`, `gold`, `coins`) and **Zero Generic Fallback Text** (`courier box`, `waxed tally-strip`, `Perimeter Note`).
  4. **Branch Clue Identity Proof**: Asserts across all 36 days that `branchA` (Challenge) and `branchB` (Fight) return the exact same `title` and `text` as `campfire-days.json`, while `branchC` (*Head to Campfire*) returns no clue.
