"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { Product, ProductCategory } from "../types";

type Filter = ProductCategory | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "template", label: "Templates" },
  { value: "plugin", label: "Plugins" },
  { value: "asset", label: "Assets" },
  { value: "service", label: "Services" },
];

interface ProductListProps {
  /** Fetched on the server; this component only filters what it is given. */
  products: Product[];
}

/**
 * Catalog grid with category and search filters.
 *
 * Filtering happens client-side over the server-rendered list: for a catalog
 * this size a round trip per keystroke would be slower and would give up the
 * instant feedback. The repository still supports server-side `category` and
 * `search` (backed by the trigram index) for when the catalog outgrows this.
 */
export function ProductList({ products }: ProductListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = filter === "all" || product.category === filter;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.summary.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, filter, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-pill bg-surface-muted p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-pill px-3 py-1 text-caption font-semibold transition-colors",
                filter === f.value
                  ? "bg-surface text-ink shadow-xs"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:w-64">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leading={<Search className="size-4" />}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No products found"
          description="Try a different category or search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
