# OpenDoor v2 — Master Blueprint (Phase A1)

## Context

OpenDoor is a benefits-screening demo (Congressional App Challenge) with a genuinely good core — a rules-as-data eligibility engine, a 5-step adaptive intake, results with reason traces, and a working benefits-cliff simulator — wrapped in a marketing shell full of controls that look clickable but do nothing, and limited to 2 states. This document is the **Phase A1 deliverable** of `OpenDoor_v2_Fable5_Playbook.md` (the authoritative plan; `docs/build_plan.md` does not exist and is ignored): the approved master blueprint for the two-track upgrade.

> **Housekeeping:** the repo file `docs/OpenDoor v2 — Fable 5 Build Playbook` is 0 bytes; the real playbook lives at `C:\Users\yavas\Downloads\OpenDoor_v2_Fable5_Playbook.md` and should be copied into `docs/` in Phase A3.

**Corrections locked in by the user:** Track B deep-dive pages live at **`/intake/[category]`** (not `/screen/...`); `/cliff-simulator` is an existing, working feature to **preserve and integrate** (Phase G5 wires it into result cards), not rebuild.

### Scope note — what approving this document locks

Approving this blueprint locks: the current-state assessment (§1), the two-track architecture at the level of routes/tracks/data-flow direction (§2), the state-coverage model (§3), the rules-as-data guarantees (§4), the kill list dispositions (§5), and the phase ordering (§6).

Material marked **[Proposal — B1]**, **[Proposal — C1]**, **[Proposal — D1]**, **[Proposal — E1]**, **[Proposal — G4]**, or **[Proposal — G5]** is a **non-binding starting proposal** for that playbook plan phase. Each of those phases still runs its own plan-mode step per the playbook and may revise the corresponding detail against this locked blueprint. The proposals exist so later sessions don't re-derive context, not to skip the plan gates.

**Platform notes (verified against `node_modules/next/dist/docs/`):** Next.js 16.2.10 App Router — `params`/`searchParams` are Promises (`await params` in server components, `use(params)` in client); global `PageProps<'/intake/[category]'>` types (no import); Turbopack default; Tailwind v4 CSS-config via `@theme inline`. `node_modules` is **not installed at the repo root** — run `npm install` before building. `.claude/worktrees/phase1-scaffold/` is a stale copy of the app — ignore it entirely.

---

## (1) CURRENT STATE MAP

### Pages

| File | What it is | Quality | Functional? |
|---|---|---|---|
| `src/app/layout.tsx` | Root layout: fonts, no-flash theme script, HouseholdProvider, NavHeader | Solid | Functional infra |
| `src/app/page.tsx` | Marketing landing | Visually solid, structurally dishonest | **Mostly decorative** — 3 real links; category tiles, "moments" cards, accessibility cards, STEPS cards all have `hover-lift` but are dead `<div>`s; hero "results" card is fabricated static data; footer has zero links; "Now open in New Jersey" pill contradicts `states.ts` (CA is also live) |
| `src/app/intake/page.tsx` | 5-step wizard (state → size → income → flags → review), adaptive flag pruning, live meter | Solid — strongest page | Fully functional, but questions/buckets are **hardcoded in the component**, not data |
| `src/app/results/page.tsx` | Results grouped by confidence, reason traces, counterfactuals, cascades, value banner | Solid | Fully functional; real source/apply links |
| `src/app/cliff-simulator/page.tsx` | Income-raise slider, re-runs engine per $100 step, "largest safe raise" scan | Solid, genuinely clever | Fully functional — **orphaned** (only reachable via nav; no result links into it) |

### Components

| File | Quality | Notes |
|---|---|---|
| `src/components/NavHeader.tsx` | Solid | Links functional; state pill + "local & private" dot informational |
| `src/components/ThemeToggle.tsx` | Solid | Functional |
| `src/components/UseCaseSlideshow.tsx` | Solid mechanics | Dots are real tabs, BUT scenarios hardcode NJ program names — wrong for CA users |
| `src/components/EligibilityMeter.tsx` | Solid | Presentational (correctly so) |
| `src/components/IntakeSidebar.tsx` | Solid | Presentational |

### Engine & data

