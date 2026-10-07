import posthog from 'posthog-js';

export function getPwaErrorContext() {
  const controller = navigator.serviceWorker?.controller;

  return {
    // This is a connectivity hint, not proof that the server is reachable.
    network_online: navigator.onLine,
    service_worker_controlled: Boolean(controller),
    service_worker_script: controller?.scriptURL ?? null,
    pwa_display_mode: window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : 'browser',
  };
}

export function reportPwaError(error: unknown, operation: string) {
  posthog.captureException(error, {
    ...getPwaErrorContext(),
    error_operation: operation,
  });
}

// Warm the first document even before the service worker controls the page.
// Subsequent navigations use next-pwa's existing, separate HTML and RSC caches.
export async function cacheCurrentDocument(signal: AbortSignal) {
  if (!navigator.onLine || !('caches' in window)) return;

  const url = window.location.origin + window.location.pathname;
  const response = await fetch(url, {
    headers: { Accept: 'text/html' },
    credentials: 'same-origin',
    signal,
  });

  // A service worker can return the offline document with HTTP 200. Never
  // overwrite a real page with that fallback when connectivity disappears.
  if (response.url && new URL(response.url).pathname === '/offline.html') return;
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
    throw new Error(`PWA document cache received an invalid response (${response.status})`);
  }

  const cache = await caches.open('pages');
  if (!signal.aborted) await cache.put(url, response);
}
