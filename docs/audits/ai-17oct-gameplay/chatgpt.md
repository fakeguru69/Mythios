# Tales of the Dark Moon — Gameplay Audit

**Audit date:** 17 October 2026  
**Scope:** Full season audit of gameplay, using the prompt, measured rhythm file, all three play-through files, the existing assessment, and the post-finale secret.  
**Status:** Complete source-based design audit. It is not a substitute for live playtesting: the files cannot establish actual phone usability, player emotion, group conversation, or real elapsed time.

## Evidence and limits

Sources used: `gameplay-audit-prompt(1).md`, `gameplay-rhythm.md`, `gameplay-quality-17oct(1).md`, `season-part-1-weeks-1-2.md`, `season-part-2-weeks-3-4.md`, `season-part-3-weeks-5-6.md`, and `after-the-finale.md`.

Claims are grounded in these files. Short quoted phrases identify the relevant day or Gathering. **(guess)** marks a design inference rather than something explicitly stated by the source. Scores are reasoned design judgements, not player-test results. The play-through represents a sample party of four; the files cannot prove that all group sizes from two to six feel equally good.

**How to read scores:** 10 means excellent for this specific audience and format; 5 means mixed or unreliable; 1 means the mechanic mostly fails its purpose.

---

## 1. Verdict in five lines

1. **The gameplay has a strong social-mystery core, but the current loop underuses it.** The Seeker maps, uneven Notice information, Campfire theories and live Gathering are the best ingredients.
2. **The story/game balance is broadly right:** this should remain a story-first game for friends, not become a tactical RPG or a grind.
3. The biggest weakness is that many taps and rolls do not change anything the player cares about; weekday gameplay often sits beside the story rather than shaping it.
4. The single most important change is to make information and consequences travel: choices, rolls and observations should create different evidence, costs or advantages that friends can share and that the Gathering visibly pays off.

## 2. Criteria, scored

| # | Criterion | Score /10 | Why | Change most likely to raise it |
|---:|---|---:|---|---|
| 1 | Decisions that matter | 4 | The existing assessment counts only 9 real choices across 36 days and 8 flavour choices whose options converge on the same text. | Remove or merge empty choices; make each remaining choice alter information, cost, scene detail or what friends see. |
| 2 | Real stakes | 3 | Challenge failure mostly costs gold; fights are reportedly won 95–99% of the time; [PRESS ON] is described as safe. | Give failure a bounded, visible consequence that can matter tomorrow or at the Gathering, without blocking the plot. |
| 3 | The mystery is the game | 7 | Maps, fragments, Notice lines, Matches and theory pins can reward attention. The play-through shows that theory pins are not consistently paid back. | Track theories and acknowledge correct predictions in a later scene, Match or summary. |
| 4 | Puzzles that feel good | 7 | The six-fragment map is the clearest actual puzzle and connects to the central reveal. | Put a small fragment inference into the chapter and let hints trade certainty for a cost, rather than keeping the puzzle entirely in the Bag. |
| 5 | Friends need each other | 5 | Different Notice lines and Relic gifts create potential asymmetry, but the system does not consistently require sharing. | Make a clue, interpretation or resource held by one friend useful to another; ensure every player has a distinct contribution. |
| 6 | Asynchronous play works | 5 | The Campfire and shared pins are a sound asynchronous structure, but the assessment flags too many forms and weak clue-sharing. | Give early visitors a useful act and late visitors a clear catch-up; make later friends' posts change what the next visitor sees. |
| 7 | Rhythm between reading and doing | 6 | Weekdays are mostly story, not “point to point”; however, the taps are often continuation buttons. Gatherings include long reading stretches. | Keep long prose where it earns a reveal; reduce dead taps and break long Gathering reading with meaningful player actions. |
| 8 | Variety without confusion | 5 | Six weeks have varied locations and story beats, but fights and repeated interaction patterns risk routine. | Vary the *decision shape* and consequence, not just the setting or enemy name. |
| 9 | Week builds to Gathering; season to finale | 6 | Fragments and the map clearly feed the reveal, but weekdays reportedly change the Gathering less mechanically than they should. | Carry forward one or two meaningful weekly states: evidence learned, a cost incurred, or a resource prepared. |
| 10 | Rules tell the story | 7 | The map is an excellent example: solving it helps the Order find the Stones. The finale's child, blood, knot and Stone motifs make actions part of the fiction. | Apply this standard to Challenges, fights, [PRESS ON] and last light, so rolls represent a fictional approach rather than a detached stat check. |
| 11 | Clear feedback | 6 | The cards and outcome lines are legible in concept, but a choice whose effect is never shown cannot feel meaningful. | After every roll or choice, state what changed and what it cost or unlocked; show the carry-over later. |
| 12 | Growth feels like your character | 4 | Attributes grow, but players usually choose their strongest Attribute; gear is reportedly unnecessary for near-certain fights. | Make different Attributes reveal different useful details or approaches, not just different odds of success. |
| 13 | Reason to come back tomorrow | 7 | Daily Pulls, fragments and a half-solved weekly map are natural return hooks. | Make the next-day hook point to a question or social response, not only the next chapter. |
| 14 | Easy to return after a missed day | 6 | The format can support catch-up, and the rules prohibit losing the story on failure; the recaps and “road so far” sections support catch-up, though their real usability still needs testing. | Provide a short recap plus the day's essential clue, and let missed players still contribute at the Gathering. |
| 15 | Fairness of the social puzzle (added) | 6 | Private Notice lines can create a fair “I saw something you didn't” moment, but there is no reliable pooling step. | Ensure each important conclusion can be reached through shared evidence, even if one optional roll is missed. |
| 16 | Consequence legibility across time (added) | 4 | The assessment says failures are forgotten tomorrow and pins are not paid back. Players may not connect actions to outcomes. | Add a compact “what carried forward” line at the next chapter and Gathering. |
| 17 | Participation balance (added) | 6 | Gatherings include votes, turns, help-calls, a table question and finale acts; however, long scripture passages can leave non-rollers watching. | Give non-rollers a concurrent evidence, support or interpretation task during long reads. |

