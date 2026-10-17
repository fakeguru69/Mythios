// Notifications on this phone (migration 0069; Fake Guru, 17 Oct: "8am"): a word when the day opens at 8:00am, the Day 4
// question of when the party can meet, the Gathering's time, and a reminder before it. Web Push: the phone asks once,
// and its subscription is kept on the server. On an iPhone it works only once the game is on the home screen.
import { useEffect, useState } from 'react';
import { supabase, plainError } from './supabaseClient';
import { card, ErrorLine, goldButton, heading, note, quietButton } from './ui';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const isIPhone = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const keyBytes = (b64: string) => {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

type State = 'checking' | 'iphone-install' | 'unsupported' | 'blocked' | 'off' | 'on';

export default function Notifications() {
  const [state, setState] = useState<State>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!supported()) return setState(isIPhone() && !isStandalone() ? 'iphone-install' : 'unsupported');
      if (Notification.permission === 'denied') return setState('blocked');
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub && Notification.permission === 'granted' ? 'on' : 'off');
    })().catch(() => setState('unsupported'));
  }, []);

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'blocked' : 'off');
        return;
      }
      // The game's public push key; the private half is made and kept on the server only (migration 0070).
      const { data: publicKey } = await supabase.rpc('push_public_key');
      if (!publicKey) throw new Error('Notifications are not ready yet. Try again in a few minutes.');
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey as string) }));
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const { error: e } = await supabase.rpc('save_push_subscription', { p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth });
      if (e) throw e;
      setState('on');
    } catch (e) {
      setError(plainError((e as Error).message ?? 'Something went wrong. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await supabase.rpc('stop_push_subscription', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setState('off');
    } catch (e) {
      setError(plainError((e as Error).message ?? 'Something went wrong. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  if (state === 'checking' || state === 'unsupported') return null;
  return (
    <div className={card} data-notifications={state}>
      <h3 className={`${heading} text-[15px]`}>Notifications</h3>
      <p className="text-[14px]">
        A word at 8:00am when the day opens, the Day 4 question of when you can all meet, the Gathering's time, and a reminder before it begins.
      </p>
      {state === 'iphone-install' && (
        <p className={note}>On an iPhone, put Mythios on your home screen first, then open it from there and turn these on.</p>
      )}
      {state === 'blocked' && <p className={note}>Notifications are blocked for this site. You can allow them again in your browser's settings.</p>}
      {state === 'off' && (
        <button className={goldButton} disabled={busy} onClick={turnOn}>
          TURN ON NOTIFICATIONS
        </button>
      )}
      {state === 'on' && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] text-[#6FD39A]">On for this phone.</span>
          <button className={quietButton} disabled={busy} onClick={turnOff}>
            TURN OFF
          </button>
        </div>
      )}
      <ErrorLine text={error} />
    </div>
  );
}
