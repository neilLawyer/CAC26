"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { questionsForScope } from "@/lib/question-engine";
import { getScope } from "@/data/scopes";
import { NEAR_YOU } from "@/data/near-you";
import { DeepForm } from "@/components/intake/DeepForm";
import { NearYouPanel } from "@/components/near-you/NearYouPanel";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { ResultCard } from "@/components/results/ResultCard";
import {
  CONFIDENCE_COLOR,
  CONFIDENCE_LABEL,
  CONFIDENCE_ORDER,
} from "@/components/results/confidence";

// The one deep-dive template: intro + generated form + scope-filtered results.
// Works for every category AND every persona purely by reading scope data —
// zero scope-specific branching. The page's whole visual identity flows from
// one CSS variable (--scope-accent) plus a texture class, both set from the
// scope record: selected choices, focus rings, section rules, the sigil, and
// the watermark all derive from that single key color.
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
    <main
      className={`flex-1 texture-${scope.texture}`}
      style={{ "--scope-accent": scope.color } as CSSProperties}
    >
      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8 relative">
        {/* Watermark: the scope's sigil, oversized and nearly silent. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-4 right-0 opacity-[0.06] select-none"
        >
          <Icon size={190} stroke={scope.color} strokeWidth={1.1}>
            {ICON_PATHS[scope.iconKey]}
          </Icon>
        </div>

        <div className="rise-in space-y-3 relative" style={{ "--stagger": 0 } as CSSProperties}>
          <div className="flex items-center gap-3">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${scope.color} 14%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${scope.color} 35%, transparent)`,
              }}
            >
              <Icon size={22} stroke={scope.color}>
                {ICON_PATHS[scope.iconKey]}
              </Icon>
            </span>
            <div>
              <p className="label-mono text-[10px]" style={{ color: scope.color }}>
                {scope.kind === "category" ? "category deep dive" : "made for you"} ·{" "}
                {scope.label.toLowerCase()}
              </p>
              <h1 className="text-3xl font-bold leading-tight">{scope.label}</h1>
            </div>
          </div>
          <p className="text-sm text-muted max-w-lg">{scope.intro}</p>
        </div>

        {questions.length > 0 ? (
          <section className="rise-in space-y-3" style={{ "--stagger": 1 } as CSSProperties}>
            <h2 className="text-lg font-semibold">A few questions to sharpen these results</h2>
            <p className="text-sm text-muted">
              Everything you answered before is already filled in — these are only the gaps.
              Answers stay in this browser.
            </p>
            <DeepForm questions={questions} />
          </section>
        ) : (
          <p className="rise-in text-sm text-muted" style={{ "--stagger": 1 } as CSSProperties}>
            You&apos;ve answered everything this page can use — the results below are as sharp as
            we can make them.
          </p>
        )}

        {scope.localPointer && (
          <div
            className="rise-in rounded-xl p-5 space-y-2"
            style={
              {
                "--stagger": 2,
                border: `1px solid color-mix(in srgb, ${scope.color} 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${scope.color} 8%, transparent)`,
              } as CSSProperties
            }
          >
            <p className="label-mono text-[10px]" style={{ color: scope.color }}>
              your local office
            </p>
            <p className="text-sm">
              {scope.localPointer.note}
              {household.zip && (
                <span className="text-muted">
                  {" "}
                  (You told us ZIP {household.zip} — search for it there.)
                </span>
              )}
            </p>
            <a
              href={scope.localPointer.finderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="scope-ink inline-block text-sm underline hover:no-underline"
            >
              {scope.localPointer.finderName} →
            </a>
          </div>
        )}

        {/* Address-driven local results — data-driven: only scopes with a
            NEAR_YOU config render the panel (housing, health). */}
        {NEAR_YOU[scope.id] && (
          <div className="rise-in" style={{ "--stagger": 2 } as CSSProperties}>
            <NearYouPanel scopeId={scope.id} />
          </div>
        )}

        {grouped.map((g, gi) => (
          <section
            key={g.confidence}
            className="rise-in space-y-4"
            style={{ "--stagger": 3 + gi } as CSSProperties}
          >
            <h2
              className="tier-rule text-lg font-semibold"
              style={
                {
                  color: CONFIDENCE_COLOR[g.confidence],
                  "--tier-color": CONFIDENCE_COLOR[g.confidence],
                } as CSSProperties
              }
            >
              {CONFIDENCE_LABEL[g.confidence]}
            </h2>
            <div className="grid gap-4">
              {g.items.map((r, i) => (
                <div key={r.program.id} className="rise-in" style={{ "--stagger": i } as CSSProperties}>
                  <ResultCard result={r} />
                </div>
              ))}
            </div>
          </section>
        ))}

        {scopeResults.length === 0 && (
          <p className="text-sm text-muted">
            We don&apos;t have {scope.label.toLowerCase()} programs for{" "}
            {stateEntry?.name ?? "your state"} yet.
          </p>
        )}

        <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
          <Link href="/results" className="scope-ink text-sm hover:underline">
            ← All results
          </Link>
          <Link href="/intake" className="text-sm text-muted hover:underline">
            Redo the quick intake
          </Link>
        </div>
      </div>
    </main>
  );
}
