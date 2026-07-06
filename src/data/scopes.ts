import { CATEGORIES } from "@/data/categories";
import { POPULATIONS } from "@/data/populations";
import type { EligibilityResult, Program, QuestionScope } from "@/lib/types";

// The scope registry for /intake/[scope]: the eight program categories AND the
// five personas are values of the same `scope` param, rendered by the same
// template and the same form generator. Adding a category or persona is a data
// edit (categories.ts / populations.ts) — this file just merges them.

export interface ScopeMeta {
  id: QuestionScope;
  kind: "category" | "persona";
  label: string;
  color: string;
  intro: string;
  /** Honest interim pointer to the official LOCAL finder (see CategoryMeta.localPointer). */
  localPointer?: { finderName: string; finderUrl: string; note: string };
  /** Keeps only this scope's programs from the state's evaluated results. */
  filterResults: (results: EligibilityResult[]) => EligibilityResult[];
}

const CATEGORY_SCOPES: ScopeMeta[] = CATEGORIES.map((c) => ({
  id: c.id,
  kind: "category" as const,
  label: c.label,
  color: c.color,
  intro: c.intro,
  localPointer: c.localPointer,
  filterResults: (results) => results.filter((r) => r.program.category === c.id),
}));

const PERSONA_SCOPES: ScopeMeta[] = POPULATIONS.map((p) => {
  const ids = new Set(p.programIds);
  return {
    id: p.id as QuestionScope,
    kind: "persona" as const,
    label: p.label,
    color: p.color,
    intro: p.landing.body,
    filterResults: (results: EligibilityResult[]) =>
      results.filter((r) => ids.has(r.program.id)),
  };
});

export const SCOPES: ScopeMeta[] = [...CATEGORY_SCOPES, ...PERSONA_SCOPES];

export function getScope(id: string): ScopeMeta | undefined {
  return SCOPES.find((s) => s.id === id);
}

/** Convenience for generateStaticParams. */
export function allScopeIds(): string[] {
  return SCOPES.map((s) => s.id);
}

/** Programs relevant to a scope, for building its question set. */
export function scopePrograms(scope: ScopeMeta, statePrograms: Program[]): Program[] {
  if (scope.kind === "category") {
    return statePrograms.filter((p) => p.category === scope.id);
  }
  const persona = POPULATIONS.find((p) => p.id === scope.id);
  const ids = new Set(persona?.programIds ?? []);
  return statePrograms.filter((p) => ids.has(p.id));
}
