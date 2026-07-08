"use client";

import { useId } from "react";
import { useCountUp } from "@/lib/use-count-up";
import { money, moneyRange } from "@/lib/format";
import { estimatedAnnualValue, stillPossibleCount } from "@/lib/engine";
import type { EligibilityResult } from "@/lib/types";

// The dashboard above the result cards: a large count-up of the estimated
// $/yr the household may be leaving on the table (midpoint, with the honest
// min–max range printed right beside it), the program counts, and a progress
// ring of how many screened programs are still open. Every number derives
// from the same engine outputs the cards render — nothing is estimated here
// that isn't already on a record.

function ProgressRing({ open, total }: { open: number; total: number }) {
  const gradId = useId();
  const r = 34;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? open / total : 0;

  return (
    <div className="relative w-[92px] h-[92px] shrink-0" role="img"
      aria-label={`${open} of ${total} screened programs still open to you`}>
      <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx="46" cy="46" r={r} fill="none" stroke="var(--card-border)" strokeWidth="7" />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className="ring-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none tabular-nums">{open}</span>
        <span className="label-mono text-[8px] text-muted mt-0.5">of {total}</span>
      </div>
    </div>
  );
}

export function ResultsDashboard({ results }: { results: EligibilityResult[] }) {
  // Same engine arithmetic the rest of the app uses — likely + possible.
  const value = estimatedAnnualValue(results);
  const relevant = results.filter(
    (r) => r.confidence === "likely" || r.confidence === "possible"
  );
  const midpoint = Math.round((value.min + value.max) / 2);
  const shown = useCountUp(midpoint);
  const open = stillPossibleCount(results);
  const likely = results.filter((r) => r.confidence === "likely").length;
  const hasMoney = value.max > 0;

  return (
    <section
      className="dash-panel relative overflow-hidden rounded-2xl border border-accent/25 p-6"
      aria-label="Your results at a glance"
    >
      <div className="grid-bg" aria-hidden />
      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-5">
        {hasMoney ? (
          <div className="min-w-0 flex-1">
            <p className="label-mono text-[10px] text-accent">
              est. money you may be leaving unclaimed
            </p>
            <p className="dash-number mt-1 text-5xl font-bold tracking-tight tabular-nums">
              {money(shown)}
              <span className="ml-1 text-lg font-semibold text-muted">/yr</span>
            </p>
            <p className="text-xs text-muted mt-2">
              Midpoint of {moneyRange(value.min, value.max)} across {relevant.length} program
              {relevant.length === 1 ? "" : "s"} you may qualify for — an estimate, not a
              guarantee. Every card below links to the agency that decides.
            </p>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="label-mono text-[10px] text-accent">your screening so far</p>
            <p className="text-sm text-muted mt-2 max-w-md">
              Nothing here carries a dollar estimate yet — the counts on the right show
              what&apos;s still open, and answering more questions can unlock more.
            </p>
          </div>
        )}

        <div className="flex items-center gap-5">
          <ProgressRing open={open} total={results.length} />
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="label-mono text-[9px] text-muted w-20">likely</dt>
              <dd className="font-semibold tabular-nums">{likely}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="label-mono text-[9px] text-muted w-20">still open</dt>
              <dd className="font-semibold tabular-nums">{open}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="label-mono text-[9px] text-muted w-20">screened</dt>
              <dd className="font-semibold tabular-nums">{results.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
