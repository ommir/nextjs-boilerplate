"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCatalog } from "@/features/product/context/CatalogProvider";
import { mergeGuestCartAction } from "../actions/cartActions";
import { useCartStore } from "../store/cartStore";

const MERGED_FLAG_PREFIX = "studio-cart-merged:";

/**
 * Reconciles the local cart with the catalog and with the server.
 *
 * Two jobs, both invisible:
 *
 *  1. Drop lines whose product no longer exists. A product deleted in the
 *     dashboard would otherwise leave a line the drawer cannot render (it
 *     joins on product data) while the badge still counts it — a stuck cart
 *     nobody can clear.
 *
 *  2. Fold a guest cart into the account cart on first sign-in, once per user.
 *     The flag is keyed by user id so signing in as someone else on the same
 *     browser still merges.
 */
export function CartSync() {
  const { profile } = useAuth();
  const products = useCatalog();
  const items = useCartStore((s) => s.items);
  const pruneMissing = useCartStore((s) => s.pruneMissing);
  const hasMerged = useRef(false);

  useEffect(() => {
    if (products.length === 0) return;
    pruneMissing(products.map((product) => product.id));
  }, [products, pruneMissing]);

  useEffect(() => {
    if (!profile || hasMerged.current) return;

    const flag = `${MERGED_FLAG_PREFIX}${profile.id}`;
    if (window.localStorage.getItem(flag)) return;

    hasMerged.current = true;
    window.localStorage.setItem(flag, "1");

    if (items.length === 0) return;
    void mergeGuestCartAction(
      items.map((item) => ({ product_id: item.productId, qty: item.qty })),
    );
    // Runs once per signed-in user; `items` is read at that moment on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return null;
}
