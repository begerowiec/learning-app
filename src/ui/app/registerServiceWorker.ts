/**
 * Registers the service worker, in production only.
 *
 * Kept out of the dev server on purpose: a cache-first worker would happily
 * serve yesterday's bundle over a live rebuild, which is a miserable way to
 * spend an afternoon.
 *
 * The path is relative so the same build works at the site root and under a
 * project path like `/learning-app/`, and the scope follows the directory the
 * worker is served from.
 */
export function registerServiceWorker(): void {
  if (!__PROD__) return;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI).href, { scope: './' })
      .then((registration) => {
        // A newer build is already waiting: take it on the next load rather
        // than reloading under the learner mid-answer.
        registration.addEventListener('updatefound', () => {
          registration.installing?.addEventListener('statechange', function onChange(this: ServiceWorker) {
            if (this.state === 'installed') registration.waiting?.postMessage('skip-waiting');
          });
        });
      })
      .catch((error: unknown) => {
        // Offline support is a bonus, never a requirement for booting.
        console.warn('[loop] service worker registration failed', error);
      });
  });
}
