// Piece C3 (docs/design/handoff-ledger.md): The fight card — both sides' numbers in colour
// (Weapon gold #E5C158, Armour blue #7AA7FF, Defence orange #FB923C, Attack purple #C084FC),
// "You hit on N+ / He hits on M+", and colour-coded round lines.
const fs = require('fs');
const path = require('path');

let failed = 0;
function check(cond, label, detail) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
}

const root = path.join(__dirname, '..', '..');
const day = fs.readFileSync(path.join(root, 'src/online/OnlineDay.tsx'), 'utf8');
const gathering = fs.readFileSync(path.join(root, 'src/online/OnlineGathering.tsx'), 'utf8');

const fightSlice = day.slice(day.indexOf("if (step.t === 'fight')"), day.indexOf("if (step.t === 'summary')"));

// 1. Separate weapon_level and armor_level gear lookup + You hit on N+ / He hits on M+ clamped 2..20.
check(
  /today\?\.progress\?\.weapon_level/.test(fightSlice) &&
    /today\?\.progress\?\.armor_level/.test(fightSlice) &&
    /const youHitOn = challengeSucceedOn\(curDef, curWep\)/.test(fightSlice) &&
    /const foeHitsOn = challengeSucceedOn\(curAmr, curAtk\)/.test(fightSlice) &&
    /You hit on \{youHitOn\}\+/.test(fightSlice) &&
    /Enemy hits on \{foeHitsOn\}\+/.test(fightSlice),
  'Fight card computes You hit on N+ / He hits on M+ from separate weapon_level and armor_level tracks'
);

// 2. Both sides' stat numbers in colour: Weapon gold (#E5C158), Armour blue (#7AA7FF), Defence orange (#FB923C), Attack purple (#C084FC).
check(
  /text-\[#E5C158\][\s\S]{0,120}Weapon<\/span>/.test(fightSlice) &&
    /text-\[#7AA7FF\][\s\S]{0,120}Armour<\/span>/.test(fightSlice) &&
    /text-\[#FB923C\][\s\S]{0,120}Defence<\/span>/.test(fightSlice) &&
    /text-\[#C084FC\][\s\S]{0,120}Attack<\/span>/.test(fightSlice),
  'Both sides stats are colour-coded: Weapon gold (#E5C158), Armour blue (#7AA7FF), Defence orange (#FB923C), Attack purple (#C084FC)'
);

// 3. Round lines in colour (You Roll green, Weapon gold, DEF orange, Enemy Rolls red, ATK purple, Armor blue).
check(
  /data-round-you[\s\S]{0,700}text-\[#E5C158\]">Weapon \{r\.playerAtk\}[\s\S]{0,200}text-\[#FB923C\]">Defence \{r\.enemyDef\}/.test(fightSlice) &&
    /data-round-foe[\s\S]{0,700}text-\[#C084FC\]">Attack \{r\.enemyAtk\}[\s\S]{0,200}text-\[#7AA7FF\]">Armour \{r\.playerArmor\}/.test(fightSlice),
  'OnlineDay round lines colour-code Weapon (#E5C158), DEF (#FB923C), ATK (#C084FC), and Armor (#7AA7FF)'
);

// 4. Gathering BattleCard also colour-codes Weapon, DEF, ATK, and Armor in its header and round lines.
check(
  /text-\[#E5C158\]">Weapon \{l\.attack\}/.test(gathering) &&
    /text-\[#FB923C\]">Defence \{l\.defence\}/.test(gathering) &&
    /text-\[#C084FC\]">Attack \{l\.attack\}/.test(gathering) &&
    /text-\[#7AA7FF\]">Armour \{l\.defence\}/.test(gathering),
  'OnlineGathering BattleCard also colour-codes Weapon (#E5C158), DEF (#FB923C), ATK (#C084FC), and Armor (#7AA7FF)'
);

if (failed > 0) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('Fight card colour & math test (C3) passed all 4 checks');
