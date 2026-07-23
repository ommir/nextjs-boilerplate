import "server-only";

import { createClient } from "@/lib/supabase/server";
import { toProduct, toProductInsert } from "../mappers/productMapper";
import type { Product, ProductInput, ProductListParams } from "../types";
import type { ProductRepository } from "./productRepository";

const COLUMNS =
  "id, slug, name, summary, description, price_cents, category, image_path, rating, stock, is_published";

/**
 * Postgres-backed products.
 *
 * Note what is *not* here: any filtering on `is_published`, or any check that
 * the caller is an admin. Both are enforced by RLS, so a bug in this file
 * cannot leak a draft or let a member write. Re-implementing those checks in
 * TypeScript would add a second source of truth that could drift from the
 * policies.
 */
export const supabaseProductRepository: ProductRepository = {
  async list({ category, search }: ProductListParams): Promise<Product[]> {
    const supabase = await createClient();
    let query = supabase.from("products").select(COLUMNS).order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (search?.trim()) {
      const term = search.trim();
      // `%` and `,` are meaningful in PostgREST's filter grammar; escaping them
      // keeps a search box from turning into a filter-injection primitive.
      const safe = term.replace(/[%,()]/g, " ");
      query = query.or(`name.ilike.%${safe}%,summary.ilike.%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toProduct);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? toProduct(data) : null;
  },

  async getById(id: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? toProduct(data) : null;
  },

  async create(input: ProductInput, authorId: string): Promise<Product> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({ ...toProductInsert(input), created_by: authorId })
      .select(COLUMNS)
      .single();

    if (error) throw new Error(translateWriteError(error.message, error.code));
    return toProduct(data);
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update(toProductInsert(input))
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error) throw new Error(translateWriteError(error.message, error.code));
    return toProduct(data);
  },

  async remove(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(translateWriteError(error.message, error.code));
  },
};

/**
 * Turn Postgres error codes into something a person can act on, without
 * echoing the raw database message back to the browser.
 */
function translateWriteError(message: string, code?: string): string {
  if (code === "23505") return "A product with that slug already exists.";
  if (code === "42501") return "You do not have permission to change products.";
  if (code === "23514") return "That value is outside the allowed range.";
  return message;
}
