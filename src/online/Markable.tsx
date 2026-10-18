// The notebook (Campfire version 3, docs/design/campfire-v3-17oct.md §6; migration 0093): tap any line you read, in a
// chapter, at the fire or in the party chat, and mark it, with a few words if you like. Private to you. The game never
// says what to mark. The NotebookProvider loads your marks once for a screen; a Markable without one is just its line.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { input, quietButton } from './ui';

export interface Mark {
  id: number;
  source: string;
  quote: string;
  note: string | null;
  at: string;
}

interface NotebookApi {
  marks: Mark[];
  mark: (source: string, quote: string, note: string, remove: boolean) => Promise<string | null>;
}
const NotebookContext = createContext<NotebookApi | null>(null);

// The words of a line as read, without the script's emphasis marks.
export const plainQuote = (text: string) => text.replace(/[*_]/g, '').replace(/\s+/g, ' ').trim();

export function NotebookProvider({ partyId, children }: { partyId: string; children: React.ReactNode }) {
  const [marks, setMarks] = useState<Mark[]>([]);
  useEffect(() => {
    supabase.rpc('notebook', { p_party: partyId }).then(({ data }) => data && setMarks(data as Mark[]));
  }, [partyId]);
  const mark = useCallback(
    async (source: string, quote: string, note: string, remove: boolean) => {
      const { data, error } = await supabase.rpc('mark_line', { p_party: partyId, p_source: source, p_quote: quote, p_note: note, p_remove: remove });
      if (error) return plainError(error.message);
      setMarks(data as Mark[]);
      return null;
    },
    [partyId]
  );
  return <NotebookContext.Provider value={{ marks, mark }}>{children}</NotebookContext.Provider>;
}

export function Markable({ source, text, children }: { source: string; text: string; children: React.ReactNode }) {
  const nb = useContext(NotebookContext);
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!nb) return <>{children}</>;
  const quote = plainQuote(text);
  const mine = nb.marks.find((m) => m.quote === quote);
  const run = async (remove: boolean) => {
    const e = await nb.mark(source, quote, noteText, remove);
    setError(e);
    if (!e && remove) setOpen(false);
  };
  return (
    <div data-markable>
      <div onClick={() => setOpen((o) => !o)} className={`cursor-pointer ${mine ? 'border-l-2 border-[#D4B876]/70 pl-1.5' : ''}`}>
        {children}
      </div>
      {open && (
        <div className="mt-1.5 space-y-1.5 rounded-lg border border-[#3A2555] bg-[#130B1F] p-2" data-mark-bar>
          {mine ? (
            <>
              <p className="text-[12.5px] text-[#D4B876]">In your notebook{mine.note ? `: ${mine.note}` : '.'}</p>
              <div className="flex gap-2">
                <input className={input} maxLength={200} placeholder="A few words, if you like" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                <button className={quietButton} disabled={!noteText.trim()} onClick={() => run(false)}>
                  SAVE
                </button>
              </div>
              <button className={quietButton} onClick={() => run(true)}>
                Take it out of my notebook
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <input className={input} maxLength={200} placeholder="A few words, if you like" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <button className={quietButton} onClick={() => run(false)}>
                MARK
              </button>
            </div>
          )}
          {error && <p className="text-[12.5px] text-[#F08A8A]">{error}</p>}
        </div>
      )}
    </div>
  );
}
