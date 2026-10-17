# The Campfire as a conversation: the design (17 Oct, for Fake Guru)

Follows `campfire-audit-17oct.md`. Fake Guru: "Linear chat seems like a good idea … but it can also be complicated to track … Maybe we can employ a 'pinned' function (board, fragments etc), like how you can pin a poll on WhatsApp? … Garrick's conversations and prompts need to be meaningful and not NPC conversations; how he presents the info clearly; how he talks about the components coherently; how he guides the conversations towards solving the mysteries, async and live; how he guides and moderates the live conversation … a modified version of a chat screen might help. Don't take my word for it."

## 1. The screen: three layers, not one long page

```
┌───────────────────────────────────────────┐
│ THE FIRE · Week 2, Day 2 · at the fire: Mei │
│ [? Tonight's question •] [▦ Board 3] [✦ Fragment 1/2] [≡ Week] │  ← pinned strip
├───────────────────────────────────────────┤
│ Garrick: You're first. Pull up a log.       │
│ · Mei added "The paper in his fist" to the board │  ← the shared thread
│ · Mei pinned a reading                      │
│ Mei: the paper has to be the list           │
│ Garrick: Mei, which of the board makes you say that? │
│ Dev: the mud goes straight to the bed …     │
├───────────────────────────────────────────┤
│ Garrick, to you: Your find, "Straight to the bed", │  ← your next step (yours only)
│ is on the board. Which way do you lean tonight?  │
│ [READ THE QUESTION]                         │
│ [ Say something at the fire…     ] [→] [Garrick ▾] │
└───────────────────────────────────────────┘
```

1. **The pinned strip** (like a pinned poll in WhatsApp). Four pins, always one tap away: **Tonight's question**, **The board**, **The fragment**, **This week**. Each opens as a panel over the chat, with its content, its action (pin your reading, solve a word, add your week line), and the messages said about it. A dot marks a pin that has changed since you last opened it. The detail lives in the pins, so the chat never has to carry it.
2. **The shared thread.** Only what happens between people: friends' messages, short event lines ("Mei added … to the board", "Dev pinned a reading", "Jo solved the riddle"), and Garrick's lines to the whole fire. Each event line opens its pin when tapped. Every message about a pin carries a small label ("· the board"), and the pin's panel gathers them, so each idea can be followed on its own.
3. **Your next step** (yours alone, never in the thread). Garrick's guidance to you: one card above the typing box, changing as you go. Ten friends' worth of "which way do you lean?" never clutters the shared conversation, and each friend is still walked through the night.

Below it, the typing box: **to the fire** (everyone who has played today) or **to Garrick** (the private "A word with Garrick").

## 2. The five questions

### One. Meaningful, not NPC
Every Garrick line at the fire must pass three tests, or it is not said:
- **It is about something real tonight:** a friend by name, a clue by its title, a reading someone pinned, something nobody has looked at yet.
- **It does one job:** point (here is a thing), ask (a question only this friend can answer now), connect (two real things side by side), invite (bring in a friend), or close.
- **It is true and never a grade.** He never says right or wrong, never predicts, never promises (his rules).
The old fixed lines that do none of these (a generic acknowledgement after every pin, a riddle on a quiet night) go. His lines are stored templates filled from what is really at the fire, so they are specific without any AI (the rules keep AI out of the fire).

### Two. Presenting the information clearly
- Each pin holds one kind of thing, in the same place every night.
- Garrick introduces a pin's change in one short line, once ("Dev's find is on the board: the second lamp."), and the pin holds the detail.
- On arrival, your next-step card is a **while-you-were-away digest**: "Since this morning: two finds on the board, Mei and Dev have pinned readings, Mei asked you something." Each part opens its pin or message.

