import {
  BarChart3,
  Building2,
  Gauge,
  LayoutGrid,
  LifeBuoy,
  Package,
  Percent,
  Repeat,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
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
 * Sidebar navigation. Mirrors the Studio reference layout. "Overview" is the
 * showcase dashboard and "Products" is the bundled CRUD module; the remaining
 * items render a shared stub page so the navigation stays complete.
 */
export const navSections: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
      { label: "Products", href: "/dashboard/products", icon: Package, badge: 7 },
      { label: "Clients", href: "/dashboard/clients", icon: Building2, badge: 9 },
      { label: "People", href: "/dashboard/people", icon: Users, badge: 64 },
      { label: "Capacity", href: "/dashboard/capacity", icon: Gauge },
      { label: "Margin", href: "/dashboard/margin", icon: Percent },
      { label: "Retainers", href: "/dashboard/retainers", icon: Repeat },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Help Center", href: "/dashboard/help", icon: LifeBuoy },
      // Admins only — demonstrates role-based nav filtering.
      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["admin"] },
    ],
  },
];
