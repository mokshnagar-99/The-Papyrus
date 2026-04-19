// Service Worker — The Papyrus PWA
// Caches static assets for offline use

const CACHE_NAME = 'papyrus-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './services.html',
    './about.html',
    './quiz.html',
    './playbook.html',
    './login.html',
    './account.html',
    './styles.css',
    './shared-layout.css',
    './landing.css',
    './transitions.css',
    './script.js',
    './transitions.js',
    './White AI logo.png',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// Install: cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Some assets failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for static, network-first for API calls
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Always go network for API calls (Firebase, Gemini, HIBP, RSS)
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('haveibeenpwned.com') ||
        url.hostname.includes('rss2json.com') ||
        url.hostname.includes('generativelanguage.googleapis.com')
    ) {
        return; // Let browser handle it (network only)
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                return response;
            }).catch(() => {
                // Offline fallback for HTML pages
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
