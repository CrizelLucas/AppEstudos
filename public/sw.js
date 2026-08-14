// Service worker básico: cache do essencial pra abrir o app mesmo com conexão
// instável. Não tenta sincronizar dados (tudo já fica no localStorage) nem
// funcionar 100% offline — só evita a "tela branca" quando a rede falha.

const CACHE_NAME = "pomodoro-bb-cache-v1";

const APP_SHELL = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Alguma URL do shell falhou (ex: offline na primeira instalação) —
        // não trava a instalação do service worker por causa disso.
      }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first com fallback pro cache: sempre busca a versão mais nova
// quando a rede funciona (e guarda no cache); se a rede falhar, serve o que
// já tiver em cache — e, faltando isso, cai na página inicial.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/")),
      ),
  );
});
