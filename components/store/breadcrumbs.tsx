import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="text-on-surface-variant"
                />
              )}
              {isLast ? (
                <span className="text-sm font-medium text-primary">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className="text-sm text-on-surface-variant transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
