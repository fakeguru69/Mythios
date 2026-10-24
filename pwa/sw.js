// The game's service worker: it lets phones install the game to the home screen, and shows the game's notifications
// (migration 0069: the 8:00am line, the Day 4 poll, the Gathering's time and its reminder; 0089: a friend has come to the
// fire, tag 'fire', so a newer one replaces the older). Tapping one opens the game at the party and screen it is about
// (24 Oct: the link comes with the alert; an open game is told by message and goes there itself, src/online/alertLink.ts).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Tales of the Dark Moon', {
      body: data.body || '',
      tag: data.tag || 'mythios',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const url = (event.notification.data && event.notification.data.url) || '/';
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) {
        open.postMessage({ type: 'open', url });
        return open.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
