// Garrick's morning line in the party chat (Core Rules §1: "He replies when spoken to and may add a line or two a day").
// One line, posted once for the whole party when the day opens at 5:00am (Fake Guru, 16 Oct: "5am").
// Canon has no list of these, so they were written for Fake Guru's approval: docs/design/garrick-morning-lines-proposal.md.
// Likeable and well written (Fake Guru, 16 Oct): pleasant, with light humour; a small kindness, a dry smile and a little
// of the world in each, never an order barked. Not rushed one-liners: a short passage with the morning in it. Exaggerated feelings are fine (canon's "My knees have opinions").
// Small talk only (the road, the food, the weather, the party's own doings), every line true, none of the banned phrases,
// no promise or prediction, no word before its first-use day, nothing from the day's own chapter before it is read.
// None on Week 1 Days 1 and 2 (the chat opens on Day 2, when the party first meets him) and none on a Day 1 from Week 2
// on (each picks up in the middle of the Gathering's last scene). Loaded onto the server by scripts/gen-garrick-morning-sql.ts.

export const GARRICK_MORNING_APPROVED = true; // approved by Fake Guru, 16 Oct ("go with your suggestion")

export const GARRICK_MORNING_LINES: { week: number; day: number; line: string }[] = [
  { week: 1, day: 3, line:
    'Morning. The fire\'s been going an hour, and the kitchen smells of yesterday\'s loaf toasting on the hob. I\'ve wrapped a heel of it and a wedge of cheese for each of you, in cloth, so it keeps. Two hours to the rock, and an empty stomach makes every one of them longer.' },
  { week: 1, day: 4, line:
    'The dew came down heavy in the night, and every frond of bracken between here and the road is holding a cupful of it. Tuck your trousers into your boots, unless you fancy squelching all morning. There\'s tea, and I\'ve put a little honey in it.' },
  { week: 1, day: 5, line:
    'Frost on the cart ruts this morning, thin as paper, and it crackles when you step on it. The kettle\'s been singing since before the light. Tea\'s in the pot, strong enough to stand a spoon in, and nobody leaves until their hands are warm.' },
  { week: 1, day: 6, line:
    'Long road north today, and a cold one, by the look of the sky. I\'ve filled the flasks and packed bread for the walking. The bread\'s yesterday\'s, but it\'s honest, and it travels better than I do.' },

  { week: 2, day: 2, line:
    'An hour to the mill, and the mist is still lying in the bottom of the valley like milk in a saucer. Porridge is on, with a pinch of salt, the way it should be. Eat it while it steams. Cold porridge is a sorry thing on a grey morning, and I made this one with care.' },
  { week: 2, day: 3, line:
    'Rain\'s been at it half the night, steady as a drum, and the ground outside has turned to soup. I\'ve hung your socks along the fire like bunting. Warm, if not quite dry. Don\'t ask me whose are whose; I\'ve stopped guessing.' },
  { week: 2, day: 4, line:
    'The path climbs steeply from here, and every rock on it is still slick from the rain. Walk where I walk, slow and sure, with one hand free for the hillside. And if I slip, do me the kindness of stepping somewhere else.' },
  { week: 2, day: 5, line:
    'Small fire this morning, tucked in under the rock where the wind can\'t take the smoke. Smoke carries a long way on an open hillside, and we have neighbours. Not the sort you borrow sugar from. Toast your bread quickly and keep your voices low.' },
  { week: 2, day: 6, line:
    'First watch gets the warm cup. I\'ve kept the kettle going all night for the honour, feeding the fire one stick at a time so it wouldn\'t show. The rest of you, sleep while you can, in turns. One of us awake at all times.' },

  { week: 3, day: 2, line:
    'A long day west today, out to where the green hills give up and the burned country begins. There\'s honey for the oats this morning; I found a jar at the bottom of the pack. Take a second spoon. The jar\'s deep, and the road is long.' },
  { week: 3, day: 3, line:
    'The ground here keeps its warmth all night, like a hearth banked for the morning. Best bed I\'ve had in a week, and nobody charged me for it. Fill your flasks at the hot spring before we go. The black road is a dry one, and the water here comes out ready for tea.' },
  { week: 3, day: 4, line:
    'There\'s ash on the air this morning, fine as flour and none of it fit for bread. It settles on your sleeves and in the creases of your hands. Tie a cloth over your mouth before we set off. It makes the walking easier, and the conversation is none the worse for it.' },
  { week: 3, day: 5, line:
    'Up before the light, all of you, quiet as you can. I\'ve wrapped bread and a little cheese for the walk, so nobody has to stop to eat, and nobody can say they went hungry. Boots on, laces tight. The ridges are loose underfoot in the dark.' },
  { week: 3, day: 6, line:
    'The highest ridge is a long climb, and the cairn on top is further than it looks from here. Short steps and steady breath. Stop when you need to, and drink when you stop. I walk at the back today. Somebody has to admire the view.' },

  { week: 4, day: 2, line:
    'Hot oats before the north road, with honey stirred in. Nobody slept well; I could tell from the snoring, or the lack of it. Eat anyway. It helps more than you\'d think, and the road is long and cold.' },
  { week: 4, day: 3, line:
    'Show me any cuts from the ford before we set off, however small. I\'ve a needle, clean water and a steady hand. A clean cut is a quick one to mend, and a dirty one is a week of grumbling.' },
  { week: 4, day: 4, line:
    'Mist on the Stillwater this morning, lying flat across the water like a sheet on a bed nobody\'s slept in. The reeds are grey with it. Keep your cloak close. Lake air gets into the bones, and mine have complaints enough already.' },
  { week: 4, day: 5, line:
    'Fog so thick this morning I can barely see my own hand, and the lake has gone so still you can hear a drip land. On the water, keep within arm\'s reach of each other, and speak up before you sneeze. Sound travels strangely in fog.' },
  { week: 4, day: 6, line:
    'Sleep while the sun\'s up, if you can. Tonight is for rowing, and rowing goes better rested. I\'ve made up a bed of cloaks in the dry corner, and the kettle\'s on for the first one awake.' },

  { week: 5, day: 2, line:
    'Two days of road ahead, and the old paving is hard on the feet, every slab of it laid for marching boots. Bind your feet now, before the blisters start, not after. Feet hold grudges, and they win every argument.' },
  { week: 5, day: 3, line:
    'Last of the good bread this morning, and a little cheese, and three dried apples I\'d been saving. I\'ve cut it all into fair shares, and I measured twice. Eat slowly and make it last.' },
  { week: 5, day: 4, line:
    'This city is so quiet you can hear the dust settle on the windowsills. Soft boots and low voices today, and stay where I can see you. A place this empty makes a man want to whistle, so I\'d thank you all to stop me if I start.' },
  { week: 5, day: 5, line:
    'There\'s broth left, cold, from the pot I carried up. Cold broth is still broth. Drink it slowly. It\'s the best thing in this city, and I say that as the man who made it.' },
  { week: 5, day: 6, line:
    'Back to the wall this morning, the long way round. Stay together, and count heads at every corner. This city has too many corners, and not one decent inn among them.' },

  { week: 6, day: 2, line:
    'Whispers only this morning. Sound carries in these walls, and I\'d like our hiding place to stay ours. There\'s cold bread wrapped by the door, and the water skin is full. Eat quietly. Chew quietly, if you can manage it.' },
  { week: 6, day: 3, line:
    'Sleep through the day if you can. I\'m on watch, and the wall and I are getting along. The work is after dark, and it goes better on a proper sleep, even one taken in daylight.' },
  { week: 6, day: 4, line:
    'Grey morning, the colour of old ash, and the light can\'t seem to make up its mind. Eat slowly, and keep your hands warm under your arms. It\'s not dignified, but it works.' },
  { week: 6, day: 5, line:
    'Up, all of you. Stretch the cold out of your legs before you go anywhere. Stiff legs make poor climbers and worse company. There\'s tea, of a sort. I\'d rather not say what\'s in it.' },
  { week: 6, day: 6, line:
    'I\'ve cooked everything left in the packs: the end of the bacon, the last of the oats, the onion we\'ve carried since the lake. Eat it all. There\'s nothing to save it for.' },
];
