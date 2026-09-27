// Service Worker untuk PWA SD Muhammadiyah 1 Sedati
const CACHE_NAME = 'musada-cache-v1';

self.addEventListener('install', function(event) {
  // Hanya melakukan instalasi SW tanpa perlu mem-cache semua file (karena kita ingin user selalu dapat konten terbaru)
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Pass-through handler: hanya meneruskan request ke jaringan, 
  // memenuhi syarat minimal Google Chrome untuk PWA.
  event.respondWith(fetch(event.request).catch(function() {
    return new Response('Anda sedang offline.');
  }));
});
