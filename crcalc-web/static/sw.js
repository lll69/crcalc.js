const CACHE_NAME = "crcalc-cache-v1-2026-10-25T07:49:46";
const urlsToCache = [
    "accelerate.svg",
    "aosp/icon_144.png",
    "aosp/icon_192.png",
    "aosp/icon_48.png",
    "aosp/icon_72.png",
    "aosp/icon_96.png",
    "calc.html",
    "calc.html?pwa=1",
    "calc.js",
    "calc_mui.js",
    "calc_worker.js",
    "copy.svg",
    "copy_integer.svg",
    "copy_truncated.svg",
    "favicon.ico",
    "fonts/roboto-latin-400-italic.woff2",
    "fonts/roboto-latin-400-normal.woff2",
    "fonts/roboto-latin-500-normal.woff2",
    "fonts/roboto-latin-700-normal.woff2",
    "fonts/roboto-latin-ext-400-normal.woff2",
    "fonts/roboto-math-400-normal.woff2",
    "fonts/roboto-mono-greek-400-normal.woff2",
    "fonts/roboto-mono-greek-700-normal.woff2",
    "fonts/roboto-mono-latin-400-normal.woff2",
    "fonts/roboto-mono-latin-700-normal.woff2",
    "manifest.webmanifest",
    "roboto.css",
    "save.svg",
    "simplify.svg",
    "zh/calc.html",
    "zh/calc.html?pwa=1",
    "zh/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener("fetch", (event) => {
    if (event.request && event.request.url) {
        try {
            const pathname = new URL(event.request.url).pathname;
            if (pathname === "/is_sw.txt") {
                event.respondWith(new Response(new Blob(["1"], { type: "text/plain" })));
                return;
            }
        } catch (e) {
            console.warn(e);
        }
    }
    event.respondWith(caches.match(event.request).then((response) => {
        return response || fetch(event.request, { redirect: "follow" });
    }));
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(
            names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        );
        await self.clients.claim();
    })());
});
