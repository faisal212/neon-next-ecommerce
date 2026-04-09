import { formatPKR } from "@/lib/store/format";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: string | number;
  className?: string;
  originalAmount?: string | number;
}

export function PriceDisplay({
  amount,
  className,
  originalAmount,
}: PriceDisplayProps) {
  return (
    <span className={cn("font-bold text-white", className)}>
      {formatPKR(amount)}
      {originalAmount != null && (
        <span className="ml-2 text-sm font-normal text-on-surface-variant line-through">
          {formatPKR(originalAmount)}
        </span>
      )}
    </span>
  );
}
