// Blockhaven offline support: keeps the game on the iPad so it opens without the internet.
const CACHE='blockhaven-v11';
const CORE=['./','index.html','three.min.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // the game page: try the internet first so updates arrive, fall back to the saved copy
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put('index.html',c));return r;}).catch(()=>caches.match('index.html')));
    return;
  }
  // everything else (engine, icons, fonts): use the saved copy, fetch and save if missing
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;})));
});
