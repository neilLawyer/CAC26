@AGENTS.md

## TODO before submission

- [ ] **Wire up the `assetLimitDollar` check.** It's defined on `ProgramRules`
  (`src/lib/types.ts`) and set in program data (e.g. SSI, CAPI), but the engine
  (`src/lib/engine.ts`) never tests it. Add an assets question to the intake
  catalog + an optional `Household` asset field, then test it in `evaluateProgram`.
- [ ] **Refresh `lastVerified` dates.** Every program in
  `src/data/states/*/programs.ts` (and `FPL_LAST_VERIFIED` in `src/data/fpl.ts`)
  is stamped `2025-02-01` — re-check the figures against the official sources and
  update the dates before the 2026 submission.

