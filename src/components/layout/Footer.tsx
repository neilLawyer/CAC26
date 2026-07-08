"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

// Shared marketing footer: quick links plus the always-on disclaimer.
export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-card-border">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
        <div className="flex gap-4">
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
        <span>{t("footer.disclaimer")}</span>
      </div>
    </footer>
  );
}
