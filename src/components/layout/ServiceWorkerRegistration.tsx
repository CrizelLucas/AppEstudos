"use client";

import { useEffect } from "react";

/**
 * Só registra em produção — em dev o service worker acabaria fazendo cache
 * de chunks do Fast Refresh e atrapalhando a recarga automática.
 *
 * Em dev, faz o inverso: remove qualquer service worker (e cache) que tenha
 * ficado registrado de uma sessão de produção anterior testada na mesma
 * origem (ex: `next build && next start` pra testar o PWA). Sem isso, esse
 * worker antigo continua interceptando as requisições e servindo/cacheando
 * chunks incompatíveis com o dev server, causando reloads em loop e travando
 * a navegação entre as telas.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Navegador sem suporte ou registro falhou — segue sem cache offline.
    });
  }, []);

  return null;
}
