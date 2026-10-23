# Mythios: Tales of the Dark Moon
## Full design, story, and play audit — 23 Oct 2026

Read against `main` at `0a3726c`. This is the whole game: 36 daytime chapters plus 6 gatherings, which is the 42-beat season. The cover is right to say thirty-six days. Day 7 is the night you meet.

Files named below are the ones a change would actually touch. Quotes are from those files.

---

## Scores

| | Score | Why, in one line |
|---|---|---|
| Story and mystery | **9** | The season earns its ending. A few weeks repeat a texture, and one last button lies. |
| Daily play | **7** | The chapters are a book. The taps around them are a receipt. |
| Campfire | **7** | The writing and the evening both moved. The table still solves itself. |
| Gathering | **8** | The reveals land. For long stretches only one friend is rolling. |
| Phone and habit | **6** | The front door is good. A notification still opens the front door. |
| **Would I open it every day for six weeks?** | **8** | Yes, for the story. I would start skipping taps by week 4 if nothing in the day can change the road. |

The top five changes are at the end. They are the ones that would move those numbers.

---

## 1. Contradictions, leaks, party size, and the maths

### What holds

The season keeps its secrets in the right order. The campfire is not allowed to say the Order before week 3, the king before the hillside night in week 2, moon-blood before the drowned village, Highwall before week 5, or the heartbeat before the end of week 4. That gate is written into `campfireDaysData.ts` and checked. The chapters obey it too. Garrick does not confess early. The greeting *Keep the dark / It keeps us* is heard from watchmen in week 5 (`chapterScripts.ts`, the square below the hall) and only given to him in the last gathering, when the faithful bow. That is a fair plant, not a slip.

His week 6 confession matches the road. He never promised he was not one of them. He said the faithful do not lie. Both things are true, and the player is allowed to hate him for it.

### What does not

**The last choice does not matter, and the scene pretends it does.** In `gatheringScripts.ts`, week 6, the table is offered GIVE IT TO HIM or HOLD IT BACK. If they hold it back, he puts his bleeding hand over the Stone in theirs and it answers him anyway. The tragedy is right. The button is not. A button named HOLD IT BACK is a plan. The scene then tells you there was no plan. Players will feel cheated, not doomed. Rename it so the doom is the point:

> CLOSE YOUR HAND
>
> He does not argue. His own palm is already cut. He lays it over yours, and the Stone answers the blood it was cut for. You carried it into this room. That was enough.

**Suggested life stories walk into the plot.** `SessionZero.tsx` offers birthplaces Ashcombe, Fenmark, Highwall, The Reeds, Oldford, and heritage chips *Grandmother Meira*, *Grandfather Corin*, *A carved horse*. Meira is the missing scholar. Corin is a child you have not met. Highwall is the dead city in week 5. A player who taps "Grandmother Meira" on night zero either spoils the name or spends six weeks waiting for a grandmother who is a stranger. Replace the chips with things that are not in the plot: a ferry town, a grandmother's unfinished scarf, a name the player types. The two optional questions are good. The suggestions are not.

**One campfire line still counts the party as four.** Week 2, the shaft: *What matters more to them than four strangers at the lip?* Four shards is lore. Four strangers is the party, and the party is two to six. Say *strangers at the lip*.

**Small parties are handled in the chapters and forgotten at the fire.** `smallPartyLines.ts` shortens lines that name Mei, Dev, and Jo when the party is smaller. The fire does not. Cup lines, "four torn pages," and the shaft line assume a full table. A party of two should hear one empty cup, not a speech about four guests.

### Fan-out with two players, and with six

Every night has three leads (`fanOutLeads.ts`). A player may take only one (`fan_out_roll` in `0083_group_c_rest.sql`). Nothing stops two players taking the **same** lead. A pass does not give you the other clue. It shows you another place in the last of the light, and that is all.

The evening's realisation needs two particular leads, laid by two different people. So:

- Two friends who both walk the bank never get the click, even though they played.
- Two friends who split the right pair do.
- Six friends will cover the pair by accident, and then three of them did the same walk as someone else.

