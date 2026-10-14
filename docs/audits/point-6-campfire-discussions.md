# Point 6: Campfire discussions, prompts and theory forks

Audit of the live code on `main`, 14 Oct 2026: the 36 evenings in `src/data/campfire-days-v23.json` (Campfire v2.3) as shown by `src/components/CampfireEveningView.tsx` (8 steps: Opener, Clues, Fork, Callback, Fragment, Riddle, Today, Closer).
Part A is Claude's own audit. Part B checks it against the six outside AI audits in `Audit_6.md` (ChatGPT, DeepSeek, Meta, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. What the screen does well

- **The Fork is a real choice, not a quiz.** Reading A, Reading B, or write your own ("Neither reading fits"). Nobody is told who is right, which is correct for a Campfire.
- **Garrick's openers are in voice and keep the rules.** No banned phrases, no out-of-game talk, "Malakor" never used, and "king", "fifth", "moon-blood", "Highwall" and "heartbeat" all respect their first-use days. Some lines carry quiet double meanings for the finale. The best is W4D1: "Count yourselves. I will, too."
- **The extra cup appears on 8 "cup nights"**, the only place Garrick's biggest plant reaches players.
- **Quiet days** (W1D4, W3D2, W4D3, W4D6, W5D4, W6D2) hide the riddle unless someone asks. Good pacing.

### A2. The forks (theory A vs B), all 36

**Strong: a real disagreement the evidence can move (26).**
1-1 warning / invitation · 1-2 hurry / on purpose · 1-3 guarding / waiting for us · 1-4 protecting the girl / itself · 1-5 same man / way of working · 1-6 carried across / wanted us to think so · 2-2 a list with birthdays / knew him · 2-3 same door / a warning · 2-5 erased by enemies / by his own people (excellent) · 2-6 to get in / something already there · 3-2 manners / the manners are the trick · 3-3 children chosen for places / places chosen for children (excellent) · 3-4 chips for us / for herself · 3-5 a message / a hurry · 4-1 he had help in the room / he didn't need any (excellent) · 4-2 the box / the swords · 4-3 the right night / the right child · 4-4 "moon-blood" means the marked / something else (excellent, pays off in the finale) · 4-6 followed / already there (excellent) · 5-1 a Stone like the others / something different · 5-4 only standing / one helm turned · 5-5 a date / a signal · 5-6 hide the fifth / watch the hall · 6-2 answer a call / guard it · 6-3 no way in at the front / there is, and it isn't ours · 6-6 we open the rock / it's not ours to open (excellent, foreshadows Garrick)

**Weak (10).**
- **Already answered by that day's story,** so there is nothing left to argue:
  - 3-1 "Wren's in Ashcombe / somewhere else": the chapter already says "somewhere warm" is Ashcombe.
  - 5-2 "the heartbeat turns the beasts / they're afraid": the chapter states A as fact.
  - 6-1 "he saw us / it's the only window": the chapter already says you were not found.
- **Both can be true, or the stakes are low:** 2-1 "the cart went there / the wall says so" · 4-5 "safe while he carves / keeps him calm" · 6-5 "the record will come back / it's a guess".
- **"It's a trap" or "they know anyway" options** that close the debate instead of opening it: 2-4 "we were heard / they know anyway" · 5-3 "someone is inside / wanted us to think so" · 6-4 "the Seekers' door / a trap".
- **Asks about something the player never saw:** 3-6 "We watch the watcher first". The watcher is only in the chapter's hidden plant note, never on screen.
- Small wording slip: 3-2 Reading A, "They took her willingly with manners", reads awkwardly.

### A3. The callbacks

