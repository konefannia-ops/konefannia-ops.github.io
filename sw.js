/* Service worker : permet d'installer le jeu sur le téléphone et de l'ouvrir même avec un mauvais réseau.
   Les données du jeu (Firebase) ne passent jamais par ce cache. */
const CACHE = "babi-58957cf7";
const FICHIERS = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Réseau d'abord (pour toujours avoir la dernière version), cache si pas de réseau. */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((reponse) => {
        const double = reponse.clone();
        caches.open(CACHE).then((c) => c.put(e.request, double));
        return reponse;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
