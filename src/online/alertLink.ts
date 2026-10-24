// Where a tapped notification leads (Phase 0.2, 24 Oct). The notify function sends each alert with a link
// `/?online=1&party=<id>&go=<tag>` (supabase/functions/notify/handler.ts); pwa/sw.js opens that link, or, when the game
// is already open, posts it to the open page. The shelf opens the party (OnlineApp) and the shell opens the screen the
// alert is about (GameShell): the poll and the Gathering's time are in the party panel; everything else is the story.

export type AlertLink = { party: string; go: string };

const EVENT = 'mythios-alert-link';
let pending: AlertLink | null = null;

function parse(url: string): AlertLink | null {
  try {
    const q = new URL(url, window.location.origin).searchParams;
    const party = q.get('party');
    return party ? { party, go: q.get('go') ?? 'day' } : null;
  } catch {
    return null;
  }
}

// The link the game was opened with, once; the address bar is tidied so a reload does not repeat it.
const first = parse(window.location.href);
if (first) {
  pending = first;
  const q = new URLSearchParams(window.location.search);
  q.delete('party');
  q.delete('go');
  const rest = q.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    const d = e.data as { type?: string; url?: string } | null;
    if (d?.type !== 'open' || !d.url) return;
    const link = parse(d.url);
    if (!link) return;
    pending = link;
    window.dispatchEvent(new CustomEvent<AlertLink>(EVENT, { detail: link }));
  });
}

/** The party the last tapped alert is about, without using it up (the shell still needs its screen). */
export function alertParty(): string | null {
  return pending?.party ?? null;
}

/** The screen the alert is about, used up once read by the shell of that party. */
export function takeAlertScreen(party: string): string | null {
  if (!pending || pending.party !== party) return null;
  const go = pending.go;
  pending = null;
  return go;
}

/** Called whenever a notification is tapped while the game is open. */
export function onAlertLink(fn: (link: AlertLink) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<AlertLink>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

/** The panel holds the Day 4 poll and the Gathering's time; every other alert is about the story thread. */
export function alertOpensPanel(go: string): boolean {
  return go === 'poll' || go === 'gathering-time';
}
