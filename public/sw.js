/**
 * Gameboxd Service Worker
 *
 * Strategy:
 *  - Pages (navigations): network first, offline.html as fallback.
 *    Never cached, so deploys are picked up immediately.
 *  - /api/*: network only (always fresh data).
 *  - Static assets (/_next/static, icons, fonts): cache first — they are
 *    content-hashed, so they never change under the same URL.
 *  - Game cover images (IGDB CDN + next/image): cache first with a size cap.
 */

const VERSION = 'gameboxd-v2';
const STATIC_CACHE = `${VERSION}-static`;
const IMAGE_CACHE = `${VERSION}-images`;
const OFFLINE_URL = '/offline.html';
const MAX_IMAGE_ENTRIES = 150;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll([OFFLINE_URL, '/manifest.json', '/icon-192.png', '/icon-512.png'])
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxEntries);
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API calls: always hit the network, never cache
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  // Page navigations: network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Immutable build assets and app icons
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.ico') ||
      url.pathname === '/manifest.json')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Game cover images (IGDB CDN or next/image optimizer)
  if (
    url.hostname === 'images.igdb.com' ||
    (url.origin === self.location.origin && url.pathname.startsWith('/_next/image'))
  ) {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE).then((response) => {
        trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
        return response;
      })
    );
  }
});
