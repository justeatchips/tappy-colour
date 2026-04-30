const VERSION = '1777588689943'
const CACHE_NAME = `tappy-colour-v${VERSION}`

const PRECACHE_URLS = [
  "./",
  "./assets/BaseView-DKZ_zKSj.js",
  "./assets/ConfirmDialog-CpHJQBcZ.js",
  "./assets/DifficultyPicker-C70_n9bD.js",
  "./assets/HomeScreen-Ccwypwga.js",
  "./assets/ImportStaging-lnhTuNy_.js",
  "./assets/Mascots-CxJs8EPR.js",
  "./assets/OnboardingScreen-Bp81e6UM.js",
  "./assets/PuzzleContainer-BkxCMh74.js",
  "./assets/SearchScreen-CL8ysvj2.js",
  "./assets/SettingsScreen-DKQdwp0H.js",
  "./assets/conversion.worker-BkpfwI4x.js",
  "./assets/imageImport-DGzqNNwm.js",
  "./assets/main-CrNaLvjZ.js",
  "./assets/main-Dx5sfpDi.css",
  "./assets/mascots/mascots.json",
  "./assets/mascots/png/bibi-1x.png",
  "./assets/mascots/png/bibi-2x.png",
  "./assets/mascots/png/bibi-3x.png",
  "./assets/mascots/png/bibi-4x.png",
  "./assets/mascots/png/bibi-8x.png",
  "./assets/mascots/png/bo-1x.png",
  "./assets/mascots/png/bo-2x.png",
  "./assets/mascots/png/bo-3x.png",
  "./assets/mascots/png/bo-4x.png",
  "./assets/mascots/png/bo-8x.png",
  "./assets/mascots/png/captain-snooze.png",
  "./assets/mascots/png/chaosaurus.png",
  "./assets/mascots/png/finn-1x.png",
  "./assets/mascots/png/finn-2x.png",
  "./assets/mascots/png/finn-3x.png",
  "./assets/mascots/png/finn-4x.png",
  "./assets/mascots/png/finn-8x.png",
  "./assets/mascots/png/flutters.png",
  "./assets/mascots/png/luna-1x.png",
  "./assets/mascots/png/luna-2x.png",
  "./assets/mascots/png/luna-3x.png",
  "./assets/mascots/png/luna-4x.png",
  "./assets/mascots/png/luna-8x.png",
  "./assets/mascots/png/mochi-1x.png",
  "./assets/mascots/png/mochi-2x.png",
  "./assets/mascots/png/mochi-3x.png",
  "./assets/mascots/png/mochi-4x.png",
  "./assets/mascots/png/mochi-8x.png",
  "./assets/mascots/png/oinkers-mcsnort.png",
  "./assets/mascots/png/pip-1x.png",
  "./assets/mascots/png/pip-2x.png",
  "./assets/mascots/png/pip-3x.png",
  "./assets/mascots/png/pip-4x.png",
  "./assets/mascots/png/pip-8x.png",
  "./assets/mascots/png/plop-1x.png",
  "./assets/mascots/png/plop-2x.png",
  "./assets/mascots/png/plop-3x.png",
  "./assets/mascots/png/plop-4x.png",
  "./assets/mascots/png/plop-8x.png",
  "./assets/mascots/png/plop.png",
  "./assets/mascots/png/rosie-1x.png",
  "./assets/mascots/png/rosie-2x.png",
  "./assets/mascots/png/rosie-3x.png",
  "./assets/mascots/png/rosie-4x.png",
  "./assets/mascots/png/rosie-8x.png",
  "./assets/mascots/png/sir-chomps-a-lot.png",
  "./assets/mascots/png/sparkle-1x.png",
  "./assets/mascots/png/sparkle-2x.png",
  "./assets/mascots/png/sparkle-3x.png",
  "./assets/mascots/png/sparkle-4x.png",
  "./assets/mascots/png/sparkle-8x.png",
  "./assets/mascots/png/sparklepants.png",
  "./assets/mascots/png/sprout-1x.png",
  "./assets/mascots/png/sprout-2x.png",
  "./assets/mascots/png/sprout-3x.png",
  "./assets/mascots/png/sprout-4x.png",
  "./assets/mascots/png/sprout-8x.png",
  "./assets/mascots/png/squeak-nugget.png",
  "./assets/mascots/png/sunny-1x.png",
  "./assets/mascots/png/sunny-2x.png",
  "./assets/mascots/png/sunny-3x.png",
  "./assets/mascots/png/sunny-4x.png",
  "./assets/mascots/png/sunny-8x.png",
  "./assets/mascots/svg/bibi-animated.svg",
  "./assets/mascots/svg/bibi.svg",
  "./assets/mascots/svg/bo-animated.svg",
  "./assets/mascots/svg/bo.svg",
  "./assets/mascots/svg/finn-animated.svg",
  "./assets/mascots/svg/finn.svg",
  "./assets/mascots/svg/luna-animated.svg",
  "./assets/mascots/svg/luna.svg",
  "./assets/mascots/svg/mochi-animated.svg",
  "./assets/mascots/svg/mochi.svg",
  "./assets/mascots/svg/pip-animated.svg",
  "./assets/mascots/svg/pip.svg",
  "./assets/mascots/svg/plop-animated.svg",
  "./assets/mascots/svg/plop.svg",
  "./assets/mascots/svg/rosie-animated.svg",
  "./assets/mascots/svg/rosie.svg",
  "./assets/mascots/svg/sparkle-animated.svg",
  "./assets/mascots/svg/sparkle.svg",
  "./assets/mascots/svg/sprout-animated.svg",
  "./assets/mascots/svg/sprout.svg",
  "./assets/mascots/svg/sunny-animated.svg",
  "./assets/mascots/svg/sunny.svg",
  "./assets/objectUrl-DzFBoVO2.js",
  "./assets/sound-vLDDyjfJ.js",
  "./fonts/DM_Mono/DMMono-Italic.ttf",
  "./fonts/DM_Mono/DMMono-Light.ttf",
  "./fonts/DM_Mono/DMMono-LightItalic.ttf",
  "./fonts/DM_Mono/DMMono-Medium.ttf",
  "./fonts/DM_Mono/DMMono-MediumItalic.ttf",
  "./fonts/DM_Mono/DMMono-Regular.ttf",
  "./fonts/DM_Mono/OFL.txt",
  "./fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf",
  "./fonts/Nunito/Nunito-VariableFont_wght.ttf",
  "./fonts/Nunito/OFL.txt",
  "./fonts/Nunito/README.txt",
  "./fonts/Nunito/static/Nunito-Black.ttf",
  "./fonts/Nunito/static/Nunito-BlackItalic.ttf",
  "./fonts/Nunito/static/Nunito-Bold.ttf",
  "./fonts/Nunito/static/Nunito-BoldItalic.ttf",
  "./fonts/Nunito/static/Nunito-ExtraBold.ttf",
  "./fonts/Nunito/static/Nunito-ExtraBoldItalic.ttf",
  "./fonts/Nunito/static/Nunito-ExtraLight.ttf",
  "./fonts/Nunito/static/Nunito-ExtraLightItalic.ttf",
  "./fonts/Nunito/static/Nunito-Italic.ttf",
  "./fonts/Nunito/static/Nunito-Light.ttf",
  "./fonts/Nunito/static/Nunito-LightItalic.ttf",
  "./fonts/Nunito/static/Nunito-Medium.ttf",
  "./fonts/Nunito/static/Nunito-MediumItalic.ttf",
  "./fonts/Nunito/static/Nunito-Regular.ttf",
  "./fonts/Nunito/static/Nunito-SemiBold.ttf",
  "./fonts/Nunito/static/Nunito-SemiBoldItalic.ttf",
  "./fonts/Pixelify_Sans/OFL.txt",
  "./fonts/Pixelify_Sans/PixelifySans-VariableFont_wght.ttf",
  "./fonts/Pixelify_Sans/README.txt",
  "./fonts/Pixelify_Sans/static/PixelifySans-Bold.ttf",
  "./fonts/Pixelify_Sans/static/PixelifySans-Medium.ttf",
  "./fonts/Pixelify_Sans/static/PixelifySans-Regular.ttf",
  "./fonts/Pixelify_Sans/static/PixelifySans-SemiBold.ttf",
  "./icons/apple-touch-icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/chick.png",
  "./images/img_cat.png",
  "./images/img_duck.png",
  "./images/img_fish.png",
  "./images/img_flower.png",
  "./images/img_rocket.png",
  "./manifest.webmanifest"
]

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
