// Birdie Board Service Worker v20 — no caching, push notifications only
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

// No fetch handler at all — browser handles all requests natively.
// Registering a fetch listener that doesn't call e.respondWith() causes
// iOS Safari PWA to hang with a spinner. Simply omitting the listener
// means all fetches go straight to the network uninterrupted.

self.addEventListener('push', function(e){
  if(!e.data) return;
  var data={};
  try{ data=e.data.json(); }catch(err){ data={notification:{title:'11.5 Emporium',body:e.data.text()}}; }
  var title  =(data.notification&&data.notification.title)||'11.5 Emporium';
  var body   =(data.notification&&data.notification.body)||'';
  var scoreId=(data.data&&data.data.scoreId)||'';
  var badge  ='https://fairwayhq.github.io/CCCC--BB/icons/badge-96.png';
  var url    =APP_URL+(scoreId?'?score='+scoreId:'');
  e.waitUntil(
    self.registration.showNotification(title,{
      body:body, icon:ICON_URL, badge:badge,
      vibrate:[200,100,200], tag:scoreId||'birdie-board',
      requireInteraction:false, data:{url:url}
    })
  );
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||APP_URL;
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url.indexOf('fairwayhq.github.io/CCCC--BB')!==-1){
          list[i].focus(); list[i].navigate(url); return;
        }
      }
      clients.openWindow(url);
    })
  );
});
