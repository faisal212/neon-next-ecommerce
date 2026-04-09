"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number; // for sorting/searching
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

type SortDir = "asc" | "desc" | null;

// ── Component ────────────────────────────────────────────

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  pageSize = 10,
  searchPlaceholder = "Search...",
  onRowClick,
  emptyMessage = "No data found",
  stickyHeader = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const searchableColumns = columns.filter((c) => c.searchable || c.getValue);

  // ── Filter ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchableColumns.some((col) => {
        const val = col.getValue
          ? String(col.getValue(row))
          : "";
        return val.toLowerCase().includes(q);
      })
    );
  }, [data, search, searchableColumns]);

  // ── Sort ───────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.getValue) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = col.getValue!(a);
      const bVal = col.getValue!(b);
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // ── Paginate ───────────────────────────────────────────
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, sorted.length);

  return (
    <div>
      {/* Search bar */}
      {searchableColumns.length > 0 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-[13px] text-foreground outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.06)]"
          />
          {search && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
              {sorted.length} result{sorted.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={`border-zinc-800/80 hover:bg-transparent ${stickyHeader ? "sticky top-0 z-10 bg-card" : ""}`}>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`text-[11px] font-semibold uppercase tracking-wider text-zinc-500 ${
                      col.sortable ? "cursor-pointer select-none" : ""
                    } ${col.headerClassName || ""}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        <span className="text-zinc-600">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-emerald-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-[13px] text-zinc-500">
                        {search ? "No results match your search" : emptyMessage}
                      </div>
                      {search && (
                        <button
                          onClick={() => handleSearch("")}
                          className="text-[12px] text-emerald-400 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((row, i) => (
                  <TableRow
                    key={(row as Record<string, unknown>).id as string || i}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-zinc-800/50 transition-colors duration-150 ${
                      onRowClick
                        ? "cursor-pointer hover:bg-white/[0.02]"
                        : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`text-[13px] ${col.className || ""}`}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[12px] text-zinc-500">
            {start}–{end} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-[12px] text-zinc-600"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-all duration-150 ${
                    p === page
                      ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                      : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
