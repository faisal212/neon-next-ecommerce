interface StockIndicatorProps {
  quantityOnHand: number;
  quantityReserved: number;
  lowStockThreshold: number;
}

export function StockIndicator({
  quantityOnHand,
  quantityReserved,
  lowStockThreshold,
}: StockIndicatorProps) {
  const available = quantityOnHand - quantityReserved;

  if (available <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
        <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
        Out of Stock
      </span>
    );
  }

  if (available <= lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-tertiary">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-tertiary" />
        Only {available} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-500">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
      In Stock
    </span>
  );
}
