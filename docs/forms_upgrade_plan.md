# OpenDoor — Coverage-Driven Form System (forms_upgrade_plan.md)

> **Supersedes:** the question-design and routing sections of `docs/upgrade_plan.md` (§2 "Two-track target architecture" question/Track-A/Track-B material). The state-coverage model, rules-as-data guarantees, kill list, and P0 engine findings in `upgrade_plan.md` remain in force. Where the two documents disagree on forms or routes, **this document wins.**

**Approved routing decision:** deep-dive scopes live at **`/intake/[scope]`** — matching the repo's real routes (`/intake`, `/results`, `/cliff-simulator`). `scope` covers **both** categories (`food`, `health`, `housing`, `tax`, `energy`, `cash`, `education`, `phone-internet`) **and** personas (`seniors`, `families`, `veterans`, `students`, `immigrants`), all rendered by the same form generator. No `/screen` route exists anywhere.

## Context

**Target codebase is `origin/main`** (11 commits ahead of the local checkout at the time of writing — `git pull` before building; fast-forward, only untracked docs locally). Partner's shipped work this design builds on:

- `src/data/questions.ts` — questions-as-data catalog (`FlagQuestion`, `INCOME_BUCKETS`, `ASSET_BUCKETS`), adaptive savings step
- `src/data/populations.ts` — the 5 persona modules (trigger flags, spotlight programs, `/for/[id]` landing copy)
- `src/components/intake/IntakeWizard.tsx` — dynamic step assembly; population triggers surfaced in intake
- `src/lib/engine.ts` — `testAssets` implemented (asset half of the P0 fixed); raised income limits (`raisedIncomeLimitFlags`); size-table ceilings
- Route groups: `(marketing)` → `/`, `/about`, `/how-it-works`, `/for/[population]`; `(screener)` → `/intake`, `/results`, `/cliff-simulator`
- `src/data/states/index.ts` registry; refreshed NJ/CA packs

**Still-live P0 (from upgrade_plan.md §1):** `rules.incomeBasis` is never read by the engine — 3 NJ + 4 CA net-basis programs (WFNJ, CalWORKs, SSI, GA×2, CAPI) hard-fail households on *gross* income when only *net* is over the limit. Net ≤ gross always ⇒ gross-over-limit must be **borderline, never fail**. This fix is a prerequisite for the coverage guarantee (check 2 catches it).

> **Approved scope decision:** the net/gross fix is **folded into F-2** — ~10–15 lines inside `testIncome` (`src/lib/engine.ts`) only: when `incomeBasis === "net"` and gross exceeds the limit, return `borderline` with a "this program counts income after deductions" reason instead of `fail`. No new questions, no data changes, no UI changes, no separate prompt.

**Principle:** forms are *derived from* the program catalog, never the other way around. Every question exists because a program in `docs/sources.md` needs its answer; every program is reachable because some form asks its questions. `sources.md` → coverage matrix → question catalogs → generated forms.

---

## (1) Coverage matrix — every program in docs/sources.md

Fact names are the answer vocabulary; **bold** = new fact not collected today. `(zip)` = locator needing only location.

### §2 Food

| Program | Type | Facts required to match | Facts that refine |
|---|---|---|---|
| SNAP | 🟢 | state, size, incomeBand | **currentBenefits** (BBCE), **elderlyOrDisabledInHousehold** (asset/deduction rules), **shelterCostBand** (net-income deduction → refines borderline), **studentExemption** (college students 18–49 need work-20h/EFC-0/kids exemption) |
| WIC | 🟢 | pregnantOrChildUnder5, incomeBand (185% FPL) | **currentBenefits** — SNAP/Medicaid/TANF = adjunctive auto-income-eligibility; open regardless of immigration status |
| NSLP / School Breakfast | 🟢 | schoolAgeChild, incomeBand (130/185% FPL) | **currentBenefits** (SNAP/TANF = categorical eligibility) |
| CEP | 🟢 | schoolAgeChild, **zip** (school-level) | rendered as an info nuance on school-meal results, not a separate match |
| TEFAP / food banks | 🟡 | **zip** (locator + state income rule) | none — low-barrier by design |
| Feeding America locator | (zip) | **zip** | — |

