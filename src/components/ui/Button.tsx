import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// The primary "accent" button/link, defined once. Callers pass their own
// padding/size and layout classes via `className`; the shared bit (shape,
// accent fill, hover) lives here so it's identical everywhere.
const PRIMARY =
  "rounded-full bg-accent text-[#04201c] font-semibold hover:brightness-110 transition-all";

type ButtonProps = { className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${PRIMARY} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type LinkProps = {
  href: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

/** Same primary styling, rendered as a link. `external` opens a new, safe tab. */
export function ButtonLink({ href, external, className = "", children }: LinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${PRIMARY} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${PRIMARY} ${className}`}>
      {children}
    </Link>
  );
}
