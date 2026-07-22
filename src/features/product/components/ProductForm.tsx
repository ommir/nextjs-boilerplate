"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import type { Product, ProductCategory, ProductInput } from "../types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "template", label: "Template" },
  { value: "plugin", label: "Plugin" },
  { value: "asset", label: "Asset" },
  { value: "service", label: "Service" },
];

interface ProductFormProps {
  /** Pass to pre-fill and edit an existing product; omit for create. */
  initialValue?: Product;
  onSubmit: (input: ProductInput) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}

interface FormErrors {
  name?: string;
  summary?: string;
  price?: string;
  stock?: string;
  imageUrl?: string;
}

interface RawValues {
  name: string;
  summary: string;
  price: string;
  stock: string;
  imageUrl: string;
}

/** Boundary validation — required fields, non-negative numeric price/stock. */
function validate(values: RawValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (!values.summary.trim()) errors.summary = "Summary is required.";
  if (!values.imageUrl.trim()) errors.imageUrl = "Image URL is required.";

  const price = Number(values.price);
  if (values.price.trim() === "" || Number.isNaN(price) || price < 0) {
    errors.price = "Enter a price of 0 or more.";
  }

  const stock = Number(values.stock);
  if (values.stock.trim() === "" || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
    errors.stock = "Enter a whole number of 0 or more.";
  }

  return errors;
}

/** Shared create/edit form for the dashboard Products CRUD example. */
export function ProductForm({ initialValue, onSubmit, submitLabel, isSubmitting = false }: ProductFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [summary, setSummary] = useState(initialValue?.summary ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(initialValue?.category ?? "template");
  const [price, setPrice] = useState(initialValue ? String(initialValue.price) : "");
  const [stock, setStock] = useState(initialValue ? String(initialValue.stock) : "");
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate({ name, summary, price, stock, imageUrl });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit({
      name: name.trim(),
      summary: summary.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl.trim(),
      rating: initialValue?.rating ?? 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Horizon Dashboard Kit" />
        {errors.name && <span className="text-caption text-danger-text">{errors.name}</span>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Summary</span>
        <Input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line pitch shown on the catalog card"
        />
        {errors.summary && <span className="text-caption text-danger-text">{errors.summary}</span>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Full product description shown on the product page"
          className="w-full rounded-sm border border-border bg-surface px-2.5 py-2 text-body-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-border-strong focus:ring-2 focus:ring-ink/10"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
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
          <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="189" />
          {errors.price && <span className="text-caption text-danger-text">{errors.price}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-body-sm font-semibold text-ink">Stock</span>
          <Input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="12" />
          {errors.stock && <span className="text-caption text-danger-text">{errors.stock}</span>}
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Image URL</span>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        {errors.imageUrl && <span className="text-caption text-danger-text">{errors.imageUrl}</span>}
      </label>

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
