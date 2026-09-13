self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
// 只接管页面导航请求，满足浏览器"可安装"要求；其余请求照常直连
self.addEventListener('fetch', function (e) {
    if (e.request.mode === 'navigate') e.respondWith(fetch(e.request));
});
