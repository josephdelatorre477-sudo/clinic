const V='clinicpad-v2',SHELL=['./','index.html','manifest.webmanifest','icon.svg','extra.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(e.request,c));return n}).catch(()=>caches.match('index.html'))))});
