// Writes the whole season as a player meets it, in playing order, for outside reviewers (Fake Guru, 17 Oct):
// docs/playthrough/season-part-1-weeks-1-2.md, -2-weeks-3-4.md and -3-weeks-5-6.md (Week 1 Day 1 to Week 6 Day 7: the morning chat line, the road so far, the
// Seeker fragment, the chapter in your own thread with every Challenge, fight and branch, the last light, the Campfire,
// and each Gathering) and docs/playthrough/after-the-finale.md (the secret and Garrick's Recap, for after Week 6 only).
// Built from the game's own data, never typed; rerun after any change: npx tsx scripts/gen-playthrough.ts
// Never publish these files: they hold the whole season, and the second one holds the secret.
import fs from 'fs';
import { CHAPTER_SCRIPTS, type ScriptStep, type ScriptCond } from '../src/data/chapterScripts';
import { GATHERING_SCRIPTS, type GatheringStep, type GatheringCond } from '../src/data/gatheringScripts';
import { DAY_RECAPS } from '../src/data/dayRecaps';
import { SEEKER_FRAGMENTS } from '../src/data/mythiosFragments';
import { GARRICK_MORNING_LINES } from '../src/data/garrickMorningLines';
import { APPROVED_FAN_OUT_LEADS, lateLineFor } from '../src/data/fanOutLeads';
import { CAMPFIRE_DAYS_DATA, CAMPFIRE_STORED_LINES } from '../src/data/campfireDaysData';
import { FRAGMENT_MEANING_QUESTIONS } from '../src/data/fragmentMeaningQuestions';
import { WEEK_QUESTIONS } from '../src/data/weekQuestions';
import { UNITED_EFFORT_STORIES } from '../src/data/unitedEffortStories';
import { EPISODE_NUMBERS } from '../src/data/mythiosRulesData';
import { GATHERINGS_DATA } from '../src/data/mythiosGatheringsAndAudit';
import { WEEKDAY_INVENTORY } from '../src/data/mythiosChaptersData';
import { GARRICK_RECAP } from '../src/data/garrickRecap';
import * as GOLD from '../src/data/economy';
import { fillScriptTokens, isFriendChoice, personalStakeLine } from '../src/components/ChapterScriptParts';

// The sample party of four: you, then Mei, Dev and Arjun, filled the way the game fills them (ChapterScriptParts.tsx).
// The stake line uses stand-ins for the player's two optional Session Zero answers.
const TOKENS = {
  friends: ['Mei', 'Dev', 'Arjun'],
  partySize: 4,
  stake: personalStakeLine('[the town you were born in]', "[your grandparent's name]"),
};
const fill = (s: string) =>
  fillScriptTokens(s, TOKENS)
    .replace(/\{RISK\}/g, 'Dev')
    .replace(/\{friend(:[A-Za-z]+)?\}/g, (_m, a?: string) => (a ? `[the friend at the fire best at ${a.slice(1)}]` : '[a friend]'));
const quote = (s: string) =>
  !s.trim()
    ? ''
    : fill(s)
    .split('\n')
    .map((l) => (l.trim() ? `> ${l}` : '>'))
    .join('\n');
const gameplay = (s: string) => `*⚙ ${s}*`;

const out: string[] = [];
const w = (...l: string[]) => l.forEach((x) => out.push(x, ''));

const chapterCond = (c?: ScriptCond) => {
  if (!c) return '';
  if (c.on === 'challenge') return c.pass ? 'If you passed the Challenge' : 'If you failed the Challenge';
  if (c.on === 'press') return 'If you pressed on and passed';
  if (c.on === 'fight') return c.won ? 'If you won the fight' : 'If you lost the fight';
  if (c.on === 'claim') {
    const what = c.key.replace(/^G(\d):united-effort-lost$/, 'the party lost Gathering $1\'s United Effort');
    return c.has ? `If ${what}` : `If ${what.replace('lost', 'won')}`;
  }
  return '';
};

const succeedOn = (dc: number) => `a Novice (+0) succeeds on ${Math.min(20, Math.max(2, dc + 1))}+`;

