"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "../store/cartStore";

/**
 * Whether the persisted cart has been read back from localStorage.
 *
 * The store is created empty so the server render and the first client render
 * agree; `persist` then rehydrates a tick later. Anything that branches on the
 * cart being empty — above all the "empty cart, go home" redirect on
 * /checkout — has to wait for this, or it fires against a cart that has simply
 * not loaded yet and throws the user out of their own checkout.
 *
 * Starts `false` and is only ever set from an effect. Reading
 * `persist.hasHydrated()` in a `useState` initializer looks tidier but runs
 * during prerender, where there is no storage and the `persist` API may not be
 * attached at all — which crashed the production build rather than degrading.
 */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useCartStore.persist;

    // No persist API (storage unavailable) means there is nothing to wait for.
    if (!persist) {
      setHydrated(true);
      return;
    }

    if (persist.hasHydrated()) setHydrated(true);
    return persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
