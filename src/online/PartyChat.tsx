// The party chat (Core Rules §1, §12a): the friends' own talk and the party's notices, live.
// It opens only when the party assembles and Garrick joins, on Day 2 (Fake Guru, 16 Oct); the server enforces it.
// Press and hold a friend's message to report it (review-accounts-and-invites.md §5).
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { card, ErrorLine, heading, input, note, quietButton } from './ui';

interface Message {
  id: number;
  author_id: string | null;
  kind: 'chat' | 'notice';
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

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('party_messages')
      .select('id,author_id,kind,body,created_at')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages((data as Message[] | null) ?? []);
  }, [partyId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`party-chat-${partyId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_messages', filter: `party_id=eq.${partyId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
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
    const { error: e } = await supabase.rpc('post_message', { p_party: partyId, p_body: body });
    if (e) setError(plainError(e.message));
    else {
      setText('');
      load();
    }
  };

  const startHold = (m: Message) => {
    if (m.kind !== 'chat' || m.author_id === userId) return;
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
        {messages.map((m) =>
          m.kind === 'notice' ? (
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
                if (m.author_id !== userId) {
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
