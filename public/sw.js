const CACHE_NAME = "mcheyne-web-v2"; // Incremented version
const urlsToCache = ["/", "/en", "/es", "/manifest.json", "/offline.html"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then(async (networkResponse) => {
          // Check if we received a valid response
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);
          }
          return networkResponse;
        })
        .catch(error => {
            // A network error happened.
            // If there's a cached response, swallow the error.
            // Only throw if there's no cached response to fall back to.
            console.error("Fetch failed:", error);
            if (cachedResponse) {
                return cachedResponse;
            }
            throw error;
        });

      // Return cached response immediately, then update cache in background
      return cachedResponse || fetchPromise;
    }).catch(() => {
        // If both cache and network fail, show offline page for navigation
        if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
        }
    })
  );
});
