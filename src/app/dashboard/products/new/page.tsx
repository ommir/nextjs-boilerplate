import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/product/components/ProductForm";
import { createProductAction } from "@/features/product/actions/productActions";

// Admin access is enforced by the dashboard layout; createProductAction
// re-checks it independently.
export default async function NewProductPage() {
  async function action(formData: FormData) {
    "use server";
    const result = await createProductAction(formData);
    if (result.ok) redirect("/dashboard");
    return result;
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
        <p className="mt-1 text-body-sm text-ink-secondary">
          Adds a new item to the storefront catalog.
        </p>
      </div>

      <ProductForm action={action} submitLabel="Create product" />
    </div>
  );
}