function chapter(week: number, day: number) {
  const ch = CHAPTER_SCRIPTS.find((c) => c.week === week && c.day === day);
  if (!ch) return;
  const ep = EPISODE_NUMBERS.find((e) => e.week === week)!;
  w(`### Your thread: the chapter, "${ch.title}"`);
  w(gameplay(`Played alone, in your own thread. Today's question: ${fill(ch.question)}`));
  let lastChoice: string[] = [];
  const choices: Record<number, string[]> = {};
  // After lines only some players read, the next shared line says so (the outside audits read branch-only text
  // as everyone's, and shared text as branch-only, when this was missing).
  let branchOpen = '';
  const shared = () => {
    if (branchOpen) w(gameplay(branchOpen));
    branchOpen = '';
  };
  for (const st of ch.steps as ScriptStep[]) {
    if (st.t === 'say') {
      const c = chapterCond(st.cond);
      if (c) {
        w(gameplay(`${c}:`));
        branchOpen = 'Either way, every player reads this:';
      } else shared();
      if (st.pull) w(gameplay('The Pull (why tomorrow cannot wait):'));
      if (st.fragment) w(gameplay('The fragment moment:'));
      w(quote(st.text));
    } else if (st.t === 'act') {
      shared();
      w(gameplay(`A button: [${fill(st.label)}]`));
    } else if (st.t === 'choice') {
      shared();
      lastChoice = st.labels;
      choices[st.id] = st.labels;
      const how = {
        pick: 'Pick one; only the picked branch plays.',
        each: 'Pick in any order until every branch has been seen.',
        auto: 'Pick one; it plays, then the others follow.',
        flavor: 'Pick one; the choice colours the moment, the story is the same.',
      }[st.mode];
      w(gameplay(`A choice: ${st.labels.map((l) => `[${fill(l)}]`).join(' or ')}. ${how}`));
      if (isFriendChoice(st.labels)) w(gameplay('One button per friend in the party; the lines after it name the friend you picked.'));
      for (const b of st.branches) {
        w(gameplay(`If you pick ${b.options.map((o) => `[${fill(st.labels[o])}]`).join(' or ')}:`));
        w(quote(b.text));
      }
      if (st.mode === 'pick' && st.branches.length) branchOpen = 'Whatever you picked, every player reads this:';
    } else if (st.t === 'notice') {
      w(gameplay('Your build notices: you see the line for your highest Attribute (from Apprentice on, with its second sentence; at the fire a friend may share it).'));
      for (const [attr, l] of Object.entries(st.lines)) {
        if (!l) continue;
        w(`- **${attr}:** ${fill(l.first)}${l.second ? ` *(Apprentice and up:)* ${fill(l.second)}` : ''}`);
      }
      out.push('');
    } else if (st.t === 'challenge') {
      shared();
      const dc = ep.weekdayDC;
      w(`**CHALLENGE: ${fill(st.title)}**`);
      w(quote(st.desc));
      w(gameplay(
        `Pick one: ${st.options.map((o) => `${o.attr} (${fill(o.verb)})`).join(', or ')}. Roll d20 + that Attribute's tier bonus against DC ${dc}: ${succeedOn(dc)}. ` +
          `Pass: ${fill(st.reward)}, and the Attribute grows. Fail: ${fill(st.fail)}, and −${GOLD.GOLD_CHALLENGE_LOSS}g. An Attribute Relic adds +4.`
      ));
      if (st.harderIf) w(gameplay(`${chapterCond({ on: 'claim', key: st.harderIf.key, has: st.harderIf.has })}, the card is ${st.harderIf.by} harder, and says: ${fill(st.harderIf.line)}`));
    } else if (st.t === 'press') {
      w(`**[PRESS ON]: ${fill(st.title)}**`);
      w(gameplay(`Offered only after a pass: ${fill(st.detail)}. ${st.harder} harder (DC ${ep.weekdayDC + st.harder}). [PRESS ON] or [LEAVE IT]. Pass: ${fill(st.reward)}; fail costs nothing.`));
    } else if (st.t === 'fight') {
      shared();
      const pay = WEEKDAY_INVENTORY.find((d) => d.week === week && d.day === day)?.fightReward ?? 0;
      w(`**FIGHT: ${fill(st.name)}**`);
      w(quote(st.desc));
      const sf = st.strikeFirst;
      const first =
        sf.on === 'player'
          ? 'You strike first.'
          : sf.on === 'challenge'
            ? 'Who strikes first is set by today\'s Challenge: you on a pass, the enemy on a failure.'
            : `Who strikes first is set by your choice (${sf.options.map((o) => `[${fill((choices[sf.choice] ?? lastChoice)[o] ?? String(o))}]`).join(' or ')} lets you strike first; otherwise the enemy does).`;
      w(gameplay(
        `100 HP each. You hit when d20 + Weapon − enemy DEF ${ep.wDef} is 1 or more; the enemy when d20 + ATK ${ep.wAtk} − your Armor is 1 or more. Damage = the margin × 5. One tap a round. ${first} ` +
          `A Combat Relic gives +1 Weapon and +1 Armor for the rest of the fight. Win: ${pay ? `+${pay}g` : 'no gold (today\'s Challenge is the paid beat)'}. At 0 HP: "DEFEATED.", and the story goes on.`
      ));
      if (st.firstLines) {
        w(gameplay('If you strike first:'), quote(st.firstLines[0]), gameplay('If the enemy strikes first:'), quote(st.firstLines[1]));
        branchOpen = 'Either way, every player reads this:';
      }
    } else if (st.t === 'summary') {
      shared();
      w(gameplay('The day summary card:'));
      for (const l of st.lines) out.push(`- ${fill(l).replace(/`\[([^\]]+)\]`/g, '[$1]')}`);
      out.push('');
    }
  }
}

