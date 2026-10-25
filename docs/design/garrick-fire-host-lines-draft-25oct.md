# Garrick at the fire: three hosting lines, drafted for Fake Guru (25 Oct 2026)

**Approved 25 Oct (Fake Guru: "Proceed with your suggestion"): the (a) line each time, built in `OnlineCampfire.tsx`, kept on the server by migration `0130`.** In a party of one he says none of them: each needs two friends at the fire. The split line is seen only by a friend who has pinned, so nobody learns who leans which way before choosing.

Campfire v3 §7 planned that Garrick, who hosts the fire, would speak at these moments. Some are built:
- the night's question;
- a nudge naming a friend;
- the follow-up once a certain piece is laid;
- "Good. Argue it out. I listen better than I talk." when the fire splits;
- "Everyone leans the same way. What would it take to be wrong?" when it agrees too fast.

Three are not built. They are drafted below. Fake Guru approves the words before anything is built, because they are new Garrick lines.

Each follows Garrick's rules: no promises, no predictions, no denials, no sarcasm, none of the banned words, and nothing invented about himself. He hosts the talk and never weighs in on the case: no clue is called right or wrong. `{friend}`, `{piece}`, `{A}` and `{B}` are filled with real names and the clue's title. He says each line at most once a night, to the party, in the fire's thread.

My pick is first each time.

## 1. A friend has laid nothing while the others talk

When: two or more pieces are on the table, and a friend who is at the fire has laid none.

- (a) *"{friend}, you've been quiet all night. Whatever you brought back keeps better on the table than in your coat."*
- (b) *"{friend}. The fire's warm enough for one more piece, if you have one."*

## 2. A piece is on the table and nobody has answered it

When: a piece has sat for a while with no Agree, no Doubt and no message after it.

- (a) *"{friend}'s piece has been on the table a while: {piece}. Nobody's picked it up yet."*
- (b) *"That's {piece}, from {friend}. It's waiting on somebody's opinion."*

## 3. The fire splits

When: friends have pinned different answers to tonight's question. This line comes after "Good. Argue it out…", aimed at two of them by name.

- (a) *"{A} leans one way and {B} the other. {B}, what would it take to bring you round?"*
- (b) *"{A}, you've heard {B}. Tell them what they're missing."*

## To build, once approved

The approved lines go into the fire screen (`src/online/OnlineCampfire.tsx`, beside the lines already built). Each is said once and kept, like his other fire lines (`fire_said`). The data that decides when to say them is already on the server (`fire_table`): who has laid what, the reactions, and the pins. The lines are checked against the banned-phrase list, tested on the local copy, then put on GitHub and Supabase in the same piece.
