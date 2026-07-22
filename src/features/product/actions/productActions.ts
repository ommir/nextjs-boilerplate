"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/config/env";
import { getProductRepository } from "../repositories/productRepository";
import {
  buildImagePath,
  productImageSchema,
  productSchema,
} from "../schemas/productSchemas";
import type { Product } from "../types";

/**
 * Product Server Actions.
 *
 * Every one of these is a publicly reachable HTTP endpoint. The fact that the
 * only link to them is behind an admin-gated page is not a control, so each
 * begins with `requireAdmin()`. RLS refuses the write independently — this
 * layer exists so the user gets a redirect instead of a raw 42501.
 */

export type ProductActionResult =
  | { ok: true; product?: Product }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const PRODUCT_IMAGE_BUCKET = "product-images";

function toFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

/**
 * Upload a product image and return its Storage object path.
 *
 * The stored path is built from a server-generated UUID and the validated MIME
 * type — `file.name` is never used to construct it.
 */
async function uploadImage(file: File): Promise<string> {
  const parsed = productImageSchema.safeParse(file);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "That image was rejected.");
  }

  const path = buildImagePath(file.type, crypto.randomUUID());
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return path;
}

async function readForm(
  formData: FormData,
): Promise<
  | { ok: true; data: ReturnType<typeof productSchema.parse> & { imagePath?: string | null } }
  | { ok: false; result: ProductActionResult }
> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    rating: formData.get("rating"),
    stock: formData.get("stock"),
    isPublished: formData.get("isPublished") !== null,
  });

  if (!parsed.success) {
    return {
      ok: false,
      result: {
        ok: false,
        error: "Check the highlighted fields.",
        fieldErrors: toFieldErrors(parsed.error),
      },
    };
  }

  const image = formData.get("image");
  let imagePath: string | null | undefined;

  // Mock mode has no Storage to upload to; the form still works, just without
  // a real image.
  if (image instanceof File && image.size > 0 && !isMockMode) {
    try {
      imagePath = await uploadImage(image);
    } catch (error) {
      return {
        ok: false,
        result: {
          ok: false,
          error: error instanceof Error ? error.message : "Image upload failed.",
        },
      };
    }
  }

  return { ok: true, data: { ...parsed.data, imagePath } };
}

export async function createProductAction(
  formData: FormData,
): Promise<ProductActionResult> {
  const admin = await requireAdmin();

  const form = await readForm(formData);
  if (!form.ok) return form.result;

  try {
    const product = await getProductRepository().create(form.data, admin.id);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true, product };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function updateProductAction(
  id: string,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireAdmin();

  const form = await readForm(formData);
  if (!form.ok) return form.result;

  try {
    // Omitting imagePath when no new file was chosen keeps the existing image
    // rather than clearing it.
    const existing =
      form.data.imagePath === undefined
        ? await getProductRepository().getById(id)
        : null;

    const product = await getProductRepository().update(id, {
      ...form.data,
      imagePath:
        form.data.imagePath === undefined
          ? extractImagePath(existing?.imageUrl)
          : form.data.imagePath,
    });

    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath(`/products/${product.slug}`);
    return { ok: true, product };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  await requireAdmin();

  try {
    await getProductRepository().remove(id);
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete." };
  }
}

/** Recover the object path from a public Storage URL, for round-tripping. */
function extractImagePath(imageUrl: string | undefined): string | null {
  if (!imageUrl) return null;
  const marker = `/${PRODUCT_IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  return index === -1 ? null : imageUrl.slice(index + marker.length);
}
