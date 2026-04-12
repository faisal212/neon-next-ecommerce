import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: { text: string; href: string };
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {label && (
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {label}
          </span>
        )}
        <h2 className="text-4xl font-black tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 text-on-surface-variant">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm font-bold text-primary hover:underline"
        >
          {action.text}
        </Link>
      )}
    </div>
  );
}
