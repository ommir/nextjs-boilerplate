import { beforeEach, describe, expect, it } from "vitest";
import { selectCartCount, useCartStore } from "./cartStore";

// Snapshot the store's initial state (including actions) before any test mutates it,
// so it can be restored wholesale between tests without losing the actions.
const initialState = useCartStore.getState();

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState(initialState, true);
    window.localStorage.clear();
  });

  it("adds a new line item", () => {
    useCartStore.getState().addItem("prd_horizon");
    expect(useCartStore.getState().items).toEqual([{ productId: "prd_horizon", qty: 1 }]);
  });

  it("increments the quantity when adding an existing line", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().addItem("prd_horizon", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "prd_horizon", qty: 3 }]);
  });

  it("caps a line's quantity at the maximum", () => {
    useCartStore.getState().addItem("prd_horizon", 500);
    expect(useCartStore.getState().items[0]?.qty).toBe(99);
  });

  it("removes a line item", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().addItem("prd_atlas");
    useCartStore.getState().removeItem("prd_horizon");
    expect(useCartStore.getState().items).toEqual([{ productId: "prd_atlas", qty: 1 }]);
  });

  it("sets a line's quantity directly", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().setQty("prd_horizon", 5);
    expect(useCartStore.getState().items).toEqual([{ productId: "prd_horizon", qty: 5 }]);
  });

  it("removes the line when quantity is set to zero or below", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().setQty("prd_horizon", 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("prunes lines whose product is no longer in the catalog", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().addItem("prd_atlas");

    useCartStore.getState().pruneMissing(["prd_atlas"]);

    expect(useCartStore.getState().items).toEqual([{ productId: "prd_atlas", qty: 1 }]);
  });

  it("keeps the same state reference when there is nothing to prune", () => {
    useCartStore.getState().addItem("prd_horizon");
    const before = useCartStore.getState().items;

    useCartStore.getState().pruneMissing(["prd_horizon", "prd_atlas"]);

    // Identity matters: pruneMissing runs from an effect, so returning a new
    // array when nothing changed would re-render and re-fire it forever.
    expect(useCartStore.getState().items).toBe(before);
  });

  it("empties the cart when no known ids match", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().pruneMissing([]);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem("prd_horizon");
    useCartStore.getState().addItem("prd_atlas");
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("toggles the drawer open state", () => {
    expect(useCartStore.getState().isOpen).toBe(false);
    useCartStore.getState().open();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().close();
    expect(useCartStore.getState().isOpen).toBe(false);
    useCartStore.getState().toggle();
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});

describe("selectCartCount", () => {
  it("sums quantity across all lines", () => {
    expect(
      selectCartCount([
        { productId: "a", qty: 2 },
        { productId: "b", qty: 3 },
      ]),
    ).toBe(5);
  });

  it("returns zero for an empty cart", () => {
    expect(selectCartCount([])).toBe(0);
  });
});
