"use client";

import { useEffect } from "react";

const FLAG = "ft-sw-cleared-v2";

/**
 * Sekali saja: unregister SW / cache next-pwa lama yang memicu reload loop.
 */
export default function ClearServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(FLAG) === "1") return;

    (async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((k) => /workbox|start-url|pages|next/i.test(k))
              .map((k) => caches.delete(k)),
          );
        }
      } catch {
        // abaikan
      } finally {
        sessionStorage.setItem(FLAG, "1");
      }
    })();
  }, []);

  return null;
}
