"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Category {
  id: string;
  slug: string;
  nameEn: string;
  productCount: number;
}

interface CategoryMobileFiltersProps {
  categories: Category[];
  currentSlug: string;
  minPrice?: string;
  maxPrice?: string;
}

export function CategoryMobileFilters({
  categories,
  currentSlug,
  minPrice,
  maxPrice,
}: CategoryMobileFiltersProps) {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) return null;

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
          <SlidersHorizontal size={16} />
          Filters
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="border-outline-variant/10 bg-surface max-h-[85vh] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-black text-white">
              Filters
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8 px-4 pb-8">
            {/* ── Categories ──────────────────────────── */}
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Categories
              </h4>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const isActive = cat.slug === currentSlug;
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-surface-container-high font-bold text-primary"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-white"
                      }`}
                    >
                      {cat.nameEn}
                      {cat.productCount > 0 && (
                        <span className="text-[10px] text-on-surface-variant/50">
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ── Price Range ─────────────────────────── */}
            <div>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Price Range
              </h4>
              <form
                action={`/categories/${currentSlug}`}
                method="GET"
                className="space-y-3"
                onSubmit={() => setOpen(false)}
              >
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={minPrice ?? ""}
                    min={0}
                    className="w-full rounded bg-surface-container-highest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="flex items-center text-on-surface-variant text-xs">
                    –
                  </span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={maxPrice ?? ""}
                    min={0}
                    className="w-full rounded bg-surface-container-highest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded bg-primary/10 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
                >
                  Apply
                </button>
                {(minPrice || maxPrice) && (
                  <Link
                    href={`/categories/${currentSlug}`}
                    onClick={() => setOpen(false)}
                    className="block text-center text-xs text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Clear filter
                  </Link>
                )}
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
