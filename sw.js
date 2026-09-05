/* BaaoDash PWA Production Service Worker (sw.js) */
const CACHE_NAME = 'baaodash-pwa-v1';

const STATIC_ASSETS = [
  './BaaoDash_PWA.html',
  './manifest.webmanifest',
  './assets/brand/logo-symbol.svg',
  './assets/brand/logo-primary.svg',
  './assets/brand/icons-sprite.svg'
];

// Install Event: Pre-cache core PWA application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[BaaoDash SW] Pre-caching offline application shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[BaaoDash SW] Asset pre-cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First for static assets, Network-First with cache fallback for dynamic requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and cross-origin analytics
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update in background (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Offline Fallback for HTML documents
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./BaaoDash_PWA.html');
        }
      });
    })
  );
});

// Push Notification Event (Web Push API)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: '⚡ BaaoDash Update',
    body: 'Your delivery status has been updated!',
    icon: './assets/brand/logo-symbol.svg'
  };

  const options = {
    body: data.body,
    icon: data.icon || './assets/brand/logo-symbol.svg',
    badge: './assets/brand/logo-symbol.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || './BaaoDash_PWA.html' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('BaaoDash_PWA.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || './BaaoDash_PWA.html');
      }
    })
  );
});
