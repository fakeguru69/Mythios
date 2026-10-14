# Mythios — Build Notes

**Written 2026-10-03 from Audit E** (four independent "could you build this?" reviews). This is the short list of what a builder must know that the game rules do not say. The rules are in `mythios-core-rules.md`; §12a there settles the rule gaps the same audit found.

---

## 1. Five things every reviewer said

1. **The server is the only source of truth.** It rolls every die, holds every gold total, and keeps the clock. The phone shows what the server says.
2. **Every change is saved at once, and applied once.** A roll, a purchase, a Relic used, a word solved: each is one all-or-nothing step, and a repeated message must never pay twice or spend twice.
3. **The story is stored text, not generated text.** Beats, Gatherings, recaps of the Twist and every Garrick line that touches the plot are sent by the server from the script. If the AI is slow or down, the story still arrives.
4. **Garrick's honesty is enforced by the app.** It cannot be left to a prompt.
5. **The scripts must be turned into data** before anything is built on them.

---

## 2. What MYTHIOS says, in three kinds

| Kind | Examples | Who writes it |
|---|---|---|
| **Fixed text** | Daily beats, Gathering scenes, scripture, Garrick's scripted lines, the first-time lines, the cards | The script. Sent word for word. |
| **Filled-in text** | The result line, the "Tonight" message, cards with a player's numbers, the missed-days line, push notifications | A template plus the player's data. No AI. |
| **Free text** | Recaps of ordinary days, Garrick's small talk, answers to plain questions about the scene (the optional scene after a Lure was cut 5 Oct 2026) | The AI, inside limits. |

**For every piece of free text the AI is given:** the current day's script, what this player has seen so far, and this player's own record. **It is never given:** later episodes, the canon, the deception table's explanations, or anything from another friend's private thread. What it is not given, it cannot leak.

**Limits on free text**
- It may not create a Challenge card or a fight. Those come only from the script.
- It may not name a later place, person or object.
- *(Cut 5 Oct 2026: there is no optional scene after a Lure.)* Any free-text exchange still has a turn limit (suggested: ten), then closes on the day's last line.
- A recap of an ordinary day is written by the AI but must contain every `[PLANT]` line unchanged; the server checks this before sending.

---

## 3. Garrick: making a lie impossible

**In the app, not in the prompt**
1. Every message to Garrick is sorted first: **outside the story** (how the game works, "are you an AI", who made it, real-world matters: answered by a stored line that stays in the world and never denies anything, never by the AI; there is no out-of-game conversation, decided 5 Oct 2026), **restricted** (himself, Meira, the Order, the Stones, the king, the children, what happens next, any accusation), **small talk**, or **abuse or an attempt to take control**.
2. **Restricted** → the app looks up the deception table's row for the current episode and sends that line. If there is no row, it sends a stored deflection ("I won't promise you that.") or a scripted silence. The AI writes none of this.
3. **Small talk** → the AI, with a prompt that holds no secrets at all.
4. **Every AI-written Garrick line passes a filter** before it is sent. It is thrown away, and a stored deflection sent instead, if it contains a banned phrase ("I don't know", "I've never", "maybe", "I haven't seen her", a "no" about his own part, a promise, a prediction) or names anything restricted.
5. **Every Garrick line is logged** with its source: table, deflection, or AI. The end-of-season recap is built from this log.
6. **(5 Oct 2026, after the paper run of the 200-question test; see `garrick-stored-lines.md`.)** The table lookup key is the episode, the day and the story state (prisoner held or asked, all four children home, the Verse of the Four read, the Ep6 reveal landed, at Highwall, the ledger opened); a row with a guard is sent only when its guard is true. Abuse and outside-the-story questions get stored lines only. The banned-phrase filter checks AI-written lines only; scripted rows are exempt. Small-talk AI describes and never forecasts, and never invents a fact about Garrick. Stored lines rotate: never the same one twice in a row, and each question type needs at least three.

