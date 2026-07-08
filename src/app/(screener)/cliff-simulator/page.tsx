"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { evaluateAll, estimatedAnnualValueMidpoint } from "@/lib/engine";
import { money } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { InfoBox } from "@/components/ui/InfoBox";
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
        <p className="text-muted">We need your current income first.</p>
        <Link href="/intake" className="text-accent hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Benefits-cliff simulator</h1>
          <p className="text-sm text-muted">
            An <strong className="text-foreground">educational estimate</strong>, not financial
            advice. See roughly what happens to your total resources if your income changes —
            sometimes a raise costs you more in lost benefits than you gain in pay.
          </p>
        </div>

        <InfoBox label="explainer" title="What's a &ldquo;benefits cliff&rdquo;?">
          <p className="text-sm text-muted leading-relaxed">
            Most assistance programs cut off once your income crosses a limit — sometimes all at
            once, not gradually. That means a modest raise or extra shift can push your income just
            over the line and cost you more in lost benefits than you gained in pay. This tool
            walks through that math using the programs from your results, so you can see the
            trade-off before it happens, not after.
          </p>
        </InfoBox>

        <Card className="p-5 space-y-3">
          <label className="block text-sm font-medium">
            If your monthly income went up by{" "}
            <span className="text-accent font-semibold">{money(increase)}</span>...
          </label>
          <input
            type="range"
            min={0}
            max={MAX_INCREASE}
            step={STEP}
            value={increase}
            onChange={(e) => setIncrease(Number(e.target.value))}
            className="w-full accent-[#2dd4bf]"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>+$0</span>
            <span>+{money(MAX_INCREASE)}</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="label-mono text-[10px] text-muted">now</p>
            <p className="font-semibold mt-1">{money(baselineIncome)}/mo income</p>
            <p className="text-sm text-muted">~{money(baselineValue)}/yr est. benefits</p>
          </Card>
          <Card className="p-4">
            <p className="label-mono text-[10px] text-muted">if income rises</p>
            <p className="font-semibold mt-1">{money(hypotheticalIncome)}/mo income</p>
            <p className="text-sm text-muted">~{money(hypotheticalValue)}/yr est. benefits</p>
          </Card>
        </div>

        <div
          className="rounded-xl p-5 border"
          style={{
            borderColor: netEffect >= 0 ? "rgba(45,212,191,0.35)" : "rgba(248,113,113,0.35)",
            backgroundColor: netEffect >= 0 ? "rgba(45,212,191,0.08)" : "rgba(248,113,113,0.08)",
          }}
        >
          <p className="label-mono text-[10px] text-muted">estimated net effect per year</p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: netEffect >= 0 ? "#2dd4bf" : "#f87171" }}
          >
            {netEffect >= 0 ? "+" : ""}
            {money(netEffect)}
          </p>
          <p className="text-xs text-muted mt-1">
            Extra pay ({money(extraPay)}/yr) {benefitChange <= 0 ? "minus" : "plus"} the
            change in estimated benefits ({money(Math.abs(benefitChange))}/yr{" "}
            {benefitChange <= 0 ? "lost" : "gained"}).
          </p>
        </div>

        {safeRaise !== undefined && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
            <p className="label-mono text-[10px] text-accent">roughly how much more you could earn safely</p>
            <p className="text-xl font-bold mt-1">up to about {money(safeRaise)}/mo more</p>
            <p className="text-xs text-muted mt-1">
              Before the estimated loss in benefits outweighs the extra pay, based on the programs
              in your results.
            </p>
          </div>
        )}

        <Link href="/results" className="text-sm text-accent hover:underline block">
          ← Back to my results
        </Link>
      </div>
    </main>
  );
}
