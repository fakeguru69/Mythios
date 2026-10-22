# Campfire experience audit (22 Oct)

Audit of Campfire mode, Season 1, Weeks 1–6 (36 nights). Read against the live data and both fires:

- Content: `src/data/campfireDaysData.ts`, `fanOutLeads.ts`, `fragmentMeaningQuestions.ts`, `weekQuestions.ts`, `dayRecaps.ts`, `garrickRecap.ts`, `garrickPrompt.ts`, `garrickRouter.ts`, `mythiosFragments.ts`, `chapterScripts.ts` (Pulls), `gatheringScripts.ts`
- Demo fire: `src/components/CampfireEveningView.tsx`, `StoryAndPartyTabs.tsx`, `RecordTabView.tsx`
- Live fire: `src/online/OnlineCampfire.tsx`, `OnlineCasebook.tsx`, `supabase/migrations/0108_campfire_weeks_2_to_6.sql` (`fire_check_clicks`, `party_read_backs`, `gathering_read_backs`)

This is a new pass. It does not replace `docs/design/campfire-content-verdict-17oct.md`. Where the two disagree, this file is looking at the fire the player actually sits in, not only at whether a question is fair.

The Campfire's prose is already a novel. The evening the player sits through is still a form. The live fire in `OnlineCampfire.tsx` is closer to the vision than the eight-card workbench in `CampfireEveningView.tsx`.

## 1. Executive verdict

| Pillar | Score | Blunt read |
|---|---|---|
| Organic feel | **6** | Garrick's best lines sound like a man at a fire. The chrome around them says worksheet. |
| Async / live collaboration | **5** | One mechanic truly needs two players. Everything else can be soloed, and that mechanic resolves itself. |
| Mystery progression and payoff | **7** | The season teaches something new almost every day. The fire often asks a smaller question than the day just answered. |
| Seeker fragment integration | **4** | The verses are the best writing in the game. The fire turns them into an anagram plus a comprehension quiz. |
| UX simplicity and flow | **4** demo / **6** live | The demo never even runs the click the data was written for. The live fire is one stream with a form nailed to the top. |
| Literary prose | **8** clues and verses / **5** questions | Physical detail is gold. The prompts asked about that detail are often exam questions. |

The single missed opportunity: the party is never required to *say the deduction*. The game either withholds it or announces it.

## 2. Deep-dive audit

### 2.1 Organic play and collaboration

What actually requires another player is one SQL gate in `fire_check_clicks`. A click is inserted only when the two paired leads are on the table **and** they were laid by two different user ids. If the same person holds both, or only one half arrives, the synthesis never happens. That is a real async handshake: Player A at 6pm lays `1-2-2`, Player B at 11pm lays `1-2-3`, and the line appears under B's card. Good.

Then the game wastes it. The click is posted as a finished paragraph under the label `MYTHIOS · SOMETHING CLICKS`. Nobody has to notice, argue, or be wrong. The sharp player does the thinking at dawn when they pick Reading A or B off a menu. Pin-before-peek stops copying, which is right, but a menu is not a conversation. Agree and Doubt on each card are reactions, not talk.

The week question never enters the fire. It sits on the casebook tab (`WEEK_QUESTIONS`) and is read back at the Gathering as up to three edited lines. A friend can update "Why are our names on that list?" alone in another tab and never say it aloud.

Live Garrick cannot sit in the mystery. `garrickPrompt.ts` bans Meira, the Order, Seeker, moon-blood, shard, stone, Tamsin, Corin, Wren, Joss, and Highwall from his mouth. Ask him what the list means and the router sends him to stew. He steers the case only through prewritten opener, nudge, and callback. `nudgeIfLaid` — the one hook where a specific card changes what he says — is filled on **two** nights, `1-2` and `1-4`.

Small parties stall in a specific way. One player can never click. Two players click only if they happened to take the matching pair out of three. There is no line that says "the other half of this is still out in the dark." The late friend sees a puzzle card with a question and no answer. The bottle and the catch-up line in the demo are the right instinct. They are a text field above a stack of other text fields, so they feel like another form.

Cup nights and `{friend:Attr}` nudges do not create camaraderie by themselves. The cup stage direction is genuinely good, and it is the same sentence all eight nights (`1-2`, `1-6`, `2-1`, `2-6`, `3-4`, `4-2`, `5-4`, `6-6`). The nudges sometimes pick a friend and sometimes pick a stat for no reason the table can feel. "Garrick asks {Intellect friend}" is a die roll wearing a man's voice.

### 2.2 Day-to-fire transition