- **Almost all 36 use one template:** "Yesterday X. Today Y." They recap more than they connect.
- **The best ones connect:** 2-5 ("a horn button, a dead stranger, a circle"), 4-6 ("someone took your words"), 6-6 ("you have one stroke left").
- **Two refer to things the player never saw:**
  - 3-4 "Yesterday a footnote with a doubtful number". The W3D3 plant (the verse and Meira's notes disagree on the count) is only in the hidden plant note.
  - The same unseen plant drives the 3-3 nudge: "why would a scholar write down a number she doubted?"
- **Small slips:** 4-3 says Wren was "two days ago" (it was three); 6-2 says "five and an arrow" (the arrow was the day before).

### A4. The nudges (the question to one friend)

- **21 of 36 are practical or tactical, not about the mystery.** For example "how fast could we reach the mill", "what do you do with a dog and a chain", "who stands the first watch". Only 15 push the investigation (for example 2-5 "who gains from a forgotten name?", 4-2 "who scrapes a face off a coin?").
- **They never rotate.** The friend is picked by the highest Attribute among four fixed people, so Intellect always goes to Mei, Craft and Might to Arjun, Aim and Agility to Dev. Campfire §M says nudges rotate among the friends at the fire.
- **W1D1 nudges a friend you haven't met.** The day is played alone, but the nudge resolves to Mei.

### A5. The riddles

- Ordinary tavern riddles (river, clock, comb, keyhole), sometimes with a themed answer (map, circle, coin, boat, moon). They're a light game, not part of the mystery, which matches canon's design.
- "Light" is the answer twice (2-4 and 6-1).

### A6. Verdict

The Campfire is the best-designed part of the build. 26 of the 36 forks are genuine arguments, several are excellent, and the screen never declares a winner. The weak points are 10 forks that are settled, low-stakes or "it's a trap"; 21 practical nudges that pull away from the mystery; callbacks that recap instead of connecting; two prompts about plants the player never saw; and nudges fixed to the sample cast.

---

## Part B: checked against the other AIs (`Audit_6.md`)

**Important:** ChatGPT, DeepSeek, Meta and Perplexity audited the **older Campfire (v2.2)**. Their quoted forks and callbacks (for example "the horseman from the mine is driving the mill-road cart", "Four stubs cut against a straight rule", forks cut off at an apostrophe) are **not in the current data**; I searched and found none. Only **Qwen** quotes the current v2.3 text. Their general points still matter:

| Their point | Who | My view |
|---|---|---|
| Too many forks are false binaries (both can be true) | ChatGPT | **Agree in principle,** but their 18-day list is of the old forks. On v2.3 I count 10 weak, 26 strong. |
| Let players offer a third theory | ChatGPT | **Already built:** the "write your own / Neither reading fits" option. |
| Redesign forks around competing predictions ("if A, what should we find next?") | ChatGPT | **Agree. A good principle** for rewriting the weak 10. |
| Callbacks remind instead of deduce | ChatGPT | **Agree** (A3). |
| Nudges must work for 2–6 players, not the sample four | ChatGPT, DeepSeek | **Agree** (A4: fixed and never rotate). |
| W1D1 nudges a friend who isn't there | DeepSeek, Meta | **Agree, confirmed** in today's code. |
| Forks truncated at an apostrophe, the W1D2 "four stubs" callback | Meta | **Out of date.** Not in v2.3. |
| Riddles are the best part and fully on-theme | Meta | **Disagree.** Those were the older riddles (for example a carved-horse riddle). Today's are mostly generic. |
| W2D4, W5D3, W6D1 and W6D4 forks are null debates ("they know anyway", "it's a trap", paranoia vs coincidence) | Qwen | **Agree on all four.** Same as my A2. |
| Qwen's W2D4 fix: "they left the second lamp for the next shift / for us" | Qwen | **Good,** and uses that day's own clue. |
| Qwen's W5D3 and W6D4 fixes ("the Seekers' heirs bar it", "the Order dug the crack") | Qwen | **Disagree.** They invent lore not in canon. |
| Five nudges use the wrong Attribute for the evidence (W1D5, W2D1, W3D1, W5D4, W6D5) | Qwen | **Agree,** and it's wider: 21 of 36 nudges are practical, not investigative. |
| The v2.3 rule that the theory board shows names, never a winner, is excellent | Qwen | **Agree.** |

**Missed by all of them:** the three forks already answered by that day's story (3-1, 5-2, 6-1); the two prompts about plants the player never sees (the W3D3 "doubtful number", the W3D6 "watcher"); and that nudges never rotate.

**Also found while checking this point:** the older Campfire prompt file (`garrickCampfirePrompts.ts`) is computed but never shown. Grok's claim (in `Audit_1`) that the Party tab shows it is out of date. My Point 1 document is corrected to match.
