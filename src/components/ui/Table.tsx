import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, composable table primitives styled per DESIGN_SYSTEM.md §8.3.
 * Numeric cells should pass `align="right"` for tabular alignment.
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-body-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("", className)} {...props} />;
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-border-subtle last:border-0 transition-colors hover:bg-surface-hover",
        className,
      )}
      {...props}
    />
  );
}

type CellAlign = "left" | "right" | "center";
const alignClass: Record<CellAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function TH({
  className,
  align = "left",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: CellAlign }) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-label text-ink-muted font-semibold uppercase",
        alignClass[align],
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  align = "left",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { align?: CellAlign }) {
  return (
    <td className={cn("px-3 py-2.5 text-ink-secondary align-middle", alignClass[align], className)} {...props} />
  );
}
