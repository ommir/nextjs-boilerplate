"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { StockSignal } from "@/features/product/components/StockSignal";
import { categoryMeta } from "@/features/product/lib/category";
import { useDeleteProduct, useProducts } from "@/features/product/hooks/useProducts";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/features/product/types";

/** Dashboard Products CRUD index — the storefront catalog's admin surface. */
export default function DashboardProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  // Focus lands here after a delete, since the row's own button is gone by then.
  const newProductRef = useRef<HTMLAnchorElement>(null);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    await deleteProduct.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display text-ink">Products</h1>
          <p className="mt-1 text-body-sm text-ink-secondary">Manage the catalog shown on the storefront.</p>
        </div>
        <Link href="/dashboard/products/new" ref={newProductRef}>
          <Button>
            <Plus className="size-4" aria-hidden />
            New product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingState label="Loading products…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to populate the storefront catalog."
          action={
            <Link href="/dashboard/products/new">
              <Button>New product</Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH className="w-14 pl-5" />
              <TH>Product</TH>
              <TH align="right">Price</TH>
              <TH>Stock</TH>
              <TH className="pr-5" />
            </TR>
          </THead>
          <TBody>
            {products.map((product) => (
              <TR key={product.id}>
                <TD className="pl-5">
                  <div className="relative size-10 overflow-hidden rounded-md bg-surface-muted">
                    <Image src={product.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                </TD>
                <TD>
                  <span className="font-semibold text-ink">{product.name}</span>
                  <span className="mt-1 flex items-center gap-1.5">
                    <Badge tone={categoryMeta[product.category].tone}>{categoryMeta[product.category].label}</Badge>
                  </span>
                </TD>
                <TD align="right" className="tabular text-ink">
                  {formatCurrency(product.price)}
                </TD>
                <TD>
                  <StockSignal stock={product.stock} />
                </TD>
                <TD className="pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      aria-label={`Edit ${product.name}`}
                      className="flex size-8 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="flex size-8 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-danger-soft hover:text-danger-text"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product"
        description={
          pendingDelete ? `"${pendingDelete.name}" will be removed from the catalog. This can't be undone.` : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        isConfirming={deleteProduct.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        restoreFocusRef={newProductRef}
      />
    </div>
  );
}
