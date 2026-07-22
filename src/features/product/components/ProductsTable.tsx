"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { deleteProductAction } from "../actions/productActions";
import { categoryMeta } from "../lib/category";
import { StockSignal } from "./StockSignal";
import type { Product } from "../types";

/**
 * Admin catalog table.
 *
 * Rows arrive from a Server Component; deletion goes through a Server Action
 * that re-checks admin rights. Hiding this page from members is a courtesy —
 * the action and RLS are what actually refuse them.
 */
export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  // Focus lands here after a delete, since the row's own button is gone by then.
  const newProductRef = useRef<HTMLAnchorElement>(null);

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;

    startDelete(async () => {
      const result = await deleteProductAction(target.id);
      setPendingDelete(null);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display text-ink">Products</h1>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Manage the catalog shown on the storefront.
          </p>
        </div>
        <Link href="/dashboard/products/new" ref={newProductRef}>
          <Button>
            <Plus className="size-4" aria-hidden />
            New product
          </Button>
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text">
          {error}
        </p>
      )}

      {products.length === 0 ? (
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
                    <Badge tone={categoryMeta[product.category].tone}>
                      {categoryMeta[product.category].label}
                    </Badge>
                    {!product.isPublished && <Badge tone="neutral">Draft</Badge>}
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
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from the catalog. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        restoreFocusRef={newProductRef}
      />
    </div>
  );
}
