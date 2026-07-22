import { Package, Settings, type LucideIcon } from "lucide-react";
import type { UserRole } from "@/features/auth/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional count badge shown on the right of the item. */
  badge?: number;
  /** Roles allowed to see this item. Omit to allow everyone. */
  roles?: UserRole[];
}

export interface NavSection {
  /** Uppercase section label ("MAIN MENU"). */
  title: string;
  items: NavItem[];
}

/**
 * Dashboard navigation. The storefront (`/`) owns product browsing; this
 * admin area is scoped to the Products CRUD example plus one role-gated
 * settings stub demonstrating role-based nav filtering.
 */
export const navSections: NavSection[] = [
  {
    title: "Main Menu",
    items: [{ label: "Products", href: "/dashboard", icon: Package }],
  },
  {
    title: "Manage",
    items: [
      // Admins only — demonstrates role-based nav filtering.
      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
    ],
  },
];
