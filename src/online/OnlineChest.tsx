// The Seeker Chest online (Core Rules §6, §12a). The same word-lock as the demo's Chest (BagAndStoreTabs.tsx), but the
// phone never holds an unsolved word: each finished try goes to the server (solve_word), which pays 25g, keeps one word
// per friend until the fragment's day ends, and makes a friend wait two minutes after five wrong tries.
import { useCallback, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { ErrorLine, quietButton } from './ui';

interface Slot {
  slot: 1 | 2;
  jumble: string[];
  word: string | null;
  solver: string | null;
  mine: boolean | null;
  auto: boolean;
  waitUntil: string | null;
}
interface Fragment {
  id: string;
  week: number;
  day: number;
  place: string;
  template: string;
  today: boolean;
  slots: Slot[];
}
interface Chest {
  week: number;
  day: number;
  fragments: Fragment[];
  mySolved: number;
}

export default function OnlineChest({ partyId, onClose, embedded = false, onChanged }: { partyId: string; onClose: () => void; embedded?: boolean; onChanged?: () => void }) {
  const [chest, setChest] = useState<Chest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<{ id: string; slot: 1 | 2 } | null>(null);
  const [typed, setTyped] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('seeker_chest', { p_party: partyId });
    if (e) return setError(plainError(e.message));
    const c = data as Chest;
    setChest(c);
    setWeek((w) => w ?? c.week);
    // Today's fragment starts open.
    setOpen((o) => (Object.keys(o).length ? o : { [`${c.week}-${c.day}`]: true }));
  }, [partyId]);
  useEffect(() => {
    load();
  }, [load]);

  if (!chest) return error ? <ErrorLine text={error} /> : <p className="text-center text-[#B7A9CC]">…</p>;
  const shownWeek = week ?? chest.week;
  const fragments = chest.fragments.filter((f) => f.week === shownWeek).sort((a, b) => b.day - a.day);

  const tryWord = async (frag: Fragment, slot: Slot, guess: string) => {
    setBusy(true);
    const { data, error: e } = await supabase.rpc('solve_word', { p_party: partyId, p_fragment: frag.id, p_slot: slot.slot, p_guess: guess });
    setBusy(false);
    if (e) return setNotice(plainError(e.message));
    const r = data as { ok: boolean; waitUntil?: string; taken?: boolean };
    if (r.ok) {
      setActive(null);
      setTyped([]);
      setNotice(null);
      onChanged?.(); // the 25g reward: the shell's gold follows
    } else if (r.taken) {
      setNotice('A friend has just found this word.');
      setActive(null);
      setTyped([]);
    } else {
      if (r.waitUntil) {
        const secs = Math.max(1, Math.ceil((new Date(r.waitUntil).getTime() - Date.now()) / 1000));
        setNotice(`Five wrong tries. Try this word again in ${secs} seconds.`);
      }
      window.setTimeout(() => setTyped([]), 350);
    }
    await load();
  };

  const tapLetter = (frag: Fragment, slot: Slot, idx: number) => {
    if (typed.includes(idx) || busy) return;
    if (slot.waitUntil && new Date(slot.waitUntil).getTime() > Date.now()) {
      const secs = Math.ceil((new Date(slot.waitUntil).getTime() - Date.now()) / 1000);
      setNotice(`Too many wrong tries. Try this word again in ${secs} seconds.`);
      setTyped([]);
      return;
    }
    setNotice(null);
    const next = [...typed, idx];
    if (next.length === slot.jumble.length) {
      setTyped(next);
      tryWord(frag, slot, next.map((i) => slot.jumble[i]).join(''));
    } else setTyped(next);
  };

  // The fragment's sentence: solved words in green, open words as their jumbled letters (as in the demo's Chest).
  const sentence = (frag: Fragment) => {
    const parts = frag.template.split(/(\{0\}|\{1\})/g);
    const asWritten = (word: string, idx: number) =>
      idx === 0 || (/^\s*$/.test(parts[idx - 1]) && idx === 1) || /[.!?]\s*$/.test(parts[idx - 1])
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word;
    return (
      <p className="font-['Cormorant_Garamond'] font-medium text-[20px] text-[#F4F1F8] leading-[1.6]">
        “
        {parts.map((part, idx) => {
          const slot = part === '{0}' ? frag.slots[0] : part === '{1}' ? frag.slots[1] : null;
          if (!slot) {
            if (!part.trim() && parts[idx - 1] === '{0}' && parts[idx + 1] === '{1}' && !frag.slots[0].word && !frag.slots[1].word) {
              return (
                <span key={idx} className="mx-1 text-[#8B7A9E]" aria-hidden="true">
                  ·
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          }
          if (slot.word) {
            return (
              <span key={idx} className="font-bold text-[#6FD39A] underline decoration-[#6FD39A]/60 underline-offset-4 px-1">
                {asWritten(slot.word, idx)}
              </span>
            );
          }
          const selected = active?.id === frag.id && active.slot === slot.slot;
          return (
            <button
              key={idx}
              onClick={() => {
                setActive({ id: frag.id, slot: slot.slot });
                setTyped([]);
                setNotice(null);
              }}
              className={`mx-1 px-2.5 py-0.5 rounded-md font-['Cinzel'] font-bold text-[12.5px] tracking-[1.5px] inline-block ${
                selected
                  ? 'bg-[#D4B876]/30 border-2 border-[#D4B876] text-[#F4F1F8]'
                  : 'bg-[#2A1B40] border border-[#D4B876]/75 text-[#D4B876] hover:bg-[#382653]'
              }`}
            >
              {slot.jumble.join('')}
            </button>
          );
        })}
        ”
      </p>
    );
  };

  return (
    <div className="space-y-3.5">
      {!embedded && (
        <button className={quietButton} onClick={onClose}>
          ← Back
        </button>
      )}
      <h2 className="font-['Cinzel'] font-bold text-[16px] text-[#E5C158]">🕯️ THE SEEKER CHEST</h2>
      {/* Core Rules §7's first-fragment line, until the player has filled a word of their own. */}
      {chest.mySolved === 0 && (
        <div className="pl-3 border-l-2 border-[#D4B876]/45">
          <p className="font-sans text-[14.5px] text-[#F4F1F8] leading-[1.45]">
            A Seeker Fragment. Two of its words are missing. Each one you find fills it in for the whole party, and is worth 25 gold.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between bg-[#150D22] px-3 py-2 rounded-xl border border-[#3A2555]">
        <span className="font-['Cinzel'] font-bold text-[11.5px] tracking-[1px] text-[#B7A9CC] uppercase">WEEK</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map((w) => {
            const locked = w > chest.week;
            return (
              <button
                key={w}
                disabled={locked}
                onClick={() => {
                  setWeek(w);
                  setActive(null);
                  setTyped([]);
                }}
                className={`px-2.5 py-1 rounded-lg font-['Cinzel'] font-bold text-[12px] ${
                  shownWeek === w
                    ? 'bg-[#2E1B42] border border-[#D4B876] text-[#D4B876]'
                    : locked
                    ? 'bg-[#0D0714] text-[#8B7A9E]/45 cursor-not-allowed'
                    : 'bg-[#0D0714] text-[#8B7A9E] hover:text-[#F4F1F8]'
                }`}
              >
                {locked ? `🔒 W${w}` : `W${w}`}
              </button>
            );
          })}
        </div>
      </div>
      <span className="block font-['Cinzel'] font-bold text-[12px] tracking-[1px] text-[#D4B876] uppercase">
        WEEK {shownWeek} FRAGMENTS · NEWEST FIRST
      </span>

      <div className="space-y-2.5">
        {fragments.map((frag) => {
          const key = `${frag.week}-${frag.day}`;
          const isOpen = !!open[key];
          const solved = frag.slots.filter((s) => s.word).length;
          const done = solved === 2;
          const activeSlot = active?.id === frag.id ? frag.slots.find((s) => s.slot === active.slot) ?? null : null;
          return (
            <div key={frag.id} className={`rounded-2xl bg-[#1E1232] overflow-hidden shadow-md ${done ? 'border-2 border-[#6FD39A]/70' : 'border border-[#7E68B8]'}`}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                className="w-full px-3.5 py-2.5 bg-[#2E1B42] flex items-center justify-between gap-2 text-left hover:bg-[#382653]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-md font-['Cinzel'] font-bold text-[11px] shrink-0 border ${
                      done ? 'bg-[#6FD39A]/20 text-[#6FD39A] border-[#6FD39A]/50' : 'bg-[#130B1F] text-[#D4B876] border-[#D4B876]/50'
                    }`}
                  >
                    W{frag.week}·D{frag.day}
                  </span>
                  <span className="font-['Cinzel'] font-bold text-[13.5px] text-[#F4F1F8] truncate">{frag.place}</span>
                </div>
                <span className={`font-['Cinzel'] font-bold text-[11px] ${done ? 'text-[#6FD39A]' : 'text-[#D4B876]'}`}>
                  {done ? '✓ SOLVED' : `${solved}/2`} {isOpen ? '▴' : '▾'}
                </span>
              </button>
              {isOpen && (
                <div className="p-3.5 space-y-3">
                  {sentence(frag)}
                  {/* Each filled word shows its solver's name (Core Rules §6). */}
                  {/* A word that completed itself at the end of Day 6 carries no name. */}
                  {frag.slots.some((s) => s.word && !s.auto) && (
                    <p className="text-[12.5px] text-[#B7A9CC]">
                      {frag.slots
                        .filter((s) => s.word && !s.auto)
                        .map((s) => `“${s.word}”: ${s.mine ? 'found by you' : `found by ${s.solver}`}`)
                        .join(' · ')}
                    </p>
                  )}
                  {activeSlot && !activeSlot.word && (
                    <div className="p-3 rounded-xl bg-[#130B1F] border border-[#D4B876]/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-['Cinzel'] font-bold text-[11.5px] text-[#D4B876] uppercase">
                          UNJUMBLE WORD {activeSlot.slot} (+25G)
                        </span>
                        {typed.length > 0 && (
                          <button onClick={() => setTyped([])} className="text-[12px] text-[#B7A9CC] hover:text-[#F4F1F8]">
                            Clear ✕
                          </button>
                        )}
                      </div>
                      {notice && <p className="text-[12.5px] text-[#E0645C]">{notice}</p>}
                      <div className="flex flex-wrap items-center gap-1.5 py-1">
                        {activeSlot.jumble.map((_, pos) => {
                          const idx = typed[pos];
                          const letter = idx !== undefined ? activeSlot.jumble[idx] : null;
                          return (
                            <button
                              key={pos}
                              disabled={!letter || busy}
                              onClick={() => letter && setTyped((t) => t.filter((_, i) => i !== pos))}
                              className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-['Cinzel'] font-bold text-[15px] ${
                                letter ? 'bg-[#2A1B40] border-[#6FD39A] text-[#6FD39A]' : 'bg-[#241638] border-[#E5C158] text-[#F3D88B]'
                              }`}
                            >
                              {letter || ''}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {activeSlot.jumble.map((letter, i) => {
                          const used = typed.includes(i);
                          return (
                            <button
                              key={i}
                              data-letter
                              disabled={used || busy}
                              onClick={() => tapLetter(frag, activeSlot, i)}
                              className={`w-10 h-10 rounded-lg font-['Cinzel'] font-bold text-[15px] border ${
                                used ? 'bg-[#0D0714] border-[#3A2555] text-[#5A4B70]' : 'bg-[#2A1B40] border-[#D4B876] text-[#F4F1F8] hover:bg-[#D4B876]/25'
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
