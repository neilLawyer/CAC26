"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { questionsForScope } from "@/lib/question-engine";
import { getScope } from "@/data/scopes";
import { DeepForm } from "@/components/intake/DeepForm";
import { ResultCard } from "@/components/results/ResultCard";
import {
  CONFIDENCE_COLOR,
  CONFIDENCE_LABEL,
  CONFIDENCE_ORDER,
} from "@/components/results/confidence";

// The one deep-dive template: intro + generated form + scope-filtered results.
// Works for every category AND every persona purely by reading scope data —
// zero scope-specific branching. Answers write to the shared household store,
// so results everywhere (hub, cliff simulator) improve immediately, and nobody
// is ever bounced back to the general intake: any general question this
// scope's programs still need is pulled into the form right here.
export function ScopeScreen({ scopeId }: { scopeId: string }) {
  const { household } = useHousehold();
  const scope = getScope(scopeId);

  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const allResults = useMemo(() => evaluateAll(programs, household), [programs, household]);

  const scopeResults = useMemo(
    () => (scope ? scope.filterResults(allResults) : []),
    [scope, allResults]
  );
  const questions = useMemo(
    () => (scope ? questionsForScope(scope.id, scopeResults, household) : []),
    [scope, scopeResults, household]
  );

  if (!scope) return null; // the route 404s before this can happen

  const grouped = CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    items: scopeResults.filter((r) => r.confidence === c),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="space-y-2">
        <p className="label-mono text-[10px]" style={{ color: scope.color }}>
          {scope.kind === "category" ? "category deep dive" : "made for you"} ·{" "}
          {scope.label.toLowerCase()}
        </p>
        <h1 className="text-3xl font-bold">{scope.label}</h1>
        <p className="text-sm text-muted">{scope.intro}</p>
      </div>

      {questions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            A few questions to sharpen these results
          </h2>
          <p className="text-sm text-muted">
            Everything you answered before is already filled in — these are only the gaps. Answers
            stay in this browser.
          </p>
          <DeepForm questions={questions} />
        </section>
      ) : (
        <p className="text-sm text-muted">
          You&apos;ve answered everything this page can use — the results below are as sharp as we
          can make them.
        </p>
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

      {scopeResults.length === 0 && (
        <p className="text-sm text-muted">
          We don&apos;t have {scope.label.toLowerCase()} programs for {stateEntry?.name ?? "your state"}{" "}
          yet.
        </p>
      )}

      <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
        <Link href="/results" className="text-sm text-accent hover:underline">
          ← All results
        </Link>
        <Link href="/intake" className="text-sm text-muted hover:underline">
          Redo the quick intake
        </Link>
      </div>
    </main>
  );
}
