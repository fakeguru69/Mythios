# Point 1: Contradictions and loopholes, all 42 days

Audit of the live code on `main`, 14 Oct 2026. Every day's text was printed from the game data and compared with the canon episode files in `docs/canon/`.
Part A is Claude's own audit. Part B checks it against the six outside AI audits in `Audit_1.md` (ChatGPT, DeepSeek, Qwen, Grok, Meta, Perplexity), which were written on the older **10 Oct** bundle. Every outside claim below was checked against today's code.

---

## Part A: my own audit

### A0. Written story that does not reach the player

The chapter data holds content that the story screen never shows:

- **The "look here or look there" choices** (W1D1, W2D2, W3D5, W4D3, W6D3) are never offered. The W1D1 discovery of the charcoal rubbing is not played. "WREN" on the doorframe and "Until the throne rise whole" (W3D5) only appear as summary lines.
- **[PRESS ON] is not built on weekdays.** *Correction (made during Point 5):* 12 [PRESS ON] details do reach players as that day's Fan Out clue and on the Campfire board. They are missing only from the day's own story.
- **The "who strikes first" choice before a fight is not built.** The player always strikes first.
- **Garrick's weekday lines are not shown on the story screen.** These include the finale plants: W1D6 "We always pour one for whoever can't be with us", W3D2 "My family's been in these hills longer than the roads have", W4D1 "not one of you has died", and W5D4 "My family's waited a long time…". The extra cup does appear on 8 Campfire nights. *(Checked during Point 6: the older Campfire prompt file `garrickCampfirePrompts.ts`, which also holds these lines, is computed but never shown on screen, so these Garrick lines reach players nowhere.)*
- **Gathering 3 never shows "the box going up the vent"** (canon `episode-3`, line 673), but Gathering 4's question asks about it.

### A1. Story contradictions and timeline slips

1. **W4D1 rewrites the prisoner's escape** (continuity patch L6). It says his ropes "at the outer post" were cut "while all eyes were up on the scree lifting Wren down", with Garrick holding the lantern. Canon (`episode-4`, lines 41–84) and the app's own Gathering 3 say he was questioned after Wren was saved, every lamp went out at once, and the ropes lay where he knelt.
2. **The W3D1 recap says "the watchers… whispered"** about "somewhere warm". In canon and Gathering 2, **Corin** says it.
3. **Gathering 4 contradicts itself.** Answer B says the **children's** blood opened the sockets. The answer line says "a door that only **your** blood could open". Canon's twist is *your* blood.
4. **The Highwall count is said twice.** W5D6 (patch L5) says "seven left", then Gathering 5 ends with "seven left" again. Canon: 8 at W5D5, 7 at the end of Gathering 5, 6 at W6D1 (Task 2).
5. **W2D3 says "four-night-old ruts"** one day after W2D2 already said four nights.
6. **Things from a pass are mentioned after a fail:** W2D2 recalls the cart on the ford bank (wiped on a W1D6 fail); W3D5 "eight chips" on a fail; the W1D2 recap "you drove off" the stranger even after losing.
7. **Wrong answers at Gatherings invent story** not in canon: "road-wardens", "Seeker elders built this mine", "Meira's company", "Meira's ring".
8. **The built-in word checker has the wrong dates** (`mythiosGatheringsAndAudit.ts` `CANON_TERM_GATES`): "king" at W4D7 (canon W2D5), "throne" at W5D7 (canon W3D5), "cairn" at W5D4 (W3D6 is "The cairn"), "wall" at W5D6 (used from W5D3).
9. **Canon itself:** W1D2 "Yours is the third stub… There are [N] stubs" fails with 2 players. Waiting on Fake Guru.

### A2. 2 to 6 players: places stuck at four, or at Mei, Dev and Arjun

- The Fan Out text on every day from W1D2: "the four of you pause at …" (`soloLandmarkProse.ts:339`).
- The W1D2 recap: "a torn stub listing four names".
- W1D1: "a list of the company names" (`[N]` becomes "the company").
- ~~The older Campfire prompts: `[N]` becomes "four"; "all four of us".~~ *Correction (Point 6): that file is never shown on screen; it is dead code.*
- Gathering 2's answer: "every date beside our four names".
- Fixed friends in the story text: Mei (W1D2, W1D4, W4D6), Dev (W1D6), Arjun (W2D2), Mei and Arjun (W2D3).
- Fixed friends at Gatherings: each approach's "best friend"; Gathering 1's United Effort bar "Dev HP"; hints spoken by Mei or Arjun.
- Good: the Campfire v2.3 data uses `{friend}` slots.

