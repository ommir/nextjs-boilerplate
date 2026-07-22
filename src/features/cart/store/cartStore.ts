import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  qty: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  /** Drop lines whose product no longer exists in the catalog. */
  pruneMissing: (knownProductIds: string[]) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** Upper bound on a single line's quantity — a sanity cap, not an inventory check. */
const MAX_QTY = 99;

/**
 * Storefront cart — Zustand + persist, mirroring `ui-store.ts`. Holds line
 * items only; product name/price/image are joined in from `useProducts()` at
 * render time, so the cart never goes stale relative to the catalog.
 */
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (productId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === productId ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i,
              ),
            };
          }
          return { items: [...s.items, { productId, qty: Math.min(qty, MAX_QTY) }] };
        }),

      removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => {
          if (qty <= 0) return { items: s.items.filter((i) => i.productId !== productId) };
          return {
            items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)),
          };
        }),

      /**
       * Reconcile the cart against the live catalog. A product deleted in the
       * dashboard would otherwise leave a line the drawer can't render (it
       * joins on product data) but the badge still counts — a stuck,
       * unclearable cart. Returning the same state when nothing changed keeps
       * this safe to call from an effect.
       */
      pruneMissing: (knownProductIds) =>
        set((s) => {
          const known = new Set(knownProductIds);
          const next = s.items.filter((i) => known.has(i.productId));
          return next.length === s.items.length ? s : { items: next };
        }),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "studio-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist line items — the drawer's open/closed state shouldn't survive reload.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Total quantity across all lines — the number shown on the cart badge. */
export function selectCartCount(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
