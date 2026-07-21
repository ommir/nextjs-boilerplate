import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "../types";

vi.mock("@/features/product/services/productService", () => ({
  productService: {
    list: vi.fn(),
  },
}));

const { productService } = await import("@/features/product/services/productService");
const { ProductList } = await import("./ProductList");

const listMock = vi.mocked(productService.list);

const sampleProducts: Product[] = [
  {
    id: "prd_1",
    name: "Horizon Dashboard Kit",
    summary: "Analytics screens",
    description: "…",
    price: 189,
    category: "template",
    imageUrl: "https://example.com/a.png",
    rating: 4.8,
    stock: 12,
  },
];

function renderWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductList />
    </QueryClientProvider>,
  );
}

describe("ProductList", () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows skeletons while loading, then renders product cards", async () => {
    listMock.mockResolvedValueOnce(sampleProducts);
    renderWithClient();

    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    await waitFor(() => expect(screen.getByText("Horizon Dashboard Kit")).toBeInTheDocument());
  });

  it("shows an empty state when no products match", async () => {
    listMock.mockResolvedValueOnce([]);
    renderWithClient();

    await waitFor(() => expect(screen.getByText("No products found")).toBeInTheDocument());
  });

  it("shows an error state with a working retry when the query fails", async () => {
    listMock.mockRejectedValueOnce(new Error("network down"));
    listMock.mockResolvedValueOnce(sampleProducts);
    renderWithClient();

    const user = userEvent.setup();
    await waitFor(() => expect(screen.getByText("Something went wrong")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByText("Horizon Dashboard Kit")).toBeInTheDocument());
  });

  it("debounces search input so rapid typing issues a single query", async () => {
    listMock.mockResolvedValue(sampleProducts);
    renderWithClient();
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    vi.useFakeTimers();
    const initialCalls = listMock.mock.calls.length;
    const input = screen.getByPlaceholderText("Search products…");

    // Simulate rapid keystrokes: each one resets the debounce timer.
    for (const value of ["i", "ic", "ico", "icon"]) {
      fireEvent.change(input, { target: { value } });
      act(() => vi.advanceTimersByTime(100));
    }

    // Still within the debounce window since the last keystroke — no new query yet.
    expect(listMock.mock.calls.length).toBe(initialCalls);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(listMock.mock.calls.length).toBe(initialCalls + 1);
    expect(listMock.mock.calls.at(-1)?.[0]).toMatchObject({ search: "icon" });
  });
});
