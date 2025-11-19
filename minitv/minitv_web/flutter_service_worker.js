'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "f55147d29dab2c6f4f888c09a6d1aa71",
"version.json": "4bec91516ede58dabf41198881996d97",
"index.html": "dedc4b2c7269a9741ddc39051946ed6c",
"/": "dedc4b2c7269a9741ddc39051946ed6c",
"main.dart.js": "53befaaa6d56da5714f72f697076042b",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "0080c1120868936d0ad45bbb171c2f30",
"assets/AssetManifest.json": "2260377578858fe95e995dc9125f89b0",
"assets/NOTICES": "7e9ac94d3bb1fe454cb539a05e24f766",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "c7fe2de82a14c12cd84f6bd5506da120",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/media_kit/assets/web/hls1.4.10.js": "bd60e2701c42b6bf2c339dcf5d495865",
"assets/packages/wakelock_plus/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "37dd68ff03f15369e09c70055e0aab44",
"assets/fonts/MaterialIcons-Regular.otf": "10f155e0522509daefe97150c8b3f1fb",
"assets/assets/logos/rainews24.png": "01c30cc5aa282d95828961d0ca67e1f4",
"assets/assets/logos/topcrime.png": "170913fdf6b3c2338d3f2d717c0635a4",
"assets/assets/logos/paroledivita.png": "d04a93450af716f7cb0620a5a92b7fb5",
"assets/assets/logos/campionesport.png": "1511113e8b8a41a16b29c0bdef9a80c7",
"assets/assets/logos/radio24.png": "e66db41145b765f5deb17cf3b872f74e",
"assets/assets/logos/supertennis.png": "62211769db8d8e1d31c43c21f475d69f",
"assets/assets/logos/rai5.png": "811c60e19edcf7f03c48a9a3e639a923",
"assets/assets/logos/rai4.png": "ede448d5f68ac88cfbdbc89888dfefc3",
"assets/assets/logos/focus.png": "0ed9d659e71bdf12510be06d4e990ccd",
"assets/assets/logos/raistoria.png": "9e7d1f360ea221d25dc83c3444bc5448",
"assets/assets/logos/solocalcio.png": "33a22b07e455889f81c4928eac357745",
"assets/assets/logos/radioliberta.png": "5024a3db0d89b65fbbebe5d3b454899a",
"assets/assets/logos/business24.png": "12239b70d4807e2551ab846b11642ba2",
"assets/assets/logos/rete4.png": "b048084a89a78c6180ad6a153cdafe8f",
"assets/assets/logos/welcomein.png": "5bd92fb5bbdc2521eb406254e8da7b61",
"assets/assets/logos/odeon24.png": "6739ba224175929ec49e2d1d2649ccdd",
"assets/assets/logos/deluxe139.png": "2657b65cd66ba3f47bb628e2b6e22d53",
"assets/assets/logos/rtvsanmarino.png": "81b0c4b2e63731177b15bcb75f3d6460",
"assets/assets/logos/giallo.png": "c294a44b85e925a546e1451b6da982a5",
"assets/assets/logos/byoblu.png": "a92331d30693abc1adc4d28c4c001289",
"assets/assets/logos/orlertv.png": "60e8c46723ea2da8159fbd70c8a8922d",
"assets/assets/logos/la5.png": "0b265a3e6e4403161b239b1d91db01b9",
"assets/assets/logos/rai3.png": "ce66de406dd39d509536a5f4fc4218f0",
"assets/assets/logos/sicilia242.png": "8e7d9beb3d06244689a9084831ae5945",
"assets/assets/logos/rai2.png": "0a8bd205574318b1dfbadcf3644cfb5d",
"assets/assets/logos/studiopiu%25CC%2580.png": "de86f162ab99c11bf799de7d4acdb76a",
"assets/assets/logos/cartoonito.png": "d94db145b58bb3b1fce8d0cd65b8bd31",
"assets/assets/logos/raigulp.png": "2f8412b57df33e2272b4431334249c8e",
"assets/assets/logos/cusanonews7.png": "6e1ec7faf02d1401c30cc2933b1d9a9c",
"assets/assets/logos/primafree.png": "fd118ddd375bcf8fb4d21e2196015499",
"assets/assets/logos/twentyseven.png": "ed46beff29c8cabf541624ed7ef58334",
"assets/assets/logos/padrepiotv.png": "fcc9a31cac0f86d889ddc21e59b9d4d8",
"assets/assets/logos/foodnetwork.png": "ebd2f87b66197d8ea74cd5d0faae1b1f",
"assets/assets/logos/rai1.png": "15616fe98ab984844ec6da9f84809675",
"assets/assets/logos/la7.png": "6981ba008defc18472b32cd63f8be314",
"assets/assets/logos/homegardentv.png": "b657696db0b088c51dc8fc13a76e6383",
"assets/assets/logos/20mediaset.png": "257b945683b16a1a4e9cb66c3445e6bc",
"assets/assets/logos/radioitaliatv.png": "1238e18f847bbb715bfeff12d2d5f8a6",
"assets/assets/logos/casaitalia53.png": "74c821fc0ca7eebdc0c06fb6384f555a",
"assets/assets/logos/skytg24.png": "a6d4685de2d380acd82c6d9d315a4ae2",
"assets/assets/logos/bike.png": "fcb933d306e699f9e860e63f7aa0ac43",
"assets/assets/logos/radiocapitaltv.png": "35489ffa38996863805d3a8e6f74b5f0",
"assets/assets/logos/cielo.png": "50e26518710065a2b677148b8fa0f2b9",
"assets/assets/logos/iris.png": "550971baad4bf307d9f9258ff6ea3fe5",
"assets/assets/logos/tv8.png": "767b61c1c697ff32706b8bbfc0910ed1",
"assets/assets/logos/rtl1025news.png": "cd91378b50855a1fd1b029e82428c398",
"assets/assets/logos/raipremium.png": "ddad02dcb5383f5a219caf8f847e95d3",
"assets/assets/logos/super.png": "961ad8d1d1d3958c233dec767cd805b6",
"assets/assets/logos/supersix.png": "a00ad976cd98c2094d7de0d2391f2cbe",
"assets/assets/logos/arteinvestimenti.png": "177c65329431f9f315123588bfad64b1",
"assets/assets/logos/mediasetextra.png": "015dad2d0d0f255eb4a71d1f1a0bc602",
"assets/assets/logos/k2.png": "972ae6f9de168877e5aa1f3f96d1c372",
"assets/assets/logos/gm24.png": "e2fe0c05278bcf126b5171fa766792b6",
"assets/assets/logos/radio105tv.png": "4a72ba2ddc033480247fa874f568b562",
"assets/assets/logos/radiomontecarlotv.png": "45e48ce68d0c1c3437fadb96f61410ce",
"assets/assets/logos/italia1.png": "58d547abe26694518f35850469c92f69",
"assets/assets/logos/genius240.png": "7746bfa67faba42def115790403ce789",
"assets/assets/logos/italiachannel.png": "7d8d115458bf15ef49b0894c17015373",
"assets/assets/logos/tci.png": "7c236e550b892be808ac7814ba049b1e",
"assets/assets/logos/tesorychannel.png": "0d868278e4f2497aad77199183f25ec8",
"assets/assets/logos/tv2000.png": "fd22510755c9cf4676778becca2163bb",
"assets/assets/logos/frisbee.png": "a6f4a718b21a9661674f41107b97274e",
"assets/assets/logos/cusanoitaliatv.png": "623d94cfa396ac1950b9b85c7ad3bb15",
"assets/assets/logos/r101tv.png": "e74339c7f015f2bebc8d73ac34d7d4aa",
"assets/assets/logos/italia2.png": "dd03619cb740d5f4cdda356032548ab8",
"assets/assets/logos/radiotvseriea.png": "8cbb624195e2f4762b47d3385cb70387",
"assets/assets/logos/raimovie.png": "0c24200a86b027a49158514e014d3373",
"assets/assets/logos/sportitalia.png": "64d92377bddd780e16d0970401cdb859",
"assets/assets/logos/telecampione.png": "1bddb81bf96e8a20bc792c5183895a34",
"assets/assets/logos/rdssocialtv.png": "a6954c6db225a76149da17baeffb9131",
"assets/assets/logos/cine34.png": "79d65a60370179d914a06de01d0f7888",
"assets/assets/logos/raisport+hd.png": "12a2bc8f368cf5cfe83a9d7dee14a523",
"assets/assets/logos/tgcom24.png": "3f51c70e8fbfa3b0f8c74d9f39b73e05",
"assets/assets/logos/virginradiotv.png": "c3d00d55f8df2c4774fc092b09e1e30a",
"assets/assets/logos/fascinotv.png": "2cc3f5456ef77e788b51252e493b6142",
"assets/assets/logos/equtv.png": "85cdd5d5202cbb5f5e47b5cbf74e751f",
"assets/assets/logos/dmax.png": "aa9709b1b65ea805105a2b05ed575d8d",
"assets/assets/logos/realtime.png": "236946c3b566248884fb32ed2829996e",
"assets/assets/logos/README.txt": "249f82e8dac355a6b9a03e9604ecde64",
"assets/assets/logos/dolomitilifetv.png": "fb1386393d97bd062b1241a26d0780c7",
"assets/assets/logos/qvc.png": "8cd5f86eca4e966ee7ef4d5c69daf858",
"assets/assets/logos/canaleitalia.png": "b5a7c5fb4ef3cac59f751b768df3d2c2",
"assets/assets/logos/radiozetatv.png": "bb938c805230e77d2c295efd9a72a937",
"assets/assets/logos/fascinotv165.png": "86858489c70dbb7140b966a6404f76aa",
"assets/assets/logos/canale5.png": "88e3cb24ce08f76d2ae52ecc1c2abd1b",
"assets/assets/logos/raiscuola.png": "3fe8ce414384c94a033f1599ba7bfbba",
"assets/assets/logos/deejaytv.png": "151e516e472c245f90ae175cd4cd5fa8",
"assets/assets/logos/bomchannel.png": "14349dbdebfa6266ac44cdb36ba43a11",
"assets/assets/logos/warnertv.png": "7c4e4bb8cc4c744590e6fc6cadccd813",
"assets/assets/logos/boing.png": "4534c35f8624cbb7609c2c1674f03bac",
"assets/assets/logos/rai4k.png": "187ec3a4c20a0f8ccf2650a362521cfc",
"assets/assets/logos/radiom2otv.png": "112978b3cd4bafd1dd428df34ca7b9cd",
"assets/assets/logos/radiofrecciatv.png": "3bafda5361331390e1f640858b755816",
"assets/assets/logos/motortrend.png": "f37c0fce7f810f3989a70c2a8bb93ddf",
"assets/assets/logos/raisport.png": "cc78caf9ef7378ad795ec61e360d177e",
"assets/assets/logos/la7d.png": "811880b5186beab366b7a4cc56a146ea",
"assets/assets/logos/rairadio2visual.png": "0e7da6e4c1535642f47eb897adcf272a",
"assets/assets/logos/radiokisskisstv.png": "0a1c701017c0f6ca3a1bd775b673898c",
"assets/assets/logos/almatv.png": "9350affa14911850d5eda69ec74233bd",
"assets/assets/logos/nove.png": "92f9e4e6c74be6168206963c9ba53414",
"assets/assets/logos/traveltv.png": "89eaf66a5ec96769dd31fbc4f3c4159f",
"assets/assets/logos/raiyoyo.png": "e3bb393082fa4a474dde6dd12d3116a5",
"assets/assets/logos/donnatv.png": "aa77aad056eb8419a26c94c6a9194487",
"assets/assets/logos/rtl1025tv.png": "554abc8117395d4521ec6d5ade6fdfb7",
"assets/assets/logos/radioradio.png": "5995818fca37ec1e9b7472b2eda0605a",
"assets/assets/logos/vh1.png": "f352bf81612f03d9f3c08dbbdc353d45",
"canvaskit/skwasm.js": "1ef3ea3a0fec4569e5d531da25f34095",
"canvaskit/skwasm_heavy.js": "413f5b2b2d9345f37de148e2544f584f",
"canvaskit/skwasm.js.symbols": "0088242d10d7e7d6d2649d1fe1bda7c1",
"canvaskit/canvaskit.js.symbols": "58832fbed59e00d2190aa295c4d70360",
"canvaskit/skwasm_heavy.js.symbols": "3c01ec03b5de6d62c34e17014d1decd3",
"canvaskit/skwasm.wasm": "264db41426307cfc7fa44b95a7772109",
"canvaskit/chromium/canvaskit.js.symbols": "193deaca1a1424049326d4a91ad1d88d",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/chromium/canvaskit.wasm": "24c77e750a7fa6d474198905249ff506",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/canvaskit.wasm": "07b9f5853202304d3b0749d9306573cc",
"canvaskit/skwasm_heavy.wasm": "8034ad26ba2485dab2fd49bdd786837b"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
