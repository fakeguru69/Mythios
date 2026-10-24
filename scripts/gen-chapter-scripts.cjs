#!/usr/bin/env node
// Builds src/data/chapterScripts.ts from the six canon episode files (Days 1–6 of each week).
// Canon text is copied word for word. Run again whenever an episode file changes:
//   node scripts/gen-chapter-scripts.cjs
// Friend stand-ins become tokens filled from the party at play time:
//   Mei → {F1}, Dev → {F2}, Jo → {F3}; [N] → {N}; [N−1] → {N-1}.

const fs = require('fs');
const path = require('path');
const { parseAll } = require('./parse-episodes.cjs');

const ATTRS = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim'];

// Who strikes first in a weekday fight, where canon makes it depend on something.
// Days not listed: the player strikes first.
const STRIKE_FIRST = {
  '1-3': { on: 'choice', label: 'FOLLOW THE CART-RUTS' },
  '1-5': { on: 'choice', label: 'LOOK AT THE PATH' },
  '2-3': { on: 'challenge' },
  '2-5': { on: 'choice', label: 'WALK THE HILL' },
  '3-5': { on: 'choice', label: "WREN'S LINE" },
  '4-5': { on: 'challenge' },
  '5-2': { on: 'choice', label: 'CAMP ON THE OPEN ROAD' },
  '6-6': { on: 'challenge' },
};

// How a choice's branches are shown, from canon's stage note on each.
//   pick: only the branch the player picked
//   each: the player picks one at a time until every branch is seen
//   auto: the picked branch, then the friends' branches straight after
const CHOICE_MODE = [
  [/^Both are seen/, 'each'],
  [/^Three questions/, 'each'],
  [/^The player looks at one first\. All three are seen/, 'each'],
  [/^The player looks at one\. Friends take the other two, and what they found is shown/, 'auto'],
  [/^The player does one\. Friends do the other, and what they found is shown/, 'auto'],
  [/^The player chooses\./, 'pick'],
  [/^The player takes one\. Friends cover the other/, 'pick'],
  [/^The player chooses who keeps watch/, 'pick'],
  [/^Each (reply )?opens/, 'pick'],
];

// Branch labels that do not echo a button's words.
const BRANCH_ALIAS = {
  'The marking (Mei and Dev take the ruts)': ['GO TO THE MARKING'],
  'The ruts (Mei and Dev take the marking)': ['FOLLOW THE CART-RUTS'],
  'Empty hands, or the telling': ['SHOW HER YOUR EMPTY HANDS', 'TELL HER WHO YOU JUST DROVE OFF'],
  'The horse': ['HOLD OUT THE CARVED HORSE'],
  'Who took her': ['WHO TOOK HER?'],
  'Why her': ['WHY HER?'],
  'What they said': ['WHAT DID THEY SAY?'],
  'Walking the hill': ['WALK THE HILL'],
  "Meira's pages": ["READ MEIRA'S PAGES"],
  'The ash': ['READ THE ASH'],
  'Wren first': ['TAKE WREN UP FIRST'],
  'The rows': ['CAMP AT THE HEAD OF THE ROWS'],
  'The road': ['CAMP ON THE OPEN ROAD'],
  'What are they': ['WHAT ARE THEY?'],
  'The cup': ['WHO IS THE CUP FOR?'],
  'Nothing': ['SAY NOTHING'],
  'Where he stood': ['LOOK WHERE HE STOOD'],
  'What he was at': ['LOOK AT WHAT HE WAS AT'],
  'The step': ['LOOK AT THE STEP'],
  'The fire': ['LOOK AT THE FIRE', 'THE FIRE'],
  'The path': ['LOOK AT THE PATH'],
};

