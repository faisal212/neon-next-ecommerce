'use client';

import { Search } from 'lucide-react';

export function SearchTrigger() {
  return (
    <button
      type="button"
      aria-label="Search"
      className="text-on-surface-variant hover:text-primary transition-colors p-2"
    >
      <Search size={20} />
    </button>
  );
}
