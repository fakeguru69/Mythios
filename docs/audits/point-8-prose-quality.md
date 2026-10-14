# Point 8: Prose quality, scene, world-building and how names look

Audit of the live code on `main`, 14 Oct 2026: the prose built by `src/data/soloLandmarkProse.ts` around the chapter data in `src/data/mythiosChaptersData.ts`, compared with the canon episode files and `docs/canon/mythios-visual-style-guide.md`.
Part A is Claude's own audit. Part B checks it against the outside AI audits in `Audit_8.md` (ChatGPT, DeepSeek, Meta, Perplexity, Qwen, Grok).

---

## Part A: my own audit

### A1. Why the prose reads like instructions

The app does not use canon's scene prose. Each day shows a short pass or fail sentence from the chapter data, wrapped in the same generated paragraphs:

1. **The same frame every day:**
   - "Following yesterday's lead to {place}, you and your party fan out to examine the ground while Garrick keeps a quiet eye on the road behind you."
   - "One urgent question hangs over your party here: {question}"
   - "Your direct path to the truth at {place} runs straight through a delicate obstacle: {challenge}. Choose whether to approach with {A} or {B}…"
   - "Relying on your {Attribute}—{stock phrase}—you clear the obstacle at {place} on the first attempt."
2. **Rules spoken inside the story:** "(+150g Detour fight on victory)", "(+150g Detour skirmish win)", "Choose whether to approach with Intellect or Craft", "if you fail, the noise… will draw an alerted lookout".
3. **The day's summary pasted in brackets:** "With the obstacle behind you and the truth in hand (A company of the king's soldiers is still standing…), you step closer…". The same facts are then often repeated by the recap the next morning.
4. **Lines that announce the meaning instead of showing it:** "the meaning of what happened at {place} becomes unmistakable: …".
5. **Generic events that clash with the place.** On a failed Challenge, every day says "heavy boots come running! An alerted lookout…" and you take "an extra pouch from the fallen sentry's belt". In the silent dead city (W5D4) or at the inn on W1D2, that's out of place.
6. **The tone slips:** exclamation marks ("officially forming your party to ride north and save the first child!"), and "the first attempt" when there's only ever one roll.

**What's good:** the chapter data's own pass and fail lines are specific and well written ("You had him by the collar close enough to smell woodsmoke and lamp oil"). So are Garrick's lines and the Campfire openers. The template around them is the problem.

### A2. Grammar slips from stitching

- **A capital "The" mid-sentence** comes from place names stored with "The": "at The dead streets", "to The shepherd's hut", "at The Hollow Wake Inn". About 395 occurrences across the generated text.
- **Day labels inside place names:** "pause at The wall room (Six nights)".
- **Challenge titles dropped into sentences:** "your attempt on fit the page slips", "the commotion from the street of soldiers".
- **Stock phrases that don't fit their sentence:** "Despite piecing together the quiet physical evidence and timeline before acting with your Intellect, your attempt…".
- **The party-size slot:** "a list of the company names" (`[N]` becomes "the company"), and "the four of you".

### A3. The biggest fix needs no new writing

Canon's episode files already contain full scene prose for every day: the MYTHIOS chat blocks, "what you notice" lines by Attribute, the Challenge card text and the day summary card. The app's chapter data keeps only the short pass and fail lines and generates the rest.

Example, Week 1 Day 2:
- **App, generated:** "Following the address from your cargo box into the warm lamplight of The Hollow Wake Inn, you find the other travellers of your company already seated in the common room holding torn paper stubs matching yours, while the innkeeper Garrick sets a missing scholar's leather satchel on the table between you. One urgent question hangs in the common room here: Who are the others on the list, and who wrote it?"
- **Canon, `episode-1-the-list.md`, already written:** "The taproom is warm and low and smells of woodsmoke. There are [N−1] strangers in it who are not drinking. … You put yours down beside them. The same neat hand. The same names, each with a date beside it. Nobody has to explain. The innkeeper sets down the cups. He sets down one more than there are of you, at the empty end of the table, and goes back behind his bar."

