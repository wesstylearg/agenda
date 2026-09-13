const CACHE_NAME = 'agenda-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/navigation.css',
  './css/calendar.css',
  './css/forms.css',
  './css/modals.css',
  './css/responsive.css',
  './js/app.js',
  './js/state.js',
  './js/navigation.js',
  './js/storage.js',
  './js/utils.js',
  './js/views/homeView.js',
  './js/views/calendarView.js',
  './js/views/moreView.js',
  './js/subjects/subjectService.js',
  './js/subjects/subjectModal.js',
  './js/subjects/subjectDetailView.js',
  './js/events/eventService.js',
  './js/events/eventModal.js',
  './js/tasks/taskService.js',
  './js/tasks/taskModal.js',
  './js/grades/gradeService.js',
  './js/grades/gradeModal.js',
  './js/calendar/weeklyGrid.js',
  './js/calendar/monthlyGrid.js',
  './js/calendar/agendaList.js',
  './js/settings/settingsView.js',
  './js/notifications/notificationService.js'
];

// Install: Cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache item failed, continuing:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate with network fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension or other non-http schemes
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is navigation (HTML page), return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
