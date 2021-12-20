let run = function(){
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

  if (workbox) {
    console.log(`Workbox is registered as a service-worker, caching audio 🎉`);
  } else {
    console.log(`Unable to register Workbox service-worker, audio will not be cached (will still work) 😬`);
    return
  }

  workbox.setConfig({debug: false});

  workbox.loadModule('workbox-strategies');
  workbox.loadModule('workbox-expiration');
  workbox.loadModule('workbox-range-requests');
  workbox.loadModule('workbox-cacheable-response');

  // https://github.com/GoogleChrome/workbox/issues/2382
  const AUDIO_CACHE_NAME = `runtime-audio`;

  // TODO consider adding header check to see if external file is newer and update cache if so.
  async function addToAudioCache(url) {
    if( url.endsWith('.mp3') ||
        url.endsWith('.webm') ||
        url.endsWith('.wav') ||
        url.endsWith('.flac') ||
        url.endsWith('.mp4') ||
        url.endsWith('.aac')  // Probably more formats
      ){
        const cache = await caches.open(AUDIO_CACHE_NAME);
        if (!(await cache.match(url))) {
         await cache.add(url);
      }
    } else {
      throw 'Serviceworker: URL is not for audio'
    }
  }

  const audioRouteMatcher = ({url, event}) => {
    let matches = event.request.url.match(/.*\.mp3|webm|wav|flac|mp4|aac$/);
    return matches;
  };
  const audioRouteHandlerCacheOnly = new workbox.strategies.CacheOnly({
    cacheName: AUDIO_CACHE_NAME,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses: [200, 206]}),
      new workbox.rangeRequests.RangeRequestsPlugin(),
    ],
    matchOptions: {
      // This is needed since precached resources may have a ?_WB_REVISION=... URL param.
      ignoreSearch: true,
      // Firebase vary header caused cache match to fail for mp3 until added this.
      ignoreVary: true,
    }
  });
  // Register the audio router.
  workbox.routing.registerRoute(
    audioRouteMatcher,
    ({event, request}) => {
      event.respondWith((async () => {
        await addToAudioCache(request.url);
        return audioRouteHandlerCacheOnly.handle({request});
      })());
    }
  );

  const audioRouteHandlerNetworkFirst = new workbox.strategies.NetworkFirst({
    cacheName: 'cache-pages'
  });

  const pageFallbackRouteMatcher2 = ({url, event}) => {
    let matches = event.request.url.match(/.*\.mp3|webm|wav|flac|mp4|aac$/);
    return !matches;
  };

  // Register the page fallback
  workbox.routing.registerRoute(
    pageFallbackRouteMatcher2,
    audioRouteHandlerNetworkFirst
  );

}
run()