// Fork outcome lines ("What this changed"), road finds carried to the fire, and discernment Relics (Pieces E2 & E3).
const FORK_BRANCH_META = {
  // Disguised Fork 0 · W1D1 (The Forest Road)
  '1-1:LOOK WHERE HE STOOD': {
    changed: 'You looked where he stood first — the rubbing lay face down where his heel turned for the trees.',
    roadFind: {
      title: 'Face down at his heel',
      text: 'The half-burned rubbing lay face down in the leaf-mould right where his heel turned for the trees, as if it slipped from his coat as he broke off.',
    },
  },
  '1-1:LOOK AT WHAT HE WAS AT': {
    changed: 'You checked the cargo box first — the scratches sit low on one side where he knelt watching the road.',
    roadFind: {
      title: 'Scratches on the road side',
      text: 'The fresh scratches on your cargo-box lock are all low on the one side, where a man could kneel at the metal and still keep half an eye down the road.',
    },
  },
  // Disguised Fork #1 · W1D2 (The Hollow Wake Inn — asking about the list)
  '1-2:ASK HIM ABOUT THE LIST': {
    changed: 'You asked about the list first — he glanced at the pocket-fold in your page before bringing out the satchel.',
    roadFind: {
      title: 'The pocket-folded page',
      text: "When you asked Garrick about the list, his eyes went once to the tight pocket-fold in your page before he reached under the counter for Meira's satchel.",
    },
  },
  '1-2:ASK WHO ELSE HAS BEEN ASKING': {
    changed: 'You asked who else had come asking — he said nobody had asked for you, only the woman who left the pages.',
    roadFind: {
      title: 'No other callers',
      text: 'Asked whether anyone else had come looking for the people at your table, Garrick said nobody had asked for you at the Hollow Wake — only the woman who left the pages.',
    },
  },
  // Disguised Fork #2 · W1D2 (The Hollow Wake Inn — the shorthand line)
  '1-2:ASK HIM ABOUT THE LINE NOBODY CAN READ': {
    changed: 'You pointed out the cramped shorthand line — he knew which line you meant without coming closer.',
    roadFind: {
      title: 'Known from across the bar',
      text: 'When you turned the open notebook toward the bar, Garrick knew which cramped line at the foot of the leaf you meant without stepping closer to look.',
    },
  },
  '1-2:READ THE LETTERS OUT TO HIM': {
    changed: 'You sounded out her clipped letters aloud — his cloth slowed on the bar at the sound of them.',
    roadFind: {
      title: 'The pause of the cloth',
      text: "When you sounded out the first clipped syllables of Meira's shorthand aloud, Garrick's cloth slowed for half a beat on the bar before he named the split rock.",
    },
  },
  // Disguised Fork #3 · W1D2 (The Hollow Wake Inn — asking him to come)
  '1-2:ASK HIM TO TAKE YOU THERE': {
    changed: "You asked him to guide you and pointed to the extra cup — he agreed to come as far as the Widow's Tooth.",
    roadFind: {
      title: 'The untouched cup at the end',
      text: "When you asked Garrick to take you north and pointed to the untouched extra cup at the end of the table, he looked from the satchel to your faces and agreed to come as far as the Widow's Tooth.",
    },
  },
  '1-2:TELL HIM NOBODY ELSE CAN READ HER': {
    changed: "You let the open notebook make your case — he looked at her shorthand and agreed to come as far as the Widow's Tooth.",
    roadFind: {
      title: 'The open leaf between the cups',
      text: "Told that none of you could read another line of Meira's shorthand without him, Garrick looked at the open notebook between the cups and agreed to come as far as the Widow's Tooth.",
    },
  },
  // Fork 1 · W1D3 (The Widow's Tooth)
  '1-3:GO TO THE MARKING': {
    changed: 'You found fresh charcoal in the cut stone · Your back was to the bracken: he strikes first.',
    roadFind: {
      title: 'Charcoal in the cut',
      text: "In the deepest groove of the cut stone at the Widow's Tooth, dry under the overhang, a crumb of black charcoal came away on your thumb. Somebody pressed paper to this stone not many days ago.",
    },
  },
  '1-3:FOLLOW THE CART-RUTS': {
    changed: 'You found reed-thatch in the ruts · You spotted him in the bracken: you strike first.',
    roadFind: {
      title: 'Reed-thatch in the ruts',
      text: 'Where the cart-ruts turned off toward the trees and the smoke, a twist of grey reed-thatch had shaken loose from the cart-bed into the peat.',
    },
  },
  // Fork 2 · W1D4 (Fenmark well — Fit: picks Challenge Attribute)
  '1-4:LOOK FOR FOOTPRINTS': {
    changed: 'You took the back lanes, so the Challenge asks for Agility, and you found grey wool on the shed nail.',
    roadFind: {
      title: 'Grey wool on the nail',
      text: "Where the small footprints turned between the sheds behind the well, a thread of unhemmed grey wool was caught on a nail at the height of a boy's elbow.",
    },
  },
  '1-4:KNOCK NEXT DOOR': {
    changed: "You knocked next door, so the Challenge asks for Charm, and you saw the neighbour's barley pot.",
    roadFind: {
      title: 'The second barley pot',
      text: "Inside the neighbour's half-open door beside the well, a pot of the same boiled barley was still steaming on the hob. Someone in Fenmark was feeding the boy on the quiet.",
    },
  },
  // Fork 3 · W1D4 (Opening the boy at the well)
  '1-4:SHOW HIM THE LIST': {
    changed: "You showed him Meira's list — he recognised her paper from two weeks ago.",
    roadFind: {
      title: 'The woman with the satchel',
      text: "The boy at the well recognised the paper of Meira's list. He says a woman with a satchel and a book of that same paper came through Fenmark two weeks back, asking about the split stone.",
    },
  },
  '1-4:ASK WHO WAS TAKEN': {
    changed: "You asked straight out who was taken — you learned how they silenced Tamsin's mother.",
    roadFind: {
      title: 'How they kept Fenmark quiet',
      text: "The boy at the well says Tamsin's mother is shut behind barred shutters: the men who took Tamsin warned that if anyone cried out or went to the road, they would never bring her back.",
    },
  },
  '1-4:SAY NOTHING. WAIT.': {
    changed: "You waited in silence — his gaze gave away Tamsin's house and the gate they used.",
    roadFind: {
      title: 'Where the boy looked',
      text: "Given silence at the well, the boy looked first to the third house on the left — where a child's stool sits under the open shutter — and then to the swinging gate at the fen end of the lane.",
    },
  },
  // Fork 4 · W1D4 (The village standoff)
  '1-4:STAND WHERE YOU ARE': {
    changed: 'You held your ground — you saw the young men came out unarmed, bluffing to turn you back.',
    roadFind: {
      title: 'Unarmed men',
      text: 'When you stood your ground at the well, the two younger men had nothing at their belts — not even a hedging bill. Fenmark came out to bluff you away, not to fight.',
    },
  },
  '1-4:STEP BACK, HANDS OPEN': {
    changed: "You stepped back with open hands — you saw the three-day bruise on the young man's wrist.",
    roadFind: {
      title: 'The bruised wrist',
      text: 'When the nearer young man lowered his guard, his cuff showed a dark bruise round his wrist, three days old — someone held him back when Tamsin was taken.',
    },
  },
  '1-4:PUT YOURSELF IN FRONT OF THE BOY': {
    changed: 'You stood in front of the boy — he whispered that the men knew the steps of Fenmark in the dark.',
    roadFind: {
      title: 'No lantern in the dark',
      text: 'From behind your shoulder in the standoff, the boy whispered one detail more: the men who came in the dark carried no lantern, yet knew where every step in the lane was.',
    },
  },
  // Fork 5 · W1D5 (The old charcoal camp arrival)
  '1-5:LOOK AT THE STEP': {
    changed: 'You found her rowan-ash ward at the step · You were at the front door: the runner strikes first.',
    roadFind: {
      title: 'Salt and rowan-ash',
      text: "Under the swept threshold stone of the charcoal-burner's shed lay a line of dry salt and rowan-ash: an old hill ward laid by someone waiting for a bad visitor to return.",
    },
  },
  '1-5:LOOK AT THE FIRE': {
    changed: 'You found her warm cup by the banked fire · You were at the firepit: the runner strikes first.',
    roadFind: {
      title: 'The warm pannikin',
      text: 'Beside the banked firepit stood a tin cup of herb-tea barely cool. The woman of the camp slipped into the trees only minutes before you reached the clearing.',
    },
  },
  '1-5:LOOK AT THE PATH': {
    changed: 'You read the fresh prints on the path · You knew he was here: you strike first.',
    roadFind: {
      title: 'Prints at a run',
      text: "On the path into the charcoal camp, a man's running prints overlay the woman's outgoing ones, the mud still oozing water into the heel-marks. He reached the clearing just ahead of you.",
    },
  },
  // Fork 6 · W1D5 (The woman with the woodcutter's axe — includes Week 1 discernment Relic)
  '1-5:SHOW HER YOUR EMPTY HANDS': {
    changed: 'You showed empty hands — you saw the fresh blade-nick on her axe-helve from the trees.',
    roadFind: {
      title: 'The nicked axe-helve',
      text: 'When the woman at the charcoal camp lowered her axe, the haft showed a fresh white gouge where she had turned a knife-blow in the trees before you arrived.',
    },
  },
  '1-5:TELL HER WHO YOU JUST DROVE OFF': {
    changed: 'You told her who you drove off — her glance gave away the root-cellar stone behind the woodpile.',
    roadFind: {
      title: 'The root-cellar stone',
      text: 'When told a man had been prizing at her back shutter, the woman glanced once at the flat root-cellar stone behind the woodpile — her real hiding-place is under the woodpile, not inside the shed.',
    },
  },
  '1-5:HOLD OUT THE CARVED HORSE': {
    changed: 'You knew the carved horse was hers and held it out first — she trusted you at once, and pressed a Might Relic into your hand.',
    relic: 'Might',
    roadFind: {
      title: "The carver's charm",
      text: "Held out without a word, the carved horse from the Widow's Tooth brought her axe down at once. She pressed an iron-bound river-stone charm into your hand before she sat.",
    },
  },
  // Disguised Fork #4 · W1D6 (The Ford — the extra cup)
  '1-6:ASK WHO IT IS FOR': {
    changed: 'You asked who the extra cup was for — he set the jug down and called it a family habit.',
    roadFind: {
      title: 'The tap of the jug',
      text: 'Asked outright at the roadside inn who the extra cup was for, Garrick set the jug down on the scarred oak with a small tap and called it a family habit.',
    },
  },
  '1-6:LOOK AT THE EXTRA CUP': {
    changed: 'You looked at the extra cup poured to the same measure — he caught your eye and called it a family habit.',
    roadFind: {
      title: 'Measured like the rest',
      text: 'At the roadside inn above the ford, the extra cup at the corner of the table was poured to the exact same measure as the rest before Garrick called it a family habit.',
    },
  },
  // Fork 7 · W1D6 (The roadside inn, reading the map)
  '1-6:READ IT OUT': {
    changed: 'You read the map out yourself — your fingertip found an old pin-hole punched through the mark.',
    roadFind: {
      title: 'The pin-hole at the mark',
      text: 'Tracing the assembled map by fingertip over supper, you felt a tiny pin-hole punched right through the mark beyond the ford, from before the map was ever cut in six.',
    },
  },
  '1-6:LET DEV READ IT': {
    changed: 'You let Dev read the map — with your eyes on the room, you caught the courier listening at the mention of the ford.',
    roadFind: {
      title: 'The listening courier',
      text: 'While your friend read the map aloud in the roadside inn, a man in a riding-cloak by the chimney held his mug still at the mention of the bend above the ford, then paid his bill without taking a bed.',
    },
  },
  // Disguised Fork #5 · W2D1 (The Second Name — asking Garrick in the mine)
  '2-1:ASK HIM WHAT HE KNOWS': {
    changed: "You asked how much he already knew — he kept wiping the lamp glass and offered the second name's road.",
    roadFind: {
      title: 'Soot on the lamp glass',
      text: 'Asked in the quiet mine how much of this country he already knew, Garrick kept wiping soot from a lamp glass without looking up and said he could tell you where the next name on the wall lived.',
    },
  },
  '2-1:ASK WHERE HE WOULD START': {
    changed: 'You asked which road reached the second name first — he offered to point the way from the mine wall.',
    roadFind: {
      title: 'The road from the mine wall',
      text: 'When you read the second name off the mine wall and asked which road reached it first, Garrick said without looking up from his lamp glass that he could tell you where that name lived.',
    },
  },
  // Fork · W2D1 (The Second Name — Tamsin in the road before the wagon)
  '2-1:CROUCH DOWN TO HER': {
    changed: 'You crouched level with her in the mud — she studied your face before speaking of the mill boy.',
    roadFind: {
      title: 'Mud on your knee',
      text: 'When you crouched down in the road until your eyes were level with hers, Tamsin studied your face before telling you she had been counting in the dark when a rider named the mill boy.',
    },
  },
  '2-1:ASK WHAT THE SONG IS': {
    changed: 'You asked what the song was — she stopped humming at once and said it was a counting song.',
    roadFind: {
      title: 'The counting song',
      text: 'Asked what she was humming by the wagon, Tamsin stopped at once and said it was a counting song she had used in the mine while the riders talked about the mill boy.',
    },
  },
  '2-1:SAY NOTHING. WAIT.': {
    changed: 'You waited without pressing her — her good hand took your sleeve on its own, and her trust left you a Charm Relic.',
    roadFind: {
      title: 'Her hand on your sleeve',
      text: 'When you stood waiting in the road without asking a question, Tamsin took hold of a fold of your sleeve with her unhurt hand and told you what she heard while counting in the dark.',
    },
    relic: 'Charm',
  },
  // Disguised Fork #6 · W2D1 (The Second Name — Garrick staying past the Widow's Tooth)
  '2-1:POINT THAT OUT': {
    changed: "You reminded him the Widow's Tooth was behind you — he called you the worst guests he'd ever had and walked ahead.",
    roadFind: {
      title: 'A day and a half past his word',
      text: "Reminded on the mill road that the Widow's Tooth was a day and a half behind you, Garrick settled his pack-strap, called you the worst guests he'd ever had, and walked on ahead.",
    },
  },
  '2-1:SAY NOTHING AND WATCH HIM PACK': {
    changed: 'You watched him knot his bedroll twice for a long road — he caught you looking and walked ahead.',
    roadFind: {
      title: 'The double-knotted bedroll',
      text: 'Before setting off down the mill road, Garrick knotted his bedroll twice the way a man knots it with another week of road in mind.',
    },
  },
  // Fork · W2D6 (The Hill — reading the map across the dark)
  '2-6:READ IT OUT': {
    changed: 'You gave the map line by line across the dark — you heard how far even a low voice carried on the still hill.',
    roadFind: {
      title: 'A voice on the still hill',
      text: 'Giving the map line by line across the dark from the lip of the hill, you heard how far even a low voice carried in the still night air before the hillside woke.',
    },
  },
  '2-6:LET JO READ IT': {
    changed: 'You passed the map to Jo — with your eyes free to watch the hill below, you caught the first stir of lamps in the dark.',
    roadFind: {
      title: 'Starlight on the parchment',
      text: 'While Jo tilted the map to the starlight and read each turn aloud for the others along the slope, you had your eyes on the dark hillside when the first lamp stirred below.',
    },
  },
  // Disguised Fork #7 · W3D1 (Somewhere Warm — speaking with Corin)
  '3-1:KNEEL DOWN TO HIM': {
    changed: "You knelt level with Corin's bandaged hand — he remembered Wren's name and the warm black hills of home.",
    roadFind: {
      title: 'Level with the bandage',
      text: "When you knelt on the stone floor level with Corin's bandaged hand, he steadied himself and remembered the girl's name — Wren — and the warm black hills she missed.",
    },
  },
  '3-1:SIT ON THE STEP BESIDE HIM': {
    changed: 'You sat beside Corin on the low step — with nobody standing over him, he told you about Wren and her warm hills.',
    roadFind: {
      title: 'Beside him on the mill-step',
      text: 'Sitting on the low step beside Corin so nobody stood over him, you heard how Wren talked of the warm ground and black hills of home.',
    },
  },
  // Disguised Fork #8 · W3D1 (Somewhere Warm — the fourth name in the ledger)
  '3-1:ASK ABOUT THE FOURTH NAME': {
    changed: "You asked about warning the fourth child in the north — Garrick laid two fingers on the page to keep you on Wren's trail.",
    roadFind: {
      title: 'Two fingers on the ledger',
      text: "When you asked whether someone should ride north to warn the fourth name in the book, Garrick laid two fingers flat on the open page and said Wren's road was the one with tracks on it.",
    },
  },
  '3-1:LOOK AT THE FOURTH ENTRY': {
    changed: "You traced the drier ink of the fourth entry — Garrick shook his head and pointed you to Wren's fresh tracks.",
    roadFind: {
      title: 'The drier ink at the fourth name',
      text: 'Under the lamp, the ink of the fourth entry in the ledger was drier than the third — written before they ever came down to the mill.',
    },
  },
  // Disguised Fork #9 · W3D3 (The Blackglass — the mended boot)
  '3-3:THANK HIM': {
    changed: 'You thanked him before the others woke — he tucked his waxed thread away without looking up.',
    roadFind: {
      title: 'The waxed thread bobbin',
      text: 'Thanked in the quiet morning for stitching your split boot sole while you slept, Garrick said only that it needed doing and tucked the waxed thread bobbin inside his coat.',
    },
  },
  '3-3:HOLD UP THE MENDED BOOT': {
    changed: "You tested the neat cobbler's stitch in the morning light — he saw it hold and tucked his bobbin away.",
    roadFind: {
      title: "The cobbler's stitch",
      text: "Held to the morning light beside the Blackglass, the split sole of your boot showed a tight, practiced cobbler's stitch laid in waxed thread while you slept.",
    },
  },
  // Fork · W3D4 (The Buried Doorway — keeping to the hoof-scratches vs going to the doorway)
  '3-4:KEEP TO THE TRAIL': {
    changed: 'You stayed on the hoof-scratches another mile — you found the third carved chip yourself before rejoining the doorway.',
    roadFind: {
      title: 'The third chip on the trail',
      text: 'Following the hoof-scratches a mile past the buried doorway, you found a third twist of shaved wood dropped where the riders never looked back.',
    },
  },
  '3-4:GO TO THE DOORWAY': {
    changed: 'You went straight to the buried doorway — you had the fall of rock sized up by the time Dev brought back the third chip.',
    roadFind: {
      title: 'The squared lintel under the fall',
      text: 'Standing at the ridge doorway while Dev followed the hoof-scratches ahead, you saw that the buried lintel was squared by hand long before the rockfall covered it.',
    },
  },
  // Fork · W3D5 (The Spring — the riders' open line vs Wren's goat-track)
  "3-5:THE RIDERS' LINE": {
    changed: "You took the riders' open line round the fold — the grey coat on the ridge saw you coming and strikes first.",
    roadFind: {
      title: 'Hoof-scratches round the fold',
      text: "The riders' line went the long way round the head of the fold in plain view of the ridge where the grey coat had been left to watch.",
    },
  },
  "3-5:WREN'S LINE": {
    changed: "You followed Wren's chips down the goat-track — you come upon the grey coat unseen, strike first, and claim an Agility Relic.",
    roadFind: {
      title: 'Five chips on the goat-track',
      text: 'Down the steep goat-track where no horse could go, five more twists of shaved wood marked the path Wren walked on her own feet.',
    },
    relic: 'Agility',
  },
  // Fork · W3D6 (The Kiln Ridge — reading the map over the wind)
  '3-6:READ IT OUT': {
    changed: 'You raised your voice over the ridge wind — the gale carried every turn of the way down the black slope.',
    roadFind: {
      title: 'Words carried down the ridge',
      text: 'Raising your voice over the wind at the top of the Kiln ridge, you felt the gale take every word of the crack, the cut way, and the room below straight down the dark slope.',
    },
  },
  '3-6:LET MEI READ IT': {
    changed: 'You let Mei shield the map from the wind and read — watching the dark plain below, you saw the single lamp first.',
    roadFind: {
      title: 'Shielded from the ridge wind',
      text: 'While Mei turned her back to the wind to read the map twice for the ones on the slope below, you had your eyes on the black ground where a single lamp began to move toward the Kiln.',
    },
  },
  // Fork · W4D1 (Not Finished — reading the ash vs taking Wren up to the air first)
  '4-1:READ THE ASH': {
    changed: 'You stayed to guard the ash while Dev took Wren up — not a boot moved across the floor before you bent with the lamp.',
    roadFind: {
      title: 'Still boots in the ash',
      text: 'While Dev carried Wren up toward the cooler air, everyone else in the Kiln chamber stood motionless where they were so not a single fresh print crossed the ash.',
    },
  },
  '4-1:TAKE WREN UP FIRST': {
    changed: 'You carried Wren up to the cool air first — Mei kept every boot off the ash for you, and your care earned an Aim Relic.',
    roadFind: {
      title: 'Cool air at the Kiln mouth',
      text: 'When you took Wren up to the cooler air first before returning to the chamber floor, Mei held the room still so every print in the ash waited untouched for your lamp.',
    },
    relic: 'Aim',
  },
  // Disguised Fork #10 · W5D1 (The Grey Afternoon — the fifth at the waystone)
  '5-1:ASK GARRICK WHERE A FIFTH WOULD BE': {
    changed: 'You asked where a fifth Stone would be kept — Garrick looked north and named Highwall.',
    roadFind: {
      title: 'Every telling he knows',
      text: 'Asked by the chiselled waystone where a fifth Stone would be kept, Garrick looked north along the road and said every telling he knew ended at Highwall.',
    },
  },
  '5-1:LOOK NORTH ALONG THE ROAD': {
    changed: 'You followed the tremor north along the old road — Garrick looked the same way and named Highwall.',
    roadFind: {
      title: 'Where the road points',
      text: 'Standing up from the waystone to follow the low tremor north along the old road, you found Garrick already watching that horizon before he named Highwall.',
    },
  },
  // Disguised Fork #11 · W5D2 (The Old Kingdom's Road — the family with the cart)
  '5-2:ASK WHAT DROVE THEM OUT': {
    changed: 'You stepped clear of the cart to ask what they saw — the farmer told you their own beasts turned on them.',
    roadFind: {
      title: 'The yard that turned',
      text: 'When you stepped aside to let the cart breathe and asked what drove the family south, the man said their own dogs and pigs would not settle since the sky turned.',
    },
  },
  '5-2:LOOK AT THE BANDAGE ON HIS ARM': {
    changed: 'You noticed the tooth-spotted linen on his forearm — he told you his own yard turned on them.',
    roadFind: {
      title: 'Teeth through the sleeve',
      text: "The linen wrapped tight round the farmer's forearm on the north road was spotted dark where teeth — not a blade — had caught him in his own yard.",
    },
  },
  // Fork · W5D2 (The Old Kingdom's Road — camping at the mounds vs on the open road)
  '5-2:CAMP AT THE HEAD OF THE ROWS': {
    changed: 'You camped behind the shelter of the mounds — they broke the wind, but the dogs came over them unseen and strike first.',
    roadFind: {
      title: 'Grass shivering on the mounds',
      text: 'Camped at the head of the grass-grown rows for shelter from the wind, you saw the turf shiver with the heartbeat at dusk just before the farm dogs came over the mounds.',
    },
  },
  '5-2:CAMP ON THE OPEN ROAD': {
    changed: 'You camped on the bare road in the wind — nothing could come at you unseen, so you spot the dogs at dusk and strike first.',
    roadFind: {
      title: 'Collar-leather in the dusk',
      text: 'From the bare stones of the open road, you saw the farm dogs coming through the dusk with their collars still on before they could close the distance.',
    },
  },
  // Fork · W5D4 (First Watch — sitting up with Garrick by the shutter)
  '5-4:WHAT ARE THEY?': {
    changed: 'You connected the standing stones to the Kiln page — Garrick confirmed they stood his watch, earning an Intellect Relic.',
    roadFind: {
      title: 'They stood his watch',
      text: 'When you asked on first watch what the standing stones were, Garrick reminded you of the page under the Kiln: "They stood his watch."',
    },
    relic: 'Intellect',
  },
  '5-4:WHO IS THE CUP FOR?': {
    changed: 'You asked who the full cup by the shutter was for — he called it a family habit and spoke of what his family had waited to see.',
    roadFind: {
      title: 'Full by the shutter',
      text: 'Looking at the full cup standing by the shutter on first watch, Garrick called it a family habit for whoever could not be there and said his family had waited a long time.',
    },
  },
  '5-4:SAY NOTHING': {
    changed: 'You kept watch in silence beside him — looking at the full cup by the shutter, he spoke of his family’s long wait on his own.',
    roadFind: {
      title: 'Quiet by the shutter',
      text: 'After a long silence beside the full cup at the shutter, Garrick looked at the tin rim and said his family had waited a long time for something he hoped to live to see.',
    },
  },
  // Disguised Fork #12 · W6D1 (Six Nights — the scratched arrow under the slit window)
  '6-1:ASK WHERE ANYONE WOULD RUN TO': {
    changed: 'You asked where anyone could run from Highwall — Garrick looked at the hall and said, "Somewhere they\'d never be found."',
    roadFind: {
      title: "A watcher's answer",
      text: 'Asked where anyone could run to from a walled city at the end of the world, Garrick looked out of the slit window toward the hall and said, "Somewhere they\'d never be found."',
    },
  },
  '6-1:TRACE THE ARROW IN THE STONE': {
    changed: 'You traced the knife-cut arrow under the sill — it pointed straight down into the thickness of the rampart.',
    roadFind: {
      title: 'Cut with a knife-point',
      text: "Under the slit window of the wall room, the small arrow pointing down toward the defenders' barracks was cut deep with a knife-point into the stone sill.",
    },
  },
  // Fork · W6D3 (Four Nights — timing the watch vs reading the board before crossing the square)
  '6-3:THE WATCH': {
    changed: 'You timed the watch-change word for word — you caught the exact beat when neither watchman looks at the square, earning a Craft Relic.',
    roadFind: {
      title: 'Keep the dark',
      text: 'Timing the watch-change by the square fire, you learned that while the relief says "Keep the dark" and the other answers "It keeps us," neither man is looking across the stones.',
    },
    relic: 'Craft',
  },
  '6-3:THE BOARD': {
    changed: 'You read their chalked board by firelight — four strokes left uncrossed, matching the page in your coat.',
    roadFind: {
      title: 'Four strokes by firelight',
      text: 'Read across the square by the watch-fire’s light, the Order’s board showed four chalk strokes left uncrossed — struck at dusk, just like yours.',
    },
  },
  // Disguised Fork #13 · W6D4 (Three Nights — the blank rock at the end of the crack)
  '6-4:ASK HOW THE ORDER CARRIED FOUR STONES IN': {
    changed: 'You asked how the Order carried four Stones past a Seeker seal — Garrick said the Seekers sealed the doors they knew about.',
    roadFind: {
      title: 'The doors they knew about',
      text: 'When you asked at the dead end of the crack how the Order carried four Stones inside if Seeker ways open only for their own, Garrick said, "The Seekers sealed the doors they knew about."',
    },
  },
  '6-4:LOOK AT THE BLANK ROCK': {
    changed: 'You looked from the Seeker housing to the blank rock — Garrick said the Seekers sealed only the doors they knew about.',
    roadFind: {
      title: 'The dead end in the crack',
      text: 'Looking from the cold Seeker housing to the blank rock and the scored moon beside it, you heard Garrick say that the Seekers sealed the doors they knew about.',
    },
  },
};

