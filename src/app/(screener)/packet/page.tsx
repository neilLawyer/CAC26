"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { documentsForCategories } from "@/data/documents";
import { CONFIDENCE_LABEL } from "@/components/results/confidence";
import { PrintButton } from "@/components/PrintButton";
import { money } from "@/lib/format";
import type { EligibilityResult, Program } from "@/lib/types";

// "My benefits packet" — one clean, print-ready sheet for a caseworker,
// family member, or the kitchen table: everything the household qualified
// for, the next step for each, and ONE deduplicated documents checklist.
// Prints via the shared print system (chrome hidden, ink-friendly palette).

function worth(r: EligibilityResult): string | null {
  const min = r.program.estimatedAnnualValueMin;
  const max = r.program.estimatedAnnualValueMax;
  if (min === undefined || max === undefined) return null;
  return min === max ? `~${money(min)}/yr` : `${money(min)}–${money(max)}/yr`;
}

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PacketPage() {
  const { household } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);

  const included = results.filter(
    (r) => r.confidence === "likely" || r.confidence === "possible"
  );
  const categories = new Set<Program["category"]>(included.map((r) => r.program.category));
  const documents = documentsForCategories(categories);
  const hasTax = categories.has("tax");
  const today = new Date().toISOString().slice(0, 10);

  if (!household.householdSize || household.monthlyIncomeMin === undefined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-muted">Answer the quick questionnaire first — then this page
          becomes a packet worth printing.</p>
        <Link href="/intake" className="text-accent hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="print-area max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="label-mono text-[10px] text-accent">my benefits packet</p>
            <h1 className="text-3xl font-bold">What this household may qualify for</h1>
            <p className="text-xs text-muted">
              Household of {household.householdSize} · {stateEntry?.name} · prepared {today} ·
              opendoor-nj.vercel.app
            </p>
          </div>
          <PrintButton label="Print / save as PDF" />
        </div>

        <p className="text-sm text-muted">
          Screening estimates from published rules — <strong className="text-foreground">not
          an official decision</strong>. Each program lists the agency that decides and where
          to apply. Bring this to a caseworker, navigator, or family member.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b border-card-border pb-2">
            Programs ({included.length})
          </h2>
          {included.map((r) => (
            <div
              key={r.program.id}
              className="packet-row rounded-lg border border-card-border p-4 space-y-1"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-sm">{r.program.name}</h3>
                <span className="label-mono text-[9px] text-muted">
                  {CONFIDENCE_LABEL[r.confidence]}
                  {worth(r) ? ` · ${worth(r)}` : ""}
                </span>
              </div>
              <p className="text-xs text-muted">{r.program.summary}</p>
              <p className="text-xs">
                <span className="label-mono text-[9px] text-muted mr-1.5">next step</span>
                Apply with {r.program.agencyName}:{" "}
                <a
                  href={r.program.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent/40"
                >
                  {domain(r.program.applyUrl)}
                </a>
                <span className="text-muted"> · rules checked {r.program.lastVerified}</span>
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b border-card-border pb-2">
            Documents to gather — one pile covers everything above
          </h2>
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id} className="flex gap-3 text-sm">
                <span
                  aria-hidden
                  className="checkbox-square mt-0.5 w-4 h-4 shrink-0 rounded border-2 border-muted/60"
                />
                <span>
                  <span className="font-medium">{d.label}</span>
                  {d.detail && <span className="text-muted"> — {d.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
          {hasTax && (
            <p className="text-xs text-muted">
              For the tax credits, free tax prep has its own short list —{" "}
              <Link href="/tax-guide" className="text-accent underline hover:no-underline">
                the printable what-to-bring checklist is here
              </Link>
              .
            </p>
          )}
          <p className="text-xs text-muted italic">
            These are the documents agencies commonly ask for — each agency confirms the exact
            list when you apply, and missing one is a reason to ask, not a reason to skip
            applying.
          </p>
        </section>

        <div className="no-print flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/results" className="text-sm text-accent hover:underline">
            ← Back to my results
          </Link>
          <Link href="/deadlines" className="text-sm text-accent hover:underline">
            My deadline timeline →
          </Link>
        </div>
      </div>
    </main>
  );
}
