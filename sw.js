// Birdie Board Service Worker v9
const CACHE = 'emporium-v10';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
});

self.addEventListener('fetch', function(e){
  // Network first for HTML, cache fallback for assets
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
  }
});

// Handle incoming push notifications
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = {};
  try { data = event.data.json(); } catch(e) { data = { notification: { title: 'Birdie Board', body: event.data.text() } }; }
  var title = (data.notification && data.notification.title) || 'Birdie Board';
  var body = (data.notification && data.notification.body) || '';
  var options = {
    body: body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: 'https://fairwayhq.github.io/CCCC--BB' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || 'https://fairwayhq.github.io/CCCC--BB';
  event.waitUntil(clients.openWindow(url));
});
