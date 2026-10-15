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
 *  Weeks 1 to 6 approved 15 Oct (docs/drafts/week-N-fan-out-and-fire-draft.md). */
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
  ],
  "2-1": [
    {
      "id": "2-1-1",
      "place": "the bench by his door",
      "actions": [
        {
          "attr": "Charm",
          "verb": "let him tell it his own way"
        },
        {
          "attr": "Intellect",
          "verb": "ask him about the horse, not the men"
        }
      ],
      "clueTitle": "The steady horse",
      "clueText": "The old man says the horse never balked at his gate or at the fork, in full dark and with no lamp. It took the mill lane at a steady walk.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "2-1-2",
      "place": "the fresh ruts in the lane",
      "actions": [
        {
          "attr": "Aim",
          "verb": "follow the ruts past his gate"
        },
        {
          "attr": "Craft",
          "verb": "read where the wheels ran"
        }
      ],
      "clueTitle": "Past the gate",
      "clueText": "The ruts run past his gate without a check. By that gate, in plain sight of the lane, a child's wooden horse lies on its side in the grass.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "2-1-3",
      "place": "where the cart turned upriver",
      "actions": [
        {
          "attr": "Agility",
          "verb": "run down to the turn before dark"
        },
        {
          "attr": "Aim",
          "verb": "read the turn in the half-light"
        }
      ],
      "clueTitle": "Deeper coming down",
      "clueText": "Where the cart turned upriver, the ruts coming down sink deeper into the verge than the ruts going up.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "2-2": [
    {
      "id": "2-2-1",
      "place": "the doorway, with her",
      "actions": [
        {
          "attr": "Charm",
          "verb": "ask her what was in his hands"
        },
        {
          "attr": "Intellect",
          "verb": "ask her what he did before he spoke"
        }
      ],
      "clueTitle": "The paper in his fist",
      "clueText": "She says he had a folded paper in his fist. He looked at it once, then said the boy's name.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "2-2-2",
      "place": "inside the mill door",
      "actions": [
        {
          "attr": "Aim",
          "verb": "follow his boot-marks inside"
        },
        {
          "attr": "Craft",
          "verb": "read the dried mud on the boards"
        }
      ],
      "clueTitle": "Straight to the bed",
      "clueText": "Nobody has swept since. His dried boot-mud goes from the door straight to the boy's bed and back, and never turns aside.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "2-2-3",
      "place": "the yard where the cart stood",
      "actions": [
        {
          "attr": "Aim",
          "verb": "walk the yard by the light from the door"
        },
        {
          "attr": "Craft",
          "verb": "read what the horse left behind"
        }
      ],
      "clueTitle": "The cropped grass",
      "clueText": "Where the cart stood in the yard, the grass is cropped short in a wide half-circle, as far as a tethered horse can reach.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "2-3": [
    {
      "id": "2-3-1",
      "place": "the stone round the housing",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look at the stone round the lock"
        },
        {
          "attr": "Intellect",
          "verb": "read the marks cut into it"
        }
      ],
      "clueTitle": "The scratches",
      "clueText": "The stone round the housing is scored with dozens of short scratches, some weathered and some bright. He tried it more than once, on more than one day.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "2-3-2",
      "place": "the stranger on the path",
      "actions": [
        {
          "attr": "Charm",
          "verb": "kneel by him and close his eyes"
        },
        {
          "attr": "Intellect",
          "verb": "go through what he carried"
        }
      ],
      "clueTitle": "Silver in his purse",
      "clueText": "His purse is still on his belt, and there is silver in it. A week of people have stepped over him, and not one has taken it.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "2-3-3",
      "place": "the narrows where the dog lies",
      "actions": [
        {
          "attr": "Might",
          "verb": "hold the chain short and get past"
        },
        {
          "attr": "Aim",
          "verb": "look past the dog from the rocks"
        }
      ],
      "clueTitle": "The full pail",
      "clueText": "Behind the dog, at the end of its chain, stands a pail of water, full and clean. There is a scrap of fresh meat beside it.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "2-4": [
    {
      "id": "2-4-1",
      "place": "the foot of the shaft",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look down past the edge"
        },
        {
          "attr": "Agility",
          "verb": "creep back to the lip and look"
        }
      ],
      "clueTitle": "The second lamp",
      "clueText": "A second lamp stands lit at the foot of the shaft, filled and trimmed, the same make as the ring in the chamber. Nobody grabbed it in a hurry.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "2-4-2",
      "place": "the timbers at the shaft's mouth",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look over the timbering at the top"
        },
        {
          "attr": "Aim",
          "verb": "follow the timber down by the lamplight"
        }
      ],
      "clueTitle": "The pale scar",
      "clueText": "On the timbering just below the top, a fresh pale scar runs down the wood, where a stone knocked loose went bouncing all the way to the bottom.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "2-4-3",
      "place": "the voices down the shaft",
      "actions": [
        {
          "attr": "Aim",
          "verb": "lie flat at the edge and listen"
        },
        {
          "attr": "Intellect",
          "verb": "count the voices as they go round"
        }
      ],
      "clueTitle": "The chant ran on",
      "clueText": "When the shout went up, the heads turned, but the chant never stopped. It ran on under the shout the whole time, the same few words.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "2-5": [
    {
      "id": "2-5-1",
      "place": "the old stone where he signalled",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a hand over each face of it"
        },
        {
          "attr": "Aim",
          "verb": "look at it side-on by the lamp"
        }
      ],
      "clueTitle": "The ground-flat face",
      "clueText": "On the old stone where the scout stood, one face has been ground flat, long ago. The chisel scars are weathered grey. Whatever was carved there is gone.",
      "leans": "both",
      "hintFor": 2
    },
    {
      "id": "2-5-2",
      "place": "the scree below the stone",
      "actions": [
        {
          "attr": "Agility",
          "verb": "scramble down the scree"
        },
        {
          "attr": "Aim",
          "verb": "search the scree by lamplight"
        }
      ],
      "clueTitle": "Burned chips",
      "clueText": "Mixed into the scree are chips of dressed stone, blackened by fire. One still carries the curve of a carved letter, broken off mid-word.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "2-5-3",
      "place": "the fallen sheepfold",
      "actions": [
        {
          "attr": "Might",
          "verb": "lift the fallen stones one by one"
        },
        {
          "attr": "Craft",
          "verb": "look at how the fold was built"
        }
      ],
      "clueTitle": "Faces turned in",
      "clueText": "The fold's old cut stones were laid with their carved sides turned inward, against each other, every one. From outside, the wall shows nothing.",
      "leans": "B",
      "hintFor": 1
    }
  ],
  "2-6": [
    {
      "id": "2-6-1",
      "place": "the ground over the picks",
      "actions": [
        {
          "attr": "Craft",
          "verb": "feel the strokes through the turf"
        },
        {
          "attr": "Intellect",
          "verb": "time the strokes and place them"
        }
      ],
      "clueTitle": "One line",
      "clueText": "The strokes come from one place only, and each new stroke lands a little nearer the old shaft than the last.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "2-6-2",
      "place": "the two lamps at the foot",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch what passes the lamps"
        },
        {
          "attr": "Agility",
          "verb": "crawl to the edge and look down"
        }
      ],
      "clueTitle": "Sifted by hand",
      "clueText": "In the lamplight at the foot of the shaft, baskets of dug earth are tipped out. Someone kneels and sifts each one through their hands before it is thrown aside.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "2-6-3",
      "place": "the hole under the old stone",
      "actions": [
        {
          "attr": "Might",
          "verb": "shift one more stone"
        },
        {
          "attr": "Agility",
          "verb": "squeeze in to the first step"
        }
      ],
      "clueTitle": "Your own print",
      "clueText": "Under the stones, the first step down is thick with dust. In the dust there is no print but your own.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "3-1": [
    {
      "id": "3-1-1",
      "place": "Corin, on the walk down",
      "actions": [
        {
          "attr": "Charm",
          "verb": "walk beside him and let him talk"
        },
        {
          "attr": "Aim",
          "verb": "look him over in the morning light"
        }
      ],
      "clueTitle": "The grey wool",
      "clueText": "Corin has a child's woollen mitten tucked in his belt that is not his. The wool is rough and grey, and it smells of sheep.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "3-1-2",
      "place": "where the cart stood, below the shaft",
      "actions": [
        {
          "attr": "Craft",
          "verb": "read what the cart left in the grass"
        },
        {
          "attr": "Intellect",
          "verb": "work out what they loaded"
        }
      ],
      "clueTitle": "The full cask",
      "clueText": "Where the cart stood, a cask has pressed a deep ring into the mud. The grass round it is soaked where they topped it up from the stream, right to the brim.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "3-1-3",
      "place": "the shoulder of the hill he ran over",
      "actions": [
        {
          "attr": "Agility",
          "verb": "go up the shoulder after him"
        },
        {
          "attr": "Aim",
          "verb": "follow his line from the shaft mouth"
        }
      ],
      "clueTitle": "Facing west",
      "clueText": "At the top of the shoulder the ground is scuffed where he stood a while, facing west. Then his prints go on, the same way the cart went.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "3-2": [
    {
      "id": "3-2-1",
      "place": "the well, and the board of chips",
      "actions": [
        {
          "attr": "Charm",
          "verb": "crouch by the board and wait"
        },
        {
          "attr": "Aim",
          "verb": "watch the well from across the street"
        }
      ],
      "clueTitle": "The boy at the well",
      "clueText": "At the well a boy holds his chip out low and quick, then shoves it back into his shirt before you have looked at it properly.",
      "leans": "both",
      "hintFor": 1
    },
    {
      "id": "3-2-2",
      "place": "the empty cart at the foot of the black road",
      "actions": [
        {
          "attr": "Craft",
          "verb": "climb up and look over the boards"
        },
        {
          "attr": "Intellect",
          "verb": "go over the cart end to end"
        }
      ],
      "clueTitle": "The made bed",
      "clueText": "In the bed of the empty cart a sheepskin is spread over the boards, and a blanket is folded at one end like a pillow.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "3-2-3",
      "place": "the street, where every door shut",
      "actions": [
        {
          "attr": "Aim",
          "verb": "walk the street with your eyes on the ground"
        },
        {
          "attr": "Craft",
          "verb": "pick out what is caught between the stones"
        }
      ],
      "clueTitle": "Sacking on the stones",
      "clueText": "Caught between the stones down the middle of the street are scraps of sacking. It is the kind men tie over hooves to quiet them on a night road.",
      "leans": "B",
      "hintFor": 2
    }
  ],
  "3-3": [
    {
      "id": "3-3-1",
      "place": "where the shepherds' path meets the glass",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "look at where the path gives out"
        },
        {
          "attr": "Agility",
          "verb": "walk the edge of the glass"
        }
      ],
      "clueTitle": "The row of stones",
      "clueText": "Where the shepherds' path meets the glass, a row of old stones lies across it, sunk deep in the turf. The path stops dead at the row.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "3-3-2",
      "place": "the housing beside the mark",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a finger round its carving"
        },
        {
          "attr": "Intellect",
          "verb": "look it over before you step away"
        }
      ],
      "clueTitle": "Only your hand",
      "clueText": "The glass round the housing is dull with fine dust. The only marks in it are the ones your own hand just made.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "3-3-3",
      "place": "the far edge, where the glass is cracked",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look back the way you came"
        },
        {
          "attr": "Might",
          "verb": "climb onto the highest lip of glass"
        }
      ],
      "clueTitle": "The view down",
      "clueText": "From the far edge you can see all the way down the black road to Ashcombe's roofs, and the well in the middle of them.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "3-4": [
    {
      "id": "3-4-1",
      "place": "the rises along the riders' trail",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look back down the trail from the last rise"
        },
        {
          "attr": "Agility",
          "verb": "run the trail back to the first chip"
        }
      ],
      "clueTitle": "On the bare rock",
      "clueText": "Each chip lay on bare rock at the top of a rise, never down in the ash where it would sink. Coming up behind, you see each one glint before you reach it.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "3-4-2",
      "place": "the bone-white trees along the trail",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "set each chip beside what stood near it"
        },
        {
          "attr": "Aim",
          "verb": "look round from where each one lay"
        }
      ],
      "clueTitle": "A tree at each",
      "clueText": "Each chip lay a few paces from a dead tree, the tallest one in sight. Stand at one tree, and you can see the next.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "3-4-3",
      "place": "the three chips in your hand",
      "actions": [
        {
          "attr": "Craft",
          "verb": "turn each one over in the light"
        },
        {
          "attr": "Intellect",
          "verb": "lay them out side by side"
        }
      ],
      "clueTitle": "Scratched on the back",
      "clueText": "Turn the chips over. One has a single short scratch on its back, one has two, and one has three.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "3-5": [
    {
      "id": "3-5-1",
      "place": "low on the doorframe",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a thumbnail along the letters"
        },
        {
          "attr": "Intellect",
          "verb": "look at how each letter was made"
        }
      ],
      "clueTitle": "Cut twice",
      "clueText": "Each stroke of the name has been cut twice, the second pass deeper than the first.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "3-5-2",
      "place": "the spring below the hut",
      "actions": [
        {
          "attr": "Agility",
          "verb": "get down to the water fast"
        },
        {
          "attr": "Aim",
          "verb": "look over the ground by the spring"
        }
      ],
      "clueTitle": "The dropped skin",
      "clueText": "By the spring a water skin lies in the grass, half full. Its stopper is a pace away.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "3-5-3",
      "place": "the wall beside the pallet",
      "actions": [
        {
          "attr": "Charm",
          "verb": "sit on the pallet and look round"
        },
        {
          "attr": "Intellect",
          "verb": "look at what is kept by the bed"
        }
      ],
      "clueTitle": "The gap in the row",
      "clueText": "Along the wall by the pallet, small things are set out in a row: a twist of grey wool, a white pebble, a hen's feather. At one end there is a gap, and the dust there is clean.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "3-6": [
    {
      "id": "3-6-1",
      "place": "the foot of the round hill",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look down at the foot of the hill"
        },
        {
          "attr": "Intellect",
          "verb": "go over every shape below the crown"
        }
      ],
      "clueTitle": "No horses",
      "clueText": "Not one horse is tethered at the foot of the Kiln.",
      "leans": "both",
      "hintFor": 1
    },
    {
      "id": "3-6-2",
      "place": "the crack across its crown",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch the crown after the lamp goes in"
        },
        {
          "attr": "Intellect",
          "verb": "watch the air over the crack"
        }
      ],
      "clueTitle": "Smoke from the crack",
      "clueText": "Soon after the lamp goes in, thin pale smoke starts to rise from the crack. By daylight there was only shimmering air.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "3-6-3",
      "place": "the knife-edge below the cairn",
      "actions": [
        {
          "attr": "Agility",
          "verb": "go a little way back along the edge"
        },
        {
          "attr": "Might",
          "verb": "test the stones of the face"
        }
      ],
      "clueTitle": "No way down in the dark",
      "clueText": "Now the light has gone, the knife-edge below the cairn is a black line with nothing either side. The face beside it drops straight to loose scree.",
      "leans": "B",
      "hintFor": 1
    }
  ],
  "4-1": [
    {
      "id": "4-1-1",
      "place": "the passage none of you had noticed",
      "actions": [
        {
          "attr": "Agility",
          "verb": "go a few steps in, without a lamp"
        },
        {
          "attr": "Intellect",
          "verb": "stand in its mouth and take stock"
        }
      ],
      "clueTitle": "The snuffed wick",
      "clueText": "A few steps into the passage the air smells of a wick just put out. None of your lamps has been in there.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "4-1-2",
      "place": "the place where he knelt",
      "actions": [
        {
          "attr": "Aim",
          "verb": "pace it out from the passage"
        },
        {
          "attr": "Intellect",
          "verb": "work out what he could reach from there"
        }
      ],
      "clueTitle": "Three paces",
      "clueText": "Where he knelt is three paces from the passage mouth, in the corner your lamps lit least.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "4-1-3",
      "place": "the ropes on the stone",
      "actions": [
        {
          "attr": "Craft",
          "verb": "lay the cut ends side by side"
        },
        {
          "attr": "Might",
          "verb": "pick them up and test each one"
        }
      ],
      "clueTitle": "The same side",
      "clueText": "Every rope is cut a finger's width from its knot, and every cut is on the same side.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "4-2": [
    {
      "id": "4-2-1",
      "place": "the carter, watering his horses",
      "actions": [
        {
          "attr": "Charm",
          "verb": "let him run on about the riders"
        },
        {
          "attr": "Intellect",
          "verb": "ask how the four rode"
        }
      ],
      "clueTitle": "Every eye on the cart",
      "clueText": "The carter says the four never spoke to each other, and never once looked at the road or the lake. Every eye stayed on the cart.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "4-2-2",
      "place": "the men in the shallows",
      "actions": [
        {
          "attr": "Charm",
          "verb": "sit down in the water with them"
        },
        {
          "attr": "Intellect",
          "verb": "ask what made them let it pass"
        }
      ],
      "clueTitle": "Blades bare",
      "clueText": "They say the four came through the ford with their blades bare across their saddles, in full daylight, and did not slow down.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "4-2-3",
      "place": "the ruts going north",
      "actions": [
        {
          "attr": "Aim",
          "verb": "follow them as far as the light lets you"
        },
        {
          "attr": "Craft",
          "verb": "read where they could have turned off"
        }
      ],
      "clueTitle": "The open road",
      "clueText": "Their ruts keep to the open road the whole way, past every shepherd's hut. A sheep-path along the ridge would have hidden them from all of it.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "4-3": [
    {
      "id": "4-3-1",
      "place": "the fisherman on the shingle",
      "actions": [
        {
          "attr": "Charm",
          "verb": "help him with his nets and listen"
        },
        {
          "attr": "Intellect",
          "verb": "ask what he hears at night"
        }
      ],
      "clueTitle": "The oars at dusk",
      "clueText": "On the shingle the fisherman says he hears oars out on the lake every night, at the same hour, just after dusk. He has never gone to look.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "4-3-2",
      "place": "the lane up from the water",
      "actions": [
        {
          "attr": "Aim",
          "verb": "walk the lane up from the shingle"
        },
        {
          "attr": "Intellect",
          "verb": "look at every door you pass"
        }
      ],
      "clueTitle": "One door",
      "clueText": "Small dark spots of lamp-oil stain the stones of the lane, a pace apart. They go up to her door and back, and to no other door.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "4-3-3",
      "place": "the tower's lowest window",
      "actions": [
        {
          "attr": "Agility",
          "verb": "climb up to the sill from the skiff"
        },
        {
          "attr": "Aim",
          "verb": "look it over from the water"
        }
      ],
      "clueTitle": "A cleared sill",
      "clueText": "On the tower's lowest sill, on the side facing Reedham, the weed is scraped away in a patch the size of a seat. From there you can see her window.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "4-4": [
    {
      "id": "4-4-1",
      "place": "the drowned windows",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look along the windows in the low light"
        },
        {
          "attr": "Craft",
          "verb": "look at the iron in each frame"
        }
      ],
      "clueTitle": "The old hooks",
      "clueText": "In every drowned window frame is the same iron lamp-hook that hangs in Reedham's windows today. Each one is black with old soot.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "4-4-2",
      "place": "the earlier pages of her notes",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "go back through them, page by page"
        },
        {
          "attr": "Craft",
          "verb": "set the copied hands side by side"
        }
      ],
      "clueTitle": "Two records",
      "clueText": "Two pages back, she copied \"the marked\" out of a different record. The two words never appear in the same copied line.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "4-4-3",
      "place": "the margin of her page",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "read her note against the line"
        },
        {
          "attr": "Aim",
          "verb": "hold the page to the lamp"
        }
      ],
      "clueTitle": "The scratched line",
      "clueText": "Under her note she began a second line, then scratched it out so hard the nib went through the paper.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "4-5": [
    {
      "id": "4-5-1",
      "place": "the rope in the bottom of their boat",
      "actions": [
        {
          "attr": "Craft",
          "verb": "sift the shavings out of the rope"
        },
        {
          "attr": "Intellect",
          "verb": "look at how each one was cut"
        }
      ],
      "clueTitle": "Long curls",
      "clueText": "Every curl in the bottom of the boat is long and unbroken, and all of them are fresh. Nobody hurried him.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "4-5-2",
      "place": "the stern seat",
      "actions": [
        {
          "attr": "Craft",
          "verb": "feel under the thwart"
        },
        {
          "attr": "Might",
          "verb": "lift the seat board out"
        }
      ],
      "clueTitle": "Folded dry",
      "clueText": "Under the stern seat, out of the spray, a blanket is folded small. It is dry.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "4-5-3",
      "place": "the willows at the water's edge",
      "actions": [
        {
          "attr": "Agility",
          "verb": "work along the bank through the willows"
        },
        {
          "attr": "Craft",
          "verb": "look at where the wood was cut"
        }
      ],
      "clueTitle": "Three shoots",
      "clueText": "One willow has had three straight shoots cut from it with a sharp blade. One cut is grey, one is brown, and one is still white.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "4-6": [
    {
      "id": "4-6-1",
      "place": "the dark water under the wall",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch the water as you tie up"
        },
        {
          "attr": "Agility",
          "verb": "lean out over the stones"
        }
      ],
      "clueTitle": "The rings",
      "clueText": "As you tie up at the tower, rings are already spreading from the dark under its wall, and your oars have been still for a minute.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "4-6-2",
      "place": "the empty windows of the bell-chamber",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look back the way you came"
        },
        {
          "attr": "Intellect",
          "verb": "watch the water you crossed"
        }
      ],
      "clueTitle": "One light",
      "clueText": "Out toward the island, low on the water, a light shows for a breath and goes out. It does not show again.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "4-6-3",
      "place": "the lights of Reedham",
      "actions": [
        {
          "attr": "Aim",
          "verb": "pick out every light on the shore"
        },
        {
          "attr": "Charm",
          "verb": "watch the shore with the others, quietly"
        }
      ],
      "clueTitle": "The lamp on the shingle",
      "clueText": "Down on the shore, one lamp moves slowly along the shingle. It stops below her lane, and stays there.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "5-1": [
    {
      "id": "5-1-1",
      "place": "the worn face of the waystone",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a thumb along the cut-away line"
        },
        {
          "attr": "Intellect",
          "verb": "hold the light low and look at its edges"
        }
      ],
      "clueTitle": "The crisp edge",
      "clueText": "Frost has eaten the old carving, but the edges of the cut-out line are crisp. Not one letter of it is left.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "5-1-2",
      "place": "the crack at the waystone's foot",
      "actions": [
        {
          "attr": "Craft",
          "verb": "scrape back the rime with a knife"
        },
        {
          "attr": "Aim",
          "verb": "watch the crack while the beat comes"
        }
      ],
      "clueTitle": "The rime stays",
      "clueText": "Long after the fragment is out, the rime stays in the crack, in a mild wind. It is the same cold you have felt at every hiding place since the forest road.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-1-3",
      "place": "the lane up from the shingle",
      "actions": [
        {
          "attr": "Charm",
          "verb": "walk up the lane and stop at a door"
        },
        {
          "attr": "Aim",
          "verb": "look up the lane from the boat"
        }
      ],
      "clueTitle": "Every window lit",
      "clueText": "Every window up the lane has a lamp burning at midday, as Reedham does only on a dark-moon night.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "5-2": [
    {
      "id": "5-2-1",
      "place": "the edge of the dark, past the cart",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch them at the edge of the dark"
        },
        {
          "attr": "Might",
          "verb": "stand over the cart and hold your ground"
        }
      ],
      "clueTitle": "Heads down",
      "clueText": "When the beat stops, every dog stops with it, heads down, mid-stride. Not one runs away, and not one comes on.",
      "leans": "both",
      "hintFor": 1
    },
    {
      "id": "5-2-2",
      "place": "the bandage on the man's forearm",
      "actions": [
        {
          "attr": "Charm",
          "verb": "ask to see the arm"
        },
        {
          "attr": "Craft",
          "verb": "tie the bandage again, properly"
        }
      ],
      "clueTitle": "One bite",
      "clueText": "Under the bandage is a single bite, deep and clean. The teeth went in once and held, and nothing tore.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-2-3",
      "place": "where the dogs came out of the dusk",
      "actions": [
        {
          "attr": "Aim",
          "verb": "read the ground at first light"
        },
        {
          "attr": "Intellect",
          "verb": "walk their tracks back the way they came"
        }
      ],
      "clueTitle": "Scattered",
      "clueText": "At first light their tracks come in together, in a straight line from the north. They go out scattered every way, the prints far apart.",
      "leans": "B",
      "hintFor": 2
    }
  ],
  "5-3": [
    {
      "id": "5-3-1",
      "place": "the street behind the gate",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look down into the street from the walkway"
        },
        {
          "attr": "Agility",
          "verb": "lean out over the inner parapet"
        }
      ],
      "clueTitle": "One trodden path",
      "clueText": "In the dust of the street behind the gate, one narrow path is trodden from the bar up the hill, toward the smoke.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-3-2",
      "place": "the near end of the new bar",
      "actions": [
        {
          "attr": "Aim",
          "verb": "pick out the bar's end from above"
        },
        {
          "attr": "Craft",
          "verb": "judge the timber by its colour"
        }
      ],
      "clueTitle": "Still white",
      "clueText": "The bar's cut end is still white, and the axe-marks are sharp. It was put up within the last few days.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "5-3-3",
      "place": "the broken stair",
      "actions": [
        {
          "attr": "Agility",
          "verb": "climb down to the gap in the stair"
        },
        {
          "attr": "Craft",
          "verb": "look at the broken edges"
        }
      ],
      "clueTitle": "Knocked out",
      "clueText": "The missing steps lie at the stair's foot in big, square pieces. Every break shows the bite of a hammer, weathered smooth.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "5-4": [
    {
      "id": "5-4-1",
      "place": "the ground round the soldiers",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look at the street round them"
        },
        {
          "attr": "Craft",
          "verb": "crouch and look at the dust"
        }
      ],
      "clueTitle": "Unbroken dust",
      "clueText": "Round every boot the dust lies in one even skin. The only prints in it are yours.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-4-2",
      "place": "the barred door of the empty house",
      "actions": [
        {
          "attr": "Aim",
          "verb": "keep an eye to the crack in the door"
        },
        {
          "attr": "Agility",
          "verb": "sit by the door, ready, and listen"
        }
      ],
      "clueTitle": "Metal on stone",
      "clueText": "As the light goes, one sound comes from the direction of the street of soldiers: metal on stone, once. Then nothing.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "5-4-3",
      "place": "the helms down the street",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look along the line of helms"
        },
        {
          "attr": "Intellect",
          "verb": "set each helm against the next"
        }
      ],
      "clueTitle": "No two alike",
      "clueText": "Every helm sits a little crooked on its neck, this way or that, no two the same. From the end of the street, any one of them could look turned.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "5-5": [
    {
      "id": "5-5-1",
      "place": "the board propped by the wall",
      "actions": [
        {
          "attr": "Aim",
          "verb": "read the board from the rubble"
        },
        {
          "attr": "Agility",
          "verb": "creep close enough to see the chalk"
        }
      ],
      "clueTitle": "One hand",
      "clueText": "Every stroke on the board is in the same thick, square hand, the crossed ones and the ones still to cross. The chalk has been gone over many times, never redrawn.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-5-2",
      "place": "the hooded figures at the fire",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch their faces from the rubble"
        },
        {
          "attr": "Agility",
          "verb": "crawl close enough to see them"
        }
      ],
      "clueTitle": "Every head lifts",
      "clueText": "Every one of them sits facing the doors. When the beat comes, every head lifts at once, and stays lifted until it has passed.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "5-5-3",
      "place": "the shell of the house across the square",
      "actions": [
        {
          "attr": "Agility",
          "verb": "slip round to its back wall"
        },
        {
          "attr": "Aim",
          "verb": "look in through the broken window"
        }
      ],
      "clueTitle": "More bedrolls",
      "clueText": "Round the fire lie more bedrolls than there are people at it, each one rolled tight and tied.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "5-6": [
    {
      "id": "5-6-1",
      "place": "the city side of the wall, below the walk",
      "actions": [
        {
          "attr": "Aim",
          "verb": "lean out over the parapet"
        },
        {
          "attr": "Might",
          "verb": "brace on the parapet and lean far out"
        }
      ],
      "clueTitle": "The narrow slit",
      "clueText": "The slit is no wider than a hand, low in the wall's face. Unless you lean out over the parapet and look straight down the stone, you cannot see it at all.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "5-6-2",
      "place": "the parapet on the city side",
      "actions": [
        {
          "attr": "Craft",
          "verb": "run a hand along the parapet's top"
        },
        {
          "attr": "Might",
          "verb": "lean your weight where others leaned"
        }
      ],
      "clueTitle": "Two shallow dips",
      "clueText": "Above where the map points, the parapet's top is worn into two shallow dips, the width of a pair of elbows. They face the hall.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "5-6-3",
      "place": "the forty paces of open stone",
      "actions": [
        {
          "attr": "Agility",
          "verb": "pace the walk while their heads are turned"
        },
        {
          "attr": "Intellect",
          "verb": "measure the walk against the gate-tower"
        }
      ],
      "clueTitle": "A stride wider",
      "clueText": "Here the walk is wider than at the gate, by a good stride. All of the extra width is on the city side.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "6-1": [
    {
      "id": "6-1-1",
      "place": "the slit, after dark",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch the lanterns from the slit"
        },
        {
          "attr": "Intellect",
          "verb": "follow where each lantern goes"
        }
      ],
      "clueTitle": "No light inside",
      "clueText": "Not a candle burns in the room. Every lantern you can see from the slit is out in the square, and none of them reaches in.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "6-1-2",
      "place": "the board in the square",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch the board from the slit at dusk"
        },
        {
          "attr": "Intellect",
          "verb": "watch the man with the chalk, not the board"
        }
      ],
      "clueTitle": "One look down the hill",
      "clueText": "At dusk the watchman with the chalk stops before he strikes the board. He turns, looks down the hill at the wall, and then strikes it.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "6-1-3",
      "place": "the stone niche where it lay",
      "actions": [
        {
          "attr": "Craft",
          "verb": "hold a hand inside and feel the stone"
        },
        {
          "attr": "Intellect",
          "verb": "look at the niche with the lamp unlit"
        }
      ],
      "clueTitle": "The old soot",
      "clueText": "The back of the stone niche is blackened in one small round patch, the way a candle marks stone over years. The niche faces the inner wall, away from the slit.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "6-2": [
    {
      "id": "6-2-1",
      "place": "where the spears once stood",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look at the dust under the racks"
        },
        {
          "attr": "Intellect",
          "verb": "walk the racks end to end"
        }
      ],
      "clueTitle": "The swept racks",
      "clueText": "The spear-racks along the wall are empty, and the dust under every one is swept clean in the same short arc.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "6-2-2",
      "place": "the stair up to the street",
      "actions": [
        {
          "attr": "Agility",
          "verb": "climb to the top step and listen"
        },
        {
          "attr": "Intellect",
          "verb": "count what you hear"
        }
      ],
      "clueTitle": "Every foot at once",
      "clueText": "When the heartbeat comes, you hear iron move all over the city at once: one scrape of a foot from every street, then quiet.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "6-2-3",
      "place": "the kitchen whose fire went out",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look over the board and the pot"
        },
        {
          "attr": "Might",
          "verb": "lift the lid of the cold pot"
        }
      ],
      "clueTitle": "Bowls never filled",
      "clueText": "In the kitchen, bowls are set out along the board for a meal, and a ladle lies in the cold pot. Not one bowl was filled.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "6-3": [
    {
      "id": "6-3-1",
      "place": "the foot of the great doors",
      "actions": [
        {
          "attr": "Agility",
          "verb": "slip along the wall to the doors"
        },
        {
          "attr": "Craft",
          "verb": "look at the ground under the seam"
        }
      ],
      "clueTitle": "The unbroken drift",
      "clueText": "At the foot of the great doors, dust has drifted against the seam in one smooth bank, from post to post. Nothing has crossed it.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "6-3-2",
      "place": "the ruined house across from the hall",
      "actions": [
        {
          "attr": "Aim",
          "verb": "pick out what is stacked by their fire"
        },
        {
          "attr": "Agility",
          "verb": "creep along the ruined house's wall"
        }
      ],
      "clueTitle": "Clean robes",
      "clueText": "By the Order's fire the new men's packs are stacked in a row. On top of each lies a folded robe, brushed clean of the road.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "6-3-3",
      "place": "the hall's great wall",
      "actions": [
        {
          "attr": "Craft",
          "verb": "feel the stone, hand over hand"
        },
        {
          "attr": "Might",
          "verb": "climb a little way and feel higher"
        }
      ],
      "clueTitle": "Warm low down",
      "clueText": "Move your palm up the wall and the stone cools. The warmth is only low down, at the height of your knee and below.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "6-4": [
    {
      "id": "6-4-1",
      "place": "inside the crack, by lamplight",
      "actions": [
        {
          "attr": "Agility",
          "verb": "go in sideways, lamp first"
        },
        {
          "attr": "Aim",
          "verb": "light the ground ahead and look"
        }
      ],
      "clueTitle": "The untouched grit",
      "clueText": "Past where the soldier stood, the grit on the crack's floor lies smooth and untouched. Your boots are the first marks in it.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "6-4-2",
      "place": "the soldier in the mouth of the crack",
      "actions": [
        {
          "attr": "Might",
          "verb": "drag the broken armour aside"
        },
        {
          "attr": "Craft",
          "verb": "look at the rock it stood on"
        }
      ],
      "clueTitle": "Two hollows",
      "clueText": "The rock where it stood is worn into two shallow hollows, one for each foot. It stood on that one spot, facing out, for a very long time.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "6-4-3",
      "place": "the blank rock at the dead end",
      "actions": [
        {
          "attr": "Agility",
          "verb": "squeeze on to the very end"
        },
        {
          "attr": "Charm",
          "verb": "keep everyone quiet, and listen"
        }
      ],
      "clueTitle": "Louder here",
      "clueText": "Put your ear to the blank rock. When the heartbeat comes, it is louder here than anywhere else in the crack.",
      "leans": "both",
      "hintFor": 2
    }
  ],
  "6-5": [
    {
      "id": "6-5-1",
      "place": "the sky-watchers' wall, row by row",
      "actions": [
        {
          "attr": "Intellect",
          "verb": "measure the space between the moons"
        },
        {
          "attr": "Aim",
          "verb": "follow one row all the way round"
        }
      ],
      "clueTitle": "A finger's width",
      "clueText": "Lay a finger between any two moons, on any row. The space is the same every time, year on year, round the whole room.",
      "leans": "A",
      "hintFor": 1
    },
    {
      "id": "6-5-2",
      "place": "the floor of the round room",
      "actions": [
        {
          "attr": "Craft",
          "verb": "gather up what lies on the floor"
        },
        {
          "attr": "Intellect",
          "verb": "read the scratches by daylight"
        }
      ],
      "clueTitle": "Sums begun again",
      "clueText": "On the floor lie the sky-watchers' slates, scratched with long sums. Many are crossed through and begun again.",
      "leans": "B",
      "hintFor": 2
    },
    {
      "id": "6-5-3",
      "place": "where the rows stop",
      "actions": [
        {
          "attr": "Might",
          "verb": "climb the ledges to the last rows"
        },
        {
          "attr": "Craft",
          "verb": "run a thumb along the last cuts"
        }
      ],
      "clueTitle": "Cut in a hurry",
      "clueText": "In the last rows before they stop, every moon is cut to the right depth, but the edges are rough, as if made in a hurry. Not one night is missing.",
      "leans": "both",
      "hintFor": 1
    }
  ],
  "6-6": [
    {
      "id": "6-6-1",
      "place": "the street below the crack",
      "actions": [
        {
          "attr": "Aim",
          "verb": "watch the street from the crack's mouth"
        },
        {
          "attr": "Intellect",
          "verb": "count the ranks as they climb"
        }
      ],
      "clueTitle": "Every helm to the hall",
      "clueText": "From the crack's mouth you can see the whole street climbing toward you. Every helm in it is turned to the hall, not one to the hill.",
      "leans": "B",
      "hintFor": 1
    },
    {
      "id": "6-6-2",
      "place": "the foot of the blank rock",
      "actions": [
        {
          "attr": "Craft",
          "verb": "look at how the grit lies"
        },
        {
          "attr": "Agility",
          "verb": "get down low with the lamp"
        }
      ],
      "clueTitle": "The swept fan",
      "clueText": "At the foot of the blank rock, the old grit on your side lies swept flat in a smooth quarter-circle. Its point is at the rock's left edge.",
      "leans": "A",
      "hintFor": 2
    },
    {
      "id": "6-6-3",
      "place": "the streets you crossed this morning",
      "actions": [
        {
          "attr": "Aim",
          "verb": "look back down the hill from the crack"
        },
        {
          "attr": "Agility",
          "verb": "go back the long way, street by street"
        }
      ],
      "clueTitle": "Every post empty",
      "clueText": "The crossroads, the gate-tower, the street under the wall: every place where a soldier stood is empty now. Only the pale marks of their boots are left.",
      "leans": "both",
      "hintFor": 1
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
