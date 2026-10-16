# Garrick's morning lines: proposal (16 Oct 2026)

**For Fake Guru to approve.** Nothing here is on the server yet. Once approved: set `GARRICK_MORNING_APPROVED = true` in `src/data/garrickMorningLines.ts`, run `npx tsx scripts/gen-garrick-morning-sql.ts`, apply the output as a new migration.

**What it is.** Canon (Core Rules §1) says Garrick "may add a line or two a day" in the party chat, but gives no list. Fake Guru (16 Oct): one line a day, posted when the day opens at 5:00am. The server (`garrick_morning`, migration `0043`, applied) posts it once for the whole party, stamped 5:00am, when the first friend opens the app or the chat that day.

**How the lines were written.** Each line is one chat message from him.
- Likeable and well written (Fake Guru, 16 Oct): pleasant, with light humour; a small kindness, a dry smile and a little of the world in each, never a curt order. Not rushed one-liners: each is a short passage with the morning in it. (The first draft read as curt orders; rewritten three times.)
- Small talk only: food, boots, the weather, the road, the night's watch. Nothing about the plot, the Stones, Meira or himself.
- Every line is true where it stands, with no promise or prediction ("you'll", "it will"), and none of the banned phrases. All pass the chat filter.
- No word before its first-use day (no "king", "five", "Highwall", "heartbeat" and so on).
- Nothing from the day's own chapter before it is read. Each line rests on what the party already knows: the last Pull, the last night's camp.
- None on Week 1 Days 1 and 2: the chat opens on Day 2, when the party first meets him.
- None on Day 1 of Weeks 2 to 6: each of those chapters picks up in the middle of the Gathering's last scene, and a cheerful morning line would cut into it. (Five more lines can be added if wanted.)
- No line repeats one he says in the story or at the fire. "A long day west" echoes the narrator's Week 3 Day 1 Pull on purpose.

