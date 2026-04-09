import Link from "next/link";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function GradientButton({
  children,
  className,
  href,
  ...props
}: GradientButtonProps) {
  const classes = cn(
    "gradient-button inline-flex items-center justify-center text-on-primary-fixed font-bold rounded-lg text-sm uppercase tracking-wider px-8 py-4 transition-all",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
