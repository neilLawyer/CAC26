"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHousehold } from "@/lib/household-store";
import { getState } from "@/data/states";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchPalette, useSearchPalette } from "@/components/SearchPalette";
import { LanguageToggle, useT } from "@/lib/i18n";
import type { TranslationKey } from "@/data/i18n/en";

const LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/intake", labelKey: "nav.checkEligibility" },
  { href: "/results", labelKey: "nav.myResults" },
  { href: "/cliff-simulator", labelKey: "nav.cliffSimulator" },
];

export function NavHeader() {
  const pathname = usePathname();
  const { household } = useHousehold();
  const stateEntry = getState(household.state);
  const { open, setOpen } = useSearchPalette();
  const t = useT();

  return (
    <header className="sticky top-0 z-50 border-b border-card-border/70 bg-background/85 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-lg border border-accent/60 bg-background flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="11" height="18" rx="1.5" stroke="var(--accent)" strokeWidth="1.6" />
              <circle cx="13.2" cy="12" r="1" fill="var(--accent)" />
              <path d="M16 5.5L20 7v13l-4-1.2" stroke="var(--accent-2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight">OpenDoor</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                pathname === l.href
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press-weight ml-auto flex items-center gap-2 rounded-full border border-card-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
          aria-label={t("nav.searchAria")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{t("nav.search")}</span>
          <kbd className="label-mono hidden md:inline text-[9px] border border-card-border rounded px-1 py-px">
            ctrl K
          </kbd>
        </button>

        <div className="flex items-center gap-3 label-mono text-[10px] text-muted">
          {stateEntry && (
            <span className="hidden md:inline rounded-full border border-card-border px-2.5 py-1">
              {stateEntry.name}
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="dot-live w-1.5 h-1.5 rounded-full bg-accent" />
            {t("nav.localPrivate")}
          </span>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <SearchPalette open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