### A3. Rules and money loopholes

1. The Challenge roll is wrong (Task 1).
2. Fight damage is margin × 5; canon is d20 × 2. On days with a Challenge and a fight, the card says "fail → enemy strikes first", but in the code you always strike first.
3. Invented numbers on those days: a pass gives +2 Weapon, and a fail costs 15 HP before the fight. Canon retired penalties that carry over from a failed Challenge.
4. Those days pay 300g for the fight; canon pays 0 (Task 2).
5. The Fan Out extra Challenge is a free roll: a pass gives +150g and +1 Attribute, and a fail costs nothing. Canon grows Attributes only on the main Challenge.
6. The Detour fight gives +2 Attribute win or lose, and a loss costs nothing (the −75g is unused).
7. The Seeker Chest allows unlimited instant retries (canon: after 5 wrong tries, wait 2 minutes), and every solve is credited to "Jennifer".
8. The Combat Relic is never spent (Task 5). United Effort uses four fixed heroes (Task 6).

---

## Part B: checked against the other AIs (`Audit_1.md`)

### B1. Found by them, missed by me (confirmed in today's code)

| Finding | Who | Where in code |
|---|---|---|
| **Replay for rewards.** Picking a finished day again resets it, and Challenge, fight and Fan Out pay gold and growth again. Nothing checks "already done". | ChatGPT | `StoryAndPartyTabs.tsx` ~381–404 (state resets on day change; no completed-day check in reward code) |
| **United Effort "rally" always gives a full win.** `Math.min(100, Math.max(100, …))` is always 100, so +300g at no cost. | ChatGPT | `StoryAndPartyTabs.tsx:3285` |
| **United Effort uses fixed friend bonuses** (Mei +3, Dev +2, Arjun +3) and always rolls 4 heroes. 2 players get two ghost rolls; 6 players have two who never roll. | ChatGPT, DeepSeek, Grok | `StoryAndPartyTabs.tsx` ~3245 |
| **The Gathering Battle has no enemy rolls.** The party loses a flat 15 HP every round. | ChatGPT, Grok | `StoryAndPartyTabs.tsx` ~3216 |
| **Gear can be bought at Level 5.** The gold is taken but nothing changes (the screen may block it; the code does not). | ChatGPT | `App.tsx:633` |
| **The Seeker reward code pays +25g on every call.** The screen hides solved words, but the code itself has no guard. | ChatGPT | `App.tsx` `handleSolveWord` |
| **Personal stakes leak the story on Day 1:** Tamsin, "four marked children", Stillwater. | Grok | `App.tsx` `PERSONAL_STAKES` (belongs in Task 13) |
| **The charcoal woman's nephew is dropped after W1D5.** Canon's Gathering scripts follow him up. | Grok | — |
| **The fifth Stone is picked up off-screen.** | DeepSeek | W5D6 → Gathering 5 |

### B2. Their claims that are already fixed (out of date)

- "Three other travellers" in W1D2: gone.
- "You, Mei, Dev, and Arjun" in every opening: gone.
- The Campfire's "four stubs" line: gone in Campfire v2.3.
- The map bonus always adding +2: now only if all six words are solved.
- The Battle party-HP floor of 25: gone.

### B3. Where I disagree

- **"No real fail state, since you get the fragment even after losing" (DeepSeek, Grok):** nobody dying and the story going on is canon. The real loophole is that failing costs almost nothing (A3.5, A3.6).
- **"Patch L6 is a good fix" (ChatGPT):** it rewrites canon. Grok agrees with me that it plants a new, unplanned clue at Garrick.
- **"Reading the map aloud on W4D6 is a bug" (Grok, Perplexity):** in canon this is exactly how the Order overhears the route.
- **"The L4 record is stale because the chapters already pay 300" (ChatGPT):** the 300 *is* the error. Canon pays 0 on those days (Task 2).

### B4. Agreed by all

Four players hardcoded, pre-fight choices not built, the countdown bug, and "king" in the word checker.
