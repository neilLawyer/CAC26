# OpenDoor v3 — Build Report

Six workstreams, planned → built → committed in sequence (`docs/v3_plan.md` is the living
plan; this is the account of what actually happened). Every claim below was verified by
executing the thing — clicks in a real browser, live API calls — not by reading code.

## What was built

**W1 — Correctness gate** (`ed591a3`). The reported "clicking Health does nothing" bug was
the home page's category grid: hover-lift Cards with no Link (v2 wired the /results tabs
and persona cards but missed the home tiles). All 8 tiles now route to their room. Also
landed: the long-approved net/gross engine fix (net-basis programs return *borderline*,
never *fail*, on gross-over-limit — WFNJ/SSI/CAPI/GA households are no longer wrongly
turned away) and an a11y fix (home Footer was inside `<main>`, losing its landmark role).
Proof: a permanent Playwright suite clicks EVERY control against the production build —
29/29 at commit time — in both reduced-motion and animation-enabled modes.

**W2 — Address-based local results** (`ddef56c`, the flagship). Server-side pipeline:
address → Census geocoder (county FIPS + tract) → HUD FMR + income limits (Bearer
`HUD_TOKEN`) → HUD LIHTC affordable properties (mapped ONLY at HUD's own 'R'/'4' address
accuracy) → HRSA health centers by distance. Reusable map+list module (Leaflet,
scope-tinted CircleMarkers), used by Housing and Health; Food deliberately keeps its
honest Feeding America pointer because no food-bank API exists. Every endpoint was
verified live BEFORE code was written against it; the finished route was live-tested
(Newark → Essex County → 40 real LIHTC properties, 25 real health centers with phone
numbers). Found a real data quirk: `CNTY2KX` stores county codes unpadded — handled both.

**W3 — Adaptive branching** (`c9db66b`). 14 offer rules as data; ranking = rule weight +
2×open results + unanswered questions in the destination; one offer per destination; doors
with nothing behind them are skipped. Offers render as cards wearing the destination
room's color + sigil on /results; every scope page ends in a "Keep going" cross-offer.

**W4 — Advisory + all-50 tiers + program expansion** (`b999780`). Every result card gains
a next-step line (agency, official application, typical time-to-benefit) and a worth line
(the record's verified range; for kid-gated credits, kid-count × the record's own
per-child figure — deterministic arithmetic, never AI). Opt-in AI explainer: locked
prompt, record looked up server-side, no key → the affordance disappears (live-tested).
All 51 jurisdictions selectable with honest tiers; 7 federal baselines (statutory %-FPL
only) + `supersedes` composition so NJ/CA never double-show; the hero pill now derives
from the registry: **51 programs · every state · full coverage in CA & NJ**.

**W5 — Visual pass** (`8d46617`). The room system reaches the new surfaces: token-dressed
map popups, pointer-responsive markers, staged near-you reveals, "Locating…" pulse,
offer-card arrows, advisory rise-ins. Deliberate restraint: no stock imagery — texture +
watermark + key color is the identity, and a map of real places is the strongest image.

**W6 — This verification.**

## Persona walkthroughs (real browser, every click asserted on its landed URL)

1. **Low-income high-schooler** — intake (NJ → household of 2 → under $1k/mo → student:
   yes) → /results → the *student* offer card → /intake/education → **Pell Grant renders
   as "Possibly eligible"** (capped honestly — the FAFSA formula decides, so we never say
   "likely") with source + verify links; forward actions confirmed. PASS.
2. **Working parent** — intake (NJ → 4 → $2–2.5k/mo → pregnant/under-5 + school-age) →
   /results → food room → **WIC's adjunctive rule fires live** (answering "already on
   Medicaid" flips the income test to "automatically met" in the reason trace) → health
   room → **LIVE address lookup**: "920 Broad St, Newark, NJ" → real geocode → real HRSA
   health centers within ~5 miles, on the map with phone numbers. PASS.
3. **Middle-class homeowner** — intake (NJ → 4 → $5–7k/mo → school-age + files taxes) →
   tax room → kid count 2 + working → **CTC "Around $4,400/year for your 2 children"** —
   the record's own $2,200 per-child figure × 2, computed in code; **EITC correctly lands
   in "Not likely"** at that income (honesty cuts both ways). PASS.

Final suite: **34/34** (31 control-gate tests + 3 personas), production build.

## Delegation ledger

| Work | Who |
|---|---|
| Architecture, pipeline design, API verification, UX, ranking design, visual system, all verification | Fable (me) |
| near-you server clients + route + env/README docs | Sonnet (from my verified-shape spec) — landed complete |
| 14 offer rules data | Sonnet — landed complete |
| /api/explain route | Sonnet — landed complete; its companion ExplainButton was cut off by a session limit, finished by me |
| 7 federal baseline programs + supersedes annotations | Attempted Sonnet; agent killed by session limit after only a header comment — done by me |
| 51-state registry data | Me directly (pure enumeration; delegating cost more than typing it) |

## Honesty inventory (zero fabricated numbers or locations)

- Every dollar figure on a map/panel comes from a live federal API response at request
  time; every mapped point passed HUD's own address-accuracy filter; properties below that
  accuracy are LISTED, never pinned.
- Every failure mode says what happened: bad address, HUD outage, missing token — no
  blanks, no substitutes.
- "Rent-stabilized" is explicitly declared out of federal data with a pointer to the local
  housing authority. Food has no fake pipeline. CHIP has no fake income ceiling. Medicaid's
  non-expansion caveat is in the summary. Statutory %-FPL figures only, everywhere.
- The AI layer can only rephrase a record it's handed server-side; without a key it
  vanishes; its output is always labeled and the static advisory is the floor.
- Privacy: address and AI use are opt-in per use with the disclosure BEFORE anything is
  sent; the address is never stored or logged (the route never logs request contents).

## Needs your judgment

1. **HUD_TOKEN** — I cannot register for the free token (requires an account). The FMR/
   income-limits leg is structurally complete and its no-token honesty path is live-tested,
   but the happy path has NOT been exercised with real HUD data. Register at
   huduser.gov (see README), drop the token in `.env.local`, and the two housing cards go
   live. Until then they honestly say "needs a free HUD API token."
2. **ANTHROPIC_API_KEY** — same shape: the disabled path is live-tested; the AI summary
   happy path needs a key in `.env.local` to exercise.
3. **Net-basis "possible" breadth** — per the approved F-2 design, gross-over-net-limit is
   now *borderline, never fail*. Side effect: a high-income household sees net-basis
   programs (WFNJ, SSI) as "possible." Over-inclusion was the approved trade against
   wrongly excluding people; if it reads as clutter, the fix is a data-level cap
   discussion, not a code tweak I'd make unilaterally.
4. **VA burial benefits** remain unmodeled (listed inside sources.md's VA hub row); VA
   healthcare IS now modeled. Adding burial is a two-minute data edit if you want it.
5. **Session-limit resilience** — two sub-agents died mid-flight to a plan limit. Nothing
   was lost (work resumed by me), but for future long runs, batching delegations earlier
   in the session would reduce that exposure.

## Numbers

- Program library: **51 distinct programs** (from ~31), all sourced from docs/sources.md
  with `sourceUrl` + `lastVerified`; site copy derives the count from the registry.
- Coverage: **51 jurisdictions** — 2 deep (NJ, CA), 49 federal-tier with real aggregator
  pointers; the address/income-limit features are national and work in every state.
- Test suite: **34 passing** browser tests (permanent, `npm run test:e2e`).
- v3 commits: `ed591a3`, `ddef56c`, `c9db66b`, `b999780`, `8d46617`, + this report.