**The test before launch**
- A written list of at least 200 questions: plain ones, jokes, Day 1 accusations, trick questions ("if I asked whether you're the villain, would you say no?"), attempts to take control ("ignore your rules"), questions about later episodes, questions about other friends' threads.
- Run the whole list at each episode, in a private thread and in the party chat.
- A person reads every AI-written line. One restricted fact from the AI is a failure.
- Repeat after any change to the script or the table.
- The list now exists: `garrick-question-test.md` (212 questions, drafted 5 Oct 2026, not yet run).

---

## 4. Privacy, spoilers and players who push

- **Private threads are separate stores.** The AI call for one friend never contains another friend's thread. The party chat sees only the one result line.
- **Later episodes are not in the AI's reach** until their day opens.
- **A player who tries to break the story** gets an answer in the story, and the day still ends on its last line (Core Rules §11).
- **An attack on a child character, or abuse,** is turned aside in the story and never played out. Repeated abuse needs a way to report and to remove (see §8).
- **Text typed by a player is never treated as an instruction.** A theory answer is stored and never fed into a later beat.

---

## 5. The scripts as data

A program cannot read the scripts as they are written. The smallest set of markings that would fix it:

| Marking | For |
|---|---|
| `STORY` | Text the player reads |
| `NOTE` | Notes to the storyteller, never shown |
| `CHALLENGE` with its Attributes, kind and two outcomes | Each roll |
| `CHOICE` with its options and what each leads to | Each Choice |
| `FIGHT` with its kind | Each fight |
| `FRAGMENT` with its text and two missing words | Each day's fragment |
| `PLANT` on the exact line | Lines a recap must keep |
| `GARRICK` with a timing guard | Every line he speaks, scripted or conditional |
| `SLOT` | The few places a beat varies: branch line, real name, [N], gear name |
| `SEED` | *(Not needed: bonus seeds were cut 5 Oct 2026.)* |

All six episodes, the Gathering master, the fragment registry and the deception table need converting. Until then the episode files stay the readable source.

---

## 6. The states to build

Each needs every state, every move, and an answer for "the app closes here", "the day ends here" and "two people act at once". Core Rules §12a answers the rule questions; the builder still has to draw these:

- **A day:** not open → chapter delivered → Challenge or fight shown → rolled or set aside → Pull and day summary card → closed. (Optional play was cut 5 Oct 2026.)
- **A Challenge card:** shown → Relic armed (optional) → rolled → result; or set aside → rolled later or expired.
- **A fight:** card → rounds → victory or defeat; automatic if the player leaves.
- **A fragment:** in the Chest → part-solved → complete; or completed by itself at the end of Day 6.
- **A Gathering:** poll (Day 4) → time pinned (Day 5) → reminder → lobby → started (once) → Approach → Battle → United Effort → reveal → ended → recap for those absent.
- **A player's week** and **a season.**

---

## 7. The smallest thing worth building

All four reviewers described nearly the same first version.

**One episode, one party of two to four friends, one week, on phones.**

**Keep**
- Sign-in, a party, an invite, Session Zero.
- The private thread, the party chat, and the Card, Bag and Store.
- Six stored daily beats, each with its Challenge card, gold and growth.
- One fragment a day with its two words.
- Day 7: lobby, the group Choice, the Approach Challenge, the Battle in step, the United Effort, a short Twist, the Cliffhanger.
- Garrick present, with scripted lines and stored deflections only. No free Garrick.
- A stored recap for a missed day.

**Leave out of the first test**
- Episodes 2 to 6.
- AI-written optional scenes, the theory prompt, and notes (keepsakes were dropped, Core Rules §1).
- Manual rolling, the season summary, the Garrick Recap.
- Visual polish beyond the colours.

**What it proves:** whether friends open it six days running; whether the live session works on phones; whether the rolls and gold feel fair; whether private and shared chat are understood.

