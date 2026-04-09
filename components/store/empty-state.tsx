import { GradientButton } from "./gradient-button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center text-on-surface-variant">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-on-surface-variant">{description}</p>
      {action && (
        <GradientButton href={action.href} className="mt-8">
          {action.label}
        </GradientButton>
      )}
    </div>
  );
}
