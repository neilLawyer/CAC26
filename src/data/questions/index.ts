import { GENERAL_QUESTIONS } from "@/data/questions/general";
import { SCOPE_QUESTIONS } from "@/data/questions/scopes";
import type { CategoricalFlag, ScreeningQuestion } from "@/lib/types";

// Single entry point for the question layer. The legacy names (FLAG_QUESTIONS,
// INCOME_BUCKETS, …) keep resolving from "@/data/questions" so the wizard,
// sidebar, and engine imports are unchanged.
export { FLAG_QUESTIONS, FLAG_QUESTION_MAP } from "@/data/questions/flags";
export { ASSET_BUCKETS, INCOME_BUCKETS, type IncomeBucket } from "@/data/questions/buckets";
export { STEP_LABELS, STEP_NOTES } from "@/data/questions/steps";
export { GENERAL_QUESTIONS } from "@/data/questions/general";
export { SCOPE_QUESTIONS } from "@/data/questions/scopes";

/** Every screening question, general + scope-specific, in one catalog. */
export const ALL_QUESTIONS: ScreeningQuestion[] = [...GENERAL_QUESTIONS, ...SCOPE_QUESTIONS];

/**
 * Flags whose yes/no question belongs to the *general* intake (asked by the
 * wizard). Category-scoped flags are asked on their /intake/[scope] page
 * instead, so the wizard's "a few more things" step stays short.
 */
export const GENERAL_INTAKE_FLAGS: Set<CategoricalFlag> = new Set(
  GENERAL_QUESTIONS.flatMap((q) => {
    if (q.input.kind === "flag") return [q.input.flag];
    if (q.input.kind === "flagGroup") return q.input.options.map((o) => o.flag);
    return [];
  })
);
