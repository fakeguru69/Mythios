// Garrick's morning line in the party chat (Core Rules §1: "He replies when spoken to and may add a line or two a day").
// One line, posted once for the whole party when the day opens at 5:00am (Fake Guru, 16 Oct: "5am").
// Canon has no list of these, so they were written for Fake Guru's approval: docs/design/garrick-morning-lines-proposal.md.
// Likeable and well written (Fake Guru, 16 Oct): a small kindness and a little of the world in each, never an order barked.
// Small talk only (the road, the food, the weather, the party's own doings), every line true, none of the banned phrases,
// no promise or prediction, no word before its first-use day, nothing from the day's own chapter before it is read.
// None on Week 1 Days 1 and 2 (the chat opens on Day 2, when the party first meets him) and none on a Day 1 from Week 2
// on (each picks up in the middle of the Gathering's last scene). Loaded onto the server by scripts/gen-garrick-morning-sql.ts.

export const GARRICK_MORNING_APPROVED = false; // set true once Fake Guru approves the lines below

export const GARRICK_MORNING_LINES: { week: number; day: number; line: string }[] = [
  { week: 1, day: 3, line: 'I\'ve wrapped the heel of yesterday\'s loaf and a wedge of cheese for each of you. Two hours to the rock, and nobody walks well on an empty stomach.' },
  { week: 1, day: 4, line: 'The dew\'s heavy on the bracken this morning. Tuck your trousers into your boots, or walk wet to the knee.' },
  { week: 1, day: 5, line: 'Frost on the cart ruts this morning, thin as paper. There\'s tea in the pot, and it\'s still hot.' },
  { week: 1, day: 6, line: 'Long road north today. I\'ve filled the flasks and wrapped bread for the walking.' },

  { week: 2, day: 2, line: 'An hour to the mill. Eat your porridge while it steams. Cold porridge is a sad thing on a grey morning.' },
  { week: 2, day: 3, line: 'Rain\'s been at it half the night. I\'ve hung your socks by the fire. Warm, if not quite dry.' },
  { week: 2, day: 4, line: 'The path climbs steeply from here, and the rocks are slick from the rain. Walk where I walk, and keep a hand free.' },
  { week: 2, day: 5, line: 'Small fire this morning, and close to the rock. Smoke carries a long way on a hillside, and we have neighbours.' },
  { week: 2, day: 6, line: 'First watch gets the warm cup. I\'ve kept the kettle going all night for it.' },

  { week: 3, day: 2, line: 'A long day west, to the edge of the burned country. There\'s honey for the oats this morning. Take a second spoon.' },
  { week: 3, day: 3, line: 'The ground here keeps its warmth all night, like a banked hearth. Fill your flasks at the hot spring. The black road is a dry one.' },
  { week: 3, day: 4, line: 'Ash in the air this morning, fine as flour. A cloth over your mouth makes the walking easier.' },
  { week: 3, day: 5, line: 'Up before the light, quiet as you can. I\'ve wrapped bread for the walk, so nobody has to stop and eat.' },
  { week: 3, day: 6, line: 'The highest ridge is a long climb. Short steps and steady breath. I walk at the back today.' },

  { week: 4, day: 2, line: 'Hot oats before the north road, with honey in them. Nobody slept well. Eat anyway.' },
  { week: 4, day: 3, line: 'Show me any cuts from the ford before we set off. A clean cut is a quick one to mend.' },
  { week: 4, day: 4, line: 'Mist on the Stillwater this morning, lying flat as a sheet. Keep your cloak close. Lake air gets into the bones.' },
  { week: 4, day: 5, line: 'Fog so thick this morning I can barely see my own hand. On the water, keep within arm\'s reach of each other.' },
  { week: 4, day: 6, line: 'Sleep while the sun\'s up if you can. I\'ve checked the oars and the oarlocks. Tonight is for rowing.' },

  { week: 5, day: 2, line: 'Two days of road ahead, and old paving is hard on the feet. Bind them now, before the blisters start, not after.' },
  { week: 5, day: 3, line: 'Last of the good bread this morning, and a little cheese. I\'ve cut it into fair shares.' },
  { week: 5, day: 4, line: 'This city is so quiet you can hear the dust settle. Soft boots and low voices today.' },
  { week: 5, day: 5, line: 'There\'s broth left from last night\'s fire, small as it was. Drink it while it\'s warm.' },
  { week: 5, day: 6, line: 'Back to the wall this morning, the long way round. Stay together. This city has too many corners.' },

  { week: 6, day: 2, line: 'Whispers only this morning. Sound carries in these walls, and I\'d like our hiding place to stay ours.' },
  { week: 6, day: 3, line: 'Sleep through the day if you can. I\'m on watch. The work is after dark.' },
  { week: 6, day: 4, line: 'Grey morning, the colour of old ash. Eat slowly, and keep your hands warm under your arms.' },
  { week: 6, day: 5, line: 'Up, all of you. Stretch the cold out of your legs first. Stiff legs make poor climbers.' },
  { week: 6, day: 6, line: 'I\'ve cooked everything left in the packs. Eat it all. There\'s nothing to save it for.' },
];
