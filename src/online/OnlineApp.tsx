// MYTHIOS online: the Mythios intro, sign-in, the series shelf, your characters (one per series), parties, the invite,
// the host letting friends in, Session Zero, the party clock and starting the story (Core Rules §7, §11, §12a).
// A series (Tales of the Dark Moon) has seasons; a party plays one season (Fake Guru, 16 Oct).
// The screens' words are from review-accounts-and-invites.md and the Mythios intro (approved 16 Oct, in onlineText.ts).
// Opened with ?online=1, or by an invite link (?join=CODE). The one-phone demo is unchanged.
import { useCallback, useEffect, useState } from 'react';
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
import OnlineDay from './OnlineDay';
import OnlineChest from './OnlineChest';
import OnlineStore from './OnlineStore';
import { Shell, ErrorLine, card, input, goldButton, quietButton, heading, note } from './ui';

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

function useInvite(code: string | null) {
  const [info, setInfo] = useState<InviteCardInfo | null | undefined>(undefined);
  useEffect(() => {
    if (!code) return;
    supabase.rpc('invite_card', { p_invite_code: code }).then(({ data }) => setInfo((data as InviteCardInfo[] | null)?.[0] ?? null));
  }, [code]);
  return info;
}

// Screen 1: the invite (review §1), and what it says when the party can no longer be joined (§3).
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
      <p className="text-[12px] text-[#8B7A9E]">{CREDIT_LINE}</p>
    </div>
  );
}

