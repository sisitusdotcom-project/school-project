const CACHE_NAME = 'musada-cache-v20261116';
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      event.respondWith(
        fetch(req, { cache: 'no-cache' })
          .catch(() => caches.match(req).then((res) => res || new Response('Anda sedang offline.')))
      );
      return;
    }
  }
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((res) => res || new Response('Anda sedang offline.')))
  );
});