/* SHIFTLY DIARIO · il pezzo che lo fa aprire anche senza rete (16 novembre 2026).
   Tiene una copia del programma sul telefono. NON tocca i dati della cliente: quelli stanno in
   IndexedDB/localStorage e un service worker non li vede.
   ⚠️ La riga VERSIONE la scrive `pubblica_diario.py` (versione + impronta di index.html). Se il file
      cambia anche di una virgola, cambia sw.js, il telefono se ne accorge e scarica la copia nuova.
      La nuova si vede dall'apertura DOPO: niente ricarica a metà, che farebbe perdere un foglio
      aperto e non salvato. */
const VERSIONE = '0.5.0-95de8590e2';
const CACHE = 'diario-' + VERSIONE;
const FILE = ['./', 'index.html', 'manifest.webmanifest', 'icona-180.png', 'icona-192.png', 'icona-512.png'];

self.addEventListener('install', e => {
  /* cache:'reload' — GitHub Pages fa tenere i file 10 minuti: senza, la copia «nuova» potrebbe essere la vecchia */
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('diario-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  /* prima la copia sul telefono: si apre subito, anche in metropolitana */
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(hit =>
    hit || (r.mode === 'navigate' ? c.match('index.html') : null)).then(hit => hit || fetch(r))));
});
