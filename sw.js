// Service Worker for PWA with Dynamic Caching
const CACHE_NAME = 'scheduler-pro-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Install event: Activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: Network First, falling back to Cache for HTML; Cache First for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API or external requests normally (or add specific logic)
  if (!url.origin.startsWith(self.location.origin)) {
     return;
  }

  // Strategy for HTML/Navigation: Network First -> Cache
  // This ensures users get the latest version if online, but app works if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategy for Assets (JS, CSS, Images): Cache First -> Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});