/**
 * Service worker: offline, and the reason the app can be installed.
 *
 * Installing matters for more than convenience. Safari wipes script-writable
 * storage — localStorage, IndexedDB, caches — after seven days without a visit
 * to a *website*, but exempts a web app added to the Home Screen. So the
 * service worker is part of how progress survives, not just how the app loads
 * on a train.
 *
 * Strategy per request type:
 *   navigations  → network first, cached shell as the fallback, so a new
 *                  deploy is picked up but going offline still opens the app
 *   own assets   → cache first, since every build ships new filenames-by-content
 *                  is not in play here and the shell is revalidated above
 *   everything else (fonts, third parties) → network, cached opportunistically
 *
 * Scope is whatever directory this file is served from, which is what makes it
 * work unchanged at a GitHub Pages project path like /learning-app/.
 */
/* Replaced at build time with a hash of the bundle. Assets are served
   cache-first and their filenames never change, so a new build has to arrive
   under a new cache name or the old one would be served forever. */
const VERSION = 'recall-os-__BUILD_ID__';
const SHELL = ['./', './index.html', './main.js', './main.css', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      // One bad URL must not fail the whole install, so add them individually.
      await Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== VERSION).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (sameOrigin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) void cache.put(fallbackUrl, response.clone());
    return response;
  } catch {
    return (await cache.match(fallbackUrl)) ?? (await cache.match('./')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok) void cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return hit ?? (await network) ?? Response.error();
}