// Screen 2 and 3: sign in (review §1): Google (once switched on in Supabase), or email and a password. No Apple (Fake Guru, 16 Oct).
function SignIn() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'in' | 'up'>('up');
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
      {!open && providers.google && (
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
            className="w-full text-[13px] text-[#B7A9CC] underline"
            onClick={() => {
              setMode(mode === 'in' ? 'up' : 'in');
              setError(null);
            }}
          >
            {mode === 'in' ? 'New here? Make an account' : 'Have an account? Sign in'}
          </button>
          {mode === 'in' && (
            <button className="w-full text-[13px] text-[#B7A9CC] underline" onClick={() => setForgot('asking')}>
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
        <button className="flex-1 rounded-lg bg-[#D4B876] px-3 py-2 font-[Cinzel] font-bold text-[12px] text-[#130B1F]" onClick={onYes}>
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
  const [playingDay, setPlayingDay] = useState(false);
  const [inChest, setInChest] = useState(false);
  const [inStore, setInStore] = useState(false);

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
  const chatOpen = !!party.day1_opens_at && Date.now() >= new Date(party.day1_opens_at).getTime() + 86400000;

  // The Seeker Chest (from the party page, or from the day's fragment; back goes where you came from).
  if (inChest) return <OnlineChest partyId={party.id} onClose={() => setInChest(false)} />;

  // The Store and your Relics (from the party page, or from a card set aside; back goes where you came from).
  if (inStore) {
    return (
      <OnlineStore
        partyId={party.id}
        myClass={me.class}
        friends={approved.filter((r) => r.user_id !== userId && r.session_zero_done_at).map((r) => ({ id: r.user_id, name: r.character_name }))}
        onClose={() => setInStore(false)}
      />
    );
  }

  // Today's chapter, from the server (the days online).
  if (playingDay) {
    return (
      <OnlineDay
        partyId={party.id}
        friends={approved.filter((r) => r.user_id !== userId).map((r) => r.character_name)}
        partySize={approved.length}
        myClass={me.class}
        birthplace={me.birthplace ?? null}
        grandparent={me.grandparent_name ?? null}
        onClose={() => {
          setPlayingDay(false);
          load();
        }}
        onOpenChest={() => setInChest(true)}
        onOpenStore={() => setInStore(true)}
      />
    );
  }

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

  const partyList = (
    <ul className="space-y-1.5">
      {approved.map((r) => (
        <li key={r.user_id} className="flex items-center justify-between gap-2">
          <span className="text-[15px]">
            {r.user_id === userId ? 'You' : r.character_name}
            {r.user_id === party.host_id ? ' (host)' : ''}
            <span className="text-[#B7A9CC]"> — {r.ready ? 'ready' : 'choosing'}</span>
          </span>
          {isHost && r.user_id !== userId && (
            <button className={quietButton} onClick={() => setConfirm({ kind: 'remove', user: r.user_id, name: r.character_name })}>
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-4">
      {back}

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

      {/* Screen 6 (a friend) or Screen 4 (the host): the waiting room. */}
      <div className={card}>
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
        {partyList}
        {!isHost && (
          <p className="text-[15px] pt-1">{!started ? `The road opens when ${host} says so.` : beforeDayOne ? doorLine : ''}</p>
        )}
        {isHost && started && beforeDayOne && <p className="text-[15px] pt-1">{doorLine}</p>}
      </div>

      {/* Once Day 1 has opened: today's chapter. */}
      {started && !beforeDayOne && me.session_zero_done_at && (
        <div className={`${card} border-[#D4B876]/60`}>
          <h3 className={`${heading} text-[15px]`}>Today</h3>
          <button className={goldButton} onClick={() => setPlayingDay(true)}>
            OPEN TODAY'S CHAPTER
          </button>
          <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={() => setInChest(true)}>
            🕯️ SEEKER CHEST
          </button>
          <button className={`w-full ${quietButton} py-2 font-[Cinzel] font-bold`} onClick={() => setInStore(true)}>
            THE STORE
          </button>
        </div>
      )}

      {/* The party chat opens when the party assembles on Day 2 (Fake Guru, 16 Oct); the server enforces it. */}
      {chatOpen && <PartyChat partyId={party.id} userId={userId} members={members} />}

      {isHost && !me.session_zero_done_at && (
        <div className={card}>
          <p className="text-[15px]">Your own character comes first.</p>
          <button className={goldButton} onClick={() => setDoingSessionZero(true)}>
            BEGIN
          </button>
        </div>
      )}

      {isHost && pending.length > 0 && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Asking to join</h3>
          {pending.map((r) => (
            <div key={r.user_id} className="flex items-center justify-between gap-2">
              <span className="text-[15px]">{r.character_name}</span>
              <span className="flex gap-2">
                <button
                  className="rounded-lg bg-[#D4B876] px-3 py-1.5 font-[Cinzel] font-bold text-[12px] text-[#130B1F] disabled:opacity-50"
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

      {/* Screen 3 of the host's path: the invite. */}
      {isHost && !full && !setOff && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Send this to your friends.</h3>
          <p className="break-all text-[13px] text-[#B7A9CC]">{inviteLink(party.invite_code)}</p>
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
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

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
        <InviteCard
          info={info}
          onJoin={
            accountName
              ? async () => {
                  setJoinError(null);
                  const { data, error } = await supabase.rpc('request_join', { p_invite_code: joinCode, p_character_name: accountName });
                  if (error) return setJoinError(plainError(error.message));
                  clearJoinFromUrl();
                  setJoinCode(null);
                  setOpenParty(data as string);
                }
              : undefined
          }
        />
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
      <p className="text-center text-[12px] text-[#8B7A9E]">{CREDIT_LINE}</p>
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
  else if (joinCode && !wantsSignIn) body = <InviteCard info={info} onJoin={() => setWantsSignIn(true)} />;
  else if (!joinCode && !wantsSignIn) {
    // The first screen: the Mythios intro, then the shelf (Fake Guru, 16 Oct; review §2 Screen 1's buttons).
    body = (
      <div className="space-y-5">
        <div className="space-y-3 pt-2">
          <p className="font-['Cormorant_Garamond'] text-[21px] leading-snug italic text-[#F4F1F8]">{MYTHIOS_INTRO.opener}</p>
          <p className={`${heading} text-[17px]`}>{MYTHIOS_INTRO.name}</p>
          {MYTHIOS_INTRO.lines.map((line) => (
            <p key={line} className="text-[15px] leading-relaxed text-[#D9D1E6]">
              {line}
            </p>
          ))}
        </div>
        {SERIES.map((series) => (
          <div key={series.id} className={`${card} border-[#D4B876]/50`}>
            <p className={`${note} tracking-[1px] uppercase`}>A Mythios series</p>
            <h2 className={`${heading} text-[20px]`}>{series.title}</h2>
            <p className="text-[15px] italic leading-relaxed">{series.premise}</p>
            <p className={note}>
              {series.seasons.map((n) => `Season ${n}`).join(' · ')} · {series.facts}
            </p>
          </div>
        ))}
        <p className="text-center text-[15px] text-[#E5C158]">{MYTHIOS_INTRO.call}</p>
        <button className={goldButton} onClick={() => setWantsSignIn(true)}>
          START A PARTY
        </button>
        <button className={`w-full ${quietButton} py-2.5 font-[Cinzel] font-bold`} onClick={() => setWantsSignIn(true)}>
          I HAVE AN INVITE
        </button>
        <p className="text-center text-[12px] text-[#8B7A9E]">{CREDIT_LINE}</p>
      </div>
    );
  } else body = <SignIn />;

  return <Shell>{body}</Shell>;
}
