# The Campfire's game loop (17 Oct, for Fake Guru)

Fake Guru: "About a third of the nights' questions are already answered by the chapter or the next morning … Is that a good thing? Next day offers payoff to last night's debate. From your research on those games, can it help with how we build the campfire mechanics and gameplay? It's a redesign, so be open. The objective is to promote interaction, probably by discussing, investigating and solving the mysteries, async or live. Think this through deeply."

Builds on: `campfire-research-17oct.md` (what other games teach), `campfire-content-verdict-17oct.md` (the content), `campfire-chat-design-17oct.md` (the screen), `campfire-voice-and-play-17oct.md` (Garrick's voice).

## 1. Fake Guru is right: a next-morning answer is a good thing
The audit counted two different things as one. Split properly:

| When the night's question is answered | Nights | Verdict |
|---|---|---|
| By that day's own chapter, before the fire | W1D4, W3D4, W3D5, W5D1, W5D6, W6D1 (W1D2, W6D3 partly) | bad: nothing left to debate |
| The next morning, or within two days | W1D6, W2D1, W2D4, W3D1, W4D5 | good: a quick payoff, if the morning connects it to last night |
| Later in the week, at the Gathering, or at the finale | most others, including the best (W1D5, W2D2, W2D5, W4D4, W4D6, W6D6) | good: a long payoff, if the answer recalls what the party said |
| Never | W1D3, W2D3, W4D1, W5D2, W6D5 (W3D6 offers a choice the story never gives) | bad: a debate with no ending |

The next-morning answer is the Werewolf dawn: last night's vote meets the truth. What is missing everywhere is **the connection**: when the story answers, nobody is reminded what the party said.

## 2. What the research gives the fire
From Werewolf and Mafia bots, Among Us, play-by-post mysteries, Lifeline and AI Dungeon (sources in `campfire-research-17oct.md`):
1. **Hidden information makes people talk.** In Werewolf each player knows something the others do not; talk is how it comes out.
2. **Talk needs a decision that counts, and a deadline.** The day ends in a vote; the vote changes the game.
3. **The deadline should be slow in a thinking game.** Short timers reward the loudest (Among Us).
4. **The truth must come back to meet the decision.** Dawn reveals who was killed; the reveal is the payoff of the debate.
5. **Async needs a host who recaps and keeps it moving,** and rewards often.
6. **Questions to characters draw out clues** ("@ the suspect" in mystery threads).
7. **Alerts work when they carry a decision** (Lifeline).
8. **An AI storyteller in a group goes off the rails**; the story stays authored.

## 3. The loop
The game already has the ingredients; they are not joined up.

**The day (alone).** Each friend reads the chapter and ends the day holding evidence of their own:
- their **Notice line** (each friend sees a different one, by their best Attribute);
- their **last-light find** (each friend follows a different lead);
- the **pass line** if they passed, which a friend who failed never reads;
- their **[PRESS ON] detail**, if they pressed on.
This is the game's hidden information: nobody holds all of it. It exists today and is mostly wasted.

**The evening (the fire).**
1. **Lay your evidence on the table.** Your find goes on the board; Garrick's next-step card offers your Notice line and pass line ("You noticed something today. Lay it down?"). One tap each. Laid evidence is shown with your name.
2. **Tonight's question.** One question the day really leaves open (from the content rebuild). Written so that no single friend's evidence settles it, but the table's evidence together tilts it.
3. **Debate,** in the shared thread, live or hours apart. Garrick hosts (section 5).
4. **Pin your reading** (A, B or Neither, plus a line). Pin before you peek. You may change your pin until dawn; "Dev changed sides." is posted (never which side). Changing a mind is what debate is for.

**Dawn (5:00am): the party's call.** The fire's pins lock. The reading most friends pinned becomes **the party's call**; if it is even, the fire is **split**; if nobody pinned, there is **no call**. No counts are shown, only the call and who pinned what.

**The morning: the truth meets the call.** When the story answers the question, it is connected:
- **Next morning:** the day opens with last night's call, then the chapter. "Last night the fire called it: *they knew him personally.* Mei and Dev said so; Jo held out." Then the chapter shows what is true. Nobody is graded; the story does that.
- **Later:** when a later chapter line or a Gathering beat answers an older question, MYTHIOS sets the call beside it at that moment: "On Day 2 the fire called it: *they knew him personally.*"
- **Never:** not allowed. The content rebuild gives every question an answer somewhere.

**The week: the party's case.** On Day 6 the fire's question is the week's question, and the party's call on it is **the party's case**, the "one formal accusation" of mystery threads. The Gathering's opening reads it, and the Gathering answers it. The existing week line becomes each friend's contribution to the case.

**The season.** After the finale, Garrick's Recap (built) gains its pair: **the party's calls**, the week's cases and the nights that turned, beside what was true.

## 4. Why each piece makes friends interact
| Piece | Why a friend talks |
|---|---|
| Hidden evidence | you hold something the others need, and they hold something you need |
| One open question | everyone is talking about the same thing |
| The call at dawn | the talk has a stake: what the party will be on record as believing |
| Pins change until dawn | persuading a friend counts; "Dev changed sides" is a small win anyone can see |
| The morning read-back | the result lands on names, so it matters who said what |
| The party's case | the week has a destination, and the Gathering is its verdict |
| @Garrick | anyone can draw him in, publicly, from stored lines |

## 5. Garrick hosts, he does not police
Banter is the glue of a friends' chat; he lets it run. He speaks at set moments, each from stored lines filled with real names and titles:
- **The night opens:** the question, and the case so far for latecomers.
- **Evidence lands:** "Dev's find is on the table: the second lamp." Once the clue leans are checked: "Mei, that sits against your reading."
- **A split:** "Mei leans one way, Dev the other. Dev, what would you say to Mei?"
- **Everyone agrees too soon:** "Everyone leans the same way. What would it take to be wrong?"
- **A quiet friend while others talk:** "Jo, you've laid nothing down yet."
- **Last call,** in the evening: "The fire's call closes at dawn."
- **The close:** his closer, what we did today, the Pull.
- **@Garrick:** asked about the case, he answers from stored lines, for all to see.
With the AI (if approved), he may also reply in his voice to banter, never about the case.

## 6. Async and live: one design
- **Async is the normal case:** the dawn deadline, the case so far for latecomers, and alerts that carry a decision: "Mei laid down a find." "Last call: the fire's call closes at dawn, and you haven't pinned." "Last night's call is in."
- **Live is the same mechanics, faster:** "At the fire now: Mei, Dev." No short timers anywhere (the Among Us lesson).
- **A party of two, or a friend alone:** less hidden evidence, but the loop holds; the call is one or two pins; the read-back still lands. Week 1 Day 1 stays private (the party has not met).

## 7. Holes checked
- **Nobody is graded:** the call is read back beside the story's truth; neither Garrick nor MYTHIOS says right or wrong. No gold on theories (canon).
- **Bandwagoning:** pin before peek keeps first pins independent; changes are allowed but announced.
- **"Names never counts" (Campfire rules):** the call shows the reading and the names, never a tally; a split is called a split.
- **Spoilers:** evidence is laid only at the fire, which opens only after the day; the morning read-back shows only last night's own question and call.
- **Hoarding evidence:** allowed; Garrick's quiet-friend line invites it; the find goes on the board by itself as now.
- **A day nobody pins:** "The fire made no call." Nothing breaks.
- **Late friend after dawn:** reads the board and the call; cannot pin.
- **Content dependency:** the morning read-back needs each question's answer point recorded, which the content rebuild adds.
- **Garrick's rules:** every new line goes through the Garrick check before approval.

## 8. Rules for the content rebuild (from this loop)
1. Each night's question is open when the fire opens.
2. Each question records where the story answers it: next morning, later in the week, the Gathering, or the finale. Never "never".
3. The night's evidence is split across friends: no single Notice line, find or pass line settles the question; together they tilt it.
4. Every clue's lean is checked, and every clue bears on the question or is cut.
5. Each week's six questions climb towards the week's question; Day 6's question is the week's question.
6. The fragment's meaning question is used as the night's question when it is the best open question that night.

## 9. Decisions for Fake Guru
1. The loop: evidence laid on the table, one open question, pins until dawn, the party's call at dawn, read back when the story answers. Yes / change.
2. The party's case on Day 6, answered at the Gathering. Yes / no.
3. "Dev changed sides." is posted (never which side). Yes / no.
4. Then: the Week 1 sample, written to these rules, for your approval.
