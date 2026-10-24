// Phase 0.3 (24 Oct): the Record's near-miss lines say only what can really raise a number, the Open Hand line can be
// held back to once a week, and canon's tier name is Expert. Usage: npx tsx tests/data/check-record-chase.ts
import { computeNearMissLine, drawLevelLine, getTierInfo, OPEN_HAND_LINE } from '../../src/data/mythiosRulesData';

let failed = false;
const check = (name: string, ok: boolean) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
  if (!ok) failed = true;
};
const lead = (key: string, leadVal: number) => ({ [key]: { isLead: false, leadVal, leadFriend: 'Mei' } });

check('76 to 100 is Expert (+6)', getTierInfo(80).name === 'Expert' && getTierInfo(80).bonus === 6);
check('a near-Expert line says Expert', computeNearMissLine({ attributes: { Might: 74, Craft: 10, Intellect: 10, Charm: 10, Agility: 10, Aim: 10 } }) === 'Might 74: 2 points from Expert.');
check('Best Streak: play tomorrow', computeNearMissLine({ stats: { bestStreak: 2 }, partyLeads: lead('bestStreak', 3) }) === 'Mei leads Best Streak by one. Play tomorrow to draw level.');
check('Battles Won: the Gathering', computeNearMissLine({ stats: { battlesWon: 0 }, partyLeads: lead('battlesWon', 1) }) === 'Mei leads Battles Won by one. The Gathering is the place to draw level.');
check('Perfect Rolls: no line (luck)', computeNearMissLine({ stats: { perfectRolls: 0 }, partyLeads: lead('perfectRolls', 1) }) === null);
check('every stat but Perfect Rolls has a way to draw level', ['daysPlayed', 'bestStreak', 'gatheringsAttended', 'fragmentsSolved', 'relicsGiven', 'timesSteppedUp', 'fragmentsMatched', 'battlesWon', 'challengesCleared', 'challengesPressedOn', 'enemiesDefeated'].every((k) => drawLevelLine(k)) && drawLevelLine('perfectRolls') === null);
check('Open Hand shows when allowed', computeNearMissLine({ hasRelic: true, stats: { relicsGiven: 0 } }) === OPEN_HAND_LINE);
check('Open Hand held back when already shown this week', computeNearMissLine({ hasRelic: true, stats: { relicsGiven: 0 }, openHandAllowed: false }) === null);
process.exit(failed ? 1 : 0);
