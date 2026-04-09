import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
