const CACHE_NAME = 'kambeshwar-agencies-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',

  // Local JS files
  '/index.js',
  '/App.js',
  '/types.js',
  '/services/firebaseService.js',
  '/services/indexedDB.js',
  '/services/authService.js',
  '/services/geminiService.js',
  '/context/CartContext.js',
  '/context/AuthContext.js',
  '/context/ToastContext.js',
  '/context/ThemeContext.js',
  '/context/NetworkStatusContext.js',
  '/components/Login.js',
  '/components/Dashboard.js',
  '/components/ProductCard.js',
  '/components/ProductDetailModal.js',
  '/components/CartSidebar.js',
  '/components/OrderHistoryModal.js',
  '/components/OrderSuccessModal.js',
  '/components/QuickOrderModal.js',
  '/components/HelpCenterModal.js',
  '/components/PrivacyPolicyModal.js',
  '/components/ProfileModal.js',
  '/components/OtpInput.js',
  '/components/LoginHelpModal.js',
  
  // External assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://i.ibb.co/zhgM9jrJ/HC-LOGO-Copy-removebg-preview.webp',
  'https://i.ibb.co/k21PgZ5R/applogo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching all app shell files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
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
    }).then(() => self.clients.claim())
  );
});