The day recap is not the fire. `dayRecaps.ts` is the next morning's storybook, and it is the best payoff in the loop: concrete, branched-plot-safe, and it ends on the Pull. The fire opens on a separate Garrick line that often ignores what the day just did to them.

Lines that earn the chair:

- `2-2` "Asked for by name, and by the night he was born."
- `4-1` "Count yourselves. I will, too."
- `5-4`'s silence, where he pours the extra cup at the window facing the hall.
- `6-6` "Last night of the count. Eat what you like."

Lines that could be any night at any inn:

- `1-2` "You've paid for your rooms and you haven't burned anything down."
- `1-3` "You've not eaten. Sit."
- `2-1` "Beds are in the barn tonight."

After the Widow's Tooth, the runner, and the child's horse, "you've not eaten" is a host, not a witness.

The daytime roll barely survives the fire. The clue always comes back. Failure only swaps in one of four stock late lines ("It takes you until full dark, but you find it"), and that same line is copied onto all three leads of the day. Which lead you chose matters. Whether you were any good at it does not.

`2-4` breaks the quiet-night pattern. It is `tone: "quiet"` but it has a spoken opener and no `narratedSilence`. The other quiet nights (`1-4`, `3-2`, `4-3`, `4-6`, `5-4`, `6-2`) go silent. `2-4` talks, then still refuses the click.

### 2.3 Component overload

A night currently asks the player to hold, in some combination:

1. Morning recap, already consumed before the day
2. Garrick opener or narrated silence
3. Cup stage direction
4. Up to two noticing templates
5. Bottle, if alone
6. Catch-up and someone else's question pin
7. Three clue cards, plus "Nobody took this lead"
8. A puzzle question that is not the night's question
9. An automatic click paragraph
10. Callback card ("GARRICK REMEMBERS")
11. Fragment anagram, two locks, first-letter hint
12. Meaning question and a 140-character pin
13. Nudge
14. Fork A / Fork B / Neither
15. Optional theory note
16. Pin-before-peek lock
17. A second question pin ("for whoever comes next")
18. Day 6 revisit of earlier pins, which Garrick closes with "Those are on the board."
19. Riddle UI
20. "What we did today"
21. Closer
22. Chat, with Ask Garrick as a mode
23. Week question, on another tab

The riddle is dead weight. `riddle` is null on all 36 days, and the demo still renders Step 6. The demo also never reads `puzzle`, `clicks`, or `clickText`. That data only lives in the online fire. Two interfaces, one of them a test harness with "Solo Only," "5:00am Cutoff," and "Lost today's fight" sitting above the scene.

The online fire is the right shape and then pins a sticky `TONIGHT'S QUESTION` over the stream, drops a boxed `TONIGHT'S PUZZLE`, and sends the fragment to a tray labeled "Your fragment." Three surfaces for one evening.

### 2.4 Clues and the click

The leads are the strongest system in the game. They are physical, and a careful reader can do something with them. There is not a night whose three observations are flavor. The failure is structural.

