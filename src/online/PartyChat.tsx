// The party chat (Core Rules §1, §12a): the friends' own talk and the party's notices, live.
// It opens only when the party assembles and Garrick joins, on Day 2 (Fake Guru, 16 Oct); the server enforces it.
// Press and hold a friend's message to report it (review-accounts-and-invites.md §5).
// Garrick replies when spoken to: a message that names him goes through the server function "garrick", which posts it
// and his answer (stored lines first; the AI only for small talk). His lines carry speaker 'garrick' and no author.
import { Markable } from './Markable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { card, ErrorLine, heading, input, note, quietButton } from './ui';

interface Message {
  id: number;
  author_id: string | null;
  kind: 'chat' | 'notice' | 'nudge';
  speaker?: 'garrick' | null;
  body: string;
  created_at: string;
  reply_to_user?: string | null;
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
    // The newest 200, shown oldest first (read through the server's spoiler-hardened function, piece 7).
    const { data, error: e } = await supabase.rpc('party_chat_messages', { p_party: partyId });
    if (e || !Array.isArray(data)) return;
    setMessages((data as Message[]).slice().reverse());
  }, [partyId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`party-chat-${partyId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_messages', filter: `party_id=eq.${partyId}` }, () => {
        load();
      })
      .subscribe();
    // The chat is read through the server's function (piece 7), which the live feed cannot see past, so new lines are
    // also fetched every ten seconds while the page is in front, and at once when it comes back to the front.
    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 10000);
    const back = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', back);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener('visibilitychange', back);
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
      <h3 className={`${heading} text-[16px]`}>Party chat</h3>
      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
        {hello && <p className={`${note} text-center`}>Everyone is here now, and so is Garrick. Ask him anything.</p>}
        {messages.map((m) =>
          m.speaker === 'garrick' ? (
            <div key={m.id} className="max-w-[88%] space-y-1" data-garrick-line>
              <div className="font-['Cinzel'] font-bold text-[14px] text-[#E5C158] tracking-[0.6px]">GARRICK</div>
              <Markable source="Garrick, in the party chat" text={m.body}>
                <div className="rounded-[4px_16px_16px_16px] bg-[#2B1E10] border border-[#6B5524] px-3 py-2 font-sans text-[16px] leading-[1.45] text-[#F4E8C8] whitespace-pre-wrap break-words">
                  {m.body}
                </div>
              </Markable>
            </div>
          ) : m.kind === 'nudge' ? (
            <div key={m.id} className="rounded-xl bg-[#231530] border border-[#6B3BA3]/60 px-3.5 py-2.5 my-1 text-center" data-chat-nudge>
              <div className="font-['Cinzel'] font-bold text-[12px] text-[#C084FC] tracking-[0.8px] uppercase">
                PRIVATE NUDGE
              </div>
              <p className="font-sans text-[15px] text-[#F4F1F8] italic leading-relaxed mt-0.5">
                {m.body}
              </p>
            </div>
          ) : m.kind === 'notice' ? (
            <p
              key={m.id}
              className={`text-[14px] text-center py-1 font-sans ${
                /rolled a natural 20|earned the .* badge|took the crown for|reached (Apprentice|Adept|Master)/.test(m.body)
                  ? 'text-[#E5C158] font-semibold'
                  : `${note} text-center`
              }`}
              data-chat-moment={
                /rolled a natural 20|earned the .* badge|took the crown for|reached (Apprentice|Adept|Master)/.test(m.body) ? 'true' : undefined
              }
            >
              {m.body}
            </p>
          ) : (
            <div key={m.id} className={`flex flex-col ${m.author_id === userId ? 'items-end' : 'items-start'}`} data-chat={m.author_id === userId ? 'mine' : 'friend'}>
              {m.author_id !== userId && <div className="text-[14px] font-bold text-[#C39BF5]">{nameOf(m.author_id)}</div>}
              <div
                className={`select-none max-w-[86%] px-3 py-2 text-[16px] leading-[1.4] whitespace-pre-wrap break-words border ${
                  m.author_id === userId
                    ? 'rounded-[16px_16px_4px_16px] bg-[#3A2A12] border-[#8A6E34] text-[#F4E8C8]'
                    : 'rounded-[4px_16px_16px_16px] bg-[#221636] border-[#3A2555] text-[#F4F1F8]'
                }`}
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
                {m.body}
              </div>
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
