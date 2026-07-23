import { z } from "zod";
import { Constants } from "@/lib/supabase/database.types";

/**
 * Validation for the product boundary.
 *
 * These bounds intentionally mirror the CHECK constraints in migration 0003.
 * The database is the real enforcement point — this layer exists so a user
 * gets a readable message instead of a Postgres error code, not so the
 * database can relax.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Derive a URL-safe slug from a product name. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name.").max(120, "Name is too long."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(80, "Slug is too long.")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens."),
  summary: z
    .string()
    .trim()
    .min(1, "Enter a short summary.")
    .max(200, "Keep the summary under 200 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Enter a description.")
    .max(4000, "Description is too long."),
  // Prices arrive from a number input as strings; coerce, then bound them the
  // same way price_cents is bounded in SQL.
  price: z.coerce
    .number<number>()
    .min(0, "Price cannot be negative.")
    .max(1_000_000, "That price is implausible.")
    .refine((value) => Number.isFinite(value), "Enter a valid price."),
  category: z.enum(Constants.public.Enums.product_category),
  rating: z.coerce.number<number>().min(0, "Rating must be 0–5.").max(5, "Rating must be 0–5."),
  stock: z.coerce
    .number<number>()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(1_000_000, "That stock level is implausible."),
  imagePath: z.string().max(512).nullish(),
  isPublished: z.coerce.boolean<boolean>().default(true),
});

export type ProductSchemaInput = z.infer<typeof productSchema>;

/**
 * Upload constraints, mirroring the bucket's own `allowed_mime_types` and
 * `file_size_limit`. Storage rejects violations regardless; checking here just
 * saves a round trip and produces a better message.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const productImageSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Choose an image file.")
  .refine((file) => file.size <= MAX_IMAGE_BYTES, "Images must be 2 MB or smaller.")
  .refine(
    (file) => (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type),
    "Use a PNG, JPEG, WebP or AVIF image.",
  );

/**
 * Build the Storage object path for an upload.
 *
 * The path is derived entirely from a server-generated UUID and the *validated*
 * MIME type — never from `file.name`. A user-supplied filename is an untrusted
 * string and is the classic path-traversal vector (`../../other-bucket/x.png`).
 */
export function buildImagePath(mimeType: string, uuid: string): string {
  const extension = EXTENSION_BY_TYPE[mimeType] ?? "bin";
  return `products/${uuid}.${extension}`;
}
