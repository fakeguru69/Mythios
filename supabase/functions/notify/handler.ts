// The "notify" server function (migration 0069): run every five minutes. It asks the database what is due
// (notify_due: the 8:00am line, the poll, the time chosen, the reminder), then sends every waiting notification to each
// friend's phones by Web Push, signed with the game's VAPID key (made here once: migration 0070), and marks phones that have gone.
// Calling it does nothing but send what is already due, so it needs no sign-in.
// Plain fetch and an injected Web Push library, so the same code runs on Supabase (index.ts) and in the local test.

export interface NotifyEnv {
  url: string; // the project's address
  serviceKey: string;
}

export interface WebPushLib {
  generateVAPIDKeys(): { publicKey: string; privateKey: string };
  setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  sendNotification(
    sub: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    options?: { TTL?: number }
  ): Promise<unknown>;
}

async function rpc(env: NotifyEnv, fn: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${env.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.message) || `rpc ${fn} failed`);
  return data;
}

type Row = { id: number; endpoint: string; p256dh: string; auth: string; title: string; body: string; tag: string; party_id?: string | null };

// Where tapping the alert leads (24 Oct): the party it is about, and the screen, named by the alert's tag
// (pwa/sw.js opens it; src/online/alertLink.ts reads it).
export function alertUrl(r: Pick<Row, 'tag' | 'party_id'>): string {
  if (!r.party_id) return '/';
  return `/?online=1&party=${encodeURIComponent(r.party_id)}&go=${encodeURIComponent(r.tag || 'day')}`;
}

// The key pair, made here the first time and kept only on the server (migration 0070).
async function vapidKeys(env: NotifyEnv, webpush: WebPushLib) {
  let keys = (await rpc(env, 'push_vapid')) ?? {};
  if (!keys.vapid_public || !keys.vapid_private) {
    const made = webpush.generateVAPIDKeys();
    await rpc(env, 'push_vapid_init', { p_public: made.publicKey, p_private: made.privateKey });
    keys = (await rpc(env, 'push_vapid')) ?? {};
  }
  return keys;
}

export async function runNotify(env: NotifyEnv, webpush: WebPushLib): Promise<{ due: number; sent: number; gone: number; failed: number }> {
  const keys = await vapidKeys(env, webpush);
  const due = (await rpc(env, 'notify_due')) ?? 0;
  // push_batch_for_links (migration 0113) adds the party; the older push_batch is the fallback.
  let rows: Row[];
  try {
    rows = (await rpc(env, 'push_batch_for_links')) ?? [];
  } catch {
    rows = (await rpc(env, 'push_batch')) ?? [];
  }
  if (!rows.length) {
    await rpc(env, 'push_done', { p_ids: [], p_gone: [] });
    return { due, sent: 0, gone: 0, failed: 0 };
  }
  webpush.setVapidDetails(keys.vapid_subject || 'https://mythios.vercel.app', keys.vapid_public, keys.vapid_private);
  const done = new Set<number>();
  const gone: string[] = [];
  let failed = 0;
  for (const r of rows) {
    try {
      await webpush.sendNotification(
        { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
        JSON.stringify({ title: r.title, body: r.body, tag: r.tag, url: alertUrl(r) }),
        { TTL: 6 * 3600 }
      );
      done.add(r.id);
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        gone.push(r.endpoint);
        done.add(r.id);
      } else failed++; // left waiting: tried again in five minutes, for up to six hours
    }
  }
  await rpc(env, 'push_done', { p_ids: [...done], p_gone: gone });
  return { due, sent: done.size, gone: gone.length, failed };
}
