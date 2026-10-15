// Multiplayer step 1: signing in, making a party, the invite link, the host letting friends in (Core Rules §12a).
// Opened with ?online=1, or by an invite link (?join=CODE). The one-phone demo is unchanged.
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  supabase,
  plainError,
  MAX_PLAYER_NAME,
  MAX_PARTY_NAME,
  MAX_PARTY_SIZE,
  type PartyRow,
  type MemberRow,
} from './supabaseClient';

const params = new URLSearchParams(window.location.search);
const inviteLink = (code: string) => `${window.location.origin}/?join=${code}`;

// Shared look: the game's night palette and Cinzel headings.
const card = 'rounded-2xl bg-[#1E1232] border border-[#3A2555] p-4 space-y-3';
const input =
  'w-full rounded-lg bg-[#130B1F] border border-[#3A2555] px-3 py-2 text-[15px] text-[#F4F1F8] placeholder-[#8B7A9E] focus:outline-none focus:border-[#D4B876]';
const goldButton =
  'w-full rounded-lg bg-[#D4B876] hover:bg-[#E5C158] disabled:opacity-50 px-3 py-2 font-[Cinzel] font-bold text-[13px] text-[#130B1F] transition';
const quietButton =
  'rounded-lg border border-[#3A2555] hover:border-[#D4B876] px-3 py-1.5 text-[13px] text-[#B7A9CC] transition';
const heading = "font-['Cinzel'] font-bold text-[#E5C158]";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#130B1F] text-[#F4F1F8] font-sans">
      <div className="max-w-[440px] mx-auto px-4 py-6 space-y-4">
        <h1 className={`${heading} text-[22px] text-center`}>Tales of the Dark Moon</h1>
        {children}
      </div>
    </div>
  );
}

function ErrorLine({ text }: { text: string | null }) {
  return text ? <p className="text-[13px] text-[#F08A8A]">{text}</p> : null;
}

// The invite page's heading and offer (Core Rules §12a, "The invite page").
function InviteHeader({ code }: { code: string }) {
  const [info, setInfo] = useState<{ party_name: string; host_name: string; open: boolean } | null | undefined>(undefined);
  useEffect(() => {
    supabase.rpc('invite_info', { p_invite_code: code }).then(({ data }) => setInfo(data?.[0] ?? null));
  }, [code]);
  return (
    <div className={card}>
      <h2 className={`${heading} text-[17px]`}>Join the adventure in Tales of the Dark Moon</h2>
      {info === undefined ? null : info && info.open ? (
        <p className="text-[15px]">
          {info.host_name} asks you to join <span className="text-[#E5C158]">{info.party_name}</span>.
        </p>
      ) : (
        <p className="text-[15px] text-[#F08A8A]">This invite no longer works. Ask for a new link.</p>
      )}
      <p className="text-[14px] text-[#B7A9CC]">Six weeks. About five minutes a day, and one evening a week. Free.</p>
      <p className="text-[12px] text-[#8B7A9E]">A fake guru game. The story is told by Mythios AI.</p>
    </div>
  );
}

