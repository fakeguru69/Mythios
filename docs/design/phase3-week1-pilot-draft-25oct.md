# Phase 3: Week 1 as the pilot, drafted for Fake Guru (25 Oct 2026)

**Decided and built, 25 Oct.** Fake Guru: "Use you judgement (be critical)". Claude's calls:

- **Section 2, the silent map, was dropped.** Canon's own logistics say the Order learns each place only by overhearing the party read its map aloud ("The place travels by ear", `garrick-deception-table.md`), and that is how every rescue helps the ritual. A silent road in Week 1 would teach players to stay silent every week and break the season's premise. Its Gathering line would also suggest that Garrick told someone, which canon says he never does. The map choice stays as it is.
- **In its place, Gathering 1 echoes the courier, legibly.** If any friend saw him (the `[LET {F2} READ IT]` road), the mine mouth shows "a saddled horse… its flanks still dark with sweat", next to the memory of the man by the chimney. It sets the two side by side and asserts nothing.
- **Section 3's Day 6 call lines were rewritten.** They now come straight after "This was never about you.":
  - A: "Last night by the fire you said they wanted you too. For now, the wall says otherwise."
  - B: "Last night by the fire you said Meira chose you to help her find them. Here are the ones she was looking for."

  The draft's "The wall seems to agree" was cut, because the next line says "The wall does not say".
- **Section 4's act is built,** shortened to one sentence ("You sit down on the far side of the fire from her, close enough to be company and not so close as to crowd her."). "For a while there is only the fire" was already in the text that follows.
- **Sections 1 and 5 are built as drafted.**

The build: Campfire data for Week 1, Episode 1, migration `0134`, and `tests/data/gathering-answers-the-week.sql`.

This is the plan after the audits (`docs/design/plan-after-blind-audit-25oct.md`), Phase 3. Every design fix the reviewers agree on is done here for Week 1 only. Week 1 is then played by real friends before any other week changes.

Nothing here is in the game yet. New story text is in quotes; "now" shows what it replaces.

Fake Guru said "Proceed", and Claude has picked the "One breath" numbers (section 5). They are small, and they are his to change.

## What is already done

**One question a night.** The fire already asks only one question on screen; the second, italic one was removed on 24 Oct. The reviewers saw it because the read-through files still printed it. Those files will stop printing it, and the fire's piece-pairs (below) are rewritten to bear on the one question.

---

## 1. The fire: every night, a pair that joins your road to a lead, and asks rather than tells

**How it works today.** A *click* is two pieces on the table that together show something new. Today a click only ever joins two last-light leads, and its words state the answer. Days 1 and 4 have no click at all.

**From now:**
- Each night keeps its lead-and-lead click, rewritten to lay the two pieces side by side and ask.
- Most nights gain a **road click**: the clue a friend's own road earned that day, joined to a lead. So the road you chose matters at the fire.
- In a party of two, Garrick still brings the missing lead half (built 24 Oct).
- No click ever states the answer.

The server already matches road clues by their key, so this is Campfire data only, with no new code.

### Day 1 (you are alone at the fire)

Day 1's fire is yours alone, by design. It gets one line before the question, so the first night does not feel like an empty table:

> "Somewhere tonight, whoever else is on that list is sitting by a fire of their own."

The question and your call stay. Your call is read back at Gathering 1.

### Day 2. *When was the child in Meira's notes taken?*

Rewritten click: every slip pinned + the thumbed leaf.

*Now:* "… Nobody wears a page that soft in a week. She had been carrying that child for a long time."

> "Every slip in her book is pinned where it belongs, and this one leaf is worn soft at the corner by a thumb that came back to it again and again. How long does it take a page to wear like that?"

There is no road click on Day 2. All three of Day 2's roads earn a small thing about Garrick (the pocket-fold, the line he knew from across the bar, the cloth that slowed). They are clues for the season, not for tonight's question, and joining them to a lead would point at him too early.

### Day 3. *When he ran for the smoke, was he running home?*

Rewritten click: the second ring + the worn path.

*Now:* "… A man does not keep watch like that at his own back door. He was posted here, from somewhere else."

> "He set his flask down twice in the bracken, and someone has walked round this rock often enough to wear the turf to bare earth. That is a long watch. Would a man keep it this close to his own door?"

New road click: *Reed-thatch in the ruts* (the ruts road) + *the notched stick* (the gap he ran through).

> "He ran for the gap and the smoke beyond it, and the cart that dropped its reed-thatch in the ruts went the same way. Is Fenmark where they come from, or only where they stop?"

New road click: *Charcoal in the cut* (the marking road) + *the worn path*.

> "Meira knelt at this stone with her paper, and someone has walked round it so often the turf is bare. Was he watching the rock, or watching for whoever came to read it?"

### Day 4. *Why did they take Tamsin, of all the children in Fenmark?*

New click; there was none before. *The leaned bar* + *past three doors*.

> "They lifted the gate's bar and leaned it against the post, tidy as a neighbour, then walked past three doors with children behind them. Men who want the easiest child do not walk past three. What were they looking for?"

New road click: *No lantern in the dark* (put yourself in front of the boy) + *past three doors*.

> "No lantern, and yet every step in the lane known in the dark. Past three doors, to the one they wanted. How does a stranger know a lane like that?"

### Day 5. *Is it the same man, twice, or a way of working?*

Rewritten click: older marks + the worn bar.

*Now:* "… Someone came at this house the same way long before tonight. It is not a…"

