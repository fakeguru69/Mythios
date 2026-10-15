import { AttributeName } from './mythiosRulesData';
import { getPublicFanOutClue } from './campfireDaysData';

// Fan Out, "the last light" (docs/design/fan-out-and-campfire-proposal.md, approved 14 Oct, Part 1 and §3.2).
// After the day's main beat the player follows ONE lead, or goes straight to the fire.
// - The button names a place or thing at the landmark, never the clue.
// - One quick Challenge (the day's rule, the week's DC); no fight, no gold for now, no growth.
// - The clue always comes back. The roll only decides the first-letter hint for one of the fragment's words.
// - Friends who pick the same lead find the same clue: one board card with every finder's name.

export interface FanOutLeadAction {
  attr: AttributeName;
  /** Canon-style verb for this lead ("follow the ruts until they turn"); empty shows the Attribute only. */
  verb: string;
}

export interface FanOutLead {
  id: string;
  /** What the button shows: a place or thing at the landmark. Empty = the day's place (the fallback lead). */
  place: string;
  actions: FanOutLeadAction[];
  clueTitle: string;
  clueText: string;
  /** Which of the day's two fragment words this lead's letter hint helps. */
  hintFor: 1 | 2;
  /** One line shown on a failed roll ("You find it late, by lamplight."); none until approved. */
  lateLine?: string;
  /** QA only, never shown: which reading of tonight's Fork the clue leans toward. */
  leans?: 'A' | 'B' | 'both';
}

/** Leads Fake Guru has approved, by "week-day". Each day should end up with three.
 *  Week 1 approved 15 Oct (docs/drafts/week-1-fan-out-and-fire-draft.md). */
export const APPROVED_FAN_OUT_LEADS: Record<string, FanOutLead[]> = {
  "1-1": [
    {
      "id": "1-1-1",
      "place": "the list, by the last light",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "read it again, line by line"
        },
        {
          "attr": "Craft",
          "verb": "hold it to the light and look at the ink"
        }
      ],
      "clueTitle": "The even hand",
      "clueText": "Not one name is crossed out or written over. Every line sits level, and the inn's line is in the same hand as the names.",
      "leans": "both",
      "hintFor": 1
    },
    {
      "id": "1-1-2",
      "place": "the trees where he went",
      "actions": [
        {
          "attr": "Agility",
          "verb": "go after him into the trees"
        },
        {
          "attr": "Aim",
          "verb": "pick out his trail in the dusk"
        }
      ],
      "clueTitle": "Two sets of boots",
      "clueText": "Twenty paces in, his prints meet another man's. The two go on together, at a walk.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "1-1-3",
      "place": "the bottom of the cargo box",
      "actions": [
        {
          "attr": "Craft",
          "verb": "take the box apart, board by board"
        },
        {
          "attr": "Intellect",
          "verb": "go through it a third time"
        }
      ],
      "clueTitle": "The oilcloth",
      "clueText": "Under your things lies a square of oilcloth you never packed, folded small. Whatever he put in the box, he wrapped it first against the wet.",
      "leans": "B",
      "hintFor": 2
    }
  ],
  "1-2": [
    {
      "id": "1-2-1",
      "place": "the bottom of her satchel",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "empty it out onto the table"
        },
        {
          "attr": "Craft",
          "verb": "feel along the lining"
        }
      ],
      "clueTitle": "Bread and a candle",
      "clueText": "In the bottom of the satchel: a heel of bread in a cloth, hard as wood, and a new candle that was never lit.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "1-2-2",
      "place": "the notebook, page by page",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "go through it, leaf by leaf"
        },
        {
          "attr": "Craft",
          "verb": "look at how each page is kept"
        }
      ],
      "clueTitle": "Every slip pinned",
      "clueText": "Every loose slip in the notebook is pinned to the page it belongs with. Not one is out of place.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "1-2-3",
      "place": "the seat that was hers",
      "actions": [
        {
          "attr": "Aim",
          "verb": "sit where she sat and look out"
        },
        {
          "attr": "Agility",
          "verb": "go from her seat to the nearest door"
        }
      ],
      "clueTitle": "The worn end",
      "clueText": "Her seat is the end of a bench. It is worn pale on one side only: the side nearer the door.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "1-3": [
    {
      "id": "1-3-1",
      "place": "the bracken where he waited",
      "actions": [
        {
          "attr": "Agility",
          "verb": "crawl into his hollow in the bracken"
        },
        {
          "attr": "Intellect",
          "verb": "read the ground he lay on"
        }
      ],
      "clueTitle": "The second ring",
      "clueText": "In the flattened bracken a flask has left a ring in the dew, and a second ring beside it where he set it down again.",
      "leans": "both",
      "hintFor": 1
    },
    {
      "id": "1-3-2",
      "place": "the far side of the rock",
      "actions": [
        {
          "attr": "Might",
          "verb": "climb round the split to the far side"
        },
        {
          "attr": "Intellect",
          "verb": "pace out the ground round its foot"
        }
      ],
      "clueTitle": "The worn path",
      "clueText": "Round the foot of the rock the turf is worn to bare earth in a narrow path, all the way round. Someone walks round this stone, and often.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "1-3-3",
      "place": "the gap he ran through",
      "actions": [
        {
          "attr": "Agility",
          "verb": "run his line to the trees"
        },
        {
          "attr": "Aim",
          "verb": "search the ground he crossed"
        }
      ],
      "clueTitle": "The notched stick",
      "clueText": "In the gap where he ran, a stick lies dropped, notched down one side. The newest notches are still pale and wet.",
      "leans": "B",
      "hintFor": 1
    }
  ],
  "1-4": [
    {
      "id": "1-4-1",
      "place": "the gate at the end of the lane",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look at how the gate was left"
        },
        {
          "attr": "Might",
          "verb": "lift the bar and feel its weight"
        }
      ],
      "clueTitle": "The leaned bar",
      "clueText": "The gate at the end of the lane is swinging, but its bar has been lifted and leaned neatly against the post, not thrown down.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "1-4-2",
      "place": "the one open shutter",
      "actions": [
        {
          "attr": "Charm",
          "verb": "stop at the open shutter and wait"
        },
        {
          "attr": "Aim",
          "verb": "look in from across the lane"
        }
      ],
      "clueTitle": "The covered cup",
      "clueText": "On the sill of the open shutter stands a cup of milk with a cloth over it. Under the window, a child's stool is set square to the wall.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "1-4-3",
      "place": "where the elder's men stood",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "look over the ground where they stood"
        },
        {
          "attr": "Craft",
          "verb": "pick through what they left in the mud"
        }
      ],
      "clueTitle": "Fresh bark",
      "clueText": "Where the men stood with the elder, curls of fresh bark lie in the mud. Somebody in Fenmark cut a cudgel today.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "1-5": [
    {
      "id": "1-5-1",
      "place": "the woman at the edge of the firelight",
      "actions": [
        {
          "attr": "Charm",
          "verb": "sit with her and let her talk"
        },
        {
          "attr": "Intellect",
          "verb": "ask her what she saw two winters back"
        }
      ],
      "clueTitle": "The knife, not the face",
      "clueText": "She says she never saw his face, only the knife, and it is the knife she knows him by.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "1-5-2",
      "place": "the shutter he was trying",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a thumb along the marks in the wood"
        },
        {
          "attr": "Intellect",
          "verb": "set the old marks beside the new"
        }
      ],
      "clueTitle": "Older marks",
      "clueText": "Under his fresh marks on the shutter are older ones, grey with weather, worked in at the same place, where the bar sits.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "1-5-3",
      "place": "the clean path in",
      "actions": [
        {
          "attr": "Aim",
          "verb": "read the path by the firelight"
        },
        {
          "attr": "Intellect",
          "verb": "count the prints worn into it"
        }
      ],
      "clueTitle": "One pair of boots",
      "clueText": "The path in is worn by one pair of small boots, hers, over and over. Under them you find no other prints but tonight's.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "1-6": [
    {
      "id": "1-6-1",
      "place": "the far bank, along the water",
      "actions": [
        {
          "attr": "Aim",
          "verb": "scan the far bank from the ford-stone"
        },
        {
          "attr": "Might",
          "verb": "wade the safe line across"
        }
      ],
      "clueTitle": "Threads on a thorn",
      "clueText": "On a thorn at the water's edge of the far bank, a little way along from the ruts, a few woollen threads hang at the height of a child.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "1-6-2",
      "place": "the ruts up the far bank",
      "actions": [
        {
          "attr": "Craft",
          "verb": "read the hoofprints beside the ruts"
        },
        {
          "attr": "Might",
          "verb": "cross and walk the ruts up the bank"
        }
      ],
      "clueTitle": "Up at a run",
      "clueText": "Beside the ruts, the horse's prints up the far bank are short, deep and dug in at the toe. It went up at a run.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "1-6-3",
      "place": "the heel-marks at the water",
      "actions": [
        {
          "attr": "Agility",
          "verb": "get down to them before the river does"
        },
        {
          "attr": "Intellect",
          "verb": "work out whose feet went where"
        }
      ],
      "clueTitle": "A second man",
      "clueText": "Beside the heel-marks, a second man's prints come down from the cart to the water and go straight back up to it.",
      "leans": "both",
      "hintFor": 2
    }
  ]
};