function SignIn() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    if (mode === 'in') {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (e) setError(plainError(e.message));
    } else {
      const trimmed = name.trim();
      if (trimmed.length < 1 || trimmed.length > MAX_PLAYER_NAME) {
        setError(`Your name is 1 to ${MAX_PLAYER_NAME} characters.`);
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
        <p className="text-[15px]">We sent a link to {email.trim()}. Open it to finish making your account.</p>
      </div>
    );
  }
  return (
    <div className={card}>
      <h2 className={`${heading} text-[16px]`}>{mode === 'in' ? 'Sign in' : 'Make an account'}</h2>
      {mode === 'up' && (
        <input
          className={input}
          placeholder={`Your name (1 to ${MAX_PLAYER_NAME} characters)`}
          maxLength={MAX_PLAYER_NAME}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        {mode === 'in' ? 'SIGN IN' : 'MAKE MY ACCOUNT'}
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
    </div>
  );
}

function AskToJoin({ code, accountName, onAsked }: { code: string; accountName: string; onAsked: (partyId: string) => void }) {
  // The character name starts as the account name and can be changed (Core Rules §12a, "Two names").
  const [characterName, setCharacterName] = useState(accountName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ask = async () => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc('request_join', { p_invite_code: code, p_character_name: characterName.trim() });
    setBusy(false);
    if (e) setError(plainError(e.message));
    else onAsked(data as string);
  };
  return (
    <div className={card}>
      <label className="block text-[13px] text-[#B7A9CC]">Your name in this party</label>
      <input className={input} maxLength={MAX_PLAYER_NAME} value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
      <ErrorLine text={error} />
      <button className={goldButton} disabled={busy || !characterName.trim()} onClick={ask}>
        ASK TO JOIN
      </button>
    </div>
  );
}

function MakeParty({ accountName, onMade }: { accountName: string; onMade: (partyId: string) => void }) {
  const [partyName, setPartyName] = useState('');
  const [characterName, setCharacterName] = useState(accountName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const make = async () => {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.rpc('create_party', { p_name: partyName.trim(), p_character_name: characterName.trim() });
    setBusy(false);
    if (e) setError(plainError(e.message));
    else onMade(data as string);
  };
  return (
    <div className={card}>
      <h2 className={`${heading} text-[16px]`}>Make a party</h2>
      <input
        className={input}
        placeholder={`The party's name (1 to ${MAX_PARTY_NAME} characters)`}
        maxLength={MAX_PARTY_NAME}
        value={partyName}
        onChange={(e) => setPartyName(e.target.value)}
      />
      <label className="block text-[13px] text-[#B7A9CC]">Your name in this party</label>
      <input className={input} maxLength={MAX_PLAYER_NAME} value={characterName} onChange={(e) => setCharacterName(e.target.value)} />
      <ErrorLine text={error} />
      <button className={goldButton} disabled={busy || !partyName.trim() || !characterName.trim()} onClick={make}>
        MAKE THE PARTY
      </button>
    </div>
  );
}

function PartyPage({ partyId, userId, onBack }: { partyId: string; userId: string; onBack: () => void }) {
  const [party, setParty] = useState<PartyRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const load = useCallback(async () => {
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('parties').select('id,name,host_id,invite_code,invite_open').eq('id', partyId).maybeSingle(),
      supabase.from('party_members').select('party_id,user_id,character_name,status,joined_at,session_zero_done_at').eq('party_id', partyId),
    ]);
    setParty((p as PartyRow) ?? null);
    setMembers((m as MemberRow[]) ?? []);
    setMyStatus(((m as MemberRow[]) ?? []).find((r) => r.user_id === userId)?.status ?? null);
  }, [partyId, userId]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 5000); // the host sees new requests without reloading
    return () => window.clearInterval(t);
  }, [load]);

  const act = async (fn: string, args: Record<string, unknown>) => {
    setError(null);
    const { error: e } = await supabase.rpc(fn, args);
    if (e) setError(plainError(e.message));
    await load();
  };

  if (myStatus === 'pending') {
    return (
      <div className={card}>
        <p className="text-[15px]">You asked to join. The host lets each friend in; this page will change when they do.</p>
        <button className={quietButton} onClick={onBack}>
          Back
        </button>
      </div>
    );
  }
  if (!party) {
    return (
      <div className={card}>
        <p className="text-[15px] text-[#B7A9CC]">{myStatus === 'removed' || myStatus === 'left' ? 'You are no longer in this party.' : 'Loading…'}</p>
        <button className={quietButton} onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const isHost = party.host_id === userId;
  // The party list: the host, then the friends in the order they finished Session Zero (§12a).
  // Session Zero is not built yet, so friends who have not finished it follow in the order they joined.
  const order = (r: MemberRow) => (r.user_id === party.host_id ? '0' : `1${r.session_zero_done_at ?? '9'}${r.joined_at}`);
  const approved = members.filter((r) => r.status === 'approved').sort((a, b) => order(a).localeCompare(order(b)));
  const pending = members.filter((r) => r.status === 'pending').sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  const full = approved.length >= MAX_PARTY_SIZE;

  return (
    <div className="space-y-4">
      <button className={quietButton} onClick={onBack}>
        ← Your parties
      </button>
      <div className={card}>
        <h2 className={`${heading} text-[18px]`}>{party.name}</h2>
        <p className="text-[13px] text-[#B7A9CC]">
          {approved.length} of {MAX_PARTY_SIZE} friends
        </p>
        <ul className="space-y-2">
          {approved.map((r) => (
            <li key={r.user_id} className="flex items-center justify-between gap-2">
              <span className="text-[15px]">
                {r.character_name}
                {r.user_id === party.host_id && <span className="ml-2 text-[12px] text-[#E5C158]">host</span>}
                {r.user_id === userId && <span className="ml-2 text-[12px] text-[#8B7A9E]">you</span>}
              </span>
              {isHost && r.user_id !== userId && (
                <button className={quietButton} onClick={() => act('set_member_status', { p_party: party.id, p_user: r.user_id, p_status: 'removed' })}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isHost && pending.length > 0 && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Asking to join</h3>
          {pending.map((r) => (
            <div key={r.user_id} className="flex items-center justify-between gap-2">
              <span className="text-[15px]">{r.character_name}</span>
              <span className="flex gap-2">
                <button
                  className="rounded-lg bg-[#D4B876] px-3 py-1.5 font-[Cinzel] font-bold text-[12px] text-[#130B1F] disabled:opacity-50"
                  disabled={full}
                  onClick={() => act('set_member_status', { p_party: party.id, p_user: r.user_id, p_status: 'approved' })}
                >
                  LET IN
                </button>
                <button className={quietButton} onClick={() => act('set_member_status', { p_party: party.id, p_user: r.user_id, p_status: 'removed' })}>
                  Turn away
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {isHost && (
        <div className={card}>
          <h3 className={`${heading} text-[15px]`}>Invite link</h3>
          {party.invite_open && !full ? (
            <>
              <p className="break-all text-[13px] text-[#B7A9CC]">{inviteLink(party.invite_code)}</p>
              <div className="flex gap-2">
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
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <button className={quietButton} onClick={() => act('new_invite_code', { p_party: party.id })}>
                  New link
                </button>
              </div>
              <p className="text-[12px] text-[#8B7A9E]">A new link stops the old one working.</p>
            </>
          ) : (
            <p className="text-[13px] text-[#B7A9CC]">{full ? 'The party is full.' : 'The invite is closed.'}</p>
          )}
        </div>
      )}

      <ErrorLine text={error} />
      <div className={card}>
        {!confirmLeave ? (
          <button className={quietButton} onClick={() => setConfirmLeave(true)}>
            Leave this party
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[14px]">If you leave, you cannot come back to this story.</p>
            <div className="flex gap-2">
              <button
                className={quietButton}
                onClick={async () => {
                  await act('leave_party', { p_party: party.id });
                  onBack();
                }}
              >
                Leave
              </button>
              <button className={quietButton} onClick={() => setConfirmLeave(false)}>
                Stay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Home({ session }: { session: Session }) {
  const userId = session.user.id;
  const [accountName, setAccountName] = useState('');
  const [rows, setRows] = useState<(MemberRow & { parties: { name: string } | null })[]>([]);
  const [openParty, setOpenParty] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(params.get('join'));

  const load = useCallback(async () => {
    const [{ data: prof }, { data: mine }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
      supabase
        .from('party_members')
        .select('party_id,user_id,character_name,status,joined_at,session_zero_done_at,parties(name)')
        .eq('user_id', userId)
        .in('status', ['approved', 'pending']),
    ]);
    setAccountName(prof?.display_name ?? '');
    setRows((mine as unknown as (MemberRow & { parties: { name: string } | null })[]) ?? []);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const leaveInvite = () => {
    setJoinCode(null);
    window.history.replaceState(null, '', `${window.location.pathname}?online=1`);
  };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-[#B7A9CC]">Signed in as {accountName || '…'}</span>
        <button className={quietButton} onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>

      {joinCode && accountName && (
        <>
          <InviteHeader code={joinCode} />
          <AskToJoin
            code={joinCode}
            accountName={accountName}
            onAsked={(id) => {
              leaveInvite();
              setOpenParty(id);
            }}
          />
          <button className={quietButton} onClick={leaveInvite}>
            Not now
          </button>
        </>
      )}

      {!joinCode && (
        <>
          <div className={card}>
            <h2 className={`${heading} text-[16px]`}>Your parties</h2>
            {rows.length === 0 && <p className="text-[14px] text-[#B7A9CC]">None yet. Make one, or open a friend's invite link.</p>}
            {rows.map((r) => (
              <button
                key={r.party_id}
                className="w-full flex items-center justify-between rounded-lg border border-[#3A2555] hover:border-[#D4B876] px-3 py-2 text-left"
                onClick={() => setOpenParty(r.party_id)}
              >
                <span className="text-[15px]">{r.parties?.name ?? 'A party'}</span>
                <span className="text-[12px] text-[#8B7A9E]">{r.status === 'pending' ? 'waiting for the host' : r.character_name}</span>
              </button>
            ))}
          </div>
          {accountName && <MakeParty accountName={accountName} onMade={(id) => setOpenParty(id)} />}
        </>
      )}
    </div>
  );
}

export default function OnlineApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  const joinCode = params.get('join');

  return (
    <Shell>
      {session === undefined ? (
        <p className="text-center text-[#B7A9CC]">Loading…</p>
      ) : session ? (
        <Home session={session} />
      ) : (
        <>
          {joinCode && <InviteHeader code={joinCode} />}
          <SignIn />
        </>
      )}
    </Shell>
  );
}
