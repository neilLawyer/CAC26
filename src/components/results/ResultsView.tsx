"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { cascadeSuggestions, estimatedAnnualValue, evaluateAll } from "@/lib/engine";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL, CONFIDENCE_ORDER } from "@/components/results/confidence";
import { ResultCard } from "@/components/results/ResultCard";
import { ValueEstimate } from "@/components/results/ValueEstimate";
import { CascadePanel } from "@/components/results/CascadePanel";
import { PopulationSpotlight } from "@/components/results/PopulationSpotlight";

export function ResultsView() {
  const { household, reset } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const value = useMemo(() => estimatedAnnualValue(results), [results]);
  const cascades = useMemo(() => cascadeSuggestions(results), [results]);

  const grouped = CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    items: results.filter((r) => r.confidence === c),
  })).filter((g) => g.items.length > 0);

  if (!household.householdSize || household.monthlyIncomeMin === undefined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-muted">We need a few answers first.</p>
        <Link href="/intake" className="text-accent hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="space-y-2">
        <p className="label-mono text-[10px] text-accent">your results</p>
        <h1 className="text-3xl font-bold">Here&apos;s what we found</h1>
        <p className="text-sm text-muted">
          Based on what you told us for a household of {household.householdSize} in{" "}
          {stateEntry?.name}. This is general information, not an official decision — every
          program links to the real agency so they can confirm.
        </p>
      </div>

      <ValueEstimate min={value.min} max={value.max} />

      <PopulationSpotlight flags={household.flags} results={results} />

      <CascadePanel cascades={cascades} />

      {grouped.map((g) => (
        <section key={g.confidence} className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: CONFIDENCE_COLOR[g.confidence] }}>
            {CONFIDENCE_LABEL[g.confidence]}
          </h2>
          <div className="grid gap-4">
            {g.items.map((r) => (
              <ResultCard key={r.program.id} result={r} />
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
        <Link href="/intake" className="text-sm text-accent hover:underline">
          ← Edit my answers
        </Link>
        <Link href="/cliff-simulator" className="text-sm text-accent hover:underline">
          Try the benefits-cliff simulator →
        </Link>
        <button onClick={reset} className="text-sm text-muted hover:underline ml-auto">
          Clear my answers
        </button>
      </div>
    </main>
  );
}
