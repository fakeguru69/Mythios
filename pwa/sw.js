// The game's service worker. Today it only lets phones install the game to the home screen;
// "Your chapter is ready" notifications (push) come in a later step.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
