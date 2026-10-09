/* CityPulse kiosk: keeps the kiosk working if the internet drops.
   Pages load fresh when online and fall back to the saved copy when offline.
   Photos, scripts and styles are served from the saved copy and refreshed in the background. */
const CACHE = "cpk-v12";
const MEDIA = "cpk-media-v1"; /* logos and photos uploaded in the staff dashboard; they never change, so they are kept */
const CORE = [
  "./",
  "../assets/styles.css?v=20261008b",
  "../assets/cp-kiosk.css?v=12",
  "../assets/cp-kiosk.js?v=12",
  "../assets/kiosk-app.js?v=10",
  "../assets/lexen-data.js?v=10",
  "../assets/cp-content.js?v=11",
  "../assets/vendor/qrcode-generator.js",
  "../assets/favicon.png",
  "../assets/lexen/logo-transparent.png",
  "../assets/lexen/exterior.jpg",
  "../assets/lexen/room.jpg",
  "../assets/lexen/lounge.jpg",
  "../assets/lexen/ads/granville.png",
  "../assets/lexen/ads/elportal.png",
  "../assets/lexen/ads/nohodiner.png",
  "../assets/lexen/ads/warnerbros.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    /* Uploaded images: saved on the kiosk the first time, so ads and photos still show without internet. */
    if (/\.workers\.dev$/.test(url.hostname) && url.pathname.startsWith("/media/")) {
      e.respondWith(caches.open(MEDIA).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }))));
    }
    return; /* weather, live content and counts go straight to the network */
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
