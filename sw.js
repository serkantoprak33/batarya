// Kadro Tasarım — çevrimdışı önbellek (derle.js üretir, elle değiştirmeyin)
const VER = "batarya-1edd2f5acb";
const ASSETS = ["./","index.html","manifest.webmanifest","lib/three.min.js","lib/OrbitControls.js","lib/RGBELoader.js","lib/studio.hdr","lib/ar/GLTFExporter.js","lib/ar/BufferGeometryUtils.js","lib/ar/model-viewer.min.js","lib/fx/shaders/CopyShader.js","lib/fx/postprocessing/EffectComposer.js","lib/fx/postprocessing/RenderPass.js","lib/fx/postprocessing/ShaderPass.js","lib/fx/math/SimplexNoise.js","lib/fx/shaders/SSAOShader.js","lib/fx/postprocessing/SSAOPass.js","lib/fx/shaders/LuminosityHighPassShader.js","lib/fx/postprocessing/UnrealBloomPass.js","lib/fx/shaders/GammaCorrectionShader.js","lib/fx/shaders/FXAAShader.js","simgeler/simge-192.png","simgeler/simge-512.png","simgeler/simge-maskable-512.png","simgeler/apple-touch-icon.png","simgeler/favicon-32.png"];
const FONTS = "batarya-yazitipi";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VER && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // yazı tipleri: önbellekten hemen, arkada yenile
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // sayfa: önce internet (güncel sürüm), 4 sn'de gelmezse ya da internet yoksa önbellek
  if (req.mode === "navigate"){
    e.respondWith((async () => {
      const c = await caches.open(VER);
      try {
        const r = await Promise.race([fetch(req.url, {cache: "no-cache", credentials: "same-origin"}), new Promise((_, no) => setTimeout(() => no(new Error("yavas")), 6000))]);
        if (r && r.ok) c.put("index.html", r.clone());
        return r;
      } catch (err){
        return (await c.match("index.html")) || (await c.match("./")) || Response.error();
      }
    })());
    return;
  }
  // diğer dosyalar: önbellekten
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req)));
});
