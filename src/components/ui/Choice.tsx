import type { ButtonHTMLAttributes, ReactNode } from "react";

// A selectable option button used throughout intake. `active` toggles the
// selected look — which follows the page's --scope-accent (each deep-dive
// scope has its own key color; the general intake falls through to the brand
// accent). `.press-weight` gives hover lift and a physical press.
type ChoiceProps = {
  active?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Choice({ active = false, className = "", children, ...rest }: ChoiceProps) {
  const state = active ? "choice-active" : "choice-idle border-card-border bg-card";
  return (
    <button className={`press-weight rounded-xl border px-4 py-3 ${state} ${className}`} {...rest}>
      {children}
    </button>
  );
}
