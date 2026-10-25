// Piece E5: The Bag's "The Dark Moon Verses" and "Found Along the Road" shelves (plus Relics in the Bag).
// Read from public.bag_shelves(p_party) on the server so GATHERING_SCRIPTS and CHAPTER_SCRIPTS never enter the
// online client bundle and unreached Gatherings / days can never leak early.

import { useCallback, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { ATTRIBUTE_META, type AttributeName } from '../data/mythiosRulesData';
import { RELIC_KINDS, aRelic, relicName, type RelicKind } from './OnlineStore';
import { ScriptInline, fillScriptTokens } from '../components/ChapterScriptParts';
import { Markable } from './Markable';
import { ErrorLine, heading, note, quietButton } from './ui';

export interface BagVerseRow {
  week: number;
  title: string;
  text: string;
}

export interface BagCarriedRow {
  week: number;
  day: number;
  place: string;
  text: string;
}

export interface BagClueRow {
  key: string;
  week: number;
  day: number;
  place: string;
  kind: 'lead' | 'fork' | 'notice' | 'press';
  title: string;
  text: string;
  by: string[];
}

export interface BagShelvesState {
  week: number;
  day: number;
  verses: BagVerseRow[];
  carried: BagCarriedRow[];
  clues: BagClueRow[];
  relics: Record<string, number>;
  gifts: { from: string; relic: string; at: string }[];
}

const relicColour = (k: string) =>
  k === 'Combat' ? '#D6DCEB' : ATTRIBUTE_META[k as AttributeName]?.color ?? '#D6DCEB';
const relicUse = (k: string) =>
  k === 'Combat' ? '+1 Weapon and +1 Armour for one fight' : `+4 on one ${k} roll`;

const clueKindLabel = (k: BagClueRow['kind']) =>
  k === 'lead' ? 'Last light' : k === 'fork' ? 'Road choice' : k === 'notice' ? 'Noticed' : 'Pressed on';

export function useBagShelves(partyId: string, reloadKey?: number) {
  const [state, setState] = useState<BagShelvesState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('bag_shelves', { p_party: partyId });
    if (e) {
      setError(plainError(e.message));
      return;
    }
    setError(null);
    setState(data as BagShelvesState);
  }, [partyId]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  return { state, error, setError, reload: load };
}