/** Shown on a failed lead roll (the clue still comes back, found late). Approved 15 Oct; one per day, rotating. */
export const FAN_OUT_LATE_LINES: string[] = [
  "It takes you until full dark, but you find it.",
  "You almost give up. Then, at the last of the light, there it is.",
  "You go over the same ground twice before you see it.",
  "By the time you find it, the fire is the only light left."
];

export function lateLineFor(week: number, day: number): string {
  return FAN_OUT_LATE_LINES[((week - 1) * 6 + (day - 1)) % FAN_OUT_LATE_LINES.length];
}

/**
 * The day's leads. Until a day's three leads are approved it has one: canon's own Fan Out clue (Campfire v2.3),
 * labelled with the day's place and rolled on the day's two Fan Out Attributes.
 */
export function fanOutLeadsFor(week: number, day: number, fallbackAttrs: AttributeName[]): FanOutLead[] {
  const approved = APPROVED_FAN_OUT_LEADS[`${week}-${day}`];
  if (approved?.length) return approved;
  const clue = getPublicFanOutClue(week, day);
  return [
    {
      id: `${week}-${day}-canon`,
      place: '',
      actions: fallbackAttrs.map((attr) => ({ attr, verb: '' })),
      clueTitle: clue.title,
      clueText: clue.text,
      hintFor: 1,
    },
  ];
}

// First-letter hints, per fragment: which words have one. Saves before 15 Oct stored `true`, which now means word 1.
export type HintMask = boolean | number;

export function hintHas(mask: HintMask | undefined, word: 1 | 2): boolean {
  if (mask === true) return word === 1;
  if (typeof mask === 'number') return (mask & word) !== 0;
  return false;
}

export function hintAdd(mask: HintMask | undefined, word: 1 | 2): number {
  const base = mask === true ? 1 : typeof mask === 'number' ? mask : 0;
  return base | word;
}
