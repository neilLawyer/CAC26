"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useHousehold } from "@/lib/household-store";
import { clearSnapshot } from "@/lib/snapshot";
import { getState } from "@/data/states";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchPalette, useSearchPalette } from "@/components/SearchPalette";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle, useT } from "@/lib/i18n";
import type { TranslationKey } from "@/data/i18n/en";

const LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/intake", labelKey: "nav.checkEligibility" },
  { href: "/results", labelKey: "nav.myResults" },
  { href: "/cliff-simulator", labelKey: "nav.cliffSimulator" },
];

export function NavHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { household, reset } = useHousehold();
  const stateEntry = getState(household.state);
  const { open, setOpen } = useSearchPalette();
  const t = useT();

  // Guest data lives in this browser's localStorage with no per-person
  // boundary — on a shared or public computer, the next person to sit down
  // would otherwise be greeted with whatever state/income/answers the last
  // person left behind. Only shown once there's actually something to clear.
  const hasGuestData = household.householdSize !== undefined;
  function startOver() {
    reset();
    clearSnapshot();
    router.push("/intake");
  }

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

        <Show when="signed-out">
          {hasGuestData && (
            <button
              type="button"
              onClick={startOver}
              aria-label={t("nav.startOverAria")}
              className="press-weight ml-3 shrink-0 flex items-center gap-1.5 rounded-full border border-card-border px-3 py-1.5 text-xs text-muted hover:border-[#f87171]/50 hover:text-[#f87171] transition-colors"
            >
              <Icon size={13} strokeWidth={2}>
                <path d="M3 12a9 9 0 1 1 2.6 6.4" />
                <path d="M3 8v4h4" />
              </Icon>
              <span className="hidden md:inline">{t("nav.startOver")}</span>
            </button>
          )}
          <ButtonLink href="/sign-in" className="ml-2 shrink-0 px-4 py-1.5 text-xs">
            {t("nav.signIn")}
          </ButtonLink>
        </Show>
        <Show when="signed-in">
          <div className="ml-3 shrink-0">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label={t("nav.myAccount")}
                  href="/account"
                  labelIcon={<AccountIcon />}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </Show>
      </div>
      <SearchPalette open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function AccountIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
