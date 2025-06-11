// Service Worker for handling background notifications and offline support
const CACHE_NAME = 'pebbleway-v1';
const urlsToCache = [
  '/ChallengeIt/',
  '/ChallengeIt/index.html',
  '/ChallengeIt/manifest.json',
  '/ChallengeIt/icons/icon-180x180.png',
  '/ChallengeIt/icons/icon-192x192.png',
  '/ChallengeIt/icons/icon-512x512.png',
  '/ChallengeIt/css/styles.css',
  '/ChallengeIt/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/ChallengeIt/icons/icon-192x192.png',
    badge: '/ChallengeIt/icons/icon-180x180.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Goals',
        icon: '/ChallengeIt/icons/icon-180x180.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PebbleWay', options)
  );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/ChallengeIt/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/ChallengeIt/');
                }
            })
        );
    }
}); 