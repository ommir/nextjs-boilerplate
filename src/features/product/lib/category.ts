import type { ProductCategory } from "../types";
import type { StatusTone } from "@/types/global";

/** Shared category display metadata — one source of truth for label + tone. */
export const categoryMeta: Record<ProductCategory, { label: string; tone: StatusTone }> = {
  template: { label: "Template", tone: "neutral" },
  plugin: { label: "Plugin", tone: "info" },
  asset: { label: "Asset", tone: "warning" },
  service: { label: "Service", tone: "success" },
};
