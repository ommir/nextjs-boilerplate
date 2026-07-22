import { StatusDot } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/global";

const LOW_STOCK_THRESHOLD = 10;

interface StockSignalProps {
  stock: number;
  className?: string;
}

function toneAndLabel(stock: number): { tone: StatusTone; label: string } {
  if (stock === 0) return { tone: "danger", label: "Sold out" };
  if (stock <= LOW_STOCK_THRESHOLD) return { tone: "warning", label: `Only ${stock} left` };
  return { tone: "success", label: "In stock" };
}

/**
 * Inventory status signal. Reuses the same escalation tokens the dashboard
 * uses for utilization bars (DESIGN_SYSTEM.md §2.4), inverted for stock:
 * plenty -> success, low -> warning, none -> danger. Always paired with a
 * label, never color alone.
 */
export function StockSignal({ stock, className }: StockSignalProps) {
  const { tone, label } = toneAndLabel(stock);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-caption text-ink-secondary", className)}>
      <StatusDot tone={tone} />
      {label}
    </span>
  );
}
