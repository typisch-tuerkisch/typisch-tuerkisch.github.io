/*
  Typisch Türkisch
  © 2026 Gözde Özler.

  Diese Datei macht zwei Dinge und sonst nichts:

  1. Erst durch sie darf der Browser anbieten, die App auf den
     Startbildschirm zu legen.
  2. Wenn das Netz kurz weg ist, zeigt sie die zuletzt geladene
     Fassung an, statt eine Fehlerseite.

  Wichtig: es wird immer zuerst das Netz gefragt. Niemand bekommt
  eine alte Fassung der App zu sehen, solange er online ist.
*/

const CACHE = "tt-shell-1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const alte = await caches.keys();
    await Promise.all(alte.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode !== "navigate") return;

  e.respondWith((async () => {
    try {
      const frisch = await fetch(r);
      try {
        const c = await caches.open(CACHE);
        await c.put("huelle", frisch.clone());
      } catch (err) {}
      return frisch;
    } catch (err) {
      const c = await caches.open(CACHE);
      const alt = await c.match("huelle");
      if (alt) return alt;
      throw err;
    }
  })());
});
