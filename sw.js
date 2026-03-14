importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDzqvGD7wPkt5w7B4MgP_Ywb5MMQEwH8ig",
  authDomain: "cobblestone-birdie-board-2c583.firebaseapp.com",
  projectId: "cobblestone-birdie-board-2c583",
  storageBucket: "cobblestone-birdie-board-2c583.firebasestorage.app",
  messagingSenderId: "970129818057",
  appId: "1:970129818057:web:e1210a77b72afb495a6818"
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || '11.5 Emporium Birdie Board', {
    body: body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: self.location.origin }
  });
});

// Open app when notification is tapped
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});

// Cache static assets
const CACHE = 'emporium-v6';
const ASSETS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if(e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).catch(()=>caches.match('./index.html'))));
});
