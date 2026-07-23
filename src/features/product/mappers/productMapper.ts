import { env } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";
import type { Product, ProductInput } from "../types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

/**
 * Exactly the columns the repository selects.
 *
 * Narrower than `ProductRow` on purpose: queries ask for what they need rather
 * than `select *`, and typing the mapper against the full row would force every
 * query to over-fetch just to satisfy the compiler.
 */
export type ProductRowSelection = Pick<
  ProductRow,
  | "id"
  | "slug"
  | "name"
  | "summary"
  | "description"
  | "price_cents"
  | "category"
  | "image_path"
  | "rating"
  | "stock"
  | "is_published"
>;

const PRODUCT_IMAGE_BUCKET = "product-images";

/** Placeholder shown when a product has no uploaded image. */
const FALLBACK_IMAGE = "https://picsum.photos/seed/studio-product/640/400";

/**
 * Resolve a Storage object path to a public URL.
 *
 * Kept here rather than stored in the row so the bucket or project can change
 * without a data migration.
 */
export function resolveImageUrl(imagePath: string | null): string {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  return `${env.supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${imagePath}`;
}

/** Database row -> domain model. Cents become dollars exactly once, here. */
export function toProduct(row: ProductRowSelection): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    price: row.price_cents / 100,
    category: row.category,
    imageUrl: resolveImageUrl(row.image_path),
    rating: Number(row.rating),
    stock: row.stock,
    isPublished: row.is_published,
  };
}

/**
 * Domain input -> database row.
 *
 * `Math.round` is doing real work: `19.99 * 100` is `1998.9999999999998` in
 * IEEE 754, and truncating that would quietly undercharge by a cent.
 */
export function toProductInsert(input: ProductInput): ProductInsert {
  return {
    slug: input.slug,
    name: input.name,
    summary: input.summary,
    description: input.description,
    price_cents: Math.round(input.price * 100),
    category: input.category,
    rating: input.rating,
    stock: input.stock,
    image_path: input.imagePath ?? null,
    is_published: input.isPublished ?? true,
  };
}
