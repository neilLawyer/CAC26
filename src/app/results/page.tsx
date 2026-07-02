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

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  likely: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400",
  possible: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400",
  needsInfo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  unlikely: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const ORDER: Confidence[] = ["likely", "possible", "needsInfo", "unlikely"];

function ResultCard({ result }: { result: EligibilityResult }) {
  const { program, confidence, reasons, counterfactual } = result;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{program.name}</h3>
          <p className="text-sm text-gray-500">{program.agencyName}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${CONFIDENCE_STYLE[confidence]}`}
        >
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>
      <p className="text-sm">{program.summary}</p>
      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      {counterfactual && (
        <p className="text-sm italic text-blue-700 dark:text-blue-400">{counterfactual}</p>
      )}
      <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
        <span>Checked against source: {program.lastVerified}</span>
        <a
          href={program.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-gray-300"
        >
          Source
        </a>
      </div>
      <a
        href={program.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition-colors"
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
        <p className="text-gray-500">We need a few answers first.</p>
        <Link href="/intake" className="text-blue-600 hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Your results</h1>
        <p className="text-sm text-gray-500">
          Based on what you told us for a household of {household.householdSize} in{" "}
          {stateEntry?.name}. This is general information, not an official decision — every
          program links to the real agency so they can confirm.
        </p>
      </div>

      {(value.min > 0 || value.max > 0) && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-5">
          <p className="text-sm font-medium">Estimated value you may be leaving unclaimed</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            ${value.min.toLocaleString()} – ${value.max.toLocaleString()} / year
          </p>
          <p className="text-xs text-gray-500 mt-1">
            A rough estimate across programs you may qualify for — not a guarantee.
          </p>
        </div>
      )}

      {cascades.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-1">
          <p className="text-sm font-medium">Because you may qualify for one program, also check:</p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
            {[...new Map(cascades.map((c) => [c.suggested.id, c])).values()].map((c) => (
              <li key={c.suggested.id}>
                {c.suggested.name}{" "}
                <span className="text-gray-400">(often paired with {c.from.shortName})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {grouped.map((g) => (
        <section key={g.confidence} className="space-y-3">
          <h2 className="text-lg font-semibold">{CONFIDENCE_LABEL[g.confidence]}</h2>
          <div className="grid gap-4">
            {g.items.map((r) => (
              <ResultCard key={r.program.id} result={r} />
            ))}
          </div>
        </section>
      ))}

      <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Link href="/intake" className="text-sm text-blue-600 hover:underline">
          ← Edit my answers
        </Link>
        <Link href="/cliff-simulator" className="text-sm text-blue-600 hover:underline">
          Try the benefits-cliff simulator →
        </Link>
        <button onClick={reset} className="text-sm text-gray-400 hover:underline ml-auto">
          Clear my answers
        </button>
      </div>
    </main>
  );
}
