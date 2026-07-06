import { ALL_QUESTIONS } from "@/data/questions";
import type { CategoricalFlag, Program } from "@/lib/types";

// The "optional questions may only ADD matches" guarantee, enforced against
// the data at module load (so a violating data edit fails the build, loudly).
//
// A flag is *sensitive* exactly when it's asked by an optional question — the
// definition lives in the question data, not in a second hand-maintained list.
// Sensitive flags may appear in rules only as unlock keys (categorical
// requirements, raised income limits, income waivers). They must never appear
// in `disqualifyingFlags`, where answering could take a match away.

const SENSITIVE_FLAGS: Set<CategoricalFlag> = new Set(
  ALL_QUESTIONS.filter((q) => q.optional).flatMap((q) => {
    if (q.input.kind === "flag") return [q.input.flag];
    if (q.input.kind === "flagGroup") return q.input.options.map((o) => o.flag);
    return [];
  })
);

export function assertAddOnlyInvariant(programs: Program[]): void {
  for (const program of programs) {
    for (const flag of program.rules.disqualifyingFlags ?? []) {
      if (SENSITIVE_FLAGS.has(flag)) {
        throw new Error(
          `Data invariant violated: program "${program.id}" disqualifies on sensitive flag ` +
            `"${flag}". Optional/sensitive questions may only ADD matches — never exclude.`
        );
      }
    }
  }
}