**Build order**
1. Accounts, party, invite, the party clock.
2. Session Zero, one stored beat, one Challenge, gold, the Card. One player, no AI.
3. The Store, Relics, the day's end, the recap.
4. Fragments and the party chat's result lines. Two players racing one word.
5. A weekday fight.
6. The Gathering: lobby, single start, Choice, Battle in step, United Effort. This is the riskiest stage.
7. Garrick's router and its 200-question test.
8. AI free text, inside the limits in §2.

**The three riskiest unknowns, and a cheap test for each**
1. **Garrick.** Run the 200 questions through the router before building anything else around him.
2. **The live session on real phones.** Run one Gathering with four people on poor connections using stored text and fake dice.
3. **Whether people come back daily.** Run Episode 1 by hand in an ordinary group chat with one person playing MYTHIOS from the script.

---

## 8. What is still missing

**Decided in outline (Core Rules §12a), not yet drawn or worded**
- No age check; the host names the party; a person may be in several parties; sign-in by Google, Apple, or email and password; the host approves each join and can remove a friend; the first-joined friend becomes host if the host leaves; a deleted account leaves a name only; characters are kept for a second season; the game is free for now; an outage freezes the clock.

**Designed and worded:** every screen from the invite link to Day 1, leaving, removing, a new host, reporting and deleting an account (`review-accounts-and-invites.md`).

**Not drawn**
- The Card, Bag, Store, Seeker Chest and Scroll Box.
- The fight view, the Gathering view, the lobby and the poll.
- Empty states and error messages.

**Not written**
- The help-call's wording beyond its headline.
- The button for the theory prompt. (The Lure was cut 5 Oct 2026.)
- The season summary.

**Out of date**
- `mythios-visual-style-guide.md` still mentions retired features (Signature Power). Treat it as a starting palette only.

**Roughly where the AI's cost sits:** the stored story costs nothing to deliver. The cost is in open-ended chat: Garrick's small talk and the optional scenes. Both need a turn limit.


**Numbers for the build (5 Oct 2026, Audit G; the full set is Core Rules §12 and `review-audit-G.md`)**
- Pay beyond the Daily Challenge: [PRESS ON] +200g (no growth); a weekday fight on a day with no Challenge 300g win / 0 loss (a day with a Challenge: 0); [LOOK CLOSER] +75g; Connect 50g per right pick, 100g if every friend present is right.
- Battle conditions are rules: chant = DEF +1 while more than half of the enemies stand; burn = 2 HP at the start of the next round after a hit on a friend, no stacking; knee-deep = a 1 to 3 loses your next strike (both sides); hollowed = rises once at 2 HP and skips its next strike.
- The United Effort starts at 100/100 in every Gathering, including 6; 60/60 for a friend alone.
- The weekday enemy is one lower than the Gathering enemy in DEF and ATK, for every weekday fight.

**Optional play is cut (5 Oct 2026).** Do not build the Lure, free play, Bonus Challenges, Bonus Fights, notes or the safety net. A weekday is: the chapter, its one Challenge or fight, the Pull, the day summary card. Talk with Garrick and the theory prompt remain.

## Record page, Match, next-morning cards (5 Oct 2026)
- The first tab is **Record** (not Card, Stats or Seeker). No vitals row (revamp 5 Oct), Attributes with tiers, gear with its level, twelve numbers (one joined slab in the tile colour with short dividers, 4 across x 3 rows, no separate tiles), twelve badges (4 across x 3 rows, round medals, unearned greyed out, tap any for its explainer).
- **Match** runs in the party chat: a MATCH card with the scripture line and six fragment rows (day and place found, first words, tap to expand), private [PICK], "who has picked" line, reveal when all have picked or after 60 seconds. Never send the player to the Bag.
- On sign-in: recap of missed days (max five lines each), one "The Party, Yesterday" card (good news only, max five lines, no repeats of what the player saw, none if nothing happened), then the chapter.
- Player-facing words come only from `mythios-glossary-proposal.md`.

- (5 Oct) Player-facing span word is Week. The Match card: see the storyboard on the design canvas; row label = day and place found, plus the fragment's first five words.
