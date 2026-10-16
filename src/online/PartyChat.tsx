// The party chat (Core Rules §1, §12a): the friends' own talk and the party's notices, live.
// It opens only when the party assembles and Garrick joins, on Day 2 (Fake Guru, 16 Oct); the server enforces it.
// Press and hold a friend's message to report it (review-accounts-and-invites.md §5).
// Garrick replies when spoken to: a message that names him goes through the server function "garrick", which posts it
// and his answer (stored lines first; the AI only for small talk). His lines carry speaker 'garrick' and no author.
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { card, ErrorLine, heading, input, note, quietButton } from './ui';

interface Message {
  id: number;
  author_id: string | null;
  kind: 'chat' | 'notice';
  speaker?: 'garrick' | null;
  body: string;
  created_at: string;
}

export default function PartyChat({ partyId, userId, members }: { partyId: string; userId: string; members: MemberRow[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState<Message | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [reported, setReported] = useState(false);
  const [askedReport, setAskedReport] = useState(false); // [REPORT] tapped, then the box (review §5)
  const holdTimer = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const nameOf = (id: string | null) => members.find((m) => m.user_id === id)?.character_name ?? '…';
  // Canon's line on first opening the party chat (Core Rules §7), shown once on this phone.
  const helloKey = `mythios_chat_hello_${partyId}_${userId}`;
  const [hello] = useState(() => {
    try {
      const seen = window.localStorage.getItem(helloKey);
      window.localStorage.setItem(helloKey, '1');
      return !seen;
    } catch {
      return false;
    }
  });

  const load = useCallback(async () => {
    // Garrick's morning line goes up first if nobody has opened the app yet today (it carries the day's 5:00am time).
    await supabase.rpc('garrick_morning', { p_party: partyId });
    // The newest 200, shown oldest first.
    const { data } = await supabase
      .from('party_messages')
      .select('id,author_id,kind,speaker,body,created_at')
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })
      .limit(200);
    setMessages(((data as Message[] | null) ?? []).reverse());
  }, [partyId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`party-chat-${partyId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_messages', filter: `party_id=eq.${partyId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m].sort((a, b) => a.created_at.localeCompare(b.created_at))));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setError(null);
    if (/\bgarrick\b/i.test(body)) {
      // Spoken to Garrick: the server posts the message, then his reply.
      const { error: e } = await supabase.functions.invoke('garrick', { body: { party: partyId, text: body } });
      if (e) {
        let message = e.message;
        try {
          message = (await (e as { context?: Response }).context?.json())?.message ?? message;
        } catch {
          /* keep the first message */
        }
        setError(plainError(message));
      } else {
        setText('');
        load();
      }
      return;
    }
    const { error: e } = await supabase.rpc('post_message', { p_party: partyId, p_body: body });
    if (e) setError(plainError(e.message));
    else {
      setText('');
      load();
    }
  };

  const startHold = (m: Message) => {
    if (m.kind !== 'chat' || m.author_id === userId || m.speaker === 'garrick') return;
    holdTimer.current = window.setTimeout(() => {
      setReporting(m);
      setReportNote('');
      setReported(false);
      setAskedReport(false);
    }, 600);
  };
  const endHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <div className={card}>
      <h3 className={`${heading} text-[15px]`}>Party chat</h3>
      <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1">
        {hello && <p className={`${note} italic text-center`}>Everyone is here now, and so is Garrick. Ask him anything.</p>}
        {messages.map((m) =>
          m.speaker === 'garrick' ? (
            <div key={m.id} className="rounded-lg px-3 py-1.5 text-[15px] bg-[#2A2013] border border-[#D4B876]/40 mr-8">
              <span className="text-[12px] text-[#D4B876] font-semibold font-['Cinzel']">Garrick</span>
              <div className="whitespace-pre-wrap break-words">{m.body}</div>
            </div>
          ) : m.kind === 'notice' ? (
            <p key={m.id} className={`${note} italic text-center`}>
              {m.body}
            </p>
          ) : (
            <div
              key={m.id}
              className={`select-none rounded-lg px-3 py-1.5 text-[15px] ${m.author_id === userId ? 'bg-[#2E1B42] ml-8' : 'bg-[#130B1F] mr-8'}`}
              onPointerDown={() => startHold(m)}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onContextMenu={(e) => {
                if (m.author_id !== userId && m.speaker !== 'garrick') {
                  e.preventDefault();
                  setReporting(m);
                  setReportNote('');
                  setReported(false);
                  setAskedReport(false);
                }
              }}
            >
              <span className="text-[12px] text-[#E5C158] font-semibold">{m.author_id === userId ? 'You' : nameOf(m.author_id)}</span>
              <div className="whitespace-pre-wrap break-words">{m.body}</div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {reporting && (
        <div className="rounded-xl border border-[#D4B876]/60 p-3 space-y-2">
          {!askedReport ? (
            <div className="flex gap-2">
              <button className={quietButton} onClick={() => setAskedReport(true)}>
                REPORT
              </button>
              <button className={quietButton} onClick={() => setReporting(null)}>
                Back
              </button>
            </div>
          ) : reported ? (
            <p className="text-[14px]">Thank you.</p>
          ) : (
            <>
              <p className="text-[14px]">Tell us what's wrong.</p>
              <input className={input} maxLength={500} value={reportNote} onChange={(e) => setReportNote(e.target.value)} />
              <div className="flex gap-2">
                <button
                  className={quietButton}
                  onClick={async () => {
                    const { error: e } = await supabase.rpc('report_message', { p_message: reporting.id, p_note: reportNote });
                    if (e) setError(plainError(e.message));
                    else setReported(true);
                  }}
                >
                  SEND
                </button>
                <button className={quietButton} onClick={() => setReporting(null)}>
                  Back
                </button>
              </div>
            </>
          )}
          {reported && (
            <button className={quietButton} onClick={() => setReporting(null)}>
              Back
            </button>
          )}
        </div>
      )}

      <ErrorLine text={error} />
      <div className="flex gap-2">
        <input
          className={input}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className={quietButton} disabled={!text.trim()} onClick={send}>
          SEND
        </button>
      </div>
    </div>
  );
}