### §3 Housing

| Program | Type | Facts required | Facts that refine |
|---|---|---|---|
| Section 8 / HCV | 🔴 | **zip→county** (PHA + AMI lookup), incomeBand vs **50% county AMI**, size | housingTenure=rent, **behindOnRent** / **atRiskHomelessness** (PHA preferences), veteran (some PHA preferences). Honest lottery framing mandatory |
| Public housing (via PHA directory) | 🔴 | same as HCV | — |
| HUD AMI limits | data | **zip→county**, size, incomeBand | powers 30/50/80% AMI banding for everything above |
| Emergency Rental Assistance (NLIHC tracker) | 🟡 | **zip→county**, housingTenure=rent, **behindOnRent** | incomeBand vs local AMI cap |
| State property-tax relief (Senior Freeze NJ / PTP CA — in packs) | 🟢 | housingTenure=**own**, age65Plus (or disabled), incomeBand | — |

### §4 Utilities & Internet

| Program | Type | Facts required | Refine |
|---|---|---|---|
| LIHEAP (+ NJ USF in pack) | 🟡 | state, size, incomeBand, **paysHomeEnergy** | utilityHardship (crisis-component priority) |
| Lifeline (+ CA LifeLine) | 🟢 | incomeBand (135% FPL) **or currentBenefits** (SNAP/Medicaid/SSI/FPHA/Veterans Pension = categorical) | — |

### §5 Healthcare — all six pathways

