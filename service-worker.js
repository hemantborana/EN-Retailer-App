
const CACHE_NAME = 'kambeshwar-agencies-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.js',
  'https://i.ibb.co/zhgM9jrJ/HC-LOGO-Copy-removebg-preview.webp',
  'https://i.ibb.co/k21PgZ5R/applogo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    // Exclude Firebase and API calls from caching to ensure live data
    if (event.request.url.includes('firebaseio.com') || event.request.url.includes('gstatic.com/firebasejs') || event.request.url.includes('script.google.com')) {
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
              return response; // Serve from cache
            }

            return fetch(event.request).then(
                response => {
                    // Check for a valid response to cache
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    // Don't cache opaque responses from CDNs to be safe
                    if(response.type === 'opaque') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