### Changes to the rubric

I added two criteria because the original list does not isolate them strongly enough:

- **Fairness of the social puzzle:** the group should be able to pool clues and reason to an answer without a single player's optional roll becoming a gate.
- **Consequence legibility across time:** a result only feels consequential if players can notice it later and understand the connection.

I also made **participation balance** explicit. The prompt already asks whether every friend matters, but a live group game can fail even when the overall story is good: a player who is not rolling may spend long stretches reading without a meaningful job.

These additions do not replace any of the original fourteen criteria.

---

## 3. The core loop

### The day

The intended daily rhythm is a short solo chapter, a paid beat (Challenge or fight), sometimes an optional [PRESS ON] roll, a Pull toward tomorrow, a Seeker Fragment, optional last light, then the shared Campfire. The measured `gameplay-rhythm.md` reports an average of **577 words of story and 6.5 taps**, with long stretches between taps. That means the weekday is not inherently too sparse on story. The problem is the quality of interaction: most taps are “go on,” the player often picks their best Attribute, and failure rarely creates a durable change.

The desired feeling is: *I saw something; I made a call; the result changed what I know or what my friends will need from me.* The reported current feeling risks being: *I read a scene, pressed through it, rolled for gold, and then did the social puzzle separately.*

### The week

Six fragments build a map; six solo chapters create the shared context; the Campfire gives friends a place to pin theories and see each other's thinking; the Gathering is the live payoff. This is a strong weekly shape because it gives the party a common question while letting them arrive with different information.

The missing link is **mechanical carry-over**. The play-through and rhythm assessment show that weekday failures usually do not carry into the next day, theory pins are not paid back, and weekday choices seldom change how the Gathering plays. So the week builds emotionally and narratively, but not always as a game system. The fix is not to add a second game. It is to let the evidence and costs already generated by the current game matter later.

### The season

The finale's design uses the weekly map mechanic to support the hidden truth: the Order uses the maps to find the Stones; the word “moon-blood” belongs to the king and his house, not the Seekers; Garrick is the last of that house and the Order is his. The finale then lets the group act under pressure, with the first friend to tap receiving a consequential choice while the others advise.

This is a good story-game payoff because earlier play can be reinterpreted rather than discarded. The risk is that players may experience the reveal as a clever explanation delivered by the script, rather than a truth they helped uncover. The game needs a visible trail of player-owned hypotheses and a moment where the party recognises what its own observations mean.

---

## 4. Each mechanic: score and recommendation

Scores below judge each mechanic's role across the full source set. They are design judgements, not player-test results.