| Program | Type | Facts required | Refine |
|---|---|---|---|
| Medicaid — expansion adult | 🟢 | state (expansion status = state data), incomeBand ≤138% FPL | **currentCoverage** |
| Medicaid — pregnancy pathway | 🟢 | pregnantOrChildUnder5 (pregnant), incomeBand (raised limit — engine's `raisedIncomeLimitFlags` already supports this) | immigration: emergency/prenatal coverage varies — add-only note |
| Medicaid — aged/blind/disabled pathway | 🟢 | disabled or age65Plus, incomeBand, assetsBand | **chronicCondition** → medically-needy/spend-down pointer (needs-review confidence) |
| CHIP | 🟢 | kids in household, incomeBand (above-Medicaid band) | — |
| ACA Marketplace subsidy | 🟢 | incomeBand 100–400% FPL, **currentCoverage**=none/marketplace | filesTaxes (credits reconcile on a return) |
| Medicare Savings Programs + Extra Help* | 🟢 | **medicareEnrolled**, incomeBand, assetsBand | age65Plus or disabled (the Medicare routes) |

\* From the playbook F3 health list; `docs/sources.md` needs two rows added (ssa.gov Extra Help + medicare.gov MSP) — a prerequisite data edit, flagged in Files below.

### §6 Cash & Disability · §6b Veterans · §6c Disaster · §6d Small Business

| Program | Type | Facts required | Refine |
|---|---|---|---|
| TANF (WFNJ/CalWORKs in packs) | 🟡 | kids/pregnant, incomeBand (**net → P0 fix required**), size | employmentStatus (work requirements — informational) |
| SSI | 🟢 | age65Plus or disabled, incomeBand, assetsBand | hasEarnedIncome (different disregards) |
| SSDI | 🟢 | disabled, **workHistory** ("worked ~5 of the last 10 years paying Social Security taxes") | no income/asset test — the key SSI/SSDI differentiator |
| VA benefits hub / VA Pension | 🟢 | veteran, **servedActiveDuty**; pension adds age65Plus-or-disabled + incomeBand | **dischargeStatus** (other-than-dishonorable; optional) |
| VA Disability Compensation | 🟢 | veteran, **serviceConnectedCondition** | confidence capped at "possible" (rating is VA-determined) |
| GI Bill | 🟢 | veteran (or dependent), **serviceLength** band | student |
| VA Home Loans | 🟢 | veteran, **planningToBuy** / housingTenure | — |
| FEMA IA / DisasterAssistance.gov | 🟡 | **disasterAffected** (federally declared, in area) + zip | asked only in a disaster-context banner, not a standing question |
| SBA programs | 🟡 | employmentStatus=selfEmployed | pointer-only card |

### §7 Tax Credits

| Program | Type | Facts required | Refine |
|---|---|---|---|
| EITC (+ NJEITC/CalEITC in packs) | 🟢 | hasEarnedIncome, filesTaxes, **kidsUnder17Count** (tiered ceilings), **filingStatus** | **investmentIncomeOverCap** (~$11k), SSN requirement (sensitive, add-only note) |
| CTC | 🟢 | kidsUnder17Count ≥1, hasEarnedIncome, filesTaxes | filingStatus (phase-out) |
| VITA/TCE locator, GetCTC | (zip) | **zip**; surfaced automatically under any tax result | — |

### §8 Education · §8b Jobs

| Program | Type | Facts required | Refine |
|---|---|---|---|
| FAFSA / Pell | 🟢 | student (or **planningCollege**), **studentLevel** (HS senior/college/adult) | **fafsaDependency** signals (age band, married, veteran — veteran = independent, a real unlock), citizenship/eligible-non-citizen (sensitive, add-only) |
| CareerOneStop scholarships / BigFuture | 🟡 | student/planningCollege, **studentLevel** | zip/state (state grants + the state-deadline source) |
| State FAFSA deadlines | data | state | deadline note on education results |
| CareerOneStop training / American Job Centers | 🟢/(zip) | employmentStatus=unemployed, **zip** | — |

### Everything else in sources.md

- **§1 finders** (benefits.gov, USA.gov, findhelp.org, 211.org) → the "beyond our data" card per state/ZIP (per upgrade_plan.md's coverage model). Code for America = precedent citation only.
- **Excluded as active programs:** ACP (dead June 2024, per sources.md ⚠️) and federal LIHWAP (playbook ground rule 7).
- **§1b / §9** (Data.gov, Census, College Scorecard, HUD IL, FPL, Open Referral) = engine data sources, not user-facing matches.
- **§8 private scholarship engines** (Fastweb etc.) = optional links with the privacy caveat sources.md itself specifies.

---

## (2) The upgraded general intake (~10 screens)

Order = information gain. Each sets exact facts:

| # | Screen | Fact(s) set |
|---|---|---|
| 1 | State | `state` |
| 2 | ZIP — "so we can find local help; skip if you'd rather not" | `zip` → derived `county` |
| 3 | Household size | `householdSize` |
| 4 | Composition chips (multi-select: pregnant / child under 5 / child 5–17 / none) | `pregnantOrChildUnder5`, `schoolAgeChild` |
| 5 | Kid count (only if #4 selected kids) | `kidsUnder17Count` |
| 6 | Income band (existing `INCOME_BUCKETS`) | `monthlyIncomeMin/Max` |
| 7 | Money-from multi-select (job or self-employment / benefits / retirement / none) | `hasEarnedIncome`, seeds `currentBenefits` |
| 8 | Work status (working / self-employed / unemployed & looking / retired / can't work right now) | `employmentStatus` (replaces the bare `unemployed` flag) |
| 9 | Home (own / rent / other — staying with family, shelter) | `housingTenure` |
| 10 | Taxes ("Did you file — or will you file — a federal tax return?") | `filesTaxes` |
| +A | Savings band — **adaptive** (partner's existing mechanic: only when an asset-tested program is alive) | `liquidAssetsMin/Max` |
| +B | Optional self-ID screen (§4 below): 65+, disability, veteran, student, immigrant | flags; all skippable |

Covers the required additions: detailed income (6+7+8), property/home ownership (9), unemployment (8), household composition (3+4+5), tax filing (10).

---

## (3) Per-category deep forms — union of category program requirements minus the general intake

One generated `DeepForm` component; per-scope question files are data. Each form pre-fills from the household and shows **only unanswered** questions:

- **Food (~7):** current benefits received (SNAP/Medicaid/TANF/SSI/WIC — powers WIC adjunctive + NSLP categorical + Lifeline later), elderly-or-disabled in household, monthly shelter+utility cost band (SNAP deductions — honestly refines borderline), college-student SNAP exemption trio (works 20h/wk, has kids, EFC-0 — only if `student`), ZIP if skipped (food-bank locator).
- **Health (~8):** current coverage (none/employer/Medicaid/Medicare/marketplace), Medicare enrollment, pregnancy (if unanswered), disability (if unanswered), chronic condition (optional → medically-needy pointer), kids needing coverage (CHIP), immigration status (optional, add-only: emergency Medicaid/prenatal), assets band (MSP/Extra Help). Reaches all six §5 pathways.
- **Housing (~8):** ZIP/county (**required here** — it drives everything), tenure (pre-filled), rent band, behind on rent, at risk of homelessness, already on a waitlist, 65+/disabled (pre-filled). **Outputs are local and real:** the household's actual PHA(s) from the HUD directory (NJ's 21 + CA's 58 counties as data files first), county AMI banding ("under 50% AMI — the priority band at most PHAs"), county ERA programs from the NLIHC tracker, state property-tax relief. Lottery honesty on every voucher result. Other states: PHA-directory + 211/findhelp ZIP links — data-driven pointers, labeled as such.
- **Tax (~6):** filing status (single/joint/HoH), kid count (pre-filled), earned income (pre-filled), investment income over the cap, SSN/ITIN (optional, add-only), ZIP → VITA locator card always shown.
- **Energy (~4):** pays home energy bills, behind on bills (existing `utilityHardship`), heat included in rent, ZIP (state/utility pointer).
- **Cash (~5):** disability (pre-filled), work history yes/no (the SSI-vs-SSDI split), assets (pre-filled), kids (pre-filled), TANF time-limit info note.
- **Education (~7):** student level, enrolled vs planning, FAFSA-dependency signals (age band / married / veteran — pre-filled where known), citizenship status (optional, add-only), state-deadline note, ZIP → training/AJC if unemployed.
- **Phone & internet (~3):** qualifying benefit received (pre-filled from Food's `currentBenefits`), income (pre-filled). Honest short form — the data doesn't support 10 and we don't pad.

**Persona deep forms (5)** — same mechanism, persona-scoped question files:
- **Seniors:** Medicare, prescription costs (PAAD), own-home tax relief, assets (SSI/MSP).
- **Families:** composition depth, WIC adjunctive, CHIP.
- **Veterans:** served active duty, discharge band, service-connected condition, service length, buying a home — unlocks the whole §6b VA suite.
- **Students:** education union + the SNAP student-exemption trio.
- **Immigrants:** status band (optional, never required); surfaces the open-regardless set: WIC, school meals, food banks, emergency Medicaid, CAPI (CA).

---

## (4) Optional / sensitive questions

**Included** (each gates ≥1 sources.md program): disability, pregnancy, veteran status + service details, immigration/citizenship status, age 65+.
**Excluded: gender and religion — zero programs in sources.md depend on either, so we never ask.** (Strongest privacy answer; WIC eligibility is pregnancy/child-based, not gender-based.)

Design contract, enforced by schema + engine:
- Rendered in one clearly marked block: **"Optional — answering can only unlock more programs,"** with a one-line "why we ask" per question (the `help` field already on the partner's `FlagQuestion` type).
- Skippable individually and as a block; never required to proceed; skip ≠ no.
- **Add-only semantics:** sensitive facts may appear in rules only as unlock keys (any-of `categoricalRequirements`, or `raisedIncomeLimitFlags`). A build-time assertion rejects any rule where a sensitive fact could *shrink* a household's match set. Declining leaves gated programs at "answer 1 optional question to check" — never `unlikely`.

---

## (5) Routing model — `/intake/[scope]`

```
/                      persona cards (PopulationGrid) ──────► /intake/[scope]   (scope = persona id)
/results               category tabs (relevance-ordered) ───► /intake/[scope]   (scope = category id)
                       PopulationSpotlight "Go deeper" ─────► /intake/[persona]
/for/[population]      keeps marketing copy; CTA now ───────► /intake/[persona]  (not bare /intake)
/intake                unchanged: the Track-A general intake (static route wins over the dynamic segment)
/intake/[scope]        ONE dynamic route in (screener):
                         (a) intro from scope data
                         (b) generated DeepForm — pre-filled, only unanswered questions
                         (c) scope-filtered results
                       generateStaticParams from categories ∪ personas; dynamicParams=false;
                       unknown scope → notFound(). (Next 16: await params in the server
                       component; PageProps<'/intake/[scope]'>.)
```

- Every deep form reads/writes the **same household store** — pre-fill is automatic; hub → scope → hub loses nothing.
- **No scope ever routes back to `/intake`:** if core facts are missing, the deep form prepends the 2–3 missing general questions inline ("two quick basics first").
- Categories and personas are values of the same `scope` param rendered by the same generator — one template, thirteen scopes, zero per-scope components.

---

## (6) The coverage guarantee

Three checks, run in `npm test` + CI, reading the same data the app reads:

1. **Question coverage (static):** for every program, every fact referenced by its rules ∈ general-intake facts ∪ its category form's facts ∪ any persona form listing the program. Build fails naming the orphaned fact.
2. **Reachability (constructive):** for every program, auto-construct the satisfying household *from its own rules* (income mid-band under the limit, required flags true, assets under limit, county satisfied), run `evaluateAll`, assert confidence = `likely` (🟢) or ≥ `possible` (🟡/🔴). This *proves* every program is reachable by some answer combination — and it catches the net-basis P0 today (WFNJ's constructed household currently fails it).
3. **Catalog reconciliation:** `src/data/coverage.ts` maps every sources.md row → `implemented` | `locator` | `pointer` | `excluded` (with reason: ACP, LIHWAP). Check fails on unmapped rows; the About page's program count derives from this registry.

---

## Files to create/edit (targeting origin/main — `git pull` first)

| Action | Path |
|---|---|
| extend | `src/lib/types.ts` — Household gains `zip`/`county`, `kidsUnder17Count`, `employmentStatus`, `housingTenure`, `filesTaxes`, `currentBenefits`, etc.; `Question` generalizes `FlagQuestion` (kinds: boolean/select/multi/count/zip/bucket; `scope`; `sensitive`; `help`) |
| split | `src/data/questions.ts` → `src/data/questions/{general,food,health,housing,tax,energy,cash,education,phone-internet}.ts` + `personas/{seniors,families,veterans,students,immigrants}.ts` |
| extend | `src/data/populations.ts` — personas gain `formQuestions` + `programIds` for scope filtering |
| new | `src/data/federal/programs.ts` — SSDI, VA suite, FAFSA/Pell, federal EITC/CTC, Medicare MSP/Extra Help, FEMA (state packs supersede where they exist) |
| new | `src/data/local/{nj,ca}/pha.ts`, `.../ami.ts`, `.../era.ts` — county-level housing data (HUD PHA directory, HUD IL, NLIHC) |
| new | `src/data/coverage.ts` — sources.md reconciliation registry |
| extend | `src/lib/engine.ts` — fact-based conditions, add-only sensitive semantics, **net-basis P0 fix (in F-2, per approved scope decision above)**, county-AMI test |
| new | `src/lib/coverage-check.ts` + `src/lib/__tests__/coverage.test.ts` — guarantee checks 1–3 (vitest; test runner added here) |
| new | `src/app/(screener)/intake/[scope]/page.tsx` + `not-found.tsx` |
| new | `src/components/intake/DeepForm.tsx`, `src/components/intake/ScopeResults.tsx` |
| edit | `src/components/results/ResultsView.tsx` (category tabs + spotlight links → `/intake/[scope]`), `src/components/marketing/PopulationGrid.tsx` + `src/app/(marketing)/for/[population]/page.tsx` CTAs → `/intake/[persona]`, `src/components/intake/IntakeWizard.tsx` (new general screens) |
| edit | `docs/sources.md` — add MSP + Extra Help rows (prerequisite for the health pathways) |

## Verification

- Coverage checks 1–3 green in CI; check 2 doubles as the engine's eligibility regression suite.
- End-to-end: general intake as an NJ renter family → `/results` shows ranked category tabs → `/intake/housing` asks ZIP → real county PHA + AMI band + ERA results; `/intake/veterans` unlocks the VA suite from one optional block; skipping every sensitive question still yields the full non-gated result set (add-only proof).
- Direct-nav `/intake`, `/results`, `/cliff-simulator` behavior unchanged.
