'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { SearchDialog } from './search-dialog';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  // Lazy-mount flag: once the user has opened the palette for the first time,
  // we keep the dialog subtree alive so re-opens are instant. The flag is
  // never reset to false — it's a one-way switch to protect the initial
  // header bundle size.
  const [hasMounted, setHasMounted] = useState(false);

  const openPalette = useCallback(() => {
    setHasMounted(true);
    setOpen(true);
  }, []);

  // Global Cmd/Ctrl+K shortcut. Matches conventional command-palette UX.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isK = event.key === 'k' || event.key === 'K';
      if (!isK) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setHasMounted(true);
      setOpen((prev) => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search products"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPalette}
        className="p-2 text-on-surface-variant transition-colors hover:text-primary"
      >
        <Search size={20} />
      </button>
      {hasMounted ? <SearchDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