| Mechanic | Score /10 | What works | What fails or risks failing | Verdict and concrete proposal |
|---|---:|---|---|---|
| Seeker Fragments and maps | 8 | The strongest mechanic: six daily pieces make a real weekly puzzle, and solving it advances the story in a way tied to the hidden truth. | It reportedly lives apart from the chapter; the day's scene rarely asks the player to use what they just received. | **Keep and connect.** Add one short in-scene observation or question that makes a fragment newly interpretable. Keep the six-part solve as the main weekly puzzle. |
| Challenge | 4 | Clear, bounded, character-building roll. | Usually “use my best Attribute”; fail mostly costs gold; little persists. | **Change.** Let Attribute selection change the kind of evidence or the approach. On failure, preserve the plot but add a specific cost or missing detail a friend can supply. |
| Fights | 3 | Readable and short; the scripts plant thematic details during fights. | 95–99% win rate, little choice, repeated escape outcome, gold/gear do not matter much. | **Change substantially.** Fewer, more distinct fights. Give each one a visible tactical/fictional choice—protect, pursue, interrupt, rescue—and make the result alter position or evidence. Avoid fake danger if failure has no consequence. |
| [PRESS ON] | 3 | A push-your-luck choice is an intuitive optional beat. | Reportedly safe on failure and its reward is private, so the decision is not really risky. | **Change.** Make the upside and cost explicit: e.g. gain a sharper clue now but risk losing a small amount of time/comfort or exposing yourself in the next scene. Do not make it mandatory. |
| Choices | 4 | The nine real choices reportedly work well. | Eight flavour choices violate the game's own rule that a Choice must change something. | **Cut or convert empty choices.** If both options lead to the same text and no changed state, make it a single dramatic line. Keep choices that change information, cost, scene detail or what friends see. |
| Notice lines | 7 | Different Attributes reveal different details; this is the strongest source of uneven information. Gathering 2's Notice section explicitly assigns distinct lines by highest Attribute and a different line to a fallen friend. | Without a required sharing or pooling step, distinct information can remain decorative. | **Keep and pay off.** Make the Campfire prompt ask what each player noticed, and use the pooled details in the Gathering or recap. Make sure no single line is essential to understanding the plot. |
| Last light | 4 | Optional lead choice offers a daily extra clue and feeds the fragment puzzle. | Another roll with little at stake; skipping may be the obvious choice if hints are weak. | **Change.** Make each lead a different kind of help—word meaning, location, or historical context—and state the trade-off. The player should choose what they want to know, not just chase a roll. |
| Campfire: theory pins | 6 | This is the best social form of the mystery: players commit to interpretations and see friends' thinking. | Too many forms; question and pins may not match; correct theories have no payoff. | **Keep, simplify, reward.** One required theory prompt plus optional note. At the Gathering, explicitly acknowledge a correct theory or explain why a plausible one was wrong. |
| Campfire: riddle/map work | 7 | Creates a shared weekly problem despite asynchronous schedules. | Clue sharing is not built into the flow, and the puzzle can feel separate from the chapter. | **Keep.** Add a lightweight “share this clue” action and one chapter beat that uses the fragment. Give late visitors a clear state summary. |
| Campfire: notes / asynchronous presence | 5 | Lets players leave context for friends who arrive later. | The existing assessment says the first/last visitor experience and catch-up value need work. | **Change.** Show “what's new since you were here,” one current group theory, and one unanswered question. Avoid making a late visitor read a full activity log. |
| Relics and giving them | 6 | Giving a Relic is a concrete act of generosity and can provide a meaningful +4 bonus. | If rolls are easy and the resource rarely needed, gifting is kindness without planning. | **Keep, rebalance.** Put one or two consequential but non-fatal rolls in each Gathering where a Relic can change the outcome. Make the recipient's use visible to the group. |
| Gold and gear | 3 | A simple reward economy can give wins a tangible result. | Gold mostly buys gear that fights reportedly barely require; failed Challenges take gold without much felt effect. | **Simplify.** Either make gear change a meaningful option or reduce the gold/gear economy. Avoid an economy whose main role is to compensate for rolls that don't matter. |
| Attribute growth / classes | 4 | Growth provides identity and visible progression. Attribute-based Notice lines differentiate what players perceive. | The dominant choice is reportedly the player's strongest Attribute; gear and growth do not change the way play unfolds enough. | **Change.** Let attributes offer different types of insight, not merely higher odds. Keep growth, but make it open new observations or approaches rather than simply inflate success. |
| Gathering Approach | 6 | A group vote followed by a roll begins the live session with a shared decision. Gathering 2's “go now / wait and count” changes whether Agility or Aim applies and whether the party strikes first. | If one option is obviously better or only changes the roll label, the vote is thin agency. | **Keep, sharpen.** Each option should promise a different advantage and a distinct risk, both legible before the vote. Show the result in the following scene. |
| Gathering Battle | 5 | Simultaneous personal fights and help-calls create opportunities for friends to notice and assist one another. | The assessment says the Battle can feel like tapping through rounds with little to decide and no story while it runs. | **Change.** Give each player one meaningful mid-fight decision or support choice; show the shared battlefield state. Reduce repeated rounds that only ask for another roll. |
| United Effort | 7 | One shared task, turns, two bars, and story lines that change as bars fall create a genuinely collective event. | Each turn still mostly resolves to a roll; the only decision may be when to spend a Relic. | **Keep and deepen lightly.** Give each turn a choice of method or target, with distinct bar effects. Ensure a player who is not the roller can contribute through a clue or resource. |
| Match / Connect | 7 | Matching scripture to a fragment rewards attention and can make a player feel they recognised a clue. The finale's Connect explicitly compares scripture with a fragment and names who got it right. | Two Matches per night can feel like a quiz, especially if the match is obvious or the text is long. | **Keep, vary.** Use one high-value Match per Gathering where possible; make the result change interpretation or earn explicit recognition, not just confirm a quiz answer. |
| Ask board | 6 | Lets players choose what to learn and gives the live group control over the lore reveal. | Boards can be long; a player may ask a question that doesn't connect to their own theory. | **Keep, trim.** Offer a small set of distinct questions tied to the current mystery, with concise answers. Let the party select a question as a group or spend a limited Ask token. |
| Table question | 7 | Creates a moment for real talk and lets players state what they believe or care about. | It can feel like a form if it is disconnected from what they have just learned. | **Keep.** Tie it to a live decision or theory: “What evidence changed your mind?” or “What are you willing to risk to protect?” Do not require a long written response. |
| Gathering 6 group choices / Act | 7 | The finale's act has urgency, group advice, a private choice, and logged outcomes. The options—tear the page, break the ring, do nothing—are clear and tied to what the group is witnessing. | The available script says the act ends the same immediate rite whichever option is chosen; its effects are logged for Season 2 but not fully explained to players. The labels may promise more immediate control than the scene delivers. | **Keep, clarify the promise.** State that the act cannot stop the waking but will determine what the party carries away or what state the world enters. Give a short, concrete consequence in the summary while preserving future uncertainty. |
| Finale: child names / last Notice | 8 | The “Say their names” act lets players reclaim individual children as people, and the last Notice gives every player a personal closing lens. The summary card also records the party's choices and what it learned. | Several actions are time-boxed or auto-completed; a player may not understand what their act changed. The last Notice is a strong personal beat but not a new decision. | **Keep.** Preserve the names and individual Notice lines. Make the timeout rule unobtrusive and explain in advance that all names will appear even if not tapped. |

### The finale and the hidden truth

The available finale script does several things well as gameplay, not just plot:

- It reframes the season's “moon-blood” clue as the king's title and then his house's, correcting the party's interpretation rather than introducing a completely unrelated answer.
- It turns the party's accumulated actions into the reveal: the map helped the Order locate the Stones; the party's Seeker blood is the key; Garrick's apparently kind actions have another meaning.
- It offers a group advice window and an individual act. The script makes the first player to tap the actor and gives the others thirty seconds to advise, which creates a genuine social moment.
- It closes by naming the children the party saved, then gives each player a final Attribute-specific Notice. This is a strong way to bring personal character identity into the season's final beat.

