importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js')

var CACHE_STATIC_NAME = 'rabbitstatic';
var CACHE_DYNAMIC_NAME = 'rabbitdynamic';

var STATIC_FILES = [
    '/',
    '/Index.html',
    '/ActivityDetails.html',
    '/Offline.html',
    '/ServiceWorker.js',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/fetch.js',
    '/src/js/idb.js',
    '/src/js/promise.js',
    '/src/js/utility.js',
    'src/images/icons/icon-72x72.png',
    'src/images/icons/icon-96x96.png',
    'src/images/icons/icon-128x128.png',
    'src/images/icons/icon-144x144.png',
    'src/images/icons/icon-152x152.png',
    'src/images/icons/icon-192x192.png',
    'src/images/icons/icon-512x512.png',
    'src/images/confused rabbit.png',
    'src/images/hollow rabbit.png',
    'src/images/benchpress.jpg',
    'src/images/dumbellcurl.jpeg',
    'src/images/pullup.jpg',
    'src/images/pushup.jpg',
    'src/images/situp.jpg',
    '/src/images/wp3.jpg',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
];

//STATIC CACHE
self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(STATIC_FILES);
            })
    )
});

//UPDATE CACHE
self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        // console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

//FETCH FIREBASE  
self.addEventListener('fetch', function (event) {
    var url = 'https://kelas-pwa-default-rtdb.asia-southeast1.firebasedatabase.app/test1';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then(function (res) {
                var clonedRes = res.clone();
                clearAllData('posts')
                    .then(function () {
                        return clonedRes.json();
                    })
                    .then(function (data) {
                        for (var key in data) {
                            writeData('posts', data[key])
                        }
                    });
                return res;
            })
        );
    }
    else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    }
    else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } 
                    else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            })
                            .catch(function (err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        if (event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/Offline.html');
                                        }
                                    });
                            });
                    }
                })
        );
    }
});