// The fire is the party chat (docs/design/one-thread-18oct.md, phase B): one stream and one composer for the party's
// own talk, Garrick when he is named, and the party's notices. The messages live in party_messages (as the party chat
// always did); the fire's own events (pieces laid, clicks, pins) come from fire_table and are woven in by time in
// OnlineCampfire. Press and hold a friend's message to report it (review-accounts-and-invites.md §5).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, plainError, type MemberRow } from './supabaseClient';
import { input, quietButton } from './ui';
import { Markable } from './Markable';
import { ScriptText } from '../components/ChapterScriptParts';

export interface ChatMessage {
  id: number;
  author_id: string | null;
  kind: 'chat' | 'notice';
  speaker?: 'garrick' | null;
  body: string;
  created_at: string;
  at_fire?: boolean;
  reply_to_user?: string | null;
}

/** Keep new lines in view (handoff ledger piece 3): when the stream grows and the friend is at the foot of the page, the
 *  page follows; if they have scrolled up to read, it never jumps. `follow()` says "show me the end" (after sending). */
export function useKeepNewInView(count: number): () => void {
  const near = useRef(true);
  useEffect(() => {
    const on = () => {
      near.current = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 220;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (near.current) window.requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
  }, [count]);
  return () => {
    near.current = true;
  };
}

/** The party's messages, newest 200, live. */
export function useChatMessages(partyId: string, enabled: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const load = useCallback(async () => {
    if (!enabled) return;
    // Garrick's morning line goes up first if nobody has opened the app yet today.
    await supabase.rpc('garrick_morning', { p_party: partyId });
    // Read through the server's spoiler-hardened function (handoff ledger piece 7).
    const { data, error: e } = await supabase.rpc('party_chat_messages', { p_party: partyId });
    // A failed load keeps what is already on screen (handoff ledger piece 5): the chat is never emptied by a bad moment.
    if (e || !Array.isArray(data)) return;
    setMessages((data as ChatMessage[]).slice().reverse());
  }, [partyId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    load();
    const channel = supabase
      .channel(`fire-chat-${partyId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_messages', filter: `party_id=eq.${partyId}` }, () => {
        load();
      })
      .subscribe();
    const t = window.setInterval(load, 15000);
    return () => {
      window.clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, [partyId, enabled, load]);
  return { messages, reload: load };
}

/** The start of the party's current day (5:00am on the party's clock), as an ISO instant. */
export function partyDayStart(timeZone: string, now = new Date()): string {
  const parts = (d: Date) => {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const o: Record<string, number> = {};
    for (const p of f.formatToParts(d)) if (p.type !== 'literal') o[p.type] = Number(p.value);
    return o;
  };
  const p = parts(now);
  let day = Date.UTC(p.year, p.month - 1, p.day);
  if (p.hour < 5) day -= 86400000;
  const guess = day + 5 * 3600000; // 05:00 as if UTC
  const g = parts(new Date(guess));
  const asUtc = Date.UTC(g.year, g.month - 1, g.day, g.hour, g.minute);
  const offset = asUtc - guess; // the zone's offset at that moment
  return new Date(guess - offset).toISOString();
}

const nameOf = (members: MemberRow[], id: string | null) => members.find((m) => m.user_id === id)?.character_name ?? '…';

export function GarrickBubble({ text, source = 'Garrick, at the fire' }: { text: string; source?: string }) {
  return (
    <div className="max-w-[88%] space-y-1" data-garrick-line>
      <div className="font-['Cinzel'] font-bold text-[12px] text-[#E5C158] tracking-[0.6px]">GARRICK</div>
      <Markable source={source} text={text}>
        <div className="rounded-[4px_16px_16px_16px] bg-[#2B1E10] border border-[#6B5524] px-3 py-2">
          <ScriptText text={text} className="font-['Cormorant_Garamond',serif] font-semibold text-[18px] leading-[1.45] text-[#F4E8C8]" />
        </div>
      </Markable>
    </div>
  );
}

export function NarrationMessage({ text }: { text: string }) {
  return (
    <div className="space-y-1" data-narration>
      <div className="font-['Cinzel'] font-bold text-[11px] text-[#B7A9CC] tracking-[1.2px]">MYTHIOS</div>
      <ScriptText text={text} className="font-['Cormorant_Garamond',serif] text-[18px] leading-[1.5] text-[#F4F1F8]" />
    </div>
  );
}

export function SmallLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[#8B7A9E] text-center">{children}</p>;
}

/** One message from party_messages. */
export function ChatBubble({
  m,
  userId,
  members,
  onReport,
}: {
  m: ChatMessage;
  userId: string;
  members: MemberRow[];
  onReport: (m: ChatMessage) => void;
}) {
  const hold = useRef<number | null>(null);
  if (m.speaker === 'garrick') return <GarrickBubble text={m.body} source="Garrick, in the party chat" />;
  if (m.kind === 'notice') return <SmallLine>{m.body}</SmallLine>;
  const mine = m.author_id === userId;
  const startHold = () => {
    if (mine) return;
    hold.current = window.setTimeout(() => onReport(m), 600);
  };
  const endHold = () => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  };
  return (
    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`} data-chat={mine ? 'mine' : 'friend'}>
      {!mine && <div className="text-[12px] font-bold text-[#C39BF5]">{nameOf(members, m.author_id)}</div>}
      <div
        className={`select-none max-w-[86%] px-3 py-2 text-[16px] leading-[1.4] whitespace-pre-wrap break-words border ${
          mine
            ? 'rounded-[16px_16px_4px_16px] bg-[#3A2A12] border-[#8A6E34] text-[#F4E8C8]'
            : 'rounded-[4px_16px_16px_16px] bg-[#221636] border-[#3A2555] text-[#F4F1F8]'
        }`}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onContextMenu={(e) => {
          if (!mine) {
            e.preventDefault();
            onReport(m);
          }
        }}
      >
        {m.body}
      </div>
    </div>
  );
}

export function ReportBox({ m, onDone }: { m: ChatMessage; onDone: () => void }) {
  const [asked, setAsked] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="rounded-xl border border-[#D4B876]/60 bg-[#1A1226] p-3 space-y-2" data-report>
      {sent ? (
        <p className="text-[16px]">Thank you.</p>
      ) : !asked ? (
        <div className="flex gap-2">
          <button className={quietButton} onClick={() => setAsked(true)}>
            REPORT
          </button>
          <button className={quietButton} onClick={onDone}>
            Back
          </button>
        </div>
      ) : (
        <>
          <p className="text-[16px]">Tell us what's wrong.</p>
          <input className={input} maxLength={500} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          <div className="flex gap-2">
            <button
              className={quietButton}
              onClick={async () => {
                const { error: e } = await supabase.rpc('report_message', { p_message: m.id, p_note: noteText });
                if (e) setError(plainError(e.message));
                else setSent(true);
              }}
            >
              SEND
            </button>
            <button className={quietButton} onClick={onDone}>
              Back
            </button>
          </div>
        </>
      )}
      {sent && (
        <button className={quietButton} onClick={onDone}>
          Back
        </button>
      )}
      {error && <p className="text-[13px] text-[#F08A8A]">{error}</p>}
    </div>
  );
}

/** Say something: to the party, and to Garrick when he is named (at the fire, his stored lines only). */
export async function sendChat(partyId: string, body: string, _atFire?: boolean): Promise<string | null> {
  if (/\bgarrick\b/i.test(body)) {
    const { error: e } = await supabase.functions.invoke('garrick', { body: { party: partyId, text: body } });
    if (!e) return null;
    let message = e.message;
    try {
      message = (await (e as { context?: Response }).context?.json())?.message ?? message;
    } catch {
      /* keep the first message */
    }
    return plainError(message);
  }
  const { error: e } = await supabase.rpc('post_message', { p_party: partyId, p_body: body });
  return e ? plainError(e.message) : null;
}

/** The composer, always at the foot of the thread: the text box, send, and a "+" with a small tray. */
export function Composer({
  placeholder,
  onSend,
  tray,
  glow = false,
  onSent,
}: {
  placeholder: string;
  onSend: (text: string) => Promise<string | null>;
  /** Called after a message went through (the page follows it to the foot). */
  onSent?: () => void;
  tray?: (close: () => void) => React.ReactNode;
  glow?: boolean;
}) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    const e = await onSend(body);
    setBusy(false);
    setError(e);
    if (!e) {
      setText('');
      onSent?.();
    }
  };
  return (
    <div className="sticky bottom-0 z-10 -mx-4 px-3 pt-2 pb-3 bg-[#150D22] border-t border-[#2C1D40] space-y-2" data-composer>
      {open && tray && <div className="space-y-2 max-h-[40vh] overflow-y-auto overscroll-contain" data-tray>{tray(() => setOpen(false))}</div>}
      <div className="flex gap-2 items-center">
        {tray && (
          <button
            aria-label="More"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            data-plus
            className={`shrink-0 w-11 h-11 rounded-xl border text-[24px] leading-none ${
              glow ? 'border-[#D4B876] bg-[#2A2010] text-[#E5C158] shadow-[0_0_10px_rgba(212,184,118,0.45)]' : 'border-[#3A2555] text-[#B7A9CC]'
            }`}
          >
            {open ? '×' : '+'}
          </button>
        )}
        <input
          className="flex-1 min-w-0 h-11 rounded-xl bg-[#0F0A18] border border-[#3A2555] px-3 text-[16px] text-[#F4F1F8] placeholder:text-[#6F6385]"
          placeholder={placeholder}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          aria-label={placeholder}
        />
        <button
          aria-label="Send"
          disabled={busy || !text.trim()}
          onClick={send}
          className="shrink-0 w-11 h-11 rounded-xl bg-[#D4B876] text-[#1A0F26] text-[20px] font-bold disabled:opacity-40"
        >
          →
        </button>
      </div>
      {error && <p className="text-[13px] text-[#F08A8A]">{error}</p>}
    </div>
  );
}

