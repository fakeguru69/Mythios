// MYTHIOS online: the Mythios intro, sign-in, the series shelf, your characters (one per series), parties, the invite,
// the host letting friends in, Session Zero, the party clock and starting the story (Core Rules §7, §11, §12a).
// A series (Tales of the Dark Moon) has seasons; a party plays one season (Fake Guru, 16 Oct).
// The screens' words are from review-accounts-and-invites.md and the Mythios intro (approved 16 Oct, in onlineText.ts).
// Opened with ?online=1, or by an invite link (?join=CODE). The one-phone demo is unchanged.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  supabase,
  plainError,
  allTimeZones,
  enabledSignIns,
  homeTimeZone,
  timeZoneLabel,
  dayOneWord,
  earliestStartDate,
  dayOneOpening,
  dateOpening,
  MAX_PLAYER_NAME,
  MAX_PARTY_NAME,
  MAX_PARTY_SIZE,
  PARTY_COLUMNS,
  MEMBER_COLUMNS,
  type PartyRow,
  type MemberRow,
  type InviteDetails,
} from './supabaseClient';

type InviteCardInfo = InviteDetails & { series_id: string; series_title: string; season_number: number };
import { CREDIT_LINE, INVITE_BULLETS, MYTHIOS_INTRO, SERIES, SZ_DOOR, TAGLINE, seriesTitle } from './onlineText';
import SessionZero, { type SeriesCharacter } from './SessionZero';
import PartyChat from './PartyChat';
import InstallGuide from './InstallGuide';
import Notifications from './Notifications';
import GarrickRecap from './GarrickRecap';
import { GatheringCard } from './OnlineGathering';
import GameShell from './GameShell';
import { NotebookProvider } from './Markable';
import CoverPage from '../components/CoverPage';
import { Shell, ErrorLine, card, input, goldButton, quietButton, heading, note } from './ui';
import { alertParty, onAlertLink } from './alertLink';

const startQuery = new URLSearchParams(window.location.search);
const inviteLink = (code: string) => `${window.location.origin}/?join=${code}`;
const codeFrom = (text: string) => (text.match(/join=([0-9a-f]+)/i)?.[1] ?? text.trim()).toLowerCase();
const clearJoinFromUrl = () => window.history.replaceState(null, '', `${window.location.pathname}?online=1`);

// "Arjun", "Arjun and Dev", "Arjun, Dev and Mei".
const nameList = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

// The party list: the host, then the friends in the order they finished Session Zero (§12a);
// friends still choosing follow, in the order they joined.
const partyOrder = (party: PartyRow) => (a: MemberRow, b: MemberRow) => {
  const key = (r: MemberRow) => (r.user_id === party.host_id ? '0' : `1${r.session_zero_done_at ?? '9'}${r.joined_at}`);
  return key(a).localeCompare(key(b));
};

const getPartyCurrentDay = (day1OpensAt: string | null, timeZone: string): { week: number; day: number } | null => {
  if (!day1OpensAt) return null;
  const opens = new Date(day1OpensAt).getTime();
  const now = Date.now();
  if (now < opens) return null;
  try {
    const toAdjustedDate = (ms: number) => {
      const shifted = new Date(ms - 5 * 3600 * 1000);
      return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(shifted);
    };
    const todayStr = toAdjustedDate(now);
    const day1Str = toAdjustedDate(opens);
    const msDiff = new Date(todayStr).getTime() - new Date(day1Str).getTime();
    const n = Math.floor(msDiff / 86400000);
    if (n < 0 || n > 41) return null;
    return { week: Math.floor(n / 7) + 1, day: (n % 7) + 1 };
  } catch {
    return { week: 1, day: 1 };
  }
};

function useInvite(code: string | null) {
  const [info, setInfo] = useState<InviteCardInfo | null | undefined>(undefined);
  useEffect(() => {
    if (!code) return;
    supabase.rpc('invite_card', { p_invite_code: code }).then(({ data }) => setInfo((data as InviteCardInfo[] | null)?.[0] ?? null));
  }, [code]);
  return info;
}

// Screen 1: the invite (review §1), and what it says when the party can no longer be joined (§3).
// What the player tapped before signing in ("Start a party" on the cover, JOIN on an invite), so that after signing in
// they land where they were going instead of tapping it a second time (Phase 1, 25 Oct).
const INTENT_KEY = 'mythios_intent';
const setIntent = (v: 'start' | 'join') => {
  try {
    sessionStorage.setItem(INTENT_KEY, v);
  } catch {
    /* private window: they tap twice, as before */
  }
};
const takeIntent = (): string | null => {
  try {
    const v = sessionStorage.getItem(INTENT_KEY);
    sessionStorage.removeItem(INTENT_KEY);
    return v;
  } catch {
    return null;
  }
};