export function OnlineVersesShelf({
  partyId,
  friends,
  partySize,
  reloadKey,
}: {
  partyId: string;
  friends: string[];
  partySize: number;
  reloadKey?: number;
}) {
  const { state, error } = useBagShelves(partyId, reloadKey);
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (state && state.verses.length > 0) {
      const firstKey = `${state.verses[0].week}-${state.verses[0].title}`;
      setOpenKeys((prev) => (Object.keys(prev).length === 0 ? { [firstKey]: true } : prev));
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-4 space-y-3" data-shelf="verses">
      <div>
        <p className={note}>Scripture & records</p>
        <h2 className={`${heading} text-[19px]`}>The Dark Moon Verses</h2>
      </div>
      <ErrorLine text={error} />
      {!state && !error && <p className={note}>…</p>}
      {state && state.verses.length === 0 && (
        <p className="text-[16px] text-[#D9D1E6]" data-verses-empty>
          The first verse is read at the Gathering.
        </p>
      )}
      {state && state.verses.length > 0 && (
        <div className="space-y-2.5">
          {state.verses.map((v) => {
            const key = `${v.week}-${v.title}`;
            const isOpen = Boolean(openKeys[key]);
            const paragraphs = v.text
              .split(/\n\n+/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
              <div
                key={key}
                className="rounded-xl bg-[#130B1F] border border-[#4A3266] overflow-hidden"
                data-bag-verse={`${v.week}:${v.title}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left font-['Cinzel'] font-bold text-[14px] text-[#E5C158] hover:bg-[#1E1232] transition"
                >
                  <span>
                    Week {v.week} · {v.title}
                  </span>
                  <span className="text-[#B7A9CC] text-[14px]">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-[#2C1D40]" data-verse-body>
                    {paragraphs.map((p, idx) => {
                      const filled = fillScriptTokens(p, { friends, partySize });
                      const plainQuote = filled.replace(/\*\*|\*/g, '');
                      return (
                        <Markable key={idx} source={`Week ${v.week} · ${v.title}`} text={plainQuote}>
                          <p className="text-[16px] text-[#F4F1F8] leading-[1.6]">
                            <ScriptInline text={filled} />
                          </p>
                        </Markable>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OnlineFoundShelf({
  partyId,
  friends,
  partySize,
  reloadKey,
  onChanged,
}: {
  partyId: string;
  friends: { id: string; name: string }[];
  partySize: number;
  reloadKey?: number;
  onChanged?: () => void;
}) {
  const { state, error, setError, reload } = useBagShelves(partyId, reloadKey);
  const [giving, setGiving] = useState<RelicKind | null>(null);
  const [pendingGive, setPendingGive] = useState<{ relic: RelicKind; to: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [giftSuccess, setGiftSuccess] = useState<string | null>(null);

  const confirmGive = async () => {
    if (!pendingGive) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.rpc('give_relic', {
      p_party: partyId,
      p_to: pendingGive.to,
      p_relic: pendingGive.relic,
    });
    setBusy(false);
    const sent = pendingGive;
    setPendingGive(null);
    setGiving(null);
    if (e) {
      setError(plainError(e.message));
      await reload();
      return;
    }
    setGiftSuccess(`Gave ${sent.name} ${aRelic(sent.relic)}.`);
    await reload();
    onChanged?.();
  };

  const friendNames = friends.map((f) => f.name);

  return (
    <div className="rounded-2xl border border-[#3A2555] bg-[#180F29] p-4 space-y-5" data-shelf="found">
      <div>
        <p className={note}>Pack & road finds</p>
        <h2 className={`${heading} text-[19px]`}>Found Along the Road</h2>
        <p className="text-[15px] text-[#D9D1E6] mt-0.5">
          The things you carry and the clues you find on the road are kept here.
        </p>
      </div>

      <ErrorLine text={error} />
      {!state && !error && <p className={note}>…</p>}

      {state && (
        <>
          {/* 1. Relics in the Bag */}
          <section className="space-y-2.5" data-bag-relics>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876] uppercase">
                Relics in Your Pack
              </h3>
              <span className="text-[14px] text-[#B7A9CC]">+4 roll / +1 fight gear</span>
            </div>

            {giftSuccess && (
              <div
                className="rounded-xl bg-[#13261E] border border-[#6FD39A]/60 px-3 py-2 text-[14px] text-[#6FD39A] flex items-center justify-between"
                data-bag-gift-success
              >
                <span>✓ {giftSuccess}</span>
                <button type="button" className="text-[14px] ml-2" onClick={() => setGiftSuccess(null)}>
                  ✕
                </button>
              </div>
            )}

            {state.gifts.length > 0 && (
              <div className="space-y-1" data-bag-relic-gifts>
                {state.gifts.slice(0, 3).map((g, i) => (
                  <p key={`${g.at}-${i}`} className="text-[14px] text-[#D4B876]" data-bag-relic-gift>
                    ♦ {g.from} gave you {aRelic(g.relic)}.
                  </p>
                ))}
              </div>
            )}

            {pendingGive && (
              <div
                className="rounded-2xl bg-[#1E1232] border border-[#D4B876]/70 p-3.5 space-y-2.5"
                data-bag-give-confirm
              >
                <p className="text-[15px] text-[#F4F1F8]">
                  Give {pendingGive.name} {aRelic(pendingGive.relic)}?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirmGive}
                    className="flex-1 rounded-lg bg-[#D4B876] px-3 py-2 font-['Cinzel'] font-bold text-[14px] text-[#130B1F] disabled:opacity-50"
                  >
                    GIVE
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setPendingGive(null)}
                    className={`flex-1 ${quietButton}`}
                  >
                    NO
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {RELIC_KINDS.map((k) => {
                const count = state.relics[k] ?? 0;
                const color = relicColour(k);
                return (
                  <div
                    key={k}
                    data-bag-relic={k}
                    className={`p-3 rounded-2xl bg-[#2A1B40] border flex flex-col justify-between min-h-[118px] ${
                      count > 0 ? 'border-[#7E68B8]' : 'border-[#3A2555] opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="w-7 h-7 rounded-lg bg-[#130B1F] border flex items-center justify-center text-[14px]"
                          style={{ borderColor: color, color }}
                        >
                          ♦
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-['Cinzel'] font-bold text-[12px] border ${
                            count > 0
                              ? 'bg-[#130B1F] border-[#D4B876] text-[#D4B876]'
                              : 'bg-[#130B1F] border-[#3A2555] text-[#8B7A9E]'
                          }`}
                          data-bag-relic-count={k}
                        >
                          ×{count}
                        </span>
                      </div>
                      <div className="font-['Cinzel'] font-bold text-[14px] mt-2" style={{ color }}>
                        {relicName(k)}
                      </div>
                      <div className="text-[14px] text-[#B7A9CC] leading-snug">{relicUse(k)}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#44305F]">
                      {count > 0 && friends.length > 0 ? (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setGiving(giving === k ? null : k)}
                            className="w-full py-1.5 rounded-lg bg-[#D4B876]/20 border border-[#D4B876] font-['Cinzel'] font-bold text-[12px] text-[#F4F1F8]"
                          >
                            {giving === k ? 'CANCEL' : 'GIVE'}
                          </button>
                          {giving === k && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {friends.map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setPendingGive({ relic: k, to: f.id, name: f.name })}
                                  className="rounded-lg bg-[#130B1F] border border-[#D4B876]/60 px-2 py-1 text-[12px] text-[#F4F1F8]"
                                >
                                  To {f.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center font-['Cinzel'] font-bold text-[12px] text-[#8B7A9E] py-1">
                          {count > 0 ? `In pack · ${count}` : 'None in pack'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Carried from the road */}
          <section className="space-y-2.5 pt-2 border-t border-[#2C1D40]" data-bag-carried>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876] uppercase">
                Carried from the Road
              </h3>
              <span className="text-[14px] text-[#B7A9CC]">Kept in your satchel</span>
            </div>
            {state.carried.length === 0 ? (
              <p className={note} data-carried-empty>
                Nothing carried from the road yet.
              </p>
            ) : (
              <div className="space-y-2">
                {state.carried.map((item) => {
                  const key = `${item.week}-${item.day}`;
                  const tag = item.day === 7 ? `W${item.week}·G` : `W${item.week}·D${item.day}`;
                  const filled = fillScriptTokens(item.text, { friends: friendNames, partySize });
                  const plainQuote = filled.replace(/\*\*|\*/g, '');
                  return (
                    <div
                      key={key}
                      data-carried-item={key}
                      className="rounded-xl bg-[#130B1F] border border-[#3A2555] p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-[12px] text-[#B7A9CC]">
                        <span className="font-['Cinzel'] font-bold text-[#D4B876] tabular-nums">{tag}</span>
                        <span>·</span>
                        <span>{item.place}</span>
                      </div>
                      <Markable source={`${tag} · ${item.place}`} text={plainQuote}>
                        <p className="text-[15.5px] text-[#F4F1F8] leading-snug">
                          <ScriptInline text={filled} />
                        </p>
                      </Markable>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Clues found along the road */}
          <section className="space-y-2.5 pt-2 border-t border-[#2C1D40]" data-bag-clues>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876] uppercase">
                Clues Found Along the Road
              </h3>
              <span className="text-[14px] text-[#B7A9CC]">{state.clues.length} found</span>
            </div>
            {state.clues.length === 0 ? (
              <p className={note} data-clues-empty>
                No clues gathered yet.
              </p>
            ) : (
              <div className="space-y-2">
                {state.clues.map((cl) => {
                  const tag = `W${cl.week}·D${cl.day}`;
                  const filled = fillScriptTokens(cl.text, { friends: friendNames, partySize });
                  const plainQuote = `${cl.title} — ${filled.replace(/\*\*|\*/g, '')}`;
                  return (
                    <div
                      key={cl.key}
                      data-clue-item={cl.key}
                      className="rounded-xl bg-[#130B1F] border border-[#3A2555] p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[12px] text-[#B7A9CC]">
                        <span>
                          <span className="font-['Cinzel'] font-bold text-[#D4B876] tabular-nums">{tag}</span> ·{' '}
                          {cl.place}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#221636] border border-[#4A3266] text-[12px] text-[#C39BF5]">
                          {clueKindLabel(cl.kind)}
                        </span>
                      </div>
                      <div className="font-['Cinzel'] font-bold text-[14px] text-[#E5C158]">{cl.title}</div>
                      <Markable source={`${tag} · ${cl.title}`} text={plainQuote}>
                        <p className="text-[15.5px] text-[#E6E0F0] leading-snug">
                          <ScriptInline text={filled} />
                        </p>
                      </Markable>
                      {cl.by.length > 0 && (
                        <p className="text-[14px] text-[#8B7A9E]">Found by {cl.by.join(', ')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
