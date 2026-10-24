const CACHE_NAME = "crcalc-cache-v1-2026-10-23T21:58:27";
const urlsToCache = [
    "accelerate.svg",
    "calc.html",
    "calc.js",
    "calc_mui.js",
    "calc_worker.js",
    "copy.svg",
    "copy_integer.svg",
    "copy_truncated.svg",
    "favicon.ico",
    "fonts/roboto-greek-400-normal.woff2",
    "fonts/roboto-latin-400-italic.woff2",
    "fonts/roboto-latin-400-normal.woff2",
    "fonts/roboto-latin-700-normal.woff2",
    "fonts/roboto-math-400-normal.woff2",
    "fonts/roboto-mono-latin-400-normal.woff2",
    "fonts/roboto-mono-latin-700-normal.woff2",
    "manifest.webmanifest",
    "roboto.css",
    "save.svg",
    "simplify.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request);
    }));
});
