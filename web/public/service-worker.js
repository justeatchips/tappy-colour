const VERSION = '__SW_VERSION__'
const CACHE_NAME = `tappy-colour-v${VERSION}`

const PRECACHE_URLS = __PRECACHE_URLS__

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const isNavigation = request.mode === 'navigate'
  const url = new URL(request.url)
  const isSameOrigin = url.origin === self.location.origin
  const isCacheableSameOriginGet = request.method === 'GET' && isSameOrigin

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response

      return fetch(request)
        .then((response) => {
          if (
            !isCacheableSameOriginGet ||
            !response ||
            response.status !== 200 ||
            response.type === 'error'
          ) {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          if (isNavigation) {
            return caches.match('./')
          }
          throw new Error('Network request failed and no cache available')
        })
    })
  )
})
