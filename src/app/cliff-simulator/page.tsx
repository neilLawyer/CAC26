"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/lib/states";
import { evaluateAll, estimatedAnnualValueMidpoint } from "@/lib/engine";
import type { Household } from "@/lib/types";

const STEP = 100;
const MAX_INCREASE = 5000;

function withIncome(household: Household, monthlyIncome: number): Household {
  return { ...household, monthlyIncomeMin: monthlyIncome, monthlyIncomeMax: monthlyIncome };
}

export default function CliffSimulatorPage() {
  const { household } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;

  const baselineIncome =
    household.monthlyIncomeMin !== undefined && household.monthlyIncomeMax !== undefined
      ? Math.round((household.monthlyIncomeMin + household.monthlyIncomeMax) / 2)
      : undefined;

  const [increase, setIncrease] = useState(500);

  const baselineValue = useMemo(() => {
    if (baselineIncome === undefined) return 0;
    return estimatedAnnualValueMidpoint(evaluateAll(programs, withIncome(household, baselineIncome)));
  }, [programs, household, baselineIncome]);

  const hypotheticalIncome = (baselineIncome ?? 0) + increase;
  const hypotheticalValue = useMemo(() => {
    if (baselineIncome === undefined) return 0;
    return estimatedAnnualValueMidpoint(
      evaluateAll(programs, withIncome(household, hypotheticalIncome))
    );
  }, [programs, household, hypotheticalIncome, baselineIncome]);

  const extraPay = increase * 12;
  const benefitChange = hypotheticalValue - baselineValue;
  const netEffect = extraPay + benefitChange;

  // Coarse "safe raise" scan: largest increase (in $100 steps) before net effect goes negative.
  const safeRaise = useMemo(() => {
    if (baselineIncome === undefined) return undefined;
    let lastSafe = 0;
    for (let inc = STEP; inc <= MAX_INCREASE; inc += STEP) {
      const val = estimatedAnnualValueMidpoint(
        evaluateAll(programs, withIncome(household, baselineIncome + inc))
      );
      const net = inc * 12 + (val - baselineValue);
      if (net < 0) break;
      lastSafe = inc;
    }
    return lastSafe;
  }, [programs, household, baselineIncome, baselineValue]);

  if (baselineIncome === undefined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-gray-500">We need your current income first.</p>
        <Link href="/intake" className="text-blue-600 hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Benefits-cliff simulator</h1>
        <p className="text-sm text-gray-500">
          An <strong>educational estimate</strong>, not financial advice. See roughly what happens
          to your total resources if your income changes — sometimes a raise costs you more in
          lost benefits than you gain in pay.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          If your monthly income went up by ${increase.toLocaleString()}...
        </label>
        <input
          type="range"
          min={0}
          max={MAX_INCREASE}
          step={STEP}
          value={increase}
          onChange={(e) => setIncrease(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>+$0</span>
          <span>+${MAX_INCREASE.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500">Now</p>
          <p className="font-semibold">${baselineIncome.toLocaleString()}/mo income</p>
          <p className="text-sm text-gray-500">~${baselineValue.toLocaleString()}/yr est. benefits</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500">If income rises</p>
          <p className="font-semibold">${hypotheticalIncome.toLocaleString()}/mo income</p>
          <p className="text-sm text-gray-500">~${hypotheticalValue.toLocaleString()}/yr est. benefits</p>
        </div>
      </div>

      <div
        className={`rounded-xl p-5 ${
          netEffect >= 0
            ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
            : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
        }`}
      >
        <p className="text-sm font-medium">Estimated net effect per year</p>
        <p
          className={`text-2xl font-bold ${
            netEffect >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
          }`}
        >
          {netEffect >= 0 ? "+" : ""}
          ${netEffect.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Extra pay (${extraPay.toLocaleString()}/yr) {benefitChange <= 0 ? "minus" : "plus"} the
          change in estimated benefits (${Math.abs(benefitChange).toLocaleString()}/yr{" "}
          {benefitChange <= 0 ? "lost" : "gained"}).
        </p>
      </div>

      {safeRaise !== undefined && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-5">
          <p className="text-sm font-medium">Roughly how much more you could earn safely</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
            up to about ${safeRaise.toLocaleString()}/mo more
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Before the estimated loss in benefits outweighs the extra pay, based on the programs in
            your results.
          </p>
        </div>
      )}

      <Link href="/results" className="text-sm text-blue-600 hover:underline block">
        ← Back to my results
      </Link>
    </main>
  );
}
