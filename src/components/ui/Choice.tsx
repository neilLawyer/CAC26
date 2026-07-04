import type { ButtonHTMLAttributes, ReactNode } from "react";

// A selectable option button used throughout intake. `active` toggles the
// accent-selected look; `className` carries per-use radius/padding/alignment.
type ChoiceProps = {
  active?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Choice({ active = false, className = "", children, ...rest }: ChoiceProps) {
  const state = active
    ? "border-accent bg-accent/10 text-accent"
    : "border-card-border bg-card hover:border-accent/60";
  return (
    <button className={`rounded-xl border px-4 py-3 transition-colors ${state} ${className}`} {...rest}>
      {children}
    </button>
  );
}
