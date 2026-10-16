// Garrick's morning line in the party chat (Core Rules §1: "He replies when spoken to and may add a line or two a day").
// One line, posted once for the whole party when the day opens at 5:00am (Fake Guru, 16 Oct: "5am").
// Canon has no list of these, so they were written for Fake Guru's approval: docs/design/garrick-morning-lines-proposal.md.
// Small talk only (the road, the food, the weather, the party's own doings), every line true, none of the banned phrases,
// no promise or prediction, no word before its first-use day, nothing from the day's own chapter before it is read.
// None on Week 1 Days 1 and 2 (the chat opens on Day 2, when the party first meets him) and none on a Day 1 from Week 2
// on (each picks up in the middle of the Gathering's last scene). Loaded onto the server by scripts/gen-garrick-morning-sql.ts.

export const GARRICK_MORNING_APPROVED = false; // set true once Fake Guru approves the lines below

export const GARRICK_MORNING_LINES: { week: number; day: number; line: string }[] = [
  { week: 1, day: 3, line: 'Bread\'s in the bag by the door. Take some for the road.' },
  { week: 1, day: 4, line: 'Eat standing up if you must, but eat.' },
  { week: 1, day: 5, line: 'Cold morning. Keep your hands in your sleeves till the sun\'s up.' },
  { week: 1, day: 6, line: 'Fill every flask before we set off. It\'s a long road north.' },

  { week: 2, day: 2, line: 'Porridge first. Then the mill.' },
  { week: 2, day: 3, line: 'Wet night. Wring out your socks before your boots go on.' },
  { week: 2, day: 4, line: 'Stay close today. The path is narrow, and it climbs.' },
  { week: 2, day: 5, line: 'Keep the fire small this morning. Smoke carries on a hillside.' },
  { week: 2, day: 6, line: 'Sleep in turns today. One of us awake at all times.' },

  { week: 3, day: 2, line: 'A long day west. Eat now, and again at noon.' },
  { week: 3, day: 3, line: 'Half a day up the black road. Take water, and plenty of it.' },
  { week: 3, day: 4, line: 'Tie a cloth over your mouth today. The ash gets into everything.' },
  { week: 3, day: 5, line: 'Up before the light, all of you. Quietly.' },
  { week: 3, day: 6, line: 'A steep climb today. Keep a steady pace and save your breath.' },

  { week: 4, day: 2, line: 'Long road today. Eat while it\'s hot.' },
  { week: 4, day: 3, line: 'Any cuts from yesterday, show me before we go. Better cleaned now than later.' },
  { week: 4, day: 4, line: 'Lake air gets into your bones. Keep your cloak on.' },
  { week: 4, day: 5, line: 'Thick morning. Stay within arm\'s reach of each other.' },
  { week: 4, day: 6, line: 'Rest today while you can. Tonight is for rowing.' },

  { week: 5, day: 2, line: 'Two days on foot. Bind your feet before the blisters start.' },
  { week: 5, day: 3, line: 'Last of the good bread this morning. Share it out fair.' },
  { week: 5, day: 4, line: 'Quiet place, this. Keep your voices down and your boots soft.' },
  { week: 5, day: 5, line: 'Eat something hot while we have a fire.' },
  { week: 5, day: 6, line: 'Back to the wall this morning. Stay together.' },

  { week: 6, day: 2, line: 'Whispers only this morning. Sound carries in these walls.' },
  { week: 6, day: 3, line: 'Sleep through the day if you can. The work is after dark.' },
  { week: 6, day: 4, line: 'Grey morning. Eat slowly and keep warm.' },
  { week: 6, day: 5, line: 'Up, all of you. Shake the cold out of your legs.' },
  { week: 6, day: 6, line: 'Eat well this morning. All of it.' },
];
