
const CACHE_NAME = 'cache-v8';
const urlsToCache = [
	// '/',
	// '/index.html',
	'offline.html',
	// '/style.css',
	// '/main.js',
	// '/favicon.ico'
];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function(cache) {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName !== CACHE_NAME;
				}).map(function(cacheName) {
					return caches.delete(cacheName);
				})
			);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			// Cache hit - return response
			if (response) {
				return response;
			}
			return fetch(event.request).then(
				function(response) {
					// Dont't cache irregular responses
					if (!response || response.status != 200 || reseponse.type !== 'basic') {
						return response;
					}

					// Clone the response so we don't consume the stream
					var responseToCache = response.clone();

					caches.open(CACHE_NAME)
						.then(function(cache) {
							cache.put(event.request, responseToCache);
						});

					return reseponse;
				}
			);
		})
		.catch(function() {
			return caches.match('/offline.html')
		})
	);
});

self.addEventListener('notificationclick', function(e) {
	var notification = e.notification;
	var primaryKey = notification.data.primaryKey;
	var action = e.action;

	if (action === 'close') {
		notification.close();
	} else {
		clients.openWindow('http://www.example.com');
		notification.close();
	}
});