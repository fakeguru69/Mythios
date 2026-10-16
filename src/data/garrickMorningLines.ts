// Garrick's morning line in the party chat (Core Rules §1: "He replies when spoken to and may add a line or two a day").
// One line, posted once for the whole party when the day opens at 5:00am (Fake Guru, 16 Oct: "5am").
// Canon has no list of these, so they were written for Fake Guru's approval: docs/design/garrick-morning-lines-proposal.md.
// Likeable and well written (Fake Guru, 16 Oct): pleasant, with light humour; a small kindness, a dry smile and a little
// of the world in each, never an order barked. Exaggerated feelings are fine (canon's "My knees have opinions").
// Small talk only (the road, the food, the weather, the party's own doings), every line true, none of the banned phrases,
// no promise or prediction, no word before its first-use day, nothing from the day's own chapter before it is read.
// None on Week 1 Days 1 and 2 (the chat opens on Day 2, when the party first meets him) and none on a Day 1 from Week 2
// on (each picks up in the middle of the Gathering's last scene). Loaded onto the server by scripts/gen-garrick-morning-sql.ts.

export const GARRICK_MORNING_APPROVED = false; // set true once Fake Guru approves the lines below

export const GARRICK_MORNING_LINES: { week: number; day: number; line: string }[] = [
  { week: 1, day: 3, line: 'I\'ve wrapped the heel of yesterday\'s loaf and a wedge of cheese for each of you. Two hours to the rock, and an empty stomach makes every hour longer.' },
  { week: 1, day: 4, line: 'The dew\'s heavy on the bracken this morning. Tuck your trousers into your boots, unless you fancy squelching all morning.' },
  { week: 1, day: 5, line: 'Frost on the cart ruts, thin as paper. There\'s tea in the pot, strong enough to stand a spoon in.' },
  { week: 1, day: 6, line: 'Long road north today. I\'ve filled the flasks and packed bread for the walking. The bread\'s yesterday\'s, but it\'s honest.' },

  { week: 2, day: 2, line: 'An hour to the mill. Eat your porridge while it steams. Cold porridge is a sorry thing on a grey morning, and I made this one with care.' },
  { week: 2, day: 3, line: 'Rain\'s been at it half the night. I\'ve hung your socks by the fire. Warm, if not quite dry. Don\'t ask me whose are whose.' },
  { week: 2, day: 4, line: 'The path climbs steeply from here, and the rocks are slick from the rain. Walk where I walk, and if I slip, step somewhere else.' },
  { week: 2, day: 5, line: 'Small fire this morning, tucked in under the rock. Smoke carries on a hillside, and we have neighbours. Not the sort you borrow sugar from.' },
  { week: 2, day: 6, line: 'First watch gets the warm cup. I\'ve kept the kettle going all night for the honour.' },

  { week: 3, day: 2, line: 'A long day west, to the edge of the burned country. There\'s honey for the oats this morning. Take a second spoon; the jar\'s deep.' },
  { week: 3, day: 3, line: 'The ground here keeps its warmth all night, like a banked hearth. Best bed I\'ve had in a week, and nobody charged me for it.' },
  { week: 3, day: 4, line: 'Ash in the air this morning, fine as flour, and none of it fit for bread. A cloth over your mouth makes the walking easier.' },
  { week: 3, day: 5, line: 'Up before the light, quiet as you can. I\'ve wrapped bread for the walk, so nobody has to stop to eat, and nobody can say they went hungry.' },
  { week: 3, day: 6, line: 'The highest ridge is a long climb. Short steps and steady breath. I walk at the back today; somebody has to admire the view.' },

  { week: 4, day: 2, line: 'Hot oats before the north road, with honey in them. Nobody slept well. Eat anyway. It helps more than you\'d think.' },
  { week: 4, day: 3, line: 'Show me any cuts from the ford before we set off. I\'ve a needle, clean water and a steady hand. A clean cut is a quick one to mend.' },
  { week: 4, day: 4, line: 'Mist on the Stillwater this morning, lying flat as a sheet. Keep your cloak close. Lake air gets into the bones, and mine have complaints enough.' },
  { week: 4, day: 5, line: 'Fog so thick this morning I can barely see my own hand. On the water, keep within arm\'s reach of each other, and say so before you sneeze.' },
  { week: 4, day: 6, line: 'Sleep while the sun\'s up if you can. I\'ve checked the oars and the oarlocks. Tonight is for rowing, and rowing goes better rested.' },

  { week: 5, day: 2, line: 'Two days of road ahead, and old paving is hard on the feet. Bind them now, before the blisters start. Feet hold grudges.' },
  { week: 5, day: 3, line: 'Last of the good bread this morning, and a little cheese. I\'ve cut it into fair shares, and I measured twice.' },
  { week: 5, day: 4, line: 'This city is so quiet you can hear the dust settle. Soft boots and low voices today, and stay where I can see you.' },
  { week: 5, day: 5, line: 'There\'s broth left from last night\'s fire, small as it was. Drink it while it\'s warm. It\'s the best thing in this city.' },
  { week: 5, day: 6, line: 'Back to the wall this morning, the long way round. Stay together. This city has too many corners, and not one decent inn.' },

  { week: 6, day: 2, line: 'Whispers only this morning. Sound carries in these walls, and I\'d like our hiding place to stay ours.' },
  { week: 6, day: 3, line: 'Sleep through the day if you can. I\'m on watch, and the wall and I are getting along. The work is after dark.' },
  { week: 6, day: 4, line: 'Grey morning, the colour of old ash. Eat slowly, and keep your hands warm under your arms. It\'s not dignified, but it works.' },
  { week: 6, day: 5, line: 'Up, all of you. Stretch the cold out of your legs first. Stiff legs make poor climbers and worse company.' },
  { week: 6, day: 6, line: 'I\'ve cooked everything left in the packs. Eat it all. There\'s nothing to save it for.' },
];
