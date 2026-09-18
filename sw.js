// Component Vault Service Worker - Offline PWA Cache
const CACHE_NAME = 'component-vault-v1.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/design-system.css',
  './css/layout.css',
  './css/components.css',
  './js/state.js',
  './js/data.js',
  './js/auth.js',
  './js/cloud-db.js',
  './js/firebase-config.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png'
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
  if (url.origin.includes('firebase') || url.origin.includes('googleapis') || url.origin.includes('gstatic')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Stale-While-Revalidate for local app shell
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
      }).catch((err) => {
        console.warn('[ServiceWorker] Offline fetch fallback for:', request.url);
        // If navigation request fails, return cached index.html
        if (request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
