// A private word with Garrick (migration 0067; Core Rules §1 "Your thread": private questions to Garrick).
// In your own thread after the day's chapter, and at the fire (stored lines only there, Campfire table §E).
// Only you see what you asked and what he said; nothing goes to the party chat (Core Rules §12a).
import React, { useCallback, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { ErrorLine } from './ui';

type Exchange = { q: string; a: string };

const WORDING: Record<'thread' | 'fire', { title: string; line: string; placeholder: string }> = {
  thread: {
    title: 'A WORD WITH GARRICK',
    line: 'Just the two of you. The others will not hear it.',
    placeholder: 'Ask him something',
  },
  fire: {
    title: 'A WORD WITH GARRICK',
    line: 'He keeps his voice low by the fire. Nobody else will hear.',
    placeholder: 'Ask him something',
  },
};

export default function AskGarrick({ partyId, place }: { partyId: string; place: 'thread' | 'fire' }) {
  const [open, setOpen] = useState<boolean | null>(null); // null: not known yet; false: not for you here yet
  const [list, setList] = useState<Exchange[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const words = WORDING[place];

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.rpc('my_garrick_private', { p_party: partyId, p_place: place });
    if (e) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setList((data as Exchange[]) ?? []);
  }, [partyId, place]);

  useEffect(() => {
    load();
  }, [load]);

  if (!open) return null;

  const ask = async () => {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.functions.invoke('garrick', { body: { party: partyId, text: q, place } });
    setBusy(false);
    if (e || !data?.reply) {
      setError(plainError(e?.message ?? 'Something went wrong. Try again.'));
      return;
    }
    setText('');
    setList((l) => [...l, { q, a: data.reply }]);
  };

  return (
    <div className="rounded-xl bg-[#180F29] border border-[#3A2555] p-3 space-y-2" data-ask-garrick={place}>
      <h3 className="font-['Cinzel'] font-bold text-[14px] tracking-[1.2px] text-[#D4B876]">{words.title}</h3>
      <p className="text-[14px] italic text-[#B7A9CC]">{words.line}</p>
      {list.map((x, i) => (
        <div key={i} className="space-y-1">
          <p className="text-[14px] text-[#B7A9CC]">“{x.q}”</p>
          <div className="rounded-lg bg-[#241638] border border-[#5E4585] px-3 py-2">
            <div className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] tracking-[0.6px]">GARRICK</div>
            <p className="text-[14.5px] text-[#F4F1F8] leading-[1.45]">{x.a}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 rounded-lg bg-[#0F0A18] border border-[#3A2555] px-3 py-2 text-[14px] text-[#F4F1F8] placeholder:text-[#6F6385]"
          placeholder={words.placeholder}
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') ask();
          }}
        />
        <button
          className="px-3 rounded-lg bg-[#2A1E3D] border border-[#5E4585] font-['Cinzel'] font-bold text-[14px] text-[#E5C158] disabled:opacity-50"
          disabled={busy || !text.trim()}
          onClick={ask}
        >
          ASK
        </button>
      </div>
      <ErrorLine text={error} />
    </div>
  );
}
