// Este es un service worker básico para habilitar la funcionalidad PWA

const CACHE_NAME = "fittrack-pro-v1"
const urlsToCache = ["/", "/index.html", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// Instalación del service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activación del service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Estrategia de caché: Network first, falling back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la red está disponible, obtenemos el recurso de la red
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          // Y lo guardamos en el caché para uso futuro
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Si la red no está disponible, intentamos obtener el recurso del caché
        return caches.match(event.request)
      }),
  )
})