/** Before your own day is done: the party's talk up to this morning (and your own lines), with the composer. Tonight's
 *  fire opens once your day is finished (Fake Guru, 18 Oct: "you get to camp only if you finish days game"). */
export function EarlierFire({
  partyId,
  userId,
  members,
  timeZone,
}: {
  partyId: string;
  userId: string;
  members: MemberRow[];
  timeZone: string;
}) {
  const { messages, reload } = useChatMessages(partyId, true);
  const [reporting, setReporting] = useState<ChatMessage | null>(null);
  const cutoff = new Date(partyDayStart(timeZone)).getTime();
  const yesterday = cutoff - 86400000;
  // Last night's talk (the day before this morning), and anything you have said since (including Garrick's answers to your questions).
  const shown = messages.filter((m) => {
    const t = new Date(m.created_at).getTime();
    return (t >= yesterday && t < cutoff) || (t >= cutoff && (m.author_id === userId || m.reply_to_user === userId));
  });
  const follow = useKeepNewInView(shown.length);
  return (
    <div className="space-y-3" data-earlier-fire>
      <div className="flex items-center gap-2 text-[12px] font-bold tracking-[1px] text-[#8F82A6]">
        <div className="flex-1 h-px bg-[#2C1D40]" />
        <span>LAST NIGHT AT THE FIRE</span>
        <div className="flex-1 h-px bg-[#2C1D40]" />
      </div>
      {shown.length === 0 && <SmallLine>Nothing was said at the fire last night.</SmallLine>}
      {shown.map((m) => (
        <ChatBubble key={m.id} m={m} userId={userId} members={members} onReport={setReporting} />
      ))}
      {reporting && <ReportBox m={reporting} onDone={() => setReporting(null)} />}
      <SmallLine>Tonight's fire opens once your day is done.</SmallLine>
      <Composer
        placeholder="Say something to the party"
        onSent={follow}
        onSend={async (t) => {
          const e = await sendChat(partyId, t, false);
          if (!e) reload();
          return e;
        }}
      />
    </div>
  );
}