function lastLight(week: number, day: number) {
  const leads = APPROVED_FAN_OUT_LEADS[`${week}-${day}`] ?? [];
  if (!leads.length) return;
  w('### The last light (Fan Out)');
  w(gameplay(
    'After the chapter, before the fire: follow ONE lead, or go straight to the fire. One quick Challenge on the week\'s DC, no gold, no growth. ' +
      'The clue always comes back; a pass also gives the first letter of one of today\'s fragment words. Friends who pick the same lead share one board card.'
  ));
  for (const l of leads) {
    w(`**Lead: ${fill(l.place)}**: ${l.actions.map((a) => `${a.attr}${a.verb ? ` (${fill(a.verb)})` : ''}`).join(', or ')}`);
    w(`Clue found, "${fill(l.clueTitle)}":`, quote(l.clueText));
  }
  w(gameplay(`On a failed roll, the clue still comes, with: "${fill(lateLineFor(week, day))}"`));
}

function campfire(week: number, day: number) {
  const f = CAMPFIRE_DAYS_DATA.find((c) => c.week === week && c.day === day);
  if (!f) return;
  w(`### The Campfire: ${fill(f.place)}`);
  w(gameplay(
    f.narratedNoGarrick
      ? 'Garrick is not here tonight: MYTHIOS narrates the fire.'
      : `Garrick is at the fire. He says at most eight stored lines to one friend (no AI here). Tone tonight: ${f.tone}.`
  ));
  if (f.cupNight) w(gameplay('A cup night:'), quote(CAMPFIRE_STORED_LINES.cupNightStageDirection));
  if (f.narratedSilence) {
    w(gameplay('Quiet night (silence):'), quote(f.narratedSilence));
  } else if (f.opener) {
    w(f.narratedNoGarrick ? gameplay('Opening narration:') : gameplay('Garrick opens:'), quote(f.opener));
  }
  if (!f.narratedNoGarrick)
    w(gameplay(`If you are the first at the fire: "${CAMPFIRE_STORED_LINES.firstArrivalGreeting}" Friends who pinned before you are read back ("Mei thinks the list is a warning."), at most two. He may notice up to two things a friend did today ("${fill(CAMPFIRE_STORED_LINES.noticingTemplates.lentRelic)}").`));
  w(gameplay('The board: one card for each lead taken at the last light, with every finder\'s name; a lead nobody took reads "Nobody went to … tonight."'));
  w(gameplay('Today\'s fragment: once its two words are found (in the Seeker Chest), it is read out here, then a meaning question to pin an answer to:'));
  const mq = FRAGMENT_MEANING_QUESTIONS[`${week}-${day}`];
  if (mq) w(quote(mq));
  w('**Tonight\'s question**');
  if (f.nudge) w(f.narratedNoGarrick ? gameplay('Narration:') : gameplay('Garrick:'), quote(f.nudge));
  if (f.callback) w(gameplay('Then he recalls:'), quote(f.callback));
  w(gameplay('Each friend pins one reading, then may see the others\' (names shown, never a count or a winner), and may add their own line:'));
  w(`- A: ${fill(f.forkA)}`, `- B: ${fill(f.forkB)}`, '- Neither.');
  out.push('');
  if (f.riddle) {
    w(gameplay(`The riddle (shared by the party, three tries each${f.tone === 'quiet' ? '; on a quiet night it is only asked if someone wants it' : ''}):`));
    w(quote(f.riddle.q), gameplay(`Answer: ${f.riddle.a}. His line when it is solved:`), quote(f.riddle.quip));
  }
  w(gameplay(`The case so far: each friend keeps one line answering the week's question, "${WEEK_QUESTIONS[week]}", read back at the Gathering's opening. Also: an open question to leave for the party.`));
  w(gameplay(
    f.narratedNoGarrick
      ? 'Leaving the fire: the Pull again.'
      : `Leaving the fire: Garrick's goodnight (one of: ${CAMPFIRE_STORED_LINES.closers.map((c) => `"${c}"`).join(', ')}), "What we did today" (one line per friend, only for what they really did), then the Pull again, and a message in a bottle for whoever comes next.`
  ));
}

