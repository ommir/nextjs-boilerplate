"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/product/components/ProductForm";
import { useCreateProduct } from "@/features/product/hooks/useProducts";
import type { ProductInput } from "@/features/product/types";

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  async function handleSubmit(input: ProductInput) {
    await createProduct.mutateAsync(input);
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

      <div>
        <h1 className="text-display text-ink">New product</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">Adds a new item to the storefront catalog.</p>
      </div>

      <ProductForm onSubmit={handleSubmit} submitLabel="Create product" isSubmitting={createProduct.isPending} />
    </div>
  );
}