> "Fresh marks over old ones, at the very place where the bar sits, and a bar worn pale with years of nights. Someone has come at this house before, the same way. Was it the same hand?"

New road click: *Salt and rowan-ash* (look at the step) + *the worn bar*.

> "A ward of salt and rowan-ash under her step, and a door barred every night for years. She has been waiting a long time for someone to come back. Is tonight's man the one she was waiting for?"

New road click: *The nicked axe-helve* (show her your empty hands) + *the knife, not the face*.

> "She turned a knife with her axe tonight, and she knows him only by a knife. Tonight's man left a plain kitchen blade in her shutter. Which knife did her axe meet?"

### Day 6. *Why are our names on that list?*

Rewritten click: up at a run + a second man. It now bears on tonight's question instead of the old second one.

*Now:* "… They laid that trail for whoever came after. They were expecting to be followed, and by now you know who…"

> "One man carried her down to the water. The other went back up to the cart, and the cart went up the far bank at a run, without her. They laid that trail for whoever came after. Who were they expecting to come?"

New road click: *The listening courier* (read it aloud; see section 2) + *up at a run*.

> "A man by the chimney went still when the bend above the ford was read out, and the cart went up the far bank at a run. Somebody knows where you are going before you get there. Why would anyone need to?"

---

## 2. The choice that changed nothing: Day 6's map

*Now:* `[READ IT OUT]` or `[LET {F2} READ IT]`. Either way the way is read aloud, and the courier hears it.

*Proposed:* `[READ IT ALOUD]` or `[PASS IT HAND TO HAND, IN SILENCE]`.

The set-up line before the buttons:

> "The map is whole, and the room is full. You can read the way out over the cups, quick and plain, so every one of you has it. Or you can pass it from hand to hand under the table, one finger tracing the way, and say nothing at all."

*Read it aloud* keeps today's passage and its find: you see the courier listening.

*Pass it in silence:*

> "It goes round under the table, one hand to the next. Each of you traces the line to the mark with a fingertip, and nobody says a word. By the chimney a man in a riding-cloak finishes his drink, asks for a bed, and goes up to it."

Its find is *The pin-hole at the mark*, the find today's other road gives. It is felt by fingertip, which is how the map is read in silence.

**What it changes at Gathering 1.** Each friend chose alone on their own Day 6. Gathering 1 checks the party as a whole:

- **If anyone read it aloud:**
  > "Somebody read the way aloud at the inn, and somebody heard."
- **If every friend passed it in silence:**
  > "Nobody spoke the way aloud at the inn. Nobody overheard. And still, they were here before you."

The silent version is the season's best kind of clue. The party did everything right, and the Order was still ahead, because the one who knew the way sat at their table. It is fair, true, and only seen if they chose it.

Week 1's other choices stay as they are; each already earns its own clue for the fire.

---

## 3. Gathering 1 answers the week

Two lines that only appear because of what the party did that week, read at the discovery, just before **This was never about you.**

1. **The map** (section 2): one of the two lines above.
2. **The fire's last call.** The party's call on Day 6, *Why are our names on that list?*:
   - If they called *We are like the children. They want us too.*:
     > "Last night by the fire you said they wanted you too. The wall says otherwise. For now."
   - If they called *Meira chose us, to help her find them.*:
     > "Last night by the fire you said Meira chose you to help her. The wall seems to agree."
   - If the fire was split, or made no call: nothing is said.

Both stay true later. Gathering 2 shows the party is marked, which pays off "For now" for one table and surprises the other.

This needs one small server change: when the Gathering starts, it notes the week's choices and the Day 6 call, so its lines can depend on them. That is the same pattern as the existing "if the breath was…" lines.

---

## 4. One small act in the longest read: Week 1 Day 5

After the fight, 429 words run with nothing to tap. One act goes where the woman sits down with the horse:

`[SIT WITH HER]`

> "You sit down on the far side of the fire from her, close enough to be company and not so close as to crowd her. For a while there is only the fire."

The text after it is unchanged ("Then it comes, all of it, two winters' worth…").

---

## 5. "One breath" gets weight (Gathering 1; numbers chosen by Claude)

The advice taps are already built (Phase 1). Now each option gives the United Effort that follows one small edge:

| Option | Edge | Why |
|---|---|---|
| `[GO OUT NOW]` | That friend takes the first turn (as now), and that first roll gets **+2** | Bold, and right there |
| `[THE NEW PROP]` | The thing at risk (the friend in the drop) starts **10 higher** | The prop holds them |
| `[STAY WHERE YOU ARE]` | **+1 on every friend's first roll** | Nobody is out there alone |

Nothing else changes: the bars, the gold and the other rolls stay as Core Rules §5 sets them. The effect is shown on the card when it applies, for example: "+2: you went out first." If Week 1 plays well, Gatherings 2 to 5 get the same treatment in Phase 4.

---

## To build, once you say yes

1. **Campfire data for Week 1:**
   - the five rewritten clicks and the seven new road clicks;
   - the Day 1 line;
   - the read-through files stop printing the old second question.
2. **Episode 1:**
   - Day 6's map choice and its passages;
   - the act on Day 5;
   - Gathering 1's three week-lines and its "One breath" effects.
3. **The server:**
   - the Gathering notes the week's choices and the Day 6 call at its start;
   - "One breath" edges in the United Effort.
4. **Tests** for each, on the local copy.
5. **Then live, in one piece.**

**After that, a real play-test of Week 1** with Fake Guru and two or three friends, before anything changes in Weeks 2 to 6.
