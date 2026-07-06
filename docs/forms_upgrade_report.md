# OpenDoor — Self-Verification Report

Two-part self-audit against `docs/sources.md` and the add-only guarantee. Method: I traced every program's `rules` against the actual question data and the actual `questionsForScope`/`engine.ts` logic — not a re-read of prior claims — and grepped for cross-cutting violations rather than sampling. Three real gaps were found and fixed; two pre-existing issues were found and are flagged below for your call rather than fixed unilaterally, since fixing them exceeds what this task authorized.

---

## (1) Coverage: is every `docs/sources.md` program reachable?

**Method.** For every program in `src/data/{federal,states/NJ,states/CA}/programs.ts`, I listed every fact its `rules` can read (`categoricalRequirements`, `incomeWaivedByFlags`, `disqualifyingFlags`, `raisedIncomeLimitFlags`, `fieldRequirements`, `kidCountIncomeTiers`/`requireKidsUnder17`, `assetLimitDollar`, income/size) and confirmed a question exists somewhere (general intake or a scope-explicit question) that can set it, then mentally constructed a satisfying household for each program to confirm it can actually reach `likely` or `possible` — not just that a question exists, but that answering it moves the needle.

**Result: every program is reachable.** No orphaned fact — every flag and field referenced by any rule has a corresponding question. I did not find a program permanently stuck at `unlikely` or `needsInfo` due to a missing question.

### Fixed

**Health category promised a pointer it didn't have.** The `chronicCondition` question's help text says "we'll point you to where to ask" about medically-needy Medicaid — but unlike food/housing/tax/education, the `health` category had no `localPointer` card at all. Added one, pointing to Medicaid.gov's state-agency directory (`docs/sources.md` §5, verified live).

**Tax pointer's label overclaimed.** The card's clickable name read "IRS free tax prep locator (VITA/TCE) & GetYourRefund," but the single URL only went to the VITA/TCE locator — GetYourRefund.org was never actually linked. Renamed the clickable label to describe only what it links to, and moved the GetYourRefund mention into the note text as a named alternative (verified live, not hyperlinked, so the label never claims more than the href delivers).

### Flagged, not fixed (exceeds today's scope — needs your call)

**The net/gross income-basis bug is still live.** `ProgramRules.incomeBasis` is set on every program (`"gross"` or `"net"`) but `grep -rn "incomeBasis" src/` shows it is *never read* anywhere in `engine.ts` — only declared in the type and in data literals. This was identified as a P0 in `docs/upgrade_plan.md` and explicitly "approved, folded into F-2" in `docs/forms_upgrade_plan.md`, but the code was never actually changed. It affects the net-basis programs: `nj-wfnj`, `nj-ssi`, `nj-county-ga`, `ca-ssi-ssp`, `ca-capi`, `ca-county-ga` — a household whose *gross* income exceeds a *net*-tested limit can be shown `unlikely` when their real (post-deduction) net income might still qualify. This doesn't block reachability (a low-enough income bucket still reaches `possible`/`likely` for all six), so it's outside the strict scope of "is every program reachable" — but it's a real, previously-flagged, still-open correctness gap and I didn't touch `engine.ts` today since neither of your two verification asks authorized an engine change. Your call whether to greenlight that fix now or separately.

**"VA Benefits (main hub)" row is only partially modeled.** That `docs/sources.md` §6b row's own description lists "disability compensation, healthcare, education (GI Bill), home loans, pension, burial benefits." Four of those six are modeled (`us-va-disability`, `us-gi-bill`, `us-va-home-loan`, `us-va-pension`). **VA healthcare enrollment and VA burial benefits are not modeled as programs at all** — no amount of question-adding fixes this, since there's no `Program` record to make reachable. Adding two new programs is a content decision, not a question-layer fix, so I'm flagging it rather than adding unverified benefit records unilaterally.

**§1 finder sites are wired nowhere.** Benefits.gov, USA.gov Benefits, findhelp.org, and 211.org (`docs/sources.md` §1) aren't linked anywhere in the app — confirmed via `grep -rn "benefits.gov|findhelp.org|211.org|usa.gov" src/` returning nothing. These are appropriately *not* modeled as `Program` records (they're screening tools, not benefits), so they don't fail the reachability check — but the state-coverage fallback described in `docs/upgrade_plan.md` (a benefits-aggregator pointer for non-NJ/CA states) was never built; TX/NY/FL/PA just show as disabled "Coming soon" in the state picker. Out of scope for today (that's the 50-state rollout, not this audit), noting for completeness.

