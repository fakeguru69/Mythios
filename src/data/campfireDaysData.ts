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

export const CUP_NIGHT_LINES: Readonly<Record<string, string>> = {
  '1-2':
    'Garrick pours one extra tin cup and sets it at the empty place at the edge of the firelight without a word.',
  '1-6':
    'At the corner of the table, Garrick pours the extra tin cup to the exact same measure as the rest and leaves it at the empty place.',
  '2-1':
    'Before he sits by the coals, Garrick sets the extra tin cup at the empty place again, just as he did at the inn.',
  '2-6':
    'There is not much left in the flask, but Garrick pours the extra tin cup anyway and sets it on a flat stone at the empty place.',
  '3-4':
    'Out in the burned hills, Garrick still sets the extra tin cup on a warm black stone at the empty place before he takes his seat.',
  '4-2':
    'By the dark water, Garrick sets the extra tin cup at the empty place and rests two fingers on the rim for a beat before turning to the fire.',
  '5-4':
    'Garrick sets the extra tin cup full by the shutter at the empty place — the family habit he has kept every week since the inn.',
  '6-6':
    'For the last night before the hall, Garrick pours the extra tin cup and sets it at the empty place where someone has been waited for from the start.',
};

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
    "questionTitle": "Were you meant to have the list?",
    "forkA": "He was sent to put it in your hands.",
    "forkB": "You took it off a man carrying it somewhere else.",
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
    "opener": "Four strangers, four torn pages, and an empty chair upstairs. Pull up to the hearth.",
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
      "clickText": "Every slip still sits where she pinned it, and the page about the child is the one her thumb wore soft. A woman packing in fear does not leave her book in order. She did not go in a hurry."
    },
    "clicks": [
      {
        "a": "1-2-2",
        "b": "1-2-3",
        "text": "Every slip still sits where she pinned it, and the page about the child is the one her thumb wore soft. A woman packing in fear does not leave her book in order. She did not go in a hurry.",
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
    "opener": "Smoke over the valley, and a man who bolted the moment he saw you. Sit and catch your breath.",
    "questionTitle": "When he ran for the smoke, was he running home?",
    "forkA": "Fenmark is his.",
    "forkB": "Fenmark is on his way.",
    "callback": "The man on the forest road was carrying her rubbing. The man in the bracken was watching her rock.",
    "riddle": null,
    "nudge": "{friend:Agility}, he ran toward the smoke. What lies that way for a man like him?",
    "nudgeIfLaid": {
      "piece": "1-3-3",
      "line": "{friend:Aim}, fresh pale notches cut down one side of that stick. What was he keeping count of in the bracken?"
    },
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
      "line": "{friend:Charm}, three doors, with children behind them. Why hers?"
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
    "nudge": "{friend:Intellect}, she knows him by a knife, and the knife in that camp is a kitchen blade. Which do you trust?",
    "nudgeIfLaid": {
      "piece": "1-5-1",
      "line": "{friend:Charm}, she never saw his face, only the knife. How many men carry a blade like that?"
    },
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
    "nudgeIfLaid": {
      "piece": "1-6-1",
      "line": "{friend:Aim}, those threads are at a child's height, and they are not in the ruts. Who was walking where the cart was not?"
    },
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
    "opener": "An empty slot in the mine wall, and a cart going down the valley in the dark. Take a place by the coals.",
    "questionTitle": "The cart passed three sleeping farms in the dark and stopped only at the mill. Why?",
    "forkA": "Someone was waiting on the road to guide them in.",
    "forkB": "They had one destination before they ever entered the valley.",
    "callback": "The mine wall put Tamsin's name first and Corin's second. Tamsin heard them say \"the mill boy next\".",
    "riddle": null,
    "nudge": "{friend:Aim}, an old man with two winters of firewood split behind him, watching one road. What was he waiting for?",
    "nudgeIfLaid": {
      "piece": "2-1-3",
      "line": "{friend:Agility}, those ruts at the upriver turn sank deeper coming down than going up. What weight did the cart take out of this valley?"
    },
    "puzzle": {
      "q": "Did anyone have to lead that horse, or did it already know the door?",
      "clickText": "In full dark and with no lamp, the horse took the fork at a steady walk, and the wheels never checked at any other house in the lane. Either the horse knew the mill road, or someone walked ahead of it."
    },
    "clicks": [
      {
        "a": "2-1-1",
        "b": "2-1-2",
        "text": "In full dark and with no lamp, the horse took the fork at a steady walk, and the wheels never checked at any other house in the lane. Either the horse knew the mill road, or someone walked ahead of it.",
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
    "opener": "Asked for by name, and by the night he was born. That's a strange thing to ask for.",
    "questionTitle": "How did a stranger know the night the boy was born?",
    "forkA": "From an old record kept somewhere far from here.",
    "forkB": "Someone from this valley told him.",
    "callback": "In the mine, that shape was a hole, and what sat in it was gone. Here it's cut into the mill's footing.",
    "riddle": null,
    "nudge": "{friend:Craft}, look at that footing stone again. The wheel is fifty years old, but the mark under it is older than the valley. How long has that mark been waiting?",
    "nudgeIfLaid": {
      "piece": "2-2-3",
      "line": "{friend:Craft}, grass cropped short in a wide half-circle where the cart stood. How long was that horse tethered in the yard before anyone went inside?"
    },
    "puzzle": {
      "q": "Did he hesitate once he reached the house?",
      "clickText": "The mud on the floorboards runs in one unbroken line from the door to the child's bed, and the paper was in his fist before he crossed the threshold. He did not search the house."
    },
    "clicks": [
      {
        "a": "2-2-1",
        "b": "2-2-2",
        "text": "The mud on the floorboards runs in one unbroken line from the door to the child's bed, and the paper was in his fist before he crossed the threshold. He did not search the house.",
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
    "opener": "A stranger dead at a lock, and the lock opens for you. Stone doesn't have favorites without a reason.",
    "questionTitle": "The dead man picked at the housing for days. Why did it give under your bare hand?",
    "forkA": "The stone woke to the fragments in our pack.",
    "forkB": "The stone woke to the hand that touched it.",
    "callback": "Corin was asked for by name. Today a lock that wouldn't open for a dead man opened for you.",
    "riddle": null,
    "nudge": "{friend:Intellect}, a dog chained between two rocks four nights ago, fed fresh meat, and a dead man left on the path. Who is keeping that road?",
    "nudgeIfLaid": {
      "piece": "2-3-3",
      "line": "{friend:Might}, clean water and fresh meat set behind that dog. How long ago was the path-keeper standing where you stood?"
    },
    "puzzle": {
      "q": "Why didn't anyone rob him?",
      "clickText": "He worked that stone for days with steel, and his belt is still weighted with coin. The path-keeper stepped over his body for a week and took neither his tools nor his purse."
    },
    "clicks": [
      {
        "a": "2-3-1",
        "b": "2-3-2",
        "text": "He worked that stone for days with steel, and his belt is still weighted with coin. The path-keeper stepped over his body for a week and took neither his tools nor his purse.",
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
    "opener": null,
    "narratedSilence": "Garrick sets the pot off the coals without a word and sits with his back to the rock, listening to the wind over the hillside.",
    "questionTitle": "They pulled the ladder, but they didn't run. Why didn't they scatter when we were spotted?",
    "forkA": "They have too many guards down there to fear four people.",
    "forkB": "Whatever they are doing to the boy cannot be paused for anything.",
    "callback": "Yesterday a branch swung on the slope with no wind. Today they knew you were at the shaft.",
    "riddle": null,
    "nudge": "{friend:Charm}, you saw his hands before they hauled the ladder up. Not a scratch on him yet. What are they waiting for?",
    "nudgeIfLaid": {
      "piece": "2-4-3",
      "line": "{friend:Intellect}, the heads turned when the shout went up, yet the chant never broke. What matters more to them than four strangers at the lip?"
    },
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
    "opener": "A circle of black cloth, and a man who fought without a word. Somebody wanted a name forgotten.",
    "questionTitle": "Meira found every record of him scraped clean. Who erased his name from the world?",
    "forkA": "His enemies tore his name down to break those who followed him.",
    "forkB": "His own people hid his name to keep what he did a secret.",
    "callback": "On Day 2 a horn button, on Day 3 a dead stranger. Tonight, a circle.",
    "riddle": null,
    "nudge": "{friend:Intellect}, a scout who fights without a sound, tears his own coat to get free, and flashes a lamp twice toward the dark. Who teaches a man to fight like that?",
    "nudgeIfLaid": {
      "piece": "2-5-1",
      "line": "{friend:Craft}, chisel scars weathered grey where an entire face of stone was ground flat. Who had the days and the leave to do that in the open?"
    },
    "puzzle": {
      "q": "Were the stones broken or hidden?",
      "clickText": "The carved monuments on the ridge were shattered with fire and mallet, but the cut stones in the sheepfold were laid face-inward against each other. Some were broken in anger, and some were hidden with care."
    },
    "clicks": [
      {
        "a": "2-5-2",
        "b": "2-5-3",
        "text": "The carved monuments on the ridge were shattered with fire and mallet, but the cut stones in the sheepfold were laid face-inward against each other. Some were broken in anger, and some were hidden with care.",
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
    "opener": "Picks in the deep rock. They're digging toward something that was here before them.",
    "questionTitle": "The fragments drew a map to an older room. Why are they digging toward that same room tonight?",
    "forkA": "They know what is inside that room, and came to take it.",
    "forkB": "They are digging toward the boy, and do not know the old room exists.",
    "callback": "In the mine, you reached the mark after it was emptied. Tonight they're still digging toward the older room.",
    "riddle": null,
    "nudge": "{friend:Might}, feel that rhythm through the turf. Those picks are driving straight toward the old room under the lamps. What do they think is waiting in it?",
    "nudgeIfLaid": {
      "piece": "2-6-3",
      "line": "{friend:Agility}, thick dust on the first step down and no print in it but yours. If they haven't found this stair, how are they trying to reach that room?"
    },
    "puzzle": {
      "q": "What are the picks searching for?",
      "clickText": "The pick-strokes fall in one unbroken line toward the deeper stone, and every basket of earth is sifted through bare fingers. They are not clearing rock for a tunnel. They are searching for something small."
    },
    "clicks": [
      {
        "a": "2-6-1",
        "b": "2-6-2",
        "text": "The pick-strokes fall in one unbroken line toward the deeper stone, and every basket of earth is sifted through bare fingers. They are not clearing rock for a tunnel. They are searching for something small.",
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
    "opener": "They told a stolen child she was going home. Eat while you work out whether that was kindness.",
    "questionTitle": "Corin said they promised Wren she was going home first. Why tell a stolen child that?",
    "forkA": "A lie to keep a child quiet and docile on the road.",
    "forkB": "The truth: her home in the burned country is where their work needed her.",
    "callback": "Corin was held a morning's walk from his own mill. Wren was told she was going home first.",
    "riddle": null,
    "nudge": "{friend:Intellect}, a child's mitten tucked in Corin's belt, smelling of sheep. Who gives a mitten to another child in the dark?",
    "nudgeIfLaid": {
      "piece": "3-1-1",
      "line": "{friend:Charm}, a grey woollen mitten in Corin's belt that isn't his. Why leave one mitten with a boy she barely knew?"
    },
    "puzzle": {
      "q": "Did the cart make ready for a long journey?",
      "clickText": "The cart below the shaft took the west road without checking, and on the ridge above the runner paused only to watch that same line. They did not search for a trail. They set their faces toward the burned hills and walked."
    },
    "clicks": [
      {
        "a": "3-1-2",
        "b": "3-1-3",
        "text": "The cart below the shaft took the west road without checking, and on the ridge above the runner paused only to watch that same line. They did not search for a trail. They set their faces toward the burned hills and walked.",
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
    "questionTitle": "The men in grey coats spoke politely and promised she'd only be needed once. Was that courtesy genuine?",
    "forkA": "Yes: they take what the rite requires, and let the children go.",
    "forkB": "No: a polite kidnapper is only a kidnapper who hates a scene.",
    "callback": "Tamsin and Corin each came home with one cut palm, bound clean. Wren's taker said they'd only need her the once.",
    "riddle": null,
    "nudge": "{friend:Charm}, chips of black glass set in a row on her windowsill, dusted around with care. Why leave them behind?",
    "nudgeIfLaid": {
      "piece": "3-2-3",
      "line": "{friend:Craft}, sacking tied over the hooves to quiet them on the stones. If they came in peace, who were they hiding the horses from?"
    },
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
    "questionTitle": "Three children live beside three Seeker marks. Why did the riders carry Wren straight past the Blackglass?",
    "forkA": "They cannot open these ancient housings; they need an older entrance.",
    "forkB": "The marks are not their goal; they are only the guide-stones to the Kiln.",
    "callback": "At the Widow's Tooth a man lay in the bracken watching the rock. Here the riders went past this one without slowing.",
    "riddle": null,
    "nudge": "{friend:Intellect}, Meira's note in the margin: 'Five, the fragment says. Every other record says four.' Why would a scholar write down a number she doubted?",
    "nudgeIfLaid": {
      "piece": "3-3-3",
      "line": "{friend:Aim}, from the lip of the glass you can see straight down to Ashcombe's well. Who was watching whom from this ridge?"
    },
    "puzzle": {
      "q": "Has anyone touched this housing since the road was made?",
      "clickText": "The old shepherds' path ends dead at the sunken stones, and the fine dust over the housing was undisturbed until your fingers reached it. The riders stayed on the crest and rode past without once looking down."
    },
    "clicks": [
      {
        "a": "3-3-1",
        "b": "3-3-2",
        "text": "The old shepherds' path ends dead at the sunken stones, and the fine dust over the housing was undisturbed until your fingers reached it. The riders stayed on the crest and rode past without once looking down.",
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
    "opener": "Whoever slept in these niches had long nights too. Build the fire in the doorway.",
    "questionTitle": "Wren is dropping glass chips from the saddle of six horses. Have the riders truly not noticed?",
    "forkA": "They believe a small child is helpless and don't watch her hands.",
    "forkB": "They see the chips, but know the trail ends where no one can follow.",
    "callback": "Tamsin wasn't asleep; she was counting. Wren is dropping her chips, one by one, on their trail.",
    "riddle": null,
    "nudge": "{friend:Craft}, each glass chip set on high bare rock beside the tallest dead tree, and scratched on the back in order. Why number a trail unless she expects us to read it?",
    "nudgeIfLaid": {
      "piece": "3-4-2",
      "line": "{friend:Aim}, every chip dropped beside the tallest dead tree in sight, each visible from the last. How did a child on a horse sight a line like that?"
    },
    "puzzle": {
      "q": "Did she drop the chips in haste or with care?",
      "clickText": "Each chip was set on high bare rock where the starlight catches it, and the backs are scored with tiny knife-scratches: one, two, three. She is laying a numbered line across the dark."
    },
    "clicks": [
      {
        "a": "3-4-1",
        "b": "3-4-3",
        "text": "Each chip was set on high bare rock where the starlight catches it, and the backs are scored with tiny knife-scratches: one, two, three. She is laying a numbered line across the dark.",
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
    "opener": "For the first time all season, they ran. Sit down and breathe.",
    "questionTitle": "They gave Wren the warm bed by the hearth, yet fled in the night leaving their pot on the fire. What made them run?",
    "forkA": "Fear: our fire on the ridge showed them they were being hunted.",
    "forkB": "The hour: the time for waiting expired, and the Kiln must be lit.",
    "callback": "At the mine someone took the time to bind Tamsin's hand in clean linen. Here someone folded one blanket with care, and threw the other down.",
    "riddle": null,
    "nudge": "{friend:Might}, cut deep into the beam over her bed: 'Until the throne rise whole.' Who carves a prayer over a stolen child's pillow?",
    "nudgeIfLaid": {
      "piece": "3-5-1",
      "line": "{friend:Craft}, each letter of her name cut twice into the doorframe. How long was she left alone in that room with a blade?"
    },
    "puzzle": {
      "q": "How quickly did they depart?",
      "clickText": "By the spring a full water skin lies abandoned where it was dropped, while inside the hut Wren's keepsakes were left undisturbed in their row on the sill. The hurry was sudden, but it began outside the room."
    },
    "clicks": [
      {
        "a": "3-5-2",
        "b": "3-5-3",
        "text": "By the spring a full water skin lies abandoned where it was dropped, while inside the hut Wren's keepsakes were left undisturbed in their row on the sill. The hurry was sudden, but it began outside the room.",
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
    "questionTitle": "An hour after we read the map into the wind, a single lamp climbed the Kiln and went inside. Who carried it?",
    "forkA": "A watcher who heard our voices and went in to warn the others.",
    "forkB": "The last of the faithful arriving for the ritual, unaware of us.",
    "callback": "Corin said Wren's home was always warm. Tonight the map ends at a hill that breathes warm air.",
    "riddle": null,
    "nudge": "{friend:Agility}, one lamp went into that hill an hour after we spoke the map, and now smoke is rising from the crown. Did our voices call them in, or was the fire already laid?",
    "nudgeIfLaid": {
      "piece": "3-6-3",
      "line": "{friend:Agility}, loose scree on both sides of the knife-edge now the light has gone. How many times has that lamp climbed this ridge in the dark?"
    },
    "puzzle": {
      "q": "Are the riders still inside the hill?",
      "clickText": "No horses wait outside in the dark, and from the crown's crack thin pale smoke has begun to rise into the cold air. The lamp has reached the deep chamber, and the hearth is burning."
    },
    "clicks": [
      {
        "a": "3-6-1",
        "b": "3-6-2",
        "text": "No horses wait outside in the dark, and from the crown's crack thin pale smoke has begun to rise into the cold air. The lamp has reached the deep chamber, and the hearth is burning.",
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
    "questionTitle": "Someone stood among us in the dark with a bare blade, yet cut only rope. Why spare us?",
    "forkA": "A lone rescuer couldn't risk a fight in the dark without losing the prisoner.",
    "forkB": "They had us at their mercy and were under orders not to harm us.",
    "callback": "Every one of them you've fought has run at the first gap. Tonight one stood among you with a blade and cut only rope.",
    "riddle": null,
    "nudge": "{friend:Craft}, cut rope ends all clean on the same side, a finger's width from the knot. Why cut the prisoner loose in the dark and leave your throats untouched?",
    "nudgeIfLaid": {
      "piece": "4-1-2",
      "line": "{friend:Aim}, he knelt three paces from that dark passage mouth the whole time. Did he choose that spot himself?"
    },
    "puzzle": {
      "q": "How did the prisoner get free in the dark?",
      "clickText": "A lamp was just snuffed inside the side passage, and every rope was severed cleanly on the same side a finger's width from the knot. A second person stepped out of the passage in the dark and cut him loose."
    },
    "clicks": [
      {
        "a": "4-1-1",
        "b": "4-1-3",
        "text": "A lamp was just snuffed inside the side passage, and every rope was severed cleanly on the same side a finger's width from the knot. A second person stepped out of the passage in the dark and cut him loose.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Follow them",
      "text": "They end where the ash gives out and the rock turns to bare black glass. No prints come in. Whoever cut him loose came over the glass and was waiting.",
      "source": "press-on",
      "bearsOnFork": "both",
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
    "questionTitle": "Four armed riders guarded one small box from the Kiln, riding away from the lake. Why guard that box harder than the boy?",
    "forkA": "The box holds what they actually came for; the child only wakes it.",
    "forkB": "The cart was an open-road decoy meant to draw our eyes off the lake.",
    "callback": "The carter's coin has the king's face scraped off. Meira wrote that every record of him had been scraped clean.",
    "riddle": null,
    "nudge": "{friend:Intellect}, bare swords across their saddles and eyes never leaving a single small box in the cart-bed. Why ride like that in broad daylight?",
    "nudgeIfLaid": {
      "piece": "4-2-1",
      "line": "{friend:Intellect}, the carter says not one of the four looked at the lake or the road—every eye stayed on that box. What rides in a box like that?"
    },
    "puzzle": {
      "q": "Were the four riders trying to hide their journey north?",
      "clickText": "They rode the ford in broad daylight with bare blades across their saddles, and kept to the open road past every hut when the ridge sheep-path would have hidden them. They were either daring anyone to stop them, or making sure the cart was seen."
    },
    "clicks": [
      {
        "a": "4-2-2",
        "b": "4-2-3",
        "text": "They rode the ford in broad daylight with bare blades across their saddles, and kept to the open road past every hut when the ridge sheep-path would have hidden them. They were either daring anyone to stop them, or making sure the cart was seen.",
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
    "questionTitle": "They took Joss eight nights ago — before we even reached the Kiln — and have kept him on the water ever since. What are they waiting for?",
    "forkA": "A night or a water-level that hasn't come yet to reach the drowned chamber.",
    "forkB": "Someone else who had not reached Reedham yet: they have been waiting for us.",
    "callback": "In Ashcombe a baby born when the moon goes out is given a chip of black glass. In Reedham every window is lit for one.",
    "riddle": null,
    "nudge": "{friend:Craft}, eight notches cut in her doorpost wood, and a boat heavier than her skiff touching the shingle by night. Why keep him on the lake for eight nights without leaving?",
    "nudgeIfLaid": {
      "piece": "4-3-3",
      "line": "{friend:Aim}, weed scraped clean off the lowest sill facing Reedham. How long has someone been sitting in that dark tower watching the shore?"
    },
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The oars at dusk",
      "text": "On the shingle the fisherman says he hears oars out on the lake every night, at the same hour, just after dusk. He has never gone to look.",
      "source": "new",
      "bearsOnFork": "both",
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
    "opener": "Drowned roofs under the keel, and a page of Meira's notes that survived the ash. Let's hear what you found.",
    "questionTitle": "Meira's note says 'moon-blood' is the old word for the marked, and the fragment warns against letting it near. What is the fragment warning against?",
    "forkA": "Letting a marked child's blood touch the Stones — the Order is doing what the Seekers feared.",
    "forkB": "Letting a specific bloodline from the old songs near — 'moon-blood' may mean more than the birth-mark.",
    "callback": "At the ford, Tamsin's small prints stopped at the water. Today Joss's stop at the edge of deep water.",
    "riddle": null,
    "nudge": "{friend:Intellect}, she copied 'the marked' on one page and 'moon-blood' on another, then crossed out her second line in the margin until the nib tore through. What thought frightened her enough to scratch it through the paper?",
    "nudgeIfLaid": {
      "piece": "4-4-1",
      "line": "{friend:Craft}, the same iron lamp-hooks in the drowned windows below the water as in Reedham's windows tonight. How old is the watch this village keeps?"
    },
    "puzzle": {
      "q": "Was Meira sure of her own note on 'moon-blood'?",
      "clickText": "Meira copied 'the marked' and 'moon-blood' from two separate old records, and under her gloss she began a second thought before scratching it out through the paper. She had a second thought she never finished."
    },
    "clicks": [
      {
        "a": "4-4-2",
        "b": "4-4-3",
        "text": "Meira copied 'the marked' and 'moon-blood' from two separate old records, and under her gloss she began a second thought before scratching it out through the paper. She had a second thought she never finished.",
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
    "questionTitle": "They ferry Joss between the island and the drowned streets by night, yet tonight a lamp is crossing to the empty tower. Why the tower tonight?",
    "forkA": "They shift their watch-post across the lake so no one on shore can fix where the boy is held.",
    "forkB": "They know we took their boat on the island today and are setting a watch for us at the tower.",
    "callback": "At the Widow's Tooth a little carved horse was left behind. Today, in their boat, a little carved hull was thrown away.",
    "riddle": null,
    "nudge": "{friend:Aim}, three willow cuts—one grey, one brown, one white—and tonight a single lamp moving out toward the tower. Why row to an empty stone tower on the third night?",
    "nudgeIfLaid": {
      "piece": "4-5-2",
      "line": "{friend:Craft}, a dry blanket folded small under the stern seat, out of the spray. Why take such care of a boy they mean to use?"
    },
    "puzzle": {
      "q": "How has Joss been kept on the reed island?",
      "clickText": "The willow has had fresh shoots cut three days running, and the long shavings in the boat's bilge were carved without haste. They have kept him dry and unharmed on the island by day while moving him across the lake by night."
    },
    "clicks": [
      {
        "a": "4-5-1",
        "b": "4-5-3",
        "text": "The willow has had fresh shoots cut three days running, and the long shavings in the boat's bilge were carved without haste. They have kept him dry and unharmed on the island by day while moving him across the lake by night.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Long curls",
      "text": "Every curl in the bottom of the boat is long and unbroken, and all of them are fresh. Nobody hurried him.",
      "source": "new",
      "bearsOnFork": "both",
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
    "questionTitle": "A boat lay in the black water right under the tower wall while the map was read aloud. Why was it waiting under an empty tower?",
    "forkA": "They posted a listener at the tower waiting for us to assemble the map and speak the way aloud.",
    "forkB": "They were keeping watch on the shore road and hid under the wall when they heard our oars.",
    "callback": "Yesterday you took their boat. Tonight someone took your words.",
    "riddle": null,
    "nudge": "{friend:Aim}, water rings spreading under the stones while our oars were already still, and a brief light out toward the island. Why wait in the dark under an empty tower until we spoke?",
    "nudgeIfLaid": {
      "piece": "4-6-2",
      "line": "{friend:Aim}, one brief light low on the water toward the island, then dark again. Who was waiting out there for that signal?"
    },
    "puzzle": null,
    "clicks": [],
    "fanOutClue": {
      "title": "The rings",
      "text": "As you tie up at the tower, rings are already spreading from the dark under its wall, and your oars have been still for a minute.",
      "source": "new",
      "bearsOnFork": "A",
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
    "questionTitle": "The Seekers scattered four Stones to the far corners of the land, yet left the fifth at Highwall. Why keep it in the dead city?",
    "forkA": "They kept the fifth at Highwall to stand guard over him where he fell.",
    "forkB": "The fifth could not be carried away from Highwall without waking him.",
    "callback": "Meira looked for a fifth and never found one. Today, on the road north, somebody had cut a line out of a stone.",
    "riddle": null,
    "nudge": "{friend:Intellect}, the miles left standing on the stone, and the second line under Highwall cut away to the last letter. Whose name sat under the city's?",
    "nudgeIfLaid": {
      "piece": "5-1-3",
      "line": "{friend:Charm}, every window in Reedham lit at midday as if the dark moon were tonight. What did that village feel in the water before we left?"
    },
    "puzzle": {
      "q": "Was the waystone only a road marker, or part of the Seekers' trail?",
      "clickText": "The line under HIGHWALL was chiselled clean away like the king's face on the coin, and the crack at the stone's foot holds the same unnatural cold as every Seeker housing. The road marker was defaced, and the Seekers set their first sign in its foot."
    },
    "clicks": [
      {
        "a": "5-1-1",
        "b": "5-1-2",
        "text": "The line under HIGHWALL was chiselled clean away like the king's face on the coin, and the crack at the stone's foot holds the same unnatural cold as every Seeker housing. The road marker was defaced, and the Seekers set their first sign in its foot.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "The crisp edge",
      "text": "Frost has eaten the old carving, but the edges of the cut-out line are crisp. Not one letter of it is left.",
      "source": "new",
      "bearsOnFork": "both",
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
    "questionTitle": "The heartbeat comes from Highwall for a few slow strokes at dusk and dawn, then stops. What is keeping him from waking outright?",
    "forkA": "The four Stones have only thinned his sleep; it takes a certain night for him to wake.",
    "forkB": "The fifth Stone is still in Highwall, holding the last of the Seekers' lock shut.",
    "callback": "On the Stillwater the birds went quiet at the first beat. Tonight the dogs came with it.",
    "riddle": null,
    "nudge": "{friend:Might}, one deep bite that held without tearing, and tracks that scattered the moment the beat died. What drove those dogs?",
    "nudgeIfLaid": {
      "piece": "5-2-2",
      "line": "{friend:Craft}, teeth sunk deep once and held without tearing. Why would a starving hound hold a man in place instead of feeding?"
    },
    "puzzle": {
      "q": "Were the dogs hunting for themselves?",
      "clickText": "The dogs came in a straight line from the north while the ground beat, froze mid-stride the instant the beat stopped, and scattered every way after. The beat drove them while it lasted, and let them go when it stopped."
    },
    "clicks": [
      {
        "a": "5-2-1",
        "b": "5-2-3",
        "text": "The dogs came in a straight line from the north while the ground beat, froze mid-stride the instant the beat stopped, and scattered every way after. The beat drove them while it lasted, and let them go when it stopped.",
        "solves": true
      }
    ],
    "fanOutClue": {
      "title": "Heads down",
      "text": "When the beat stops, every dog stops with it, heads down, mid-stride. Not one runs away, and not one comes on.",
      "source": "new",
      "bearsOnFork": "A",
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
    "opener": "High on the wall, and not a breath of green in the whole city. Sit down out of the wind.",
    "questionTitle": "Highwall's gate is barred from the inside with fresh timber in brackets worn bright by centuries of bars. Who is keeping it shut?",
    "forkA": "The Order — keeping the dead city shut so no outsider disturbs their watch on the hall.",
    "forkB": "Wardens left behind on the Seekers' wall — barring the gate to keep what is inside from getting out.",
    "callback": "Upriver, somebody kept a hidden path clear and a dog on new iron. Here somebody keeps a new bar on an old gate.",
    "riddle": null,
    "nudge": "{friend:Craft}, a broken stair knocked out with hammers long ago, and a fresh timber bar below. Who is keeping that gate shut from the inside?",
    "nudgeIfLaid": {
      "piece": "5-3-3",
      "line": "{friend:Craft}, the gatehouse stair knocked out with hammers long ago, while the timber bar below is fresh. Why bar the gate below and break the stair to the wall?"
    },
    "puzzle": {
      "q": "Was the gate barred long ago and left, or is someone tending it now?",
      "clickText": "The timber bar was felled and squared within the last few days, and a single narrow path is trodden in the dust from the gatehouse straight up toward the smoke. Whoever tends the fire below the hall comes down to bar this gate."
    },
    "clicks": [
      {
        "a": "5-3-1",
        "b": "5-3-2",
        "text": "The timber bar was felled and squared within the last few days, and a single narrow path is trodden in the dust from the gatehouse straight up toward the smoke. Whoever tends the fire below the hall comes down to bar this gate.",
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
    "narratedSilence": "Garrick wipes the dust from the cups with his sleeve, pours one more than there are of you, and sets the last at the empty place by the shuttered window facing up the hill. \"Family habit. We always pour one for whoever can't be with us.\"",
    "questionTitle": "Their boots have not stirred the dust in centuries, yet at dusk a helm seemed to turn and metal scraped on stone. Are the standing soldiers waking?",
    "forkA": "No — the dust around every boot is unbroken, and their crooked helms only looked turned in the dusk.",
    "forkB": "Yes — the heartbeat from the hall is beginning to stir them inside their armour.",
    "callback": "On the road, when the beat stopped, the dogs stopped where they stood. These soldiers stopped mid-stride, and never started again.",
    "riddle": null,
    "nudge": "{friend:Aim}, unbroken dust round every boot, and one sound of iron on stone after we barred the door. Did our eyes play tricks in the dusk, or did something move?",
    "nudgeIfLaid": {
      "piece": "5-4-2",
      "line": "{friend:Agility}, one scrape of iron on stone after the door was barred, and then silence. Which way did that helm turn when the beat came?"
    },
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
    "questionTitle": "The Order has camped facing the sealed doors for generations, crossing off one stroke each dusk. What are they counting to?",
    "forkA": "A fixed night on the calendar that they have known from the beginning.",
    "forkB": "A sign from inside the hall as the heartbeat grows strong enough to break the seal.",
    "callback": "At Reedham they kept Joss eight nights, waiting for something. Here they strike off one night every dusk.",
    "riddle": null,
    "nudge": "{friend:Intellect}, every stroke on that board drawn in the same square hand, and every head lifting when the beat comes. What ends when the count ends?",
    "nudgeIfLaid": {
      "piece": "5-5-3",
      "line": "{friend:Agility}, extra bedrolls rolled tight by the fire while the square is quiet. Where is the rest of that watch tonight?"
    },
    "puzzle": {
      "q": "Are they keeping a blind vigil, or counting down to a known hour?",
      "clickText": "Every stroke on the board—the crossed ones and the seven still to cross—was drawn from the start in the same square hand, and at dusk every head lifts together with the beat. The count was fixed before the watch began, and the hall beneath them is keeping the same time."
    },
    "clicks": [
      {
        "a": "5-5-1",
        "b": "5-5-2",
        "text": "Every stroke on the board—the crossed ones and the seven still to cross—was drawn from the start in the same square hand, and at dusk every head lifts together with the beat. The count was fixed before the watch began, and the hall beneath them is keeping the same time.",
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
    "questionTitle": "The fifth Stone lies inside the wall beneath our feet, and we carry the mark in our blood. What happens when we open that room tonight?",
    "forkA": "Our blood will wake the fifth right here in the wall and end his waking.",
    "forkB": "Finding the fifth here is only half the task — it will have to be taken to his hall.",
    "callback": "Every map before tonight was read out loud. Tonight it went hand to hand, and nobody heard.",
    "riddle": null,
    "nudge": "{friend:Aim}, two shallow dips worn into the parapet where elbows rested, facing straight up at the hall. What happens when we open the room under that watch-post tonight?",
    "nudgeIfLaid": {
      "piece": "5-6-2",
      "line": "{friend:Craft}, two shallow dips worn into the stone parapet where elbows rested for years, facing the hall. Who stood that watch over the hidden room, and what were they waiting to see?"
    },
    "puzzle": {
      "q": "How did the room stay hidden from the Order for centuries?",
      "clickText": "The walkway here was built a full stride wider on the city side, and the slit window is set so low in the stone face that it cannot be seen from the square. Anyone not standing on this parapet would take the wall for solid rock."
    },
    "clicks": [
      {
        "a": "5-6-1",
        "b": "5-6-3",
        "text": "The walkway here was built a full stride wider on the city side, and the slit window is set so low in the stone face that it cannot be seen from the square. Anyone not standing on this parapet would take the wall for solid rock.",
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
    "questionTitle": "The searchers walked past our door twice and found nothing, yet the watchman at the board still looked down at the wall at dusk. Why?",
    "forkA": "He still believes someone is hiding in the wall; the Order has not given up the search.",
    "forkB": "He is only checking that the rampart stays dark before he strikes the night's chalk.",
    "callback": "At dusk you crossed the wall and nobody heard. By the end of the night a watchman was looking straight at your window.",
    "riddle": null,
    "nudge": "{friend:Aim}, he paused with the chalk in his hand and looked down the hill at the wall before he struck the board. Was he hunting a light, or keeping a routine?",
    "nudgeIfLaid": {
      "piece": "6-1-2",
      "line": "{friend:Aim}, he stopped with the chalk in his hand and looked straight down at the wall before he struck the board. Was he looking for us, or checking his post?"
    },
    "puzzle": {
      "q": "What was kept in the stone niche before you opened the room?",
      "clickText": "Years of candle-soot blacken the back of the niche facing the inner wall, while tonight no lantern from the square reaches through the slit. For generations a hidden light burned behind the wall in this room; tonight the niche is cold."
    },
    "clicks": [
      {
        "a": "6-1-1",
        "b": "6-1-3",
        "text": "Years of candle-soot blacken the back of the niche facing the inner wall, while tonight no lantern from the square reaches through the slit. For generations a hidden light burned behind the wall in this room; tonight the niche is cold.",
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
    "questionTitle": "When the ceiling came down, a hollowed soldier stood in our doorway, looked at the fallen stone, and walked on toward the hall at the heartbeat. What is moving the dead garrison across Highwall?",
    "forkA": "The waking heart inside the hall is drawing every soldier back to the place where he fell.",
    "forkB": "They are still carrying out their last order from the night the barracks emptied: form ranks at the hall.",
    "callback": "Last week you couldn't be sure a helm had turned toward you. Today one stood in your doorway and looked at the fallen stone instead.",
    "riddle": null,
    "nudge": "{friend:Agility}, empty spear-racks swept clean, bowls never filled, and every iron boot in the city stepping once when the beat comes. Is it the heartbeat pulling them, or their last order?",
    "nudgeIfLaid": {
      "piece": "6-2-3",
      "line": "{friend:Craft}, bowls set out along the kitchen board and a ladle in the cold pot, never filled. What call pulls a whole garrison from the table before the ladle touches a bowl?"
    },
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
    "questionTitle": "The hall's stone wall is warm from the floor up behind sealed bronze doors, while new arrivals stack clean robes by their fire outside. Has the Order already set the four Stones inside, or are they still waiting outside for the last night?",
    "forkA": "The four Stones are already set around him on the floor inside, warming the stone.",
    "forkB": "The Stones are still outside with the faithful, waiting to be carried in on the dark moon.",
    "callback": "The soldiers are three streets nearer the hall. Round the Order's fire there are twice as many as before.",
    "riddle": null,
    "nudge": "{friend:Intellect}, clean robes folded on top of their road-packs outside, and warmth in the stone wall only from knee-height down. Are the four Stones already inside that hall, or still outside with the camp?",
    "nudgeIfLaid": {
      "piece": "6-3-2",
      "line": "{friend:Aim}, road-packs still unrolled by their fire, with clean robes folded on top of every one. Do men pack like that for a battle, or for a rite?"
    },
    "puzzle": {
      "q": "Where is the heat in the hall's wall coming from?",
      "clickText": "An unbroken bank of dust lies across the seam of the bronze doors, and the stone wall is warm only from knee-height down. The front doors have never opened, and whatever is warming the hall lies flat on the floor inside."
    },
    "clicks": [
      {
        "a": "6-3-1",
        "b": "6-3-3",
        "text": "An unbroken bank of dust lies across the seam of the bronze doors, and the stone wall is warm only from knee-height down. The front doors have never opened, and whatever is warming the hall lies flat on the floor inside.",
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
    "opener": "One soldier facing out while a whole city faces in, and the rock behind him beating like a chest. Sit.",
    "questionTitle": "Every other soldier in Highwall faces the hall. Why has this one stood in the mouth of the Seekers' crack since the war ended, facing out?",
    "forkA": "The Seekers left it to bar their own secret passage after they sealed the hall and walked out.",
    "forkB": "It was keeping the king's last watch — guarding the back of his throne against anyone coming down the hill.",
    "callback": "Upriver, a dog on a chain kept the hidden path. Today a soldier stood in the crack with its back to the hall.",
    "riddle": null,
    "nudge": "{friend:Craft}, two hollows worn into solid stone by iron boots, and the heartbeat louder right behind the blank rock than anywhere else. Whose watch was that soldier keeping in the crack?",
    "nudgeIfLaid": {
      "piece": "6-4-3",
      "line": "{friend:Charm}, the beat is louder with your ear on that stone than anywhere in the crack. What is the wall between you and?"
    },
    "puzzle": {
      "q": "How long had the sentinel stood in the mouth of the crack?",
      "clickText": "The grit behind the soldier lay smooth and untouched until your boots marked it, while the rock under its iron soles is worn into two shallow hollows. Nobody has passed down this crack since the war ended, and that soldier never left its post."
    },
    "clicks": [
      {
        "a": "6-4-1",
        "b": "6-4-2",
        "text": "The grit behind the soldier lay smooth and untouched until your boots marked it, while the rock under its iron soles is worn into two shallow hollows. Nobody has passed down this crack since the war ended, and that soldier never left its post.",
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
    "questionTitle": "The sky-watchers' wall stops on the dark moon the night he fell, with a Seeker housing set beside the last cut. Who were the sky-watchers reckoning that cycle for?",
    "forkA": "For the Seekers: they marked the cycle so their descendants could count the blank wall and know the hour.",
    "forkB": "For the king: they were his own watchers, reckoning the return of the dark moon before the city fell.",
    "callback": "The Order's board has counted down for generations. The sky-watchers' wall, counted forward, lands on the same night.",
    "riddle": null,
    "nudge": "{friend:Intellect}, every row spaced a finger's width apart for generations, and slates on the floor scratched with long sums begun again. Who were those sky-watchers counting the dark moons for?",
    "nudgeIfLaid": {
      "piece": "6-5-1",
      "line": "{friend:Intellect}, every moon spaced a finger's width from the last around the whole room. If you measure the blank stone by that same thumb, what night does the count land on?"
    },
    "puzzle": {
      "q": "What were the sky-watchers doing in the days before the wall went blank?",
      "clickText": "The last rows of moons were chiselled in a rough hurry without missing a single night, while the slates on the floor are covered in long sums crossed through and begun again. They were racing to reckon a distant date before the last night came."
    },
    "clicks": [
      {
        "a": "6-5-2",
        "b": "6-5-3",
        "text": "The last rows of moons were chiselled in a rough hurry without missing a single night, while the slates on the floor are covered in long sums crossed through and begun again. They were racing to reckon a distant date before the last night came.",
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
    "questionTitle": "Tomorrow night the Seekers' door opens for our blood, and we carry the fifth Stone into the hall where the four are waiting. What happens when the fifth is brought to him?",
    "forkA": "It finishes what the Seekers built their hidden door for — binding him before the four Stones can wake him.",
    "forkB": "It finishes what the four Stones and the marching garrison are waiting for — waking him whole.",
    "callback": "Six nights ago you had a hidden room. Tonight you have one stroke left.",
    "riddle": null,
    "nudge": "{friend:Intellect}, grit swept in a quarter-circle where the stone door swings inward, and every helm on the hill turned toward the hall. When we carry the fifth through that door tomorrow night, will it bind him or wake him?",
    "nudgeIfLaid": {
      "piece": "6-6-3",
      "line": "{friend:Agility}, every post from the gate-tower to the crossroads stands empty tonight, with only pale boot-marks in the dust. Where has the whole city gathered?"
    },
    "puzzle": {
      "q": "Will the dead garrison see you when the blank rock opens?",
      "clickText": "At the foot of the blank rock the grit is swept in a quarter-circle where a hidden door swings toward you, and outside the crack every helm on the hill is turned toward the hall's great doors. When the Seekers' door opens tomorrow night, the entire garrison will have its back to you."
    },
    "clicks": [
      {
        "a": "6-6-1",
        "b": "6-6-2",
        "text": "At the foot of the blank rock the grit is swept in a quarter-circle where a hidden door swings toward you, and outside the crack every helm on the hill is turned toward the hall's great doors. When the Seekers' door opens tomorrow night, the entire garrison will have its back to you.",
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
      d.nudgeIfLaid?.line || '',
      d.narratedSilence || '',
      d.puzzle?.q || '',
      d.puzzle?.clickText || '',
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

