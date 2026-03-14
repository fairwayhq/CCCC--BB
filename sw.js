// Birdie Board Service Worker v13
const CACHE = 'emporium-v13';

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
  var title  = (data.notification && data.notification.title) || 'Birdie Board';
  var body   = (data.notification && data.notification.body)  || '';
  var scoreId = (data.data && data.data.scoreId) || '';
  var url = 'https://fairwayhq.github.io/CCCC--BB' + (scoreId ? '?score=' + scoreId : '');
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/CCCC--BB/icons/icon-192.png',
      badge: '/CCCC--BB/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: scoreId || 'birdie-board',
      data: { url: url }
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || 'https://fairwayhq.github.io/CCCC--BB';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(function(clientList){
      // If app is already open, focus it and navigate
      for(var i=0;i<clientList.length;i++){
        if(clientList[i].url.indexOf('fairwayhq.github.io/CCCC--BB')!==-1){
          clientList[i].focus();
          clientList[i].navigate(url);
          return;
        }
      }
      // Otherwise open fresh
      clients.openWindow(url);
    })
  );
});