---

## (2) Optional/sensitive questions: truly optional, skippable, explained, additive-only?

**Method.** Enumerated every question with `optional: {...}` in the data (`grep -rn "optional: {" src/data/` → exactly 10, matching my manual read of `general.ts` and `scopes.ts` with no strays elsewhere), then checked each of the four properties against the actual code paths that render and evaluate them — not just the data shape.

**The 10:** `pregnantOrChildUnder5`, `age65Plus`, `disabled`, `veteran`, `student`, `immigrant` (general intake) + `chronicCondition`, `servedActiveDuty`, `serviceConnectedCondition` (health/veterans scopes) + `immigrants.status` (persona-scoped, same `immigrant` flag).

- **Skippable**: every one uses `kind: "flag"`, which always renders Yes/No/Skip. Confirmed structurally in `engine.ts`: skip (unanswered) can *never* produce `fail` in `testCategorical`, `testFields`, `testAssets`, or `testDisqualifiers` — each returns `unknown` when a value is missing, and `fail` requires an explicit answer. This holds for every flag, not just sensitive ones.
- **Explained**: all 10 carry a non-empty `whyWeAsk` string.
- **Additive-only**: `grep -B2 "disqualifyingFlags"` across all three program packs finds exactly two disqualifying flags in the entire app — `hasOtherHealthCoverage` and `investmentIncomeOverCap` — and neither is one of the 10 optional flags (both are required, non-sensitive questions). Zero overlap. This is also mechanically enforced at build time by `assertAddOnlyInvariant` (`src/lib/data-invariants.ts`), which throws if any sensitive flag ever lands in `disqualifyingFlags`; the build stayed green through this audit, confirming it still holds after this pass's edits.

### Fixed

**The general intake wizard silently dropped the disclosure.** `FlagStep.tsx` — the "a few more things" step of `/intake`, a separate rendering path from the `DeepForm` generator used on category/persona pages — renders questions from the older flat `FLAG_QUESTIONS` catalog, which has no concept of `optional`/`whyWeAsk`. Concretely: a user answering "Is anyone in your household a veteran?" on `/intake` saw a plain Yes/No/Skip row with no indication it was optional and no explanation why it was asked — while the *exact same flag*, reached via `/intake/veterans`, carried the "optional" badge and a why-we-ask line. Same sensitivity, inconsistent disclosure depending on which door a user came through.

Fixed by deriving a `FLAG_OPTIONAL_INFO` lookup in `src/data/questions/index.ts` from the same `ScreeningQuestion` records `DeepForm` already reads (one source of truth — marking a question `optional` there now covers both rendering paths), and updating `FlagStep.tsx` to show the same badge + why-we-ask line when a flag has an entry. No new question-authoring pattern; this makes an existing one apply everywhere it's supposed to.

---

## Verified

`tsc --noEmit` clean, production build green (`assertAddOnlyInvariant` didn't throw), ESLint clean. Runtime-confirmed: the health local-pointer card renders with the corrected copy, the tax pointer's GetYourRefund mention appears as text (not a mismatched link), and the `FLAG_OPTIONAL_INFO`/`FlagStep` code path is present in the built bundle. I did not drive the wizard's "flags" step through a live browser session (it's client-side `localStorage` state, not reachable via `curl`) — the fix reuses the identical, already-proven `DeepForm` pattern, but a 30-second manual click-through of `/intake`'s flags step is worth doing before you consider this fully closed.

## Your call

1. **Net/gross income-basis fix** — real, previously flagged, still unimplemented. Say go and I'll do it (small, contained per the earlier F-2 scoping: ~10–15 lines in `testIncome`).
2. **VA healthcare / burial benefits** — add as new programs, or leave as a documented gap?
3. **§1 finder pointers for non-NJ/CA states** — build the aggregator-fallback mechanism from `docs/upgrade_plan.md`, or leave the 50-state rollout for later?