The canon version is a scene, it scales with party size, and it plants two season clues the app has lost: **the dates beside your names** (Week 2's twist, Point 2) and **the extra cup** (the finale). Building the day from canon's text fixes most of Points 2, 8 and 9 at once.

### A4. Names: blend or highlight?

Canon's style guide already answers this:
- Story text is plain sans, "the most prominent element on screen".
- Cinzel is for names in labels and for numbers, not inside sentences.
- Gold marks item names and numbers.
- Italic serif is only for words written on a page in the world (found documents, fragments).
- The Attribute colours are used "strictly on Attributes, Relics and speaker names".

**My recommendation, following canon:**
- **Inside the story, blend.** Normal grammar, lowercase "the": "at the Widow's Tooth", "in the dead streets". Proper names stay capitalised and unstyled (Garrick, Meira, Fenmark, Highwall).
- **Highlight only what the player must keep:**
  - things you pick up, as the gold "You hold" line under the day (canon's day summary card already has it)
  - the Challenge or enemy on its own action card
  - written pages in the italic serif
  - speaker labels in their colour

  Places and characters inside sentences get no colour.
- **Fix the data, not just the sentence:** store descriptive places without "The" ("forest road", "dead streets"), and keep "Day 6 · Six nights" as a separate label, not part of the place name.

### A5. Verdict

The prose problem is a build choice, not a writing problem. The written material (chapter lines, Garrick, the Campfire, and above all canon's episode prose) is good. The generator wraps it in a fixed, rules-heavy template with grammar errors and generic events. The cure is to show canon's prose, cut the rules text from the story (keep it on the cards), and follow the style guide's quiet typography.

---

## Part B: checked against the other AIs (`Audit_8.md`)

| Their point | Who | My view |
|---|---|---|
| The cause is template stitching in `soloLandmarkProse.ts` | All six | **Agree.** |
| Capital "The" mid-sentence ("at The forest road") | ChatGPT, DeepSeek, Meta, Qwen, Grok | **Agree,** about 395 cases. Some of their suggested code fixes only lowercase at insertion time. Better to also store descriptive places without "The" (A4). |
| Take rules text out of the prose ("+2 WEP", "Obstacle 36", "+150g", "First-Strike Advantage") and keep it on the cards | DeepSeek, Perplexity | **Agree.** "Obstacle 36" and "+2 WEP" lines are from the older bundle; "+150g Detour" is still in today's text. |
| Drop false certainty ("the meaning… becomes unmistakable") | ChatGPT | **Agree.** |
| Blend names into normal prose; highlight only what the player must keep, as one gold "You hold" line under the paragraph | Grok, Qwen, ChatGPT ("restrained") | **Agree.** It matches canon's style guide. |
| Colour characters by class and show places in amber small-caps inside sentences | Meta, DeepSeek | **Disagree.** Canon keeps Attribute colours for Attributes, Relics and speaker labels only, and wants story text to stay the most readable thing on screen. |
| Garrick's lines are the best sentences in the chapter file | Grok | **Agree.** |
| "Mei, Dev and Arjun" hardcoded in the prose | DeepSeek | **Partly out of date.** Removed from the openings by 14 Oct; still in some fail lines (Point 1). |
| Before-and-after rewrites (new prose) | ChatGPT, DeepSeek, Qwen, Grok | **Useful as style examples,** but most aren't needed. Canon already has the scene prose for every day (A3). New writing is only needed where canon has none, such as the Fan Out branches. |

**Missed by all of them:**
- Canon's episode files already contain the scene prose the app replaced with templates. This is the cheapest and biggest fix (A3).
- Canon's own style guide already settles "blend or highlight" (A4).
- The generic "heavy boots / sentry's pouch" event clashes with places like the dead city.