// Labels that make the next passage conditional.
function labelCond(text) {
  const t = text.replace(/^\*|\*$/g, '').replace(/:\*?.*$/, '').trim();
  if (/^On a pass( only)?\b/.test(t)) return { on: 'challenge', pass: true };
  if (/^On a failure/.test(t)) return { on: 'challenge', pass: false };
  if (/^On a passed press/.test(t)) return { on: 'press' };
  if (/^If the player (wins|won)/.test(t)) return { on: 'fight', won: true };
  if (/^If the player loses/.test(t)) return { on: 'fight', won: false };
  if (/^Win or lose/.test(t)) return null;
  if (/^If the boy came out to you/.test(t)) return { on: 'challenge', pass: true };
  if (/^If he was caught/.test(t)) return { on: 'challenge', pass: false };
  if (/^If the player saw the country by daylight/.test(t)) return { on: 'challenge', pass: true };
  if (/^If the player came up in the dark/.test(t)) return { on: 'challenge', pass: false };
  if (/^If Wren was carried down whole/.test(t)) return { on: 'claim', key: 'G3:united-effort-lost', has: false };
  if (/^If Wren was cut in the slide/.test(t)) return { on: 'claim', key: 'G3:united-effort-lost', has: true };
  return undefined; // not a condition
}

