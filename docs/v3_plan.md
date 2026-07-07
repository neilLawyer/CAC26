# OpenDoor v3 — "Above and Beyond" Plan (living document)

Lead architect + builder: Fable 5, with mechanical work delegated to Sonnet sub-agents.
Rhythm: plan → build → commit, per workstream. This file is updated as each lands.

## Ground rules (never bend)
- Rules-as-data: new program/state = data edit, not code.
- Never fabricate a number, program, or location. API failure → honest fallback, never blank or invented.
- Sensitive questions stay optional/additive-only (enforced by `assertAddOnlyInvariant`).
- `prefers-reduced-motion` respected by every animation.
- Every result keeps `sourceUrl` + `lastVerified` + the verify line.
- **New for v3 (privacy)**: the app's promise is "answers never leave your browser." The address
  feature and the AI explainer are the two deliberate exceptions — both are opt-in per use, with
  inline disclosure at the point of entry, nothing persisted server-side.

## W1 — Correctness gate ✦ no delegation for verification
**Diagnosis (already confirmed by reading, to be proven by clicking):** the home page's
"One engine, every kind of help" grid (`src/components/marketing/CategoryGrid.tsx`) renders
`Card` divs with `hover-lift` and **no `Link`** — that is the reported "clicking Health does
nothing" bug. The /results tabs and persona cards were wired in v2; the home grid tiles were
missed (kill-list #1, assigned to F2, only half-landed).
**Build:** wire CategoryGrid tiles → `/intake/[id]`; land the previously-approved net/gross
`testIncome` fix (approved for "F-2", never implemented — flagged in forms_upgrade_report.md).
**Prove:** install Playwright (chromium), run against a production build, click EVERY control
(home nav/CTAs/tiles/persona cards/footer, /results tabs + spotlight + links with seeded
localStorage household, /for CTAs, scope-page links, cliff-simulator links), capture landed
URL per click, emit a pass/fail table. The e2e suite stays in the repo as the permanent gate.

## W2 — Address-based local results (flagship)
**Pipeline (all server-side; Census geocoder has no CORS):**
1. `POST /api/near-you {address}` → Census Geocoder
   `geocoding.geo.census.gov/geocoder/geographies/onelineaddress?benchmark=Public_AR_Current&vintage=Current_Current&format=json`
   → matched address, lat/lon, county FIPS (state+county), tract GEOID.
2. County FIPS → HUD PD&R (`huduser.gov/hudapi/public`, `Authorization: Bearer ${HUD_TOKEN}`):
   `/fmr/data/{fips}99999` (Fair Market Rents) + `/il/data/{fips}99999` (income limits).
   Token absent/invalid → that section returns an honest "not configured / unavailable" state,
   the rest of the pipeline still works.
3. Lat/lon → HUD LIHTC FeatureServer (public ArcGIS, no token; exact service URL verified live
   during build, never guessed) → nearby affordable-housing properties, **only** rows whose
   `LVL2KX` geocode-accuracy is `R` or `4` are mapped. County-level rows are listed, not mapped.
**Module:** `NearYouPanel` (address input + consent copy + results) with `LocalMap`
(Leaflet + OSM tiles, client-only dynamic import, `CircleMarker`s → no icon-asset bundling and
scope-tintable) + `LocalList`. Config is data (`src/data/near-you.ts`): housing = full pipeline;
health = HRSA health-center locator (API verified live at build, else honest pointer);
food = honest pointer (no API exists). **Rent-stabilized honesty:** municipal data, not federal —
we say so explicitly and point to the local housing authority; never a fabricated label.
**Env:** `.env.local` (gitignored — `.env*` already covered) holds `HUD_TOKEN`; `.env.example`
committed; README documents the free huduser.gov registration. I cannot register for a token
myself — the no-token degradation path is part of the design, and the report will say which
legs were live-tested (geocoder + LIHTC) vs. structurally tested (FMR/IL).
**Delegation:** Sonnet writes the three server clients + route handler from my spec; I design
the pipeline, the UX, and wire the module.

## W3 — Adaptive branching
`src/data/offers.ts`: `OfferRule[] = {id, scopeId, reason (user-facing copy), when:
QuestionCondition[], weight}` — reusing the existing `QuestionCondition` type (extended with a
`{field, equals}` variant, which `showIf` gains for free). Offers computed after intake:
rules whose conditions hold, ranked by `weight + open-results-in-scope + unanswered-questions-
in-scope` (the last term = "this form can still change your answer"). Rendered as `NextSteps`
cards on /results (top 3, persona/category-tinted, each → `/intake/[scope]` pre-filled by the
shared store — pre-fill is free, it's the same household). Scope pages get a "keep going"
cross-offer at the bottom so no results surface dead-ends. Rules for: disabled→health,
senior→seniors, renter+cost-signals→housing, kids→families, student→education,
unemployed→cash. **Delegation:** Sonnet enters the offer rules from my schema + two examples.

## W4 — Advisory results + all-50 tiers + program expansion
**Advisory (static-first):** `Advisory` block on each ResultCard rendered ONLY from record
fields: why-matched (existing reason trace), what-to-do-next (applyUrl + agency + time-to-
benefit), worth (record value range; tax credits: deterministic arithmetic from record fields ×
household kid count — computed in code, never by AI). **AI layer:** `/api/explain` (opt-in
button, inline privacy disclosure), locked system prompt: only the record JSON + household
summary, no new numbers/programs/claims, missing field → "verify with the official source";
graceful static fallback; labeled "AI summary — verify with the official source".
`ANTHROPIC_API_KEY` in `.env.local`; absent → button hidden, static advisory stands alone.
**All-50 tiers:** registry becomes 51 entries: `tier: "deep" (NJ/CA) | "federal"` — every state
gets the federal pack; non-deep states show a visible coverage indicator + honest aggregator
pointer (Benefits.gov + 211.org, both from sources.md §1). The HUD FMR/IL + geocoder + LIHTC
pipeline is NATIONAL — the address feature works in all 50 states on day one, and the coverage
copy says so ("local rent benchmarks and affordable-housing locations work everywhere").
**Programs:** federal baselines so the other 48 states aren't empty: us-snap, us-medicaid,
us-chip, us-wic, us-liheap, us-nslp, us-va-healthcare (all from sources.md rows; structural
%-FPL only where statutory; confidenceCap where state-varying) + `Program.supersedes` so
NJ/CA state versions replace their federal baselines with no double-counting. Program count on
the site becomes derived, not hardcoded. **Delegation:** Sonnet enters program JSON + the
51-state registry data from my templates.

## W5 — Motion/visual showcase ✦ my work, no delegation
Extend "every door has its own key color" into the new surfaces: scope-tinted map markers +
popups, staggered marker drop-in (reduced-motion: instant), offer cards that preview the
destination room's color + sigil, advisory blocks with staged why→next→worth reveal, address
input with a "locating…" pulse micro-interaction. All via the existing motion tokens.

## W6 — Self-verification ✦ my work
Playwright persona walkthroughs (low-income high-schooler → education; working parent →
food+health; middle-class homeowner → tax) with click-by-click landed-URL logs; fix failures;
`docs/v3_report.md` with delegation notes, persona results, program count, tier coverage,
zero-fabrication confirmation, and open judgment calls.

---
## Status log
- [x] W1 — DONE. Root cause of the reported bug: home CategoryGrid tiles were hover-lift Cards
  with no Link (the /results tabs were wired in v2; the home tiles were missed). Fixed + wired
  with press-weight. Also landed: the previously-approved net/gross testIncome fix (borderline,
  never fail, for net-basis programs) and a real a11y fix (home Footer was inside <main>,
  stripping its contentinfo landmark). Proof: 29/29 Playwright clicks in real chromium — every
  nav link, hero/final CTA, 5 persona cards, 8 category tiles, footer, theme toggle, slideshow
  dots, /results tabs/spotlight/footer actions (seeded household), full wizard flow, scope-page
  links, external-link integrity, 404 route, cliff-simulator slider — in both reduced-motion and
  animation-enabled modes. Suite lives at tests/e2e/controls.spec.ts (npm run test:e2e).
- [x] W2 — DONE. All tokenless legs verified LIVE before any code was written (geocoder shape,
  LIHTC LVL2KX filter, HRSA spatial query). Live e2e through our own route: Newark NJ → Essex
  County → 40 real LIHTC properties (all rooftop-mapped), 25 real health centers w/ phones;
  bad address → honest reason; no HUD token → honest "see the README" note (FMR/IL is the one
  leg I could not live-test — token requires registration; structural implementation follows
  HUD's documented API). Found + fixed a live data quirk: CNTY2KX stores county codes UNPADDED
  ('13' not '013') — query covers both. Food deliberately has no panel (no API exists; the
  Feeding America pointer card is the honest answer). Delegated: all 4 server clients + route
  handler + env/README docs (Sonnet, from my verified-shape spec). Mine: pipeline design, API
  verification, near-you data config, NearYouPanel/LocalMap UX, ScopeScreen wiring, the
  CNTY2KX fix.
- [x] W3 — DONE. OfferRule data (14 rules incl. all six required situations + medicare/tax-filer/
  homeowner-senior/planning-college/renter-crisis extras), conditions reuse QuestionCondition
  (gained a field-equals variant that showIf inherits), ranking = weight + 2×open-results +
  unanswered (a door with nothing behind it is skipped; one offer per destination). NextSteps
  cards on /results wear the destination room's color + sigil; every scope page ends in a
  "Keep going" cross-offer, so no results surface dead-ends. Gate grew 2 branching tests →
  31/31 twice consecutively (capped workers at 4 + 1 retry after diagnosing hydration-race
  flake under 12 parallel workers — passes serially; a real dead control still fails
  deterministically). Delegated: offers.ts rule data (Sonnet). Mine: condition/ranking design,
  offers engine, NextSteps, wiring, flake diagnosis.
- [x] W4 — DONE. 51 jurisdictions (50 states + DC) honestly tiered: deep (NJ/CA, verified
  official aggregators NJHelps/BenefitsCal) vs federal (Benefits.gov pointer — no invented
  state URLs); 7 federal baselines (us-snap/medicaid/chip/wic/liheap/nslp/va-healthcare,
  statutory %-FPL only, confidenceCap where state-varying) + supersedes composition so NJ/CA
  households never see doubles. Program count now DERIVED (51 distinct) — hero pill reads
  "51 programs · every state · full coverage in CA & NJ" from the registry. Advisory strip
  (next step + worth) on every card from record fields only, incl. deterministic per-child
  arithmetic for kid-gated credits; /api/explain locked-prompt AI layer (haiku, record looked
  up server-side, {disabled} without key — verified live) + opt-in ExplainButton with privacy
  disclosure. CoverageNote on /results for federal-tier states notes the address features are
  national. Gate 31/31. Delegation note: both Sonnet agents were killed mid-task by a session
  limit — the explain route survived complete (kept as-is), the federal-pack agent only
  landed a header comment; I wrote the 7 programs, supersedes lines, ExplainButton, and all
  wiring myself.
- [x] W5 — DONE (no delegation). The room system now reaches every new surface: Leaflet popups
  re-dressed as app cards (token borders/radius/shadow, both themes), markers answer the pointer
  (swell + solidify on hover, CSS-transitioned), the "you are here" ring vs. filled result dots
  read differently at a glance; near-you result blocks arrive as a staged story (found → rents →
  income limits → map → places); the address button pulses "Locating…" while it works; offer-card
  arrows lean toward their door on hover; advisory strips rise in with their card. Deliberate
  restraint: NO stock imagery added to the new surfaces — texture + watermark + key color IS the
  identity, and a map full of real places is the strongest image on the page. All motion reads
  the shared tokens and sits inside prefers-reduced-motion guards. Gate 31/31. Also fixed two
  pre-existing lint errors from W2 (unescaped apostrophes) caught this pass.
- [ ] W6