The main weakness is **agency clarity**. The script says the act cannot stop the waking and records three outcomes for Season 2, but the player is told little about what the options will change. That can be an effective tragic choice if the limit is legible: the party cannot prevent the rite, but it can choose what is preserved or lost. If the UI implies “stop the waking” when none of the options can, players may feel tricked rather than tragically constrained.

The source's own note says that the longest stretch without a decision in the finale is the Verse of the Name, about 280 words in five messages. That is not automatically too long: it is a central revelation. But the party needs a meaningful task during or immediately after it—such as selecting the fragment that best explains the passage, or seeing its existing theory pinned beside it—so that the reveal feels recognised by players rather than merely delivered to them.

---

## 5. Pacing: story against play

### What the measured rhythm says

The existing assessment reports:

- **577 words of story per weekday on average**, approximately three minutes of reading;
- **6.5 taps per weekday**;
- the longest pre-tap reading stretch ranges from **about 85 words** to **409 words**;
- across 36 days, **9 real choices** and **8 flavour choices** whose options lead to the same text;
- failed Challenges lose information on only **11 of 29 days**, and the assessment says no failure carries into the next day;
- **12 fights** are won almost every time, with six of the first seven ending in the same way: a silent man runs off;
- Gatherings run about **880 to 2,230 words**, with Gatherings 2 and 6 reportedly having about ten minutes of reading before talk or play begins.

These figures do **not** support the claim that weekdays are simply “point to point with no story.” There is substantial story between taps. The problem is that many taps have low decision value, and the game moments are often clustered after the chapter rather than woven into it.

### Where story needs more room

1. **The reveal after a player has made a meaningful inference.** Give the group a beat to react before explaining the answer. Do not rush the reveal with a continuation button.
2. **The finale's key reinterpretations.** “Moon-blood,” Garrick's role, the fifth Stone and the children's repeated appearances are season-level payoffs. Preserve the quiet beats and the individual final Notice.
3. **The consequences of a hard choice.** Let the outcome land in a line or image before displaying the next control.

### Where less is needed

1. **Continuation taps without a dramatic function.** Merge consecutive “go on” buttons unless the pause creates suspense or marks a genuine chapter boundary.
2. **Repeated fights with the same outcome.** If a fight neither changes the scene nor asks for a choice, it is a tax on reading rather than gameplay.
3. **Redundant forms at the Campfire.** Reduce the number of separate prompts; keep one useful theory, one clue-sharing action and optional notes.
4. **Quiz-like repetition.** If two Matches in one Gathering test the same kind of attention, consider cutting one or changing its function.

### Where gameplay should move inside the scene

- When a fragment arrives, ask the player to notice one word or choose which of two interpretations fits the scene; do not wait until the Campfire to make the fragment relevant.
- When the player chooses an Attribute, make the choice determine *how* they discover something. For example, Intellect could identify the pattern, Craft could notice how an object was made, and Charm could read a witness's avoidance. This is an illustrative design pattern, not a claim about a missing weekday scene.
- When a roll fails, change the scene, the information available, the cost, or the next day's starting condition. Keep the main plot accessible.
- During a long Gathering scripture passage, let non-rollers work on a relevant Match or compare their pinned theory with the text. Do not interrupt every paragraph: the reading itself should still have room to land.

**Recommendation:** Do not add story merely to create longer gaps between buttons, and do not cut story just to raise the number of interactions. Reduce empty interactions and make the remaining ones carry narrative weight.

---

## 6. The eight questions, answered

### 1. Is it more game or more story, and is the balance right?

It is more story than game, and that is the right target for friends who want to share a mystery rather than grind a puzzle. The mistake would be trying to make every minute tactical. The goal is to make a small number of decisions, rolls and observations matter enough that players talk about them.

### 2. Is there enough room for story between buttons, or too much?

There is enough story, based on the reported average of 577 words per weekday and the measured stretches of up to 409 words between taps. The more urgent issue is low-value tapping: 6.5 taps a day, most reportedly continuation buttons, alongside only nine real choices across 36 days. Keep earned reading; cut or repurpose empty buttons.

### 3. Should gameplay be woven into the story or come after it?

Both, deliberately. A chapter needs uninterrupted reading when tension or atmosphere benefits from it. But the key mechanic should sometimes happen *inside* the scene: the Attribute choice shapes what is noticed, the fragment becomes a clue, and a failed roll changes the next beat. Keep the Campfire as a social space, not as the only place the game becomes a game.

### 4. Does every button earn its place?

No, according to the existing assessment. Merge plain “go on” buttons unless they mark a dramatic pause; remove flavour choices with identical outcomes; give each remaining control one job: decision, reveal, contribution, or dramatic beat. In a live Gathering, a button can also be justified if it gives a quieter player an explicit way to participate.

### 5. Do the dice matter?

Not enough. Challenges mostly affect gold; fights are almost always won; [PRESS ON] is described as having no real failure cost. A roll matters when its result changes something the player cares about. Use bounded costs such as lost detail, a worse position, an exposed clue or a harder next task. Do not block the story or kill characters; the rules explicitly rule that out.

### 6. Do friends need each other?

They have the raw materials, but the need is not reliable yet. Different Notice lines and Relic gifts can create asymmetry, while the Campfire can show different theories. Add explicit pooling: ask each friend to contribute one observation, show how the combined evidence changes the group's understanding, and pay off the correct theory at the Gathering. A player should be able to say, “I had the detail you needed.”

### 7. Does the week build to the Gathering?

