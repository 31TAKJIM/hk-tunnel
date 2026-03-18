// sw.js - Service Worker for 隧道費查詢
const CACHE_NAME = 'tunnel-fees-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('快取已開啟');
                return cache.addAll(urlsToCache);
            })
    );
});

// 攔截請求並從快取回應
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果找到快取，返回快取
                if (response) {
                    return response;
                }
                
                // 否則從網路獲取
                return fetch(event.request).then(
                    response => {
                        // 檢查是否有效回應
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 複製回應並存入快取
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

// 清理舊快取
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
