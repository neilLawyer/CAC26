import Link from "next/link";

// Shared marketing footer: quick links plus the always-on disclaimer.
export function Footer() {
  return (
    <footer className="border-t border-card-border">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-accent transition-colors">
            About
          </Link>
          <Link href="/how-it-works" className="hover:text-accent transition-colors">
            How it works
          </Link>
          <Link href="/intake" className="hover:text-accent transition-colors">
            Check eligibility
          </Link>
        </div>
        <span>
          OpenDoor is informational only — not affiliated with any government agency. Built for the
          Congressional App Challenge 2026.
        </span>
      </div>
    </footer>
  );
}
