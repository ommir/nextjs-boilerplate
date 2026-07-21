/**
 * Centralised, validated access to environment variables.
 *
 * Reading env vars through this module (instead of `process.env` scattered
 * everywhere) gives us one boundary to validate at and a single place to reason
 * about what is public vs. server-only.
 */

const PLACEHOLDER_API_URL = "https://api.example.com";

export const env = {
  /** Public base URL for the backend API. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? PLACEHOLDER_API_URL,
  /** Public application name. */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Studio",
  /** True in `next dev`. */
  isDev: process.env.NODE_ENV === "development",
} as const;

/**
 * When the API URL is still the placeholder, services transparently serve
 * in-memory mock data so the boilerplate runs with zero backend setup.
 */
export const isMockMode = env.apiUrl === PLACEHOLDER_API_URL;
