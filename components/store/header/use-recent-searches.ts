'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cover:recent-searches';
const MAX_ENTRIES = 5;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function write(next: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode — silently ignore
  }
}

export function useRecentSearches() {
  // Start empty on SSR and first client render so hydration matches.
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(read());
  }, []);

  const push = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const deduped = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())];
      const next = deduped.slice(0, MAX_ENTRIES);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, push, clear };
}