| File | Quality | Notes |
|---|---|---|
| `src/lib/engine.ts` | Solid, pure, program-agnostic | **P0: silently ignores `assetLimitDollar` and `incomeBasis` — see below** |
| `src/lib/types.ts` | Solid | `CategoricalFlag` has 4 dead members: `veteran`/`utilityHardship` (questions exist, no program references them → can never render), `student`/`unemployed` (no question, no program). Missing the `eligibility_type` + `confidence` fields `docs/sources.md` calls central |
| `src/lib/fpl.ts` | Solid | Flat national 2025 FPL; no AMI |
| `src/lib/states.ts` | Works, wrong shape | Boolean `available`; NJ+CA live, TX/NY/FL/PA dead stubs; no coverage tiers, no aggregators |
| `src/data/states/NJ/programs.ts` (14), `CA/programs.ts` (13) | Honest approximations | WIC/SSI duplicated across both packs as `state:"US"`; uniform `lastVerified:"2025-02-01"`; some rounded placeholder ceilings |
| `src/lib/household-store.tsx` | Solid pattern | localStorage + `useSyncExternalStore`; but one bespoke setter per field — doesn't scale to data-driven questions |
| `src/app/globals.css` | Solid | Tailwind v4 tokens via CSS vars + `@theme inline`; custom utilities (`hover-lift`, `grid-bg`, `dot-live`) |

### P0 — The engine ignores rules the data declares (live correctness bugs)

The program data files declare two rule fields that `src/lib/engine.ts` never reads. `evaluateProgram` (engine.ts:147) calls exactly two tests — `testIncome` (line 42) and `testCategorical` (line 102) — and neither function, nor anything else in the engine, references `rules.incomeBasis` or `rules.assetLimitDollar`. The result is wrong answers in **both directions**:

**Bug 1 — `incomeBasis: "net"` treated as gross → false negatives (people wrongly told "unlikely").**
Seven programs across the two packs are net-income tested: NJ — **WFNJ/TANF** (NJ/programs.ts:117, 60% FPL net), **SSI** (line 167, $1,300/mo net), **County General Assistance** (line 264, $600/mo net); CA — **CalWORKs** (CA/programs.ts:120), **SSI/SSP** (line 172), **CAPI** (line 198), **County General Assistance** (line 273). The intake collects one **gross** income range, and `testIncome` compares it directly against the limit (engine.ts:57–62), hard-failing when the range floor exceeds it (engine.ts:71–81).

*What a household experiences today:* a NJ family of 3 with a child, earning $1,500–$2,000/mo gross, checks eligibility. WFNJ's net limit for 3 is ~60% FPL ≈ **$1,333/mo**, so the engine returns a hard `fail` → confidence **"unlikely"** → the card says *"Your household income looks like it's above the limit."* But TANF counts income **after** earned-income disregards and childcare deductions — their net income could well be under the line. They're steered away from a program worth **$2,000–$12,000/yr** (the data's own estimate), and it's excluded from their "money left on the table" total. Since net ≤ gross always, gross-over-limit can never honestly be a `fail` — at most `borderline`.

**Bug 2 — `assetLimitDollar` never tested → false positives (overpromising).**
SSI in both packs (NJ:170, CA:175) and CAPI (CA:201) declare `assetLimitDollar: 2000`. The engine never evaluates it, and the intake never asks about assets, so the declared $2,000 resource limit is pure decoration.