The mechanic is kinder to six than to two. That is the wrong way round. Leads should be claimed. If only two are playing, the third lead should be the one Garrick walked, spoken by him as a thing he saw and does not understand, so the pair can still meet. Do not give them the answer. Give them the object.

### Gold and failure

There is no detour skirmish that pays you for failing. A passed challenge pays 500. A failed one costs 150. A fight on a day that already had a challenge pays nothing. A fight-only day pays 300 if you win (`economy.ts`). Failing is worse, not a farm. First strike on the last day is real: pass the street and you hit first; fail and the dead soldier does. That is the right kind of stake. I found no maths exploit worth a rewrite.

What is wrong is the feeling, not the numbers. The reward is printed on the button before the scene has finished being a scene. More on that in point 11.

---

## 2. Does each gathering earn what the week walked?

**Week 1, the mine.** The week is a list, a missing woman, a watched rock, a taken child, a second taking two winters back, and a map. The gathering pays it: Tamsin is alive, the names on the wall are children, and the list was never about you. Earned. The wall refusing to say why your names are on it is the right cruelty.

**Week 2, under the mill hill.** Named taking, a birth-night, a lock that opens for your hand, a rite that will not stop, a scraped name, an older room. The gathering names the Order, the cut-out king, and the word *given*. Corin is alive and already cut. Earned. The "ask him for the ledger and he hands it over" is a little easy. He should make them read one page aloud before he lets it go, so the handover is a dare.

**Week 3, under the Kiln.** Home, manners, a mark they rode past, a child laying a numbered trail, a name cut twice, a lamp and smoke. The reveal — he sleeps, the Seekers are your blood, the prayer means *rise* — is the best turn of the first half, and the days did the work. The lamps going out and the cut ropes are theatre. They work because the line before them is human: *We're not finished with you.*

**Week 4, the drowned undercroft.** Why you were spared, the box versus the boy, eight nights on the water, moon-blood, a living child, a listener under the tower. The gathering says the children's blood wakes the Stones and the Stones wake him, Meira is dead, and there is a fifth. Earned, and cruel in the right place (her pen). The week is the long one. By day 5 the player already knows Joss is alive and being kept warm. The gathering has to be about the Stones, not about finding the boy, and it is. Good.

**Week 5, the wall.** A fifth, a heartbeat, a barred gate, soldiers who may have moved, a count, a hidden room. You hold the fifth. Your blood does nothing. Seven nights. Earned so cleanly that the week would hurt if this scene were cut. This is the model for how a gathering should use the objects of the six days.

**Week 6, the hall.** The double blow lands, and a first-time player can follow it, because the scene stops and puts the old lines back on the table: the torn page, the verse, *none of us gave to the fifth*, Meira's warning. Then the second turn: *Same key. Turned the other way.* Then the cup, which was always for him. Then *One stayed close.* That is a devastating ending. It is also crowded. The scripture quotations in a row are the risk. They are doing the fair-play work. Let Garrick say three of them, not five, and let the cup do the rest. The cup is the line people will remember.

The one structural lie remains the HOLD IT BACK button, above.

---

## 3. The six endings, strongest to weakest

1. **Week 5.** Seven strokes, cold stone, white linen, a watchman looking straight at your window. You know the night and you know you are not ready. Rewrite nothing.
2. **Week 6.** The king, the key, the cup. Strongest sentence in the game, slightly over-explained, and the false button sits in the middle of it.
3. **Week 4.** The dawn stops. A heartbeat from the north. The week stops being a rescue and becomes a countdown. Keep it.
4. **Week 1.** *Three more.* Hooves leaving. Clear, physical, a reason to come back.
5. **Week 3.** *We're not finished with you,* then darkness. Strong line, slightly film-like exit. Fine.
6. **Week 2.** He hands you the ledger and Corin whispers that a girl was told she was going somewhere warm. The information is the best hook of the six. The pulse is the lowest. The scene ends on a whisper in a room you have already won.

Rewrite the week 2 close:

