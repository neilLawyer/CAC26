import type { HTMLAttributes, ReactNode } from "react";

// The standard bordered surface. `className` adds padding, radius overrides,
// spacing, etc. Base is the shared border + background used across the app.
type CardProps = { className?: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div className={`rounded-xl border border-card-border bg-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
