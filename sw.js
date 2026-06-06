// Birdie Board Service Worker v18
const CACHE = 'emporium-v29';
const APP_URL = 'https://fairwayhq.github.io/CCCC--BB';
const ICON_URL = 'https://fairwayhq.github.io/CCCC--BB/icons/icon-512.png';

self.addEventListener('install', function(e){
  // Take over immediately — don't wait for old SW to release
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;}).map(function(k){
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      );
    }).then(function(){
      // Take control of all open clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e){
  // Always go to network for navigation (HTML) requests — never serve stale index.html
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}).catch(function(){
        return caches.match(e.request);
      })
    );
    return;
  }
  // For everything else, network first with cache fallback
  e.respondWith(
    fetch(e.request).catch(function(){
      return caches.match(e.request);
    })
  );
});

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
