# Point 9: Connecting prose to the player's actions (before and after buttons)

Audit of the live code on `main`, 14 Oct 2026: the weekday flow in `src/components/StoryAndPartyTabs.tsx` and the text from `src/data/soloLandmarkProse.ts`, compared with the canon day shape in the episode files.
Part A is Claude's own audit. Part B checks it against the outside AI audits in `Audit_9.md` (DeepSeek, Meta, ChatGPT, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. Canon's day already joins story and buttons

Canon's weekday (for example `episode-1-the-list.md` Day 1, `episode-2-the-wind-stone.md`) runs:

1. a short scene
2. a choice in the story's own words (`[LOOK WHERE HE STOOD]` `[LOOK AT WHAT HE WAS AT]`)
3. **"What you notice"**: one line for your best Attribute
4. a **Challenge card in the story's own words**, each Attribute with its own verb: "Might · force it", "Craft · work the jammed mechanism free", "Aim · watch where his eyes keep going, and look there first". It also has a specific cost on failure: "IF YOU FAIL: it costs you skin and most of an hour of daylight"
5. the result, continuing the same sentence
6. an act (`[PULL IT OUT]` for the fragment)
7. **the Pull** (why tomorrow can't wait)
8. a **day summary card** (You earned · You learned · You hold · Fragment · Tomorrow)

Every button is a verb from the scene, and every result picks up that verb. The writing for this exists for every day.

### A2. What the app does instead, joint by joint

| Joint | App today | Problem |
|---|---|---|
| Recap → opening | "At {place}, your party uncovered a vital lead: …", then "Following yesterday's lead to {place}…" | The day starts with two summaries, not a scene. |
| Opening → choice | The "look here / look there" choice is **not offered** (Point 1). Canon's "What you notice" lines are **not in the app at all.** | The day's first and most personal decision is gone. |
| Opening → Challenge | Generic stat buttons: "STUDY THE EVIDENCE", "FORCE THE OBSTACLE", "SLIP PAST UNSEEN" (only the mill has its own). An "Obstacle" bar with a % (the old roll, Task 1). | Canon's per-day verbs and fail costs are ignored; the button is a stat, not an action. |
| Challenge → result | "Relying on your {Attribute}—{stock phrase}—you clear the obstacle at {place} on the first attempt." On a fail: "slips at the worst possible moment". | Repeats the button instead of continuing it; generic failure. |
| Fail → Detour | "heavy boots come running! An alerted lookout…", "(+150g Detour fight on victory)" | The same event in every place, with rules text in the story. |
| Before the fight | The "who strikes first" choice is not offered (Point 1). | Another real decision lost. |
| Fight | One button per round: "ROLL ROUND 2 (D20 + 15)", with the maths shown. | **Against canon (4 Oct): "fights reveal beat by beat with tumbling dice and no per-round ROLL button; manual rolling removed."** Many extra taps of pure maths. |
| After the fight → fragment | The post-fight text says "you lift today's Seeker Fragment", then a separate Fragment card does it again. | Told twice. |
| Fan Out | The lead-in repeats the card; the button names the clue before you find it; "I'm fanning out to examine 'The second ring'" is written for you; a generic "rear-guard" fight (Point 5). | Spoiler, repetition and a script spoken for the player. |
| "Tell Mythios what you do…" box | Free text, answered by four keyword-matched stock replies that mostly repeat the day's summary. | Promises freedom it can't give. Canon cut free play (5 Oct). |
| **End of day** | "HEAD TO THE CAMPFIRE (FINISH DAY)", then the bottom bar. | **The day's Pull line is never shown** unless the player happens to type into the Mythios box (`pullLine` is used nowhere else on screen). Canon's day summary card is not built. |

### A3. The two biggest gaps

1. **The Pull is missing.** Every chapter ends on a written Pull ("One day north: the Hollow Wake Inn. Somebody wants you there."). It's the line that makes tomorrow matter, and players don't see it. *(This also corrects my Point 3 and Point 4 documents, which judged the day-to-day pull from the data; on screen it doesn't appear.)*
2. **The buttons ignore canon's own wording.** Canon already gives each day's Challenge a verb per Attribute and a concrete cost on failure. Using those as the button labels and the result's opening words would join prose and buttons with no new writing.

### A4. Verdict

The joints between story and buttons are the weakest part of the daily experience. The app replaced canon's scene, choice, verb, result and Pull sequence with generic stat buttons, rules text, per-round dice taps and a free-text box that can't respond. Canon already contains almost everything needed. The fix is mainly to build the day from canon's structure:

- show the two "look" choices and the notice line
- label Challenge buttons with canon's verbs
- show the fail cost
- play fights automatically, beat by beat
- end on the Pull and the day summary card

---

## Part B: checked against the other AIs (`Audit_9.md`)

| Their point | Who | My view |
|---|---|---|
| Prose and buttons run on separate tracks; buttons don't inherit the fiction | DeepSeek, Qwen, Meta, Grok, ChatGPT | **Agree,** all six. |
| "A button should be the verb of the sentence above it; the sentence under it is that verb in the past tense, plus one new fact" | Grok | **Agree.** A good rule, and canon's cards already follow it. |
| The "look", pre-fight and [PRESS ON] choices never become buttons | Grok | **Agree,** confirmed (Point 1). |
| Rules values leak into the prose (+150g, the starting letter, "Obstacle") | DeepSeek | **Agree.** Some examples are from the older bundle ("+50g", "Obstacle 42", "four torn stubs"); "+150g Detour" and the starting letter are still there today. |
| Information repeated between card and prose, and the fragment "lifted" twice | DeepSeek, Meta | **Agree.** |
| Player declarations written for the player | DeepSeek | **Agree.** |
| The party is invisible in solo scenes; give each friend a specific action | DeepSeek | **Partly.** True, but canon handles it with the "look" choice and friends' one-liners rather than new scenes. Show those first. |
| Recap then opening both summarise | Qwen | **Agree.** |
| Generic failure ("slips at the worst possible moment"); failure should depend on the obstacle | ChatGPT | **Agree.** Canon's card already says what failing costs on each day. |
| The same "long purple shadows" line every day | DeepSeek | **Agree.** |
| Perplexity's answer | Perplexity | **Off-topic.** Its Point 9 reviews the "question ladder" ("not ready for prose"), not the prose-to-button joints. Nothing to check here. |

**Missed by all of them:**
- **The day's Pull line is never shown** (A3.1).
- **Canon's Challenge cards already contain per-day verbs and fail costs** to use as buttons (A3.2).
- **The per-round ROLL buttons go against canon's 4 Oct decision** (no per-round button; fights play beat by beat).
- **The "Tell Mythios" box gives keyword-matched stock replies,** and canon cut free play.
- **Canon's "What you notice" lines are missing** from the app.