Narratively, yes: fragments become maps and maps connect to the Stone hunt. Mechanically, not strongly enough, according to the existing assessment. Let weekdays change the Gathering through one or two clear carry-overs—what the party knows, what position it begins in, or which support it prepared. Avoid a large persistent-state system; a small number of visible consequences is enough.

### 8. Would I come back every day for six weeks?

The story hook, daily Pull, fragments and shared theories are credible reasons to return. The risks are routine: a predictable Challenge, a near-automatic fight, gold that buys unnecessary gear, and forms that feel like homework. The best retention change is not a streak reward. It is ending each day with a live question, a clue a friend may need, or a theory that will be tested at the Gathering. Missed days must be easy to recover from.

---

## 7. Ten changes ranked by likely impact

### 1. Make every meaningful roll produce a visible story or information difference

- **Change:** For each Challenge and fight, define a pass outcome, a fail outcome and what carries forward. Failure may cost a clue, position, comfort, time or gold, but never the main story.
- **Why:** Raises criteria 1, 2, 9, 10 and 11.
- **Cost:** **Big** — requires outcome writing and state tracking across the season.
- **Risk:** Too many branches could create authoring and QA complexity. Keep the differences small and reusable.

### 2. Remove flavour choices that change nothing

- **Change:** If options produce the same text, state and future visibility, make it a single line or turn it into a real choice.
- **Why:** Raises criteria 1 and 7; removes friction without cutting story.
- **Cost:** **Small to Medium** — depends on how many scenes need rewriting.
- **Risk:** Some choices may be intentionally expressive. Preserve those only if the player understands that the choice is self-expression, not a mechanical decision.

### 3. Turn Notice lines into shared evidence

- **Change:** After individual Notice lines, the Campfire asks each friend to post or select the detail they think matters. The Gathering reuses at least one pooled detail.
- **Why:** Raises criteria 3, 5, 6 and 9.
- **Cost:** **Medium** — a small interface change plus authored payoff lines.
- **Risk:** Players may feel forced to reveal everything. Let them choose which observation to share, and ensure no essential plot fact is locked behind sharing.

### 4. Pay back theory pins

- **Change:** Record the group's pinned theory and explicitly respond at the Gathering: correct, partly right, or plausible but contradicted by new evidence.
- **Why:** Raises criteria 3, 5, 9 and 13.
- **Cost:** **Medium** — requires mapping likely theories to authored responses.
- **Risk:** Free-form theories are hard to classify without an improvising GM. Use a few selectable theory frames or have the narrator acknowledge the *kind* of reasoning, not attempt to judge arbitrary prose.

### 5. Rework fights around one meaningful decision

- **Change:** Each fight asks for a choice such as protect the witness, pursue the runner or interrupt the chant. The roll resolves the chosen approach; outcomes alter evidence or position.
- **Why:** Raises criteria 1, 2, 8, 10 and 12.
- **Cost:** **Big** — fight cards and outcome text need redesign.
- **Risk:** It could turn a story game into a tactical game. Limit each fight to one clear decision and a short resolution.

### 6. Give [PRESS ON] a real but optional trade-off

- **Change:** Before the roll, state what extra benefit is possible and what a failure costs. The cost should be bounded and understandable.
- **Why:** Raises criteria 1, 2, 11 and 13.
- **Cost:** **Medium** — requires alternate result lines and carry-over rules.
- **Risk:** Players may feel punished for exploring. Make the base path complete and never put an essential clue exclusively behind [PRESS ON].

### 7. Simplify the Campfire

- **Change:** Keep one theory pin, one clue-sharing action, one riddle/map action and optional notes. Remove overlapping forms; show what changed since the player's last visit.
- **Why:** Raises criteria 3, 5, 6, 7 and 14.
- **Cost:** **Medium** — screen and prompt redesign.
- **Risk:** Oversimplification may remove the pleasure of browsing friends' ideas. Keep other friends' pins visible and preserve optional notes.

### 8. Make Attribute choice change the kind of discovery

- **Change:** Attributes should lead to different information or approaches, not only different odds. Let players choose based on what they want to learn, not always their strongest stat.
- **Why:** Raises criteria 1, 3, 8, 10 and 12.
- **Cost:** **Big** — requires a consistent authored pattern across the 36 days.
- **Risk:** Players may feel forced to use weak Attributes. Make every approach useful and avoid making one route strictly optimal.

### 9. Give the Gathering's non-rollers a job during long reading

- **Change:** In scripture/reveal sections, give players a quiet concurrent task: match a fragment, compare a pinned theory, select a question, or identify the line that changes their interpretation. Keep the reveal's silence after the task.
- **Why:** Raises criteria 5, 7 and 17.
- **Cost:** **Medium** — new prompts and a small number of actions.
- **Risk:** Too much interactivity may interrupt emotional reading. Use one well-placed action, not a button after every paragraph.

### 10. Clarify what the finale's Act can and cannot change

- **Change:** Before the thirty-second advice window, establish that the waking cannot be stopped, but the act determines what the party preserves, loses or carries forward. Reflect the choice in the summary in a way players can understand.
- **Why:** Raises criteria 1, 2, 9 and 11.
- **Cost:** **Small to Medium** — likely a few lines and clearer result copy.
- **Risk:** Explaining too much can spoil the cliffhanger. Explain the *scope* of agency, not the future consequences in full.

---

## 8. What to test with real players

A paper audit cannot answer these five questions. Test with three or four friends, including at least one person who tends to read quietly and one who misses a day or joins late. Run Week 1 and Gathering 1 first, then a later week if feasible.