const gatheringCond = (c?: GatheringCond) => {
  if (!c) return '';
  if (c.on === 'approach') return c.pass ? 'If the Approach passed' : 'If the Approach failed';
  if (c.on === 'ue') return c.won ? 'If the United Effort was won' : 'If the United Effort was lost';
  if (c.on === 'pick') return `If option ${c.option + 1} was picked`;
  if (c.on === 'alone') return 'If one friend plays alone';
  if (c.on === 'unasked') return 'If the sealed question went unasked';
  return '';
};

function gathering(week: number) {
  const g = GATHERING_SCRIPTS.find((x) => x.week === week);
  const ep = EPISODE_NUMBERS.find((e) => e.week === week)!;
  const gd = GATHERINGS_DATA.find((x) => x.week === week)!;
  const story = UNITED_EFFORT_STORIES[week];
  if (!g) return;
  w(`### The Gathering (live, the whole party together in the party chat)`);
  let branchOpen = '';
  for (const st of g.steps as GatheringStep[]) {
    const c = gatheringCond(st.cond);
    // Lines for one outcome only are labelled; the next line for everyone says so.
    if (c && st.t !== 'say' && st.t !== 'pick') w(gameplay(`Only ${c.charAt(0).toLowerCase()}${c.slice(1)}:`));
    if (c) branchOpen = 'Either way, the whole party reads this:';
    else if (branchOpen && st.t !== 'section' && st.t !== 'ueEnd') {
      w(gameplay(branchOpen));
      branchOpen = '';
    }
    if (st.t === 'tonight') {
      w(gameplay('That morning, in each friend\'s thread:'), quote(st.text));
      w(gameplay(
        'Lobby at the time the party picked (poll on Day 4); starts once everyone is in, or any friend may start after 10 minutes, or by itself after 30. ' +
          'MYTHIOS posts the story a passage at a time; [GO ON] moves it on. About 20 to 30 minutes with the table talking.'
  ));

    } else if (st.t === 'section') {
      w(`#### ${fill(st.title)}`);
    } else if (st.t === 'say') {
      if (c) w(gameplay(`${c}:`));
      w(quote(st.text));
    } else if (st.t === 'act') {
      w(gameplay(`A button any friend may tap: [${fill(st.label)}]`));
    } else if (st.t === 'pick') {
      if (c) w(gameplay(`${c}:`));
      const how = st.vote
        ? 'A group vote (majority after 30 seconds; the vote shows who is best at each option)'
        : st.question === 'THE FIFTH IS IN YOUR HANDS.'
          ? 'Every friend picks privately; the majority decides (a tie holds it back)'
          : st.question === 'SAY A NAME.'
            ? 'Every friend picks for themselves'
            : 'One friend, chosen at random, picks alone';
      w(gameplay(`${how}${st.question ? `: ${fill(st.question)}` : ''}`));
      st.options.forEach((o, i) => out.push(`${i + 1}. **${fill(o.label)}**: ${fill(o.desc)}`));
      out.push('');
    } else if (st.t === 'approach') {
      w(`**THE APPROACH: ${fill(st.title)}**`);
      w(gameplay(
        `One friend steps up (whoever has rolled fewest Approaches) and rolls for the party, in front of everyone: ${st.ways.map((x) => `${fill(x.by)} → ${x.attr} (${fill(x.verb)})`).join('; ')}. ` +
          `DC ${ep.gatheringDC}; the roller adds +2 to the roll if the party solved the week's map (the map helps). Pass: ${fill(st.reward)}. Fail: ${fill(st.fail)}. The result sets who strikes first in the Battle.`
      ));
    } else if (st.t === 'battle') {
      w(`**THE BATTLE: ${fill(st.name || gd.enemyName)}**`);
      w(quote(st.desc));
      w(gameplay(
        `Every friend fights one enemy of their own at once (${gd.enemyName}: DEF ${ep.gDef}, ATK ${ep.gAtk}), in lockstep rounds every 10 seconds; the fight rules are the weekday ones. ` +
          `${week === 1 ? 'No condition.' : `Condition: ${gd.conditionText}`} A friend below 50 HP sends a help-call to the chat; a friend who has won joins another fight. ` +
          `The party wins when the last enemy falls: +${GOLD.GOLD_GATHERING_BATTLE_REWARDS[week]}g each. A fallen friend is "DEFEATED." and stays for the night.`
      ));
      if (st.firstLines) w(gameplay('If the party strikes first:'), quote(st.firstLines[0]), gameplay('If the enemy strikes first:'), quote(st.firstLines[1]));
    } else if (st.t === 'notice' || st.t === 'lookCloser') {
      w(gameplay(
        st.t === 'notice'
          ? 'Notice: each friend gets one private line for their highest Attribute (a fallen friend gets the "from the floor" line):'
          : `[LOOK CLOSER]: an optional roll on that Attribute (DC ${ep.gatheringDC}); a pass adds +${GOLD.GOLD_LOOK_CLOSER_WIN}g and this line:`
      ));
      for (const [a, l] of Object.entries(st.lines)) if (l) out.push(`- **${a === 'floor' ? 'From the floor' : a}:** ${fill(l)}`);
      out.push('');
    } else if (st.t === 'ue') {
      w(`**THE UNITED EFFORT: ${gd.ueTitle}**`);
      w(gameplay(
        `Two bars at 100 (60 for a friend alone): "${fill(gd.ueBarAName)}" (the thing in the way) and "${fill(gd.ueBarBName)}" (the thing at risk). ` +
          `Friends take turns, nobody twice until all have gone. Each turn is a ${gd.ueAttr} Challenge against DC ${ep.ueDC}. Pass: 10 + d20 off the thing in the way. Fail: 10 + d20 off the thing at risk. ` +
          `It ends when either bar hits 0. Won: +${GOLD.GOLD_UNITED_EFFORT_WIN}g to every friend present. One Relic per roll (+4). The story lines it can say, as the bars fall:`
      ));
      const band = { '3': 'early', '2': 'middle', '1': 'late', '0': 'the end' } as Record<string, string>;
      for (const side of ['success', 'fail'] as const) {
        out.push(`- **On a ${side === 'success' ? 'pass' : 'fail'}:**`);
        for (const k of ['3', '2', '1', '0']) for (const l of story[side][Number(k) as 0 | 1 | 2 | 3]) out.push(`  - *(${band[k]})* ${fill(l)}`);
      }
      out.push(`- **Between turns:** ${story.between.map((l) => fill(l)).join(' / ')}`, '');
    } else if (st.t === 'ueEnd') {
      // The script's marker for where each ending begins; the branch lines that follow carry their own label.
    } else if (st.t === 'match') {
      w(`**MATCH**`);
      w(gameplay(`${fill(st.question)} The card shows this line, and the week's six fragments as rows; each friend picks privately. Each right pick +${GOLD.GOLD_MATCH_BASE_PER_PICK}g (${GOLD.GOLD_MATCH_PERFECT_PER_PICK}g if every friend present is right). Wrong picks are never shown.`));
      w(quote(`${st.quote}\n\n${st.source}`));
      w(gameplay(`The right row: "${fill(st.fragment)}"`));
    } else if (st.t === 'turn') {
      w(gameplay('A question to the table (anyone answers in the chat; MYTHIOS never grades it):'), quote(st.question));
      if (st.nudge) w(gameplay('After sixty quiet seconds:'), quote(st.nudge));
      if (st.answer) w(gameplay('After ninety, the answer:'), quote(st.answer));
    } else if (st.t === 'ask') {
      w(gameplay('ASK: a board of questions; each friend taps one. Sealed questions the night needs are answered after two quiet minutes if nobody asks them.'));
      for (const r of st.rows) {
        out.push(`- **${r.questions.map(fill).join(' / ')}**${r.sealed ? ' *(sealed)*' : ''}${r.group ? ` *(${r.group})*` : ''}: ${fill(r.answer)}${r.note ? ` *(${fill(r.note)})*` : ''}`);
      }
      out.push('');
      if (st.unaskedLine) w(gameplay('If the party moves on with a sealed question unasked:'), quote(st.unaskedLine));
    } else if (st.t === 'summary') {
      w(gameplay('The summary card:'));
      for (const l of st.lines) out.push(`- ${fill(l).replace(/`\[([^\]]+)\]`/g, '[$1]')}`);
      out.push('');
    }
  }
}

