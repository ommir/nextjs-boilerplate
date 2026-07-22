"use client";

import { useActionState, useState } from "react";
import { Button, Input } from "@/components/ui";
import { slugify } from "../schemas/productSchemas";
import type { ProductActionResult } from "../actions/productActions";
import type { Product, ProductCategory } from "../types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "template", label: "Template" },
  { value: "plugin", label: "Plugin" },
  { value: "asset", label: "Asset" },
  { value: "service", label: "Service" },
];

interface ProductFormProps {
  /** Pass to pre-fill and edit an existing product; omit for create. */
  initialValue?: Product;
  action: (formData: FormData) => Promise<ProductActionResult>;
  submitLabel: string;
}

type State = ProductActionResult | null;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-caption text-danger-text">{message}</span>;
}

/**
 * Shared create/edit form, submitted to a Server Action.
 *
 * Validation messages come back from the same zod schema the action enforces,
 * so what the user is told and what the server accepts cannot drift.
 */
export function ProductForm({ initialValue, action, submitLabel }: ProductFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  // Auto-derived until the user takes it over, so URLs stay readable without
  // forcing anyone to think about slugs.
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue));

  const [state, formAction, isPending] = useActionState<State, FormData>(
    (_previous, formData) => action(formData),
    null,
  );

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Name</span>
        <Input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Horizon Dashboard Kit"
        />
        <FieldError message={fieldErrors.name} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Slug</span>
        <Input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          placeholder="horizon-dashboard-kit"
        />
        <span className="text-caption text-ink-muted">
          Used in the URL: /products/{slug || "…"}
        </span>
        <FieldError message={fieldErrors.slug} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Summary</span>
        <Input
          name="summary"
          defaultValue={initialValue?.summary ?? ""}
          placeholder="One-line pitch shown on the catalog card"
        />
        <FieldError message={fieldErrors.summary} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Description</span>
        <textarea
          name="description"
          defaultValue={initialValue?.description ?? ""}
          rows={4}
          placeholder="Full product description shown on the product page"
          className="w-full rounded-sm border border-border bg-surface px-2.5 py-2 text-body-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-border-strong focus:ring-2 focus:ring-ink/10"
        />
        <FieldError message={fieldErrors.description} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Category</span>
        <select
          name="category"
          defaultValue={initialValue?.category ?? "template"}
          className="h-9 w-full rounded-sm border border-border bg-surface px-2.5 text-body-sm text-ink outline-none transition-colors focus:border-border-strong focus:ring-2 focus:ring-ink/10"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-ink">Price (USD)</span>
          <Input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialValue ? String(initialValue.price) : ""}
            placeholder="189"
          />
          <FieldError message={fieldErrors.price} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-ink">Stock</span>
          <Input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={initialValue ? String(initialValue.stock) : "0"}
            placeholder="12"
          />
          <FieldError message={fieldErrors.stock} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Rating</span>
        <Input
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          defaultValue={initialValue ? String(initialValue.rating) : "0"}
        />
        <FieldError message={fieldErrors.rating} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Product image</span>
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="text-body-sm text-ink-secondary file:mr-3 file:rounded-sm file:border file:border-border file:bg-surface file:px-2.5 file:py-1 file:text-body-sm file:font-semibold file:text-ink hover:file:bg-surface-hover"
        />
        <span className="text-caption text-ink-muted">
          PNG, JPEG, WebP or AVIF, up to 2 MB.{" "}
          {initialValue ? "Leave empty to keep the current image." : "Optional."}
        </span>
      </label>

      <label className="flex items-center gap-2">
        <input
          name="isPublished"
          type="checkbox"
          defaultChecked={initialValue?.isPublished ?? true}
          className="size-4 rounded-sm border-border accent-ink"
        />
        <span className="text-body-sm text-ink">Visible on the storefront</span>
      </label>

      {state && !state.ok && (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text">
          {state.error}
        </p>
      )}

      <Button type="submit" isLoading={isPending} className="mt-1 w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
