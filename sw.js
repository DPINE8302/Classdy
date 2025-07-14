
// Classdy Service Worker
const CACHE_NAME = 'classdy-cache-v1';

// On install, pre-cache the app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    })
  );
});

// On activate, clean up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// On fetch, use a stale-while-revalidate strategy.
self.addEventListener('fetch', event => {
  // Ignore non-GET requests and requests to Chrome extensions.
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(responseFromCache => {
        // Fetch from the network.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the fetch is successful, update the cache.
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Return the response from cache if it exists, otherwise wait for the network.
        return responseFromCache || fetchPromise;
      });
    })
  );
});