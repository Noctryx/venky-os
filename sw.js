const CACHE = "venky-os-v2";
const RUNTIME = "venky-os-runtime-v2";
const APP_PREFIX = self.location.pathname.replace(/\/sw\.js$/, "");
const SHELL_FALLBACK = `${APP_PREFIX || ""}/index.html`;
const ASSETS = [
  `${APP_PREFIX || ""}/`,
  `${APP_PREFIX || ""}/index.html`,
  `${APP_PREFIX || ""}/manifest.json`,
  `${APP_PREFIX || ""}/icon-192.png`,
  `${APP_PREFIX || ""}/icon-512.png`,
  `${APP_PREFIX || ""}/supabase.min.js`,
  `${APP_PREFIX || ""}/chart.umd.min.js`,
  `${APP_PREFIX || ""}/fonts/fonts.css`,
  `${APP_PREFIX || ""}/fonts/DM-Sans.woff2`,
  `${APP_PREFIX || ""}/fonts/DM-Mono.woff2`,
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        try {
          await cache.addAll(ASSETS);
        } catch (err) {
          console.warn("SW install: some assets failed to cache", err);
          for (const asset of ASSETS) {
            try {
              await cache.add(asset);
            } catch (e) {
              console.warn("SW install: failed to cache", asset, e);
            }
          }
        }
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const req = e.request;
  const url = new URL(req.url);

  // Network-only for live sync APIs; fail fast while offline.
  if (url.hostname.includes("supabase.co")) {
    e.respondWith(
      fetch(req).catch(
        () =>
          new Response(JSON.stringify({ error: "offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }

  // Navigations: network-first for freshness, app-shell fallback offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          // cache a canonical shell fallback for navigations
          caches.open(CACHE).then((c) => c.put(SHELL_FALLBACK, copy));
          return res;
        })
        .catch(
          async () =>
            (await caches.match(req.url)) ||
            (await caches.match(SHELL_FALLBACK)),
        ),
    );
    return;
  }

  // App-origin static assets: cache-first for speed, then update cache.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Third-party resources (fonts/charts): network-first with runtime cache fallback.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
