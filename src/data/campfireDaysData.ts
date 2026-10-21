import { AttributeName } from './mythiosRulesData';

// A friend's id in the party list (mythiosRulesData `buildParty`): 'YOU' for the player, then the sample friends.
export type FriendId = string;

export interface CampfireRiddleEntry {
  q: string;
  a: string;
  quip: string;
  accept: string[];
  maxTries: number;
}

export interface CampfireFanOutClueInternal {
  title: string;
  text: string;
  source: string;
  bearsOnFork: string;
  qaNote: string;
}

export interface CampfireFanOutCluePublic {
  title: string;
  text: string;
  source: string;
}

export interface CampfireDayEntry {
  week: number;
  day: number;
  id: string;
  place: string;
  narratedNoGarrick: boolean;
  tone: 'wry' | 'quiet';
  cupNight: boolean;
  opener: string | null;
  forkA: string;
  forkB: string;
  callback: string | null;
  riddle: CampfireRiddleEntry | null;
  nudge: string;
  fanOutClue: CampfireFanOutClueInternal;
  questionTitle?: string;
  puzzle?: { q: string; clickText?: string } | null;
  clicks?: Array<{ a: string; b: string; text: string; solves?: boolean; aAttr?: string }>;
  nudgeIfLaid?: { piece: string; line: string } | null;
  narratedSilence?: string | null;
}

export const CUP_NIGHT_IDS: readonly string[] = [
  '1-2',
  '1-6',
  '2-1',
  '2-6',
  '3-4',
  '4-2',
  '5-4',
  '6-6',
];

export const QUIET_DAY_IDS: readonly string[] = [
  '1-4',
  '2-4',
  '3-2',
  '4-3',
  '4-6',
  '5-4',
  '6-2',
];

export const CAMPFIRE_STORED_LINES = {
  theoryPinAcks: [
    'Pinned.',
    "That's on the board.",
    'Pinned under your name, {friend}.',
    'On the board. What would change your mind?',
    'Written up where everyone can see.',
  ],
  closers: [
    'Enough for one day.',
    'Off to bed, the lot of you.',
    "Sleep. I'll mind the fire.",
    'Same fire tomorrow?',
  ],
  firstArrivalGreeting: "You're first. Pull up a log.",
  messageInABottlePrompt: 'Leave one for the others. It goes on the board.',
  catchUpTemplate: '{friend} thinks {reading}.',
  day6WeeklyPinLine: 'Those are on the board.',
  cupNightStageDirection:
    'Garrick pours one extra tin cup and sets it at the empty place at the edge of the firelight without a word.',
  noticingTemplates: {
    bruisedScrape: "{friend}, you're favouring that arm. Sit nearer the fire.",
    solvedFragmentFirst: '{friend} had the Fragment before the rest of us were seated.',
    lentRelic: '{friend} gave a hand today. I saw.',
    backAfterMissedDay: '{friend}. Good to see you.',
    notYetArrived: "{friend} isn't here yet. There's room.",
  },
} as const;

