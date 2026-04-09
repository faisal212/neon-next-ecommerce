"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: PaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between pt-4 text-[13px] text-muted-foreground">
      <span>
        Showing {start}-{end} of {total}
      </span>
      <div className="flex gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-xs"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                p === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-zinc-600"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current, "...", total);
  }
  return pages;
}
