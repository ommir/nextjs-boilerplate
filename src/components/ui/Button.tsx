import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-ink-inverse hover:bg-brand-hover disabled:hover:bg-brand",
  secondary:
    "bg-surface text-ink border border-border hover:bg-surface-hover",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-hover hover:text-ink",
  danger: "bg-danger text-ink-inverse hover:brightness-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-caption gap-1.5",
  md: "h-9 px-3 text-body-sm gap-1.5",
};

/**
 * Primary action control. See DESIGN_SYSTEM.md §8.8 for variant semantics.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-semibold whitespace-nowrap",
        "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
