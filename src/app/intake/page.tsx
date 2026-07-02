"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState, STATES } from "@/lib/states";
import { evaluateAll, stillPossibleCount } from "@/lib/engine";
import { EligibilityMeter } from "@/components/EligibilityMeter";
import type { CategoricalFlag } from "@/lib/types";

const INCOME_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "Under $1,000/mo", min: 0, max: 1000 },
  { label: "$1,000 – $1,500/mo", min: 1000, max: 1500 },
  { label: "$1,500 – $2,000/mo", min: 1500, max: 2000 },
  { label: "$2,000 – $2,500/mo", min: 2000, max: 2500 },
  { label: "$2,500 – $3,000/mo", min: 2500, max: 3000 },
  { label: "$3,000 – $4,000/mo", min: 3000, max: 4000 },
  { label: "$4,000 – $5,000/mo", min: 4000, max: 5000 },
  { label: "$5,000 – $7,000/mo", min: 5000, max: 7000 },
  { label: "$7,000+/mo", min: 7000, max: 999999 },
];

const FLAG_QUESTIONS: { flag: CategoricalFlag; question: string }[] = [
  { flag: "age65Plus", question: "Is anyone in your household 65 or older?" },
  { flag: "disabled", question: "Does anyone in your household have a disability?" },
  { flag: "veteran", question: "Is anyone in your household a veteran?" },
  { flag: "pregnantOrChildUnder5", question: "Is anyone pregnant, or is there a child under 5?" },
  { flag: "schoolAgeChild", question: "Is there a school-age child in the household?" },
  { flag: "utilityHardship", question: "Is the household behind on utility bills?" },
];

export default function IntakePage() {
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

  const steps = ["state", "size", "income", "flags", "review"] as const;
  const currentStep = steps[step];

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12 space-y-8">
      <EligibilityMeter possible={possible} total={programs.length} />

      {currentStep === "state" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Which state are you in?</h2>
          <div className="grid grid-cols-2 gap-3">
            {STATES.map((s) => (
              <button
                key={s.code}
                disabled={!s.available}
                onClick={() => {
                  setState(s.code);
                  next();
                }}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  s.available
                    ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950/30"
                    : "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-800"
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
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How many people are in your household?</h2>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setHouseholdSize(n);
                  next();
                }}
                className={`rounded-lg border px-4 py-3 transition-colors ${
                  household.householdSize === n
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 hover:border-blue-500 dark:border-gray-700"
                }`}
              >
                {n === 8 ? "8+" : n}
              </button>
            ))}
          </div>
          <button onClick={back} className="text-sm text-gray-500 hover:underline">
            ← Back
          </button>
        </section>
      )}

      {currentStep === "income" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            About how much does your household bring in before taxes, per month?
          </h2>
          <p className="text-sm text-gray-500">A range is fine — exact numbers aren&apos;t needed.</p>
          <div className="grid gap-2">
            {INCOME_BUCKETS.map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  setIncomeRange(b.min, b.max);
                  next();
                }}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  household.monthlyIncomeMin === b.min
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-300 hover:border-blue-500 dark:border-gray-700"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button onClick={back} className="text-sm text-gray-500 hover:underline">
            ← Back
          </button>
        </section>
      )}

      {currentStep === "flags" && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">A few more questions</h2>
          <p className="text-sm text-gray-500">
            We only ask what still matters based on your answers so far. Skip any you&apos;re not
            sure about.
          </p>
          <div className="space-y-4">
            {relevantFlags.length === 0 && (
              <p className="text-sm text-gray-500">Nothing else we need — you&apos;re all set.</p>
            )}
            {relevantFlags.map((q) => (
              <div key={q.flag} className="flex items-center justify-between gap-4">
                <span>{q.question}</span>
                <div className="flex gap-2 shrink-0">
                  {(["Yes", "No", "Skip"] as const).map((opt) => {
                    const val = opt === "Yes" ? true : opt === "No" ? false : undefined;
                    const active = household.flags[q.flag] === val;
                    return (
                      <button
                        key={opt}
                        onClick={() => setFlag(q.flag, val)}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-300 hover:border-blue-500 dark:border-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={back} className="text-sm text-gray-500 hover:underline">
              ← Back
            </button>
            <button
              onClick={next}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 transition-colors"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {currentStep === "review" && (
        <section className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">Ready to see your results</h2>
          <p className="text-gray-500">
            {possible} of {programs.length} programs still look possible based on your answers.
          </p>
          <button
            onClick={() => router.push("/results")}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 transition-colors"
          >
            See my results
          </button>
          <div>
            <button onClick={back} className="text-sm text-gray-500 hover:underline">
              ← Back
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
