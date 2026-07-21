"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, ErrorState, Input } from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import type { ProductCategory } from "../types";

type Filter = ProductCategory | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "template", label: "Templates" },
  { value: "plugin", label: "Plugins" },
  { value: "asset", label: "Assets" },
  { value: "service", label: "Services" },
];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="aspect-[16/10] animate-pulse bg-surface-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}

/**
 * Container component: owns filter/search state and data fetching, then renders
 * loading / error / empty / success states around presentational cards.
 */
export function ProductList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError, refetch } = useProducts({
    category: filter === "all" ? undefined : filter,
    search: debouncedSearch,
  });

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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No products found"
          description="Try a different category or search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
