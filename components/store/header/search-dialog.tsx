'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { useRecentSearches } from './use-recent-searches';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResultImage {
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface ResultCategory {
  nameEn: string;
}

interface SearchResult {
  id: string;
  slug: string;
  nameEn: string;
  basePricePkr: string;
  category?: ResultCategory;
  images?: ResultImage[];
}

interface ApiResponse {
  success: boolean;
  data: SearchResult[];
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 180;
const RESULT_LIMIT = 8;

function formatPrice(raw: string): string {
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return `Rs ${raw}`;
  return `Rs ${Math.round(n).toLocaleString('en-PK')}`;
}

function pickImage(images: ResultImage[] | undefined): ResultImage | null {
  if (!images || images.length === 0) return null;
  return images.find((img) => img.isPrimary) ?? images[0];
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const { recent, push: pushRecent, clear: clearRecent } = useRecentSearches();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [shortcutLabel, setShortcutLabel] = useState('⌘K');

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const platform = navigator.platform ?? navigator.userAgent ?? '';
    setShortcutLabel(/Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘K' : 'Ctrl K');
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setIsLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Debounced fetch with AbortController. Cancels in-flight requests
  // whenever the query changes or the dialog closes.
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/v1/search?q=${encodeURIComponent(trimmed)}&limit=${RESULT_LIMIT}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const json: ApiResponse = await res.json();
        if (controller.signal.aborted) return;
        setResults(Array.isArray(json.data) ? json.data.slice(0, RESULT_LIMIT) : []);
        setActiveIndex(0);
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const goToProduct = useCallback(
    (result: SearchResult) => {
      pushRecent(query);
      onOpenChange(false);
      router.push(`/products/${result.slug}`);
    },
    [onOpenChange, pushRecent, query, router],
  );

  const goToSearchPage = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) return;
      pushRecent(trimmed);
      onOpenChange(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [onOpenChange, pushRecent, router],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        goToProduct(selected);
        return;
      }
      goToSearchPage(query);
    }
  };

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;
  const hasResults = results.length > 0;
  const showEmptyQuery = !hasQuery;
  const showNoResults = hasQuery && !isLoading && !hasResults;

  const optionIds = useMemo(() => results.map((r) => `search-opt-${r.id}`), [results]);
  const activeId = hasResults ? optionIds[activeIndex] : undefined;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/*
          Backdrop: a dark radial gradient tinted warm at the top, so the
          palette looks lit from above by the same ambient orange that runs
          through the rest of the Kinetic Monolith system.
        */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_top,rgba(30,15,0,0.72),rgba(0,0,0,0.9))] supports-backdrop-filter:backdrop-blur-md data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Popup
          className="fixed left-1/2 top-[max(6vh,1rem)] z-50 w-[calc(100%-1.5rem)] max-w-[640px] -translate-x-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-4 data-open:duration-200 data-closed:animate-out data-closed:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">
            Search products
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Type to search the Refine product catalog. Use arrow keys to navigate and Enter to open a result.
          </DialogPrimitive.Description>

          {/*
            Surface: translucent near-black glass + ambient orange halo.
            The inset top highlight fakes a 1px catch of light along the
            upper edge — the "Vercel/Linear" signature.
          */}
          <div className="relative overflow-hidden rounded-xl bg-[rgba(14,14,14,0.92)] ring-1 ring-[#262626] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85),0_0_80px_-20px_rgba(255,145,92,0.28),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">

            {/* Input row */}
            <div className="relative flex h-14 items-center gap-3 border-b border-[#262626] px-5">
              <Search
                size={16}
                strokeWidth={2.25}
                className="shrink-0 text-on-surface-variant"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search the Refine catalog…"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded={hasResults}
                aria-controls={listboxId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                className="flex-1 border-0 bg-transparent text-[15px] text-white outline-none placeholder:text-[#787878] caret-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#787878] transition-colors hover:text-white"
                >
                  clear
                </button>
              )}
              <kbd
                suppressHydrationWarning
                className="hidden shrink-0 select-none rounded-[2px] bg-[#201f1f] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-on-surface-variant ring-1 ring-[#262626] sm:inline-flex"
              >
                {shortcutLabel}
              </kbd>

              {/* Scanning bar — 1px animated orange trace at the bottom edge */}
              {isLoading && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] overflow-hidden">
                  <div className="search-scan-bar h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
              )}
            </div>

            {/* Results listbox */}
            {hasResults && (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Search results"
                className="scroll-orange max-h-[60vh] overflow-y-auto py-1"
              >
                {results.map((result, i) => {
                  const image = pickImage(result.images);
                  const isActive = i === activeIndex;
                  return (
                    <li
                      key={result.id}
                      id={optionIds[i]}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goToProduct(result)}
                      className={`group relative flex h-[60px] cursor-pointer items-center gap-4 px-5 transition-[background-color,box-shadow] duration-150 ${
                        isActive
                          ? 'bg-[#1a1919] shadow-[inset_2px_0_0_0_#ff915c]'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[2px] bg-[#131313] ring-1 ring-[#262626]">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.altText ?? result.nameEn}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium leading-tight text-white">
                          {result.nameEn}
                        </div>
                        {result.category && (
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#787878]">
                            {result.category.nameEn}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 font-mono text-[13px] tabular-nums text-primary">
                        {formatPrice(result.basePricePkr)}
                      </div>
                      <ArrowRight
                        size={14}
                        className={`shrink-0 text-primary transition-[opacity,transform] duration-150 ${
                          isActive
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-1 opacity-0'
                        }`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Empty query state — recent searches or prompt */}
            {showEmptyQuery && (
              <div
                className="relative px-5 pb-5 pt-6"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(38,38,38,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(38,38,38,0.4) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  backgroundPosition: 'center',
                }}
              >
                {recent.length > 0 ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#787878]">
                        Recent
                      </span>
                      <button
                        type="button"
                        onClick={clearRecent}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#787878] transition-colors hover:text-primary"
                      >
                        clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recent.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setQuery(q);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#1a1919] px-2.5 py-1 text-[12px] text-on-surface-variant ring-1 ring-[#262626] transition-all hover:text-white hover:ring-primary/60"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#787878]">
                      Start typing
                    </div>
                    <div className="text-[13px] text-on-surface-variant">
                      Search {MIN_QUERY_LENGTH}+ characters across the catalog
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No-results state — terminal-style */}
            {showNoResults && (
              <div className="px-5 py-6">
                <div className="mb-4 font-mono text-[12px] text-[#787878]">
                  <span className="text-primary">{'>'}</span>{' '}
                  <span className="text-on-surface-variant">no matches for</span>{' '}
                  <span className="text-white">&ldquo;{trimmed}&rdquo;</span>
                </div>
                <button
                  type="button"
                  onClick={() => goToSearchPage(trimmed)}
                  className="group inline-flex items-center gap-2 rounded-[2px] bg-[#1a1919] px-3 py-1.5 text-[12px] text-on-surface-variant ring-1 ring-[#262626] transition-all hover:bg-[#201f1f] hover:text-white hover:ring-primary/60"
                >
                  <span>Search all products</span>
                  <ArrowRight
                    size={12}
                    className="text-primary transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            )}

            {/* Footer hint row — tight mono */}
            <div className="flex items-center justify-between gap-3 border-t border-[#262626] bg-[#0a0a0a] px-5 py-2.5">
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#787878]">
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-4 min-w-[14px] items-center justify-center rounded-[2px] bg-[#1a1919] px-1 text-[9px] text-on-surface-variant ring-1 ring-[#262626]">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-4 min-w-[14px] items-center justify-center rounded-[2px] bg-[#1a1919] px-1 ring-1 ring-[#262626]">
                    <CornerDownLeft size={9} className="text-on-surface-variant" />
                  </kbd>
                  open
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <kbd className="inline-flex h-4 items-center justify-center rounded-[2px] bg-[#1a1919] px-1.5 text-[9px] text-on-surface-variant ring-1 ring-[#262626]">
                    esc
                  </kbd>
                  close
                </span>
              </div>
              {hasQuery && hasResults && (
                <button
                  type="button"
                  onClick={() => goToSearchPage(trimmed)}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary transition-colors hover:text-[#ffc15c]"
                >
                  see all →
                </button>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
