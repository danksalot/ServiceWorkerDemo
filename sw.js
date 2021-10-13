
const CACHE_NAME = 'cache-v24';
const urlsToCache = [
	// STATIC PAGES
	// '/',
	// '/index.html',
	'/offline.html',

	// JS FILES
	'/js/main.js',
	'/js/jquery-3.6.0.slim.min.js',
	'/js/bootstrap.min.js',

	// STYLES
	'/styles/style.css',
	'/styles/bootstrap.min.css',

	// IMAGES
	'/favicon.ico',
	'/images/Logo-192x192.png',
	'/images/checkmark.png',
	'/images/xmark.png',
	'/images/product1.png',
	'/images/product2.png',
	'/images/product3.png'
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
				cacheNames
					.filter(cacheName => cacheName !== CACHE_NAME)
					.map(cacheName => caches.delete(cacheName))
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
					if (!response || response.status != 200 || response.type !== 'basic' || !urlsToCache.includes(event.request)) {
						return response;
					}

					// Clone the response so we don't consume the stream
					var responseToCache = response.clone();

					caches.open(CACHE_NAME)
						.then(function(cache) {
							cache.put(event.request, responseToCache);
						});

					return response;
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

self.addEventListener('push', function(e) {
	var options = {
		body: 'This notification was generated from a push!',
		icon: 'images/example.png',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: '2'
		},
		actions: [
			{action: 'explore', title: 'Explore this new world',
				icon: 'images/checkmark.png'},
			{action: 'close', title: 'Close',
				icon: 'images/xmark.png'},
		]
	};
	e.waitUntil(
		self.registration.showNotification('Hello world!', options)
	);
});