> He does not give you the book. He opens it to a page where the ink is still soft, and he holds it where you can see and not touch.
>
> *Somewhere warm,* Corin says, from the floor. *That is what they told her. She believed them.*
>
> Garrick shuts the ledger. The sound is small. *Two places,* he says. *Two children. And we are standing in the wrong one.*
>
> From the shaft above, a stone ticks down the stair and stops. Someone is still in the hill. They are not digging any more. They are listening.

---

## 4. Does every day make the mystery worse?

The job of a day is not a new monster. It is a new fact, or a fact that turns yesterday sour. Most days do this. The shape of the machinery is the same — walk, notice, test, sometimes fight, stone, side-path, fire — and on the best days you do not feel the shape.

**Week 1.** A list you were not meant to have, or were. Then the others on it, and a woman's careful hand. Then a rock that has been watched, and smoke. Then a village that will not say a child's name. Then the same knife, two winters back. Then the map, and the cart that was empty. No filler. Day 1 is a solo prologue and should stay one.

**Week 2.** Which child is next. What the mill saw. Where the cart went. What is down the shaft. Who these people are, once a name has been scraped off the world. Whether there is another door before they finish. Day 4 and day 5 are the same hillside. Day 4 is "they saw you and did not stop." Day 5 is "there is no second door, and now there is a clock." That is a real turn, but it is one turn stretched over two evenings. Combine the feeling: day 4 should end on the clock, not only on the pulled ladder.

**Week 3.** Somewhere warm. She did not come home; they were polite. They rode past the one mark Meira cared about. She is alive and counting. The hut is empty and the name is cut twice. A lamp went into the hill. The middle of this week is the best investigation in the game, because the child is doing something and you are late to understand it.

**Week 4.** How a man vanishes from a room you were standing in. What four riders are carrying away from the boy. What happened to Joss. Who has been in the drowned streets. Where the boat has been. Who was under the tower while you read the map. Day 3 is the soft one: you borrow a boat and learn he was taken to the water. Necessary, and a little thin next to the days on either side. Give that day one object that is not a keel-mark. A willow shaving in the boat, grey, the same grey as the horse from week 1, so the two children touch.

**Week 5.** Where a nameless fifth would be. What the heartbeat does to dogs and grass. How a dead city stays shut. Who is standing in it. Who keeps a fire under the hall, and what the chalk is for. Where the fifth actually is. No filler. Day 4's uncertainty (did the helm move?) is the point, and the next morning should not tidy it.

**Week 6.** Are you found. Where the arrow goes. Is there a door on the hall itself. Where the Seekers' door is. What the dark moon on the wall means. How the blank rock opens. The facts are new. The weather is the same for six days: closer, warmer, more dead men, still no door. Days 2 and 3 are the ones a tired player will tap through. They earn their place only if each one kills a hope. Day 2 should kill "we can hide." Day 3 should kill "the hall has a lock we can pick." The text almost does this. The buttons do not mark it as a loss. Say it in the last line of each, the way day 6 already says *one*.

Days that are travel with a roll in the middle and a fact you already knew: none, if you count facts. Days that feel like that anyway, because the new fact is small and the walk is long: **W2-D5, W4-D3, W6-D2.**

---

## 5. Do the daytime choices matter?

The honest answer: they change the **cost, the clock, and a paragraph**. They almost never change the mystery.

Pass and fail are real sentences. On the sky-tower, a pass finds the dark moon by daylight. A fail burns the lamp half the night in a room the city can see, and the next street is harder because of it (`harderIf` on the following day). On the last street, pass and you strike first; fail and the dead man does. That is good.

What does not change is the discovery. You always find the fragment. You always learn the day's fact. The Pull at the bottom of the day is the same road. A proud player and a careless one arrive at the same fire holding the same truth, with a bruise or a lighter purse between them.

Attribute notices are the other half of agency, and they are the right half. Each day, Might, Charm, Aim and the rest each see a different physical thing (`notice` steps in `chapterScripts.ts`). That is information asymmetry, and it is the only reason a Sage and an Archer have different news at the fire. It only works if each player is shown **their** notice and not the whole set. The day screen rolls one notice. Good. Do not "helpfully" show all six. The fire is where the others are heard.

