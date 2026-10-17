# Fix plan from the six AI audits (17 Oct)

This plan is built from the claim-by-claim checks in `checked/` (`week-1.md` … `week-6.md`, `season.md`). Every item below was checked against the game files. Claims that turned out wrong, or that came from errors in the play-through document, are left out.

## A. Bugs: plain mistakes, no story change — DONE 17 Oct (Fake Guru: "1 yes"; migrations `0076`–`0078`)
1. **"Mei and Mei" (W4D2).** In a party of 2 or 3, one friend is named twice. The short-party entry in `smallPartyLines.ts` is out of date. I'll check every other entry at the same time.
2. **The lookout buttons (W5D6).** The line always names friend 1, and a party of 2 sees three buttons with the same name. The fix: one button per friend, and the line names the friend you posted.
3. **The W2D2 riddle can't be solved.** Its accept list is "a comb (or a cog)". The fix: accept comb, a comb, cog and a cog, then check all 35 riddles the same way.
4. **A lost Gathering 6 line.** "He never lied to us. He only never told us the price." never plays, because of a generator bug. The fix moves the act pick one step, so the server's step number changes too.
5. **Garrick's Recap.** It still lists two lines he can never say ("She wrote it down. I'm telling you now." and "'Speak true, always.' It's their book."). The generator counts story notes as things he says. The fix: the generator checks only what the game plays. This item also adds the two Recap entries the auditors found missing: the cup ("Family habit…") and the linen.
6. **The play-through document.** Add "Either way:" after branches, and show the second Match's and [LOOK CLOSER]'s conditions. This removes most of the auditors' false alarms before any next round.

## B. Text changes: these need your OK (story, Garrick or Campfire lines)
7. **Campfire questions that don't match their pins** (13 nights). Garrick asks one question, and the two pins answer a different one: 1-2, 1-6, 2-2, 2-4, 3-3, 3-5, 3-6, 4-2, 4-3, 5-5, 6-1 and 6-4. Night 6-6 also says "not one of the dead turned its head" on the day one did. I'll draft all 13 for you to read.
8. **"Someone at the fire may have seen it"** (10 fail cards). It is often false. Either build the share (C14), or the line only shows when it is true.
9. **Gathering 2, a lost United Effort.** The whole Verse and the ledger still play as if you'd won. Write a loss version; the plot stays the same.
10. **The Gathering 5 recap slip.** It says your blood woke the other four Stones, but the children's did.
11. **Small timing and logic slips:**
    - W4D6's Pull says "Now.", but a night and a day pass before the Gathering;
    - W6D1 says "the Order has never known this room", but Garrick is in it;
    - W6D1's fire recalls an event that didn't happen;
    - W6D6 pours the last of the flask twice;
    - W1D6 says "not one of you has missed one", which is false for a friend who skipped a day.
12. **Choices that change nothing** (8 of them; W1D4 matters most, where canon promised a reply for each choice). Give each its own 1–3 lines.
13. **Smaller story polish:**
    - W4D1: tie the blade that "cut only rope" to the Gathering turn;
    - one line per act after the king opens his eyes;
    - Gathering 6's vote buttons describe the action, not the outcome;
    - Garrick closes the dying watchman's eyes at Gathering 5;
    - the Week 5 question becomes "What will the fifth end?";
    - 4 recaps lose the details only one branch saw;
    - vary the "stone housing opens to your palm" find (about 15 days);
    - give the Week 2–3 silent attackers a different goal;
    - lines for small parties (2 friends at Gatherings 1 and 4 and W2D6; a friend alone at Gathering 6's act; friends 5 and 6 are never named);
    - more goodnight lines;
    - replace the "piano" riddle and the second "light".

## C. Building work
14. **Share at the fire.** A friend who passed the Challenge, or took [PRESS ON], has their detail put on the board. This fixes item 8 for real, and the 11 [PRESS ON] details finally reach the party.
15. **Canon's quiet minute.** At the Gathering 4 turn and Gathering 6, the story holds 60 seconds or until [GO ON] is tapped. Today it holds about 5 seconds.
16. **Garrick's missing answers.** Add his three Gathering 5 answers from canon ("Meira thought so.", "The page says 'whose.' It doesn't say who.", "I'm not of your blood.") and the two Week 4 routes. Then update the server function.
17. **Gathering 4's pen Ask board, online.** It holds "Did your people kill her?" "Yes."
18. **A timed play of the finale** with 2, 4 and 6 friends, to check the 20–30 minutes. Its passages may move on faster than people read.

## D. Your decisions
19. **The chant rule.** At Gathering 6 the chant counts "more than half of the faithful" (episode file) or "of the enemies" (Core Rules). I'd count the faithful.
20. **The final act goes to one random friend.** Several auditors disliked this. I'd keep it: it is canon, and the table talks first.
21. **The six-fragment map every week.** Two auditors want it retired. I'd keep it, because the maps are the twist.
22. **A lighter Campfire.** Fold the meaning pin into "the case so far", and make the riddle something you choose to open. I'd do it after a real playtest.

## What the auditors got right, and what they didn't
- **Grok** was the most accurate. **ChatGPT** was good on structure, but many of its biggest claims came from errors in my play-through document. **DeepSeek** was good on patterns and weak on facts. **Meta** did a sound check of Garrick's Recap. **Perplexity** and **Qwen** were shallow, and their fixes would often break the secret or the rule that both branches reach the same plot.
- **Most of the "Big" problems the auditors raised were not real:** fragments locked behind wins, the map making the roll harder, the countdown, HOLD IT BACK skipping the cup. They came from how the document laid out branches. Item 6 fixes that.