export const CAMPFIRE_DAYS_DATA: CampfireDayEntry[] = [
  {
    "week": 1,
    "day": 1,
    "place": "The forest road",
    "id": "1-1",
    "narratedNoGarrick": true,
    "tone": "wry",
    "cupNight": false,
    "opener": "One list, one inn's name. Nothing was taken.",
    "questionTitle": "Who wrote the list?",
    "forkA": "The man on the road wrote it himself.",
    "forkB": "Someone else wrote it. He only carried it.",
    "callback": null,
    "riddle": null,
    "nudge": "A man who takes nothing, and leaves a list. Who would want you to have it?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The even hand",
      "text": "Not one name is crossed out or written over. Every line sits level, and the inn's line is in the same hand as the names.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 1,
    "day": 2,
    "place": "The Hollow Wake Inn",
    "id": "1-2",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "You've paid for your rooms and you haven't burned anything down. That's more than most guests manage.",
    "questionTitle": "The child in Meira's notes: when was that child taken?",
    "forkA": "Lately. Whatever was happening there is happening now.",
    "forkB": "Long ago. She was writing about an older taking.",
    "callback": "She hasn't sat in that seat for three weeks. Your pages all reached you on the road within the same few days.",
    "riddle": null,
    "nudge": "{friend:Intellect}, the page about the child has no date. What would give it one?",
    "nudgeIfLaid": {
      "piece": "1-2-3",
      "line": "{friend:Intellect}, that leaf. What does it tell you about when she wrote it?"
    },
    "puzzle": {
      "q": "Did Meira leave in a hurry?",
      "clickText": "She cut those pages one at a time, against a rule, to send them, and she left every slip in her book pinned where it belonged. She did not go in a hurry."
    },
    "clicks": [
      {
        "a": "1-2-2",
        "b": "press",
        "text": "She cut those pages one at a time, against a rule, to send them, and she left every slip in her book pinned where it belonged. She did not go in a hurry.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Read the stubs",
      "text": "Each stub has a faint straight line scored down it. She cut them against a rule, one at a time, with care. She meant to send them.",
      "source": "press-on",
      "bearsOnFork": "B",
      "qaNote": "Existing [PRESS ON] detail. Leans 'on purpose'."
    }
  },
  {
    "week": 1,
    "day": 3,
    "place": "The Widow's Tooth",
    "id": "1-3",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "You've not eaten. Sit.",
    "questionTitle": "Who was the man in the bracken working for?",
    "forkA": "The men who took the child.",
    "forkB": "Fenmark. He was keeping watch for his own village.",
    "callback": "The man on the forest road was carrying her rubbing. The man in the bracken was watching her rock.",
    "riddle": null,
    "nudge": "{friend:Agility}, he ran toward the smoke. What lies that way for a man like him?",
    "puzzle": {
      "q": "How long has this rock been watched?",
      "clickText": "Someone has sat over this rock for hours at a time, and walked round it often enough to wear the turf away. It is watched, and it has been for a long while."
    },
    "clicks": [
      {
        "a": "1-3-1",
        "b": "1-3-2",
        "text": "Someone has sat over this rock for hours at a time, and walked round it often enough to wear the turf away. It is watched, and it has been for a long while.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The second ring",
      "text": "In the flattened bracken a flask has left a ring in the dew, and a second ring beside it where he set it down again.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 1,
    "day": 4,
    "place": "Fenmark",
    "id": "1-4",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": null,
    "narratedSilence": "Garrick sets a bowl in front of each of you, and for once he says nothing at all.",
    "questionTitle": "Why did they take Tamsin, of all the children in Fenmark?",
    "forkA": "She was someone in particular. They came for her.",
    "forkB": "She was the easiest to take.",
    "callback": "The boy says they moved like they'd done it before. The little horse at the rock had sat out a winter or two.",
    "riddle": null,
    "nudge": "{friend:Charm}, of all the children in Fenmark, why her?",
    "nudgeIfLaid": {
      "piece": "1-4-3",
      "line": "{friend:Charm}, three doors, and they tried none of them. Why hers?"
    },
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The leaned bar",
      "text": "The gate at the end of the lane is swinging, but its bar has been lifted and leaned neatly against the post, not thrown down.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 1,
    "day": 5,
    "place": "The old charcoal camp",
    "id": "1-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Two winters between two children. Some people count in winters. It's a way of keeping still.",
    "questionTitle": "Is it the same man, twice, or a way of working?",
    "forkA": "It's the same man, twice.",
    "forkB": "It's a way of working, not one man.",
    "callback": "The road, the rock, and tonight her shutters. Not one of those men has said a word.",
    "riddle": null,
    "nudge": "{friend:Intellect}, she knows him by a knife. How many men can carry one knife?",
    "puzzle": {
      "q": "Has someone tried her house before tonight?",
      "clickText": "The marks on her back shutter are old and new in the same place, and the bar on her door has worn its cleats deep. Someone has tried her house before tonight, and she has barred it every night for a long time."
    },
    "clicks": [
      {
        "a": "1-5-2",
        "b": "1-5-3",
        "text": "The marks on her back shutter are old and new in the same place, and the bar on her door has worn its cleats deep. Someone has tried her house before tonight, and she has barred it every night for a long time.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The knife, not the face",
      "text": "She says she never saw his face, only the knife, and it is the knife she knows him by.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 1,
    "day": 6,
    "place": "The Low Ford",
    "id": "1-6",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Six pieces, one map. Eat something before you stare at it.",
    "questionTitle": "Why are our names on that list?",
    "forkA": "We are like the children. They want us too.",
    "forkB": "Meira chose us, to help her find them.",
    "callback": "Meira had this shape on paper before any of you found a piece. Tonight the pieces drew it.",
    "riddle": null,
    "nudge": "{friend:Intellect}, that list has been in your pocket all week. Tell the table what you make of it now.",
    "puzzle": {
      "q": "Why send the cart one way and the child another?",
      "clickText": "One man carried her down to the water, the other went back up to the cart, and the cart went up the far bank at a run, without her. Anyone who followed the cart was following an empty one."
    },
    "clicks": [
      {
        "a": "1-6-2",
        "b": "1-6-3",
        "text": "One man carried her down to the water, the other went back up to the cart, and the cart went up the far bank at a run, without her. Anyone who followed the cart was following an empty one.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Wade out",
      "text": "Mid-stream, on the upstream side of the ford-stone, a scrape of fresh paint on the rock at the height of a gunwale. There was a boat.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail. Leans 'carried her across'."
    }
  },
  {
    "week": 2,
    "day": 1,
    "id": "2-1",
    "place": "The mine, then the mill road",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Beds are in the barn tonight. Pick a corner and take it.",
    "questionTitle": "Did the takers know this valley before they rode into it?",
    "forkA": "They were strangers here, guided only by the road.",
    "forkB": "They knew every turn and every house.",
    "callback": "The mine wall put Tamsin's name first and Corin's second. Tamsin heard them say \"the mill boy next\".",
    "riddle": null,
    "nudge": "{friend:Aim}, the cart came through in the dark without a lantern. What kind of driver does that?",
    "puzzle": {
      "q": "How did the cart travel in the dark?",
      "clickText": "The horse never checked or slowed in the pitch dark, yet walked straight past the old man's gate without stopping. The driver knew exactly where he was going, and which house he wanted."
    },
    "clicks": [
      {
        "a": "2-1-1",
        "b": "2-1-2",
        "text": "The horse never checked or slowed in the pitch dark, yet walked straight past the old man's gate without stopping. The driver knew exactly where he was going, and which house he wanted.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The steady horse",
      "text": "The old man says the horse never balked at his gate or at the fork, in full dark and with no lamp. It took the mill lane at a steady walk.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 2,
    "day": 2,
    "id": "2-2",
    "place": "The mill",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Asked for by name, and by the night he was born. That's an odd thing to ask for.",
    "questionTitle": "How did they know which child was Corin?",
    "forkA": "They carried a written record of who was born here.",
    "forkB": "Someone who knows the family pointed him out.",
    "callback": "In the mine, that shape was a hole, and what sat in it was gone. Here it's cut into the mill's footing.",
    "riddle": null,
    "nudge": "{friend:Craft}, boot-mud straight to the bed, and a paper in his fist. Where did that paper come from?",
    "puzzle": {
      "q": "Did he hesitate once he reached the house?",
      "clickText": "He checked the paper in his fist once at the door, then walked straight to the boy's bed without a single wrong turn. He came with a name written down, and knew where that child slept."
    },
    "clicks": [
      {
        "a": "2-2-1",
        "b": "2-2-2",
        "text": "He checked the paper in his fist once at the door, then walked straight to the boy's bed without a single wrong turn. He came with a name written down, and knew where that child slept.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The ruts",
      "text": "The left wheel pulls. You have seen that track before, coming down a muddy bank to a ford. It is the same cart.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 2,
    "day": 3,
    "id": "2-3",
    "place": "Upriver",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A stranger dead at a lock, and a lock that opened for you. Rooms like that have opinions.",
    "questionTitle": "Who was the stranger left dead at the housing?",
    "forkA": "A seeker like us, trying to reach what is inside.",
    "forkB": "A guard or look-out left to keep people away.",
    "callback": "Corin was asked for by name. Today a lock that wouldn't open for a dead man opened for you.",
    "riddle": null,
    "nudge": "{friend:Intellect}, a purse full of silver on a dead man's belt. Why leave it?",
    "puzzle": {
      "q": "Did he die on the day he reached the lock?",
      "clickText": "He came back to that lock day after day with tools, and his purse is still heavy with silver. He was not killed for what he carried, and he was not killed in a hurry."
    },
    "clicks": [
      {
        "a": "2-3-1",
        "b": "2-3-2",
        "text": "He came back to that lock day after day with tools, and his purse is still heavy with silver. He was not killed for what he carried, and he was not killed in a hurry.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The scratches",
      "text": "The stone round the housing is scored with dozens of short scratches, some weathered and some bright. He tried it more than once, on more than one day.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 2,
    "day": 4,
    "id": "2-4",
    "place": "The shaft in the hillside",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": "Sit down before you fall down.",
    "questionTitle": "Did our footsteps at the shaft give us away?",
    "forkA": "They heard the stone tumble down the shaft.",
    "forkB": "They were waiting for us before we ever reached the lip.",
    "callback": "Yesterday a branch swung on the slope with no wind. Today they knew you were at the shaft.",
    "riddle": null,
    "nudge": "{friend:Charm}, the heads turned below, but the chant ran on. What does that tell you?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The second lamp",
      "text": "A second lamp stands lit at the foot of the shaft, filled and trimmed, the same make as the ring in the chamber. Nobody grabbed it in a hurry.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 2,
    "day": 5,
    "id": "2-5",
    "place": "The hillside by night",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A small black circle. Somebody wanted a thing forgotten, and somebody else wouldn't let it be.",
    "questionTitle": "Why was the king's name erased from the stone?",
    "forkA": "Erased by his enemies, so no one would rally to him.",
    "forkB": "Erased by his own people, in shame or fear.",
    "callback": "On Day 2 a horn button, on Day 3 a dead stranger. Tonight, a circle.",
    "riddle": null,
    "nudge": "{friend:Intellect}, why turn a carved stone with its face to the wall?",
    "puzzle": {
      "q": "Were the stones broken or hidden?",
      "clickText": "Some stones were shattered with fire and mallet, but the ones in the sheepfold were turned face-inward with care. The people here did not only destroy his name—they hid what they could not bear to lose."
    },
    "clicks": [
      {
        "a": "2-5-2",
        "b": "2-5-3",
        "text": "Some stones were shattered with fire and mallet, but the ones in the sheepfold were turned face-inward with care. The people here did not only destroy his name—they hid what they could not bear to lose.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The ground-flat face",
      "text": "On the old stone where the scout stood, one face has been ground flat, long ago. The chisel scars are weathered grey. Whatever was carved there is gone.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 2,
    "day": 6,
    "id": "2-6",
    "place": "The lip of the shaft",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Digging toward an older room. You have to respect the effort.",
    "questionTitle": "What are they digging for in the deep rock?",
    "forkA": "To cut a way into the older chamber.",
    "forkB": "To dig out something buried before the room was made.",
    "callback": "In the mine, you reached the mark after it was emptied. Tonight they're still digging toward the older room.",
    "riddle": null,
    "nudge": "{friend:Might}, two lamps, a steady line of picks, and baskets sifted by hand. What are they so afraid of missing?",
    "puzzle": {
      "q": "How deep is their digging compared to our old way in?",
      "clickText": "The pick-strokes drive in a single line toward the old chamber, and every basket of earth is sifted through bare fingers. They are not only clearing rock—they are searching for a specific thing."
    },
    "clicks": [
      {
        "a": "2-6-1",
        "b": "2-6-2",
        "text": "The pick-strokes drive in a single line toward the old chamber, and every basket of earth is sifted through bare fingers. They are not only clearing rock—they are searching for a specific thing.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Ear to the rock",
      "text": "Under the room with the lamps there is another hollow. It is bigger. And there is nobody in it at all.",
      "source": "press-on",
      "bearsOnFork": "B",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 3,
    "day": 1,
    "id": "3-1",
    "place": "Somewhere warm",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Somewhere warm. I'd settle for a warm supper. Eat.",
    "questionTitle": "Did they take Wren to Ashcombe or beyond it?",
    "forkA": "To Ashcombe, where her kin live.",
    "forkB": "Ashcombe is only where they water their beasts on the way to the hills.",
    "callback": "Corin was held a morning's walk from his own mill. Wren was told she was going home first.",
    "riddle": null,
    "nudge": "{friend:Intellect}, a child's mitten at Corin's belt, and a water cask filled to the brim. Where is that road going?",
    "puzzle": {
      "q": "Did the cart make ready for a long journey?",
      "clickText": "They topped their water cask to the very brim and stood looking west toward the ridges before they started. They were preparing for the dry country, not a village visit."
    },
    "clicks": [
      {
        "a": "3-1-2",
        "b": "3-1-3",
        "text": "They topped their water cask to the very brim and stood looking west toward the ridges before they started. They were preparing for the dry country, not a village visit.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The grey wool",
      "text": "Corin has a child's woollen mitten tucked in his belt that is not his. The wool is rough and grey, and it smells of sheep.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 3,
    "day": 2,
    "id": "3-2",
    "place": "Ashcombe",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": null,
    "narratedSilence": "Garrick sits by the hearth with his boots off, watching the embers in silence.",
    "questionTitle": "Why did Wren go with them without crying out?",
    "forkA": "They were gentle with her and promised to bring her home.",
    "forkB": "They threatened her people if she made a sound.",
    "callback": "Tamsin and Corin each came home with one cut palm, bound clean. Wren's taker said they'd only need her the once.",
    "riddle": null,
    "nudge": "{friend:Charm}, a sheepskin folded like a pillow in the cart, and hooves muffled with sacking. Why both?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The boy at the well",
      "text": "At the well a boy holds his chip out low and quick, then shoves it back into his shirt before you have looked at it properly.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 3,
    "day": 3,
    "id": "3-3",
    "place": "The Blackglass",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Mind your hands on that glass, all of you.",
    "questionTitle": "Why did the riders pass the Blackglass mark without stopping?",
    "forkA": "They already had what they needed from this stone.",
    "forkB": "This stone was never the one they were looking for.",
    "callback": "At the Widow's Tooth a man lay in the bracken watching the rock. Here the riders went past this one without slowing.",
    "riddle": null,
    "nudge": "{friend:Intellect}, six horses on the ridge, and not one slowed for the ancient mark. Why?",
    "puzzle": {
      "q": "Has anyone touched this housing since the road was made?",
      "clickText": "The old shepherds' path ends dead at the sunken stones, and the dust on the housing had no mark until your own fingers touched it. The riders did not even dismount here."
    },
    "clicks": [
      {
        "a": "3-3-1",
        "b": "3-3-2",
        "text": "The old shepherds' path ends dead at the sunken stones, and the dust on the housing had no mark until your own fingers touched it. The riders did not even dismount here.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Read the scratches",
      "text": "Six horses. One of them is carrying double, and the second rider weighs almost nothing.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 3,
    "day": 4,
    "id": "3-4",
    "place": "The black ridges",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "She's leaving chips on the trail. Clever girl.",
    "questionTitle": "Who did Wren leave her glass chips for?",
    "forkA": "For anyone following to find her.",
    "forkB": "To mark her own trail so she could find the way back.",
    "callback": "Tamsin wasn't asleep; she was counting. Wren is dropping her chips, one by one, on their trail.",
    "riddle": null,
    "nudge": "{friend:Agility}, tiny scratches on the back of each chip: one, two, three. That's a girl with her wits about her.",
    "puzzle": {
      "q": "Did she drop the chips in haste or with care?",
      "clickText": "Each chip was set on high bare rock where it would catch the light, and each back is numbered with tiny knife-scratches. She was counting her trail step by step."
    },
    "clicks": [
      {
        "a": "3-4-1",
        "b": "3-4-3",
        "text": "Each chip was set on high bare rock where it would catch the light, and each back is numbered with tiny knife-scratches. She was counting her trail step by step.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Scratched on the back",
      "text": "Turn the chips over. One has a single short scratch on its back, one has two, and one has three.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 3,
    "day": 5,
    "id": "3-5",
    "place": "The shepherd's hut",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "That was an empty hut. Come nearer the fire.",
    "questionTitle": "Why did they leave the hut in the middle of the night?",
    "forkA": "They were warned that we were coming up the ridge.",
    "forkB": "The hour they were waiting for arrived.",
    "callback": "At the mine someone took the time to bind Tamsin's hand in clean linen. Here someone folded one blanket with care, and threw the other down.",
    "riddle": null,
    "nudge": "{friend:Craft}, one bed neatly made, one water skin dropped in the grass. What made them move?",
    "puzzle": {
      "q": "How quickly did they depart?",
      "clickText": "Her name on the door was cut with patient double strokes, but by the spring a full water skin lies dropped with its stopper loose. They took their time until a single moment—then moved all at once."
    },
    "clicks": [
      {
        "a": "3-5-1",
        "b": "3-5-2",
        "text": "Her name on the door was cut with patient double strokes, but by the spring a full water skin lies dropped with its stopper loose. They took their time until a single moment—then moved all at once.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Cut twice",
      "text": "Each stroke of the name has been cut twice, the second pass deeper than the first.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 3,
    "day": 6,
    "id": "3-6",
    "place": "The cairn",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Fire's built up. Sit by it before you decide anything.",
    "questionTitle": "What is happening inside the Kiln tonight?",
    "forkA": "A ritual that requires the child's presence.",
    "forkB": "They are hiding her until the way north opens.",
    "callback": "Corin said Wren's home was always warm. Tonight the map ends at a hill that breathes warm air.",
    "riddle": null,
    "nudge": "{friend:Aim}, the lamp climbed the hill and went out inside. What does that crack breathe out?",
    "puzzle": {
      "q": "Are the riders still inside the hill?",
      "clickText": "No horses wait outside, and thin pale smoke rises from the crown where by day the air only shimmered. The men are inside the hill, and the fire in the Kiln has been lit."
    },
    "clicks": [
      {
        "a": "3-6-1",
        "b": "3-6-2",
        "text": "No horses wait outside, and thin pale smoke rises from the crown where by day the air only shimmered. The men are inside the hill, and the fire in the Kiln has been lit.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "No horses",
      "text": "Not one horse is tethered at the foot of the Kiln, though six rode this way.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 4,
    "day": 1,
    "id": "4-1",
    "place": "Under the Kiln, then Ashcombe",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Count yourselves. I will, too.",
    "questionTitle": "Did someone inside the room help cut the prisoner loose?",
    "forkA": "Yes, an accomplice was waiting in the shadows.",
    "forkB": "No, he had a blade palmed and worked his own bonds.",
    "callback": "Every one of them you've fought has run at the first gap. Tonight one stood among you with a blade and cut only rope.",
    "riddle": null,
    "nudge": "{friend:Craft}, cut rope ends all clean on the same side. That wasn't a man sawing at his own wrists.",
    "puzzle": {
      "q": "Was someone waiting in the side passage?",
      "clickText": "The passage smells of a freshly snuffed wick, and every rope was severed by a blade cutting from the same outside angle. Someone was waiting in the dark with steel ready."
    },
    "clicks": [
      {
        "a": "4-1-1",
        "b": "4-1-3",
        "text": "The passage smells of a freshly snuffed wick, and every rope was severed by a blade cutting from the same outside angle. Someone was waiting in the dark with steel ready.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Follow them",
      "text": "They end where the ash gives out and the rock turns to bare black glass. No prints come in. Whoever cut him loose came over the glass and was waiting.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 4,
    "day": 2,
    "id": "4-2",
    "place": "The north road",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Cold road. Put your hands round that cup.",
    "questionTitle": "Why did four riders carry a cart along the open highway?",
    "forkA": "They were daring anyone to challenge them.",
    "forkB": "They were escorting something too heavy or fragile for rough paths.",
    "callback": "The carter's coin has the king's face scraped off. Meira wrote that every record of him had been scraped clean.",
    "riddle": null,
    "nudge": "{friend:Intellect}, swords across their laps and eyes never leaving the cart-bed. What was under that canvas?",
    "puzzle": {
      "q": "How did the riders conduct themselves through the settlements?",
      "clickText": "They rode with drawn swords across their laps in broad daylight, yet not one rider looked at the road or the bystanders. Every eye was locked on what was inside that cart."
    },
    "clicks": [
      {
        "a": "4-2-1",
        "b": "4-2-2",
        "text": "They rode with drawn swords across their laps in broad daylight, yet not one rider looked at the road or the bystanders. Every eye was locked on what was inside that cart.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Every eye on the cart",
      "text": "The carter says the four never spoke to each other, and never once looked at the road or the lake. Every eye stayed on the cart.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 4,
    "day": 3,
    "id": "4-3",
    "place": "Reedham",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": null,
    "narratedSilence": "Garrick sits by the window looking out over the water, his arms folded in the quiet room.",
    "questionTitle": "Why do oars cross the lake to the tower every night at dusk?",
    "forkA": "Taking food and supplies to a guarded prisoner.",
    "forkB": "Watching for the dark-moon hour when the water drops.",
    "callback": "In Ashcombe a baby born when the moon goes out is given a chip of black glass. In Reedham every window is lit for one.",
    "riddle": null,
    "nudge": "{friend:Craft}, oil drops leading to one door on the shingle, and oars at dusk every night. Who is keeping watch on whom?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The oars at dusk",
      "text": "On the shingle the fisherman says he hears oars out on the lake every night, at the same hour, just after dusk. He has never gone to look.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 4,
    "day": 4,
    "id": "4-4",
    "place": "Old Reedham",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Meira had a gloss for it: 'the old songs' word for the marked.' She was careful with her words.",
    "questionTitle": "What does 'moon-blood' mean in Meira's notes?",
    "forkA": "Children born during an eclipse or dark moon.",
    "forkB": "An ancient bloodline that has carried down through the valleys.",
    "callback": "At the ford, Tamsin's small prints stopped at the water. Today Joss's stop at the edge of deep water.",
    "riddle": null,
    "nudge": "{friend:Intellect}, she started a second line in the margin, then crossed it out so hard the nib went through. What did she realize?",
    "puzzle": {
      "q": "Did Meira treat 'the marked' and 'moon-blood' as the same thing?",
      "clickText": "Meira copied 'the marked' and 'moon-blood' from two separate sources centuries apart, then struck her own comparison out until the paper tore. Even she realized they were not the same thing."
    },
    "clicks": [
      {
        "a": "4-4-2",
        "b": "4-4-3",
        "text": "Meira copied 'the marked' and 'moon-blood' from two separate sources centuries apart, then struck her own comparison out until the paper tore. Even she realized they were not the same thing.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The small prints",
      "text": "In one place the small prints stop and turn with both heels dug in: from that exact spot, you can see his grandmother's window on the shore with its lamp burning.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 4,
    "day": 5,
    "id": "4-5",
    "place": "The reed island",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Pale curls of whittled wood. Somebody's still carving.",
    "questionTitle": "Why do they let Joss carve while they hold him?",
    "forkA": "To keep his hands busy so he doesn't try to escape.",
    "forkB": "His carving has something to do with the stones or the water.",
    "callback": "At the Widow's Tooth a little carved horse was left behind. Today, in their boat, a little carved hull was thrown away.",
    "riddle": null,
    "nudge": "{friend:Aim}, three willow cuts—one grey, one brown, one white. Three days he sat there whittling.",
    "puzzle": {
      "q": "How long was he kept on that reed island?",
      "clickText": "The willow has had fresh shoots cut three days running, and the shavings in the bilge were carved without haste. He was held on that island for days, unhurried and unharmed."
    },
    "clicks": [
      {
        "a": "4-5-1",
        "b": "4-5-3",
        "text": "The willow has had fresh shoots cut three days running, and the shavings in the bilge were carved without haste. He was held on that island for days, unhurried and unharmed.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Long curls",
      "text": "Every curl in the bottom of the boat is long and unbroken, and all of them are fresh. Nobody hurried him.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 4,
    "day": 6,
    "id": "4-6",
    "place": "The tower at night",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": null,
    "narratedSilence": "Garrick stands in the doorway looking out into the mist where the water laps at the wall.",
    "questionTitle": "Was the boat under the tower waiting for us or for them?",
    "forkA": "An Order patrol guarding the flooded causeway.",
    "forkB": "A watcher posted to see who answered the call.",
    "callback": "Yesterday you took their boat. Tonight someone took your words.",
    "riddle": null,
    "nudge": "{friend:Aim}, water rings spreading under the stones while our oars were already still. Someone was down there before us.",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The rings",
      "text": "As you tie up at the tower, rings are already spreading from the dark under its wall, and your oars have been still for a minute.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 5,
    "day": 1,
    "id": "5-1",
    "place": "Reedham, and the waystone",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "North, then. That's a long road for tired boots.",
    "questionTitle": "Why was the fifth name chiselled out of the waystone?",
    "forkA": "To hide the existence of a fifth Stone altogether.",
    "forkB": "Because the fifth Stone was taken by someone who broke from the rest.",
    "callback": "Meira looked for a fifth and never found one. Today, on the road north, somebody had cut a line out of a stone.",
    "riddle": null,
    "nudge": "{friend:Intellect}, four names weathered by rain, and the fifth cut away clean. Who had the chisel?",
    "puzzle": {
      "q": "Was the fifth Stone's hiding place cold like the others?",
      "clickText": "The name was cut out with crisp chisel strokes, yet the crack at the waystone's foot retains the same unnatural rime you felt at every Seeker shrine. The place was real, even if its name was expunged."
    },
    "clicks": [
      {
        "a": "5-1-1",
        "b": "5-1-2",
        "text": "The name was cut out with crisp chisel strokes, yet the crack at the waystone's foot retains the same unnatural rime you felt at every Seeker shrine. The place was real, even if its name was expunged.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The crisp edge",
      "text": "Frost has eaten the old carving, but the edges of the cut-out line are crisp. Not one letter of it is left.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 5,
    "day": 2,
    "id": "5-2",
    "place": "The old kingdom's road",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "The grass on a war grave shouldn't shiver. I'd say that's the heartbeat.",
    "questionTitle": "What is driving the wild beasts against the travellers?",
    "forkA": "The heartbeat from the north maddens them with fear.",
    "forkB": "They are drawn to the blood of the marked children.",
    "callback": "On the Stillwater the birds went quiet at the first beat. Tonight the dogs came with it.",
    "riddle": null,
    "nudge": "{friend:Might}, one bite through the linen, and tracks that scattered the moment the beat died. What did those beasts hear?",
    "puzzle": {
      "q": "How did the pack behave when the tremor passed?",
      "clickText": "When the subterranean beat sounded, the hounds froze in unison; the moment it ceased, they broke into wild scatter. They are not hunting under a master's will—they are terrified out of their wits."
    },
    "clicks": [
      {
        "a": "5-2-1",
        "b": "5-2-3",
        "text": "When the subterranean beat sounded, the hounds froze in unison; the moment it ceased, they broke into wild scatter. They are not hunting under a master's will—they are terrified out of their wits.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Heads down",
      "text": "When the beat stops, every dog stops with it, heads down, mid-stride. Not one runs away, and not one comes on.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 5,
    "day": 3,
    "id": "5-3",
    "place": "The herald's gate",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A bar of new timber in brackets worn bright. Somebody's been barring this gate for centuries, and the wood's new.",
    "questionTitle": "Why is there a new timber bar on an ancient ruined gate?",
    "forkA": "The Order barred it to keep intruders from entering Highwall.",
    "forkB": "The people inside barred it to keep whatever is waking from getting out.",
    "callback": "Upriver, somebody kept a hidden path clear and a dog on new iron. Here somebody keeps a new bar on an old gate.",
    "riddle": null,
    "nudge": "{friend:Craft}, fresh wood in old iron brackets. Somebody went to the trouble of felling an ash tree to bar that gate.",
    "puzzle": {
      "q": "How recently was this gateway fortified?",
      "clickText": "The timber bar was hewn within days, its cut ends still bright white, and a single narrow path has been trodden from it up into the city. Highwall has seen fresh boots this very week."
    },
    "clicks": [
      {
        "a": "5-3-1",
        "b": "5-3-2",
        "text": "The timber bar was hewn within days, its cut ends still bright white, and a single narrow path has been trodden from it up into the city. Highwall has seen fresh boots this very week.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Go down to it",
      "text": "Stacked against the gatehouse wall lie dozens of old bars, the lowest rotted to a brown line. Whoever changes the bar has kept every one.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 5,
    "day": 4,
    "id": "5-4",
    "place": "The dead streets",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": true,
    "opener": null,
    "narratedSilence": "Garrick sets the extra cup on the cobbles by the empty doorway and leans against the doorpost in the dark.",
    "questionTitle": "Are the armoured figures in the streets alive or dead?",
    "forkA": "Statues or corpses frozen by an ancient ward.",
    "forkB": "Sentinels waiting for the final night of the count.",
    "callback": "On the road, when the beat stopped, the dogs stopped where they stood. These soldiers stopped mid-stride, and never started again.",
    "riddle": null,
    "nudge": "{friend:Aim}, left foot forward on every single one, and not a print in the dust round their boots. What stopped them mid-stride?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "Stop beside one",
      "text": "Its left foot is forward, the heel just lifted. So is the next one's. So is every one's. They all stopped on the same step.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 5,
    "day": 5,
    "id": "5-5",
    "place": "Below the hall",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "One chalk stroke each dusk. Somebody's counting.",
    "questionTitle": "What happens when the tally on the wall reaches zero?",
    "forkA": "The doors of the great hall unlock.",
    "forkB": "The king opens his eyes.",
    "callback": "At Reedham they kept Joss eight nights, waiting for something. Here they strike off one night every dusk.",
    "riddle": null,
    "nudge": "{friend:Intellect}, one hand drew every stroke on that board. How long has he been standing at that chalk?",
    "puzzle": {
      "q": "Who is keeping the vigil around the fire?",
      "clickText": "Every mark on the tally was drawn by the same steady hand, and every robed head turns as one when the underground tremor pulses. They are not waiting in doubt—they are counting down to a certainty."
    },
    "clicks": [
      {
        "a": "5-5-1",
        "b": "5-5-2",
        "text": "Every mark on the tally was drawn by the same steady hand, and every robed head turns as one when the underground tremor pulses. They are not waiting in doubt—they are counting down to a certainty.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "One hand",
      "text": "Every stroke on the board is in the same thick, square hand, the crossed ones and the ones still to cross. The chalk has been gone over many times, never redrawn.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 5,
    "day": 6,
    "id": "5-6",
    "place": "The wall again",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A slit window, a hidden room, a night nobody heard you.",
    "questionTitle": "Why was this secret chamber hollowed into the rampart?",
    "forkA": "To shelter the fifth Stone where no one could see it.",
    "forkB": "To keep a perpetual watch on the doors of the hall.",
    "callback": "Every map before tonight was read out loud. Tonight it went hand to hand, and nobody heard.",
    "riddle": null,
    "nudge": "{friend:Aim}, two smooth hollows where elbows rested, looking straight across at the king's threshold. Who stood there?",
    "puzzle": {
      "q": "Was this chamber meant for hiding or observing?",
      "clickText": "From outside, the slit is hidden unless you lean over the abyss; but inside, the sill is worn smooth by a watcher's elbows facing the hall. The room was built to observe."
    },
    "clicks": [
      {
        "a": "5-6-1",
        "b": "5-6-2",
        "text": "From outside, the slit is hidden unless you lean over the abyss; but inside, the sill is worn smooth by a watcher's elbows facing the hall. The room was built to observe.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The narrow slit",
      "text": "The slit is no wider than a hand, low in the wall's face. Unless you lean out over the parapet and look straight down the stone, you cannot see it at all.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 6,
    "day": 1,
    "id": "6-1",
    "place": "The wall room (Six nights)",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Quiet's good in a hole in a wall. I'll take it.",
    "questionTitle": "Did the watchman at the board see our shadow in the slit?",
    "forkA": "Yes, he marked the wall room and will send searchers.",
    "forkB": "No, he was looking at the rampart out of old habit.",
    "callback": "At dusk you crossed the wall and nobody heard. By the end of the night a watchman was looking straight at your window.",
    "riddle": null,
    "nudge": "{friend:Aim}, he looked straight at the wall before he struck the board. Did he see us, or was he looking at the stone?",
    "puzzle": {
      "q": "Could any candle inside the wall be seen from the square?",
      "clickText": "The niche faces away from the slit and its soot is ancient; no light has been lit in this chamber tonight. Whatever the watchman looked toward, he saw no flame."
    },
    "clicks": [
      {
        "a": "6-1-1",
        "b": "6-1-3",
        "text": "The niche faces away from the slit and its soot is ancient; no light has been lit in this chamber tonight. Whatever the watchman looked toward, he saw no flame.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "No light inside",
      "text": "Not a candle burns in the room. Every lantern you can see from the slit is out in the square, and none of them reaches in.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 6,
    "day": 2,
    "id": "6-2",
    "place": "The barracks under the wall (Five nights)",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": null,
    "narratedSilence": "Garrick rests his head against the cold masonry, listening to the hollow thud of the earth below in silence.",
    "questionTitle": "Where are the garrison's spears?",
    "forkA": "Carried up to the hall for the waking.",
    "forkB": "Confiscated long ago when the city fell.",
    "callback": "Last week you couldn't be sure a helm had turned toward you. Today one stood in your doorway and looked at the fallen stone instead.",
    "riddle": null,
    "nudge": "{friend:Agility}, empty racks swept clean, and bowls set out that were never filled. When did they leave?",
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The swept racks",
      "text": "The spear-racks along the wall are empty, and the dust under every one is swept clean in the same short arc.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 6,
    "day": 3,
    "id": "6-3",
    "place": "The great square (Four nights)",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "The hall's warm from within. More faithful arriving. What's missing is a door.",
    "questionTitle": "How are the robed faithful entering the sealed hall?",
    "forkA": "There is a hidden passage through the rock.",
    "forkB": "The great bronze doors open for them at dusk.",
    "callback": "The soldiers are three streets nearer the hall. Round the Order's fire there are twice as many as before.",
    "riddle": null,
    "nudge": "{friend:Intellect}, clean robes in their packs, and not a footprint across the threshold of the bronze doors. Where did they go?",
    "puzzle": {
      "q": "Have the main doors been unsealed?",
      "clickText": "The dust along the threshold of the great doors has not been disturbed by a single breath, yet new men arrive with clean robes ready for the ceremony. They are entering through another way."
    },
    "clicks": [
      {
        "a": "6-3-1",
        "b": "6-3-2",
        "text": "The dust along the threshold of the great doors has not been disturbed by a single breath, yet new men arrive with clean robes ready for the ceremony. They are entering through another way.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Eleven watchmen",
      "text": "Eleven watchmen. Six have road-dust to the knee and packs not yet unrolled. They did not send for men to hunt you; these were already coming for the night.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 6,
    "day": 4,
    "id": "6-4",
    "place": "The hill behind the hall (Three nights)",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "That hill was steeper than it looked. Sit.",
    "questionTitle": "Who posted the sentinel inside the rock fissure?",
    "forkA": "The Seekers, to guard their secret entrance.",
    "forkB": "The Order, to prevent anyone reaching the back of the hall.",
    "callback": "Upriver, a dog on a chain kept the hidden path. Today a soldier stood in the crack with its back to the hall.",
    "riddle": null,
    "nudge": "{friend:Craft}, two hollows worn into solid stone by iron boots. That soldier was put there to stay.",
    "puzzle": {
      "q": "How long has this sentinel guarded the cleft?",
      "clickText": "The grit past the soldier was smooth until your own boots scuffed it, but the rock under its iron soles is worn deep into two foot-hollows. It has stood sentinel there since the war ended."
    },
    "clicks": [
      {
        "a": "6-4-1",
        "b": "6-4-2",
        "text": "The grit past the soldier was smooth until your own boots scuffed it, but the rock under its iron soles is worn deep into two foot-hollows. It has stood sentinel there since the war ended.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The untouched grit",
      "text": "Past where the soldier stood, the grit on the crack's floor lies smooth and untouched. Your boots are the first marks in it.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Approved 15 Oct."
    }
  },
  {
    "week": 6,
    "day": 5,
    "id": "6-5",
    "place": "The moon-tower (Two nights)",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Two nights. Eat while there's something to eat.",
    "questionTitle": "Did the sky-watchers foresee the night of the waking?",
    "forkA": "Their calculations predicted the exact dark moon centuries in advance.",
    "forkB": "Their records ended abruptly when the city fell, and the date is a coincidence.",
    "callback": "The Order's board has counted down for generations. The sky-watchers' wall, counted forward, lands on the same night.",
    "riddle": null,
    "nudge": "{friend:Intellect}, slates with sums scratched out and begun again. What were they struggling to count?",
    "puzzle": {
      "q": "How did their astronomical calculations conclude?",
      "clickText": "Every moon on the wall was measured with exact discipline, but the slates on the floor are covered in frantic revisions and repeated sums. In the final days, their calculations were slipping away from them."
    },
    "clicks": [
      {
        "a": "6-5-1",
        "b": "6-5-2",
        "text": "Every moon on the wall was measured with exact discipline, but the slates on the floor are covered in frantic revisions and repeated sums. In the final days, their calculations were slipping away from them.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The chisel on the ledge",
      "text": "On the ledge under the last moon, a chisel is lying where it was put down, the mallet beside it. Nobody came back for them.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 6,
    "day": 6,
    "id": "6-6",
    "place": "The crack in the hill (One night)",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Last night of the count. Eat what you like.",
    "questionTitle": "When the rock opens tomorrow, will the fifth Stone save the kingdom or doom it?",
    "forkA": "It will bind the waking king and finish the Seekers' work.",
    "forkB": "It is the missing piece the Order needs to complete the waking.",
    "callback": "Six nights ago you had a hidden room. Tonight you have one stroke left.",
    "riddle": null,
    "nudge": "{friend:Intellect}, every helm turned to the hall, and the streets behind us empty. Tomorrow night, we walk in.",
    "puzzle": {
      "q": "Is the way ahead clear of guards for tomorrow night?",
      "clickText": "Every post across the lower streets has been abandoned, and every armoured helm on the hill is turned toward the hall. The entire city is converging on one room."
    },
    "clicks": [
      {
        "a": "6-6-1",
        "b": "6-6-3",
        "text": "Every post across the lower streets has been abandoned, and every armoured helm on the hill is turned toward the hall. The entire city is converging on one room.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Every helm to the hall",
      "text": "From the crack's mouth you can see the whole street climbing toward you. Every helm in it is turned to the hall, not one to the hill.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Approved 15 Oct."
    }
  }
];

export function getCampfireDayEntry(week: number, day: number): CampfireDayEntry {
  const safeWeek = Math.min(6, Math.max(1, week));
  const safeDay = Math.min(6, Math.max(1, day));
  const id = `${safeWeek}-${safeDay}`;
  return (
    CAMPFIRE_DAYS_DATA.find((d) => d.id === id) ||
    CAMPFIRE_DAYS_DATA[0]
  );
}

/**
 * Strips internal QA-only fields (`bearsOnFork` and `qaNote`) so they can never be rendered to players.
 */
export function getPublicFanOutClue(week: number, day: number): CampfireFanOutCluePublic {
  const entry = getCampfireDayEntry(week, day);
  return {
    title: entry.fanOutClue.title,
    text: entry.fanOutClue.text,
    source: entry.fanOutClue.source,
  };
}

/**
 * Resolves `{friend:Attribute}` to a friend at the fire (Campfire v2.3 §M): the one with the highest score in
 * that Attribute, leaving out whoever the last nudge named, so the nudges rotate round the fire.
 */
export function resolveCampfireNudgeText(
  nudgeTemplate: string,
  friendsAtFire: { id: FriendId; name: string; scores: Record<AttributeName, number> }[],
  lastNudged?: FriendId | null
): { resolvedText: string; targetFriend: FriendId; attribute: AttributeName } {
  const match = nudgeTemplate.match(/\{friend:([A-Za-z]+)\}/);
  const attr = ((match?.[1] as AttributeName) || 'Intellect') as AttributeName;
  const pool = friendsAtFire.length > 1 ? friendsAtFire.filter((f) => f.id !== lastNudged) : friendsAtFire;
  const best = pool.reduce<(typeof pool)[number] | null>(
    (top, f) => (!top || (f.scores[attr] ?? 0) > (top.scores[attr] ?? 0) ? f : top),
    null
  );
  // §M: a friend alone at the fire is addressed directly, with no name.
  const resolvedText =
    friendsAtFire.length === 1
      ? nudgeTemplate.replace(/\{friend:[A-Za-z]+\},?\s*/, '').replace(/^./, (c) => c.toUpperCase())
      : nudgeTemplate.replace(/\{friend:[A-Za-z]+\}/g, best?.name ?? 'someone');
  return {
    resolvedText,
    targetFriend: best?.id ?? 'YOU',
    attribute: attr,
  };
}

export interface DayTheoryPin {
  friendId: FriendId;
  friendName: string;
  reading: 'A' | 'B' | 'NEITHER';
  readingText: string;
  customLine?: string;
  timestamp: string;
  fromPrivatePrompt?: boolean;
  storedAck?: string;
}

export interface DayQuestionPin {
  id: string;
  authorId: FriendId;
  authorName: string;
  questionText: string;
  timestamp: string;
  readToNextArrival: boolean;
}

export interface MessageInABottle {
  authorId: FriendId;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface CampfireEveningTelemetry {
  dayId: string;
  friendsAttended: FriendId[];
  pinsCount: number;
  questionsPinnedCount: number;
  riddleTries: number;
  riddleSolved: boolean;
  riddleGivenUp: boolean;
  durationSeconds: number;
  garrickMessagesSent: number;
  leaveFireTaps: number;
}

const lastLineIndexByPool: Record<string, number> = {
  theoryPinAcks: -1,
  closers: -1,
};

/**
 * Picks the next stored line from a pool without ever repeating the same line twice in a row.
 */
export function pickRotatedCampfireLine(
  poolKey: 'theoryPinAcks' | 'closers',
  friendDisplayName: string = 'friend'
): string {
  const pool = CAMPFIRE_STORED_LINES[poolKey];
  const prevIdx = lastLineIndexByPool[poolKey] ?? -1;
  const nextIdx = (prevIdx + 1) % pool.length;
  lastLineIndexByPool[poolKey] = nextIdx;
  return pool[nextIdx].replace(/\{friend\}/g, friendDisplayName);
}

/**
 * Evaluates true Noticing templates for the evening and returns at most TWO lines.
 */
export function evaluateEveningNoticings(params: {
  bruisedScrapeFriend?: string | null;
  solvedFragmentFirstFriend?: string | null;
  lentRelicFriend?: string | null;
  missedYesterdayFriend?: string | null;
  notYetArrivedFriends?: string[];
}): string[] {
  // At most two per evening for any party size; the two lines name different friends (Campfire v2.3 §M).
  const tpl = CAMPFIRE_STORED_LINES.noticingTemplates;
  const candidates: [string | null | undefined, string][] = [
    [params.bruisedScrapeFriend, tpl.bruisedScrape],
    [params.solvedFragmentFirstFriend, tpl.solvedFragmentFirst],
    [params.lentRelicFriend, tpl.lentRelic],
    [params.missedYesterdayFriend, tpl.backAfterMissedDay],
    ...(params.notYetArrivedFriends || []).map((f): [string, string] => [f, tpl.notYetArrived]),
  ];
  const lines: string[] = [];
  const named = new Set<string>();
  for (const [friend, template] of candidates) {
    if (!friend || named.has(friend) || lines.length >= 2) continue;
    named.add(friend);
    lines.push(template.replace('{friend}', friend));
  }
  return lines;
}

/**
 * Builds factual one-line summaries per friend for Step 7 ("What We Did Today").
 * Only emits lines for actions actually taken today; never grades theories or attaches gold.
 */
export function buildWhatWeDidTodayLines(params: {
  dayEntry: CampfireDayEntry;
  party: { id: FriendId; name: string }[];
  arrivedFriends: FriendId[];
  clueContributors: FriendId[];
  solvedWord1By?: string;
  solvedWord2By?: string;
  relicGiftedByYouTo?: string | null;
  challengeClearedByYou?: boolean;
  bruisedScrapeByYou?: boolean;
}): { friendId: FriendId; friendName: string; line: string }[] {
  const nameMap: Record<FriendId, string> = Object.fromEntries(params.party.map((f) => [f.id, f.name]));

  const results: { friendId: FriendId; friendName: string; line: string }[] = [];
  const roster: FriendId[] = params.party.map((f) => f.id);

  for (const fid of roster) {
    const fname = nameMap[fid];
    const parts: string[] = [];

    if (fid === 'YOU') {
      if (params.challengeClearedByYou) {
        parts.push(`passed today's Challenge at ${params.dayEntry.place}`);
      } else if (params.bruisedScrapeByYou) {
        parts.push(`was defeated at ${params.dayEntry.place}`);
      }
      if (params.relicGiftedByYouTo) {
        parts.push(`gave a Relic to ${params.relicGiftedByYouTo}`);
      }
    }

    if (params.clueContributors.includes(fid)) {
      parts.push('brought back a clue from the last light');
    }

    const solvedW1 =
      params.solvedWord1By &&
      params.solvedWord1By.toLowerCase() === fname.toLowerCase();
    const solvedW2 =
      params.solvedWord2By &&
      params.solvedWord2By.toLowerCase() === fname.toLowerCase();

    if (solvedW1 && solvedW2) {
      parts.push("found both missing words in today's fragment");
    } else if (solvedW1 || solvedW2) {
      parts.push("found a missing word in today's fragment");
    }

    if (parts.length > 0) {
      results.push({
        friendId: fid,
        friendName: fname,
        line: `${fname} ${parts.join(' · ')}.`,
      });
    }
  }

  return results;
}

export interface CampfireQAVerificationReport {
  totalDays: number;
  w1d1NoGarrickNoRiddle: boolean;
  cupNightsCount: number;
  cupNightsExactMatch: boolean;
  quietDaysCount: number;
  quietDaysExactMatch: boolean;
  firstUseMapViolations: string[];
  bannedPhraseViolations: string[];
  goldMentionViolations: string[];
  genericFallbackViolations: string[];
  flaggedCanonAuditNotes: { id: string; title: string; note: string }[];
  allPassed: boolean;
}

/**
 * Automated 36-Day QA & First-Use Map Verifier (Part 2 + Part 4 + Part 8).
 */
export function runCampfireV22Verifier(): CampfireQAVerificationReport {
  const firstUseMapViolations: string[] = [];
  const bannedPhraseViolations: string[] = [];
  const goldMentionViolations: string[] = [];
  const genericFallbackViolations: string[] = [];

  const bannedPhrases = [
    'maybe',
    'perhaps',
    'possibly',
    'i promise',
    "i don't know",
    'i do not know',
    "couldn't say",
    "wouldn't know",
  ];

  for (const d of CAMPFIRE_DAYS_DATA) {
    const pos = d.week * 10 + d.day;
    const textBundle = [
      d.opener,
      d.forkA,
      d.forkB,
      d.callback,
      d.nudge,
      d.riddle?.q || '',
      d.riddle?.a || '',
      d.riddle?.quip || '',
      d.fanOutClue.title,
      d.fanOutClue.text,
    ].join(' ');
    const lower = textBundle.toLowerCase();

    // 1. First-Use Map Checks
    if (pos < 31 && /\bthe order\b|\border's\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Order" before W3D1`);
    }
    if (pos < 21 && /\bfour children\b|\bfour names\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "four children / four names" before W2D1`);
    }
    if (pos < 25 && /\bking\b|\bking's\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "king" before W2D5`);
    }
    if (/\bmalakor\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Malakor" at Campfire (never allowed)`);
    }
    if (pos < 33 && /\bfifth\b|\bfive stones\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "fifth / five" before W3D3`);
    }
    if (pos < 44 && /\bmoon-blood\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "moon-blood" before W4D4`);
    }
    if (pos < 51 && /\bhighwall\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "Highwall" before W5D1`);
    }
    if (pos < 46 && /\bheartbeat\b/i.test(textBundle)) {
      firstUseMapViolations.push(`${d.id}: named "heartbeat" before W4D6`);
    }

    // 2. Banned Phrases
    for (const bp of bannedPhrases) {
      if (lower.includes(bp)) {
        bannedPhraseViolations.push(`${d.id}: contains banned phrase "${bp}"`);
      }
    }

    // 3. Zero Gold Mentions in Campfire Data
    if (/\+\d+\s*g\b|\bgold\b/i.test(textBundle)) {
      goldMentionViolations.push(`${d.id}: mentions gold in Campfire data`);
    }

    // 4. Zero Generic Fallback Text
    if (/courier box|waxed tally-strip|perimeter note/i.test(textBundle)) {
      genericFallbackViolations.push(`${d.id}: contains generic fallback text`);
    }
  }

  const d11 = getCampfireDayEntry(1, 1);
  const w1d1NoGarrickNoRiddle = d11.narratedNoGarrick === true && d11.riddle === null;

  const cupDays = CAMPFIRE_DAYS_DATA.filter((d) => d.cupNight).map((d) => d.id);
  const cupNightsExactMatch =
    cupDays.length === CUP_NIGHT_IDS.length &&
    cupDays.every((id, i) => id === CUP_NIGHT_IDS[i]);

  const quietDays = CAMPFIRE_DAYS_DATA.filter((d) => d.tone === 'quiet').map((d) => d.id);
  const quietDaysExactMatch =
    quietDays.length === QUIET_DAY_IDS.length &&
    quietDays.every((id, i) => id === QUIET_DAY_IDS[i]);

  const flaggedCanonAuditNotes = [
    {
      id: '3-1',
      title: 'W3·D1 ("The warm one")',
      note: 'Corin says the men called Wren "the warm one" and never said why; flagged against Episode 3 Day 1 chapter text and preserved unchanged per build brief.',
    },
    {
      id: '2-2',
      title: 'W2·D2 ("The ruts")',
      note: 'Reuses the [PRESS ON] cart-rut detail noted in continuity item L1; flagged in report and preserved unchanged per build brief.',
    },
    {
      id: '4-1',
      title: 'W4·D1 ("Follow them")',
      note: 'Reuses the [PRESS ON] wet reed-stalk detail noted in continuity item L6; flagged in report and preserved unchanged per build brief.',
    },
  ];

  const allPassed =
    CAMPFIRE_DAYS_DATA.length === 36 &&
    w1d1NoGarrickNoRiddle &&
    cupNightsExactMatch &&
    quietDaysExactMatch &&
    firstUseMapViolations.length === 0 &&
    bannedPhraseViolations.length === 0 &&
    goldMentionViolations.length === 0 &&
    genericFallbackViolations.length === 0;

  return {
    totalDays: CAMPFIRE_DAYS_DATA.length,
    w1d1NoGarrickNoRiddle,
    cupNightsCount: cupDays.length,
    cupNightsExactMatch,
    quietDaysCount: quietDays.length,
    quietDaysExactMatch,
    firstUseMapViolations,
    bannedPhraseViolations,
    goldMentionViolations,
    genericFallbackViolations,
    flaggedCanonAuditNotes,
    allPassed,
  };
}