// ---- The season ----
w(
  '## How the game plays (the rules in brief)',
  '- **The app and the party.** *Tales of the Dark Moon* is a story game in a chat app for a fixed party of 2 to 6 real friends, over 6 weeks. A storyteller called MYTHIOS tells it from stored text. Each friend plays one character, under their own name, with one of six classes (Warrior, Artificer, Sage, Trickster, Assassin, Archer).',
  '- **A week** is six weekdays (Days 1 to 6), each played alone in about 8 to 12 minutes, then a live Gathering on Day 7, played together. A day opens at 5:00am party time.',
  '- **Places:** your own thread (the day\'s chapter, private questions to Garrick), the party chat (one result line per friend, Garrick\'s morning line, talk, the Gathering), and the tabs: Record (your numbers), Bag (Relics, Seeker Chest, Dark Moon Verses), Store (gear and Relics).',
  `- **Attributes:** Might, Craft, Intellect, Charm, Agility, Aim, each in a tier: Novice 1–25 (+0), Apprentice 26–50 (+2), Adept 51–75 (+4), Expert 76–100 (+6), Master 101+ (+8).`,
  `- **A Challenge:** pick one of two Attributes the card offers, roll d20 + its tier bonus − the DC; 1 or more passes, a tie fails. Weekday DC by week: ${EPISODE_NUMBERS.map((e) => e.weekdayDC).join(', ')}. The card says "You succeed on X+". Pass: +${GOLD.GOLD_CHALLENGE_WIN}g and the Attribute grows. Fail: −${GOLD.GOLD_CHALLENGE_LOSS}g, and a worse branch of the scene. Both branches reach the same plot. [PRESS ON], on some days after a pass: 4 harder, +${GOLD.GOLD_PRESS_ON_WIN}g and one extra detail.`,
  '- **Fights:** 100 HP each side, one tap a round, damage = the hit\'s margin × 5. Gear on two tracks (Weapon 14–18, Armor 27–31, Levels 1–5) bought in the Store. Nobody dies: at 0 HP, "DEFEATED.", and the story goes on.',
  `- **Relics** (${GOLD.GOLD_RELIC_COST}g): an Attribute Relic gives +4 on one roll; a Combat Relic gives +1 Weapon and +1 Armor for one fight. Relics can be given to friends; gold cannot.`,
  `- **The Seeker Fragment:** each day a short old text with two missing words appears in every friend's Seeker Chest; each word is a jumble of letters to unscramble (+${GOLD.GOLD_FRAGMENT_WORD_SOLVED}g a word). Six fragments make the week's map, which helps at the Gathering.`,
  '- **Garrick**, the innkeeper who travels with the party, is in the party chat: he answers when a message names him, from stored lines (AI small talk only about the road, food and weather, filtered). He never lies, promises or predicts. He can also be asked privately in your own thread and at the fire.',
  '- **After the chapter:** the last light (one optional lead and a clue), then the Campfire (shared notes, tonight\'s question, the riddle), then bed.',
  '- **The Gathering:** the Approach (a group vote, one friend rolls), the Battle (everyone fights their own enemy at once), Notice and [LOOK CLOSER], the United Effort (one shared job, turns), the Lore Reveal with Match and Ask, the Twist, the Cliffhanger.',
  '- **Each new day opens with "the road so far":** a short recap of yesterday (and of any day a friend missed).'
);
const RULES = out.splice(0);

