import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  /** Optional image URL; falls back to initials on absence or load error. */
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-caption",
  lg: "size-10 text-body-sm",
} as const;

/** Circular avatar with an initials fallback. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill",
        "bg-surface-muted font-semibold text-ink-secondary select-none",
        sizeStyles[size],
        className,
      )}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars are tiny, remote, and non-LCP.
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
