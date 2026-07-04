"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState, STATES } from "@/data/states";
import { evaluateAll, stillPossibleCount } from "@/lib/engine";
import { FLAG_QUESTIONS, INCOME_BUCKETS, STEP_LABELS } from "@/data/questions";
import { EligibilityMeter } from "@/components/intake/EligibilityMeter";
import { IntakeSidebar } from "@/components/intake/IntakeSidebar";
import { QuestionStep } from "@/components/intake/QuestionStep";
import { FlagStep } from "@/components/intake/FlagStep";
import { BackLink } from "@/components/intake/BackLink";
import { Button } from "@/components/ui/Button";
import type { CategoricalFlag } from "@/lib/types";

const STEPS = ["state", "size", "income", "flags", "review"] as const;

export function IntakeWizard() {
  const router = useRouter();
  const { household, setState, setHouseholdSize, setIncomeRange, setFlag } = useHousehold();
  const [step, setStep] = useState(0);

  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const possible = stillPossibleCount(results);

  // Adaptive pruning: only ask about flags that still matter for at least one
  // program that hasn't already been ruled out.
  const relevantFlags = useMemo(() => {
    const flagSet = new Set<CategoricalFlag>();
    for (const r of results) {
      if (r.confidence === "unlikely") continue;
      for (const req of r.program.rules.categoricalRequirements) {
        flagSet.add(req.type);
      }
    }
    return FLAG_QUESTIONS.filter((q) => flagSet.has(q.flag));
  }, [results]);

  const currentStep = STEPS[step];

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const categories = useMemo(
    () => [...new Set(programs.map((p) => p.category.replace("-", " & ")))],
    [programs]
  );

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto w-full px-6 py-14 grid lg:grid-cols-[1fr_280px] gap-10">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="label-mono text-[10px] text-muted">
              step {step + 1} of {STEPS.length} · {STEP_LABELS[step]}
            </span>
          </div>

          <EligibilityMeter possible={possible} total={programs.length} />

          {currentStep === "state" && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Which state are you in?</h2>
              <div className="grid grid-cols-2 gap-3">
                {STATES.map((s) => (
                  <button
                    key={s.code}
                    disabled={!s.available}
                    onClick={() => {
                      setState(s.code);
                      next();
                    }}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      s.available
                        ? "border-card-border bg-card hover:border-accent/60 hover:bg-accent/5"
                        : "border-card-border/50 text-muted cursor-not-allowed"
                    }`}
                  >
                    {s.name}
                    {!s.available && <span className="block text-xs">Coming soon</span>}
                  </button>
                ))}
              </div>
            </section>
          )}

          {currentStep === "size" && (
            <QuestionStep
              title="How many people are in your household?"
              gridClassName="grid grid-cols-4 gap-3"
              onBack={back}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
                key: String(n),
                label: n === 8 ? "8+" : n,
                active: household.householdSize === n,
                onSelect: () => {
                  setHouseholdSize(n);
                  next();
                },
              }))}
            />
          )}

          {currentStep === "income" && (
            <QuestionStep
              title="About how much does your household bring in before taxes, per month?"
              subtitle="A range is fine — exact numbers aren't needed."
              gridClassName="grid gap-2"
              onBack={back}
              options={INCOME_BUCKETS.map((b) => ({
                key: b.label,
                label: b.label,
                active: household.monthlyIncomeMin === b.min,
                className: "text-left",
                onSelect: () => {
                  setIncomeRange(b.min, b.max);
                  next();
                },
              }))}
            />
          )}

          {currentStep === "flags" && (
            <FlagStep
              questions={relevantFlags}
              flags={household.flags}
              onAnswer={setFlag}
              onBack={back}
              onNext={next}
            />
          )}

          {currentStep === "review" && (
            <section className="space-y-4 text-center">
              <h2 className="text-2xl font-semibold">Ready to see your results</h2>
              <p className="text-muted">
                {possible} of {programs.length} programs still look possible based on your answers.
              </p>
              <Button onClick={() => router.push("/results")} className="px-8 py-3">
                See my results
              </Button>
              <div>
                <BackLink onClick={back} />
              </div>
            </section>
          )}
        </div>

        <IntakeSidebar
          step={currentStep}
          stateName={stateEntry?.name}
          categories={categories}
          programCount={programs.length}
          results={results}
        />
      </div>
    </main>
  );
}
