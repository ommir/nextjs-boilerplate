import type { Product } from "../types";

/** Seed catalog used when no backend API is configured. */
export const mockProducts: Product[] = [
  {
    id: "prd_horizon",
    name: "Horizon Dashboard Kit",
    summary: "40+ analytics screens with the Studio design system baked in.",
    description:
      "A production-grade dashboard kit covering overview, tables, billing, and settings. Ships with tokens, dark-ready theming, and fully typed components so your team starts from a real foundation instead of a blank canvas.",
    price: 189,
    category: "template",
    imageUrl: "https://picsum.photos/seed/horizon/640/400",
    rating: 4.8,
    stock: 12,
  },
  {
    id: "prd_atlas",
    name: "Atlas Auth Module",
    summary: "Drop-in JWT + OAuth flows with RBAC and session guards.",
    description:
      "Email/password and OAuth-ready authentication with role-based access control, middleware guards, and a Zustand session store. Wire it to your backend or run the bundled mock adapter in minutes.",
    price: 89,
    category: "plugin",
    imageUrl: "https://picsum.photos/seed/atlas/640/400",
    rating: 4.6,
    stock: 34,
  },
  {
    id: "prd_meridian",
    name: "Meridian Icon Pack",
    summary: "620 line icons tuned for 1.5px stroke interfaces.",
    description:
      "A cohesive icon set drawn on a 24px grid to match the Studio aesthetic. Delivered as optimized SVGs and a tree-shakeable React package.",
    price: 39,
    category: "asset",
    imageUrl: "https://picsum.photos/seed/meridian/640/400",
    rating: 4.9,
    stock: 0,
  },
  {
    id: "prd_summit",
    name: "Summit Onboarding Audit",
    summary: "A senior engineer reviews your setup and hands back a plan.",
    description:
      "A focused engagement: we review your repo, architecture, and DX, then deliver a prioritized report with concrete next steps and a reference implementation for the trickiest piece.",
    price: 1200,
    category: "service",
    imageUrl: "https://picsum.photos/seed/summit/640/400",
    rating: 5.0,
    stock: 5,
  },
  {
    id: "prd_cobalt",
    name: "Cobalt Data Grid",
    summary: "Virtualized, sortable, filterable table for large datasets.",
    description:
      "A headless data grid with column virtualization, multi-sort, and server-side pagination hooks. Themed with Studio tokens out of the box.",
    price: 129,
    category: "plugin",
    imageUrl: "https://picsum.photos/seed/cobalt/640/400",
    rating: 4.7,
    stock: 21,
  },
  {
    id: "prd_verve",
    name: "Verve Marketing Pages",
    summary: "12 conversion-focused landing sections, fully responsive.",
    description:
      "Hero, features, pricing, testimonials, and CTA sections engineered for Core Web Vitals. Copy slots and imagery are easy to swap for your brand.",
    price: 149,
    category: "template",
    imageUrl: "https://picsum.photos/seed/verve/640/400",
    rating: 4.5,
    stock: 18,
  },
];
