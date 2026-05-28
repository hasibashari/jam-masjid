const STATIC_CACHE = 'jam-masjid-static-v1';
const PAGES_CACHE = 'jam-masjid-pages-v1';
const API_CACHE = 'jam-masjid-api-v1';
const MEDIA_CACHE = 'jam-masjid-media-v1';

const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE, API_CACHE, MEDIA_CACHE];

// Assets to cache immediately on SW installation
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// SW Install Event - Precache fundamental Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// SW Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!ALL_CACHES.includes(cacheName)) {
            console.log('[Service Worker] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Handle Range Requests for cached audio/video files
function handleRangeRequest(request, cachedResponse) {
  const rangeHeader = request.headers.get('Range');
  if (!rangeHeader) {
    return cachedResponse;
  }

  return cachedResponse.arrayBuffer().then((arrayBuffer) => {
    const bytes = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(bytes[0], 10);
    const end = bytes[1] ? parseInt(bytes[1], 10) : arrayBuffer.byteLength - 1;

    const chunk = arrayBuffer.slice(start, end + 1);
    const responseHeaders = new Headers({
      'Content-Range': `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunk.byteLength,
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg',
    });

    return new Response(chunk, {
      status: 206,
      statusText: 'Partial Content',
      headers: responseHeaders,
    });
  });
}

// SW Fetch Event - Route interception strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Skip non-GET requests (e.g. POST, PUT, DELETE should go straight to network)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Skip Dev Hot Module Replacement (HMR) or internal Next.js dev sockets
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('webpack')) {
    return;
  }

  // 3. API Data Strategy: Network-First (Fallback to Cache)
  if (url.pathname.startsWith('/api/')) {
    // Exclude authentication state checks to avoid serving cached logged-in state
    if (url.pathname.includes('/api/auth/')) {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Network failed, serving API data from cache:', url.pathname);
          return caches.match(request);
        })
    );
    return;
  }

  // 4. Static next assets / static chunks: Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 5. External Assets (Google Fonts, Unsplash background, adzan audio mp3): Cache-First / Stale-While-Revalidate
  const isExternalAsset = 
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('picsum.photos') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg');

  if (isExternalAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // If range request, wrap inside partial content handler
          if (request.headers.get('Range')) {
            return handleRangeRequest(request, cachedResponse);
          }
          return cachedResponse;
        }

        // Fetch without range headers first to cache the full audio/image payload cleanly
        const fetchRequest = request.headers.get('Range') 
          ? new Request(request.url, { headers: { ...request.headers, Range: '' } })
          : request;

        return fetch(fetchRequest).then((response) => {
          if (response && (response.status === 200 || response.status === 206)) {
            const responseClone = response.clone();
            caches.open(MEDIA_CACHE).then((cache) => {
              cache.put(request.url, responseClone);
            });
          }
          
          if (request.headers.get('Range')) {
            return handleRangeRequest(request, response);
          }
          return response;
        });
      })
    );
    return;
  }

  // 6. Navigation Pages (e.g. /, /admin): Network-First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Serving page from cache:', url.pathname);
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to cached root '/' if specific page is missing
            return caches.match('/');
          });
        })
    );
    return;
  }
});
