// Birdie Board Service Worker v23
// Push notification handling identical to working v17, no page caching
const APP_URL = 'https://fairwayhq.github.io/CCCC--BB';
const ICON_URL = 'https://fairwayhq.github.io/CCCC--BB/icons/icon-512.png';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// No fetch handler - avoids stale cache / white screen issues.
// Push notifications do not require a fetch handler to work.

self.addEventListener('push', function(e){
  if(!e.data) return;
  var data = {};
  try { data = e.data.json(); } catch(err) { data = {notification:{title:'11.5 Emporium',body:e.data.text()}}; }
  var title   = (data.notification && data.notification.title) || '11.5 Emporium';
  var body    = (data.notification && data.notification.body)  || '';
  var scoreId = (data.data && data.data.scoreId) || '';
  var badgeUrl = 'https://fairwayhq.github.io/CCCC--BB/icons/badge-96.png';
  var url     = APP_URL + (scoreId ? '?score=' + scoreId : '');
  e.waitUntil(
    self.registration.showNotification(title, {
      body:    body,
      icon:    ICON_URL,
      badge:   badgeUrl,
      vibrate: [200, 100, 200],
      tag:     scoreId || 'birdie-board',
      requireInteraction: false,
      data:    { url: url }
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || APP_URL;
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clientList){
      for(var i=0; i<clientList.length; i++){
        if(clientList[i].url.indexOf('fairwayhq.github.io/CCCC--BB') !== -1){
          clientList[i].focus();
          clientList[i].navigate(url);
          return;
        }
      }
      clients.openWindow(url);
    })
  );
});
