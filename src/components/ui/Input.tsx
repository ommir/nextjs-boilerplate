import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading adornment (usually an icon). */
  leading?: ReactNode;
  /** Optional trailing adornment (icon, keyboard hint, etc.). */
  trailing?: ReactNode;
}

/** Text input following DESIGN_SYSTEM.md §8.9. Wrap with `<label>` for a11y. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, trailing, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-sm border border-border bg-surface px-2.5",
        "transition-colors focus-within:border-border-strong",
        "focus-within:ring-2 focus-within:ring-ink/10",
        className,
      )}
    >
      {leading && <span className="shrink-0 text-ink-muted">{leading}</span>}
      <input
        ref={ref}
        className={cn(
          "w-full bg-transparent text-body-sm text-ink outline-none",
          "placeholder:text-ink-muted",
        )}
        {...props}
      />
      {trailing && <span className="shrink-0 text-ink-muted">{trailing}</span>}
    </div>
  );
});
