// Generated from docs/canon/mythios-united-effort-stories.md (the story lines for each United Effort).
// Band 3 = above two-thirds, 2 = the middle third, 1 = the last third, 0 = the thing reaches 0.
// Each band has two lines, used in order and never said twice; band 0 has one.

export interface UnitedEffortStory {
  success: Record<0 | 1 | 2 | 3, string[]>;
  fail: Record<0 | 1 | 2 | 3, string[]>;
  /** Said once each, after the second, fourth and sixth turns. */
  between: string[];
}

export const UNITED_EFFORT_STORIES: Record<number, UnitedEffortStory> = {
  "1": {
    "success": {
      "0": [
        "Dev comes out of the hole like a cork, and the two of you are dragged back across the boards by the ankles, fast, onto stone."
      ],
      "1": [
        "Dev is out to the hips, lying along a beam you would not have trusted with a cat.",
        "One leg is up. Dev is laughing, or something like it."
      ],
      "2": [
        "Dev's ribs are clear of the hole. The boards complain, and hold.",
        "You have Dev by the belt. There is a knee on the edge, then not, then there again."
      ],
      "3": [
        "You get a fistful of Dev's collar and pull until your shoulder cracks. Dev comes up a hand's breadth: enough to get one elbow onto sounder wood.",
        "Another hand's breadth. Dev's other arm is over the timber now."
      ]
    },
    "fail": {
      "0": [
        "The boards go, all of them, and Dev goes with them into the dark. A long moment. Then, far below, water."
      ],
      "1": [
        "Dev's arms are shaking, and there is blood running off one elbow into the dark.",
        "Dev has stopped looking at any of you, and is looking down."
      ],
      "2": [
        "A timber-end works loose overhead and comes down across Dev's shoulder. Dev goes white.",
        "The boards shift, and close on Dev's chest like a hand. For a moment Dev cannot get a breath."
      ],
      "3": [
        "The board under your chest cracks like a dropped plate, and you are hauled back by the ankles. A broken end swings round and takes the skin off Dev's ribs.",
        "Something gives under Dev's arm. A splinter as long as a knife goes in above the elbow. Dev says nothing."
      ]
    },
    "between": [
      "Somewhere behind you, out in the air, a counting song is still going.",
      "Below Dev's boots, the river goes on saying the same thing.",
      "For a while now there has been no sound but breathing, and wood."
    ]
  },
  "2": {
    "success": {
      "0": [
        "The last leg goes. The hill shuts like a book. The dust takes a long time to settle, and when it has there is no hole, no light, and no sound from the other side at all."
      ],
      "1": [
        "One frame is holding all of it now. You can see which leg.",
        "The slot is a hand wide. A lamp is pushed up to it from the other side, and an eye."
      ],
      "2": [
        "Left-hand post, low down. The roof behind it comes down in a long soft rush, and the boots on the far side stop.",
        "You call it, and you are right. Somewhere in the dust, on their side, a man is coughing."
      ],
      "3": [
        "You see it: not the big prop, the little wedge under it. It goes with one kick, and a cart-load of hill sits down in the tunnel's mouth.",
        "The cross-piece. It was carrying nothing until the first fall; now it is carrying everything. Out it comes. The lamplight in the hole narrows to a slot."
      ]
    },
    "fail": {
      "0": [
        "The room comes in."
      ],
      "1": [
        "There is room to stand, and not much more. Everything you have not got in your hands is under stone.",
        "The foot of the stair is going."
      ],
      "2": [
        "The fall comes your way. When the dust thins, the far end of the room is rubble, and the stone table is the edge of what is left.",
        "A crack runs across the ceiling from the hole to the stair, as quick as a lizard."
      ],
      "3": [
        "The big prop, the obvious one. It was holding up your side. A slab of the old wall leans out and comes down across the floor, and one of the lamps is under it.",
        "Wrong. The roof over the hole stays where it is. The roof over your heads lets go a barrow-load of stone."
      ]
    },
    "between": [
      "Corin has put both hands over his ears.",
      "On the stone table, the lamps the fight kicked over are guttering.",
      "Whoever is coming is not hurrying. They have never needed to."
    ]
  },
  "3": {
    "success": {
      "0": [
        "You have her wrist. She weighs nothing at all. She comes down the rope inside your arm, and she does not open her fist."
      ],
      "1": [
        "One more stretch. You could almost throw the end to her, if she had a hand free to catch it.",
        "She has seen what the rope is for. She has not moved, and that is the right thing."
      ],
      "2": [
        "You are close enough to see her shoulders shaking. You do not call to her. You make the rope fast and come down.",
        "She has turned her head. She is watching the rope come."
      ],
      "3": [
        "You go up it the way you would cross a frozen pond: flat, and slowly, and thinking about something else. The blade goes in to the hilt. The rope is fast.",
        "Past the first blade, and on. The glass under you ticks, and holds."
      ]
    },
    "fail": {
      "0": [
        "The whole slope lets go, with a sound like the sea. She comes down in it."
      ],
      "1": [
        "She is on her stomach now, with nothing under her feet.",
        "She has started, very quietly, to slide."
      ],
      "2": [
        "Something lets go higher up. It comes down past her like a thrown handful of knives. She flinches. There is blood on her sleeve when it has gone by.",
        "The glass under her tilts. She has to take her flat hand off it, and find a new place to put it."
      ],
      "3": [
        "A plate of glass the size of a door turns over without warning, and the slope takes you down it on your back. Above, the sheet she is on slides a yard, and stops.",
        "The slope shrugs. It does it by itself, the way a sleeper turns over. She is nearer the edge of her sheet than she was."
      ]
    },
    "between": [
      "Below you, the bound man is watching the slope too.",
      "The warm air coming up from below smells of struck flint.",
      "She has not made a sound since she stopped."
    ]
  },
  "4": {
    "success": {
      "0": [
        "It comes out in your hand."
      ],
      "1": [
        "The pin is half out and loose as a bad tooth. You work it until your ears are singing, and come up with the taste of iron in your mouth.",
        "It moves under your thumb. One more like that."
      ],
      "2": [
        "It is turning now. Each twist brings a thread of rust up past your face like smoke. You feel it shift in its hole before your breath gives out.",
        "A quarter-turn. Another. The gate above you makes a small, different sound."
      ],
      "3": [
        "Your fingers find it in the dark: a pin of iron as thick as a thumb, furred with rust. You get the knife's point under its head and lean. Something gives, a grain at a time. Then your chest is burning, and you are up.",
        "You have it at once this time. The point finds the lip of the pin's head, and you feel the rust break like a crust."
      ]
    },
    "fail": {
      "0": [
        "The gate settles one last time. He goes under, and he is very quiet under their hands."
      ],
      "1": [
        "The knife slips. The gate drops again, and this time he does not struggle when he goes under. When they lift him his lips are blue, and his eyes do not find anyone.",
        "The gate grinds. The two holding his shoulders have to go under with him to keep hold."
      ],
      "2": [
        "The gate grinds down. He is under for a slow count of five before they get his face clear.",
        "The gate takes a weight it did not have before, and gives. He has stopped holding himself up. They are doing it for him now."
      ],
      "3": [
        "The point skates off the rust and rings on the bars. The gate shudders, and settles the width of a finger. It is enough. His elbows go from under him, and the water closes over his face. They haul him up. He comes up coughing.",
        "You come up under the wrong bar, and the whole gate rings. He goes under; comes up; spits; says nothing."
      ]
    },
    "between": [
      "Out on the lake the oars are fainter. Whatever they carried out of here, it is not coming back.",
      "From the table, Joss is watching. He has the little boat held so tight that his knuckles are white.",
      "The man under the gate has not once asked you to hurry."
    ]
  },
  "5": {
    "success": {
      "0": [
        "The last post answers. On the hill, the lantern is set down beside the fire. Somebody sits."
      ],
      "1": [
        "Somebody up there laughs at something, low. It is not at you.",
        "The calls are coming quicker. They want to be done, and sitting down."
      ],
      "2": [
        "You let the wind take half of it. That is how a man answers who has said it ten thousand times.",
        "By now you have the cadence of it. The watch barely waits for you to finish."
      ],
      "3": [
        "You give it the way he gave it: flat, and a little bored. Up the hill, a lantern that had lifted comes down again.",
        "The answer goes up into the dark. A voice comes back with the next call, in no hurry."
      ]
    },
    "fail": {
      "0": [
        "A third lantern, and a fourth. They start down the hill."
      ],
      "1": [
        "Two of them are talking now, low, and not calling anyone.",
        "A second lantern is lit from the first."
      ],
      "2": [
        "The words are right, and the voice is wrong. Up at the fire, somebody stands.",
        "The call comes again for the same post. They did not like the first answer."
      ],
      "3": [
        "A breath too quick. On the hill a lantern lifts, and hangs there, and is slow to come down.",
        "Too loud. A man on a wall at night does not answer like a man who wants to be heard. Nobody calls the next post for a long moment."
      ]
    },
    "between": [
      "Against the wall, his lips are still moving.",
      "The wind is off the hill. It carries every word down to you, and yours up.",
      "In the side street, something in armour shifts, and is still."
    ]
  },
  "6": {
    "success": {
      "0": [
        "It parts."
      ],
      "1": [
        "It is singing: one thin note, under theirs.",
        "One strand. You can see the light through it."
      ],
      "2": [
        "Half of it is hanging in tatters. The rest is drawn as tight as a bowstring.",
        "The lamp is swinging now, slow, the width of a man."
      ],
      "3": [
        "It goes in where the rope bends over the ring. A strand springs loose and stands out from it like a hair.",
        "Another strand. High above the singing line, the great lamp turns a little on its chain."
      ]
    },
    "fail": {
      "0": [
        "There is nowhere left to shoot from."
      ],
      "1": [
        "Your backs are almost against the pillars.",
        "There is no room left to step back into."
      ],
      "2": [
        "Somebody takes a blow that was meant for the gap you left.",
        "You loose with a hollowed face a sword's length from yours."
      ],
      "3": [
        "Wide. It rings on the iron ring and is gone into the dark. While you were aiming, the line took a step.",
        "You hit the stone a hand's breadth from it. The place you left in your own line has closed up, a yard further back than it was."
      ]
    },
    "between": [
      "They have not stopped singing. They have not once looked up.",
      "Beyond their line, on the floor before the throne, something is giving off a faint light."
    ]
  }
};
