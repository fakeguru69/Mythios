// The Store and your Relics, online (Core Rules §4, §5, §8, §12). Every purchase and gift goes to the server
// (buy_gear, buy_relic, give_relic), which keeps the gold and closes the Store while your own card or fight is open.
// The look follows the demo's Store (BagAndStoreTabs.tsx). The Relic Box lives here until the Bag comes online.
import { useCallback, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { ATTRIBUTE_META, CLASS_META, GEAR_TABLE, type AttributeName, type ClassName } from '../data/mythiosRulesData';
import { GOLD_RELIC_COST } from '../data/economy';
import { ErrorLine, heading, note, quietButton } from './ui';

export const RELIC_KINDS = ['Might', 'Craft', 'Intellect', 'Charm', 'Agility', 'Aim', 'Combat'] as const;
export type RelicKind = (typeof RELIC_KINDS)[number];
export const relicName = (k: string) => `${k} Relic`;
// "an Aim Relic", "a Charm Relic".
export const aRelic = (k: string) => `${/^[AEIOU]/.test(k) ? 'an' : 'a'} ${relicName(k)}`;
const relicColour = (k: string) => (k === 'Combat' ? '#D6DCEB' : ATTRIBUTE_META[k as AttributeName]?.color ?? '#D6DCEB');
const relicUse = (k: string) => (k === 'Combat' ? '+1 Weapon and +1 Armour for one fight' : `+4 on one ${k} roll`);

// Canon's first-time line, shown once, on first opening the Store (Core Rules §7).
const FIRST_STORE_LINE =
  'A Relic is used once. One kind adds 4 to a single roll. The other adds 1 to your Weapon and Armour for one fight. You can give them to friends, and sometimes a friend will need one.';

interface StoreState {
  gold: number;
  weaponLevel: number;
  armorLevel: number;
  relics: Record<string, number>;
  closedBy: 'card' | 'press' | 'fight' | 'gathering' | null;
  first: boolean;
  gifts: { from: string; relic: string; at: string }[];
  given: number;
}

type Pending =
  | { kind: 'gear'; track: 'weapon' | 'armor'; label: string; cost: number }
  | { kind: 'relic'; relic: RelicKind; cost: number }
  | { kind: 'give'; relic: RelicKind; to: string; name: string };

export default function OnlineStore({
  partyId,
  myClass,
  friends,
  onClose,
  embedded = false,
  onGold,
}: {
  partyId: string;
  myClass: string | null;
  friends: { id: string; name: string }[];
  onClose: () => void;
  /** The game shell's STORE tab (phase A): no back button; the gold shows in the shell's top bar. */
  embedded?: boolean;
  onGold?: (gold: number) => void;
}) {
  const [state, setState] = useState<StoreState | null>(null);
  const [firstLine, setFirstLine] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [giving, setGiving] = useState<RelicKind | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('store_state', { p_party: partyId });
    if (e) return setError(plainError(e.message));
    const s = data as StoreState;
    setState(s);
    if (s.first) setFirstLine(true);
  }, [partyId]);
  useEffect(() => {
    load();
  }, [load]);
  // The shell's top bar follows every purchase.
  const gold = state?.gold;
  useEffect(() => {
    if (gold !== undefined) onGold?.(gold);
  }, [gold, onGold]);

  if (!state) {
    return (
      <div className="space-y-3">
        {!embedded && (
          <button className={quietButton} onClick={onClose}>
            ‹ Back
          </button>
        )}
        {error ? <ErrorLine text={error} /> : <p className="text-center text-[#B7A9CC]">…</p>}
      </div>
    );
  }

  const cls = (myClass && myClass in CLASS_META ? myClass : 'Warrior') as ClassName;
  const gearNames = CLASS_META[cls];
  const closed = state.closedBy !== null;

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    setError(null);
    const { data, error: e } =
      pending.kind === 'gear'
        ? await supabase.rpc('buy_gear', { p_party: partyId, p_track: pending.track })
        : pending.kind === 'relic'
          ? await supabase.rpc('buy_relic', { p_party: partyId, p_relic: pending.relic })
          : await supabase.rpc('give_relic', { p_party: partyId, p_to: pending.to, p_relic: pending.relic });
    setBusy(false);
    setPending(null);
    setGiving(null);
    if (e) {
      setError(plainError(e.message));
      return load();
    }
    setState({ ...(data as StoreState), first: false });
  };

  const gearTile = (track: 'weapon' | 'armor') => {
    const level = track === 'weapon' ? state.weaponLevel : state.armorLevel;
    const name = track === 'weapon' ? gearNames.weapon : gearNames.armor;
    const word = track === 'weapon' ? 'Weapon' : 'Armour';
    const value = (l: number) => (track === 'weapon' ? GEAR_TABLE[l].weapon : GEAR_TABLE[l].armor);
    const next = level < 5 ? level + 1 : null;
    return (
      <div className="p-3 rounded-2xl bg-[#2A1B40] border border-[#7E68B8] flex flex-col justify-between min-h-[132px]">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[18px]">{track === 'weapon' ? '⚔️' : '🛡️'}</span>
            <span className="px-2 py-0.5 rounded bg-[#130B1F] border border-[#D4B876]/50 font-['Cinzel'] font-bold text-[12px] text-[#D4B876]">
              Lv. {level}
            </span>
          </div>
          {/* Canon: "Sword-Cane — Lv. 2 · Weapon 15" (Core Rules §4). */}
          <div className="font-['Cinzel'] font-bold text-[14px] mt-2">{name}</div>
          <div className="text-[14px] text-[#B7A9CC]">
            {word} {value(level)}
            {next ? ` → ${value(next)}` : ''}
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-[#44305F]">
          {next ? (
            <button
              disabled={closed || busy || state.gold < GEAR_TABLE[next].cost}
              onClick={() => setPending({ kind: 'gear', track, label: `${name} — Lv. ${next} · ${word} ${value(next)}`, cost: GEAR_TABLE[next].cost })}
              className="w-full py-1.5 rounded-lg bg-[#D4B876]/20 border border-[#D4B876] font-['Cinzel'] font-bold text-[12px] disabled:opacity-40"
            >
              LV. {next} · {GEAR_TABLE[next].cost.toLocaleString()}G
            </button>
          ) : (
            <div className="text-center font-['Cinzel'] font-bold text-[12px] text-[#6FD39A] py-1">LEVEL 5</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex items-center justify-between gap-2">
          <button className={quietButton} onClick={onClose}>
            ‹ Back
          </button>
          <span className="font-['Cinzel'] font-bold text-[14px] text-[#E5C158]">◎ {state.gold.toLocaleString()}g</span>
        </div>
      )}
      <h2 className={`${heading} text-[19px]`}>The Store</h2>

      {firstLine && <p className="font-sans italic text-[14px] text-[#B7A9CC]">{FIRST_STORE_LINE}</p>}

      {closed && (
        <p className="rounded-xl border border-[#5E4585] bg-[#180F29] px-3 py-2 text-[14px]">
          {state.closedBy === 'card'
            ? 'The Store is closed while your card is open. Set it aside with NOT NOW, or roll it first.'
            : state.closedBy === 'press'
              ? 'The Store is closed while your card is open. Roll it or leave it first.'
              : state.closedBy === 'gathering'
                ? 'The Store is closed while your roll or your fight at the Gathering is waiting.'
                : 'The Store is closed while your fight is open.'}
        </p>
      )}

      {pending && (
        <div className="rounded-2xl bg-[#1E1232] border border-[#D4B876]/70 p-4 space-y-3">
          <p className="text-[15px]">
            {pending.kind === 'gear'
              ? `Buy ${pending.label} for ${pending.cost.toLocaleString()}g?`
              : pending.kind === 'relic'
                ? `Buy ${aRelic(pending.relic)} for ${pending.cost}g?`
                : `Give ${pending.name} ${aRelic(pending.relic)}?`}
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-lg bg-[#D4B876] px-3 py-2 font-[Cinzel] font-bold text-[14px] text-[#130B1F] disabled:opacity-50"
              disabled={busy}
              onClick={confirm}
            >
              {pending.kind === 'give' ? 'GIVE' : 'BUY'}
            </button>
            <button className={`flex-1 ${quietButton}`} disabled={busy} onClick={() => setPending(null)}>
              NO
            </button>
          </div>
        </div>
      )}
      <ErrorLine text={error} />

      <div className="space-y-2">
        <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876]">WEAPON AND ARMOR</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {gearTile('weapon')}
          {gearTile('armor')}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876]">RELICS · {GOLD_RELIC_COST}G EACH</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {RELIC_KINDS.map((k) => {
            const held = state.relics[k] ?? 0;
            return (
              <div key={k} className="p-3 rounded-2xl bg-[#2A1B40] border border-[#3A2555] flex flex-col justify-between min-h-[124px]">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="w-7 h-7 rounded-lg bg-[#130B1F] border flex items-center justify-center text-[14px]"
                      style={{ borderColor: relicColour(k), color: relicColour(k) }}
                    >
                      ♦
                    </span>
                    <span className="font-['Cinzel'] font-bold text-[12px] text-[#B7A9CC]">You hold {held}</span>
                  </div>
                  <div className="font-['Cinzel'] font-bold text-[14px] mt-2" style={{ color: relicColour(k) }}>
                    {relicName(k)}
                  </div>
                  <div className="text-[14px] text-[#B7A9CC] leading-snug">{relicUse(k)}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-[#44305F] flex gap-1.5">
                  <button
                    disabled={closed || busy || state.gold < GOLD_RELIC_COST}
                    onClick={() => setPending({ kind: 'relic', relic: k, cost: GOLD_RELIC_COST })}
                    className="flex-1 py-1.5 rounded-lg bg-[#D4B876]/20 border border-[#D4B876] font-['Cinzel'] font-bold text-[12px] disabled:opacity-40"
                  >
                    BUY
                  </button>
                  {held > 0 && friends.length > 0 && (
                    <button
                      disabled={busy}
                      onClick={() => setGiving(giving === k ? null : k)}
                      className="flex-1 py-1.5 rounded-lg border border-[#7E68B8] font-['Cinzel'] font-bold text-[12px]"
                    >
                      GIVE
                    </button>
                  )}
                </div>
                {giving === k && (
                  <div className="mt-2 space-y-1">
                    {friends.map((f) => (
                      <button
                        key={f.id}
                        className={`w-full ${quietButton} text-left`}
                        onClick={() => setPending({ kind: 'give', relic: k, to: f.id, name: f.name })}
                      >
                        TO {f.name.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className={note}>A Relic is used from the button on a card or in a fight.</p>
      </div>

      {state.gifts.length > 0 && (
        <div className="space-y-1">
          <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876]">GIVEN TO YOU</h3>
          {state.gifts.map((g, i) => (
            <p key={i} className="text-[14px]">
              {g.from} gave you {aRelic(g.relic)}.
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
