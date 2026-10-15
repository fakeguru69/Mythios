# Numbers pass, 15 Oct 2026

**Decided 15 Oct 2026 (Fake Guru, "as per your suggestion"): every recommendation below is applied.** Proposal A is in the game (`EPISODE_NUMBERS`), the open amounts are closed in `economy.ts`, and Core Rules §4, §12 and §15 are updated. The simulator's "as built" row now includes Proposal A.

Fake Guru gave the go on 14 Oct; it runs after the rule fixes, so it tests the game as built.

- **Simulator:** `simulators/numbers-pass-15oct.ts`. Run it with `npx tsx simulators/numbers-pass-15oct.ts 2000`. It reads the 36 canon days, the six Gatherings, the Gathering battle engine, tiers, growth, DCs and `economy.ts` straight from the game, so it tests what is built, not a copy.
- **Full output:** `docs/numbers-pass-15oct-output.md` (2,000 seasons per row).

## 1. The calculator is checked against canon

With the old damage rule (a d20 × 2), the calculator gives exactly Core Rules §12's single-fight table. For example: 79 / 87 / 93 / 97 / 99% in Episode 1, and 73% when the enemy strikes first (§12: "73%, not 79%"). That table turns out to use the **Gathering** enemy.

## 2. What the new damage rule (margin × 5, 14 Oct) did

The hit's margin × 5 makes the stronger side win more often and makes fights shorter.

**A weekday fight, both gear tracks at the same level, the player striking first:**

| Week | L1 new / old | L2 new / old | L3 new / old | Rounds new / old |
|---|---|---|---|---|
| 1 | 97% / 87% | 100% / 93% | 100% / 97% | 3–5 / 6–8 |
| 2 | 90% / 79% | 97% / 87% | 100% / 93% | 4–6 / 7–8 |
| 3–4 | 76% / 67% | 90% / 79% | 97% / 87% | 4–6 / 7–8 |
| 5–6 | 54% / 54% | 76% / 67% | 90% / 79% | 5–6 / 8 |

**Over a season** (players who buy gear as they can), weekday fights are now won **95–99%** of the time. Under the old rule it was 84–90%. Gold earned rises by about 200 to 1,100g a season, almost all of it the fragment-word gold that the 5 Oct run left out.

**A Gathering fight** became easier when your gear is ahead of the enemy and harder when it's behind. At Level 1 in Week 5 or 6 you now win 32% (it was 40%); at Level 3, 76% (it was 67%).

**Fight length** is now 3 to 6 taps, against 6 to 8. That suits one tap per round.

## 3. Proposal A: weekday and Gathering enemies one point stronger (DEF +1, ATK +1)

This keeps canon's rule that the Gathering enemy is one higher than the weekday enemy.

| | Weekday DEF / ATK by week | Gathering DEF / ATK by week |
|---|---|---|
| Now (§12) | 21/14, 22/15, 23/16, 23/16, 24/17, 24/17 | 22/15, 23/16, 24/17, 24/17, 25/18, 25/18 |
| Proposal A | 22/15, 23/16, 24/17, 24/17, 25/18, 25/18 | 23/16, 24/17, 25/18, 25/18, 26/19, 26/19 |

Season results, four friends who all play the same way:

| Player | Weekday fights won (now → A; old rule) | Own Gathering fight survived (now → A) | Party wins the Battle (now → A) |
|---|---|---|---|
| Daily (6 days a week) | 99% → 95%; old 90% | 98% → 92% | 100% → 100% |
| Regular (4) | 98% → 92%; old 88% | 97% → 87% | 100% → 100% |
| Occasional (2) | 96% → 87%; old 85% | 92% → 76% | 100% → 99% |
| Rare (1) | 95% → 85%; old 84% | 87% → 67% | 100% → 96% |

Gold and gear barely move (Daily earns about 20,900g, and both gear tracks reach Level 5). Weekday fights come back to about their old difficulty. A player who has fallen behind feels the Gathering again, as §12 intends ("the Gatherings should feel dangerous to a party that has not kept up"). The party still almost always wins, because friends whose own foe is down help the others.

I tested two other options:
- **Weekday +1 only:** weekday fights 85–94%, Gatherings unchanged. But it breaks the "one higher" rule.
- **Weekday +2:** weekday fights 67–84%, which is harder than they ever were.

**Recommendation: Proposal A.**

## 4. The open amounts (Core Rules §15 and `economy.ts` "PENDING")

| Item | What the game does now | Finding | Recommendation |
|---|---|---|---|
| §15.1 A failed Challenge costs nothing (build) vs −150g (§12) | −150g (§12) | With 0: a Daily player keeps about 1,500g more, and failing carries no risk at all. Regular players finish their gear 100% of the time (96% now). | **Keep −150g.** A failure should cost something, and the game already says so on the card. |
| §15.4 Fan Out gold | 0 (approved 14 Oct: the clue and the hint are the reward) | Nothing to balance. | **Close it at 0.** |
| §15.5 Riddle gold (+10 / +15) | 0 (the Campfire pays nothing; canon: "No gold amount is set") | The riddle is shared, so paying gold for it rewards the fastest typist. | **Close it at 0** and delete the two unused constants. |
| Hidden roadside cache (+25g) | Not in the game | No canon source. | **Retire it** (delete the constant). |
| §15.6 W6D3's +1 Agility / +1 Charm | Not in the game (its data is unused) | No canon source in the episode file's rules. | **Retire it.** |
| §15.7 The map bonus (+2 on the Approach) | +2 | It raises the Approach pass rate by 10 points (Week 1, Novice: 60% → 70%). The season barely changes, so it costs nothing in balance and gives the fragment puzzle a real reward. | **Keep +2.** |
| Fragment word gold (+25g a word) | +25g | It adds about 900g to a Daily player's season. It was left out of the 5 Oct run; included now. | **Keep.** |
| Match 100g ("every friend right") | Not paid yet | Can't be judged until friends play for real. | **With multiplayer** (already agreed). |

## 5. What stays as it is

- **First-roll Challenge pass:** 56–70% across the season, inside §12's aim of 55–75%.
- **Gear prices:** a Daily player reaches Level 5 on both tracks every time, and a Regular player 95–96% of the time.
- **Spare gold** (Daily about 7,000g) still goes on Relics, as §12 intends.

## 6. One assumption to know

The simulator puts **every friend at every Gathering**. §12's 5 Oct table has much lower gold for Rare players (4,500g against 9,400g here). With the old rules and this assumption, the simulator also gives 9,200g, so the gap comes from Gathering attendance, not from any rule. If Rare players also miss Gatherings, their gold and gear drop: every Gathering missed costs about 1,200g (the Battle, the United Effort and the Match).
