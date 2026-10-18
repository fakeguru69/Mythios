# The look and the flow, redesigned (proposal, 18 Oct)

Fake Guru played Week 1 Day 1 on two phones and sent about 25 notes: "You need a visual unifier and hierarchy and
guide. Need a serious relook at the concept, both in mechanics and design." His references A and B are the old
one-phone demo (the game shell with tabs across the top and the chat box always at the bottom; the fight card with
coloured stats). Mockup: https://claude.ai/artifact/RTCsCbQerDNsiBSAqbSVEB (eight phone screens). Nothing here is
built until he says yes.

## Fixed at once (verified; commit 9456560)
- Garrick answered "A word with Garrick" at the Day 1 fire, before the party meets him (Week 1 Day 2). Migration
  `0094`: the fire needs the same rule as the thread, and neither answers on your Week 1 Day 1. Live, md5 checked.
- The resting screen at the fire repeated the chapter's last paragraph (the Pull). Taken out.
- iPhone Safari cut the page off on the right: Safari zooms in on a text box under 16px and stays zoomed. Every box is
  now 16px (`src/index.css`).
- The test party's clock read UTC because the test browser made it; set to Singapore. Real players get their phone's.

## The proposal
1. **One game shell, as in A and B.** Signing in opens the game, not a party page. Across the top: the series, the
   party and the day on two lines, gold on the right, then five tabs: STORY, FIRE, BAG, STORE, PARTY. The party page,
   the "Today" list of buttons and every "Back to the party" go.
2. **One voice key, so colour means something.** Story (MYTHIOS telling it): one serif, 18px, white, no italics, no
   side bar. How-to lines: a small "HOW IT WORKS" strip in gold. Garrick: a warm amber bubble with his name. Friends:
   chat bubbles with their names. Your own choice: your bubble on the right ("You look where he stood."). What you
   notice: a blue "YOU NOTICE" card that says why ("Might, your best") and that it is free. Tomorrow: a gold label.
3. **Bigger text** (18px story, 16px everything else; iPhone messages are 17px).
4. **Reading from the top.** Each tap of "Go on" adds one paragraph under the last; the page never jumps to the bottom.
5. **Fights in colour, both sides' numbers**, as in B: Weapon gold, Armour blue, Defence orange, Attack purple, and
   "You hit on 9+ / He hits on 13+" so the odds are plain.
6. **Choices.** Real forks already lock the other path (`pick`). Week 1 Day 1's is canon's "look at both" (both finds
   matter later), so it shows as "Two places to look, you can look at both" with a tick on the one done.
7. **The end of the day** is a card with three coloured results (gold, growth, fragment), what you learned, what you
   hold, and Tomorrow. One button: To the fire. The last light becomes the first thing at the fire.
8. **The fire is a chat.** Tonight's question pinned at the top; below it the fire's thread: Garrick opens and guides,
   friends talk, a laid clue is a card in the chat with Agree and Doubt; the chat box is always at the bottom with
   three buttons over it (lay a clue, your fragment, a quiet word with Garrick). The tabs go. The case so far, the
   riddle and the bottle move to the Bag or a "more" menu, or are cut (his call).
9. **The Seeker Chest** shows empty dashed blanks marked LOCKED; the jumbled letters become tiles you tap into the
   blanks, so nobody mistakes them for the answer.
10. **The Party tab:** notifications as one button (gone once on), friends as rows with a status ("At the fire",
    "Reading Day 2"), Remove behind a ⋯ menu, the Gathering time with "Singapore time", settings at the bottom.
11. **The cover** is one screen: MYTHIOS, one line on what it is, Tales of the Dark Moon as the featured series with
    its art, hook and four facts, and two buttons.

## Decided with Fake Guru (18 Oct, after the proposal above)
- **The shape: B**, a chat where the people are real and the story is written. Story arrives as messages; your
  choices are buttons where the keyboard would be; free typing only where someone listens (the fire, Garrick).
- **One thread from morning to the fire.** No separate day and fire screens: the day's chapter, the end-of-day
  card, the last light ("One more look" or "Sit by the fire") and the fire follow one another in the same thread.
  Day 7 is the Gathering in the same place. Scrolling up goes back to earlier days; tapping the day name lists the
  days played.
- **Tabs: STORY · RECORD · BAG · STORE.** No party tab: tapping the party name opens a panel (friends, invite,
  notifications, the Gathering time, the clock, your name). The Record is the stats page from the demo
  (`RecordTabView.tsx`); it was never built online, so it is new work, not a loss.
- **The fire opens only once your day's chapter is finished.**
- **Messages arrive by themselves** with a "typing" dot (tap to read faster); the screen stays where you last read.
- Superseded above: item 1's tab list, item 7's "To the fire" button, item 8's separate fire tab, item 10's tab.

## Choices (Fake Guru, 18 Oct)
- **The rule:** two options shown together are a choice; picking one closes the other. Built: "look at both" and
  "look at all" steps now offer one action at a time (Week 1 Day 1: "Look where he stood", its passage, then "Look at
  what he was at"). Checked in a local play of Week 1 Day 1: never two options at once.
- **Forks** may rejoin, but must never feel as if they did not matter. Proposed (awaiting his yes): the other path
  stays closed; each path leaves its own find for the fire; a short join line per path; about one fork in three
  carries a stake; some are remembered later. Week 1 has 7 forks to draft first.