function InviteCard({ info, onJoin }: { info: InviteCardInfo | null | undefined; onJoin?: () => void }) {
  if (info === undefined) return <p className="text-center text-[#B7A9CC]">…</p>;
  if (!info) {
    return (
      <div className={card}>
        <p className="text-[15px]">This invite no longer works. Ask for a new link.</p>
      </div>
    );
  }
  if (info.set_off) {
    return (
      <div className={card}>
        <h2 className={`${heading} text-[17px]`}>This party has set off.</h2>
        <p className="text-[15px]">Their story has started, and nobody can join it now. You can start a party of your own.</p>
      </div>
    );
  }
  if (info.full) {
    return (
      <div className={card}>
        <h2 className={`${heading} text-[17px]`}>This party is full.</h2>
        <p className="text-[15px]">Six is as many as the road will hold.</p>
      </div>
    );
  }
  if (!info.open) {
    return (
      <div className={card}>
        <p className="text-[15px]">This invite no longer works. Ask for a new link.</p>
      </div>
    );
  }
  return (
    <div className={card}>
      <h2 className={`${heading} text-[18px]`}>Join the adventure in {info.series_title}</h2>
      <p className={note}>Season {info.season_number}</p>
      <p className="text-[15px]">
        {info.host_name} has invited you to join <span className="font-semibold text-[#E5C158]">{info.party_name}</span>.
      </p>
      <p className="text-[15px]">{SERIES.find((x) => x.id === info.series_id)?.premise}</p>
      <p className="text-[15px]">{TAGLINE}</p>
      <ul className="list-disc pl-5 text-[15px] space-y-0.5">
        {INVITE_BULLETS.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="text-[15px]">Free.</p>
      {onJoin && (
        <button className={goldButton} onClick={onJoin}>
          JOIN {info.party_name.toUpperCase()}
        </button>
      )}
      {info.members && <p className={`${note} italic`}>Already in the party: {info.members}.</p>}
      <p className="text-[14px] text-[#8B7A9E]">{CREDIT_LINE}</p>
    </div>
  );
}

// Screen 2 and 3: sign in (review §1): Google (once switched on in Supabase), or email and a password. No Apple (Fake Guru, 16 Oct).
// returning: opened from "Already playing? Sign in", straight to the email sign-in.
function SignIn({ returning = false }: { returning?: boolean }) {
  const [open, setOpen] = useState(returning);
  const [mode, setMode] = useState<'in' | 'up'>(returning ? 'in' : 'up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [forgot, setForgot] = useState<'no' | 'asking' | 'sent'>('no');
  const [providers, setProviders] = useState({ google: false });
  useEffect(() => {
    enabledSignIns().then(setProviders);
  }, []);
  // Google (review-accounts-and-invites.md §1 Screen 2). The page comes back here, invite link and all.
  const oauth = async (provider: 'google') => {
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
    if (e) setError(plainError(e.message));
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    if (mode === 'in') {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (e) setError(plainError(e.message));
    } else {
      const trimmed = name.trim();
      if (trimmed.length < 1 || trimmed.length > MAX_PLAYER_NAME) {
        setError(`A name is 1 to ${MAX_PLAYER_NAME} characters.`);
        setBusy(false);
        return;
      }
      const { data, error: e } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: trimmed }, emailRedirectTo: window.location.href },
      });
      if (e) setError(plainError(e.message));
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  };

  if (sent) {
    return (
      <div className={card}>
        <p className="text-[15px]">We sent a link to {email.trim()}. Open it to finish.</p>
      </div>
    );
  }
  // Forgot your password: a link by email, then a new password (NewPassword below).
  if (forgot !== 'no') {
    return (
      <div className={card}>
        <h2 className={`${heading} text-[17px]`}>Forgot your password?</h2>
        {forgot === 'sent' ? (
          <p className="text-[15px]">We sent a link to {email.trim()}. Open it to choose a new password.</p>
        ) : (
          <>
            <p className="text-[15px]">We'll email you a link to choose a new one.</p>
            <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <ErrorLine text={error} />
            <button
              className={goldButton}
              disabled={busy || !email.trim()}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                  redirectTo: `${window.location.origin}/?online=1`,
                });
                setBusy(false);
                if (e) setError(plainError(e.message));
                else setForgot('sent');
              }}
            >
              SEND THE LINK
            </button>
          </>
        )}
        <button className={quietButton} onClick={() => setForgot('no')}>
          Back
        </button>
      </div>
    );
  }
  return (
    <div className={card}>
      <h2 className={`${heading} text-[17px]`}>First, so the story knows you.</h2>
      {(!open || returning) && providers.google && (
        <button className={goldButton} onClick={() => oauth('google')}>
          CONTINUE WITH GOOGLE
        </button>
      )}
      {!open ? (
        <button className={goldButton} onClick={() => setOpen(true)}>
          USE EMAIL AND A PASSWORD
        </button>
      ) : (
        <>
          {mode === 'up' && (
            <>
              <label className="block text-[15px] font-semibold">What should your friends call you?</label>
              <p className={`${note} italic`}>This is the name they will see. It can be changed later.</p>
              <input className={input} maxLength={MAX_PLAYER_NAME} value={name} onChange={(e) => setName(e.target.value)} />
            </>
          )}
          <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className={input}
            type="password"
            placeholder="Password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <ErrorLine text={error} />
          <button className={goldButton} disabled={busy || !email || !password} onClick={submit}>
            {mode === 'in' ? 'SIGN IN' : 'GO ON'}
          </button>
          <button
            className="w-full text-[14px] text-[#B7A9CC] underline"
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in');
              setError(null);
            }}
          >
            {mode === 'in' ? 'New here? Make an account' : 'Have an account? Sign in'}
          </button>
          {mode === 'in' && (
            <button className="w-full text-[14px] text-[#B7A9CC] underline" onClick={() => setForgot('asking')}>
              Forgot your password?
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Screen 2 of the host's path: start a party (review §2).
function StartParty({ seriesId, onMade, onBack }: { seriesId: string; onMade: (id: string) => void; onBack: () => void }) {
  const [partyName, setPartyName] = useState('');
  const [tz, setTz] = useState(homeTimeZone());
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const make = async () => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc('make_series_party', { p_series: seriesId, p_name: partyName.trim(), p_time_zone: tz });
    setBusy(false);
    if (e) setError(plainError(e.message));
    else onMade(data as string);
  };
  return (
    <div className={card}>
      <p className={note}>{seriesTitle(seriesId)} · Season 1</p>
      <h2 className={`${heading} text-[18px]`}>Who walks with you?</h2>
      <p className="text-[15px]">You need at least one friend, and no more than five.</p>
      <label className="block text-[14px] font-semibold">Name your party:</label>
      <input className={input} maxLength={MAX_PARTY_NAME} value={partyName} onChange={(e) => setPartyName(e.target.value)} />
      <label className="block text-[14px] font-semibold">Your party's clock:</label>
      {!changing ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px]">{timeZoneLabel(tz)}</span>
          <button className={quietButton} onClick={() => setChanging(true)}>
            CHANGE
          </button>
        </div>
      ) : (
        <select className={input} value={tz} onChange={(e) => { setTz(e.target.value); setChanging(false); }}>
          {allTimeZones().map((z) => (
            <option key={z} value={z}>
              {timeZoneLabel(z)}
            </option>
          ))}
        </select>
      )}
      <p className={`${note} italic`}>Every day of the story opens at 5:00am on this clock. It cannot be changed once the story starts.</p>
      <ErrorLine text={error} />
      <button className={goldButton} disabled={busy || !partyName.trim()} onClick={make}>
        MAKE THE INVITE
      </button>
      <button className={quietButton} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function HaveInvite({ onCode, onBack }: { onCode: (code: string) => void; onBack: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className={card}>
      <label className="block text-[15px]">Paste the invite link your friend sent you.</label>
      <input className={input} value={text} onChange={(e) => setText(e.target.value)} />
      <button className={goldButton} disabled={!text.trim()} onClick={() => onCode(codeFrom(text))}>
        GO ON
      </button>
      <button className={quietButton} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function Confirm({
  title,
  body,
  yes,
  no,
  onYes,
  onNo,
  children,
}: {
  title: string;
  body: string;
  yes: string;
  no: string;
  onYes: () => void;
  onNo: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${card} border-[#D4B876]/70`}>
      <h3 className={`${heading} text-[16px]`}>{title}</h3>
      {children}
      <p className="text-[15px]">{body}</p>
      <div className="flex gap-2">
        <button className="flex-1 rounded-lg bg-[#D4B876] px-3 py-2 font-[Cinzel] font-bold text-[14px] text-[#130B1F]" onClick={onYes}>
          {yes}
        </button>
        <button className={`flex-1 ${quietButton}`} onClick={onNo}>
          {no}
        </button>
      </div>
    </div>
  );
}

function PartyPage({ partyId, userId, onBack }: { partyId: string; userId: string; onBack: () => void }) {
  const [party, setParty] = useState<PartyRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [hostName, setHostName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [doingSessionZero, setDoingSessionZero] = useState(false);
  const [confirm, setConfirm] = useState<null | { kind: 'leave' } | { kind: 'remove'; user: string; name: string } | { kind: 'start' }>(null);
  const [changingClock, setChangingClock] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [myCharacter, setMyCharacter] = useState<SeriesCharacter | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null); // the party panel's ⋯ menu beside a friend (host only)
  const [memberStatuses, setMemberStatuses] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('parties').select(PARTY_COLUMNS).eq('id', partyId).maybeSingle(),
      supabase.from('party_members').select(MEMBER_COLUMNS).eq('party_id', partyId),
    ]);
    const rows = (m as MemberRow[] | null) ?? [];
    // Everything is fetched first and shown together, so [BEGIN] never shows before the character has loaded.
    let character: SeriesCharacter | null = null;
    let host = '';
    if (p) {
      host = rows.find((r) => r.user_id === (p as PartyRow).host_id)?.character_name ?? '';
      const { data: c } = await supabase
        .from('characters')
        .select('name,class,second_attr,birthplace,grandparent_name')
        .eq('user_id', userId)
        .eq('series_id', (p as PartyRow).series_id)
        .maybeSingle();
      character = (c as SeriesCharacter | null) ?? null;
      // The chat opens for a friend once they have read Day 2's chapter, where the party meets Garrick (the server decides).
      const { data: open } = await supabase.rpc('party_chat_open', { p_party: partyId });
      setChatOpen(open === true);

      // Statuses for the party panel: "At the fire", "Reading Day N" (Piece C8)
      const { data: st } = await supabase.rpc('party_member_statuses', { p_party: partyId });
      if (st && typeof st === 'object') {
        setMemberStatuses(st as Record<string, string>);
      }
    } else {
      // Before being let in, a friend cannot read the party itself: only its name and its host's.
      const { data: sum } = await supabase.rpc('my_party_summary', { p_party: partyId });
      host = (sum as { host_name: string }[] | null)?.[0]?.host_name ?? '';
    }
    setMyCharacter(character);
    setHostName(host);
    setParty((p as PartyRow | null) ?? null);
    setMembers(rows);
    setLoaded(true);
  }, [partyId, userId]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 5000); // the page follows the host and friends without reloading
    return () => window.clearInterval(t);
  }, [load]);

  const me = members.find((r) => r.user_id === userId);

  const act = async (fn: string, args: Record<string, unknown>) => {
    setError(null);
    const { error: e } = await supabase.rpc(fn, args);
    if (e) setError(plainError(e.message));
    await load();
    return !e;
  };

  const back = (
    <button className={quietButton} onClick={onBack}>
      ← Your stories
    </button>
  );
  const host = hostName || 'The host';

  if (!loaded) return <p className="text-center text-[#B7A9CC]">…</p>;

  if (me?.status === 'pending') {
    return (
      <div className="space-y-4">
        {back}
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>You've knocked.</h2>
          <p className="text-[15px]">{host} will let you in. We'll tell you the moment they do.</p>
        </div>
      </div>
    );
  }
  if (me?.status === 'turned_away') {
    return (
      <div className="space-y-4">
        {back}
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>Not this time.</h2>
          <p className="text-[15px]">{host} hasn't let you into this party.</p>
        </div>
      </div>
    );
  }
  if (!party || !me || me.status !== 'approved') {
    return (
      <div className="space-y-4">
        {back}
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>You're no longer in this party.</h2>
        </div>
      </div>
    );
  }

  const isHost = party.host_id === userId;
  const approved = members.filter((r) => r.status === 'approved').sort(partyOrder(party));
  const pending = members.filter((r) => r.status === 'pending').sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  const full = approved.length >= MAX_PARTY_SIZE;
  const started = !!party.season_started_at;
  const readyCount = approved.filter((r) => r.ready).length;
  const choosing = approved.filter((r) => !r.ready).map((r) => r.character_name);
  const setOff = !!party.day1_opens_at && Date.now() >= new Date(party.day1_opens_at).getTime() + 2 * 86400000;
  // "Day 1 opens at 5:00am. Sleep, if you can." shows only until Day 1 opens.
  const beforeDayOne = !party.day1_opens_at || Date.now() < new Date(party.day1_opens_at).getTime();
  // Canon's line on the last night; further ahead, the day it starts.
  const doorLine =
    party.day1_opens_at && new Date(party.day1_opens_at).getTime() - Date.now() > 86400000
      ? `Day 1 opens at 5:00am ${dayOneOpening(party.day1_opens_at, party.time_zone)}.`
      : SZ_DOOR;

  if (doingSessionZero) {
    return (
      <SessionZero
        key={myCharacter?.class ? 'kept' : 'new'}
        partyId={party.id}
        userId={userId}
        seriesId={party.series_id}
        startName={me.character_name}
        character={myCharacter}
        members={members}
        onDone={async () => {
          setDoingSessionZero(false);
          await load();
        }}
      />
    );
  }

  // Screen 5 of the friend's path: let in, before Session Zero.
  if (!me.session_zero_done_at && !isHost) {
    return (
      <div className="space-y-4">
        {back}
        <div className={card}>
          <h2 className={`${heading} text-[18px]`}>{host} has let you in.</h2>
          <button className={goldButton} onClick={() => setDoingSessionZero(true)}>
            BEGIN
          </button>
        </div>
      </div>
    );
  }


  const removeDialog = (
    <>
      {confirm?.kind === 'remove' && (
        <Confirm
          title={`Remove ${confirm.name} from the party?`}
          body="They will lose their place in this story and can't come back to it."
          yes="REMOVE"
          no="KEEP"
          onYes={async () => {
            await act('set_member_status', { p_party: party.id, p_user: confirm.user, p_status: 'removed' });
            setConfirm(null);
          }}
          onNo={() => setConfirm(null)}
        />
      )}
    </>
  );
  const leaveDialog = (
    <>
      {confirm?.kind === 'leave' && (
        <Confirm
          title="Leave the party?"
          body="Your friends will carry on without you. You can't come back to this story."
          yes="LEAVE"
          no="STAY"
          onYes={async () => {
            await act('leave_party', { p_party: party.id });
            onBack();
          }}
          onNo={() => setConfirm(null)}
        />
      )}
    </>
  );
  const pendingCard = (
    <>
      {isHost && pending.length > 0 && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Asking to join</h3>
          {pending.map((r) => (
            <div key={r.user_id} className="flex items-center justify-between gap-2">
              <span className="text-[15px]">{r.character_name}</span>
              <span className="flex gap-2">
                <button
                  className="rounded-lg bg-[#D4B876] px-3 py-1.5 font-[Cinzel] font-bold text-[14px] text-[#130B1F] disabled:opacity-50"
                  disabled={full || setOff}
                  onClick={() => act('set_member_status', { p_party: party.id, p_user: r.user_id, p_status: 'approved' })}
                >
                  LET IN
                </button>
                <button className={quietButton} onClick={() => act('set_member_status', { p_party: party.id, p_user: r.user_id, p_status: 'removed' })}>
                  NOT THIS TIME
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
  const inviteCard = (
    <>
      {/* Screen 3 of the host's path: the invite. */}
      {isHost && !full && !setOff && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Send this to your friends.</h3>
          <p className="break-all text-[14px] text-[#B7A9CC]">{inviteLink(party.invite_code)}</p>
          <div className="flex flex-wrap gap-2">
            <button
              className={quietButton}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteLink(party.invite_code));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'COPIED' : 'COPY'}
            </button>
            {typeof navigator.share === 'function' && (
              <button
                className={quietButton}
                onClick={() => navigator.share({ title: 'Tales of the Dark Moon', url: inviteLink(party.invite_code) }).catch(() => undefined)}
              >
                SHARE
              </button>
            )}
            <button className={quietButton} onClick={() => act('new_invite_code', { p_party: party.id })}>
              NEW LINK
            </button>
          </div>
          <p className={note}>Anyone you send it to can ask to join. Nobody gets in until you say so.</p>
        </div>
      )}
    </>
  );
  const nameCard = (
      <div className={card}>
        {editingName === null ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px]">
              <span className="font-semibold">Your name in {seriesTitle(party.series_id)}:</span> {me.character_name}
            </span>
            <button className={quietButton} onClick={() => setEditingName(me.character_name)}>
              CHANGE
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input className={input} maxLength={MAX_PLAYER_NAME} value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            <button
              className={quietButton}
              disabled={!editingName.trim()}
              onClick={async () => {
                // One character per series: the new name shows in every party of this series (Fake Guru, 16 Oct).
                const { error: e } = await supabase.rpc('rename_character', { p_series: party.series_id, p_name: editingName.trim() });
                if (e) setError(plainError(e.message));
                setEditingName(null);
                await load();
              }}
            >
              SAVE
            </button>
          </div>
        )}
        <button className={quietButton} onClick={() => setConfirm({ kind: 'leave' })}>
          Leave the party
        </button>
      </div>
  );

  const partyList = (
    <ul className="space-y-2">
      {approved.map((r) => {
        const isYou = r.user_id === userId;
        const isPartyHost = r.user_id === party.host_id;
        return (
          <li
            key={r.user_id}
            className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border ${
              isYou ? 'border-[#5A3886] bg-gradient-to-r from-[#201235] to-[#160D25]' : 'border-[#2C1D40] bg-[#140C20]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#2A1A40] text-[#E5C158] font-['Cinzel'] font-bold text-[14px] flex items-center justify-center border border-[#432A66]">
                {(r.character_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] truncate">
                  <span className="font-semibold text-[#F4F1F8]">{isYou ? 'You' : r.character_name}</span>
                  {isPartyHost && <span className="text-[#D4B876] text-[14px] font-normal"> (host)</span>}
                  <span className={r.ready ? 'text-[#D4B876] font-medium' : 'text-[#8F82A6]'}>
                    {' '}— {r.ready ? 'ready' : 'choosing'}
                  </span>
                </div>
              </div>
            </div>
            {isHost && r.user_id !== userId && (
              <button
                className={`${quietButton} text-[14px] py-1 px-2.5 text-[#F08A8A] border-[#5A2525] hover:border-[#F08A8A]`}
                onClick={() => setConfirm({ kind: 'remove', user: r.user_id, name: r.character_name })}
              >
                Remove
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Once the season is under way and your character is made, the party opens straight into the game shell
  // (docs/design/one-thread-18oct.md, phase A). Everything the page held that is not a tab sits in the party panel.
  if (started && !beforeDayOne && me.session_zero_done_at) {
    const currentDay = party ? getPartyCurrentDay(party.day1_opens_at, party.time_zone) : null;
    const friendStatus = (r: MemberRow) => {
      if (memberStatuses[r.user_id]) return memberStatuses[r.user_id];
      if (!started || beforeDayOne) {
        return r.ready ? 'Ready' : 'Choosing';
      }
      if (!currentDay) return 'Reading Day 1';
      if (currentDay.day === 7) return 'At the Gathering';
      return `Reading Day ${currentDay.day}`;
    };

    const panel = (shell: { joinGathering: () => void }) => (
      <div className="space-y-6">
        {removeDialog}
        {leaveDialog}

        {/* ══════════ 1. THE FELLOWSHIP ══════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#2C1D40]">
            <div>
              <p className="text-[12px] uppercase font-['Cinzel'] tracking-[2px] text-[#D4B876] font-bold">
                The Fellowship
              </p>
              <h2 className="text-[15px] font-['Cinzel'] font-bold text-[#F4F1F8] tracking-wide">
                {party.name.toUpperCase()}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#2A1A40] text-[#D4B876] border border-[#432A66]">
              {approved.length} OF {MAX_PARTY_SIZE}
            </span>
          </div>

          <div className="space-y-2">
            {approved.map((r) => {
              const status = friendStatus(r);
              const isYou = r.user_id === userId;
              const isMemberHost = r.user_id === party.host_id;
              return (
                <div
                  key={r.user_id}
                  className={`rounded-xl border ${
                    isYou
                      ? 'border-[#5A3886] bg-gradient-to-r from-[#1F1235] to-[#150D24]'
                      : 'border-[#2C1D40] bg-[#150D22]'
                  } px-3.5 py-2.5 space-y-2 transition`}
                  data-panel-friend
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 shrink-0 rounded-full bg-[#2A1A40] text-[#E5C158] font-['Cinzel'] font-bold text-[15px] flex items-center justify-center border border-[#432A66]"
                      data-friend-avatar
                    >
                      {(r.character_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold truncate flex items-center gap-1.5">
                        <span className="truncate text-[#F4F1F8]">{r.character_name}</span>
                        {isYou && (
                          <span className="font-medium text-[12px] px-1.5 py-0.2 rounded bg-[#3A2555] text-[#D4B876] shrink-0">
                            you
                          </span>
                        )}
                        {isMemberHost && (
                          <span className="font-normal text-[12px] text-[#B7A9CC] shrink-0">
                            · host
                          </span>
                        )}
                      </div>
                      <div className="text-[14px] text-[#B7A9CC] flex items-center gap-1.5 truncate">
                        {r.class && (
                          <span data-friend-class className="font-medium text-[#D4B876]">
                            {r.class}
                          </span>
                        )}
                        {r.class && status && <span className="text-[#5E4585]">·</span>}
                        {status && (
                          <span
                            data-friend-status
                            className={status === 'At the fire' ? 'text-[#E5C158] font-medium' : 'text-[#8F82A6]'}
                          >
                            {status}
                          </span>
                        )}
                      </div>
                    </div>
                    {isHost && r.user_id !== userId && (
                      <button
                        className="w-9 h-9 shrink-0 rounded-full text-[18px] text-[#8F82A6] hover:text-[#F4F1F8] flex items-center justify-center transition"
                        aria-label={`More for ${r.character_name}`}
                        data-friend-menu-button
                        onClick={() => setMenuFor(menuFor === r.user_id ? null : r.user_id)}
                      >
                        ⋯
                      </button>
                    )}
                  </div>
                  {menuFor === r.user_id && (
                    <div className="pt-2 border-t border-[#2C1D40] flex justify-end" data-friend-menu>
                      <button
                        className={`${quietButton} text-[#F08A8A] border-[#682323] hover:border-[#F08A8A] text-[14px]`}
                        data-remove-button
                        onClick={() => {
                          setMenuFor(null);
                          setConfirm({ kind: 'remove', user: r.user_id, name: r.character_name });
                        }}
                      >
                        Remove from the party
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {pendingCard}
          {inviteCard}
        </section>

        {/* ══════════ 2. CHRONICLES OF THE ROAD (Story & Gatherings) ══════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#2C1D40]">
            <div>
              <p className="text-[12px] uppercase font-['Cinzel'] tracking-[2px] text-[#D4B876] font-bold">
                Story & Lore
              </p>
              <h3 className="text-[14px] font-['Cinzel'] font-bold text-[#F4F1F8]">
                Chronicles of the Road
              </h3>
            </div>
          </div>
          <GatheringCard partyId={party.id} isHost={isHost} timeZone={party.time_zone} onOpen={shell.joinGathering} />
          <GarrickRecap
            partyId={party.id}
            partySize={approved.length}
            friends={approved.filter((r) => r.user_id !== userId).map((r) => r.character_name ?? '')}
          />
        </section>

        {/* ══════════ 3. CAMPFIRE & EXPEDITION SETTINGS ══════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#2C1D40]">
            <div>
              <p className="text-[12px] uppercase font-['Cinzel'] tracking-[2px] text-[#D4B876] font-bold">
                Campfire
              </p>
              <h3 className="text-[14px] font-['Cinzel'] font-bold text-[#F4F1F8]">
                Party & Character Settings
              </h3>
            </div>
          </div>

          <Notifications compact />

          <div className="rounded-xl border border-[#2C1D40] bg-[#160D23] overflow-hidden text-[14px]">
            <div className="flex justify-between items-center px-3.5 py-3 border-b border-[#2C1D40]/60">
              <span className="text-[#B7A9CC] flex items-center gap-2">
                <span className="text-[15px]">⏱</span> Party clock
              </span>
              <span className="text-right font-medium text-[#F4F1F8]">{timeZoneLabel(party.time_zone)}</span>
            </div>
          </div>

          {nameCard}

          <ErrorLine text={error} />

          <button className={`w-full ${quietButton} py-2.5 font-['Cinzel'] tracking-wide`} onClick={onBack}>
            ← Your stories
          </button>
        </section>
      </div>
    );
    return <GameShell party={party} userId={userId} me={me} approved={approved} members={members} chatOpen={chatOpen} panel={panel} />;
  }

  return (
    <div className="space-y-4">
      {back}

      {removeDialog}
      {leaveDialog}
      {confirm?.kind === 'start' && (
        <Confirm
          title={started ? 'Change the day the story starts?' : `Start the story for ${readyCount} of you?`}
          body={`Day 1 opens at 5:00am ${dateOpening(startDate || earliestStartDate(party.time_zone), party.time_zone)}.${
            choosing.length
              ? ` ${nameList(choosing)} ${choosing.length === 1 ? "hasn't" : "haven't"} finished choosing. They can still join until the end of Day 2.`
              : ''
          }`}
          yes={started ? 'SAVE' : 'START'}
          no="NOT YET"
          onYes={async () => {
            // The host picks the day (Fake Guru, 16 Oct); Day 1 opens at 5:00am that day on the party's clock.
            const ok = await act('schedule_season', { p_party: party.id, p_start: startDate || earliestStartDate(party.time_zone) });
            if (ok) setConfirm(null);
          }}
          onNo={() => setConfirm(null)}
        >
          <label className="block text-[14px] font-semibold">The day the story starts:</label>
          <input
            type="date"
            className={input}
            min={earliestStartDate(party.time_zone)}
            value={startDate || earliestStartDate(party.time_zone)}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Confirm>
      )}

      {/* Host call-to-action if character not created yet */}
      {isHost && !me.session_zero_done_at && (
        <div className={`${card} border-[#E5C158]/50 bg-gradient-to-b from-[#2B1B44] to-[#1A102A]`}>
          <div className="flex items-center gap-2.5">
            <span className="text-[20px]">🗡️</span>
            <div>
              <p className="text-[12px] uppercase font-['Cinzel'] tracking-[2px] text-[#D4B876] font-bold">First Step</p>
              <h3 className={`${heading} text-[15px]`}>Your character comes first</h3>
            </div>
          </div>
          <p className="text-[15px]">Choose who you will be on the road, before your friends arrive.</p>
          <button className={goldButton} onClick={() => setDoingSessionZero(true)}>
            BEGIN
          </button>
        </div>
      )}

      {/* Screen 6 (a friend) or Screen 4 (the host): the waiting room / fellowship roster */}
      <div className={card}>
        <div className="space-y-1">
          <p className="text-[12px] uppercase font-['Cinzel'] tracking-[2px] text-[#D4B876] font-bold">
            The Fellowship
          </p>
          {isHost ? (
            <h2 className={`${heading} text-[18px]`}>Your party</h2>
          ) : (
            <>
              {!started && <h2 className={`${heading} text-[18px]`}>You're ready.</h2>}
              <h3 className={`${heading} text-[15px]`}>The party</h3>
            </>
          )}
          <p className={note}>
            {party.name} · {seriesTitle(party.series_id)} · Season {party.season_number}
          </p>
        </div>

        {partyList}

        {!isHost && (
          <p className="text-[14px] text-[#B7A9CC] pt-1">
            {!started ? `The road opens when ${host} says so.` : beforeDayOne ? doorLine : ''}
          </p>
        )}
        {isHost && started && beforeDayOne && <p className="text-[14px] text-[#B7A9CC] pt-1">{doorLine}</p>}
      </div>

      {pendingCard}
      {inviteCard}

      {/* Notifications on this phone: the 8:00am line, the Day 4 poll, the Gathering's time and its reminder (0069). */}
      {started && me.session_zero_done_at && <Notifications />}

      {/* Garrick's Recap: shown once the party's Gathering 6 has ended (0072); the server keeps it until then. */}
      {started && me.session_zero_done_at && (
        <GarrickRecap
          partyId={party.id}
          partySize={approved.length}
          friends={approved.filter((r) => r.user_id !== userId).map((r) => r.character_name ?? '')}
        />
      )}

      {/* The party chat opens when the party assembles on Day 2 (Fake Guru, 16 Oct); the server enforces it. */}
      {chatOpen && (
        <NotebookProvider partyId={party.id}>
          <PartyChat partyId={party.id} userId={userId} members={members} />
        </NotebookProvider>
      )}

      {/* Expedition & Clock Settings */}
      {isHost && (
        <div className={card}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px]">
              <span className="font-semibold">Your party's clock:</span> {timeZoneLabel(party.time_zone)}
            </span>
            {!started && !changingClock && (
              <button className={quietButton} onClick={() => setChangingClock(true)}>
                CHANGE
              </button>
            )}
          </div>
          {changingClock && (
            <select
              className={input}
              value={party.time_zone}
              onChange={async (e) => {
                await act('set_party_clock', { p_party: party.id, p_time_zone: e.target.value });
                setChangingClock(false);
              }}
            >
              {allTimeZones().map((z) => (
                <option key={z} value={z}>
                  {timeZoneLabel(z)}
                </option>
              ))}
            </select>
          )}
          {!started && (
            <>
              <button className={goldButton} disabled={readyCount < 2} onClick={() => setConfirm({ kind: 'start' })}>
                START THE STORY
              </button>
              <p className={`${note} italic`}>Needs two of you ready. Day 1 opens at 5:00am on the day you choose.</p>
            </>
          )}
          {started && beforeDayOne && (
            <button className={quietButton} onClick={() => setConfirm({ kind: 'start' })}>
              CHANGE THE DAY
            </button>
          )}
        </div>
      )}

      <ErrorLine text={error} />

      {nameCard}
    </div>
  );
}

function Home({ session }: { session: Session }) {
  const userId = session.user.id;
  const [accountName, setAccountName] = useState('');
  const [nameChosen, setNameChosen] = useState(true);
  const [rows, setRows] = useState<(MemberRow & { parties: { name: string; series_id: string; season_number: number } | null })[]>([]);
  const [characters, setCharacters] = useState<{ series_id: string; name: string; class: string | null }[]>([]);
  const [view, setView] = useState<'list' | 'start' | 'invite'>('list');
  const [startSeries, setStartSeries] = useState('dark-moon');
  const [renaming, setRenaming] = useState<{ series: string; name: string } | null>(null);
  const [openParty, setOpenParty] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(startQuery.get('join'));
  const [joinError, setJoinError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const info = useInvite(joinCode);
  const autoOpened = useRef(false);

  const load = useCallback(async () => {
    const [{ data: prof }, { data: mine }, { data: chars }] = await Promise.all([
      supabase.from('profiles').select('display_name,name_chosen').eq('id', userId).maybeSingle(),
      supabase
        .from('party_members')
        .select(`${MEMBER_COLUMNS},parties(name,series_id,season_number)`)
        .eq('user_id', userId)
        .in('status', ['approved', 'pending', 'turned_away']),
      supabase.from('characters').select('series_id,name,class').eq('user_id', userId),
    ]);
    setCharacters((chars as { series_id: string; name: string; class: string | null }[] | null) ?? []);
    setAccountName(prof?.display_name ?? '');
    setNameChosen(prof?.name_chosen ?? true);
    const list = (mine as unknown as (MemberRow & { parties: { name: string; series_id: string; season_number: number } | null })[]) ?? [];
    // A party not yet joined cannot be read; its name comes from my_party_summary.
    for (const r of list) {
      if (r.parties) continue;
      const { data: sum } = await supabase.rpc('my_party_summary', { p_party: r.party_id });
      const name = (sum as { party_name: string }[] | null)?.[0]?.party_name;
      if (name) r.parties = { name, series_id: 'dark-moon', season_number: 1 };
    }
    setRows(list);
    // With one party, signing in goes straight into it (phase A, docs/design/one-thread-18oct.md); once only, so
    // "Your stories" still reaches the shelf.
    // A tapped notification opens the party it is about (alertLink.ts).
    const alerted = alertParty();
    if (!autoOpened.current && alerted && list.some((r) => r.party_id === alerted && r.status === 'approved')) {
      autoOpened.current = true;
      setOpenParty(alerted);
    }
    if (!autoOpened.current && !startQuery.get('join')) {
      const intent = takeIntent();
      if (intent === 'start' && !list.some((r) => r.status === 'approved' || r.status === 'pending')) {
        autoOpened.current = true;
        setView('start');
      }
    }
    if (!autoOpened.current && !startQuery.get('join') && list.length === 1 && list[0].status === 'approved') {
      autoOpened.current = true;
      setOpenParty(list[0].party_id);
    }
    autoOpened.current = true;
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // A notification tapped while the game is open (alertLink.ts): open the party it is about, if it is one of ours.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  useEffect(
    () =>
      onAlertLink((link) => {
        if (rowsRef.current.some((r) => r.party_id === link.party && r.status === 'approved')) setOpenParty(link.party);
      }),
    []
  );

  const joinNow = async () => {
    if (!joinCode) return;
    setJoinError(null);
    const { data, error } = await supabase.rpc('request_join', { p_invite_code: joinCode, p_character_name: accountName });
    if (error) return setJoinError(plainError(error.message));
    clearJoinFromUrl();
    setJoinCode(null);
    setOpenParty(data as string);
  };
  // A friend who tapped JOIN before signing in is asked once, not twice: the knock goes in as soon as their name is known.
  const joinIntent = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!joinCode || !accountName || !nameChosen) return;
    if (joinIntent.current === undefined) joinIntent.current = takeIntent();
    if (joinIntent.current === 'join') {
      joinIntent.current = null;
      joinNow();
    }
  }, [joinCode, accountName, nameChosen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Google sign-ins are asked the name question once (review §1 Screen 3).
  if (!nameChosen) {
    return (
      <div className={card}>
        <label className="block text-[15px] font-semibold">What should your friends call you?</label>
        <p className={`${note} italic`}>This is the name they will see. It can be changed later.</p>
        <input className={input} maxLength={MAX_PLAYER_NAME} value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        <button
          className={goldButton}
          disabled={!accountName.trim()}
          onClick={async () => {
            await supabase.from('profiles').update({ display_name: accountName.trim(), name_chosen: true }).eq('id', userId);
            load();
          }}
        >
          GO ON
        </button>
      </div>
    );
  }

  if (openParty) {
    return (
      <PartyPage
        key={openParty}
        partyId={openParty}
        userId={userId}
        onBack={() => {
          setOpenParty(null);
          load();
        }}
      />
    );
  }

  if (joinCode) {
    return (
      <div className="space-y-4">
        <InviteCard info={info} onJoin={accountName ? joinNow : undefined} />
        <ErrorLine text={joinError} />
        <button
          className={quietButton}
          onClick={() => {
            clearJoinFromUrl();
            setJoinCode(null);
          }}
        >
          Back
        </button>
      </div>
    );
  }

  if (view === 'start') return <StartParty seriesId={startSeries} onMade={(id) => { setView('list'); setOpenParty(id); }} onBack={() => setView('list')} />;
  if (view === 'invite') return <HaveInvite onCode={(c) => { setView('list'); setJoinCode(c); }} onBack={() => setView('list')} />;

  return (
    <div className="space-y-4">
      {rows.length > 0 && (
        <div className={card}>
          <h2 className={`${heading} text-[16px]`}>Your stories</h2>
          {rows.map((r) => (
            <button
              key={r.party_id}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-[#3A2555] hover:border-[#D4B876] px-3 py-2 text-left"
              onClick={() => setOpenParty(r.party_id)}
            >
              <span>
                <span className="block text-[15px]">{r.parties?.name ?? '…'}</span>
                <span className={note}>
                  {seriesTitle(r.parties?.series_id)} · Season {r.parties?.season_number ?? 1}
                </span>
              </span>
              <span className={note}>{r.character_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* The shelf: every series, its premise and seasons (Fake Guru, 16 Oct). */}
      {SERIES.map((series) => {
        const mineHere = characters.find((c) => c.series_id === series.id);
        return (
          <div key={series.id} className={`${card} border-[#D4B876]/50`}>
            <p className={`${note} tracking-[1px] uppercase`}>A Mythios series</p>
            <h2 className={`${heading} text-[20px]`}>{series.title}</h2>
            <p className="text-[15px] italic leading-relaxed">{series.premise}</p>
            <p className={note}>
              {series.seasons.map((n) => `Season ${n}`).join(' · ')} · {series.facts}
            </p>
            {mineHere && (
              <div className="rounded-lg bg-[#130B1F] px-3 py-2">
                {renaming?.series === series.id ? (
                  <div className="flex gap-2">
                    <input
                      className={input}
                      maxLength={MAX_PLAYER_NAME}
                      value={renaming.name}
                      onChange={(e) => setRenaming({ series: series.id, name: e.target.value })}
                    />
                    <button
                      className={quietButton}
                      disabled={!renaming.name.trim()}
                      onClick={async () => {
                        await supabase.rpc('rename_character', { p_series: series.id, p_name: renaming.name.trim() });
                        setRenaming(null);
                        load();
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px]">
                      <span className="text-[#B7A9CC]">You play </span>
                      <span className="font-semibold">{mineHere.name}</span>
                      {mineHere.class && <span className="text-[#B7A9CC]">, {mineHere.class}</span>}
                    </span>
                    <button className={quietButton} onClick={() => setRenaming({ series: series.id, name: mineHere.name })}>
                      CHANGE
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              className={goldButton}
              disabled={!accountName}
              onClick={() => {
                setStartSeries(series.id);
                setView('start');
              }}
            >
              START A PARTY
            </button>
          </div>
        );
      })}
      <button className={`w-full ${quietButton} py-2.5 font-[Cinzel] font-bold`} onClick={() => setView('invite')}>
        I HAVE AN INVITE
      </button>

      <InstallGuide />
      <Notifications />

      <div className={`${card} mt-6`}>
        {editingName === null ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px]">
              <span className="font-semibold">Your Mythios name:</span> {accountName || '…'}
            </span>
            <button className={quietButton} onClick={() => setEditingName(accountName)}>
              CHANGE
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input className={input} maxLength={MAX_PLAYER_NAME} value={editingName} onChange={(e) => setEditingName(e.target.value)} />
            <button
              className={quietButton}
              disabled={!editingName.trim()}
              onClick={async () => {
                await supabase.from('profiles').update({ display_name: editingName.trim() }).eq('id', userId);
                setEditingName(null);
                load();
              }}
            >
              SAVE
            </button>
          </div>
        )}
        <button className={quietButton} onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
      <p className="text-center text-[14px] text-[#8B7A9E]">{CREDIT_LINE}</p>
    </div>
  );
}

// After opening the email link: choose a new password.
function NewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={card}>
      <h2 className={`${heading} text-[17px]`}>Choose a new password</h2>
      <input
        className={input}
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <ErrorLine text={error} />
      <button
        className={goldButton}
        disabled={busy || password.length < 6}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const { error: e } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (e) setError(plainError(e.message));
          else onDone();
        }}
      >
        SAVE
      </button>
    </div>
  );
}

export default function OnlineApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const joinCode = startQuery.get('join');
  const info = useInvite(joinCode);
  const [wantsSignIn, setWantsSignIn] = useState(false);
  const [returning, setReturning] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  let body;
  if (session === undefined) body = <p className="text-center text-[#B7A9CC]">…</p>;
  else if (session && recovering) body = <NewPassword onDone={() => setRecovering(false)} />;
  else if (session) body = <Home session={session} />;
  else if (joinCode && !wantsSignIn)
    body = (
      <InviteCard
        info={info}
        onJoin={() => {
          setIntent('join');
          setWantsSignIn(true);
        }}
      />
    );
  else if (!joinCode && !wantsSignIn) {
    body = (
      <CoverPage
        onGatherFriends={() => {
          setIntent('start');
          setWantsSignIn(true);
        }}
        onSignIn={() => {
          setReturning(true);
          setWantsSignIn(true);
        }}
      />
    );
  } else body = <SignIn returning={returning} />;

  return <Shell>{body}</Shell>;
}