function playWeek(week: number) {
  const ep = EPISODE_NUMBERS.find((e) => e.week === week)!;
  w(`# Week ${week}: ${ep.title}`);
  w(gameplay(`This week: weekday DC ${ep.weekdayDC}; weekday enemy DEF ${ep.wDef}, ATK ${ep.wAtk}; the Gathering calls on ${ep.ueAttr}. The week's question at the fire: "${WEEK_QUESTIONS[week]}"`));
  for (let day = 1; day <= 7; day++) {
    w(`## Week ${week}, Day ${day}${day === 7 ? ': the Gathering' : ''}`);
    const morning = GARRICK_MORNING_LINES.find((m) => m.week === week && m.day === day);
    if (morning) w('### Morning, in the party chat (5:00am)', gameplay('Garrick posts one line for the party:'), quote(morning.line));
    const prev = day === 1 ? DAY_RECAPS.find((r) => r.week === week - 1 && r.day === 7) : DAY_RECAPS.find((r) => r.week === week && r.day === day - 1);
    if (prev) w('### The road so far', gameplay('Opens the day in your thread: yesterday\'s recap.'), quote(prev.recap));
    if (day === 7) {
      gathering(week);
      continue;
    }
    chapter(week, day);
    const frag = SEEKER_FRAGMENTS.find((f) => f.week === week && f.day === day);
    if (frag) {
      w('### The Seeker Fragment (in your Seeker Chest)', gameplay('Waiting in every friend\'s Seeker Chest from the morning; solved whenever you like, usually after the chapter or at the fire.'));
      w(gameplay(`Found at: ${frag.placeLabel}. Two words to unscramble: [${frag.jumble1.join(' ')}] and [${frag.jumble2.join(' ')}].`));
      w(quote(frag.displayTemplate.replace('{0}', '_____').replace('{1}', '_____')), gameplay('Solved:'), quote(frag.fullText));
    }
    lastLight(week, day);
    campfire(week, day);
  }
}

