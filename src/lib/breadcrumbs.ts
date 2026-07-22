import { navSections } from "@/config/nav";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Build breadcrumbs from the current path. The dashboard's IA is flat —
 * `/dashboard` is the Products index itself, with `/new` and `/[id]/edit` as
 * its only sub-routes — so this stays a simple last-segment switch rather
 * than the deeper section-lookup the old multi-section dashboard needed.
 */
export function getBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean); // e.g. ["dashboard", "products", "new"]
  const isRoot = segments.length <= 1;

  const crumbs: Crumb[] = [{ label: "Products", href: isRoot ? undefined : "/dashboard" }];
  if (isRoot) return crumbs;

  const last = segments[segments.length - 1]!;
  if (last === "new") {
    crumbs.push({ label: "New product" });
  } else if (last === "edit") {
    crumbs.push({ label: "Edit product" });
  } else {
    const sectionHref = `/dashboard/${segments[1]}`;
    const navItem = navSections.flatMap((s) => s.items).find((i) => i.href === sectionHref);
    crumbs.push({ label: navItem?.label ?? segments[1]! });
  }

  return crumbs;
}