1. **Do players talk at the Campfire, or merely complete forms?** Watch whether one person's observation prompts a reply, disagreement or changed theory. Count unprompted exchanges, not just submitted pins.
2. **Does a failed roll feel meaningful but fair?** After a failure, ask the player what changed and whether the cost felt proportionate. If they cannot explain the consequence, feedback is too weak; if they feel locked out of the story, the cost is too severe.
3. **Does the weekday take the intended 8–12 minutes, and does the Gathering fit its target?** Time actual sessions, including reading on a phone, decision delays and discussion. Do not estimate from word count alone.
4. **Do players who are not rolling feel involved during the Gathering?** Observe the longest stretches in which a player only reads. Ask them afterward which moments they influenced and which moments they watched passively.
5. **Does the mystery feel earned?** Before the reveal, ask each player what they suspect and what evidence supports it. After the reveal, ask whether the clues now make sense and whether the party's theories were acknowledged. The target is “I could have worked that out,” not “the narrator told us.”

### Suggested playtest method

- Do not explain the design goals before play; that can bias reactions.
- Observe silently. Record timestamps, choices, unprompted conversation, confusion, rereads and moments where a player asks what a button does.
- After play, ask for concrete moments: “When did you feel you changed something?” “When did you stop paying attention?” “What did another friend contribute that you needed?”
- Do not treat a single group as proof. Use the first test to find friction, revise, then test again with a different group.

---

## 9. What must not change

1. **The story-first promise.** This is a shared mystery, not a combat game wearing a story costume. Do not add mechanics for their own sake.
2. **The six-fragment weekly map.** It is the strongest link between daily play, shared deduction and the season's hidden truth.
3. **Uneven information.** Attribute-specific Notice lines give friends different pieces of the world. Make them matter; do not flatten them into identical narration.
4. **The Campfire as a shared asynchronous space.** Its social promise is essential. Simplify it, but do not turn it into a private checklist.
5. **The Gathering as a weekly payoff.** Keep votes, shared effort, a table question, reveals and a cliffhanger. Improve participation rather than replacing the format.
6. **Relic-giving as an act of generosity.** Make it more useful, but preserve the moment of choosing to help a friend.
7. **Failure never blocks the story and nobody dies.** Consequences should create a different route through the same plot, not punish a player by excluding them.
8. **The finale's child-name moment and personal last Notice.** These connect the season's plot to the party's care for individual people and to each character's way of seeing.
9. **Garrick's honesty as a design constraint.** The twist works because his true words are reinterpreted, not because the game reveals that he lied. Keep the deception fair.
10. **Quiet beats at major turns.** The game needs silence and emotional space as much as it needs decisions.

---


## Appendix A. Stage-by-stage play audit

The scores below answer the prompt's Stage 1–3 requirement. “Strongest” names the most promising play moment; “weakest” identifies the least valuable interaction or structural problem; the fix is concrete. Scores judge play design, not prose quality. The source's weekday rhythm figures describe the main path only.

### Stage 1 — Weeks 1 and 2

| Day | Play /10 | Strongest moment | Weakest interaction and fix |
|---|---:|---|---|
| W1D1 — “The forest road” | 7 | “Four names. Yours is one of them.” The fight, two inspectable traces and Attribute Notice give several ways to pay attention. | The fight is round-tapping without an in-fight decision. Keep the inspection choice; make Might/Craft determine extra evidence rather than whether the core clue arrives. **Medium** |
| W1D2 — “The Hollow Wake Inn” | 6 | Fitting the torn page is a concrete evidence task; [PRESS ON] can reveal more. | FIT THE PAGE mainly changes delay/gold while the core plot continues. Make Intellect reveal handwriting evidence and Craft reveal physical evidence; make [PRESS ON] carry a clear cost. **Medium** |
| W1D3 — “The Widow’s Tooth” | 7 | Choosing the marking or cart ruts changes who strikes first. | The fight ends in the recurring silent retreat. Give the fight one tactical decision and let its result create a trace or advantage for Day 4. **Medium** |
| W1D4 — “Fenmark” | 5 | “What happened in this village, and why will nobody say?” is a strong investigative question. | Three flavour choices add taps without changing the scene. Merge them into one approach that changes the clue or what the party can compare. **Medium** |
| W1D5 — “The old charcoal camp” | 7 | Looking at the step, fire or path is a good evidence-selection structure. | The combat consequence may be opaque. Explain the trade-off before choosing and make the selected evidence visible to the party. **Small** |
| W1D6 — “The ford” | 6 | READ THE WATERLINE risks losing the explanation of how the child was taken. | This is harsher than the usual “clue still comes” pattern and may gate deduction behind a roll. Preserve the core clue; let failure lose a detail a friend can recover. **Medium** |
| W1D7 — Gathering 1 | 7 | The Approach and map bonus make weekly puzzle work change initiative. | Battle taps and the Might-based United Effort are repetitive. Add one group Battle decision and let the United Effort change the evidence or position carried forward. **Medium** |
| W2D1 — “The second name” | 6 | The party must choose which child to pursue; Charm/Aim fit the conversation or observation. | [ASK HIM WHAT HE KNOWS] has no clear trade-off. Make the selected question foreground distinct evidence and summarize it for the party. **Small–Medium** |
| W2D2 — “The mill” | 6 | Latch, lane and wheel footing are tangible things to inspect. | The selected branch plays and then the others follow, so the choice is mostly ordering. Make the first clue the player's discovery; keep other clues as optional follow-ups or a shared recap. **Small** |
| W2D3 — “Upriver” | 6 | Tracks and the chained dog make a physical trail. | Failure adds noise and delay while the main trail survives; the fight is another tap loop. Carry a bounded cost into the Gathering while keeping the essential clue available. **Medium** |
| W2D4 — “What the hillside hides” | 6 | Agility versus Charm is a credible stealth/social approach. | Failure says the player is seen and sees almost nothing, yet the plot continues. Give a partial observation and a clear “noticed” state that affects the next scene. **Medium** |
| W2D5 — “The hillside by night” | 7 | Walking the hill versus reading Meira’s pages changes who strikes first. | “The one sent up to look” repeats the silent-opponent pattern. Replace the fight with a choice to pursue or secure evidence unless the fight creates a new consequence. **Medium** |
| W2D6 — “The other way in” | 7 | READ THE HILL and [PRESS ON] can provide an extra detail about what lies below. | The harder roll is weak if its only payoff is an isolated detail. Make the result shareable and give failure a modest exposure/time cost. **Small–Medium** |
| W2D7 — Gathering 2 | 6 | Match and Ask let players interrogate evidence actively. | 2,231 words and about ten minutes of reading make this the longest Gathering before enough player work. Split the reveal with an evidence task; surface four high-value Ask questions first. **Medium** |