Approach choices inside a scene (which door, which question) mostly converge. They are voice, not fork. That is acceptable once or twice a week. It is not acceptable as the only choice on thirty-six days.

One concrete rule, applied to the three thin days:

- **W4-D3.** If you patch the skiff, you beach on the island side of the keel-marks and you see the willow shaving. If you row her hard and leaking, you beach short, and you only see that the marks are deeper than her boat. Same chapter tomorrow. Different object tonight.
- **W6-D2.** If the beam shift brings the ceiling down, a hollowed soldier sees the room and walks on. The party knows they have been looked at. If you find the quiet way through, he never turns. Tomorrow's street does not get harder. The fire's question changes: *he looked at the fallen stone* versus *he never knew we were there.*
- **W2-D5.** The fight with the silent scout should leave either the lamp-code (two flashes) or the torn coat, not both, depending on who is still standing at the end. The fire then argues from different evidence. That is a party, not a class.

Fights are investigative when the enemy is a clue: the man who takes nothing, the scout who will not speak, the soldier who looks at the stone and walks on. They are a mini-game when the opponent is "the thing in the road" and the only result is gold and a wound. Week 1's road fight earns its place. A fight that does not change what you know, or what tomorrow costs, should not have a screen of its own.

---

## 6. The side-paths

The three leads a night are the best evidence in the game. They are things: a bar leaned rather than thrown, threads at a child's height, dust in one skin around a boot, grit swept in a quarter-circle. They do not read as chatter.

They fail in only three ways, and none of them is "the sentence is pretty and empty."

1. **The third lead has no job until someone lays it,** and with two players it may never be laid. Covered above.
2. **A few leads restate the chapter** instead of adding a measurement. The chalk board's "same hand" is a measurement. A lead that only says "the camp looks old" would not be. After the last content pass, the worst of those were pointed at a question instead of a conclusion. Keep that standard: a lead is a measurement, and the sentence that explains it belongs to the table.
3. **The lateness is copied.** Several leads on the same day share one "you found it late" line. If the failure is always "by the time you find it, the fire is the only light," the player learns that failure is a caption. Give each lead its own cost. The ford: you are wet to the waist. The tower: your lamp was seen. The street of soldiers: you touched one, and the cold stayed in your hand.

A line worth stealing from, still, week 1 at the ford: one man carried her to the water, the other took the cart up the far bank without her, and anyone who followed the cart followed an empty one. That is a day's investigation in three clauses. When a lead is weak, it is because it does not have a clause like the third one waiting at the fire.

I would not rewrite the lead set as a project. I would rewrite the **rule**: no lead may say the conclusion, and no two leads on a day may share a failure sentence.

---

## 7. The fire, as it is tonight

This changed again after the last audit (`0110`, `0111`, `OnlineCampfire.tsx`, `campfireDaysData.ts`). Judged fresh:

**What now feels like a table**

- He opens on the day. The inn is four torn pages and an empty chair. The stolen child is "eat while you work out whether that was kindness." The last hill is one soldier facing out while a city faces in.
- The question sits at the **foot** of the night, not pinned over it. You still must choose before you see the others. That part is right.
- A particular find **adds** a question. It no longer erases the night's question.
- The verse is read in his voice. The little essay box under it is gone.
- The dice sum is gone from this room.
- If only half the pair is down, the table says so. If one person laid both halves, it says this table needs another pair of eyes.
- The special questions that used to announce the answer now ask it. Threads at a child's height: who was walking where the cart was not? The beat through the rock: what is the wall between you and?

**What is still a script**

The realisation still posts itself the moment the second card lands. The label is now *Garrick, setting the two together*, which is the right mouth and the wrong timing. He should not get there first. The two who laid the cards get a silence. If someone says the physical fact, he repeats it shorter. If the thread stays empty, he says it, late, as a fact about objects.

