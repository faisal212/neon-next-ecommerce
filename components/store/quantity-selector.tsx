"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const atMin = value <= min;
  const atMax = max != null && value >= max;

  return (
    <div className="flex items-center rounded bg-surface-container-low">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || atMin}
        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-[2rem] px-3 text-center text-sm font-bold">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || atMax}
        className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