### Stage 2 — Weeks 3 and 4

| Day | Play /10 | Strongest moment | Weakest interaction and fix |
|---|---:|---|---|
| W3D1 — “Somewhere warm” | 7 | “She said they told her she was going home first.” The child’s account gives the search emotional purpose. | Asking about the fourth name is steered away from that trail. Record it as an unresolved lead rather than making the question feel wasted. **Small** |
| W3D2 — “The Blackglass” | 6 | The glass is a distinct physical puzzle object. | The measured strip has 409 words before a tap, the season’s longest uninterrupted read. Insert one meaningful inspect/interpret choice into that passage, not another generic continue. **Small** |
| W3D3 — “The kiln” | 6 | Searching remains and pressing further can reward attention. | [PRESS ON] is another isolated bonus-detail roll. Make the extra detail a shared clue and ask the player to compare it with a friend’s Notice. **Small–Medium** |
| W3D4 — “The fork” | 7 | Route selection offers a natural tracking decision. | The route may colour the moment without changing what the group knows. Give each route a distinct observation and ask the Campfire to compare the evidence. **Medium** |
| W3D5 — “The empty hut” | 6 | The emptied location creates a useful absence to interpret. | A fight interrupts the investigation and again ends in retreat. Let players choose pursuit (position advantage) or securing the hut (clue). **Medium** |
| W3D6 — “The cairn” | 6 | The cairn and local name make discovery place-specific. | The flavour choice and optional roll lack visible later payoff. Turn the selected observation into a map annotation or Campfire evidence card. **Small** |
| W3D7 — Gathering 3 | 7 | The case and Verse of the Fall invite the group to assemble evidence. | The Ask board has 16 questions and risks becoming an FAQ. Put four useful questions first and reveal more only on request. **Medium** |
| W4D1 — “Under the Kiln” | 7 | “Every time they’ve had knives out at you, not one of you has died” can make earlier fights newly meaningful. | The 365-word pre-tap stretch is long for a scene with a real choice and roll. Break at the evidence point and let the Challenge alter the inference. **Small** |
| W4D2 — “The drowned village” | 6 | The lake and tower change the physical setting. | Ten taps, most not decisions, plus another fight make the day mechanically busy but not choice-rich. Merge transitions and offer rescue/pursuit/evidence as the one consequential choice. **Medium** |
| W4D3 — “The tower” | 6 | The tower is a clear target for investigation. | No real choice appears in the rhythm data; the Challenge mostly changes gold and the local fail branch. Let Craft/Intellect expose different useful evidence. **Medium** |
| W4D4 — “The page” | 6 | The short chapter gives the fifth-Stone information room to register. | [PRESS ON] has little durable consequence. Make it a clear exposure-for-clue trade. **Small** |
| W4D5 — “The pen” | 6 | Meira’s personal object can connect the investigation to present danger. | Challenge plus fight are two mechanical beats with little decision inside either. Let the fight determine whether the party preserves, copies or must reconstruct the evidence. **Medium** |
| W4D6 — “The torn page” | 7 | The missing ending invites a player theory before the answer is known. | The Challenge still uses the standard gold/attribute economy. Let the Attribute choice create different interpretations to pin and later confirm or challenge. **Medium** |
| W4D7 — Gathering 4 | 8 | Verse of the Four, the pen and the torn page give players evidence to connect; Garrick’s family explanation can be reinterpreted later. | The reveal chain risks passivity and the Ask board has 13 questions. Pause for a player hypothesis before the next reveal; prioritize four questions. **Medium** |

### Stage 3 — Weeks 5 and 6

