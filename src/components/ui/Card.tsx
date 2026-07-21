import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Removes default padding when you need edge-to-edge content (e.g. tables). */
  flush?: boolean;
};

/** Surface container — the primary building block of the layout (DESIGN_SYSTEM.md §5). */
export function Card({ className, flush = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-xs",
        !flush && "p-5",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned slot for actions (buttons, links). */
  action?: ReactNode;
  className?: string;
}

/** Standard card header with a title, optional description, and an action slot. */
export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-section text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-caption text-ink-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