*What a household experiences today:* a 66-year-old with low monthly income but $50,000 in savings is shown SSI as **"likely"** with an estimated **$6,000–$13,000/yr** — a benefit they cannot get (SSI's resource limit is a hard cutoff). The reason trace never mentions resources, so nothing warns them before they invest time applying.

**Why it's P0:** the app's entire honesty framing ("we never invent numbers, verify with the agency") is undermined when the engine silently skips rules its own data declares. Fix is flagged P0 in the kill list (§5, row 0) regardless of the phase that would normally own it.

### Docs

| File | Status |
|---|---|
| `README.md` | **Stale** — claims "one fully-built state (California)"; NJ is the default and priority |
| `OpenDoor_feature_plan.md` | Master feature vision (8 layers); demo core is built, layers 4–6, 8 are not |
| `docs/sources.md` | Rich source catalog + eligibility-type taxonomy (🟢 entitlement / 🟡 capped / 🔴 lottery) — **taxonomy has no field on `Program`**. Warns ACP dead (June 2024) |
| `docs/OpenDoor v2 — Fable 5 Build Playbook` | **0-byte file** — copy real content in from Downloads |

**Verdict:** the screener core (intake → engine → results → cliff sim) is real and good. The rot is at the edges: decorative landing controls, hardcoded question data, dead schema fields, a 2-state ceiling, and an engine that silently skips rules the data declares.

---

## (2) TWO-TRACK TARGET ARCHITECTURE

### Routes (App Router) — locked

```
src/app/
  page.tsx                       "/"                     landing (wired, honest)
  intake/page.tsx                "/intake"               Track A: ~10-question quick intake
  intake/[category]/page.tsx     "/intake/food" etc.     Track B: ONE template, 8 category pages
  intake/[category]/not-found.tsx
  results/page.tsx               "/results"              the hub: mainstream cards + ranked category tabs
  cliff-simulator/page.tsx       "/cliff-simulator"      EXISTING — preserved; gains pre-fill params (Phase G5)
  style/page.tsx                 "/style"                design-system reference (created Phase H)
```

`/intake/[category]` is a server component: `generateStaticParams()` from the category registry, `const { category } = await params`, unknown id → `notFound()`. All interactivity lives in one client `CategoryScreen` template.

### The household object — a typed facts map **[Proposal — B1]**

Kill the one-setter-per-field pattern. `Household` becomes `{ version: 2, state: string, facts: Partial<Record<FactKey, FactValue>> }`. The fact registry is data (`src/data/facts.ts`, `as const`), so `FactKey` is a **derived** type — adding a fact is one data line, still compile-checked. Existing flag keys (`age65Plus`, `disabled`, …) carry over unchanged so localStorage migration is a shallow reshape (same `opendoor-household` key, `version` field in the payload; unversioned payloads migrated on read, corrupt → empty).

Store API collapses to `setState(state)`, `setFact(key, value | undefined)`, `reset()`. Both Track A and every deep-dive form write through `setFact` into the **same shared store** — the store *is* `mergeAnswers`; hub → category → hub loses nothing by construction.

### Questions as data, one form engine **[Proposal — C1]**

```
src/data/questions/core.ts        Track A (~10)
src/data/questions/<category>.ts  8 deep-dive files (requires_questions per category module)
src/lib/question-types.ts         Question / Condition types
src/lib/question-engine.ts        visibleQuestions(questions, household, results) — pure
src/components/FormEngine.tsx     the ONE renderer (select / boolean / number / range-select)
```

`Question` = `{ id, fact, kind, prompt, helpText?, scope: "core" | CategoryId, order, options?, showIf?: Condition[], skippable? }`. Two composable visibility mechanisms, both data-driven: explicit `showIf` conditions, plus **rule-relevance pruning** (generalizing today's `relevantFlags` logic): a question renders only if some not-yet-`unlikely` program's rules reference its fact. This structurally kills the dead-question class — the `veteran` question auto-revives the day a program references `veteran`, and not before.

### Track A — the ~10 questions **[Proposal — E1]** (per playbook Phase E1)

| # | Question | Fact(s) | Unlocks |
|---|---|---|---|
| 1 | State | `state` | program pack + coverage banner |
| 2 | Age band | `ageBand` (sets `age65Plus`) | SSI, senior programs, Medicare Savings |
| 3 | Household size | `householdSize` | every FPL test |
| 4 | Marital status | `maritalStatus` | EITC/CTC filing tiers |
| 5 | Dependents / kids | `kidsUnder17Count`, `pregnantOrChildUnder5` | CTC, EITC tiers, WIC, school meals, TANF |
| 6 | Student status (none/HS/college) | `studentStatus` | Pell/FAFSA, education category relevance |
| 7 | Employment status | `employmentStatus` (sets `hasEarnedIncome`) | EITC/CTC (earned-income), unemployment |
| 8 | Homeowner or renter | `housingTenure` | tax deep dive (exclusion, property relief) vs housing (Section 8) relevance |
| 9 | Income band | `monthlyIncome` (range) | SNAP, Medicaid, LIHEAP, WIC, Lifeline, ACA |
| 10 | Tax filing status | `filesTaxes` | EITC/CTC delivery |

Disability is kept as an early deep-dive/adaptive question (rule-relevance keeps it visible while SSI is possible). Asset band (`liquidAssets`) moves to the Cash/deep dives — it powers the SSI asset test without bloating Track A. Ordering is by information gain: state → size → income unlock the most programs; the rest refine.

### Category modules — data, one template **[Proposal — C1]**

`src/data/categories/<id>.ts` (8 files) each declare: `id, label, lucideIcon, accentColor, intro, blurb, order, relevance: { facts: FactKey[], weight: number }, requiresQuestions: Question[], programIds: string[]`. Registry aggregated in `src/data/categories/index.ts`; `CategoryId` **derived** from the registry (`as const` + `typeof`), replacing the hand-written union in `types.ts` — a new category is a new data file + one index import, zero component changes. This registry also replaces the landing page's hardcoded `CATEGORIES` const and kills `category.replace("-", " & ")` munging (label lives in data). Icons: `lucide-react` (new dependency), icon *names* stored as data.

The one `CategoryScreen` template renders: (a) intro from module data + state coverage banner, (b) `FormEngine` over the module's `requiresQuestions` (if Track A wasn't done, core questions render inline first — no bounce), (c) category results = `evaluateAll(programsForState, household).filter(r => r.program.category === id)`, reusing `ResultCard` (extracted from `results/page.tsx` to `src/components/ResultCard.tsx`). **Zero per-category branching anywhere.**

### Category relevance — declared weights scored against the household **[Proposal — C1/D1]**

Per playbook C1/D1: each module declares relevance facts + weight; the engine scores them:

```
scoreCategoryRelevance(category, household, results) =
    category.relevance.weight × (matched relevance facts / declared facts)
  + Σ over category results: CONF_WEIGHT[confidence] × log10(1 + midpointValue)
  + 0.5 × (visible-but-unanswered deep-dive questions)
```

Declared flags+weight are the data substrate (playbook-compliant); the results term rewards confirmed value; the unanswered-question term surfaces categories where a deep dive *can change the answer*, decaying to zero as the user answers. No category names in code. Hub tabs sort by score; zero-program categories render no tab; low scorers fall into the "Other avenues" accordion — nothing is a dead end.

### Engine v2 **[Proposal — D1]** (playbook D1 signatures, mapped onto the existing engine)

Keep `engine.ts` pure and extend: `prune` (= today's still-possible filtering), `scoreCategoryRelevance` / `scoreProgramRelevance` (new, `src/lib/relevance.ts`), `checkEligibility` (= `evaluateProgram`, extended), `mergeAnswers` (= batched `setFact`), `dedupeAcrossCategories` (id-based, plus `supersedes` resolution). Honesty fixes:

- **`assetLimitDollar` becomes real** (P0, §1): `testAssets` vs the `liquidAssets` range fact; unanswered → `needsInfo` with a plain-language reason.
- **`incomeBasis:"net"` fixed via correct asymmetry** (P0, §1): gross ≤ net-limit ⇒ pass; gross > limit ⇒ *borderline* (never fail) with "counts income after deductions" reason. Fixes the live WFNJ-class bug.
- **`factRequirements: Condition[]`** and **`maxIncomeAnnualByFact`** (tiered ceilings, e.g. EITC by kid count) — targeted rule fields, not an expression language.
- **`missingFacts: FactKey[]`** on results → hub deep-links "Answer 1 more question →" to the category page holding that question (facts→questions is a data lookup). This is the connective tissue between tracks.
- **`eligibilityType` (entitlement/capped/lottery) and `dataConfidence` (verified/high/needs-review) become required `Program` fields** (camelCase TS names for the playbook's snake_case concepts; `official_source_url`/`last_verified` already exist as `sourceUrl`/`lastVerified`). Badges render on every card: entitlement "if you qualify, you get it"; capped "funding-limited — apply early"; lottery "waitlist — qualifying doesn't guarantee a spot". Lottery programs weigh 0 in the headline dollar figure. Per playbook rule: **no ACP, no federal LIHWAP** as active programs.

### Cliff simulator integration **[Proposal — G5]** (wire, don't rebuild)

Result cards for income-ruled programs near a cutoff get a real "See how a raise affects this" action → `/cliff-simulator?program=<id>` (pre-fill read via `useSearchParams`; household already comes from the shared store). Simulator core math untouched; direct nav behavior unchanged. It also reads `facts.monthlyIncome` after the store migration (small call-site update in Phase B).

### AI explainer **[Proposal — G4]** — the one server touchpoint

A stateless API route (`src/app/api/explain/route.ts`) passes ONLY the matched program record + household summary to the Anthropic API under a locked system prompt (no fact not in the record; missing field → "verify with the official source"). Nothing logged or stored; labeled "AI-generated summary — verify with the official source"; API error → static reason field. This is the only exception to "no server," and it stores nothing.

---

## (3) STATE-COVERAGE MODEL

`src/data/states/registry.ts` replaces `src/lib/states.ts` registry contents (lib keeps `getState`/`DEFAULT_STATE` re-exports; the `available` boolean dies — every state is selectable):

```ts
interface StateEntry {
  code: string; name: string;
  coverage: "deep" | "federal-plus-aggregator" | "federal-only";
  aggregatorName?: string; aggregatorUrl?: string;   // from docs/sources.md; benefits.gov fallback
  lastVerified: string;
  programs: Program[];                                // [] unless deep
}
```

- **All 50 states + DC** in the registry. NJ + CA `deep`; everyone else `federal-plus-aggregator` (or `federal-only` if no aggregator found).
- **Federal pack** `src/data/federal/programs.ts` (`us-snap`, `us-medicaid`, `us-chip`, `us-eitc`, `us-ctc`, `us-liheap`, `us-wic`, `us-lifeline`, `us-ssi`, `us-aca-subsidy`, `us-school-meals`, …) renders in **every** state. `Program.level: "federal" | "state" | "local"`.
- **Override, not duplication**: state programs may declare `supersedes: "us-snap"`; `getProgramsForState(code)` returns state pack + federal pack minus superseded ids. NJ SNAP replaces us-snap (no double-count, by construction); SSI deduped to federal-only; WIC = federal fallback + state supersessions. Cascade hints reference federal ids; the resolver follows `supersedes` to the state version. Dev-time assertions: every `supersedes` matches a federal id; no two state programs supersede the same one; `deep` requires ≥10 programs (coverage labels can't drift dishonestly — declared, not derived).
- **Honest UX**: state picker shows all 51 with a coverage badge; non-deep states get a persistent, non-dismissable card on results and category pages: *"We check the big federal programs for every state. {State} also runs its own programs we don't screen yet — {aggregatorName} is the official place to check those."* + link, plus the coverage indicator on the hub.
- **Adding a state = adding data**: new `src/data/states/XX/programs.ts` + flipping that state's existing registry line to `deep`. The registry file is data; no engine, template, or route changes. (Auto-discovery rejected: Turbopack needs statically analyzable imports.)

---

## (4) RULES-AS-DATA GUARANTEES (explicit, non-negotiable)

1. **Category deep-dive questions are data** (`requiresQuestions` in the category module); **one `FormEngine` renders all of them** — zero category-specific branching, proven by rendering Food and Tax with the same component.
2. **One `CategoryScreen` template renders all 8 category pages**; a new category = new data file + index import, never a new component or route file.
3. **A new state = a data edit** (registry line + optional programs file), never new branching code.
4. **No eligibility number, question text, or program fact lives in component code** — numbers resolve from program data through shared FPL/AMI reference data ("138% FPL", never a dollar literal in code).
5. **Category relevance is computed from declared module data scored against the household** — no hardcoded category ifs.
6. **`CategoryId` and `FactKey` are derived types** from data registries — data-driven *and* compile-checked; referencing a nonexistent category/fact is a build error.
7. **Every rendered rule is an evaluated rule**: a data field the engine ignores (today: asset limits, income basis — the §1 P0) is forbidden — either the engine reads it or the field is removed.
8. **Every question can fire**: a question renders only while some live program references its fact (rule-relevance pruning) — dead questions are structurally impossible.
9. **Every result carries `sourceUrl` + `lastVerified`** and renders a verify line; the AI never introduces facts not in the record; no ACP, no federal LIHWAP.
10. **No dead controls**: every button/link/tab performs a real action or is not rendered; decorative interactive affordances (hover-lift on non-links) are prohibited.

---

## (5) KILL LIST — every dead control, with its fix

All line refs `src/app/page.tsx` unless noted. (Playbook A2 re-audits this; this is the authoritative starting list.)

| # | Dead control | Fix | Phase |
|---|---|---|---|
| **0 — P0** | **Engine silently ignores declared rules** — `incomeBasis:"net"` treated as gross (false "unlikely" for WFNJ/TANF, SSI, CalWORKs, CAPI, County GA ×2) and `assetLimitDollar` never tested (false "likely" SSI/CAPI for asset-rich households). Full write-up in §1. | **Wire**: `testAssets` + net-basis asymmetry (gross>limit ⇒ borderline, never fail). Phase D2 owns it in sequence, but this is **P0 — fix at the earliest opportunity**; the net-basis asymmetry needs no new questions and may land as a hotfix before Phase D | **D2 / earlier** |
| 1 | Category tiles (236–251): `hover-lift` divs, no href | **Wire**: render from category registry, each a `<Link href={/intake/${id}}>` | F2 |
| 2 | "Built for real people" cards (204–224): hover-lift, dead | **Strip affordance** (informational, don't invent links) | F2/H |
| 3 | Accessibility cards (263–280): hover-lift, dead | **Strip affordance** | F2/H |
| 4 | STEPS cards (310–321): hover-lift, dead | **Strip affordance**; section CTA links `/intake` | F2/H |
| 5 | Hero mockup card (142–170): fabricated "NJ SNAP… $4,200–$9,600/yr" | **Wire**: run the real engine on a sample household (`src/data/demo-household.ts`), render top real results, label "Example — family of 3 in New Jersey" | G/H |
| 6 | Footer (341–346): zero links | **Wire**: /intake, 8 category pages (from registry), cliff simulator, `/about/data` sources page, disclaimer | F2 |
| 7 | "Now open in New Jersey" pill (104–106): contradicts states.ts | **Wire to data**: derived from registry deep states — "Deep coverage in NJ & CA — federal programs in all 50 states" | C4 |
| 8 | UseCaseSlideshow: NJ program names hardcoded | **Wire to data**: scenarios reference program *ids*, resolved via `getProgramsForState` + `supersedes` fallback | C2/F |
| 9 | `veteran` flag question (`intake/page.tsx` 24–31): unreferenced, can never render | Keep as data; rule-relevance pruning governs (revives if a VA program lands) | C/E |
| 10 | `utilityHardship` flag: unreferenced | **Delete**; replaced by `paysHomeEnergy` fact that LIHEAP actually references | E |
| 11 | `student`/`unemployed` type members: no question, no program | **Delete from registry** until a program references them (Track A's `studentStatus`/`employmentStatus` facts replace them properly) | E |
| 12 | `README.md` "one fully-built state (California)" | **Fix**: NJ+CA deep, federal everywhere | A3 |
| 13 | `docs/OpenDoor v2 — Fable 5 Build Playbook`: 0-byte file | **Fix**: copy real playbook from Downloads into `docs/` | A3 |

NavHeader state pill and "local & private" dot are informational (not button-styled) — keep. Slideshow dots are real tabs — keep.

---

## (6) FULL ORDERED BUILD SEQUENCE (mapped to playbook phases)

Each phase leaves the app shippable; schemas land before consumers.

| Playbook phase | Work | Key files |
|---|---|---|
| **A (now)** | A1: this blueprint → approved → saved as `docs/upgrade_plan.md`. A2: interaction audit (kill list above is the seed). A3: CLAUDE.md v2 rules section; README fix; copy playbook into docs/ | `docs/upgrade_plan.md`, `CLAUDE.md`, `README.md` |
| **B — routing & state skeleton** | Household v2 facts model + versioned localStorage migration; store API → `setFact` (update intake + cliff-sim call sites); `/intake/[category]` route + placeholder pages (`generateStaticParams`, await params, `not-found.tsx`); wire nav/CTAs + nav category links | `src/lib/household-store.tsx`, `src/lib/types.ts`, `src/data/facts.ts`, `src/app/intake/[category]/` |
| **C — data layer** | Category modules ×8 (+ derived `CategoryId`, lucide icons — add `lucide-react`); question schema + `FormEngine` (proven on Food & Tax); 51-state coverage registry + aggregators; federal pack + `supersedes` composition (`getProgramsForState`); program library expansion from sources.md (`eligibilityType`, `dataConfidence`, `level` required); coverage UX (badges, aggregator card, honest pill); real program count | `src/data/categories/`, `src/data/questions/`, `src/data/federal/programs.ts`, `src/data/states/registry.ts`, `src/lib/programs.ts`, `src/components/FormEngine.tsx` |
| **D — engine v2** | FPL/AMI reference data; D1 signatures (`prune`, `scoreCategoryRelevance/ProgramRelevance`, `checkEligibility`, `mergeAnswers`, `dedupeAcrossCategories`); **P0 honesty fixes** (assets, net-basis asymmetry — pull forward if possible), `factRequirements`, tiered ceilings, `missingFacts`, lottery-discounted totals; **unit tests** (entitlement/capped/lottery, deep-form-gated program, aggregator-state household, dedupe, merge) | `src/lib/engine.ts`, `src/lib/relevance.ts`, `src/lib/fpl.ts` (+AMI), `src/lib/__tests__/` |
| **E — quick intake v2** | Rebuild `/intake` on FormEngine with the 10 questions from §2 (data file, not JSX); keep meter/sidebar; E3 motion polish (reduced-motion safe) | `src/data/questions/core.ts`, `src/app/intake/page.tsx` |
| **F — category pages** | `CategoryScreen` template (intro + deep form + category results); extract `ResultCard`; wire hub tabs + landing tiles + footer (kill-list #1–#4, #6); deepen per-category content from sources.md (F3 list: Food/Health/Tax/Energy/Cash/Education/Housing/Phone — Section 8 honest-lottery, Lifeline not ACP) | `src/components/CategoryScreen.tsx`, `src/components/ResultCard.tsx`, `src/app/intake/[category]/page.tsx` |
| **G — results hub** | Relevance-ranked tabs + mainstream cards + "Other avenues" accordion; `missingFacts` deep links; eligibilityType/dataConfidence badges; G3 polish; G4 AI explainer (stateless API route, locked prompt, static-reason fallback); **G5 cliff-simulator wire-up** (pre-fill params via `useSearchParams`, core math untouched, direct-nav behavior unchanged; kill-list #5 live hero example) | `src/app/results/page.tsx`, `src/app/api/explain/route.ts`, `src/app/cliff-simulator/page.tsx` |
| **H — aesthetics & motion** | Token-driven visual system: wordmark/logo SVG + category icons on new `/style` page; imagery system; motion tokens (durations/easings in `globals.css` `@theme`), reduced-motion strategy; hover-lift only on real links (kill-list #2–#4 affordance strip) | `src/app/style/page.tsx`, `src/app/globals.css`, `src/components/` |
| **I — quality & submission** | WCAG 2.1 AA pass; dead-control sweep (re-run A2 audit — zero tolerance); responsive + Lighthouse pass; deploy hygiene (metadata, OG, favicon from wordmark); pre-submission review + 3-persona demo script | all pages |

**Sequencing rationale:** B's facts model must precede C's question data (questions target facts); C's schemas precede D's engine fields; D precedes E/F (forms need the engine to prune); F precedes the hub tabs going live in G; H/I are polish over a functionally complete app. The §5 row-0 P0 may be hotfixed ahead of its owning phase.

## Verification

- **Per phase**: `npm run build` (Turbopack) + engine unit tests (Phase D adds the suite; a test runner — vitest — gets added then).
- **P0 acceptance**: a household whose gross straddles/exceeds a net-basis limit gets `borderline`, never `fail`, with the "after deductions" reason; an asset question answered above `assetLimitDollar` fails SSI/CAPI with a resource reason; unanswered → `needsInfo`.
- **End-to-end after G**: quick intake as an NJ family of 3 → hub shows ranked tabs → food deep dive adds answers → results improve everywhere → cliff simulator pre-filled from a SNAP card; repeat as a TX household → federal results + TX aggregator card + honest coverage badge; direct `/cliff-simulator` nav unchanged.
- **Kill-list acceptance**: click every rendered interactive element; each navigates or writes state — verified in the Phase I sweep against the A2 audit table.