Every active night has exactly one pair. The third lead is never allowed to speak in the synthesis. Sometimes that is a fair red herring (`1-6-1` threads at a child's height, while the click proves the cart left empty). Often the third lead is the one that actually bears on the fork, and the click answers a side question.

| Night | Puzzle asks | Click actually proves | Third lead, left out |
|---|---|---|---|
| `2-1` | How did the cart travel in the dark? | It went up empty and came down laden. Different question. | `2-1-2` The ruts never paused at any other house. That is the night's question. |
| `4-2` | How did they guard the cart? | Bare blades, eyes on the box. Restates the two cards. | `4-2-3` They stayed on the open road when a hidden path existed. That is the decoy fork. |
| `5-5` | War-band or permanent post? | Permanent post. The chapter already said some of them have kept this camp all their lives. | `5-5-2` Every head lifts when the beat comes. That is the countdown. |
| `6-1` | Could a candle show through the slit? | No flame could ever show. This nearly kills Fork A. | `6-1-2` He looks at the wall, then strikes the chalk. That is the whole debate. |
| `6-6` | Where is the garrison? | The city is emptying toward the hall. Already visible. | `6-6-2` Grit swept in a quarter-circle at the blank rock. The door. The nudge mentions it. The click ignores it. |

Quiet nights (`1-4`, `2-4`, `3-2`, `4-3`, `4-6`, `5-4`, `6-2`, plus solitary `1-1`) ship three excellent clues and no synthesis at all. `5-4` is the worst miss. Unbroken dust, one scrape of metal, helms that were never aligned: the click should be "they moved, and they did not walk." Withholding it because the night is quiet makes quiet mean "we turned the puzzle off," not "the contradiction is the point."

`1-4` is the same shape. Leaned bar, three doors passed, a covered cup on the sill. Together they say she was chosen and the taking was practiced. The night's question is exactly that, and the pieces never touch.

Zero-spoil holds on the best clicks.

- `1-2` proves she did not pack in fear and does not date the child.
- `1-6` proves the cart was empty and does not say why your names are on the list.
- `4-4` proves Meira had a second thought and does not say what moon-blood is.

Those are the model. `6-1` is not.

### 2.5 Did every day teach something new?

The chapter spine does.

- Week 1: list, Meira, the rock, a named child, a second child two winters back, a map.
- Week 2: named taking, birth-night, a lock that opens for you, a rite in progress, a black circle, an older room.
- Week 3: the child is being returned, politeness, riders who ignore the marks, a child leaving a numbered trail, the Order's own words over her bed, the Kiln lit.
- Week 4: you were spared on purpose, the box matters more than the boy, they are waiting, moon-blood may not mean what Meira wrote, the boy is alive and unhurried, someone heard the map.
- Week 5: a fifth, a heartbeat, a gate tended from inside, soldiers mid-stride, a generational countdown, a room the Order has never found.
- Week 6: the count, the dead walking, heat low on the wall, a door the Seekers left, the hour, the word *here*.

The fire's questions do not always keep that pace.

- `4-5` asks how Joss has been kept comfortable. The day already showed he is alive and carving. The fork (shifting the watch, or watching for you) is the real question, and the click never touches it.
- `5-5`'s click re-proves a permanent camp. The fork, calendar versus a sign from the hall, is the week's actual engine, and the third lead is the one that feeds it.
- `6-1` through `6-3` are the same night three times if you squint: closer, warmer, still no door. `6-3`'s click (dust on the seam, heat only below the knee) is the one that earns its place. `6-1`'s does not.
- `3-6`'s nudge abandons the mystery entirely: "If we go down in the dark, how do we keep from sliding?"

Fork quality is high from `1-1` through `4-4` and again at `5-2`, `5-4`, `6-3`, `6-4`, and `6-6`. Both sides have an object. The weak forks are the ones where one side is the chapter you just played and the other is a flatter version of it. `5-4` Fork A, "the dusk light played tricks," is the only reading a player would be embarrassed to pin, even though `5-4-3` (no two helms alike) honestly supports it. Give that fork a spine or it will never be chosen by anyone who wants to look clever.

Read-back is thinner than the design claims. `party_read_backs` fires on nine weekdays across six weeks, not on day 3 and day 6 as a rule. The weekday anchors that exist are `1-2`, `1-4`, `1-5`, `2-2`, `3-2`, `4-6`, `5-5`, `6-3`, and `6-6`. The Gathering paste is "The fire called it on Day 4: She was someone in particular," dropped beside an anchor. It does not show the object that proved them right, or the object that made the clever reading look small. Week 1 at the wall can carry it, because "None of them is yours" cuts both forks: you are marked like the children, and Meira did not choose you. Most other read-backs are a sticky note on the chapter. Splits render as "The fire was split on Day 3," which throws away the only interesting outcome.

### 2.6 Fragments

The verses do the job they were built for. Cold on day one, unbearable later:

- `1-1` "One stayed close." The finale already pays it: Garrick sets the cup by the king and says the line.
- `1-6` "The key that locks is also the key that unlocks."
- `2-4` "His hand was bleeding, and he told us to sleep."
- `2-6` "Morning came. The enemy did not."
- `6-4` "Forgive us for leaving it at all."

The campfire then asks "Close to what?" That question is a spotlight on the twist. Anyone who treats the fire seriously will start guessing "a person still in the world," and the cup nights will do the rest. You do not need to say "royal blood" to lead them there.

The meaning prompts are literature-class stems. "Whose key?" "The price of what?" "Let near to what?" "Be there to do what?" "What kind of leader earns that kind of silence?" They are gated behind a two-word anagram, so the emotional beat arrives only after a puzzle minigame, and then asks for 140 characters. Other players' meanings are visible without pin-before-peek. One fluent friend writes the reading. Everyone else agrees with it.

`4-4` Fork B is the correct way to plant moon-blood: Meira crossed out a second thought, and the fork says the word may mean more than the birth-mark. The fragment question that night, "Let near to what?", is the wrong way. It asks them to finish her sentence.

### 2.7 Garrick

He is a great companion in lines he was allowed to finish, and a quest terminal everywhere else.

He shines when he reports a fact and stops.

- `1-6` callback: "Meira had this shape on paper before any of you found a piece. Tonight the pieces drew it."
- `4-6`: "Yesterday you took their boat. Tonight someone took your words."
- `5-2` opener: "The grass on a war grave shouldn't shiver. I'd say that's the heartbeat."
- The cup at the dead window in `5-4`, with the family-habit line, is the season's best piece of direction because the player supplies Meira and the reread supplies the king.

He goes thin when the nudge is a stat check with his syntax.

- `2-6`: "How many men are down there swinging iron?" That is a headcount, and the click already says they are sifting for something small.
- `3-4`: "What kind of soldiers played with that?" The bone die is not this night's argument. The chips are.

He should be the only UI. Right now three voices run the evening: Garrick, a narrator named MYTHIOS who gets the aha, and a stack of Cinzel labels. The aha should be the last thing that happens, and it should happen in his mouth only after someone at the table has said the physical fact, or after a long quiet in which nobody did.

### 2.8 Prose

**Keep, and steal from these when rewriting the weak ones.**

> Twenty paces in, his trail slows to a walk and stays one. He was not running from you. He had finished. (`1-1-2`)

> A woman packing in fear does not leave her book in order. She did not go in a hurry. (`1-2` click)

> One man carried her down to the water, the other went back up to the cart, and the cart went up the far bank at a run, without her. Anyone who followed the cart was following an empty one. (`1-6` click)

> Morning came. The enemy did not. (`2-6` fragment)

> Round every boot the dust lies in one even skin. The only prints in it are yours. (`5-4-1`)

The reason they work is the same reason: an object, a measurement, a conclusion the prose does not underline twice.

**Cut or rewrite.**

1. `3-6` nudge. "The knife-edge drops straight to scree on both sides. If we go down in the dark, how do we keep from sliding?"
   Rewrite: "That lamp went in, and no horse came out. So whoever carried it is still under the hill. Are we going in after a man who heard us, or into a rite that was going to start whether we read the map or not?"

2. `2-5` meaning. "What kind of leader earns that kind of silence?"
   Rewrite, if a prompt is kept at all: "He walked among them the morning after, and not one of them says what he looked like. What are they refusing to describe?"

3. `1-1` meaning. "*One stayed close.* Close to what?"
   Do not ask. Let him read the line and put the cup down. The question is the spoiler.

4. `4-2` click. "They rode with bare blades across their saddles in broad daylight, never speaking and never once looking at the road or the lake. Every eye stayed locked on the single small box."
   Rewrite, using the third lead: "They came down the open road with their blades out, past every path that would have hidden them. Men who are afraid of being followed do not do that. Men who are afraid of dropping what is in the cart do."

5. `6-1` click. "Even when the Seekers kept a light behind the Stone, no flame could ever show in the square."
   Rewrite so it does not settle the fork: "The niche faces the wrong way for a candle to reach the slit, and the soot there is old. Whatever he is looking for at dusk, it is not a light in this room."

6. `5-5` puzzle and click. "Is this camp a newly arrived war-band or a permanent post?" / "This camp is a permanent watch kept by a regular relief."
   The chapter spent the day saying that. Point the click at the third lead: "The chalk has been gone over so long it has grooved the wood, and when the beat comes every head lifts before anyone decides to. They are not waiting to see if he wakes. They already know the night."

7. `2-1` puzzle versus click. The question is travel in the dark. The answer is the weight of the cart.
   Ask the question the click answers: "Did the cart pick something up at the mill, or only look?"
   And put `2-1-2` in the pair if the night's real question is why that one house.

8. `1-2` opener. "You've paid for your rooms and you haven't burned anything down. That's more than most guests manage."
   Save it for when they ask why he is helping. Tonight: "Three weeks, that seat has been empty. Tonight it isn't. Don't get used to the wine."

9. `6-6` puzzle. "Where is the city's garrison tonight?"
   They can see the street. Ask the thing the third lead is for: "The grit at the blank rock has been swept in a quarter-circle, and the point of the fan is at the left edge. What swings that way?"

10. `3-4` nudge. "A bone die with its spots worn smooth, left in a sleeping niche centuries ago. What kind of soldiers played with that?"
    Rewrite: "One scratch, two, three, and each chip set where the next one can see it. A frightened child throws. This one is counting. Did they let her, or did they never look at her hands?"

## 3. Streamlining blueprint

**Before.** Demo: eight bordered cards, a dead riddle, a click the view does not implement, and a developer toolbar. Live: a sticky fork form, a puzzle box, clue cards with Agree/Doubt, an automatic MYTHIOS paragraph, a fragment meaning field, and the week question in another tab.

**After.** One stream. Garrick is the only label.

1. He sits them down in one or two sentences that name today's wound. Opener and callback collapse into this. The morning recap stays where it is.
2. Clues enter as they are laid, in the stream, under the finder's name. No board header. If a lead was not taken, he says the place once: "Nobody walked the far bank." He does not keep a dashed empty card on screen.
3. The click is not a card. When two different hands have laid the pair, he waits. If someone says the physical fact, he repeats it shorter and stops. If nobody does, he says it himself, late, as a fact, never as the motive. The puzzle question is deleted. There is only the night's question, and he asks it after the fact, not before.
4. The fork is not a menu. He offers the two readings as things a person could believe, in his voice. A pin is a sentence in the thread. At dawn the call is counted from those sentences. "Reading A" never appears.
5. The fragment is read once, aloud, when the line is whole. No anagram on the fire. The word-lock can stay a private daytime toy if it is wanted. It does not sit between the clues and the argument. No meaning field.
6. The week question is not a nightly field. It is the fight on day 6, and the thing the Gathering quotes. The casebook may store the lines. It does not ask for them.
7. Delete: the riddle step, the second question-pin form, "What we did today" (the around-the-fire lines already do it), the duplicate `fanOutClue` on the day entry (the leads are the source), the MYTHIOS click credit, and the demo's eight-step stack as a player-facing surface.

Quiet nights stay quiet on purpose. Three clues, no click, because they disagree. He says he is not going to tidy it. That is the rule the player can learn, instead of "sometimes the puzzle is missing."

## 4. Line-level rewrites

The ten cuts in §2.8 are the line edits. Two more, because they are the season's last impression and the night the quiet pattern should have been built from.

`6-6` forks, as written, are both "it finishes something." Make the objects do the work.

- Fork A: "The Seekers left the door, and the word beside it is *here*. They wanted this Stone in this room, and they wanted him to stay as he is."
- Fork B: "The Order has spent the week walking every dead soldier to that hall. They are not afraid of what we are carrying. They have been waiting for it."

`5-4` Fork A, as written, is the naive reading. Give it the clue it already has.

- Fork A: "The dust around the boots has not taken a footprint in years, and no two helms sit the same. We wanted a movement, so the dusk gave us one."
- Fork B stays. Then do not click them. Let the scrape and the dust sit on the table all night. That is the quiet night the rest of the pattern is imitating by accident.

## 5. Top five changes

Ranked by impact against the work already in the repo. The live stream and the click SQL are the right foundation. Do not invent a third fire.

1. **The click becomes a silence, not an announcement.** Highest impact, medium effort. The pair is already detected, and it already requires two players. Stop auto-posting the paragraph. Prompt the two finders. Reveal the physical line only if the thread stays empty. Tell a late player, in his voice, that their card is the other half. This is the difference between a ritual and a cutscene.

2. **Retarget the pair so the click serves the fork without settling it.** High impact, content-only. Fix `2-1`, `4-2`, `5-5`, `6-1`, and `6-6` first. On those nights the third lead is the argument and the click is a side quest. `6-6` leaving the swept fan out of the synthesis, on the last night of the season, is the loudest version of the bug.

3. **Garrick conducts one stream.** High impact, larger effort, but `OnlineCampfire.tsx` is most of the way there. Remove the sticky fork, the puzzle box, and the meaning field. Demote `CampfireEveningView.tsx` to a test harness or make it render the same stream. A player should not be able to open two different fires.

4. **Fragments pay off at the Gathering, not at the bottom of the night.** High impact, low nightly cost, six pieces of writing. He reads the line at the fire and does not ask what it means. At the Gathering, the verse is read again beside the twist, then beside whatever the party actually said, if they said anything. "One stayed close" is already in the finale. The other thirty-five lines deserve that same second hearing. The anagram can remain a private toy. It should not be the doorway to the verse.

5. **Absence is a seat, not a missing form.** Medium effort, and it is what makes async feel inhabited. The extra cup, the bottle, and the dawn call already exist. Use them as one ritual. An empty seat gets the cup and the note they left, spoken by him, not rendered as a green "MESSAGE ON THE BOARD" card. A half-laid click gets a single line to the missing hand. At dawn, a split is quoted by name the next morning, not collapsed into "The fire was split on Day 3" on nine scattered anchors. Fill `nudgeIfLaid` or delete the field. A system that reacts to a laid card on two nights out of thirty-six is a system the table will never learn to trust.