### Three. Talking about the components coherently
Everything at the fire serves **tonight's question** (the two readings). Garrick links the pieces to it:
- **Board to question.** Each night's three clues are written so that one leans to the first reading, one to the second, one fits both (stored with each clue, never shown). Garrick uses that only to choose *which* clue to put beside a reading, never to say which way it points. After you pin: "Pinned. The cropped grass is on the board too. Does it sit with that?" He picks the clue that leans the other way, or, if you pinned "Neither", the clue that fits both: the rules' "What would change your mind?", made concrete.
- **Fragment to question.** When the fragment is whole, Garrick posts it with its question to the fire, once.
- **Week to question.** On Day 6 he reads two pins from the week by name (the rules' weekly revisit), and the Week pin shows each friend's line.

### Four. Guiding towards solving, async and live
The night has an arc, and Garrick moves each friend and the fire along it:
1. **Gather:** your find goes on the board (your next step).
2. **Lean:** you pin a reading, after which the others' readings open (pin before peek).
3. **Test:** Garrick puts the clue that leans against your reading beside it (above).
4. **Disagree:** when two friends lean different ways, Garrick says so to the fire, by name: "Mei leans one way and Dev the other. Dev, what would you say to Mei?" This is the line that starts conversations, live or hours apart.
5. **Agree too easily:** when everyone leans the same way: "Everyone leans the same way tonight. What would it take to be wrong?"
6. **Close:** "Rest for the night": Garrick's closer, what we did today, and the Pull.
Async, the arc runs across the day: Garrick's disagreement line waits in the thread for whoever comes next, and a question to a friend by name ("Mei, which of the board makes you say that?") reaches Mei the next time she opens the fire, or by alert.

### Five. Guiding and moderating the live conversation
Garrick does not read what friends type (no AI at the fire, by the rules). He moderates by what he can see for certain: who is here, who has spoken, who has pinned, how long it has run.
- **Brings in the quiet:** a friend at the fire who has not spoken or pinned for a few minutes while others talk: "Jo, you've been quiet. Which way?"
- **Calls the split** (above), and **asks for the evidence**: when a friend pins with a line of their own, "Mei, which of the board makes you say that?"
- **Brings it back:** when the talk has run long with no new pin or board look: "That's a lot of talk. Pin where you stand; it goes on the board." (Not "we'll see it at the Gathering": he never predicts.)
- **Paces:** never two Garrick lines in a row to the fire; his shared lines stay within the rules' cap (12 a night).
- **Keeps it safe:** the party chat's reporting carries over to the fire.
What he cannot do: understand an argument or summarise it. If that is wanted later, it would mean AI at the fire, which the rules forbid today; it can be tried once the Gemini key is in, with its own filter.

## 3. What happens to today's eleven sections

| Today | Becomes |
|---|---|
| Garrick's opener, catch-up, "he notices" (all at the top) | one arrival line in the thread; the digest in your next step; "he notices" as his arrival line when it applies |
| Your find, The board, What each of you saw | **The board** pin; a find or a shared notice is an event line in the thread |
| Tonight's question, Garrick's nudge | **Tonight's question** pin; the nudge becomes his question to a friend in the thread, answerable there |
| Today's fragment, its meaning question | **The fragment** pin; Garrick posts the meaning question when the fragment is whole |
| The case so far | **This week** pin; Garrick reads it on Day 6 |
| A riddle | Garrick posts it in the thread on wry nights, with an [ANSWER] button (answered privately; "Jo solved the riddle" is posted) |
| An open question, A message in a bottle | gone: any message in the thread is read by whoever comes next |
| A word with Garrick | the typing box, set to Garrick |
| Leave the fire | **Rest for the night** |

## 4. Holes checked
- **Clutter with six friends:** each friend's guidance is in their own next-step card, not the thread; event lines are one line; Garrick never posts twice in a row; his shared lines are capped.
- **Pin before peek:** the question pin names who has pinned, never their readings, until you pin yours. The rules forbid counts, so names only.
- **Lean data stays hidden:** it only decides which clue Garrick mentions; no screen shows it. Today it is kept off the server on purpose (`gen-campfire-sql.ts` leaves it out); it would be loaded to a server-only place that no phone can read.
- **The split line** ("Mei leans one way and Dev the other") tells a friend who has not pinned that there is disagreement, never which way anyone leans.
- **Spoilers:** the fire opens only to friends who have played the day; the party chat stays for everyone and stays spoiler-free.
- **A friend alone:** the next-step card walks the whole arc; the disagreement and quiet-friend lines need another friend and are never said to an empty fire.
- **Garrick's rules:** every template is checked for no promise, no prediction, no grade, no denial, no "maybe"; friends are never given pronouns.
- **Week 1 Day 1:** each friend is still alone in the story; the fire stays narrated and private.
- **Dawn:** the thread locks at 5:00am and stays readable.
- **Alerts:** "Mei is at the fire" (instant), and "Mei asked you something at the fire" when Garrick or a friend names you.
- **The 2 to 4 minute promise:** alone, a friend gathers, leans, reads Garrick's test and rests in about 3 minutes; talk is extra, by choice.
- **The demo** follows the same screen with sample friends.

## 5. Decisions for Fake Guru
1. The screen: pinned strip, shared thread, your next step. Yes / change.
2. Garrick uses the hidden lean only to choose which clue to put beside your reading, never to say which way it points. Yes / no.
3. The arc and Garrick's live moderation as above (bring in the quiet, call the split, ask for the evidence, bring it back, pace). Yes / change.
4. The catch-up contradiction: on arrival, who has been; readings only after you pin. Yes / no.
5. Then: I write every new Garrick line in full, checked against his rules, for your approval before building.
