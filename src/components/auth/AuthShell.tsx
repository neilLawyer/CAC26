import Link from "next/link";
import type { ReactNode } from "react";

// Shared visual shell for /sign-in and /sign-up — reuses the hero's
// corner-glow + grid-bg treatment and the NavHeader mark so these pages
// read as part of OpenDoor, not a generic third-party auth widget dropped
// on a blank page.
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative flex-1 overflow-hidden flex items-center justify-center px-6 py-16">
      <div className="grid-bg" />
      <div className="corner-glow teal w-[420px] h-[420px] -top-32 -left-32" />
      <div className="corner-glow cyan w-[380px] h-[380px] -bottom-24 -right-24" />

      <div className="relative w-full max-w-md rounded-2xl border border-card-border bg-card p-8 sm:p-10 shadow-2xl shadow-black/10 dark:shadow-black/40">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-8 h-8 rounded-lg border border-accent/60 bg-background flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="11" height="18" rx="1.5" stroke="var(--accent)" strokeWidth="1.6" />
              <circle cx="13.2" cy="12" r="1" fill="var(--accent)" />
              <path
                d="M16 5.5L20 7v13l-4-1.2"
                stroke="var(--accent-2)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-semibold tracking-tight">OpenDoor</span>
        </Link>

        <div className="text-center mb-8 space-y-1.5">
          <p className="label-mono text-[10px] text-accent">{eyebrow}</p>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>

        {children}

        <div className="mt-8 pt-6 border-t border-card-border flex flex-col items-center gap-3 text-sm">
          {footer}
          <Link href="/intake" className="text-muted hover:text-foreground transition-colors">
            Continue without an account →
          </Link>
        </div>
      </div>
    </main>
  );
}
