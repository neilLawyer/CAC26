"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

// Shared marketing footer: brand mark, quick links, the always-on
// disclaimer, and a credit line for the two of us who built this.
export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-card-border">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-7 h-7 rounded-lg border border-accent/60 bg-background flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            <span className="font-semibold tracking-tight text-sm">OpenDoor</span>
          </Link>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <Link href="/about" className="hover:text-accent transition-colors">
              {t("footer.about")}
            </Link>
            <Link href="/how-it-works" className="hover:text-accent transition-colors">
              {t("footer.how")}
            </Link>
            <Link href="/intake" className="hover:text-accent transition-colors">
              {t("footer.check")}
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted max-w-2xl">{t("footer.disclaimer")}</p>

        <div className="pt-6 border-t border-card-border/60">
          <p className="label-mono text-[10px] text-muted">
            {t("footer.credit")}
          </p>
        </div>
      </div>
    </footer>
  );
}
