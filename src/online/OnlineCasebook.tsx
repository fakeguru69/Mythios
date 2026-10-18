// The casebook (Campfire version 3, docs/design/campfire-v3-17oct.md §6): the party's own investigation, night by
// night: each night's readings, the pieces laid at the fire with who laid them, what clicked, and the party's call
// once the night was over. Read from the server (casebook); nothing here is graded.
import { useCallback, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { ErrorLine, heading, note, quietButton } from './ui';
import { asClause } from './OnlineCampfire';

type Reading = 'A' | 'B' | 'NEITHER';
interface Night {
  day: number;
  place: string;
  forkA: string | null;
  forkB: string | null;
  pieces: { title: string; names: string[] }[];
  clicks: { text: string; names: string[] }[];
  call: { reading: Reading | null; split: boolean; backers: Partial<Record<Reading, string[]>>; lines: { name: string; line: string }[] } | null;
}
interface Book {
  week: number;
  currentWeek: number;
  weekQuestion: string | null;
  nights: Night[];
}

const nameList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export default function OnlineCasebook({ partyId, onClose }: { partyId: string; onClose: () => void }) {
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (week: number) => {
      const { data, error: e } = await supabase.rpc('casebook', { p_party: partyId, p_week: week });
      if (e) return setError(plainError(e.message));
      setBook(data as Book);
    },
    [partyId]
  );
  useEffect(() => {
    load(0);
  }, [load]);

  const readingText = (n: Night, r: Reading) => (r === 'A' ? n.forkA ?? '' : r === 'B' ? n.forkB ?? '' : 'Neither.');
  const callLine = (n: Night) => {
    const c = n.call;
    if (!c) return 'The call is made at dawn.';
    const all: Reading[] = ['A', 'B', 'NEITHER'];
    const by = (r: Reading) => c.backers?.[r] ?? [];
    if (c.reading) {
      const out = all.filter((r) => r !== c.reading).flatMap(by);
      return `The party's call: ${asClause(readingText(n, c.reading))}. ${nameList(by(c.reading))} said so${out.length ? `; ${nameList(out)} held out` : ''}.`;
    }
    if (c.split) return `The fire was split: ${all.filter((r) => by(r).length).map((r) => `${nameList(by(r))}, ${asClause(readingText(n, r))}`).join('; ')}.`;
    return 'The fire made no call.';
  };

  return (
    <div className="space-y-4">
      <button className={quietButton} onClick={onClose}>
        ← The party
      </button>
      <div>
        <p className={note}>The party's own investigation</p>
        <h2 className={`${heading} text-[19px]`}>The Casebook</h2>
      </div>
      {book && (
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: book.currentWeek }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => load(w)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] ${w === book.week ? 'border-[#D4B876] bg-[#2E1B42]' : 'border-[#3A2555]'}`}
            >
              Week {w}
            </button>
          ))}
        </div>
      )}
      {book?.weekQuestion && <p className="text-[15px] font-semibold">{book.weekQuestion}</p>}
      {book && book.nights.length === 0 && <p className={note}>Nothing written here yet this week.</p>}
      {book?.nights.map((n) => (
        <div key={n.day} className="rounded-xl bg-[#180F29] border border-[#3A2555] p-3 space-y-2" data-night={n.day}>
          <h3 className="font-['Cinzel'] font-bold text-[13px] text-[#E5C158]">
            Day {n.day} · {n.place}
          </h3>
          <p className="text-[13.5px] text-[#D9D1E6]">
            {n.forkA} <span className="text-[#8B7A9E]">or</span> {n.forkB}
          </p>
          <p className="text-[14px]" data-call>
            {callLine(n)}
          </p>
          {(n.call?.lines ?? []).map((l) => (
            <p key={l.name} className="text-[13.5px] italic">
              {l.name}: “{l.line}”
            </p>
          ))}
          {n.pieces.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#B7A9CC]">ON THE TABLE</div>
              {n.pieces.map((p) => (
                <p key={p.title} className="text-[13.5px]">
                  {p.title} · <span className="text-[#B7A9CC]">{p.names.join(', ')}</span>
                </p>
              ))}
            </div>
          )}
          {n.clicks.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-['Cinzel'] font-bold text-[10.5px] tracking-[1px] text-[#9CC2F0]">WHAT CLICKED</div>
              {n.clicks.map((c) => (
                <p key={c.text} className="text-[13.5px] italic">
                  {c.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
      <ErrorLine text={error} />
    </div>
  );
}
