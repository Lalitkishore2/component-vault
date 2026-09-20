// Component Vault Service Worker - Offline PWA Cache
const CACHE_NAME = 'component-vault-v4.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/design-tokens.css',
  './css/layout.css',
  './css/components.css',
  './js/sample-data.js',
  './js/firebase-config.js',
  './js/auth.js',
  './js/store.js',
  './js/jspdf.umd.min.js',
  './js/jspdf.plugin.autotable.min.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/white-icon.svg',
  './assets/black-icon.svg',
  './assets/ds18b20.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Handle Firebase/Google Auth/Firestore API requests over live network
  if (url.origin.includes('firebase') || url.origin.includes('googleapis') || url.origin.includes('gstatic') || url.origin.includes('firestore')) {
    return;
  }

  // Network-First for HTML navigation AND code assets (JS, CSS)
  // Ensures all devices immediately run the latest sync engine, bug fixes, and styles
  const isCodeAsset = request.destination === 'script' || 
                      request.destination === 'style' || 
                      url.pathname.endsWith('.js') || 
                      url.pathname.endsWith('.css');

  if (request.mode === 'navigate' || isCodeAsset) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then(cached => cached || (request.mode === 'navigate' ? caches.match('./index.html') : null)))
    );
    return;
  }

  // Stale-While-Revalidate for non-code static assets (images, fonts, icons)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
