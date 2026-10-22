# The Campfire, Version 3, Phase 2: Week 5's Content (Gold Standard Spec, 22 Oct)

**Scope:** Episode 5 — *The King's Stone* (`5-1` to `5-6`, Gathering 5, and Episode 6 closures).  
**Standard:** Built on the exact nine-point Week 1 Gold Standard (`campfire-week1-content-18oct.md` / 21 Oct revision):
1. **Turn vs. Answer Bookkeeping:** Every night's question distinguishes between an intermediate **Turn** (where the ground moves, with nobody graded) and the true **Answer** (where MYTHIOS reads back each friend's call beside the canon line that settles it).
2. **Clicks Built from Two Ordinary Finds (Never `[PRESS ON]`):** Every Click is triggered by two standard Fan Out leads (`5-1-1`+`5-1-2`, `5-2-1`+`5-2-3`, `5-3-1`+`5-3-2`, `5-5-1`+`5-5-3`, `5-6-1`+`5-6-3`), never gating a Click behind a high-DC `[PRESS ON]` roll (`5-3` *Go down to it* or `5-4` *Stop beside one*), and never answering tonight's question.
3. **Quiet Night Discipline (`5-4`):** Like Week 1 Day 4 (*Fenmark*), Day 5-4 (*The dead streets*) is a quiet night (`tone: "quiet"`, `puzzle: null`, `clicks: []`) so its puzzle does not duplicate its question.
4. **Cup Night Stage Direction (`5-4`):** Written explicitly into Day 5-4's `narratedSilence` with Garrick's canon words (*"Family habit. We always pour one for whoever can't be with us."*) so no loader can drop it.
5. **Canon Precision & Non-Steering Nudges:** Fixed the `5-1` waystone misconception (the stone had `HIGHWALL` + miles and one chiselled-out second line for the king's name, not "four names weathered by rain and the fifth cut away"), fixed `5-4`'s nudge so it no longer cites the `[PRESS ON]` detail (`left foot forward`), and fixed `5-6`'s Click so it does not claim the party has entered the hidden room before Gathering 5.
6. **Guard on the Fragment Card:** Rewrote `5-1`, `5-4`, `5-5`, and `5-6` in `src/data/fragmentMeaningQuestions.ts` into single, sharp questions that never duplicate a Dawn Pin and never run ahead of Gathering 5's failed blood attempt (`5-6` now asks `"*\"The five were joined.\"* Joined to do what?"`).

---

## The Nine Week 5 Fixes at a Glance

1. **Day 1's question & waystone canon.** Replaced *"Why was the fifth name chiselled out of the waystone?"* (and Garrick's false *"four names weathered by rain, and the fifth cut away clean"*) with: **"The Seekers scattered four Stones to the far corners of the land, yet left the fifth at Highwall. Why keep it in the dead city?"** (*A: To stand guard over him where he fell* / *B: The fifth could not be carried away from Highwall without waking him*). **Turn** on Day 5 at *"…where we could watch it, and watch him."* **Answer** at Gathering 5's *The Verse of the Binding*: *"The fifth they did not scatter with the others. They kept it near him, under their own eyes."*
2. **Day 2's question & dog-pack Click.** Kept the dog behaviour as **Tonight's puzzle** (`5-2-1` *Heads down* + `5-2-3` *Scattered*: the beat drove them while it lasted and let them go when it stopped). Replaced the local-colour dog fork with: **"The heartbeat comes from Highwall for a few slow strokes at dusk and dawn, then stops. What is keeping him from waking outright?"** (*A: The four Stones have only thinned his sleep; it takes a certain night for him to wake* / *B: The fifth Stone is still in Highwall, holding the last of the Seekers' lock shut*). **Turn** at Gathering 5's *The Watch* (*"The sleep is thinnest when the moon goes dark"*). **Answer** at Gathering 6's *Second Twist* (*"What the four begin, the fifth shall end, and the throne rise whole"*).
3. **Day 3's opener, question, and non-`[PRESS ON]` Click.** Removed Garrick's concluding opener (*"Somebody's been barring this gate for centuries"*). The Click uses `5-3-1` (*One trodden path*) + `5-3-2` (*Still white*), leaving the `[PRESS ON]` find (*Go down to it*, the stack of rotted bars) as its own piece on the table. Tonight's question asks: **"Highwall's gate is barred from the inside with fresh timber in brackets worn bright by centuries of bars. Who is keeping it shut?"** (*A: The Order — keeping the dead city shut so no outsider disturbs their watch on the hall* / *B: Wardens left behind on the Seekers' wall — barring the gate to keep what is inside from getting out*). **Answer** on Day 5 at *"Hooded figures: four, five, more. The Order. They have made their camp facing the doors, as if they had been here all their lives."*
4. **Day 4's quiet night, Cup stage line, and `[PRESS ON]` hygiene.** Kept `puzzle: null, clicks: []` on this quiet night. Removed `"left foot forward on every single one"` (the `[PRESS ON]` detail) from Garrick's nudge so he only names ordinary pieces (`"{friend:Aim}, unbroken dust round every boot, and one sound of iron on stone after we barred the door."`). Wrote the Cup beat explicitly into `narratedSilence` at the shuttered window facing the hall. **Answer** at Gathering 5's *The Battle* and *Match 1* (*"Tonight they were moving"*), with *Agility `[LOOK CLOSER]`* confirming `5-4-1` (*"Before tonight they had not taken a step"*).
5. **Day 5's question & permanent-watch Click.** Replaced the false mechanical fork (*"The doors of the great hall unlock"*) with the real mystery question: **"The Order has camped facing the sealed doors for generations, crossing off one stroke each dusk. What are they counting to?"** (*A: A fixed night on the calendar that they have known from the beginning* / *B: A sign from inside the hall as the heartbeat grows strong enough to break the seal*). Changed the Click pair to `5-5-1` (*One hand*) + `5-5-3` (*More bedrolls*), establishing that the camp is a permanent watch with a regular relief (paid off in Gathering 5's *Roll-Call*). **Answer** at Gathering 5's *The Watch* (*"The sleep is thinnest when the moon goes dark"*), echoed on Week 6 Day 5.
6. **Day 6's pre-room Click & eve-of-Gathering question.** Replaced the already-answered room fork (*"Why was this secret chamber hollowed into the rampart?"*) and fixed the Click (`5-6-1` *The narrow slit* + `5-6-3` *A stride wider*) so it uses only outside parapet observations (the room is not opened until Gathering 5). Tonight's question asks: **"The fifth Stone lies inside the wall beneath our feet, and we carry the mark in our blood. What happens when we open that room tonight?"** (*A: Our blood will wake the fifth right here in the wall and end his waking* / *B: Finding the fifth here is only half the task — it will have to be taken to his hall*). **Answer** at Gathering 5's *The Attempt* & *The Turn* (*"Where he fell, under the dark moon, the five were joined. Not here. Not now."*).
7. **Guard on Fragment 5-6.** Changed `FRAGMENT_MEANING_QUESTIONS["5-6"]` from `"Why there, and why that night?"` (which pre-empted Gathering 5's failed blood attempt) to `"*\"The five were joined.\"* Joined to do what?"`.
8. **Anti-Form Discipline across `5-1` to `5-6`.** Eliminated the double-barrel prompt on `5-1` (`"Take what, and from whom?"` → `"What did it take from him?"`), sharpened `5-4` (`"What stopped the soldiers mid-stride when he fell?"`), and guarded `5-5` (`"Why did the Stone itself need watching?"`) so it does not overlap Day 5-1's pin.
9. **Solo First-Person Read-Back.** When a friend plays alone, morning and Gathering read-backs speak in the first person: *Last night you called it: …*

---

## The Week's Climb

- **Day 1** asks why the Seekers left the fifth Stone at Highwall instead of scattering it.
- **Day 2** asks what is keeping the waking king's heartbeat to a few strokes at dusk and dawn.
- **Day 3** asks who has been inside the dead city barring its gate for centuries.
- **Day 4** asks whether the standing soldiers in the street are beginning to stir.
- **Day 5** asks what the Order's watch-fire is counting down to.
- **Day 6** asks what will happen tonight when the party opens the hidden wall-room and lays marked blood on the fifth Stone.

---

## Day-by-Day Specification

### Day 1 · Reedham, and the waystone (`5-1`)
- **Tonight's question:** `"The Seekers scattered four Stones to the far corners of the land, yet left the fifth at Highwall. Why keep it in the dead city?"`
  - **A:** `"They kept the fifth at Highwall to stand guard over him where he fell."`
  - **B:** `"The fifth could not be carried away from Highwall without waking him."`
- **Turn:** Day 5, at the fountain fragment's visible words: *"…where we could watch it, and watch him."*
- **Answer (Read-back):** Gathering 5 (*The Verse of the Binding*): *"The fifth they did not scatter with the others. They kept it near him, under their own eyes."* (Deepened at Gathering 6: *"His house had kept a thing since before his house had a name. It was never lost. It was the fifth."*)
- **Tonight's puzzle:** `"Was the waystone only a road marker, or part of the Seekers' trail?"`
  - **Click (`5-1-1` The crisp edge + `5-1-2` The rime stays):** `"The line under HIGHWALL was chiselled clean away like the king's face on the coin, and the crack at the stone's foot holds the same unnatural cold as every Seeker housing. The road marker was defaced, and the Seekers set their first sign in its foot."`
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **The crisp edge** (`5-1-1`) | Half of the click; links the chiselled line under `HIGHWALL` to the scraped coin | Gathering 6: *"They cut his name out of everything they could reach."* |
  | **The rime stays** (`5-1-2`) | Half of the click; proves the waystone foot is a true Seeker housing | Tonight |
  | **Every window lit** (`5-1-3`) | Link: Reedham's dark-moon lamp custom burning at midday under the grey sky | Gathering 5: *"under the dark moon"* |
- **Fragment 5-1 card:** `"*\"He gave us the war. Then it began to take.\"* What did it take from him?"`
- **Garrick:**
  - **Opener:** `"North, then. That's a long road for tired boots."`
  - **Nudge:** `"{friend:Intellect}, the miles left standing on the stone, and the second line under Highwall cut away to the last letter. Whose name sat under the city's?"`

---

### Day 2 · The old kingdom's road (`5-2`)
- **Tonight's question:** `"The heartbeat comes from Highwall for a few slow strokes at dusk and dawn, then stops. What is keeping him from waking outright?"`
  - **A:** `"The four Stones have only thinned his sleep; it takes a certain night for him to wake."`
  - **B:** `"The fifth Stone is still in Highwall, holding the last of the Seekers' lock shut."`
- **Turn:** Gathering 5 (*The Watch*): *"The sleep is thinnest when the moon goes dark. On that night of all nights, he hears."*
- **Answer (Read-back):** Gathering 6 (*The Second Twist*): *"What the four begin, the fifth shall end, and the throne rise whole."* (Both readings hold part of the truth: the waking waits for the dark moon, and the fifth is the final key that ends the sleep.)
- **Tonight's puzzle:** `"Were the dogs hunting for themselves?"`
  - **Click (`5-2-1` Heads down + `5-2-3` Scattered):** `"The dogs came in a straight line from the north while the ground beat, froze mid-stride the instant the beat stopped, and scattered every way after. The beat drove them while it lasted, and let them go when it stopped."`
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **Heads down** (`5-2-1`) | Half of the click; Tilt A (the pull lasts only while the heart beats) | Day 4 callback & Week 6 Day 2 (the soldiers step only on the beat) |
  | **Scattered** (`5-2-3`) | Half of the click; shows the pack came straight down the road from Highwall and scattered once released | Tonight |
  | **One bite** (`5-2-2`) | Detail: a bite that held without tearing, like a gripped jaw rather than a feeding beast | Tonight |
- **Fragment 5-2 card:** `"*\"That is why it had to be us.\"* Had to be them, for what?"`
- **Garrick:**
  - **Opener:** `"The grass on a war grave shouldn't shiver. I'd say that's the heartbeat."`
  - **Nudge:** `"{friend:Might}, one deep bite that held without tearing, and tracks that scattered the moment the beat died. What drove those dogs?"`

---

### Day 3 · The herald's gate (`5-3`)
- **Tonight's question:** `"Highwall's gate is barred from the inside with fresh timber in brackets worn bright by centuries of bars. Who is keeping it shut?"`
  - **A:** `"The Order — keeping the dead city shut so no outsider disturbs their watch on the hall."`
  - **B:** `"Wardens left behind on the Seekers' wall — barring the gate to keep what is inside from getting out."`
- **Turn:** Day 4 (*The dead streets*): the standing soldiers in the street (*"We left them standing"*).
- **Answer (Read-back):** Day 5 (*Below the hall*): *"Hooded figures: four, five, more. The Order. They have made their camp facing the doors, as if they had been here all their lives. Some of them have."*
- **Tonight's puzzle:** `"Was the gate barred long ago and left, or is someone tending it now?"`
  - **Click (`5-3-1` One trodden path + `5-3-2` Still white):** `"The timber bar was felled and squared within the last few days, and a single narrow path is trodden in the dust from the gatehouse straight up toward the smoke. Whoever tends the fire below the hall comes down to bar this gate."`
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **One trodden path** (`5-3-1`) | Half of the click; Tilt A (links the gate bar to the smoke below the hall) | Day 5: the Order's fire below the hall |
  | **Still white** (`5-3-2`) | Half of the click; proves the timber was cut within days | Tonight |
  | **Knocked out** (`5-3-3`) | Tilt B: the wall-stair was broken with hammers long ago | Gathering 5: the gate-tower defence |
  | **`[PRESS ON]` Go down to it** | Reveal (kept separate from the click): dozens of old bars stacked to rot | Day 5: *"as if they had been here all their lives"* |
- **Fragment 5-3 card:** `"*\"None of us gave to the fifth.\"* Why give to four and not to the fifth?"`
- **Garrick:**
  - **Opener:** `"High on the wall, and not a breath of green in the whole city. Sit down out of the wind."`
  - **Nudge:** `"{friend:Craft}, a broken stair knocked out with hammers long ago, and a fresh timber bar below. Somebody wants only one way in."`

---

### Day 4 · The dead streets (`5-4` — Quiet Night & Cup Night)
- **Tonight's question:** `"Their boots have not stirred the dust in centuries, yet at dusk a helm seemed to turn and metal scraped on stone. Are the standing soldiers waking?"`
  - **A:** `"No — they were frozen where they stood when he fell, and the dusk light played tricks on us."`
  - **B:** `"Yes — the heartbeat from the hall is beginning to stir them inside their armour."`
- **Answer (Read-back):** Gathering 5 (*The Battle* & *Match 1*): *"Something comes with them out of a side street: men in armour so old it has gone green and black, moving with a terrible steadiness... Tonight they were moving."* (While Gathering 5's *Agility `[LOOK CLOSER]`* honours Fork A's evidence: *"Their footprints in the dust begin in the middle of the street. Before tonight they had not taken a step."*)
- **Tonight's puzzle:** None (`tone: "quiet"`, matching Week 1 Day 4 *Fenmark*).
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **Unbroken dust** (`5-4-1`) | Tilt A: not a print in the dust round their boots but yours | Gathering 5 *Agility `[LOOK CLOSER]`*: *"Before tonight they had not taken a step."* |
  | **Metal on stone** (`5-4-2`) | Tilt B: a single sound of iron on stone from their street at dusk | Gathering 5: the hollowed walk |
  | **No two alike** (`5-4-3`) | Complicates both: every helm sits crooked on its neck | Tonight |
  | **`[PRESS ON]` Stop beside one** | Reveal: every left foot is forward on the same step | Gathering 5: *The Verse of the Binding* |
- **Fragment 5-4 card:** `"*\"We left them standing.\"* What stopped the soldiers mid-stride when he fell?"`
- **Garrick (Quiet & Cup Night):**
  - **Narrated Silence + Cup Stage Line:** `"Garrick wipes the dust from the cups with his sleeve, pours one more than there are of you, and sets the last at the empty place by the shuttered window facing up the hill. \"Family habit. We always pour one for whoever can't be with us.\""`
  - **Nudge:** `"{friend:Aim}, unbroken dust round every boot, and one sound of iron on stone after we barred the door."`

---

### Day 5 · Below the hall (`5-5`)
- **Tonight's question:** `"The Order has camped facing the sealed doors for generations, crossing off one stroke each dusk. What are they counting to?"`
  - **A:** `"A fixed night on the calendar that they have known from the beginning."`
  - **B:** `"A sign from inside the hall as the heartbeat grows strong enough to break the seal."`
- **Answer (Read-back):** Gathering 5 (*The Watch*): *"The sleep is thinnest when the moon goes dark. On that night of all nights, he hears. On that night of all nights, the faithful gather where he fell, and do not leave him to wake alone. Count the nights."* (Confirmed from the Seekers' side on Week 6 Day 5, *The moon-tower*.)
- **Tonight's puzzle:** `"Is this camp a newly arrived war-band or a permanent post?"`
  - **Click (`5-5-1` One hand + `5-5-3` More bedrolls):** `"The chalk strokes on the board have been gone over in the same hand until the wood is grooved, and extra bedrolls lie rolled and tied around the hearth for men on post. This camp is a permanent watch kept by a regular relief."`
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **One hand** (`5-5-1`) | Half of the click; Tilt A (all strokes laid out and gone over in the same square hand) | Gathering 5 (*The Watch*) & Week 6 Day 5 |
  | **Every head lifts** (`5-5-2`) | Tilt B: every robed watcher lifts his head toward the doors when the heartbeat sounds | Gathering 5 |
  | **More bedrolls** (`5-5-3`) | Half of the click; foreshadows the wall-posts and incoming faithful | Gathering 5 (*The Roll-Call*) & Week 6 Day 3 (*Eleven watchmen*) |
- **Fragment 5-5 card:** `"*\"Where we could watch it, and watch him.\"* Why did the Stone itself need watching?"`
- **Garrick:**
  - **Opener:** `"One chalk stroke each dusk. Somebody's counting."`
  - **Nudge:** `"{friend:Intellect}, every stroke on that board drawn in the same square hand, and every head lifting when the beat comes. What ends when the count ends?"`

---

### Day 6 · The wall again (`5-6`)
- **Tonight's question:** `"The fifth Stone lies inside the wall beneath our feet, and we carry the mark in our blood. What happens when we open that room tonight?"`
  - **A:** `"Our blood will wake the fifth right here in the wall and end his waking."`
  - **B:** `"Finding the fifth here is only half the task — it will have to be taken to his hall."`
- **Answer (Read-back):** Gathering 5 (*The Attempt* & *The Turn*): when the party cuts their palms over the fifth Stone in the wall-room and nothing happens, followed by *"Where he fell, under the dark moon, the five were joined. Not here. Not now."*
- **Tonight's puzzle:** `"How did the room stay hidden from the Order for centuries?"`
  - **Click (`5-6-1` The narrow slit + `5-6-3` A stride wider):** `"The walkway here was built a full stride wider on the city side, and the slit window is set so low in the stone face that it cannot be seen from the square. Anyone not standing on this parapet would take the wall for solid rock."`
- **The pieces:**
  | Piece | Job | Payoff |
  | :--- | :--- | :--- |
  | **The narrow slit** (`5-6-1`) | Half of the click; Tilt A (built to stay invisible from the square) | Week 6 Day 1: the watchman looks at the wall and sees only stone |
  | **Two shallow dips** (`5-6-2`) | Tilt B: elbow hollows on the parapet facing up at the hall | Week 6 Day 1 Craft notice |
  | **A stride wider** (`5-6-3`) | Half of the click; accounts for the hidden chamber inside the masonry | Gathering 5: *The hidden room* |
- **Fragment 5-6 card:** `"*\"The five were joined.\"* Joined to do what?"` (Guarded so it does not pre-empt Gathering 5's place-and-night turn.)
- **Garrick:**
  - **Opener:** `"A slit window, a hidden room, a night nobody heard you."`
  - **Nudge:** `"{friend:Aim}, two shallow dips worn into the parapet where elbows rested, facing straight up at the hall."`
