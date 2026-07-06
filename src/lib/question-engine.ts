import { ALL_QUESTIONS } from "@/data/questions";
import type {
  CategoricalFlag,
  EligibilityResult,
  FieldRequirement,
  Household,
  Program,
  QuestionScope,
  ScreeningQuestion,
} from "@/lib/types";

// The coverage mechanic: a deep-dive form is the union of
//   (a) questions explicitly scoped to it, and
//   (b) general questions whose answers its still-alive programs need
// minus everything the household already answered. This is what guarantees a
// category page never sends the user back to the general intake, and that a
// question only renders when some live program actually reads its answer.

type FieldKey = FieldRequirement["field"] | "kidsUnder17Count" | "householdSize" | "zip";
type FactKey =
  | { kind: "flag"; flag: CategoricalFlag }
  | { kind: "field"; field: FieldKey }
  | { kind: "income" }
  | { kind: "assets" };

/** Every fact a program's rules can read, including refinements that only add matches. */
function neededFacts(program: Program): FactKey[] {
  const r = program.rules;
  const facts: FactKey[] = [];
  // testIncome (engine.ts) unconditionally requires householdSize + an income
  // answer before it returns anything but "unknown" — even for programs with
  // no maxIncome* field set at all (it just falls through to "pass"). So these
  // two are needed by EVERY program, not only ones that declare a limit;
  // gating on "does this program have an income test" left VA/Pell/job-training
  // programs stuck at needsInfo forever, since nothing ever asked for them.
  facts.push({ kind: "income" }, { kind: "field", field: "householdSize" });
  if (r.assetLimitDollar !== undefined) facts.push({ kind: "assets" });
  for (const req of r.categoricalRequirements) facts.push({ kind: "flag", flag: req.type });
  for (const f of r.incomeWaivedByFlags ?? []) facts.push({ kind: "flag", flag: f });
  for (const f of r.disqualifyingFlags ?? []) facts.push({ kind: "flag", flag: f });
  for (const f of r.raisedIncomeLimitFlags ?? []) facts.push({ kind: "flag", flag: f });
  for (const fr of r.fieldRequirements ?? []) facts.push({ kind: "field", field: fr.field });
  if (r.kidCountIncomeTiers !== undefined) {
    facts.push({ kind: "field", field: "kidsUnder17Count" }, { kind: "field", field: "filingStatus" });
  }
  return facts;
}

/** The facts a question's answer writes. */
function writtenFacts(q: ScreeningQuestion): FactKey[] {
  switch (q.input.kind) {
    case "flag":
      return [{ kind: "flag", flag: q.input.flag }];
    case "flagGroup":
      return q.input.options.map((o) => ({ kind: "flag", flag: o.flag }) as FactKey);
    case "select":
      return [{ kind: "field", field: q.input.field }];
    case "count":
      return [{ kind: "field", field: q.input.field }];
    case "bucket":
      return [q.input.minField === "monthlyIncomeMin" ? { kind: "income" } : { kind: "assets" }];
    case "zip":
      return [{ kind: "field", field: "zip" }];
  }
}

function factId(f: FactKey): string {
  if (f.kind === "flag") return `flag:${f.flag}`;
  if (f.kind === "field") return `field:${f.field}`;
  return f.kind;
}

/** Has the household already answered what this question asks? */
export function isAnswered(q: ScreeningQuestion, household: Household): boolean {
  switch (q.input.kind) {
    case "flag":
      return household.flags[q.input.flag] !== undefined;
    case "flagGroup":
      // Answered once any option has an explicit true/false (the "none" choice sets all false).
      return q.input.options.some((o) => household.flags[o.flag] !== undefined);
    case "select":
      return household[q.input.field] !== undefined;
    case "count":
      return household[q.input.field] !== undefined;
    case "bucket":
      return household[q.input.minField] !== undefined || household[q.input.maxField] !== undefined;
    case "zip":
      return household.zip !== undefined;
  }
}

function showIfHolds(q: ScreeningQuestion, household: Household): boolean {
  for (const cond of q.showIf ?? []) {
    if ("flag" in cond) {
      if (household.flags[cond.flag] !== cond.equals) return false;
    } else if (household[cond.field] === undefined) {
      return false;
    }
  }
  return true;
}

/**
 * Assemble the form for a scope: explicitly-scoped questions plus general
 * questions still needed by the scope's not-yet-ruled-out programs, minus
 * everything already answered. Pure — safe to call per render.
 */
export function questionsForScope(
  scope: QuestionScope,
  scopeResults: EligibilityResult[],
  household: Household
): ScreeningQuestion[] {
  const needed = new Set<string>();
  for (const r of scopeResults) {
    if (r.confidence === "unlikely") continue;
    for (const f of neededFacts(r.program)) needed.add(factId(f));
  }

  return ALL_QUESTIONS.filter((q) => {
    const inScope = q.scope === scope;
    const fillsNeed = writtenFacts(q).some((f) => needed.has(factId(f)));
    if (!inScope && !fillsNeed) return false;
    if (isAnswered(q, household)) return false;
    return showIfHolds(q, household);
  }).sort((a, b) => {
    // Required before optional; then general (basics) before scope refinements; then declared order.
    const optDelta = Number(!!a.optional) - Number(!!b.optional);
    if (optDelta !== 0) return optDelta;
    const genDelta = Number(a.scope !== "general") - Number(b.scope !== "general");
    if (genDelta !== 0) return genDelta;
    return a.order - b.order;
  });
}
