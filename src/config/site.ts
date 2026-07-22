import { env } from "./env";

/** Static, app-wide metadata consumed by layouts and the document head. */
export const siteConfig = {
  name: env.appName,
  description:
    "A production-ready, feature-based Next.js frontend boilerplate with the Studio design system.",
  tagline: "Design System Storefront",
  /** Where an authenticated user lands. */
  homeUrl: "/dashboard",
  /** Where an unauthenticated user is sent. */
  loginUrl: "/login",
  /**
   * Fallback for a signed-in user who lacks the role for a page. Must be
   * reachable by the least-privileged account — pointing it at `homeUrl`
   * creates a redirect loop, since every dashboard route requires admin.
   */
  storefrontUrl: "/",
} as const;
