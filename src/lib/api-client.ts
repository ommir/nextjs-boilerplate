import { env } from "@/config/env";
import type { ApiResponse } from "@/types/global";

/** Error thrown for any non-2xx API response, carrying the HTTP status. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Abort the request after this many ms. Defaults to 15s. */
  timeoutMs?: number;
}

/**
 * Typed `fetch` wrapper. Attaches JSON headers + bearer token, enforces a
 * timeout, and normalises errors into {@link ApiError}. Returns the parsed
 * response body typed as `T`.
 *
 * @throws {ApiError} when the response status is not in the 2xx range.
 */
export async function apiRequest<T>(
  path: string,
  { body, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<T>
      | T
      | null;

    if (!response.ok) {
      const message =
        (payload as ApiResponse<T> | null)?.error ??
        `Request to ${path} failed with ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    // Support both the ApiResponse envelope and bare payloads.
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as ApiResponse<T>).data as T;
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(`Request to ${path} timed out`, 408);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}
