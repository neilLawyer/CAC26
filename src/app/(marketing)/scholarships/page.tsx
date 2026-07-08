import type { Metadata } from "next";
import Link from "next/link";
import { ScholarshipList } from "@/components/ScholarshipList";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Merit scholarships — OpenDoor",
  description:
    "Real merit and contest scholarships that are NOT income-gated — each verified against its official page.",
};

// The merit track: scholarships that don't care what your family earns.
// Complements the main library (which covers need-based aid). Every entry is
// data (src/data/scholarships.ts) with an official URL — nothing invented.
export default function ScholarshipsPage() {
  return (
    <>
      <main className="flex-1">
        <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
          <div className="space-y-3">
            <p className="label-mono text-[10px] text-accent">the merit track</p>
            <h1 className="text-3xl font-bold">
              Scholarships that don&apos;t ask what your family earns
            </h1>
            <p className="text-sm text-muted max-w-lg">
              Most of OpenDoor screens need-based help. These {SCHOLARSHIPS.length} are
              different: real merit awards, essay contests, and state programs with{" "}
              <strong className="text-foreground">no income test</strong> — each one verified
              against its official page, and each name below links straight there. A few
              famous &ldquo;merit&rdquo; names (QuestBridge, the Gates Scholarship, Jack Kent
              Cooke) actually require a family-income ceiling to apply, so they&apos;re
              deliberately not on this list.
            </p>
          </div>

          <ScholarshipList />

          <div className="rounded-xl border border-card-border bg-card/60 p-4 text-sm text-muted">
            Looking for need-based help with college costs instead — Pell Grants, FAFSA,
            state aid?{" "}
            <Link href="/intake/education" className="text-accent underline hover:no-underline">
              The education room screens those →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
