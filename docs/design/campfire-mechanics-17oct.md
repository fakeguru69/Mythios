# The Campfire: what "working" means, and the mechanics that get there (17 Oct, for Fake Guru)

Fake Guru: "So we're taking inspiration from Werewolf? What about other games? How do their mechanics work? I'm specifically interested in how they keep the async or live interaction going. … Some games use turn-based mechanisms (which probably don't work for us). What else is used in those games? We have many components in the campfire, so probably need a relook at how to put them together, and maybe require streamlining for better focus. What does working mean? What are we trying to achieve here, within the constraint of async interaction?"

Follows `campfire-research-17oct.md` and `campfire-loop-17oct.md`.

## 1. What "working" means
**The aim:** each night, the friends think about the mystery together and feel one another's presence, whether or not they are ever there at the same time.

**How we would know (each night, from the game's own records):**
1. **Reach:** most friends who played the day come to the fire.
2. **Contribution:** every friend who comes leaves something the others can use: evidence laid, a reading pinned, a message.
3. **Response (the heart of it):** every friend who comes responds to something a friend left: a reply, an agree or doubt, a changed reading. A fire where everyone posts and nobody responds is a wall of notes, not interaction.
4. **Pull back:** some friends come back the same night when something happens (an alert), live or not.
5. **Payoff:** when the story answers the party's call, friends talk about it.
6. **Light enough:** a friend with three minutes can do 1, 2 and 3 in three minutes.

**What must never happen:** a friend waiting on another to be able to play (Fallen London's lesson, below); a friend shamed; a spoiler.

## 2. How other games keep async interaction going

| Game | The mechanic | What it solves | For the fire |
|---|---|---|---|
| **Werewolf / Mafia** (Telegram, Discord bots) | Something happens, debate, a vote against a clock | Talk with a stake | **Yes:** the party's call at dawn |
| **Diplomacy** (online, async) | Everyone commits orders in secret; all resolve together at the deadline; talk happens between deadlines. A phase ends early once everyone has committed | Async without turns: nobody waits for anybody | **Yes:** pins are secret commitments, revealed together; dawn resolves |
| **BeReal** | You see friends' posts only after posting your own; one shared daily moment | Everyone gives before they take | **Yes:** lay your evidence to see the table (and pin before peek, already canon) |
| **Wordle** | One shared puzzle a day; a result you can share without spoiling | A daily ritual, and talk anywhere | **Yes:** one question a night; a spoiler-free line of the party's call for the party chat |
| **Keep Talking and Nobody Explodes** | Each player holds information the others need and cannot act on alone | Talking is required, not optional | **Yes:** each friend's evidence is necessary but not enough |
| **Sherlock Holmes Consulting Detective** | Friends read leads together, then compare their answer with Holmes's | The payoff is the comparison | **Yes:** the call read back beside the story's truth |
| **Mysterium** | After guessing, players put tokens on each other's guesses to agree or doubt | Reacting to others' reasoning with one touch | **Yes:** agree or doubt a friend's reading or evidence, with an optional reply |
| **Play-by-post mysteries** | Host posts the scene; free thread; recaps for latecomers; ask characters with an @ | Long-running async talk that stays followable | **Yes:** the thread, the case so far, @Garrick |
| **Lifeline** | Alerts that each carry a choice; no penalty for answering late | Pull back without nagging | **Yes:** alerts that carry a decision |
| **Fallen London** | Multi-step social actions with a friend | **Failed:** they broke whenever one friend stopped playing; Failbetter retired them for letters | **Rule:** nothing at the fire ever waits on another friend |
| **Group chats** (WhatsApp, Signal) | Reactions and polls | One-tap participation for people who read but rarely write | **Yes:** agree or doubt taps; the call is a poll in all but name |
| **Turn-based games** (chess, Words With Friends) | Take turns | Pace | **No:** a turn blocks everyone on the slowest friend |

## 3. The fire, streamlined: one night in three beats
Today: eleven sections. Proposed: one conversation, with **three beats** pinned above it in order, and Garrick's next-step card walking each friend through them. A small line shows where you are: **The table · The question · The call**.

**Beat 1. The table** (what we found)
- Lay down your evidence: your find goes on by itself; your Notice line and your pass line with one tap each.
- **Give to see:** once you have laid one piece, you see everything on the table (BeReal). Everyone has at least a Notice line, so nobody is shut out.
- Agree or doubt any piece with one tap; reply if you like.

**Beat 2. The question** (what we think)
- One open question for the night, with the table beside it.
- Pin your reading, secretly; then everyone's readings open (Diplomacy, and pin before peek).
- Agree or doubt a friend's reading with one tap (Mysterium); reply in the thread.
- Change your reading until dawn; "Dev changed sides." is posted, never which side.

**Beat 3. The call** (where the fire stands)
- The fire's leaning so far, by names, never counts.
- Last call in the evening; at dawn the party's call is made.
- Rest for the night: Garrick's closer, what we did today, the Pull.

**Off the main path** (there when wanted, never in the way): the fragment puzzle (its own pin; its question joins Beat 2 when it is the best open question), the riddle (Garrick drops it on wry nights), "A word with Garrick" (the private drawer), the week's case (Day 6).

The conversation runs under all three beats, in time order, for everyone, live or hours apart.

## 4. How each measure of "working" is served
| Measure | Served by |
|---|---|
| Reach | "Mei is at the fire", the day's alerts, the Pull |
| Contribution | give to see; one tap to lay evidence; pinning is one tap |
| Response | agree or doubt taps; Garrick's split and side-change lines; replies |
| Pull back | alerts that carry a decision: "Mei doubted your reading.", "Last call: you haven't pinned." |
| Payoff | the party's call read back when the story answers |
| Light enough | three beats, each a tap or two; everything else optional |

## 5. Holes checked
- **Nobody waits on anybody:** every beat works alone; the call forms at dawn with whoever pinned (Fallen London's lesson).
- **Give to see:** everyone always has a Notice line to lay, so the gate never locks anyone out; a friend alone sees an empty table and still plays.
- **Doubt without hurt:** a doubt is a tap on a reading, shown by name like any reaction; Garrick never doubts anyone; no gold anywhere on theories.
- **Pin before peek** still holds, now with a reaction layer that only opens after your own pin.
- **No turns, no short timers:** dawn is the only deadline.
- **Spoilers:** everything stays behind the "played the day" gate; the party-chat line of the call says only that the fire made a call, never what it was, until the morning.
- **Party of two, friend alone, Week 1 Day 1:** as in the loop design.

## 6. Decisions for Fake Guru
1. The measures of "working" above. Yes / change.
2. The three beats: the table, the question, the call; everything else off the main path. Yes / change.
3. Give to see: lay one piece of evidence to see the table. Yes / no.
4. Agree or doubt taps on evidence and readings. Yes / no.

## Sources
[Diplomacy, Game Developer analysis](https://www.gamedeveloper.com/pc/analysis-asynchronicity-in-game-design) · [webDiplomacy FAQ](https://webdiplomacy.net/faq.php) · [BeReal, NPR](https://www.npr.org/2022/04/16/1092814566/bereal-app-gen-z-download) · [Wordle, ClickZ](https://clickz.com/?p=266468) · [Keep Talking, GDC](https://gdcvault.com/play/1023113/Designing-Asymmetric-Gameplay-For-Keep) · [Consulting Detective review](https://www.miniaturemarket.com/reviewcorner/sherlock-holmes-consulting-detective-the-thames-murders-and-other-cases-review) · [Mysterium, The Board Game Family](https://theboardgamefamily.com/?p=26420) · [Fallen London social actions, Failbetter](https://www.failbettergames.com/new-social-actions/) · [Signal reactions](https://signal.org/blog/more-reactions/) · [Lurkers in online groups](https://informationr.net/ir/23-2/paper791.html) · earlier sources in `campfire-research-17oct.md`.
