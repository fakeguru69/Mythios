# Garrick's morning lines: proposal (16 Oct 2026)

**For Fake Guru to approve.** Nothing here is on the server yet. Once approved: set `GARRICK_MORNING_APPROVED = true` in `src/data/garrickMorningLines.ts`, run `npx tsx scripts/gen-garrick-morning-sql.ts`, apply the output as a new migration.

**What it is.** Canon (Core Rules §1) says Garrick "may add a line or two a day" in the party chat, but gives no list. Fake Guru (16 Oct): one line a day, posted when the day opens at 5:00am. The server (`garrick_morning`, migration `0043`, applied) posts it once for the whole party, stamped 5:00am, when the first friend opens the app or the chat that day.

**How the lines were written.**
- Small talk only: food, boots, the weather, the road, the night's watch. Nothing about the plot, the Stones, Meira or himself.
- Every line is true where it stands, with no promise or prediction ("you'll", "it will"), and none of the banned phrases. All pass the chat filter.
- No word before its first-use day (no "king", "five", "Highwall", "heartbeat" and so on).
- Nothing from the day's own chapter before it is read. Each line rests on what the party already knows: the last Pull, the last night's camp.
- None on Week 1 Days 1 and 2: the chat opens on Day 2, when the party first meets him.
- None on Day 1 of Weeks 2 to 6: each of those chapters picks up in the middle of the Gathering's last scene, and a cheerful morning line would cut into it. (Five more lines can be added if wanted.)
- No line repeats one he says in the story or at the fire. "A long day west" echoes the narrator's Week 3 Day 1 Pull on purpose.

| # | Day | Place | Line |
|---|---|---|---|
| 1 | W1 D3 | The Widow's Tooth | Bread's in the bag by the door. Take some for the road. |
| 2 | W1 D4 | Fenmark | Eat standing up if you must, but eat. |
| 3 | W1 D5 | The old charcoal camp | Cold morning. Keep your hands in your sleeves till the sun's up. |
| 4 | W1 D6 | The Low Ford | Fill every flask before we set off. It's a long road north. |
| 5 | W2 D2 | The mill | Porridge first. Then the mill. |
| 6 | W2 D3 | Upriver | Wet night. Wring out your socks before your boots go on. |
| 7 | W2 D4 | The shaft in the hillside | Stay close today. The path is narrow, and it climbs. |
| 8 | W2 D5 | The hillside by night | Keep the fire small this morning. Smoke carries on a hillside. |
| 9 | W2 D6 | The lip of the shaft | Sleep in turns today. One of us awake at all times. |
| 10 | W3 D2 | Ashcombe | A long day west. Eat now, and again at noon. |
| 11 | W3 D3 | The Blackglass | Half a day up the black road. Take water, and plenty of it. |
| 12 | W3 D4 | The black ridges | Tie a cloth over your mouth today. The ash gets into everything. |
| 13 | W3 D5 | The shepherd's hut | Up before the light, all of you. Quietly. |
| 14 | W3 D6 | The cairn | A steep climb today. Keep a steady pace and save your breath. |
| 15 | W4 D2 | The north road | Long road today. Eat while it's hot. |
| 16 | W4 D3 | Reedham | Any cuts from yesterday, show me before we go. Better cleaned now than later. |
| 17 | W4 D4 | Old Reedham | Lake air gets into your bones. Keep your cloak on. |
| 18 | W4 D5 | The reed island | Thick morning. Stay within arm's reach of each other. |
| 19 | W4 D6 | The tower at night | Rest today while you can. Tonight is for rowing. |
| 20 | W5 D2 | The old kingdom's road | Two days on foot. Bind your feet before the blisters start. |
| 21 | W5 D3 | The herald's gate | Last of the good bread this morning. Share it out fair. |
| 22 | W5 D4 | The dead streets | Quiet place, this. Keep your voices down and your boots soft. |
| 23 | W5 D5 | Below the hall | Eat something hot while we have a fire. |
| 24 | W5 D6 | The wall again | Back to the wall this morning. Stay together. |
| 25 | W6 D2 | The barracks under the wall (Five nights) | Whispers only this morning. Sound carries in these walls. |
| 26 | W6 D3 | The great square (Four nights) | Sleep through the day if you can. The work is after dark. |
| 27 | W6 D4 | The hill behind the hall (Three nights) | Grey morning. Eat slowly and keep warm. |
| 28 | W6 D5 | The moon-tower (Two nights) | Up, all of you. Shake the cold out of your legs. |
| 29 | W6 D6 | The crack in the hill (One night) | Eat well this morning. All of it. |