The fork is still three buttons. The buttons are well written. They are still a menu. A night is organic when the two readings are things people say, and the dawn call counts the sentences. You do not have to delete the buttons this week. You do have to stop treating a button press as the whole of the thinking. The thread is where the thinking should be praised, doubted, and quoted in the morning.

**Who arrives first, and who arrives at ten**

The first friend gets his opener, their own find, and an empty table. That is a real evening if he talks to them and the cup is for the people not there yet. It is a lobby if the only thing to do is pin a side and leave.

The last friend sees the cards, the names on the realisation, and a call they can still change until dawn. They can doubt. They cannot be the one who noticed. Give the late friend one job that is only theirs: Garrick asks them whether the realisation is the whole of it, and their answer is what the morning recap quotes if it differs. Otherwise the last arrival is a reader, not a player.

**Does the evening change tomorrow?**

Almost never. The Pull is already written. A unanimous fire and a split fire walk the same road in the morning. The gathering sometimes pastes a line the fire "called." That is a sticker, not a consequence. The minimum consequence that would be felt: if the fire is split, he says both sentences by name at the start of tomorrow, and the day's first notice is different for each side. Not a new chapter. One sentence that proves the night was heard.

**Forks that are still soft**

Most forks now have an object on each side. The ones that remain polite arguments rather than dangerous ones:

- Week 4 day 3, "what are they waiting for," is good, and the chapter has already shown the waiting. The fire should be about whether the waiting is for the water or for you. It is. Keep it.
- Week 6 days 1 to 3 can blur into "are we caught, are they coming, is the door here." The new nudges do separate them. Hold that line in any future rewrite: each night kills one hope, in his mouth, out loud.

**Second payoff**

The morning page (`dayRecaps.ts`) is still the cleanest payoff of a day's facts. The fire is the second room, and it is finally the second **feeling**. It is not yet the second **event**. An event would be: the table said a thing, and the morning repeats it as if it mattered.

---

## 8. The gathering as a live game

The order, in `OnlineGathering.tsx` and `gatheringScripts.ts`, is: arrive, an approach someone volunteers to roll, a fight, a united effort, notices, a case or a verse to match, questions, a turn, a cliff.

**What actually needs the others**

- The approach is one volunteer. Everyone else watches a countdown and then the line *X rolls.* If you are not the roller, your job is to look at gold going up or down.
- The fight is a shared bar with turns. Better, and still close to tapping your own button beside a friend tapping theirs.
- United effort is the first time the table is a table: a job that fails if people do not pull together, with lines in `unitedEffortStories.ts` that name who did what.
- Matching a fragment to a verse is a real eureka, and it is better when someone can be wrong in front of the others. The gold is higher if everyone present is right (`economy.ts`). That is a good bribe to talk before you tap.
- Week 6's last beat is the one co-op moment in the season that is about the story and the clock at once: the light lets one friend go, and everyone else has thirty seconds to tell them what to do. Tear the page, break the ring, or freeze. That should be the shape you steal for the other five gatherings, once each. Not thirty seconds of combat. Thirty seconds of *tell them which object*.

**Spectator risk**

A player who finishes their tap early spends the rest of the phase reading. A player who rolled badly on the approach is done for that scene. There is no rescue except a relic on the next roll. Add one, and only one, rescue to each gathering: the friend who failed the approach may spend their notice, the thing only they saw on the way in, to give the united effort its first handhold. Then a bad roll earlier is a debt the table can pay, not a private humiliation.

**The chest**