| # | Day | Place | Line |
|---|---|---|---|
| 1 | W1 D3 | The Widow's Tooth | Morning. The fire's been going an hour, and the kitchen smells of yesterday's loaf toasting on the hob. I've wrapped a heel of it and a wedge of cheese for each of you, in cloth, so it keeps. Two hours to the rock, and an empty stomach makes every one of them longer. |
| 2 | W1 D4 | Fenmark | The dew came down heavy in the night, and every frond of bracken between here and the road is holding a cupful of it. Tuck your trousers into your boots, unless you fancy squelching all morning. There's tea, and I've put a little honey in it. |
| 3 | W1 D5 | The old charcoal camp | Frost on the cart ruts this morning, thin as paper, and it crackles when you step on it. The kettle's been singing since before the light. Tea's in the pot, strong enough to stand a spoon in, and nobody leaves until their hands are warm. |
| 4 | W1 D6 | The Low Ford | Long road north today, and a cold one, by the look of the sky. I've filled the flasks and packed bread for the walking. The bread's yesterday's, but it's honest, and it travels better than I do. |
| 5 | W2 D2 | The mill | An hour to the mill, and the mist is still lying in the bottom of the valley like milk in a saucer. Porridge is on, with a pinch of salt, the way it should be. Eat it while it steams. Cold porridge is a sorry thing on a grey morning, and I made this one with care. |
| 6 | W2 D3 | Upriver | Rain's been at it half the night, steady as a drum, and the ground outside has turned to soup. I've hung your socks along the fire like bunting. Warm, if not quite dry. Don't ask me whose are whose; I've stopped guessing. |
| 7 | W2 D4 | The shaft in the hillside | The path climbs steeply from here, and every rock on it is still slick from the rain. Walk where I walk, slow and sure, with one hand free for the hillside. And if I slip, do me the kindness of stepping somewhere else. |
| 8 | W2 D5 | The hillside by night | Small fire this morning, tucked in under the rock where the wind can't take the smoke. Smoke carries a long way on an open hillside, and we have neighbours. Not the sort you borrow sugar from. Toast your bread quickly and keep your voices low. |
| 9 | W2 D6 | The lip of the shaft | First watch gets the warm cup. I've kept the kettle going all night for the honour, feeding the fire one stick at a time so it wouldn't show. The rest of you, sleep while you can, in turns. One of us awake at all times. |
| 10 | W3 D2 | Ashcombe | A long day west today, out to where the green hills give up and the burned country begins. There's honey for the oats this morning; I found a jar at the bottom of the pack. Take a second spoon. The jar's deep, and the road is long. |
| 11 | W3 D3 | The Blackglass | The ground here keeps its warmth all night, like a hearth banked for the morning. Best bed I've had in a week, and nobody charged me for it. Fill your flasks at the hot spring before we go. The black road is a dry one, and the water here comes out ready for tea. |
| 12 | W3 D4 | The black ridges | There's ash on the air this morning, fine as flour and none of it fit for bread. It settles on your sleeves and in the creases of your hands. Tie a cloth over your mouth before we set off. It makes the walking easier, and the conversation is none the worse for it. |
| 13 | W3 D5 | The shepherd's hut | Up before the light, all of you, quiet as you can. I've wrapped bread and a little cheese for the walk, so nobody has to stop to eat, and nobody can say they went hungry. Boots on, laces tight. The ridges are loose underfoot in the dark. |
| 14 | W3 D6 | The cairn | The highest ridge is a long climb, and the cairn on top is further than it looks from here. Short steps and steady breath. Stop when you need to, and drink when you stop. I walk at the back today. Somebody has to admire the view. |
| 15 | W4 D2 | The north road | Hot oats before the north road, with honey stirred in. Nobody slept well; I could tell from the snoring, or the lack of it. Eat anyway. It helps more than you'd think, and the road is long and cold. |
| 16 | W4 D3 | Reedham | Show me any cuts from the ford before we set off, however small. I've a needle, clean water and a steady hand. A clean cut is a quick one to mend, and a dirty one is a week of grumbling. |
| 17 | W4 D4 | Old Reedham | Mist on the Stillwater this morning, lying flat across the water like a sheet on a bed nobody's slept in. The reeds are grey with it. Keep your cloak close. Lake air gets into the bones, and mine have complaints enough already. |
| 18 | W4 D5 | The reed island | Fog so thick this morning I can barely see my own hand, and the lake has gone so still you can hear a drip land. On the water, keep within arm's reach of each other, and speak up before you sneeze. Sound travels strangely in fog. |
| 19 | W4 D6 | The tower at night | Sleep while the sun's up, if you can. Tonight is for rowing, and rowing goes better rested. I've made up a bed of cloaks in the dry corner, and the kettle's on for the first one awake. |
| 20 | W5 D2 | The old kingdom's road | Two days of road ahead, and the old paving is hard on the feet, every slab of it laid for marching boots. Bind your feet now, before the blisters start, not after. Feet hold grudges, and they win every argument. |
| 21 | W5 D3 | The herald's gate | Last of the good bread this morning, and a little cheese, and three dried apples I'd been saving. I've cut it all into fair shares, and I measured twice. Eat slowly and make it last. |
| 22 | W5 D4 | The dead streets | This city is so quiet you can hear the dust settle on the windowsills. Soft boots and low voices today, and stay where I can see you. A place this empty makes a man want to whistle, so I'd thank you all to stop me if I start. |
| 23 | W5 D5 | Below the hall | There's broth left from last night's fire, small as it was, and I've kept it warm in the embers. Drink it slowly. It's the best thing in this city, and I say that as the man who made it. |
| 24 | W5 D6 | The wall again | Back to the wall this morning, the long way round. Stay together, and count heads at every corner. This city has too many corners, and not one decent inn among them. |
| 25 | W6 D2 | The barracks under the wall (Five nights) | Whispers only this morning. Sound carries in these walls, and I'd like our hiding place to stay ours. There's cold bread wrapped by the door, and the water skin is full. Eat quietly. Chew quietly, if you can manage it. |
| 26 | W6 D3 | The great square (Four nights) | Sleep through the day if you can. I'm on watch, and the wall and I are getting along. The work is after dark, and it goes better on a proper sleep, even one taken in daylight. |
| 27 | W6 D4 | The hill behind the hall (Three nights) | Grey morning, the colour of old ash, and the light can't seem to make up its mind. Eat slowly, and keep your hands warm under your arms. It's not dignified, but it works. |
| 28 | W6 D5 | The moon-tower (Two nights) | Up, all of you. Stretch the cold out of your legs before you go anywhere. Stiff legs make poor climbers and worse company. There's tea, of a sort. I'd rather not say what's in it. |
| 29 | W6 D6 | The crack in the hill (One night) | I've cooked everything left in the packs: the end of the bacon, the last of the oats, the onion we've carried since the lake. Eat it all. There's nothing to save it for. |
