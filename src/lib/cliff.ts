import { evaluateAll } from "@/lib/engine";
import type { Confidence, EligibilityResult, Household, Program } from "@/lib/types";

// The benefits-cliff arithmetic, extracted from the page so it can be unit
// tested — a wrong number in this simulator is a credibility killer.
//
// v4 audit finding: the previous simulator summed the value of every LIKELY
// **and POSSIBLE** result. Two ways that quietly corrupts the picture:
//  1. Net-basis programs (WFNJ, SSI, …) can never fall below "possible" on
//     gross income — by design (we only collect gross, net ≤ gross). So the
//     old simulator NEVER counted them as lost, muting real cliffs.
//  2. Waitlist/formula-capped programs (confidenceCap) sat in the totals at
//     full value even though qualifying doesn't mean receiving.
// The honest basis: count only programs we'd mark "likely" — the ones whose
// rules we can actually decide — and NAME what appears/disappears. The page
// states this basis in plain words.

/** The simulator works with an exact hypothetical income, not a range. */
export function withExactIncome(household: Household, monthlyIncome: number): Household {
  return { ...household, monthlyIncomeMin: monthlyIncome, monthlyIncomeMax: monthlyIncome };
}

/** Midpoint of a program's verified value range; 0 when the record carries none. */
export function programMidpoint(program: Program): number {
  const min = program.estimatedAnnualValueMin;
  const max = program.estimatedAnnualValueMax;
  if (min === undefined || max === undefined) return 0;
  return Math.round((min + max) / 2);
}

/** Sum of value midpoints across LIKELY results only. */
export function likelyValue(results: EligibilityResult[]): number {
  return results
    .filter((r) => r.confidence === "likely")
    .reduce((sum, r) => sum + programMidpoint(r.program), 0);
}

export interface CliffDelta {
  program: Program;
  /** Annual midpoint from the record; 0 = the record carries no dollar figure. */
  midpoint: number;
  /**
   * Where a lost program LANDED: "unlikely" = the rules rule it out;
   * "possible" = we can no longer promise it but it may survive (net-basis
   * programs where deductions could still qualify the household). The UI
   * words these differently — flatly calling the second kind "lost" would
   * overstate what we know.
   */
  to?: Confidence;
}

export interface CliffComparison {
  extraPayAnnual: number;
  baselineLikelyValue: number;
  hypotheticalLikelyValue: number;
  /** hypothetical − baseline (negative = benefits lost). */
  benefitChangeAnnual: number;
  /** extraPayAnnual + benefitChangeAnnual — the identity the page displays. */
  netEffectAnnual: number;
  /** Likely at baseline, no longer likely at the hypothetical income. */
  lost: CliffDelta[];
  /** Newly likely at the hypothetical income (income floors, phase-ins). */
  gained: CliffDelta[];
  /** Programs excluded from the totals because we can't promise them (possible/waitlist/net-basis). */
  uncountedPossible: number;
}

export function compareCliff(
  programs: Program[],
  household: Household,
  baselineMonthlyIncome: number,
  increaseMonthly: number
): CliffComparison {
  const base = evaluateAll(programs, withExactIncome(household, baselineMonthlyIncome));
  const hyp = evaluateAll(
    programs,
    withExactIncome(household, baselineMonthlyIncome + increaseMonthly)
  );

  const baseLikely = new Set(
    base.filter((r) => r.confidence === "likely").map((r) => r.program.id)
  );
  const hypLikely = new Set(hyp.filter((r) => r.confidence === "likely").map((r) => r.program.id));

  const hypById = new Map(hyp.map((r) => [r.program.id, r]));
  const lost = base
    .filter((r) => baseLikely.has(r.program.id) && !hypLikely.has(r.program.id))
    .map((r) => ({
      program: r.program,
      midpoint: programMidpoint(r.program),
      to: hypById.get(r.program.id)?.confidence,
    }));
  const gained = hyp
    .filter((r) => hypLikely.has(r.program.id) && !baseLikely.has(r.program.id))
    .map((r) => ({ program: r.program, midpoint: programMidpoint(r.program) }));

  const baselineLikelyValue = likelyValue(base);
  const hypotheticalLikelyValue = likelyValue(hyp);
  const benefitChangeAnnual = hypotheticalLikelyValue - baselineLikelyValue;
  const extraPayAnnual = increaseMonthly * 12;

  return {
    extraPayAnnual,
    baselineLikelyValue,
    hypotheticalLikelyValue,
    benefitChangeAnnual,
    netEffectAnnual: extraPayAnnual + benefitChangeAnnual,
    lost,
    gained,
    uncountedPossible: hyp.filter((r) => r.confidence === "possible").length,
  };
}

/**
 * Largest raise (in $step/mo increments up to maxMonthly) whose net effect
 * stays non-negative — scanning stops at the FIRST cliff, deliberately: "you
 * can safely earn up to X more" must not skate over an interior dip.
 */
export function safeRaiseMonthly(
  programs: Program[],
  household: Household,
  baselineMonthlyIncome: number,
  step = 100,
  maxMonthly = 5000
): number {
  let lastSafe = 0;
  for (let inc = step; inc <= maxMonthly; inc += step) {
    const { netEffectAnnual } = compareCliff(programs, household, baselineMonthlyIncome, inc);
    if (netEffectAnnual < 0) break;
    lastSafe = inc;
  }
  return lastSafe;
}
