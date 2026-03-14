// Birdie Board Service Worker v12
const CACHE = 'emporium-v12';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).catch(function(){
        return caches.match(e.request);
      })
    );
  }
});

self.addEventListener('push', function(e){
  if(!e.data) return;
  var data = {};
  try { data = e.data.json(); } catch(err) { data = {notification:{title:'Birdie Board',body:e.data.text()}}; }
  var title = (data.notification && data.notification.title) || 'Birdie Board';
  var body  = (data.notification && data.notification.body)  || '';
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/CCCC--BB/icons/icon-192.png',
      badge: '/CCCC--BB/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: 'https://fairwayhq.github.io/CCCC--BB' }
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || 'https://fairwayhq.github.io/CCCC--BB';
  e.waitUntil(clients.openWindow(url));
});
