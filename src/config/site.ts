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
} as const;
