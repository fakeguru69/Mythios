# Tales of the Dark Moon — External AI Narrative & Gameplay Audit Prompt + File Manifest

## Part 1: Files to Download & Attach to the Auditing AI

To give the external AI complete visibility into **both the original Handover Canon** and **our current implemented codebase**, download and attach the following **2 groups of files**:

### A. From this App Workspace (Current Implemented Codebase & Audit Docs)
Download these **9 files** from your AI Studio file tree:

1. **`src/data/mythiosChaptersData.ts`**
   - *Why:* Contains all 36 Weekday Chapters (Weeks 1–6, Days 1–6), obstacle targets, rewards, pre-fight tactical choices, `[PRESS ON]` / `[LOOK CLOSER]` branches, and base script beats.
2. **`src/data/soloLandmarkProse.ts`**
   - *Why:* Contains our expanded 2–3 paragraph Opening/Outcome/Campfire-Arrival prose, the *"Previously on Day N-1"* daily recaps, the Mandatory Detour Skirmish encounters on failed Challenge-only days, and the 36 interactive **Fanning Out** solo encounter beats (Choice A Challenge vs Choice B Fight + Seeker 1st-letter hint & Solo Clue payoffs).
3. **`src/data/garrickCampfirePrompts.ts`**
   - *Why:* Contains all 36 days of Garrick's **3-Beat Campfire Mystery Host** prompts (Arrival Hook, Beat 1 Seeker Word Deduction, Beat 2 Today's Clue & Overall Mystery Theory) plus Kaelen's and Mei's async Fan-Out board clues.
4. **`src/data/mythiosGatheringsAndAudit.ts`**
   - *Why:* Contains all 6 **Day 7 Gathering** scripts (United Effort bar 100/100, `[LOOK CLOSER]` room inspections, 3-round Gathering Boss Battles, Dark Moon Verses, and Seeker Fragment reveals).
5. **`src/data/mythiosRulesData.ts`**
   - *Why:* Contains the core numerical rules, 6 classes, 6 attributes, tier progression, gear table, and episode number tables.
6. **`src/data/mythiosFragments.ts`**
   - *Why:* Contains the 6 weekly Seeker Fragments, word tiles, and clue mappings.
7. **`src/data/garrickRouter.ts`**
   - *Why:* Contains Garrick's 5-bucket deterministic response router, deception table rules, and canon guardrails.
8. **`src/components/StoryAndPartyTabs.tsx`**
   - *Why:* Contains the actual playable state machine and UI flow for **Solo Landmark (`MINE`)**, **Evening Campfire (`PARTY`)**, and **Day 7 Gathering (`PARTY`)**.
9. **`docs/review-full-handoff-audit.md`**
   - *Why:* Summarizes the previously approved handover fixes (`C1–C11`, `B1–B15`, and `L1–L6` continuity fixes) so the auditor knows what was already intentionally patched.

---

### B. From Your Original Handover Package (Reference Canon Docs)
Attach these original handover markdown documents from your design folder (if you have them locally) so the AI can compare our implementation directly against your original specification:

