import { monthlyFPL } from "@/data/fpl";
import { money } from "@/lib/format";
import type {
  CategoricalFlag,
  Confidence,
  EligibilityResult,
  Household,
  Program,
  ProgramRules,
} from "@/lib/types";

type TestStatus = "pass" | "fail" | "borderline" | "unknown";

const FLAG_LABELS: Record<CategoricalFlag, string> = {
  age65Plus: "someone in the household is 65 or older",
  disabled: "someone in the household has a disability",
  veteran: "someone in the household is a veteran",
  pregnantOrChildUnder5: "someone is pregnant or there's a child under 5",
  schoolAgeChild: "there's a school-age child in the household",
  utilityHardship: "the household is behind on utility bills",
  student: "someone in the household is a student",
  unemployed: "someone in the household is unemployed",
};

function monthlyIncomeLimits(rules: ProgramRules, householdSize: number) {
  let maxMonthly: number | undefined;
  let minMonthly: number | undefined;

  if (rules.maxIncomePctFPL !== undefined) {
    maxMonthly = monthlyFPL(householdSize) * (rules.maxIncomePctFPL / 100);
  }
  if (rules.minIncomePctFPL !== undefined) {
    minMonthly = monthlyFPL(householdSize) * (rules.minIncomePctFPL / 100);
  }
  if (rules.maxIncomeFlatDollar !== undefined) {
    const flatMonthly =
      rules.incomePeriod === "annual" ? rules.maxIncomeFlatDollar / 12 : rules.maxIncomeFlatDollar;
    maxMonthly = maxMonthly === undefined ? flatMonthly : Math.min(maxMonthly, flatMonthly);
  }
  return { minMonthly, maxMonthly };
}

function testIncome(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  if (!household.householdSize) {
    return { status: "unknown", reason: "We still need your household size to check the income rule." };
  }
  if (household.monthlyIncomeMin === undefined && household.monthlyIncomeMax === undefined) {
    return { status: "unknown", reason: "We still need your income range to check this program." };
  }

  const incMin = household.monthlyIncomeMin ?? household.monthlyIncomeMax!;
  const incMax = household.monthlyIncomeMax ?? household.monthlyIncomeMin!;
  const { minMonthly, maxMonthly } = monthlyIncomeLimits(rules, household.householdSize);

  let upper: TestStatus = "pass";
  if (maxMonthly !== undefined) {
    if (incMax <= maxMonthly) upper = "pass";
    else if (incMin > maxMonthly) upper = "fail";
    else upper = "borderline";
  }

  let lower: TestStatus = "pass";
  if (minMonthly !== undefined) {
    if (incMin >= minMonthly) lower = "pass";
    else if (incMax < minMonthly) lower = "fail";
    else lower = "borderline";
  }

  if (upper === "fail") {
    return {
      status: "fail",
      reason: `Your household income looks like it's above the limit for this program (about ${money(
        maxMonthly!
      )}/month for a household of ${household.householdSize}).`,
      counterfactual: `If your monthly household income were below about ${money(
        maxMonthly!
      )}, you'd likely qualify on income.`,
    };
  }
  if (lower === "fail") {
    return {
      status: "fail",
      reason: `This program has an income floor of about ${money(
        minMonthly!
      )}/month, and your income looks like it's below that.`,
      counterfactual: `This one kicks in once household income is above about ${money(
        minMonthly!
      )}/month.`,
    };
  }
  if (upper === "borderline" || lower === "borderline") {
    return {
      status: "borderline",
      reason: "Your income is close to the line for this program — worth double-checking with the agency.",
    };
  }
  return { status: "pass", reason: "Your household income looks like it fits within the limit." };
}

function testCategorical(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  const reqs = rules.categoricalRequirements;
  if (reqs.length === 0) {
    return { status: "pass", reason: "No age, disability, or family-status requirement for this one." };
  }

  const evals = reqs.map((r) => household.flags[r.type]);
  const labels = reqs.map((r) => FLAG_LABELS[r.type]);

  if (rules.requireAllCategorical) {
    if (evals.some((v) => v === false)) {
      return {
        status: "fail",
        reason: `This program requires that ${labels.join(" and ")}.`,
      };
    }
    if (evals.every((v) => v === true)) {
      return { status: "pass", reason: `Matches the requirement: ${labels.join(" and ")}.` };
    }
    return {
      status: "unknown",
      reason: `We still need to confirm: ${labels.join(" and ")}.`,
    };
  }

  // any-of
  if (evals.some((v) => v === true)) {
    return { status: "pass", reason: `Matches at least one qualifying condition (${labels.join(", ")}).` };
  }
  if (evals.every((v) => v === false)) {
    return {
      status: "fail",
      reason: `This program requires at least one of: ${labels.join(", ")}.`,
      counterfactual: `You'd need at least one of these to apply: ${labels.join(", ")}.`,
    };
  }
  return {
    status: "unknown",
    reason: `We still need to confirm one of: ${labels.join(", ")}.`,
  };
}

export function evaluateProgram(program: Program, household: Household): EligibilityResult {
  const income = testIncome(program.rules, household);
  const categorical = testCategorical(program.rules, household);

  const reasons = [income.reason, categorical.reason];
  const counterfactual = income.counterfactual ?? categorical.counterfactual;

  let confidence: Confidence;
  if (income.status === "fail" || categorical.status === "fail") {
    confidence = "unlikely";
  } else if (income.status === "unknown") {
    confidence = "needsInfo";
  } else if (income.status === "pass" && categorical.status === "pass") {
    confidence = "likely";
  } else {
    // income pass/borderline + categorical pass/borderline/unknown, or vice versa
    confidence = "possible";
  }

  return { program, confidence, reasons, counterfactual };
}

export function evaluateAll(programs: Program[], household: Household): EligibilityResult[] {
  return programs.map((p) => evaluateProgram(p, household));
}

/** "Eligibility so far" meter: count of programs not yet ruled out. */
export function stillPossibleCount(results: EligibilityResult[]): number {
  return results.filter((r) => r.confidence !== "unlikely").length;
}

/** Rough "money left on the table" estimate: midpoint of value range, summed over likely + possible results. */
export function estimatedAnnualValue(results: EligibilityResult[]): { min: number; max: number } {
  const relevant = results.filter((r) => r.confidence === "likely" || r.confidence === "possible");
  return relevant.reduce(
    (acc, r) => ({
      min: acc.min + (r.program.estimatedAnnualValueMin ?? 0),
      max: acc.max + (r.program.estimatedAnnualValueMax ?? 0),
    }),
    { min: 0, max: 0 }
  );
}

/** Single-number estimate (midpoint of each program's value range) for the benefits-cliff simulator. */
export function estimatedAnnualValueMidpoint(results: EligibilityResult[]): number {
  const { min, max } = estimatedAnnualValue(results);
  return Math.round((min + max) / 2);
}

/** Cascade suggestions: programs hinted at by "likely" results, that aren't already likely themselves. */
export function cascadeSuggestions(results: EligibilityResult[]): { from: Program; suggested: Program }[] {
  const byId = new Map(results.map((r) => [r.program.id, r]));
  const likely = results.filter((r) => r.confidence === "likely");
  const suggestions: { from: Program; suggested: Program }[] = [];

  for (const r of likely) {
    for (const hintId of r.program.cascadeHints ?? []) {
      const hinted = byId.get(hintId);
      if (hinted && hinted.confidence !== "likely") {
        suggestions.push({ from: r.program, suggested: hinted.program });
      }
    }
  }
  return suggestions;
}
