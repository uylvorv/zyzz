const CACHE_NAME = 'zyzz-legacy-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/mythos.html',
    '/blueprint.html',
    '/vault.html',
    '/audio.html',
    '/styles/main.css',
    '/styles/home.css',
    '/styles/mythos.css',
    '/styles/blueprint.css',
    '/styles/vault.css',
    '/styles/audio.css',
    '/js/main.js',
    '/js/hero.js',
    '/js/parallax.js',
    '/js/three-scene.js',
    '/js/stats.js',
    '/js/gallery.js',
    '/js/audio-player.js',
    '/assets/images/favicon.png',
    '/assets/images/hero_poster.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/ScrollTrigger.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Install Event - Cache Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch Event - Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
