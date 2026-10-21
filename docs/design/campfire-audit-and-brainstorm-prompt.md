# AUDIT PROMPT: Comprehensive Review & Brainstorm of the MYTHIOS Campfire

**To the Auditor / Reviewer:**
You are asked to conduct an unsparing, deep-dive audit and creative brainstorming session on the **Campfire** in *MYTHIOS: Tales of the Dark Moon*. 

Please review the game's design documents, canon lore, live implementation code, and campfire datasets:
- Design & Architecture: `docs/design/campfire-v3-17oct.md`, `docs/design/one-thread-18oct.md`, `docs/design/campfire-week1-content-18oct.md`
- Canon & Guidelines: `docs/canon/mythios-core-rules.md`, `docs/canon/garrick-deception-table.md`, `docs/canon/mythios-campfire-table-v2.md`
- Source Code & UI: `src/online/OnlineCampfire.tsx`, `src/online/FireChat.tsx`, `src/online/OnlineDay.tsx`, `src/components/CampfireEveningView.tsx`
- Content Datasets: `src/data/campfireDaysData.ts`, `src/data/fanOutLeads.ts`, `src/data/fragmentMeaningQuestions.ts`, `src/data/weekQuestions.ts`, `supabase/migrations/0105_campfire_week1_data.sql`, `supabase/migrations/0108_campfire_weeks_2_to_6.sql`

Evaluate the Campfire against its core design premise, and deliver a rigorous, honest critique and actionable brainstorming improvements across the following sections:

---

## 1. Core Mission: Organic, Asynchronous & Live Camaraderie
*The primary goal of the Campfire is to promote organic, collaborative play after the structured daily solo chapter. It must encourage friends to solve mysteries together (daily, weekly, thematically), whether playing live or hours apart, while deepening their bond with each other and with Garrick.*

- **Did we achieve organic, social play?** Or does the Campfire feel like a checklist of buttons to click before logging off?
- **Async vs. Live dynamics**: How does the experience feel if Player A finishes at 8:00 AM and Player B finishes at 9:00 PM? Is Player B rewarded for seeing Player A's footprints and clues, or does it feel disjointed and empty?
- **Camaraderie & Emotional Resonance**: Do players genuinely feel like weary travellers sharing a fire after a hard road, or does the UI feel like an investigation whiteboard with an NPC chatbot? Where is the warmth?

---

## 2. Interface, UX & "One-Thread" Flow
*We decided to make the Campfire an extension of the daytime play within a unified story thread, rather than a disconnected separate tab.*

- **Is the transition from the day's Pull to the campfire natural?** Does reaching the campsite feel like a relief and a narrative milestone, or an abrupt interface shift?
- **Screen clutter & cognitive overload**: Currently, the Campfire contains:
  1. The night's opening narration / Garrick opener
  2. The table of laid pieces (leads, notice lines, pass/press finds, fork finds)
  3. Tonight's Puzzle with interactive "Clicks"
  4. The Secret Theory Pinning (Readings A / B / Neither) with Agree/Doubt reactions
  5. The Chat stream with Garrick banter, friend messages, and the "+" action drawer
  6. The Seeker Fragment word-matching / meaning card
  7. Rituals: The extra cup on cup-nights
- **Component Auditing**: Are there too many moving parts? Do players need to toggle between cards, chat drawers, and tables? 
- **What should be streamlined, merged, or completely removed?**

---

## 3. The Clues (Fan Out Leads) & The "Click" Mechanic
*During Fan Out, players pick a lead to bring back a piece of evidence. At the fire, when two specific pieces are laid down, they "click" into a revelation.*

- **Clue quality**: Are the clues truly meaningful, or do they read like flavor text / generic NPC trivia?
- **The Jobs of a Clue (Reveal, Tilt, Turn, Link)**: Did the clues succeed in tempting plausible alternate theories without breaking canon? Or are they too dry and forensic?
- **The Click Moment**: When two pieces snap together to solve "Tonight's Puzzle", does it feel like a genuine "aha!" detective breakthrough, or an automated database query?
- **Payoff vs. Red Herring**: Do the clues provide real closure and narrative payoff, or do players feel misled in an unsatisfying way?

---

## 4. Theory Pinning & "Tonight's Question"
*Every night poses one debated question. Players pin their theory secretly, the fire reveals what everyone thinks (often triggering a split or consensus), and dawn stamps the party's call.*

- **Debate vs. Obviousness**: Is there real meat for players to disagree on? Or is one reading obviously correct while the other is transparently a decoy?
- **Read-Back Timing**: Fake Guru's rule states: *"Everyday, we know a bit more. There must be payoff within the week."*
  - Do the read-backs (in the morning recaps or at the Gathering) land with emotional weight?
  - Does the party feel vindicated or stunned when the truth arrives? Or has everyone forgotten what they pinned 3 days ago?

---

## 5. The Seeker Fragments & "Meaning Questions"
*Seeker Fragments are designed to provide the greatest clarity and gut-punch on hindsight (especially at the Gatherings and Finale).*

- **Hindsight Gut-Punch**: Do the fragment lines hit hard when re-read after the week's revelation?
- **The Meaning Question**: When the two words are solved, a card poses a question (e.g., *"They wept for him before they feared him. What changed between the two?"*).
  - Does the Campfire adequately guide players to discuss what this scripture means?
  - Or is the fragment treated as a minigame puzzle that gets tucked into the bag and ignored?

---

## 6. Garrick: Host, Guide, or Intrusion?
*Garrick never lies; he never investigates or concludes. He pours the wine, observes, nudges the quietest player, and hides in plain sight.*

- **Tone & Persona**: Does Garrick sound like a believable, weary innkeeper with ancient secrets, or does he sound like a scripted game-master giving prompts?
- **Nudge Effectiveness**: Do his nudges (e.g., *"{friend}, boot-mud straight to the bed... where did that paper come from?"*) effectively guide conversation toward the mystery, or do they feel robotic?
- **The Quiet Nights & Cup Nights**: Do the moments of silence and the unmentioned extra cup build tension and mystery, or are they lost on the player?

---

## 7. Prose & Literary Quality
*The prose must read like a beloved, well-crafted book—spare, rhythmic, evocative, and a genuine pleasure to read.*

- Read through the openers, clue texts, click texts, and callbacks in `src/data/campfireDaysData.ts`.
- Does the writing maintain the high bar of canon prose?
- Are there places where sentences become clumsy, modern, overly game-mechanical, or repetitive? Point out specific offenders.

---

## 8. Concrete Proposals & Brainstorming
*Please provide concrete, bold recommendations:*
1. **Streamlining & UX**: What exact UI elements should be cut or combined to make the fire effortless on a 375px mobile screen?
2. **Mechanics & Loops**: What new or refined mechanic would turn a quiet async chat into an active, addictive campfire discussion between friends?
3. **Story & Content**: Which nights across Weeks 1–6 are weakest, and how specifically should their questions, puzzles, or clues be rewritten?
4. **The "Morning After"**: How do we make the transition out of the campfire and into the next morning's revelation feel thrilling?

---
*Please be direct, specific, and cite real examples from the game files.*
