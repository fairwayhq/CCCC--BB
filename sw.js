// Birdie Board Service Worker v19 — no caching, push notifications only
const CACHE_VERSION = 'emporium-v30';
const APP_URL = 'https://fairwayhq.github.io/CCCC--BB';
const ICON_URL = 'https://fairwayhq.github.io/CCCC--BB/icons/icon-512.png';

self.addEventListener('install', function(e){
  // Install immediately, don't wait for old SW to go idle
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    // Wipe every cache from every previous version
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      // Take control of ALL open tabs/windows immediately
      return self.clients.claim();
    }).then(function(){
      // Tell every open client to reload so they get fresh HTML right now
      return self.clients.matchAll({type:'window', includeUncontrolled:true});
    }).then(function(clientList){
      clientList.forEach(function(client){
        client.navigate(client.url);
      });
    })
  );
});

// Never intercept fetches — let browser go direct to network every time
self.addEventListener('fetch', function(e){
  return;
});

self.addEventListener('push', function(e){
  if(!e.data) return;
  var data = {};
  try { data = e.data.json(); } catch(err) { data = {notification:{title:'11.5 Emporium',body:e.data.text()}}; }
  var title   = (data.notification && data.notification.title) || '11.5 Emporium';
  var body    = (data.notification && data.notification.body)  || '';
  var scoreId = (data.data && data.data.scoreId) || '';
  var badgeUrl = 'https://fairwayhq.github.io/CCCC--BB/icons/badge-96.png';
  var url      = APP_URL + (scoreId ? '?score=' + scoreId : '');
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