1. **`mythios-core-rules.md`** *(Original Core Gameplay & Economy Rules)*
2. **`mythios-mythology-canon.md`** & **`mythios-season-reveal-map.md`** *(Master Plot, 6-Week Reveal Schedule, & Canon Timeline)*
3. **`garrick-deception-table.md`** *(Garrick's Foreshadowing Clues, Lies, and Week 6 Betrayal Canon)*
4. **`mythios-gathering-scripts.md`** & **`mythios-united-effort-stories.md`** *(Original Day 7 Gathering Scripts & United Effort Bars)*
5. **`episode-1-the-list.md` through `episode-6-highwall.md`** *(Original 36 Weekday Scripts)*

*(Note: Even if you only upload the **9 codebase files in Group A**, `mythiosChaptersData.ts`, `mythiosGatheringsAndAudit.ts`, `garrickRouter.ts`, and `docs/review-full-handoff-audit.md` already embed the handover script data and canon rules, though attaching your original `.md` handover docs gives the strictest 1:1 diff.)*

---

## Part 2: Copy-Paste Prompt for the Auditing AI

Copy and paste the prompt below along with the attached files:

```markdown
You are an elite Narrative Director, Tabletop/Async RPG Systems Designer, and Continuity Auditor.

I am attaching the original Handover Specification files and the current implemented TypeScript codebase for **Tales of the Dark Moon** (a 6-week, 42-day asynchronous mobile fantasy mystery RPG for a 4-player party guided by an NPC mentor named Garrick).

Please perform an exhaustive, brutally honest, file-by-file and episode-by-episode **Narrative & Gameplay Audit** of what we have built so far. Do not give generic praise—cite specific Weeks, Days, mechanics, and dialogue lines from the attached files.

Structure your audit around the following **7 mandatory sections**:

---

### 1. Executive Assessment: What Is Good vs. What Is Bad
- **What Works Well (Strengths):** Evaluate both the narrative atmosphere/mystery hooks and the async daily/weekly gameplay loop. What genuinely stands out as compelling, clever, or well-executed?
- **What Doesn't Work (Weaknesses & Friction Points):** Where does the writing feel repetitive, mechanical, or formulaic? Where does the UI state machine, dice math, or async social loop create friction, confusion, or fatigue?

---

### 2. Gameplay Deviations from Handover (And Whether We Made It Better or Worse)
Compare the implemented gameplay in `StoryAndPartyTabs.tsx`, `soloLandmarkProse.ts`, `mythiosRulesData.ts`, and `garrickCampfirePrompts.ts` against the original Handover Gameplay Rules (`mythios-core-rules.md` / `mythiosChaptersData.ts`):
- Identify every place where our implementation diverges from or adds to the handover gameplay (for example: zero rewards on failed Challenges, mandatory 1–2 round Detour Skirmishes on failed Challenge-only days, Ambush Penalties `+1 ATK/DEF` on failed Challenge+Fight days, the end-of-day interactive "Fanning Out" solo encounter beat unlocking a 1st-letter Seeker Fragment hint + solo clue, the Collapsible Party Findings Board, and Garrick's structured 3-Beat Campfire Host prompts).
- For **each** deviation, render a clear verdict: **Did we make the game BETTER or WORSE than the handover spec, and why?**
- Point out any unintended mechanical side effects (e.g., HP attrition balance, gold/XP economy starvation on failed rolls, dice target curves, or solo vs. async party dependencies).

---

### 3. Narrative Deviations from Handover (And Whether We Made It Better or Worse)
Compare the prose and dialogue in `soloLandmarkProse.ts`, `garrickCampfirePrompts.ts`, `mythiosChaptersData.ts`, and `mythiosGatheringsAndAudit.ts` against the original handover scripts:
- Where did our expanded 2–3 paragraph Mythios narration, Daily Recaps, Detour Skirmish descriptions, Fanning Out scenes, or Garrick/Kaelen/Mei campfire lines deviate from the handover's tone, pacing, or scene framing?
- For **each** narrative change, state clearly: **Did we make the narrative BETTER or WORSE, and why?**

---

### 4. Major Plot Point & Canon Consistency Audit (Contradictions Check)
Cross-check all 36 Weekday scenes, 36 Fanning Out clues, 36 Garrick Campfire prompts, companion replies, and 6 Gatherings against the core canon plot points:
- **Timeline & Reveal Discipline:**
  - Week 1: The list of five children's names (`Tamsin`, `Joss`, `Lark`, `Bram`, `Pip`) — are the takers only called *"the takers"* before Week 2?
  - Week 2: The black circle / hollow-moon badge, the pulling left cart-wheel rut, the horn button, and the extra cup in the barn.
  - Week 3: The Kiln, the grey tallow candles, the Seeker bloodline / silver seal, and the Dark Moon Verses.
  - Week 4: Drowned Reedham, the night ferrymen, the severed rope beside Garrick's watch-blanket, and Joss's trail.
  - Week 5: The naming of the **Dark Moon Order** (never before Week 5!), the fifth child (*"The fifth wasn't hidden in the hills like the others"*), and the Highwall watch-board stroke countdown (`eight left` -> `seven left` -> `six left`).
  - Week 6: Highwall Keep, Seeker blood doors, Garrick's subtle tells/foreshadowing vs. premature betrayal spoilers, and the Gathering 6 climax (`The Hawser` / `The Lamp Came Down` / Garrick's handover betrayal).
- List **every single continuity error, premature spoiler, character knowledge leak, or physical contradiction** you can find across any file.

---

### 5. Multi-Tier Story Progression & Payoff Audit (Daily, Weekly, Season)
Evaluate the structural satisfaction of our three narrative arcs:
- **Daily Arc (Day 1–6):** Does each individual day have a clear hook, escalating investigation/danger, meaningful discovery during Fanning Out, and a satisfying evening Campfire synthesis? Or do certain days feel like filler?
- **Weekly Arc (Episode 1–6):** Do Days 1–6 build mounting tension and concrete clues that genuinely pay off in the Day 7 Gathering and Seeker Fragment reveal? Cite any weeks where the mid-week days feel disconnected from the Day 7 climax.
- **Season Arc (Weeks 1–6):** Is the slow-burn escalation from local child-snatchers -> ancient Seeker ruins -> the Dark Moon Order -> Highwall Keep -> Garrick's betrayal earned, well-paced, and emotionally resonant? Does the season payoff land?

---

### 6. Weekday Gameplay Pacing Audit (Days 1–6: Satisfying vs. Rushed?)
Walk through the actual player experience of a single Weekday (`MINE` tab -> `PARTY` Campfire tab):
- With the Previous-Day Recap, 2–3 paragraph Opening Beat, Challenge/Fight roll, Detour Skirmish (on failure), 2-paragraph Outcome Beat, 3-Beat interactive Fanning Out Encounter (Challenge or Fight choice -> 1st-letter Fragment hint + Solo Clue), and Campfire Party Findings Board + Garrick 3-Beat discussion:
  - Does a Day 1–6 session feel **satisfying, tactile, and well-paced** for a daily 5–8 minute async RPG session?
  - Or does any part of it still feel **rushed, bloated, mechanical, or railroaded**? Be specific about which beats feel too fast or too repetitive across 36 days.

---

### 7. Day 7 Gathering Gameplay Pacing Audit (Satisfying vs. Rushed?)
Walk through the Day 7 Gathering (`PARTY` tab -> Gathering mode) in `StoryAndPartyTabs.tsx` and `mythiosGatheringsAndAudit.ts`:
- Evaluate the sequence: Opening Scene -> **United Effort (`100/100` shared bar)** -> **`[LOOK CLOSER]` Room Inspection** -> **3-Round Boss Battle** (with Combat Relics & condition modifiers) -> **Dark Moon Verse & Seeker Fragment Word Puzzle** -> **Episode Cliffhanger**.
- Does the Day 7 Gathering feel like a **true weekly climax** that rewards the party's Mon–Sat preparation and clue-gathering?
- Or does the Gathering feel **rushed, overly automated (e.g., single-click resolution vs. round-by-round tension), or disconnected** from the weekday loop? Give concrete recommendations to elevate Day 7 if needed.
```
