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
  opener: string;
  forkA: string;
  forkB: string;
  callback: string;
  riddle: CampfireRiddleEntry | null;
  nudge: string;
  fanOutClue: CampfireFanOutClueInternal;
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
    bruisedScrape: "{friend}, you're favouring that arm.",
    solvedFragmentFirst: '{friend} got the stone-words first today.',
    lentRelic: '{friend} handed over a Relic today.',
    backAfterMissedDay: 'Back with us, {friend}. Kettle is still hot.',
    notYetArrived: "{friend} isn't by the fire yet.",
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
    "forkA": "The list is a warning.",
    "forkB": "The list is an invitation.",
    "callback": null,
    "riddle": null,
    "nudge": "{friend:Intellect}, what is odd about a stranger who leaves something behind?",
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
    "forkA": "Meira left in a hurry.",
    "forkB": "Meira left on purpose.",
    "callback": "She hasn't sat in that seat for three weeks. Your pages all reached you on the road within the same few days.",
    "riddle": {
      "q": "What has a neck but no head?",
      "a": "a bottle",
      "quip": "The inn is full of them. None of them talk.",
      "accept": [
        "a bottle",
        "bottle"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, how would you test whether the page is hers?",
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
    "forkA": "The man in the bracken was guarding the rock.",
    "forkB": "He was waiting for us.",
    "callback": "The man on the forest road was carrying her rubbing. The man in the bracken was watching her rock.",
    "riddle": {
      "q": "The more you take, the more you leave behind. What am I?",
      "a": "footsteps",
      "quip": "There's bracken full of them out there.",
      "accept": [
        "footsteps"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, from his hollow in the bracken, what was he watching?",
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
    "opener": "A village that won't talk is still talking. Mostly with its shutters.",
    "forkA": "The village is protecting the girl.",
    "forkB": "The village is protecting itself.",
    "callback": "The boy says they moved like they'd done it before. The little horse at the rock had sat out a winter or two.",
    "riddle": {
      "q": "What breaks the moment you say its name?",
      "a": "silence",
      "quip": "Fenmark's had plenty of practice.",
      "accept": [
        "silence"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Charm}, when Fenmark shut its doors on us, who was it protecting?",
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
    "forkA": "It's the same man, twice.",
    "forkB": "It's a way of working, not one man.",
    "callback": "The road, the rock, and tonight her shutters. Not one of those men has said a word.",
    "riddle": {
      "q": "I grow, but I'm not alive. I need air, but I have no lungs. Water kills me. What am I?",
      "a": "fire",
      "quip": "Which is why I tend this one myself.",
      "accept": [
        "fire"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, two children, two winters apart. One man's habit, or someone's way of working?",
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
    "forkA": "They carried her across the water.",
    "forkB": "They wanted us to think so.",
    "callback": "Meira had this shape on paper before any of you found a piece. Tonight the pieces drew it.",
    "riddle": {
      "q": "I have a bed but never sleep, a mouth but never speak. What am I?",
      "a": "a river",
      "quip": "The one in front of us says nothing, and I believe it.",
      "accept": [
        "a river",
        "river"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, what do you notice about how the pieces settled?",
    "fanOutClue": {
      "title": "Wade out",
      "text": "Mid-stream, on the upstream side of the ford-stone, a scrape of fresh paint on the rock at the height of a gunwale. There was a boat.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail. Leans 'carried across the water'."
    }
  },
  {
    "week": 2,
    "day": 1,
    "place": "The mine, then the mill road",
    "id": "2-1",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Beds are in the barn tonight. Pick a corner and take it.",
    "forkA": "They're keeping Corin close, upriver.",
    "forkB": "Upriver is only the road away.",
    "callback": "The mine wall put Tamsin's name first and Corin's second. Tamsin heard them say \"the mill boy next\".",
    "riddle": {
      "q": "I have a face and two hands but no arms or legs. What am I?",
      "a": "a clock",
      "quip": "Time's the one thing the cart has on us.",
      "accept": [
        "a clock",
        "clock"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, the cart turned upriver. How far do you think it went?",
    "fanOutClue": {
      "title": "The steady horse",
      "text": "The old man says the horse never balked at his gate or at the fork, in full dark and with no lamp. It took the mill lane at a steady walk.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 2,
    "day": 2,
    "place": "The mill",
    "id": "2-2",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Asked for by name, and by the night he was born. That's an odd thing to ask for.",
    "forkA": "They had a list with birthdays.",
    "forkB": "They knew him personally.",
    "callback": "In the mine, that shape was a hole, and what sat in it was gone. Here it's cut into the mill's footing.",
    "riddle": {
      "q": "I have teeth but cannot bite. What am I?",
      "a": "a comb (or a cog)",
      "quip": "A mill's full of them.",
      "accept": [
        "a comb (or a cog)",
        "comb (or a cog)"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, how was the mark cut, and with what tool?",
    "fanOutClue": {
      "title": "The ruts",
      "text": "The left wheel pulls. You have seen that track before, coming down a muddy bank to a ford. It is the same cart.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail (build log L1 asks for a matching mark planted at W1D6: check)."
    }
  },
  {
    "week": 2,
    "day": 3,
    "place": "Upriver",
    "id": "2-3",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A stranger dead at a lock, and a lock that opened for you. Rooms like that have opinions.",
    "forkA": "The stranger wanted the same door.",
    "forkB": "The stranger was left as a warning.",
    "callback": "Corin was asked for by name. Today a lock that wouldn't open for a dead man opened for you.",
    "riddle": {
      "q": "What has many keys but opens no door?",
      "a": "a piano",
      "quip": "Not like that lock. It opened for you.",
      "accept": [
        "a piano",
        "piano"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, did that stranger die trying the lock, or was he left for us?",
    "fanOutClue": {
      "title": "The scratches",
      "text": "The stone round the housing is scored with dozens of short scratches, some weathered and some bright. He tried it more than once, on more than one day.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 2,
    "day": 4,
    "place": "The shaft in the hillside",
    "id": "2-4",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Sit down before you fall down.",
    "forkA": "Now they'll hurry.",
    "forkB": "They won't change a thing for us.",
    "callback": "Yesterday a branch swung on the slope with no wind. Today they knew you were at the shaft.",
    "riddle": {
      "q": "What can fill a cave and weigh nothing?",
      "a": "light",
      "quip": "Bring a lantern. Bring two.",
      "accept": [
        "light"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Charm}, the voices below all said the same words. What were they getting ready?",
    "fanOutClue": {
      "title": "The second lamp",
      "text": "A second lamp stands lit at the foot of the shaft, filled and trimmed, the same make as the ring in the chamber. Nobody grabbed it in a hurry.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 2,
    "day": 5,
    "place": "The hillside by night",
    "id": "2-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A small black circle. Somebody wanted a thing forgotten, and somebody else wouldn't let it be.",
    "forkA": "The king was erased by his enemies.",
    "forkB": "The king was erased by his own people.",
    "callback": "On Day 2 a horn button, on Day 3 a dead stranger. Tonight, a circle.",
    "riddle": {
      "q": "What has no beginning, no middle and no end?",
      "a": "a circle",
      "quip": "A small black one, this evening.",
      "accept": [
        "a circle",
        "circle"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, who gains from a forgotten name?",
    "fanOutClue": {
      "title": "The ground-flat face",
      "text": "On the old stone where the scout stood, one face has been ground flat, long ago. The chisel scars are weathered grey. Whatever was carved there is gone.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 2,
    "day": 6,
    "place": "The lip of the shaft",
    "id": "2-6",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Digging toward an older room. You have to respect the effort.",
    "forkA": "They're digging toward the old room to get in.",
    "forkB": "They're digging to find something that's already there.",
    "callback": "In the mine, you reached the mark after it was emptied. Tonight they're still digging toward the older room.",
    "riddle": {
      "q": "I have rivers with no water and cities with no houses. What am I?",
      "a": "a map",
      "quip": "You're carrying one.",
      "accept": [
        "a map",
        "map"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Might}, you've heard them digging. Cutting a way in, or searching for something?",
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
    "place": "Somewhere warm",
    "id": "3-1",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Somewhere warm. I'd settle for a warm supper. Eat.",
    "forkA": "They need her at home.",
    "forkB": "Home is only the first stop.",
    "callback": "Corin was held a morning's walk from his own mill. Wren was told she was going home first.",
    "riddle": {
      "q": "What has to be broken before you can use it?",
      "a": "an egg",
      "quip": "Ashcombe's hens have views.",
      "accept": [
        "an egg",
        "egg"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, they took Wren back to where she was born. Why home, of all places?",
    "fanOutClue": {
      "title": "The grey wool",
      "text": "Corin has a child's woollen mitten tucked in his belt that is not his. The wool is rough and grey, and it smells of sheep.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 3,
    "day": 2,
    "place": "Ashcombe",
    "id": "3-2",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": "Eat first. Then think. It goes better in that order.",
    "forkA": "The manners were real.",
    "forkB": "The manners are the trick.",
    "callback": "Tamsin and Corin each came home with one cut palm, bound clean. Wren's taker said they'd only need her the once.",
    "riddle": {
      "q": "What has an eye but cannot see?",
      "a": "a needle",
      "quip": "Sharp little thing. Sharper than a polite man.",
      "accept": [
        "a needle",
        "needle"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Charm}, why would men taking a child bother with good manners?",
    "fanOutClue": {
      "title": "The boy at the well",
      "text": "At the well a boy holds his chip out low and quick, then shoves it back into his shirt before you have looked at it properly.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 3,
    "day": 3,
    "place": "The Blackglass",
    "id": "3-3",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Mind your hands on that glass, all of you.",
    "forkA": "The children were chosen for their place.",
    "forkB": "The places were chosen for the children.",
    "callback": "At the Widow's Tooth a man lay in the bracken watching the rock. Here the riders went past this one without slowing.",
    "riddle": {
      "q": "Black when you buy it, red when you burn it, grey when you throw it away. What is it?",
      "a": "coal",
      "quip": "Charcoal's cheaper than glass. Kinder to knees.",
      "accept": [
        "coal"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, why would a scholar write down a number she doubted?",
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
    "place": "The black ridges",
    "id": "3-4",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "She's leaving chips on the trail. Clever girl.",
    "forkA": "The chips are for us.",
    "forkB": "The chips are for herself.",
    "callback": "Tamsin wasn't asleep; she was counting. Wren is dropping her chips, one by one, on their trail.",
    "riddle": {
      "q": "What follows you all day and vanishes at dark?",
      "a": "your shadow",
      "quip": "Long ones on a ridge at dusk.",
      "accept": [
        "shadow",
        "your shadow"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Agility}, you followed Wren's chips up the ridges. Left for us, or for herself?",
    "fanOutClue": {
      "title": "The crack in the niche",
      "text": "A single die, carved from bone, its spots worn almost smooth by somebody's fingers. Whoever slept here had long nights too.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 3,
    "day": 5,
    "place": "The shepherd's hut",
    "id": "3-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "That was an empty hut. Come nearer the fire.",
    "forkA": "They left her bed as a message.",
    "forkB": "They left it in a hurry.",
    "callback": "At the mine someone took the time to bind Tamsin's hand in clean linen. Here someone folded one blanket with care, and threw the other down.",
    "riddle": {
      "q": "What goes through a door but never goes in or out?",
      "a": "a keyhole",
      "quip": "Doors keep secrets better than people.",
      "accept": [
        "a keyhole",
        "keyhole"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, what tool cuts letters like that into wood?",
    "fanOutClue": {
      "title": "Cut twice",
      "text": "Each stroke of the name has been cut twice, the second pass deeper than the first.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 3,
    "day": 6,
    "place": "The cairn",
    "id": "3-6",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Fire's built up. Sit by it before you decide anything.",
    "forkA": "We go in now.",
    "forkB": "We watch the lamp first.",
    "callback": "Corin said Wren's home was always warm. Tonight the map ends at a hill that breathes warm air.",
    "riddle": {
      "q": "What can you keep only after you've given it?",
      "a": "your word",
      "quip": "Mind who hears yours.",
      "accept": [
        "word",
        "your word"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, a lamp went into the hill ahead of us. Whose was it?",
    "fanOutClue": {
      "title": "No horses",
      "text": "Not one horse is tethered at the foot of the Kiln, though six rode this way.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 4,
    "day": 1,
    "place": "Under the Kiln, then Ashcombe",
    "id": "4-1",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Count yourselves. I will, too.",
    "forkA": "He had help in the room.",
    "forkB": "He didn't need any.",
    "callback": "Every one of them you've fought has run at the first gap. Tonight one stood among you with a blade and cut only rope.",
    "riddle": {
      "q": "What can you break without ever touching it?",
      "a": "a promise",
      "quip": "Careful what you hand out.",
      "accept": [
        "a promise",
        "promise"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, the ropes were cut clean in the dark. His own hand, or another's?",
    "fanOutClue": {
      "title": "Follow them",
      "text": "They end where the ash gives out and the rock turns to bare black glass. No prints come in. Whoever cut him loose came over the glass and was waiting.",
      "source": "press-on",
      "bearsOnFork": "A",
      "qaNote": "Existing [PRESS ON] detail (build log L6: check against Ep6 twist before changing)."
    }
  },
  {
    "week": 4,
    "day": 2,
    "place": "The north road",
    "id": "4-2",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Cold road. Put your hands round that cup.",
    "forkA": "The box matters more than the swords.",
    "forkB": "The swords are the real message.",
    "callback": "The carter's coin has the king's face scraped off. Meira wrote that every record of him had been scraped clean.",
    "riddle": {
      "q": "What has a head and a tail but no body?",
      "a": "a coin",
      "quip": "Someone scrubbed a face off this one.",
      "accept": [
        "a coin",
        "coin"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, who scrapes a face off a coin?",
    "fanOutClue": {
      "title": "Every eye on the cart",
      "text": "The carter says the four never spoke to each other, and never once looked at the road or the lake. Every eye stayed on the cart.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 4,
    "day": 3,
    "place": "Reedham",
    "id": "4-3",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": "A lamp in a window at noon. Somebody has kept it lit for eight nights.",
    "forkA": "They're waiting for the right night.",
    "forkB": "They're waiting for the right child.",
    "callback": "In Ashcombe a baby born when the moon goes out is given a chip of black glass. In Reedham every window is lit for one.",
    "riddle": {
      "q": "What gets wetter the more it dries?",
      "a": "a towel",
      "quip": "Hang it by the fire.",
      "accept": [
        "a towel",
        "towel"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, what does a skiff tell you about its owner?",
    "fanOutClue": {
      "title": "The oars at dusk",
      "text": "On the shingle the fisherman says he hears oars out on the lake every night, at the same hour, just after dusk. He has never gone to look.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 4,
    "day": 4,
    "place": "Old Reedham",
    "id": "4-4",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Meira had a gloss for it: 'the old songs' word for the marked.' She was careful with her words.",
    "forkA": "'Moon-blood' just means the marked children.",
    "forkB": "It means something else.",
    "callback": "At the ford, Tamsin's small prints stopped at the water. Today Joss's stop at the edge of deep water.",
    "riddle": {
      "q": "What is full of holes but still holds water?",
      "a": "a sponge",
      "quip": "A drowned street is a sponge.",
      "accept": [
        "a sponge",
        "sponge"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, why would Meira use an old song's word when a plain one would do?",
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
    "place": "The reed island",
    "id": "4-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Pale curls of whittled wood. Somebody's still carving.",
    "forkA": "They still move Joss by boat.",
    "forkB": "Joss is held in one place now.",
    "callback": "At the Widow's Tooth a little carved horse was left behind. Today, in their boat, a little carved hull was thrown away.",
    "riddle": {
      "q": "What floats when empty and sinks when full?",
      "a": "a boat",
      "quip": "Yours is on loan. I'd return it.",
      "accept": [
        "a boat",
        "boat"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, they moved Joss by water once. Would they risk the lake again?",
    "fanOutClue": {
      "title": "Long curls",
      "text": "Every curl in the bottom of the boat is long and unbroken, and all of them are fresh. Nobody hurried him.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 4,
    "day": 6,
    "place": "The tower at night",
    "id": "4-6",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": "Someone lay under that tower and heard every word.",
    "forkA": "Someone followed us.",
    "forkB": "Someone was already there.",
    "callback": "Yesterday you took their boat. Tonight someone took your words.",
    "riddle": {
      "q": "What can you hear but never touch?",
      "a": "an echo",
      "quip": "Towers hand it back.",
      "accept": [
        "an echo",
        "echo"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, whoever lay under the tower: did they follow us, or wait for us?",
    "fanOutClue": {
      "title": "The rings",
      "text": "As you tie up at the tower, rings are already spreading from the dark under its wall, and your oars have been still for a minute.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 5,
    "day": 1,
    "place": "Reedham, and the waystone",
    "id": "5-1",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "North, then. That's a long road for tired boots.",
    "forkA": "The fifth is a Stone like the others.",
    "forkB": "The fifth is something different.",
    "callback": "Meira looked for a fifth and never found one. Today, on the road north, somebody had cut a line out of a stone.",
    "riddle": {
      "q": "What goes on for miles but never moves?",
      "a": "a road",
      "quip": "North, and mind your boots.",
      "accept": [
        "a road",
        "road"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, what would a dead city hide?",
    "fanOutClue": {
      "title": "The crisp edge",
      "text": "Frost has eaten the old carving, but the edges of the cut-out line are crisp. Not one letter of it is left.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 5,
    "day": 2,
    "place": "The old kingdom's road",
    "id": "5-2",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "The grass on a war grave shouldn't shiver. I'd say that's the heartbeat.",
    "forkA": "The beat calls them north.",
    "forkB": "The beat only maddens them.",
    "callback": "On the Stillwater the birds went quiet at the first beat. Tonight the dogs came with it.",
    "riddle": {
      "q": "What bends in the wind but never breaks?",
      "a": "grass",
      "quip": "Not this lot.",
      "accept": [
        "grass"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Might}, you stood over the cart. Did the beat call those dogs, or only madden them?",
    "fanOutClue": {
      "title": "Heads down",
      "text": "When the beat stops, every dog stops with it, heads down, mid-stride. Not one runs away, and not one comes on.",
      "source": "new",
      "bearsOnFork": "both",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 5,
    "day": 3,
    "place": "The herald's gate",
    "id": "5-3",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A bar of new timber in brackets worn bright. Somebody's been barring this gate for centuries, and the wood's new.",
    "forkA": "The bar keeps the world out.",
    "forkB": "The bar keeps something in.",
    "callback": "Upriver, somebody kept a hidden path clear and a dog on new iron. Here somebody keeps a new bar on an old gate.",
    "riddle": {
      "q": "The more of me there is, the less you see. What am I?",
      "a": "darkness",
      "quip": "The city has plenty.",
      "accept": [
        "darkness"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, new wood in brackets worn bright. Who keeps barring this gate?",
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
    "place": "The dead streets",
    "id": "5-4",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": true,
    "opener": "Nobody's kept a fire here for us. Keep this one small.",
    "forkA": "The soldiers are only standing.",
    "forkB": "One helm has turned.",
    "callback": "On the road, when the beat stopped, the dogs stopped where they stood. These soldiers stopped mid-stride, and never started again.",
    "riddle": {
      "q": "What turns but never leaves its post?",
      "a": "a weathervane",
      "quip": "The wind decides. Mostly.",
      "accept": [
        "a weathervane",
        "weathervane"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, did one of those helms turn, or did the dusk play tricks?",
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
    "place": "Below the hall",
    "id": "5-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "One chalk stroke each dusk. Somebody's counting.",
    "forkA": "Their count began when the Stones drank.",
    "forkB": "Their count was set long ago.",
    "callback": "At Reedham they kept Joss eight nights, waiting for something. Here they strike off one night every dusk.",
    "riddle": {
      "q": "What burns shorter every night but is never cut?",
      "a": "a candle",
      "quip": "Fires and candles, same trade.",
      "accept": [
        "a candle",
        "candle"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, what ends when the count ends?",
    "fanOutClue": {
      "title": "One hand",
      "text": "Every stroke on the board is in the same thick, square hand, the crossed ones and the ones still to cross. The chalk has been gone over many times, never redrawn.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 5,
    "day": 6,
    "place": "The wall again",
    "id": "5-6",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "A slit window, a hidden room, a night nobody heard you.",
    "forkA": "The room was built to hide the fifth.",
    "forkB": "The room was built to watch the hall.",
    "callback": "Every map before tonight was read out loud. Tonight it went hand to hand, and nobody heard.",
    "riddle": {
      "q": "What gets bigger the more you take away?",
      "a": "a hole",
      "quip": "A room hollowed out of a wall is one.",
      "accept": [
        "a hole",
        "hole"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, what can you see through one slit?",
    "fanOutClue": {
      "title": "The narrow slit",
      "text": "The slit is no wider than a hand, low in the wall's face. Unless you lean out over the parapet and look straight down the stone, you cannot see it at all.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 6,
    "day": 1,
    "place": "The wall room (Six nights)",
    "id": "6-1",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Quiet's good in a hole in a wall. I'll take it.",
    "forkA": "They think the light was nothing.",
    "forkB": "They know someone's in the wall.",
    "callback": "At dusk you crossed the wall and nobody heard. By the end of the night a watchman was looking straight at your window.",
    "riddle": {
      "q": "What can fill a room and take no space?",
      "a": "light",
      "quip": "A little of it, please.",
      "accept": [
        "light"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Aim}, an arrow under the window, pointing down. What does it want us to find?",
    "fanOutClue": {
      "title": "No light inside",
      "text": "Not a candle burns in the room. Every lantern you can see from the slit is out in the square, and none of them reaches in.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 6,
    "day": 2,
    "place": "The barracks under the wall (Five nights)",
    "id": "6-2",
    "narratedNoGarrick": false,
    "tone": "quiet",
    "cupNight": false,
    "opener": "The dead move when nobody watches, and they passed you by. Sit down a minute.",
    "forkA": "They go up to the hall to answer a call.",
    "forkB": "They go up to guard it.",
    "callback": "Last week you couldn't be sure a helm had turned toward you. Today one stood in your doorway and looked at the fallen stone instead.",
    "riddle": {
      "q": "What can you hold but never see, and the more you hold it the less you speak?",
      "a": "your breath",
      "quip": "Hold yours.",
      "accept": [
        "breath",
        "your breath"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Agility}, the dead passed us by on their way up. Called, or on guard?",
    "fanOutClue": {
      "title": "The swept racks",
      "text": "The spear-racks along the wall are empty, and the dust under every one is swept clean in the same short arc.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 6,
    "day": 3,
    "place": "The great square (Four nights)",
    "id": "6-3",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "The hall's warm from within. More faithful arriving. What's missing is a door.",
    "forkA": "There is no way in at the front.",
    "forkB": "There is, and it isn't ours.",
    "callback": "The soldiers are three streets nearer the hall. Round the Order's fire there are twice as many as before.",
    "riddle": {
      "q": "What is warm in the cold but has no fire?",
      "a": "a blanket",
      "quip": "Bring one.",
      "accept": [
        "a blanket",
        "blanket"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, where would the Seekers have left a door?",
    "fanOutClue": {
      "title": "The fire",
      "text": "Eleven watchmen. Six have road-dust to the knee and packs not yet unrolled. They did not send for men to hunt you; these were already coming for the night.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 6,
    "day": 4,
    "place": "The hill behind the hall (Three nights)",
    "id": "6-4",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "That hill was steeper than it looked. Sit.",
    "forkA": "The rock waits for the dark moon.",
    "forkB": "The rock will open for us now.",
    "callback": "Upriver, a dog on a chain kept the hidden path. Today a soldier stood in the crack with its back to the hall.",
    "riddle": {
      "q": "What changes shape but is never touched?",
      "a": "the moon",
      "quip": "It keeps its own hours.",
      "accept": [
        "moon",
        "the moon"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Craft}, nobody has walked that crack before us. Why keep a soldier at it?",
    "fanOutClue": {
      "title": "The untouched grit",
      "text": "Past where the soldier stood, the grit on the crack's floor lies smooth and untouched. Your boots are the first marks in it.",
      "source": "new",
      "bearsOnFork": "A",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
    }
  },
  {
    "week": 6,
    "day": 5,
    "place": "The moon-tower (Two nights)",
    "id": "6-5",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": false,
    "opener": "Two nights. Eat while there's something to eat.",
    "forkA": "The Seekers chose the dark moon.",
    "forkB": "The dark moon came by chance.",
    "callback": "The Order's board has counted down for generations. The sky-watchers' wall, counted forward, lands on the same night.",
    "riddle": {
      "q": "What is taken every night and returned at dawn?",
      "a": "sleep",
      "quip": "Get some.",
      "accept": [
        "sleep"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, the sky-watchers' record stops on one night. Why that night?",
    "fanOutClue": {
      "title": "The blank stone",
      "text": "On the ledge under the last moon, a chisel is lying where it was put down, the mallet beside it. Nobody came back for them.",
      "source": "press-on",
      "bearsOnFork": "both",
      "qaNote": "Existing [PRESS ON] detail."
    }
  },
  {
    "week": 6,
    "day": 6,
    "place": "The crack in the hill (One night)",
    "id": "6-6",
    "narratedNoGarrick": false,
    "tone": "wry",
    "cupNight": true,
    "opener": "Last night of the count. Eat what you like.",
    "forkA": "We open the rock tomorrow night.",
    "forkB": "The door is not ours to open tomorrow.",
    "callback": "Six nights ago you had a hidden room. Tonight you have one stroke left.",
    "riddle": {
      "q": "What gets better when you share it and worse when you keep it?",
      "a": "a story",
      "quip": "Tell one.",
      "accept": [
        "a story",
        "story"
      ],
      "maxTries": 3
    },
    "nudge": "{friend:Intellect}, not one of the dead turned its head. What do they know that we don't?",
    "fanOutClue": {
      "title": "Every helm to the hall",
      "text": "From the crack's mouth you can see the whole street climbing toward you. Every helm in it is turned to the hall, not one to the hill.",
      "source": "new",
      "bearsOnFork": "B",
      "qaNote": "Rewritten 10 Oct after the check against the chapter text."
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
        parts.push(`cleared the landmark roll at ${params.dayEntry.place}`);
      } else if (params.bruisedScrapeByYou) {
        parts.push(`pressed through a bruised scrape at ${params.dayEntry.place}`);
      }
      if (params.relicGiftedByYouTo) {
        parts.push(`handed a Relic to ${params.relicGiftedByYouTo}`);
      }
    }

    if (params.clueContributors.includes(fid)) {
      parts.push(`brought back "${params.dayEntry.fanOutClue.title}" from Fan Out`);
    }

    const solvedW1 =
      params.solvedWord1By &&
      params.solvedWord1By.toLowerCase() === fname.toLowerCase();
    const solvedW2 =
      params.solvedWord2By &&
      params.solvedWord2By.toLowerCase() === fname.toLowerCase();

    if (solvedW1 && solvedW2) {
      parts.push(`unlocked both stone-words on Fragment ${params.dayEntry.id}`);
    } else if (solvedW1 || solvedW2) {
      parts.push(
        `unlocked lock-word ${solvedW1 ? '1' : '2'} on Fragment ${params.dayEntry.id}`
      );
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

