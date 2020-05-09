const CACHE_NAME = 'zemke-io-v8';
const urlsToCache = [
  '/',
  "/assets/css/styles.css",

  "/assets/css/fa/css/fontawesome.min.css",
  "/assets/css/fa/css/solid.min.css",
  "/assets/css/fa/webfonts/fa-solid-900.woff2",

  "/assets/css/trac.css",

  "/images/hero.jpg",

  "/js/sw-register.js",
  "/js/nav.js",
  "/js/overlay.js",

  "/manifest.json",

  "/images/cwt.png",
  "/images/ism.jpg",
  "/images/tippspiel.png",
  "/images/opensource.jpg",
  "/images/job.png",

  "/images/works/cwt-history/2009.png",
  "/images/works/cwt-history/2010.png",
  "/images/works/cwt-history/2011.png",
  "/images/works/cwt-history/2012.png",
  "/images/works/cwt-history/2015.png",
  "/images/works/cwt-history/2019.png",
  "/images/works/ism.gif",
  "/images/works/tippspiel/bets.png",
  "/images/works/tippspiel/landscape.png",
  "/images/works/tippspiel/admin.png",
  "/images/works/tippspiel/portrait.png",

  // '/images/icons/apple-touch-icon.png',
  // '/images/icons/apple-touch-icon-57x57.png',
  // '/images/icons/apple-touch-icon-72x72.png',
  // '/images/icons/apple-touch-icon-76x76.png',
  // '/images/icons/apple-touch-icon-114x114.png',
  // '/images/icons/apple-touch-icon-120x120.png',
  // '/images/icons/apple-touch-icon-144x144.png',
  // '/images/icons/apple-touch-icon-152x152.png',
  // '/images/icons/apple-touch-icon-180x180.png',
  '/images/icons/favicon.ico',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png',
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function (event) {

  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
  );
});

self.addEventListener('activate', function (event) {

  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
