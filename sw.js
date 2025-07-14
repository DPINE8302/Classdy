

// Classdy Service Worker
const CACHE_NAME = 'classdy-cache-v2';
const APP_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg',
    '/index.tsx',
    '/App.tsx',
    '/constants.ts',
    '/holidays.ts',
    '/types.ts',
    '/lib/utils.ts',
    '/lib/secret-data.ts',
    '/lib/chat.ts',
    '/hooks/useMediaQuery.ts',
    '/hooks/useAppData.ts',
    '/hooks/useLocalStorage.ts',
    '/components/Settings.tsx',
    '/components/AddLogModal.tsx',
    '/components/TaskModal.tsx',
    '/components/ChatView.tsx',
    '/components/layout/DesktopNav.tsx',
    '/components/layout/MobileNav.tsx',
    '/components/shared/Modal.tsx',
    '/components/shared/Card.tsx',
    '/components/shared/SubjectManager.tsx',
    '/components/dashboard/Dashboard.tsx',
    '/components/analytics/Overview.tsx',
    '/components/analytics/Analytics.tsx',
    '/components/analytics/ScheduleEditor.tsx',
    '/components/analytics/ArrivalTimeChart.tsx',
    '/components/schedule/ScheduleView.tsx',
    '/components/schedule/DayCard.tsx',
    '/components/schedule/Timeline.tsx'
];


// On install, pre-cache the app shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching all application assets.');
      return cache.addAll(APP_ASSETS);
    }).catch(error => {
      console.error('Failed to cache assets during install:', error);
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
        // Fetch from the network in the background to update the cache.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the fetch is successful, update the cache.
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // The network request failed, probably because of being offline.
            // The cached response (if available) is already being returned.
            console.log('Service Worker: network fetch failed.', err);
        });

        // Return the response from cache if it exists, otherwise wait for the network.
        return responseFromCache || fetchPromise;
      });
    })
  );
});