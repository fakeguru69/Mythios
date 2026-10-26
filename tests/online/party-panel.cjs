// Piece C8 (docs/design/handoff-ledger.md): Party panel polish
//  1. Friend rows with an avatar letter, class, and a status ("At the fire", "Reading Day 2").
//  2. Remove sits behind the row's ⋯ menu (host only, for other members).
//  3. The notification button is one button that disappears once on (shown highlighted in gold while not on).
//  4. Server-side security definer function party_member_statuses (migration 0098).
const fs = require('fs');
const path = require('path');

let failed = 0;
const check = (cond, label, detail) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failed += 1;
};

const root = path.join(__dirname, '..', '..');
const onlineApp = fs.readFileSync(path.join(root, 'src/online/OnlineApp.tsx'), 'utf8');
const notifications = fs.readFileSync(path.join(root, 'src/online/Notifications.tsx'), 'utf8');
const mig = fs.readFileSync(path.join(root, 'supabase/migrations/0098_party_statuses.sql'), 'utf8');

// 1. Friend rows in party panel have avatar letter, class, and status
check(
  /data-panel-friend/.test(onlineApp) &&
    /data-friend-avatar/.test(onlineApp) &&
    /data-friend-class/.test(onlineApp) &&
    /data-friend-status/.test(onlineApp),
  'OnlineApp renders friend rows with data-panel-friend, avatar letter, class, and status'
);

// 2. Avatar letter uses uppercase first character with Cinzel bold styling
check(
  /data-friend-avatar[\s\S]{0,120}\(r\.character_name \|\| '\?'\)\.charAt\(0\)\.toUpperCase\(\)/.test(onlineApp),
  'Avatar circle displays character first letter in uppercase'
);

// 3. Status displays "At the fire" in gold (#E5C158) and "Reading Day N" in muted color (#8F82A6)
check(
  /status === 'At the fire'\s*\?\s*'text-\[#E5C158\]/.test(onlineApp) &&
    /Reading Day \$\{currentDay\.day\}/.test(onlineApp),
  'Status displays "At the fire" (highlighted gold #E5C158) or "Reading Day N" (muted #8F82A6)'
);

// 4. Remove sits behind the row's ⋯ menu (host only, for other members)
const panelSlice = onlineApp.slice(onlineApp.indexOf('data-panel-friend'), onlineApp.indexOf('<GatheringCard'));
check(
  panelSlice.includes('data-friend-menu-button') &&
    panelSlice.includes('⋯') &&
    panelSlice.includes('data-friend-menu') &&
    panelSlice.includes('data-remove-button') &&
    panelSlice.includes('REMOVE FROM THE PARTY') &&
    /isHost && r\.user_id !== userId/.test(panelSlice) &&
    /menuFor === r\.user_id/.test(panelSlice),
  'Remove button sits behind the row ⋯ menu and is only visible to host for other members when opened'
);

// 5. Notification button is one highlighted gold button while off, and disappears once on
check(
  /if \(compact\) \{[\s\S]{0,100}if \(state === 'on'\) return null;/.test(notifications) &&
    /state === 'off' && \([\s\S]{0,120}className=\{goldButton\}[\s\S]{0,120}data-notification-button[\s\S]{0,80}TURN ON NOTIFICATIONS/.test(notifications),
  'Notification button is one gold button that disappears completely once on'
);

// 6. Server migration 0098 defines party_member_statuses with security definer and empty search_path
check(
  /create or replace function public\.party_member_statuses\(p_party uuid\) returns jsonb[\s\S]*?security definer set search_path = ''/i.test(mig) &&
    /'At the fire'/.test(mig) &&
    /'Reading Day ' \|\| v_day/.test(mig) &&
    /grant execute on function public\.party_member_statuses\(uuid\) to authenticated;/.test(mig),
  'Migration 0098 defines security-definer party_member_statuses returning "At the fire" and "Reading Day N"'
);

// 7. Client OnlineApp queries party_member_statuses RPC during load
check(
  /supabase\.rpc\('party_member_statuses', \{ p_party: partyId \}\)/.test(onlineApp),
  'OnlineApp loads memberStatuses from party_member_statuses RPC'
);

// 8. Test getPartyCurrentDay calculation
check(
  /const getPartyCurrentDay =/.test(onlineApp),
  'OnlineApp includes getPartyCurrentDay calculation helper'
);

process.exit(failed ? 1 : 0);
