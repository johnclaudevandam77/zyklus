// Service Worker: macht die App offline-fähig.
// Bei Änderungen an den Dateien die Versionsnummer erhöhen.
const CACHE = "zyklus-v6";
const ASSETS = [
  "./", "index.html", "styles.css", "app.js", "config.js", "i18n.js", "symptoms.js", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Supabase-Anfragen nie cachen
  // Netzwerk zuerst (für Updates), sonst Cache (offline)
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
