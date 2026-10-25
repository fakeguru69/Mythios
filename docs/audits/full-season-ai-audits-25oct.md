# Three outside AI audits of the whole season, 25 Oct 2026: what was true

Fake Guru pasted three reports from another AI: a full-season audit, a two-player play-test of Week 1, and a "general play" verdict. Every claim was checked against the game's files and the live server before anything changed.

## Not true (no change)

- **"The live server serves a different Week 1 (Old Gregor, the Vespers Bell)."** False. The live chapters hold no such story, and Week 1 live has Tamsin. Live and local were md5-matched today.
- **The whole third report** (a ledger in your own handwriting, Venn, a fen-hulk, nightly anagrams): none of it is in the game. It describes another story.
- **Garrick's "big grey horse" on Week 2 Day 1:** there is no grey horse in Week 2.
- **Week 1 Day 1's "armed raiders" against "not one blade turned on you to kill":** Day 1 is one silent man, and its own Notice says "He held back. Every blow came a half-beat late."
- **Numbers quoted** (weekday DC 9 to 12, One breath "+2"): out of date or wrong. The weekday DC is 6, 7, 7, 8, 9 and 9, and GO OUT NOW is +4.

## True, but kept, with the reason

- **Gathering 5's second Match only if the roll-call was won.** Canon on purpose: its line is the Verse the watchman says himself, and he says it only if the roll-call was answered (Core Rules §5: the United Effort changes something the party can see).
- **Gathering 4 repeats "This was never about you."** Kept on 25 Oct (Phase 2, item 15): canon turns the line over on purpose.
- **Gathering 6 has no One breath before the Hawser.** Its Act is the model One breath was built on, and the finale's choice is the Act.
- **Weeks 2 to 6 still have one stating pair a night at the fire, no road pairs, and six nights with none.** This is the plan: Phase 4 brings the Week 1 pilot to Weeks 2 to 6 after the Week 1 play-test. Some of the empty nights are quiet nights on purpose.
- **A party of two faces the same United Effort bars as four (100).** The numbers pass found the job won about as often at any party size: every roll has the same odds, and only the number of turns differs. This is Fake Guru's number to change.
- **Garrick brings the missing half only when it is a last-light lead,** never a road find. He can walk a lead nobody took, but he cannot have taken a friend's road.
- **"The road will ask for all six" in Session Zero** is the rulebook's line (Core Rules §7). It means the six Attributes.

## True, and fixed (migration `0138`, Episodes 1 and 6, `smallPartyLines.ts`, Session Zero)

| What | Fix |
|---|---|
| W1D5, two friends: "Dev's hand is on your arm… Dev does not shake it off." | "…You do not shake it off." (the short version now covers both sentences) |
| W1D2, two friends: "The strangers watch you get it wrong", and "with strangers watching" | "{friend} watches you get it wrong" |
| Every One breath, two friends: "Everyone else: you have thirty seconds" | "You have thirty seconds." The Gathering's lines are filled on the server, so the two-friend versions never reached them; `g_fill` now has them. |
| Gathering 4, two friends: "Two of you take his shoulders. Somebody finds a knife", and its fail line | "One of you takes his shoulders. The other finds a knife…"; "The one holding his shoulders…" |
| Gathering 1, a split fire on Day 6 said nothing. With two friends, any disagreement is a split. | "Last night by the fire you could not agree why your names were on that list. The wall gives its own answer." (`g_week_facts` notes 'S') |
| Gathering 6, Craft: "The knot at your wrist… You watched it tied a week ago" | "The knot across your palm is the one at Tamsin's. You watched him tie it a week ago…" (the palms were bound at Gathering 5, a week before) |
| Session Zero: "Six companions, six callings" | "Six callings, and one shared campfire." |

## Decided (Fake Guru: "use your judgement"; Claude decided)

- **The bars for two friends stay at 100.** Every roll has the same odds at any size; only the number of turns differs, and the numbers pass found the job won about as often.
- **One breath opens as soon as every other friend has advised** (`0139`), at any party size and for Gathering 6's act.
- **No content note added.** The invite already shows the premise ("In the hill villages, children are going missing, and nobody is looking for them."). Saying that every child comes home would give the season away and reassure before a risk, which the house rules forbid.

## Worth considering later (for Fake Guru)

- Phase 4: the pilot's asking pairs and road pairs for Weeks 2 to 6, after the Week 1 play-test.
