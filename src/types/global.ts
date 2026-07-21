/**
 * Cross-cutting types shared across features.
 * Feature-specific types live in `src/features/<feature>/types`.
 */

/** Pagination envelope returned alongside list responses. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * Consistent API response envelope. Every service returns this shape so the UI
 * can branch on `success` without guessing at per-endpoint conventions.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: PaginationMeta;
}

/** Finite-state descriptor for async UI (used by components not backed by React Query). */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type Nullable<T> = T | null;

/** Semantic status shared by badges, dots, and progress bars. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";
