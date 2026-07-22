"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/ui";
import { ProductForm } from "@/features/product/components/ProductForm";
import { useProduct, useUpdateProduct } from "@/features/product/hooks/useProducts";
import type { ProductInput } from "@/features/product/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const updateProduct = useUpdateProduct(id);

  async function handleSubmit(input: ProductInput) {
    await updateProduct.mutateAsync(input);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-body-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>

      {isLoading ? (
        <LoadingState label="Loading product…" />
      ) : isError || !product ? (
        <ErrorState
          title="Product unavailable"
          description="This product could not be loaded."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div>
            <h1 className="text-display text-ink">Edit product</h1>
            <p className="mt-1 text-body-sm text-ink-secondary">{product.name}</p>
          </div>
          <ProductForm
            initialValue={product}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            isSubmitting={updateProduct.isPending}
          />
        </>
      )}
    </div>
  );
}