Six fragments becoming one verse is the right ritual, and the weeks where the verse answers a question the fire actually asked (week 1's list, week 5's cold stone, week 6's cup) are the ones that feel earned. The weeks where the match is "which of your lines sounds like this sentence" are a quiz wearing a ceremony. Ask the match as a memory: *who did we bury this for?* Then show the line. Do not ask them to recognise a sentence they unlocked behind an anagram six days ago unless the fire read it aloud, which it now does. That change makes the match fairer than it was. Use it.

---

## 9. The thirty-six fragments

Read in a row at the gathering, they do the job. Cold on the day. Obvious later. A few are already the best lines in the season:

- *Morning came. The enemy did not.*
- *His hand was bleeding, and he told us to sleep.*
- *We made our children the only key. We never asked what that would make them.*
- *Four of us gave to the four. None of us gave to the fifth.*
- *If you are reading this, you are ours — and if he ever stirs, finish what we could not.*

The week-long sets land as punches when read together:

- Week 1 is a riddle about a lock and a person who stayed.
- Week 2 is a war remembered by people who loved the man they were losing.
- Week 3 is the moment the weapon stops being theirs, and the price.
- Week 4 is the fifth thing, feared, and the children made into a key.
- Week 5 is the binding: they had to be the ones, they did not feed the fifth, they left the army standing.
- Week 6 is the apology and the order: be there, finish it.

**Lock-words** are often ordinary (*wall*, *morning*, *count*, *moon*). That is correct. The anagram is a door, not the poem. Do not make the missing words clever. The cleverness is the sentence they complete.

**Lines that are clumsy or that say the ending too early**, with replacements:

1. Week 3, *First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped being ours.* The rhythm is a list, and "stopped being ours" is vague until the gathering. Keep the list. Make the last step physical: *First they stopped bleeding when cut. Then they stopped sleeping. Then they stopped answering to their own names.*

2. Week 4, *Earth, wind, water, fire — four we could name. The fifth had no element at all, and we feared it more than the other four together.* Fine, and slightly like a rulebook. *We could name four. The fifth had no element. We were more afraid of that one than of the rest of them put together.*

3. Week 5, *We had fought beside every one of them. That is why it had to be us.* True, and thin. *We had fought beside every one of them. That is why it could not be anyone else.*

4. Week 6, *We were marked, every one of us. That is how we found the shards.* Clear in hindsight, flat on the day. *The mark was on us before we went looking. That is how the shards let us find them.*

5. Week 2, *We watched the kingdoms go out like lamps.* Lovely, and the second sentence explains the first. End on the lamps: *We watched the kingdoms go out like lamps. Ours was the last one still burning. We did not cheer.*

The meaning questions at the fire were pulled back from the spoilers (no "not yet born," no "they bound him," no "your own children"). The best of them now ask a feeling the line already contains. They should stay as his afterthought, one sentence, never a field. The gathering is where the line is read a second time, beside the blow. That second reading is still too rare. Week 6 does it. Weeks 1 through 5 should each do it once, with the line that hurts, not with all six.

---

## 10. The prose

At its best this is a novel told in the second person, and the best of it is physical. Dust. Linen. A cup. A pen. A cart that left empty. I would read those pages with the buttons hidden.

Where it goes dry:

- **The summary at the foot of every day.** "You earned. You learned. You hold. Tomorrow." It is a save file, and it talks like one. Keep it. Shrink it to three lines, and let the middle line be a sentence a person would say. *You learned they have been counting, and that eight strokes are left,* not a bold label stacked on a bold label.
- **Reward text on the choice.** `REWARD: +500g` and `IF YOU FAIL: −150g` in `OnlineGathering.tsx` and the same spirit on the day. The stakes can be in the scene: *fail, and the lamp burns half the night where the city can see you.* The number can live on the result, small, after.
- **Repeated lateness,** already noted.
- **Garrick's lesser host lines,** mostly gone. The ones that remain should be cut on sight if they could be said at any inn. *Give me a minute,* on the tower stair, is perfect because he is old and the stair was long. *Sit* is not, unless the day is in the sentence before it.

**Names in the sentence.** I looked for the old bug of a capital *The* glued on in the middle of a line (*at The boundary stone*). The chapter text now says places the way a person would. Do not reintroduce a highlighter that capitalises the label. On a phone, a place or a person can take a slightly warmer colour the first time it matters that day. After that it is just English. Relics should not be coloured like loot. They are objects in a pocket.

Before:

> REWARD: +500g. IF YOU FAIL: −150g. THE SKY-WATCHERS' WALL. Thousands of moons. One of them is not like the others.

After:

> Thousands of moons, and one of them is not like the others. Find it while the light holds. If you are still at it when you need the lamp, the square below can see the flame.

---

## 11. The words before a button, and the words after

A good bridge tells you what your hand is about to do, in the world's language, and the next sentence could only follow that tap.

**Strong, keep:**

- The last street. *There is no way round. There is only across.* Then the two ways of crossing. Then, on a pass, *not one helm turns.* On a fail, a shoulder of iron, and one helm at the top has turned. The button was the crossing.
- The mine gathering's turn. The question is about the names. The answer is that they are children. The next line is *This was never about you.* The button was the thinking.

**Weak, and they are a type:**

- Any step whose only job is a label like STRIKE THE PAGE, OPEN YOUR PALM, READ ON, ASK HIM FOR IT, when the paragraph before did not put the object in the hand. The page-striking in week 6 works because the tally is the clock and nobody wants to strike it. The same button earlier in the season, if it arrives after a summary sentence, is a page turn. Rule: if the label could be NEXT, the paragraph before it has failed.
- The gathering approach card, which shows the difficulty, the gold, and the failure cost **before** the volunteer has agreed to be the one who risks it. Move the numbers to the moment after the roll. Before the roll, show only the sentence of what failing looks like in the room.
- Fan-out as a list of three places with two attributes each, after the chapter has already ended on a Pull. The Pull is a hook into tomorrow. The fan-out is a hook into tonight. They currently argue. Let the Pull be the last thing at the fire, not the last thing before the lead picker. The day should end on: *three places are still dark. Which one do you walk?* The tomorrow-hook belongs to Garrick, once, at the end of the night.

Full-day seam that feels like a form, in order: morning recap (good), arrival (good), approach (good if the two verbs are different deeds), the notice roll (a little like a loot drop), the challenge with its price tag, the result paragraph (good), sometimes a fight that does not know what the challenge just proved, the fragment as "a locked fragment has been added to your chest" (a system toast in the middle of a scene), the fan-out menu, the summary, then a different piece of software for the fire.

The fragment toast is the worst seam. The stone gives. The sentence is already there. Cut *A locked Seeker Fragment has been added to your Chest.* Trust the chest icon to change. If you must mark it, Garrick says, later, at the fire, that the housing opened. Not the UI, in the middle of the hill.

---

## 12. The first five minutes, and the phone

**The cover** (`CoverPage.tsx`) is the right poster. *In the hill villages, children are going missing, and nobody is looking for them.* Six weeks. Two to six friends. Ten minutes a day. One button: Gather your friends. It does not explain the king, the stones, or the blood. Good. The line under the title, *A story told a little each day,* is milder than the quotation. Let the quotation be the only sentence. Mildness here teaches the player to expect a cosy serial. The quotation teaches them to expect a dread.

**Session Zero** asks for a name, a way of fighting, a second skill, and two optional facts. The class list is clear. Two problems. The role names already say "Seeker scholar" for the Sage, before the player has earned that word; call the Sage a reader of old marks. And the suggested grandparents, above. The stakes in the mystery are one sentence: *Before the week is out, it will be your business.* That is enough onboarding. Do not add a lore essay. Do add, after the name, one line in Garrick's voice, even though they have not met him: *Get some sleep. The road does not wait on a late start.* Then stop.

**The party screen.** After the latest pass, story and chores are easier to tell apart than they were: the road is the thing in front of you, and invites and settings are not dressed as chapters. The test I would still apply on a phone, cold, at 8am: can you see, without scrolling, (a) today's question, (b) whether you have walked yet, (c) who is already at the fire. If any of those three is behind a tab, it is wrong. The day's question should be the title of the day, the way the scripts already name it (*who is this man, and what does he want with me?*). Not a menu label.

**Waiting.** The game is good at telling you a friend has arrived, in the notification copy. It is bad at telling you, on the screen, what you are waiting *for*. "The others are already a day further down the road" is a real sentence (`OnlineDay.tsx`). Match that honesty at the fire: *Two leads are still out. Yours is not the missing half,* or *You are the missing half.*

---

## 13. The knock on the door

The copy, in `0093_notebook_fire_alerts.sql`, is the right set:

- Morning: the day is open. Week 1 day 1 says the story begins. Day 4 asks when you can meet. Day 7 names the hour.
- A friend has come to the fire, and if you have not played, it adds that your day is still waiting.
- Someone doubted your reading.
- Someone changed sides, without saying to which.
- Last call, if you have not pinned.
- The gathering's hour, and again an hour before.

That is social curiosity, not a nag. The morning line *The road goes on* is the weak one. It could be the day's question, cut to a dozen words. *Who is this man, and what does he want with you?* will open the app. *The road goes on* will not.

**The tap does not take you there.** `pwa/sw.js` shows the note and then sets the address to `/` every time. The tag (`fire`, `fire-doubt`, `gathering`) is thrown away. If the app is already open, the tap only focuses it. A player who trusted *Maren doubted your reading* lands on whatever screen they left, or on the party, and has to hunt.

The fix is small and it is the whole habit: the note carries a place. Fire notes open the fire, scrolled to the doubt. Gathering notes open the gathering. The morning note opens today's first unread line. If you do nothing else from this section, do that.

---

## 14. Will you tap through it, and would you come back?

**Where it is a checklist.** The notice roll, the price tag on a challenge, the chest toast, the three-lead picker, the day summary, and the fire's self-solving paragraph. Six taps that do not change what you believe. A day that is "ten minutes" becomes six minutes of story and four minutes of confirming you are still in the app.

**Where you will stop.** The two sentences of a pass and a fail, when they are actually different. A lead that is a measurement. Garrick asking one question that uses your card. The gathering's verse when it answers the week. The cup at the end.

**Blind spots the questions did not quite name**

- **The false ending button** will be the thing players quote, and not kindly, unless the label tells the truth.
- **Two-player parties are the ones who will feel the fire is broken,** because the pair is easy to miss and the prose still imagines a larger table.
- **Tomorrow does not hear the fire.** Until it does, clever friends will pin a side to clear the button and talk in their own chat instead.
- **Garrick cannot discuss the mystery in his own words** when someone types a question. The stored lines are excellent. The live mouth is a wall. That is safe, and it is the difference between a companion and a recording. You do not have to let him invent lore. You do have to let him pick up an object that is already on the table and ask about that, in a line written for that object. You are most of the way there with the laid-card questions. Point the live replies at those, and nowhere else.
- **The season is one sitting too long in week 6's first half.** Cut nothing of the plot. Cut the feeling of "again, the grey, again, the beat" by letting each of those days destroy a specific plan, in the last three lines, with no summary header.

### The five changes that make it a thing you do not skip

1. **The fire waits, and the morning quotes it.** Stop auto-reading the realisation. If the table says it, he agrees in fewer words. If not, he says the objects only. Tomorrow's first line names the split, or the unanimous risk, in their words. This is the social loop becoming real. Medium work. Highest feeling.

2. **Leads are claimed, and a small party still gets the pair.** Exclusive leads. With two or three players, Garrick brings the unwalked object himself and does not explain it. Without this, the best clue system in the game is a coin flip for the people most likely to be playing. Medium work.

3. **A failed day changes an object, not just a purse.** Three days first (the leaking skiff, the silent scout, the barracks collapse), then the same rule everywhere a `cond` already exists: the fact stays, the evidence does not. This is how "ten minutes" stays tense in week 5. Writing, not a new system.

4. **Notifications open the exact place, and the morning note is the day's question.** The copy is already good. The door is shut. Small work. It is the difference between a habit and a badge you meant to tap.

5. **One thirty-second "tell them what to do" in every gathering, and an honest label on the last choice.** You already built the best moment in the finale. The other five gatherings are still one roller and a shared health bar with a beautiful chapter wrapped around them. And HOLD IT BACK must stop promising a victory the scene is not allowed to give.

Do those, and the score I would give a friend is a 9. The story is already that good. The game around it is a very good book that sometimes asks you to press Next, and once, at the end, asks you to press a button that was never going to work.

I would still show up on day 1. I would still be angry, in the way you want, on the last night. I would want the anger to be at Garrick. Not at the button.
