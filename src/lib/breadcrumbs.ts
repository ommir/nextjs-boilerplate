import { navSections } from "@/config/nav";

export interface Crumb {
  label: string;
  href?: string;
}

/** Build breadcrumbs from the current path using the nav config for labels. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Overview", href: "/dashboard" }];
  const segments = pathname.split("/").filter(Boolean); // e.g. ["dashboard", "products", "id"]

  if (segments.length <= 1) {
    crumbs.push({ label: "Agency Operations" });
    return crumbs;
  }

  const sectionHref = `/dashboard/${segments[1]}`;
  const navItem = navSections.flatMap((s) => s.items).find((i) => i.href === sectionHref);
  crumbs.push({ label: navItem?.label ?? segments[1]!, href: segments.length > 2 ? sectionHref : undefined });

  if (segments.length > 2) crumbs.push({ label: "Detail" });
  return crumbs;
}