const PARTS: [number, number][] = [[1, 2], [3, 4], [5, 6]];
fs.mkdirSync('docs/playthrough', { recursive: true });
for (const [i, [from, to]] of PARTS.entries()) {
  out.length = 0;
  w(
    `# Tales of the Dark Moon: the season as a player plays it, part ${i + 1} of 3 (Weeks ${from} and ${to})`,
    `Weeks ${from} and ${to}, Day 1 to Day 7, in playing order. Generated from the game's own data by \`scripts/gen-playthrough.ts\` (` +
      new Date().toISOString().slice(0, 10) +
      '). **Do not publish: it holds the season\'s story.**',
    '**How to read it.** Quoted text (`>`) is exactly what the player reads. Lines in *⚙ italics* describe the gameplay: what the screen offers, the rule, the numbers. ' +
      'Where the story branches, every branch is given, each labelled. The party is a sample of four: you, Mei, Dev and Arjun (the game fills in the real friends\' names and the party\'s size).'
  );
  out.push(...RULES);
  for (let week = from; week <= to; week++) playWeek(week);
  if (to === 6) w('# The end of the season', gameplay('Each friend gets a season summary, ending: "Your Seeker\'s story continues." Garrick\'s Recap unlocks: every line he said, and what it meant (see after-the-finale.md).'));
  fs.writeFileSync(`docs/playthrough/season-part-${i + 1}-weeks-${from}-${to}.md`, out.join('\n').replace(/\n{3,}/g, '\n\n'));
}

// ---- After the finale: the secret and Garrick's Recap ----
const after: string[] = [
  '# After the finale: the secret, and Garrick\'s Recap',
  '**For a reviewer, only after Week 6 Day 7 has been read.** Generated by `scripts/gen-playthrough.ts`. Never shown to players before the end; never publish.',
  '',
  '## The secret',
  'Garrick, the warm innkeeper who guides the party, is the last living descendant of the sleeping king Malakor and the hidden leader of the Order, the cult that wants the king woken. He never lies: the whole season deceives through true statements and withheld meaning. Every rescue still helps the ritual, because the party\'s solving of the maps shows the Order where each Stone is. At the finale, the ritual that locked the king releases him ("the key that locks is also the key that unlocks").',
  '',
  '## Garrick\'s Recap (unlocked after the finale): every line, and what it meant',
  '',
];
for (const wk of GARRICK_RECAP) {
  after.push(`### Week ${wk.week}`, '');
  for (const e of wk.entries) after.push(`- ${e.when ? `*${fill(e.when)}:* ` : ''}${fill(e.line)}  \n  **Meant:** ${fill(e.meaning)}`);
  after.push('');
}
fs.writeFileSync('docs/playthrough/after-the-finale.md', after.join('\n'));
console.log('wrote docs/playthrough/season-part-1..3 and after-the-finale.md');
