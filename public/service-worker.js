/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'word-master-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  // 필요한 경우 여기에 오프라인에서 사용할 폰트나 이미지 경로를 추가하세요
];

// 설치: 캐시 파일 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// 요청 가로채기: 오프라인이면 캐시에서 꺼내주기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 반환, 없으면 네트워크 요청
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