function tokens(s) {
  return s
    .replace(/\[N−1\]|\[N-1\]/g, '{N-1}')
    .replace(/\[N\]/g, '{N}')
    .replace(/\b(Mei|MEI)\b/g, '{F1}')
    .replace(/\b(Dev|DEV)\b/g, '{F2}')
    .replace(/\b(Jo|JO)\b/g, '{F3}');
}

function quoteText(lines) {
  return tokens(
    lines
      .filter((l) => !/^\*MYTHIOS explains/.test(l.trim()))
      .join('\n')
      // Writer's notes inside story text ("*(Added 14 Oct 2026, Fake Guru: …)*") never reach the player.
      .replace(/\s*\*\((?:Added|Changed|Moved|Approved|Corrected|Decided|Cut|Note)\b[^)]*\)\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

const norm = (s) => s.toUpperCase().replace(/[^A-Z' ]/g, '').trim();

function branchOptions(label, buttons) {
  const key = label.replace(/^\*|\*$/g, '').replace(/:\*?$/, '').replace(/:$/, '').trim();
  const alias = BRANCH_ALIAS[key];
  const idx = [];
  if (alias) {
    alias.forEach((a) => {
      const i = buttons.findIndex((b) => norm(b) === norm(a));
      if (i >= 0) idx.push(i);
    });
  } else {
    const k = norm(key.replace(/^The\s+/i, ''));
    buttons.forEach((b, i) => {
      if (norm(b).includes(k) || k.includes(norm(b))) idx.push(i);
    });
  }
  return idx;
}

function parseNotice(lines) {
  const out = {};
  lines.forEach((l) => {
    const m = l.match(/^\*\*(\w+)\*\*\s*·\s*(.*)$/);
    if (!m || !ATTRS.includes(m[1])) return;
    const body = m[2].trim();
    const sec = body.match(/^(.*?)\s*\*([^*]+)\*$/);
    out[m[1]] = sec ? { first: tokens(sec[1].trim()), second: tokens(sec[2].trim()) } : { first: tokens(body) };
  });
  return out;
}

function parseChallenge(lines, week) {
  const c = { title: '', desc: '', options: [], reward: '', fail: '' };
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!t) return;
    const opt = t.match(/^\*\*(\w+)\*\*\s*·\s*(.*?)\s*·\s*`\[ROLL\]`/);
    if (opt && ATTRS.includes(opt[1])) return c.options.push({ attr: opt[1], verb: tokens(opt[2]) });
    if (/^REWARD:/.test(t)) return (c.reward = t.replace(/^REWARD:\s*/, ''));
    if (/^IF YOU FAIL:/.test(t)) return (c.fail = tokens(t.replace(/^IF YOU FAIL:\s*/, '')));
    // Carried from Gathering 5 (Core Rules §11): a lost roll-call makes this card two harder.
    const carried = t.match(/^\*If the roll-call was lost at the Gathering:\*\s*(.*)$/);
    if (carried) return (c.harderIf = { key: 'G5:united-effort-lost', has: true, by: 2, line: tokens(carried[1]) });
    // Carried results (Fake Guru, 17 Oct, gameplay verdict group C): a lost United Effort at an earlier Gathering, or
    // the player's own failed Challenge earlier this week, makes this card harder ("**One harder.**", "**Two harder.**").
    const by = (line) => ({ One: 1, Two: 2, Three: 3 })[(line.match(/^\*\*(One|Two|Three) harder\.\*\*/) || [])[1]];
    const lostAt = t.match(/^\*If the United Effort was lost at Gathering (\d):\*\s*(.*)$/);
    if (lostAt) {
      if (!by(lostAt[2])) throw new Error(`harder card without "**One/Two harder.**": ${t}`);
      return (c.harderIf = { key: `G${lostAt[1]}:united-effort-lost`, has: true, by: by(lostAt[2]), line: tokens(lostAt[2]) });
    }
    const failedOn = t.match(/^\*If you failed the Challenge on Day (\d):\*\s*(.*)$/);
    if (failedOn) {
      if (!by(failedOn[2])) throw new Error(`harder card without "**One/Two harder.**": ${t}`);
      return (c.harderIf = { key: `${week}-${failedOn[1]}:challenge-failed`, has: true, by: by(failedOn[2]), line: tokens(failedOn[2]) });
    }
    const title = t.match(/^\*\*([^*]+)\*\*$/);
    if (title && !c.title) return (c.title = title[1]);
    c.desc = c.desc ? `${c.desc}\n${tokens(t)}` : tokens(t);
  });
  return c;
}

function parsePress(lines) {
  const p = { title: '', detail: '', harder: 4, reward: '' };
  lines.forEach((l) => {
    const t = l.trim();
    const head = t.match(/^\*\*([^*]+)\*\*\s*·\s*(.*)$/);
    if (head) { p.title = head[1]; p.detail = tokens(head[2]); return; }
    const h = t.match(/^(\d+) harder/);
    if (h) { p.harder = +h[1]; return; }
    if (/^REWARD:/.test(t)) p.reward = t.replace(/^REWARD:\s*/, '');
  });
  return p;
}

function parseFight(lines) {
  const f = { name: '', desc: '', firstLines: null };
  lines.forEach((l) => {
    const t = l.trim();
    if (!t || /`\[FIGHT\]`/.test(t) || /^You:/.test(t) || /^REWARD:/.test(t)) return;
    const name = t.match(/^\*\*([^*]+)\*\*$/);
    if (name && !f.name) { f.name = name[1]; return; }
    const two = t.match(/^\*(.+?)\*\s*\/\s*\*(.+?)\*$/);
    if (two) { f.firstLines = [tokens(two[1]), tokens(two[2])]; return; }
    f.desc = f.desc ? `${f.desc} ${tokens(t)}` : tokens(t);
  });
  return f;
}

const warnings = [];

function buildDay(d) {
  const key = `${d.week}-${d.day}`;
  const steps = [];
  let heading = '';
  let question = '';
  let pendingCond; // condition for the next quote
  const b = d.blocks;
  let i = 0;
  let choiceId = 0;
  const lastChoiceByLabel = {};
  while (i < b.length) {
    const blk = b[i];
    if (blk.t === 'label') {
      const h = blk.text.match(/^\*Heading:\s*\*\*(.+?)\*\*\*?$/);
      if (h) { heading = h[1].replace(/\.$/, ''); i++; continue; }
      const q = blk.text.match(/^\*Question:\s*(.+?)\*$/);
      if (q) { question = tokens(q[1]); i++; continue; }
      const inline = blk.text.match(/^\*([^*]+):\*\s+(.+)$/);
      const cond = labelCond(blk.text);
      if (inline && cond !== undefined) {
        const s = inline[2].trim();
        steps.push({ t: 'say', text: tokens(s[0].toUpperCase() + s.slice(1)), ...(cond ? { cond } : {}) });
        i++; continue;
      }
      if (cond !== undefined) { pendingCond = cond; i++; continue; }
      warnings.push(`W${d.week}D${d.day} stage note ignored: ${blk.text.slice(0, 90)}`);
      i++; continue;
    }
    if (blk.t === 'head') {
      const name = blk.text;
      const next = b[i + 1];

      function ensureLeadInBeforeCard() {
        if (steps.length === 0) return;
        const last = steps[steps.length - 1];
        if (last.t === 'say') {
          if (!last.text.trim().endsWith('…') && !last.text.trim().endsWith('...')) {
            last.text = last.text.trim() + '\n\n…';
          }
        } else if (last.t === 'choice') {
          if (last.branches && last.branches.length > 0) {
            last.branches.forEach((br) => {
              if (!br.text.trim().endsWith('…') && !br.text.trim().endsWith('...')) {
                br.text = br.text.trim() + '\n\n…';
              }
            });
          } else {
            steps.push({ t: 'say', text: '…' });
          }
        } else if (last.t === 'notice') {
          steps.push({ t: 'say', text: '…' });
        } else {
          steps.push({ t: 'say', text: '…' });
        }
      }

      function ensureLeadInForPress() {
        const passStep = [...steps].reverse().find((s) => s.t === 'say' && s.cond?.on === 'challenge' && s.cond?.pass === true);
        if (passStep) {
          if (!passStep.text.trim().endsWith('…') && !passStep.text.trim().endsWith('...')) {
            passStep.text = passStep.text.trim() + '\n\n…';
          }
        } else {
          ensureLeadInBeforeCard();
        }
      }

      if (name === 'What you notice' && next?.t === 'quote') {
        ensureLeadInBeforeCard();
        steps.push({ t: 'notice', lines: parseNotice(next.lines) });
        i += 2;
        continue;
      }
      if (name === 'Challenge card' && next?.t === 'quote') {
        ensureLeadInBeforeCard();
        steps.push({ t: 'challenge', ...parseChallenge(next.lines, d.week) });
        i += 2;
        continue;
      }
      if (name === 'PRESS ON' && next?.t === 'quote') {
        ensureLeadInForPress();
        steps.push({ t: 'press', ...parsePress(next.lines) });
        i += 2;
        continue;
      }
      if (name === 'Fight card' && next?.t === 'quote') {
        ensureLeadInBeforeCard();
        const f = parseFight(next.lines);
        const rule = STRIKE_FIRST[key];
        let strikeFirst = { on: 'player' };
        if (rule?.on === 'challenge') strikeFirst = { on: 'challenge' };
        if (rule?.on === 'choice') {
          const c = lastChoiceByLabel[rule.label];
          if (!c) warnings.push(`W${d.week}D${d.day} strike-first choice not found: ${rule.label}`);
          else strikeFirst = { on: 'choice', choice: c.id, options: [c.option] };
        }
        steps.push({ t: 'fight', name: f.name, desc: f.desc, firstLines: f.firstLines, strikeFirst });
        i += 2;
        continue;
      }
      if (name === 'Day summary card' && next?.t === 'quote') {
        const lines = next.lines.map((l) => l.trim()).filter(Boolean);
        steps.push({ t: 'summary', lines: lines.map(tokens) });
        i += 2; continue;
      }
      warnings.push(`W${d.week}D${d.day} heading ignored: ${name}`);
      i++; continue;
    }
    if (blk.t === 'buttons') {
      const labels = blk.labels.filter((l) => l !== 'PLANT');
      if (labels.length === 0) { i++; continue; }
      if (labels.length === 1) { steps.push({ t: 'act', label: tokens(labels[0]) }); i++; continue; }
      // A choice: read its stage note and any branches that follow.
      const id = choiceId++;
      let mode = 'pick';
      const branches = [];
      let j = i + 1;
      while (j < b.length) {
        const nb = b[j];
        // Canon's [PLANT] marks are notes for the writer, not buttons.
        if (nb.t === 'buttons' && nb.labels.every((l) => l === 'PLANT')) { j++; continue; }
        if (nb.t === 'label') {
          const note = nb.text.replace(/^\*|\*$/g, '');
          const m = CHOICE_MODE.find(([re]) => re.test(note));
          if (m) { mode = m[1]; j++; continue; }
          const opts = branchOptions(nb.text, labels);
          if (opts.length && b[j + 1]?.t === 'quote') {
            // A branch runs over several passages only when another branch follows it.
            let k = j + 1;
            const parts = [];
            while (b[k]?.t === 'quote') { parts.push(quoteText(b[k].lines)); k++; }
            while (b[k]?.t === 'buttons' && b[k].labels.every((l) => l === 'PLANT')) k++;
            const nextIsBranch = b[k]?.t === 'label' && branchOptions(b[k].text, labels).length > 0;
            const take = nextIsBranch ? parts.length : 1;
            const metaKey = opts.length === 1 ? `${key}:${labels[opts[0]]}` : null;
            const meta = metaKey ? FORK_BRANCH_META[metaKey] : null;
            const branchObj = { options: opts, text: parts.slice(0, take).join('\n\n') };
            if (meta?.changed) branchObj.changed = tokens(meta.changed);
            if (meta?.roadFind) {
              branchObj.roadFind = {
                title: tokens(meta.roadFind.title),
                text: tokens(meta.roadFind.text),
              };
            }
            if (meta?.relic) branchObj.relic = meta.relic;
            branches.push(branchObj);
            j = j + 1 + take; continue;
          }
        }
        break;
      }
      labels.forEach((l, oi) => (lastChoiceByLabel[l] = { id, option: oi }));
      if (branches.length) {
        const covered = new Set(branches.flatMap((x) => x.options));
        labels.forEach((l, oi) => { if (!covered.has(oi)) warnings.push(`W${d.week}D${d.day} option without a branch: ${l}`); });
      }
      steps.push({ t: 'choice', id, labels: labels.map(tokens), mode: branches.length ? mode : 'flavor', branches });
      i = j; continue;
    }
    if (blk.t === 'quote') {
      const text = quoteText(blk.lines);
      const step = { t: 'say', text };
      if (pendingCond) step.cond = pendingCond;
      if (/Seeker Fragment has been added to your Chest/.test(text)) step.fragment = true;
      steps.push(step);
      pendingCond = undefined;
      i++; continue;
    }
    i++;
  }
  // The Pull is the last bold line before the summary card.
  const sumIdx = steps.findIndex((s) => s.t === 'summary');
  const pull = [...steps.slice(0, sumIdx)].reverse().find((s) => s.t === 'say' && !s.cond && /\*\*[^*]+\*\*$/.test(s.text));
  if (pull) pull.pull = true;
  else warnings.push(`W${d.week}D${d.day} no Pull found`);
  return { week: d.week, day: d.day, title: d.title, heading: tokens(heading), question, steps };
}

const days = parseAll().map(buildDay);

const header = `// Generated by scripts/gen-chapter-scripts.cjs from docs/canon/episode-*.md. Do not edit by hand:
// change the episode file, then run \`node scripts/gen-chapter-scripts.cjs\`.
// Tokens filled at play time: {F1} {F2} {F3} = the first three friends after the player
// (canon's Mei, Dev, Jo); {N} = the party size as a word; {N-1} = one fewer.

import { AttributeName } from './mythiosRulesData';

export type ScriptCond =
  | { on: 'challenge'; pass: boolean }
  | { on: 'press' }
  | { on: 'fight'; won: boolean }
  | { on: 'claim'; key: string; has: boolean };

export type StrikeFirstRule =
  | { on: 'player' }
  | { on: 'challenge' }
  | { on: 'choice'; choice: number; options: number[] };

export type ScriptStep =
  | { t: 'say'; text: string; cond?: ScriptCond; fragment?: boolean; pull?: boolean }
  | { t: 'act'; label: string }
  | {
      t: 'choice';
      id: number;
      labels: string[];
      /** pick: only the picked branch · each: pick until every branch is seen · auto: picked, then the rest · flavor: no branches */
      mode: 'pick' | 'each' | 'auto' | 'flavor';
      branches: { options: number[]; text: string; changed?: string; roadFind?: { title: string; text: string }; relic?: AttributeName }[];
    }
  | { t: 'notice'; lines: Partial<Record<AttributeName, { first: string; second?: string }>> }
  | {
      t: 'challenge';
      title: string;
      desc: string;
      options: { attr: AttributeName; verb: string }[];
      reward: string;
      fail: string;
      /** A card made harder by an earlier result, with the line that says why. */
      harderIf?: { key: string; has: boolean; by: number; line: string };
    }
  | { t: 'press'; title: string; detail: string; harder: number; reward: string }
  | {
      t: 'fight';
      name: string;
      desc: string;
      /** Canon's two lines: [when the player strikes first, when the enemy does]. */
      firstLines: [string, string] | null;
      strikeFirst: StrikeFirstRule;
    }
  | { t: 'summary'; lines: string[] };

export interface ChapterScript {
  week: number;
  day: number;
  title: string;
  heading: string;
  question: string;
  steps: ScriptStep[];
}

export const CHAPTER_SCRIPTS: ChapterScript[] = `;

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'chapterScripts.ts'),
  header + JSON.stringify(days, null, 2) + ';\n'
);
console.log(`${days.length} days written to src/data/chapterScripts.ts`);
warnings.forEach((w) => console.log('  ' + w));
