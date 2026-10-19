// Cache only same-origin, public static assets within this deployment's scope.
// Works at / locally and at /StudyBuddy/ when hosted on GitHub Pages.
const BASE_PATH = new URL(self.registration.scope).pathname;
const CACHE_NAME = 'studybuddy-shell-scoped-v2';
const STATIC_PATHS = [BASE_PATH, `${BASE_PATH}favicon.svg`];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_PATHS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('studybuddy-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const safeAsset = url.pathname === BASE_PATH ||
    url.pathname === `${BASE_PATH}index.html` ||
    url.pathname === `${BASE_PATH}favicon.svg` ||
    url.pathname.startsWith(`${BASE_PATH}_astro/`);
  if (!safeAsset) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
