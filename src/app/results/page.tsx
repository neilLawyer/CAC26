"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/lib/states";
import { cascadeSuggestions, estimatedAnnualValue, evaluateAll } from "@/lib/engine";
import type { Confidence, EligibilityResult } from "@/lib/types";

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  likely: "Likely eligible",
  possible: "Possibly eligible",
  needsInfo: "Need more info",
  unlikely: "Not likely",
};

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  likely: "#2dd4bf",
  possible: "#f9d34c",
  needsInfo: "#8b9bb0",
  unlikely: "#f87171",
};

const ORDER: Confidence[] = ["likely", "possible", "needsInfo", "unlikely"];

function ResultCard({ result }: { result: EligibilityResult }) {
  const { program, confidence, reasons, counterfactual } = result;
  const color = CONFIDENCE_COLOR[confidence];
  return (
    <div
      className="rounded-xl border border-card-border bg-card p-5 space-y-3 border-l-[3px]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{program.name}</h3>
          <p className="text-sm text-muted">{program.agencyName}</p>
        </div>
        <span
          className="label-mono shrink-0 rounded-full px-3 py-1 text-[10px]"
          style={{ color, backgroundColor: `${color}1f` }}
        >
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>
      <p className="text-sm">{program.summary}</p>
      <ul className="text-sm text-muted list-disc list-inside space-y-1">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      {counterfactual && <p className="text-sm italic text-accent-2">{counterfactual}</p>}
      <div className="flex items-center justify-between pt-2 text-xs text-muted">
        <span>Checked against source: {program.lastVerified}</span>
        <a
          href={program.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Source
        </a>
      </div>
      <a
        href={program.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full bg-accent text-[#04201c] text-sm font-semibold px-4 py-2 hover:brightness-110 transition-all"
      >
        Verify &amp; apply with {program.agencyName} →
      </a>
    </div>
  );
}

export default function ResultsPage() {
  const { household, reset } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const value = useMemo(() => estimatedAnnualValue(results), [results]);
  const cascades = useMemo(() => cascadeSuggestions(results), [results]);

  const grouped = ORDER.map((c) => ({
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

      {(value.min > 0 || value.max > 0) && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
          <p className="label-mono text-[10px] text-accent">est. value you may be leaving unclaimed</p>
          <p className="text-2xl font-bold mt-1">
            ${value.min.toLocaleString()} – ${value.max.toLocaleString()} / year
          </p>
          <p className="text-xs text-muted mt-1">
            A rough estimate across programs you may qualify for — not a guarantee.
          </p>
        </div>
      )}

      {cascades.length > 0 && (
        <div className="rounded-xl border border-card-border bg-card p-5 space-y-1">
          <p className="text-sm font-medium">Because you may qualify for one program, also check:</p>
          <ul className="text-sm text-muted list-disc list-inside">
            {[...new Map(cascades.map((c) => [c.suggested.id, c])).values()].map((c) => (
              <li key={c.suggested.id}>
                {c.suggested.name}{" "}
                <span className="text-muted/70">(often paired with {c.from.shortName})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
