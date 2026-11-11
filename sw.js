// Cache halaman dan aset untuk buka offline. Pengingat saat app tertutup ditangani alarm Android, bukan SW.
const CACHE = "sepersen-dark-v8";
const FILES = ["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const sendiri = new URL(e.request.url).origin === location.origin;
  // Aset sendiri: jaringan dulu supaya update langsung terlihat, cache hanya saat offline.
  if (sendiri) {
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copy)));
        return r;
      }).catch(() => caches.match(e.request).then((hit) => hit || (e.request.mode === "navigate" ? caches.match("./") : undefined)))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
