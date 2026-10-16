# Garrick's morning lines: proposal (16 Oct 2026)

**For Fake Guru to approve.** Nothing here is on the server yet. Once approved: set `GARRICK_MORNING_APPROVED = true` in `src/data/garrickMorningLines.ts`, run `npx tsx scripts/gen-garrick-morning-sql.ts`, apply the output as a new migration.

**What it is.** Canon (Core Rules §1) says Garrick "may add a line or two a day" in the party chat, but gives no list. Fake Guru (16 Oct): one line a day, posted when the day opens at 5:00am. The server (`garrick_morning`, migration `0043`, applied) posts it once for the whole party, stamped 5:00am, when the first friend opens the app or the chat that day.

**How the lines were written.**
- Likeable and well written (Fake Guru, 16 Oct): a small kindness and a little of the world in each, never a curt order. (The first draft read as orders and was rewritten.)
- Small talk only: food, boots, the weather, the road, the night's watch. Nothing about the plot, the Stones, Meira or himself.
- Every line is true where it stands, with no promise or prediction ("you'll", "it will"), and none of the banned phrases. All pass the chat filter.
- No word before its first-use day (no "king", "five", "Highwall", "heartbeat" and so on).
- Nothing from the day's own chapter before it is read. Each line rests on what the party already knows: the last Pull, the last night's camp.
- None on Week 1 Days 1 and 2: the chat opens on Day 2, when the party first meets him.
- None on Day 1 of Weeks 2 to 6: each of those chapters picks up in the middle of the Gathering's last scene, and a cheerful morning line would cut into it. (Five more lines can be added if wanted.)
- No line repeats one he says in the story or at the fire. "A long day west" echoes the narrator's Week 3 Day 1 Pull on purpose.

| # | Day | Place | Line |
|---|---|---|---|
| 1 | W1 D3 | The Widow's Tooth | I've wrapped the heel of yesterday's loaf and a wedge of cheese for each of you. Two hours to the rock, and nobody walks well on an empty stomach. |
| 2 | W1 D4 | Fenmark | The dew's heavy on the bracken this morning. Tuck your trousers into your boots, or walk wet to the knee. |
| 3 | W1 D5 | The old charcoal camp | Frost on the cart ruts this morning, thin as paper. There's tea in the pot, and it's still hot. |
| 4 | W1 D6 | The Low Ford | Long road north today. I've filled the flasks and wrapped bread for the walking. |
| 5 | W2 D2 | The mill | An hour to the mill. Eat your porridge while it steams. Cold porridge is a sad thing on a grey morning. |
| 6 | W2 D3 | Upriver | Rain's been at it half the night. I've hung your socks by the fire. Warm, if not quite dry. |
| 7 | W2 D4 | The shaft in the hillside | The path climbs steeply from here, and the rocks are slick from the rain. Walk where I walk, and keep a hand free. |
| 8 | W2 D5 | The hillside by night | Small fire this morning, and close to the rock. Smoke carries a long way on a hillside, and we have neighbours. |
| 9 | W2 D6 | The lip of the shaft | First watch gets the warm cup. I've kept the kettle going all night for it. |
| 10 | W3 D2 | Ashcombe | A long day west, to the edge of the burned country. There's honey for the oats this morning. Take a second spoon. |
| 11 | W3 D3 | The Blackglass | The ground here keeps its warmth all night, like a banked hearth. Fill your flasks at the hot spring. The black road is a dry one. |
| 12 | W3 D4 | The black ridges | Ash in the air this morning, fine as flour. A cloth over your mouth makes the walking easier. |
| 13 | W3 D5 | The shepherd's hut | Up before the light, quiet as you can. I've wrapped bread for the walk, so nobody has to stop and eat. |
| 14 | W3 D6 | The cairn | The highest ridge is a long climb. Short steps and steady breath. I walk at the back today. |
| 15 | W4 D2 | The north road | Hot oats before the north road, with honey in them. Nobody slept well. Eat anyway. |
| 16 | W4 D3 | Reedham | Show me any cuts from the ford before we set off. A clean cut is a quick one to mend. |
| 17 | W4 D4 | Old Reedham | Mist on the Stillwater this morning, lying flat as a sheet. Keep your cloak close. Lake air gets into the bones. |
| 18 | W4 D5 | The reed island | Fog so thick this morning I can barely see my own hand. On the water, keep within arm's reach of each other. |
| 19 | W4 D6 | The tower at night | Sleep while the sun's up if you can. I've checked the oars and the oarlocks. Tonight is for rowing. |
| 20 | W5 D2 | The old kingdom's road | Two days of road ahead, and old paving is hard on the feet. Bind them now, before the blisters start, not after. |
| 21 | W5 D3 | The herald's gate | Last of the good bread this morning, and a little cheese. I've cut it into fair shares. |
| 22 | W5 D4 | The dead streets | This city is so quiet you can hear the dust settle. Soft boots and low voices today. |
| 23 | W5 D5 | Below the hall | There's broth left from last night's fire, small as it was. Drink it while it's warm. |
| 24 | W5 D6 | The wall again | Back to the wall this morning, the long way round. Stay together. This city has too many corners. |
| 25 | W6 D2 | The barracks under the wall (Five nights) | Whispers only this morning. Sound carries in these walls, and I'd like our hiding place to stay ours. |
| 26 | W6 D3 | The great square (Four nights) | Sleep through the day if you can. I'm on watch. The work is after dark. |
| 27 | W6 D4 | The hill behind the hall (Three nights) | Grey morning, the colour of old ash. Eat slowly, and keep your hands warm under your arms. |
| 28 | W6 D5 | The moon-tower (Two nights) | Up, all of you. Stretch the cold out of your legs first. Stiff legs make poor climbers. |
| 29 | W6 D6 | The crack in the hill (One night) | I've cooked everything left in the packs. Eat it all. There's nothing to save it for. |
