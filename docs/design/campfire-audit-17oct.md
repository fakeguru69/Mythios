# The Campfire: an audit, and a redesign (17 Oct, for Fake Guru)

Fake Guru: "the campfire is suppose to promote interaction between player and Garrick, and among players via the conversations of solving the mysteries. Audit rigourously if it is doing its job well, and feel free to tweak it, change it to achieve this objective."

Audited: the online fire as built (`src/online/OnlineCampfire.tsx`, `campfire()` in `0024`/`0086`), the Campfire rules (`docs/canon/mythios-campfire-table-v2.md` v2.3), the approved design (`docs/design/fan-out-and-campfire-proposal.md`), and a two-player browser run (`tests/online/campfire.cjs`, 17 Oct).

## 1. What the fire is today
One long screen. From top to bottom: up to five Garrick lines in a row (cup, first-here, opener, catch-up, two "he notices"), bottles and open questions, **Your find**, **The board**, **What each of you saw**, **Today's fragment** (and its meaning question), **Tonight's question** (Garrick's nudge, A / B / Neither, your own line), **The case so far**, **A riddle**, **An open question**, **A message in a bottle**, **A word with Garrick**, **Leave the fire**. Eleven sections, five places to type, and no way to answer anyone.

## 2. Findings

### A. Too much, and no focus (fails)
- **Five questions a night,** each with its own box. Week 2 Day 2: Garrick's nudge ("Mei, how was the mark cut, and with what tool?"), tonight's question ("They had a list with birthdays" / "They knew him personally"), the fragment's question ("Why stop counting?"), the week's question ("Why these children, and not any others?"), and the riddle. Week 4 Day 3 is the same: a skiff, the right night or the right child, what a child born in the dark shares with what fell, what they need Joss for, and a riddle. No player can hold five questions at once; the night has no centre.
- **The rules' own target is 2 to 4 minutes** (v2.3 §H). Reading the lines, the board, the shares and the fragment, and answering even two of the boxes, takes well over that.

### B. Garrick does not guide (fails)
- His lines come **all at once at the top**, before the player has done anything, and then he goes quiet. He never walks the player from their find to the board to the question.
- **His nudge has nowhere to be answered.** He asks a friend by name ("Mei, how was the mark cut?"), and the only box is the reading's own line, for a different question.
- He never **ties the evidence to the question.** The rules say each board clue "leans A or B", yet nothing asks the player to weigh the board against tonight's question.
- What works: "What would change your mind?" after a pin, the riddle, "he notices" lines, and the cup. Garrick is likeable here; he just is not leading.

### C. Async collaboration: friends leave things but cannot answer each other (partly works)
- Works: the board (one card per lead with every finder), shared notices, what passers saw, pins after your own, the catch-up line, bottles, the week line read back at the Gathering.
- Fails: **every trace is one-shot.** You can read Mei's theory but not reply to it; you can leave a bottle but nobody can answer it. It is a wall of notes, not a conversation.

### D. Live collaboration: friends at the fire together cannot talk there (fails)
- Two friends at the fire at once see "At the fire now: Mei" and a refresh every 20 seconds, and **nothing to talk in.** The party chat is a different screen, and it is the wrong place for it: friends who have not played today read it too, so talking about today's clues there spoils their day.
- The rules meant the fire to be a conversation: "The Campfire lives in the party chat (PARTY · CAMPFIRE), where canon puts Garrick's banter and the friends' own talk", with a cap on "Garrick posts in the shared room". The build turned it into a form.

### E. A contradiction inside the rules (found in the test run)
- "Pin before peek" (§D): you see others' readings only after your own. But the catch-up line (§A, "{friend} thinks A") tells a newcomer a friend's reading **on arrival, before they pin**. The two-player test shows it: Mei saw "TestHost thinks Meira left in a hurry" before pinning. Fake Guru to choose; suggestion below.

## 3. The redesign: the fire becomes tonight's conversation

**One thread for the night, shared by the friends who have played the day, hosted by Garrick.** It reads like a chat: Garrick's lines, each friend's arrival and find, pins, shared notices, and the friends' own messages, in time order. Friends who come later scroll up and see the evening so far; friends who are there together see it happen. It locks at dawn and stays readable.

**One question at the centre: tonight's question** (the fork). Everything else serves it or steps aside.

### Garrick walks each friend through it (stored lines only, as the rules require)
1. **Arrival:** his opener (and the cup, on cup nights), once, to you.
2. **Your find:** your last-light clue goes into the thread as a card ("Mei brought back: The cropped grass") and onto the board.
3. **The question:** Garrick puts tonight's question, with the board in view: "There's the board. Does any of it lean you one way?" (new stored line)
4. **Your pin:** A, B, Neither, and a line in your own words. Then the readings already pinned open up, and Garrick asks "What would change your mind?" (existing).
5. **The disagreement:** if a friend reads it the other way, Garrick points at it without judging: "Mei reads it the other way. Ask why." (new stored line). This is the line that starts conversations.
6. **His nudge** becomes a follow-up inside the thread, to the friend best placed for it, who can now answer it there.
7. **Then the light things:** the fragment (and its question, once whole), the riddle on wry nights, "A word with Garrick", and "Rest for the night".

### What goes, and what merges
| Today | Becomes |
|---|---|
| Message in a bottle, An open question (two boxes) | gone: any message in the thread is read by whoever comes next |
| What each of you saw | a "Share what you noticed" message in the thread |
| The case so far (the week line, a full section every night) | a small "Update your theory of the week" link; the Gathering still reads back how each theory changed, which needs lines from several days |
| Five questions a night | one at the centre; the fragment's question after the fragment is whole; the nudge as a follow-up |
| Leave the fire | **Rest for the night** (Garrick's closer, what we did today, the Pull) |
| Garrick's lines all at the top | one at a time, as each step happens |

### Live and async, both
- **Async:** later friends read the evening top to bottom, catch-up first, and answer anyone in the thread.
- **Live:** messages appear within seconds; "At the fire now: Mei, Dev" at the top; the alert "Mei is at the fire." goes out at once (notifications proposal).
- **Garrick does not chat freely** at the fire (the rules: stored lines only, no AI there). Friends talk to each other; Garrick hosts. "A word with Garrick" stays for asking him things privately.

## 4. Holes checked
- **Spoilers:** the thread opens only to friends who have finished today's day, the same gate as now. The party chat stays for everyone and spoiler-free.
- **Pin before peek:** pinned readings show as "Mei has pinned a reading" until you pin; then they open. Friends may still say their reading in their own words; that is their choice, as at a real table.
- **Party of six:** arrivals are one short line each; Garrick's lines stay within the rules' caps (8 to one friend, 12 in the shared room); the thread scrolls.
- **Alone:** Garrick still walks the steps; the thread holds what earlier friends left; a friend alone is never told to "ask" anyone not there (the disagreement line needs a friend's pin).
- **Week 1 Day 1:** each friend is alone in the story; the fire stays narrated and private, as now.
- **Dawn:** the thread locks at 5:00am, readable after.
- **Bad behaviour:** the party chat's reporting carries over to the thread.
- **The 2 to 4 minute target:** a friend alone does arrival, find, pin, and rest in about 3 minutes; talk is extra, by choice.
- **The demo** (`CampfireEveningView.tsx`) follows the same order with sample friends.

## 5. Decisions for Fake Guru
1. The redesign: one conversation thread for the night, Garrick hosting, one question at the centre. Yes / no / change.
2. The contradiction: the catch-up line names a friend's reading before you pin. Suggestion: on arrival Garrick says only who has been ("Mei and Dev have been at the fire."), and names readings after you pin.
3. The new stored Garrick lines (drafted for approval before building): "There's the board. Does any of it lean you one way?" and "Mei reads it the other way. Ask why." (Friends are never given pronouns.)
4. The week line: from a full section every night to a small link (suggested). Not Day 6 only: the Gathering reads back how each friend's theory changed over the week, which needs lines from several days.
