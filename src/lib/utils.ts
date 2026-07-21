import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge ships a hardcoded font-size validator (`text-{xs,sm,base,lg,xl,2xl,...}`
 * or an arbitrary `text-[...]` value) — it has no way to know about this
 * project's custom `@theme` font-size scale (`text-display`, `text-metric`,
 * `text-section`, `text-body`, `text-body-sm`, `text-label`, `text-caption`,
 * defined in globals.css). Without registering them, its text-color group's
 * catch-all validator swallows them too, so e.g. `text-body-sm` silently
 * collides with a real text-color utility like `text-ink-inverse` in the same
 * `cn()` call — whichever comes later wins and the other is dropped (this is
 * exactly what made primary-variant Button text invisible: `text-ink-inverse`
 * lost to `text-body-sm`). Registering the scale here fixes it everywhere.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "metric", "section", "body", "body-sm", "label", "caption"] }],
    },
  },
});

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * `cn("px-2", condition && "px-4")` -> `"px-4"`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as compact USD (e.g. 180000 -> "$180K", 1400 -> "$1.4K").
 * Sub-$1K values render as plain currency ("$600", not "$0.6K") — decided for
 * readability over matching the reference design 1:1.
 * @param value Amount in whole currency units.
 */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number as full USD (e.g. 1499.9 -> "$1,499.90").
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a 0–100 number as a percentage string (e.g. 68 -> "68%").
 */
export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/**
 * Produce a short, stable initials string from a full name.
 * "Dana Cole" -> "DC".
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Clamp a number into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Promise-based delay, handy for demoing loading states against mock services. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
