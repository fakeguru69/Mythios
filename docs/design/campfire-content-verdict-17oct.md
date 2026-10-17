# The Campfire's content: the verdict (17 Oct, for Fake Guru)

Fake Guru: "audit if the content are truly meaningful and the reveals are interesting. If the content doesn't offer payoff (or superficial), players won't bother to engage. So the content and mechanics need their own separate rigorous audit."

Three independent checks read all 36 nights against the episode files, the Gatherings and the finale: `docs/audits/campfire-content-17oct/weeks-1-2.md`, `weeks-3-4.md`, `weeks-5-6.md`. Claude checked their key claims before using them.

## 1. The scores (fork / clues / payoff, out of 5)

| | Worth a real discussion (4–5) | Settled by the chapter or the next morning | Never answered |
|---|---|---|---|
| Weeks 1–2 | W1D1, W1D5, W2D2, W2D5 | W1D2, W1D4, W1D6, W2D1, W2D4 | W1D3, W2D3 |
| Weeks 3–4 | W3D2, W4D1, W4D4, W4D6 | W3D1, W3D4, W3D5, W4D5 (W3D6: a choice the story never lets you make) | W4D1 |
| Weeks 5–6 | W5D5, W6D6 | W5D1, W5D6, W6D1 (W6D3 half-given) | W5D2, W6D5 |

About **a third of the nights' questions are dead on arrival**, and about one in seven is never answered at all. Roughly ten nights hold a question two friends would really want to argue about.

## 2. What the checks found (agreed by all three)

1. **Nothing a player pins or finds ever pays off.** The week's line is read back at the Gathering's opening; the night's readings are never read back, least of all when the story answers them. Most clues (the notched stick, the worn path, the grey wool, the second ring) never return. Players will learn within a week that the fire is decoration.
2. **The questions follow the chase, not the mystery.** The real investigation sits elsewhere:
   - **The fragment's meaning questions are the best content in the fire.** "Some locks already know their key. Whose key?", "One stayed close. Close to what?", "Marked by whom?" are paid off, often brilliantly, at the Gatherings and the finale (11 of 12 in Weeks 3–4 alone). Today they sit in a side slot, asked only once both words are found.
   - **The best questions are often in the Pull,** not the fork: who heard the map read aloud (W1D6, W2D6, W3D6), why anyone would watch an empty tower (W4D5), why the lock opened for us (W2D3).
3. **The clue leans are unreliable.** About a dozen of the 108 are wrong, loose or self-contradicting (for example W1D1 "Two sets of boots", 6-1-2, 6-5-2, 4-1-1, 5-5-1). This matters to the redesign: Garrick may only use a lean once it has been checked.
4. **The nudges are mostly filler.** Most repeat the fork, the day's Challenge or a notice line; only a few point at real evidence. Several callbacks retell the chapter instead of linking days.
5. **Tone slips:** Week 1 Day 4 is a quiet night but opens with a quip (checked); Week 2 Day 4 jokes ("Bring a lantern. Bring two.") while a child lies bound.
6. **Story risks:** W4D1 invites suspicion of someone in the room (Garrick is at the party's shoulder); W4D4 steers three ways at once towards the answer Gathering 5 lets the party get wrong; W6D3's second reading gives away Day 4's turn. None names the secret.

**One check corrected:** "What would change your mind?" is not missing; it is one of Garrick's rotating lines after a pin (`campfireDaysData.ts` line 70). It is simply not guaranteed.

**Fixed today (plainly against canon):** the fire's copy of the day's Pull was older than the chapters' on 11 nights (W1D6 said "by morning", canon "by nightfall"; W5D2 lacked "The heartbeat"). Brought in line, live and checked (`0090`).

## 3. What this means for the redesign

The new screen (pinned strip, shared conversation, your next step) solves *how* the fire is presented. This verdict says *what* it presents needs rebuilding too, or the best screen will still hold a dull night.

1. **The centre of the night becomes the question the day really leaves open.** For each of the 36 nights, pick it from what the day actually raises (the Pull, the fragment's meaning, an open fork), never one the chapter has already answered.
2. **One chain a week.** Each night's question narrows the week's question, and the Gathering answers it. Week 4's question changes, since Gathering 3 already answers "What do they need Joss for?".
3. **Payoff at the moment of truth.** Each question records where the story answers it. When a friend reaches that moment (a chapter line or a Gathering beat), they see what each friend pinned back then, by name and in their own words, never marked right or wrong: "On Day 2, Mei pinned: *they knew him personally.*" This is what makes pinning worth doing.
4. **Clues that matter.** Every clue's lean is checked, and each clue either bears on the night's question or is cut; the dead-end threads are paid off or cut.
5. **The nudge becomes evidence-pointing:** each one names a specific clue or notice line and asks what it means.
6. **Tone and story risks fixed** as listed above.

This is story writing (36 questions, the leans, nudges, callbacks), so it needs your approval. Suggested order: Week 1 first, in full, as the sample; then the rest week by week, as with the storybook pass.

## 4. Decisions for Fake Guru
1. Rebuild the fire's content as above (the open question at the centre, one chain a week, payoff at the moment of truth)? Yes / change.
2. Start with Week 1 as a sample for your approval? Yes / no.
3. Garrick uses the clue leans only after every lean has been checked (this replaces the earlier decision 2 in `campfire-chat-design-17oct.md`). Yes / no.