| Day | Play /10 | Strongest moment | Weakest interaction and fix |
|---|---:|---|---|
| W5D1 — “The grey afternoon” | 7 | The waystone yields HIGHWALL through a physical trace. | The 329-word stretch before the Challenge delays player agency. Ask for a hypothesis before the roll; let the roll add confidence/corroboration rather than gate the destination. **Small–Medium** |
| W5D2 — “The old kingdom’s road” | 6 | The heartbeat and old road make the crisis environmental. | “WHAT WAS A FARM DOG” risks being routine combat at a point where urgency rises. Replace it with concealment-versus-speed, affecting the next scene. **Medium** |
| W5D3 — “The herald’s gate” | 6 | Aim/Might give plausible ways into the dead city. | Success mostly buys time/gold. Make success reveal a safe route and failure reveal it at a cost, affecting the next encounter’s position. **Medium** |
| W5D4 — “The dead streets” | 6 | The Street of Soldiers invites the player to question what they see. | [PRESS ON] is another low-risk bonus roll. Tie the extra observation to a shared theory and make failure create a small exposure cost. **Small** |
| W5D5 — “Below the hall” | 7 | “Who keeps a fire below the hall?” is a focused mystery question. | Failure hides much of the scene without a clear recovery route. Preserve one clue and make the lost observation something a friend can supply from Notice or Ask. **Medium** |
| W5D6 — “The wall again” | 7 | “POST [friend]” explicitly involves another player. | The chosen friend changes the moment, not the team’s result. Give them a distinct clue or role and a fallback if they missed the day. **Medium** |
| W5D7 — Gathering 5 | 7 | The Roll-Call United Effort has a clear social objective; the children’s return matters emotionally. | The map and Match still mainly change bonuses/recognition. Let the Effort preserve a resource or position for Week 6. **Medium** |
| W6D1 — “Six nights” | 7 | Losing Gathering 5’s United Effort makes this Challenge two harder: a rare cross-week consequence. | The penalty may feel arbitrary unless the carry-over is explained. Show “what carried forward” and provide a recovery route through evidence or a Relic. **Small** |
| W6D2 — “Five nights” | 6 | The collapse makes structural danger part of the play. | Failure makes noise, but the player has no clear pre-roll risk choice. Offer careful/slow versus fast/exposed approaches with different next-scene effects. **Medium** |
| W6D3 — “Four nights” | 7 | The Watch/Board choice offers different sources of evidence during the countdown. | If both branches soon play, this is ordering rather than agency. Make the chosen branch the player’s discovery; make the other a follow-up or shared contribution. **Small** |
| W6D4 — “Three nights” | 7 | “LOOK FOR THE ONE THAT IS DIFFERENT” is a strong deduction verb; the crack encounter creates an obstacle. | Ten taps and a short 85-word maximum read between taps make the chapter feel fragmented; the fight is still a tap loop. Collapse transitions and add one tactical fight choice. **Medium** |
| W6D5 — “Two nights” | 7 | The scored-dark moon and Sky-Watchers’ Wall tie a puzzle to the finale mechanism. | The core interpretation risks being tied to a standard Challenge. Guarantee the core meaning; let the roll provide corroboration or a shareable extra clue. **Medium** |
| W6D6 — “One night” | 8 | The final Challenge and fight make the day a threshold; success can affect who strikes first. | Eleven taps—the season high—come just before the finale. Remove transition taps and move one setup reveal into the Gathering. **Small–Medium** |
| W6D7 — Gathering 6, finale | 8 | Four group choices, the Verse of the Name and the king reveal make this the most explicitly participatory Gathering. | At 1,994 words/about nine minutes of reading, the climax risks becoming a narrated sequence; the Act labels promise more control than the fixed outcome delivers. State the Act’s true scope and give every player a concrete contribution. **Medium** |

### What changes across the stages

- **Weeks 1–2:** the loop is fresh. W1D3 and W2D5 show choices changing initiative; Gathering 1 proves the map can matter mechanically. Repetitive silent-opponent fights and Challenge-for-gold already appear early.
- **Weeks 3–4:** evidence becomes richer but mechanics do not evolve at the same rate. The long Blackglass read and 16-question Ask board are the clearest pacing burdens. Week 4 offers the strongest retrospective clue potential, especially the observation that no one has died despite repeated attacks.
- **Weeks 5–6:** urgency rises and a real cross-week consequence appears when the lost Gathering 5 United Effort makes W6D1 harder. The finale’s group choices are strongest, but their scope needs clearer feedback because the fixed plot still proceeds.

## Appendix B. The eight questions, direct answers

1. **More game or more story?** More story, appropriately. The audience is friends sharing a mystery. The problem is that many game interactions do not make the story more playable.
2. **Enough story between buttons?** Yes, mostly. Weekdays average 577 words and about three minutes of reading. The longest uninterrupted stretch is 409 words (W3D2); the shortest longest-stretch is 85 words (W6D4). The issue is dead taps, not too little prose.
3. **Woven in or after?** Woven in selectively. Put choices where a player notices evidence, faces risk or chooses what to protect; do not make every paragraph interactive.
4. **Does every button earn its place?** No. Merge continuation taps where no dramatic pause is needed, cut flavour choices that alter nothing, and preserve inspect actions when they let players choose evidence.
5. **Do dice matter?** Sometimes. Choices affect first strike in a few weekday fights; Gathering Approaches affect initiative; the map gives +2; losing Gathering 5’s United Effort raises a Week 6 DC. Most weekday rolls still chiefly change gold, Attribute growth and local texture.
6. **Do friends need each other?** Potentially, but not consistently. Attribute-specific Notice and Relic gifts are the right raw material. Require comparisons of observations and visibly acknowledge shared theories.
7. **Does the week build to the Gathering?** Narratively yes; mechanically unevenly. The map bonus is a good link. Evidence, pinned theories and player choices should change more than a small bonus or scene order.
8. **Would I return daily?** The Pull, fragments and half-built map are good hooks. Repeated Campfire forms, routine rolls and little payback for theory pins may make the habit feel like maintenance. **(guess)** until tested with players.

## Appendix C. Source-derived cautions

- The rhythm figures describe the main path only: Challenge passed, fight won, [PRESS ON] left, first option chosen. Branch paths can differ.
- Reading time uses the source’s estimate of 230 words per minute; real mobile reading, interruptions and discussion can take longer.
- Gathering word counts exclude the live discussion the game prompts; reading time is not the same as total session time.
- The play-through shows a four-person sample. It cannot prove participation quality for two or six players.
- This is a gameplay audit. Story and prose are not scored independently except where they affect agency, clue fairness, feedback or emotional pacing.
