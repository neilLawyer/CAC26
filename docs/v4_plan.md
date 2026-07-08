# OpenDoor v4 — Feature + Design Overhaul Plan (living document)

Lead architect/designer/builder: Fable 5. Mechanical work delegated to Sonnet sub-agents
(noted per workstream and in each commit). Rhythm: plan → build → commit, per workstream.

## Ground rules (never bend)
- Rules-as-data: new program / state / scholarship / deadline / tax-guide entry = data, not code.
- Never fabricate a number, program, location, scholarship, or date. Every data entry keeps an
  official `sourceUrl` (+ `lastVerified` where it carries figures).
- No financial data collection. Calendar + snapshot are on-device only (localStorage /
  file download) — no email, no SMS, no server storage, no accounts.
- `prefers-reduced-motion` respected by every animation, including the new orbit + count-up.
- The global design principle: kill the "always-expanded chunky box" pattern APP-WIDE via one
  shared collapse system, not per-page hacks.

## Sequencing & delegation strategy
v3 lesson: late-session sub-agents got killed by session limits. So the four data-only
delegations (scholarship JSON, tax-guide content, .ics plumbing, search tag index) launch
FIRST, in parallel, writing only new isolated files (no git commands), while I build the
design-critical workstreams. I review + commit their output with its workstream. Commits are
path-scoped (`git add <paths>`) so parallel agent output never rides along accidentally.

Build order: W1 collapse system → W2 dashboard/count-up → W9 cliff audit (correctness early;
unit-test infra lands here) → W3 orbit → W4 search → W5 scholarships → W6 tax guide →
W7 calendar → W8 snapshot → W10 packet → W11 i18n → W12 motion pass → W13 verify + report.
(W9 moves up because a wrong number in a showpiece is worse than a missing feature.)

## W1 — Collapsible result cards (system-wide collapse)
- New primitive `src/components/ui/Disclosure.tsx`: CSS `grid-template-rows 0fr↔1fr` height
  animation (GPU-cheap, no JS measuring), motion-token durations, reduced-motion = instant,
  `aria-expanded`/`aria-controls` correct.
- `ResultCard` collapses by default to ONE line: program name + confidence badge + est. $/yr
  (from record fields; absent → no number, never invented). Expanded: summary, reason trace,
  counterfactual, advisory (next step + worth), explain-in-plain-words (AI button — expanded
  state only), and ONE merged footer action row: "Verify & apply with {agency} →" +
  "Source · checked {date}" (the redundant separate source line + verify button merge here).
- Global controls on results + scope pages: "Expand all / Collapse all" + density switch
  ("Compact / Comfortable"), persisted in a tiny `ui-prefs` localStorage store (pattern:
  theme-store). Compact tightens paddings/type via a `data-density` attribute + tokens.
- Big info boxes everywhere (localPointer cards, "What's a benefits cliff", how-it-works
  blurbs, coverage notes) become `InfoBox` disclosures: one-line title, collapsed by default.
- All mine (design-critical).

## W2 — Results dashboard + count-up hero
- `ResultsDashboard` above the cards: large animated count-up of estimated $/yr left on the
  table (midpoint, with the honest min–max range printed beside it), program count, and an
  SVG progress ring (programs still-possible / total screened; stroke-dashoffset animation).
- Count-up: rAF + easeOutExpo, starts on mount (IntersectionObserver-gated), respects
  reduced-motion (final number instantly). Reusable `useCountUp` hook — the cliff simulator
  gets it too in W12.
- Mine.

## W3 — Orbiting category menu (homepage showpiece)
- Replaces `PopulationGrid` ("Built for the moments…") on the homepage ONLY. Two rings:
  personas (inner, 5 nodes) + categories (outer, 8 nodes) orbiting a centered OpenDoor core.
  Pure CSS transform rotation (container rotates, nodes counter-rotate to stay upright) —
  GPU-cheap, no JS per-frame work. Hover/focus pauses the orbit + enlarges the node; click
  flies into the room (scale/fade exit, then navigate to /intake/[scope]).
- Reduced motion: static rings, no rotation, no fly-in — still fully clickable. Mobile
  (<sm): falls back to the compact grid (orbit needs room to breathe). Nodes are real links,
  keyboard-focusable. Normal tab nav + category grid remain the reliable fallback.
- Mine, entirely.

## W4 — Universal search (cmd/ctrl-K palette)
- `SearchPalette`: global shortcut + visible search affordance in NavHeader on every page.
  Fuzzy scoring (token/substring/initials, hand-rolled, no dependency) over a data-driven
  index: programs (name, shortName, summary, category) + categories + personas + scholarship
  entries + tag synonyms ("pregnant" → WIC/Medicaid/families, "solar" → energy room).
- Jump targets: program → its category room; scope → /intake/[scope]; pages (cliff, tax
  guide, deadlines, packet) indexed too.
- Delegated: `src/data/search-tags.ts` synonym/tag data (Sonnet). Mine: palette UX, scoring,
  keyboard model (↑↓ Enter Esc), motion.

## W5 — Merit / non-income scholarships track
- `src/data/scholarships.ts`: real, well-known merit/non-income awards only (National Merit,
  Coca-Cola Scholars, QuestBridge, Gates, Jack Kent Cooke, VFW Voice of Democracy, American
  Legion Oratorical, Profile in Courage essay, Elks MVS, state merit like GA HOPE / FL Bright
  Futures, …), each with official URL + one-line description + eligibility note + typical
  deadline WINDOW (month, from the official page; no fake precise dates).
- Rendered on the education room + a `/scholarships` page as a COLLAPSED "Show full list" →
  tidy bullet list (not giant cards), each linking out.
- Delegated: the JSON entries (Sonnet, with web verification instructions + my schema).
  Mine: schema, rendering, spot-check of every URL/claim before commit.

## W6 — Tax guidance (NOT filing)
- `/tax-guide`: what filing is; the real free routes (IRS Free File, VITA/TCE locator,
  GetYourRefund/GetCTC); explicit "watch out" section on paid upsells for things that are
  free; programs that help low-income filers; printable "what to bring" checklist.
- Content lives in `src/data/tax-guide.ts` (data, not JSX). Never collects financial data;
  guidance + official links only.
- Delegated: content data drafting (Sonnet, from sources.md §7 + official sites). Mine: page
  design, print treatment, fact spot-check.

## W7 — Deadline calendar (privacy-safe)
- `src/data/deadlines.ts`: deadline-bearing programs (FAFSA windows, LIHEAP season, ACA open
  enrollment, scholarship windows) — recurring windows from official sources only; where a
  date varies by state, say so and link the official list instead of inventing one.
- `/deadlines`: personal timeline built from the household's matched results + scholarship
  picks; each entry downloads a .ics (Blob, on-device). NO email/SMS/server.
- Delegated: `src/lib/ics.ts` (RFC 5545 escaping, folding, VEVENT builder + tests-by-example)
  (Sonnet). Mine: timeline UX, deadline data verification, wiring to results.

## W8 — "What changed?" re-check
- `src/lib/snapshot.ts`: save {date, household, programId→confidence map} to localStorage on
  request; on return, re-run eligibility against current data and diff → "Since last time:
  you now qualify for X / Y moved to unlikely". On-device only. Mine (small + logic-y).

## W9 — Benefit-stacking view + cliff-math AUDIT (correctness-critical)
- AUDIT FINDING (pre-verified by reading; to be locked by tests): the screenshot's arithmetic
  actually reconciles ($32,400 − $5,500 = $26,900) — the DISPLAY identity was never broken.
  The real defects are in the model:
  1. `estimatedAnnualValueMidpoint` counts every "possible"-confidence program at full
     midpoint value. Net-basis programs (WFNJ/SSI/CAPI/GA) can never drop below "possible"
     on gross income by design, so the simulator NEVER counts them as lost — benefit loss is
     systematically understated and cliffs are muted.
  2. Latent engine bug: in `monthlyIncomeLimits`, a `maxIncomePctFPL` ASSIGNS over any
     ceiling already derived from `kidCountIncomeTiers` instead of taking the min.
  3. Confidence-capped programs (waitlists/lotteries) count at full value in the totals.
- FIX: the simulator (and its safe-raise scan) totals LIKELY-only programs, names the
  specific programs lost/gained at the hypothetical income with their values, and states the
  basis on-page. Engine bug (2) fixed with Math.min. Unit tests (vitest) lock: the
  netEffect ≡ extraPay + benefitChange identity, a synthetic cliff crossing, the net-basis
  exclusion, and the tier/pct min-combination.
- Stacking view on /results: how likely programs combine ("SNAP + WIC + NSLP ≈ $X–Y/yr"),
  adjunctive links surfaced ("already having Medicaid auto-qualifies WIC's income test"),
  link to the simulator. Mine, all of it.

## W10 — Printable benefits packet
- `/packet`: print/PDF-clean list of qualified programs (name, confidence, next step, agency,
  official URL) + ONE deduplicated "documents to bring" checklist. Document lists are
  generic-but-true categories (photo ID, proof of income, proof of address, …) attached to
  program categories as data, each stamped "the agency confirms the exact list."
- Delegated: print-CSS boilerplate + page scaffold (Sonnet). Mine: information design,
  document-data honesty pass.

## W11 — Spanish toggle (i18n)
- Tiny dictionary system, no library: `src/lib/i18n.tsx` (locale store à la theme-store +
  `useT()`), `src/data/i18n/{en,es}.ts`. Scope: chrome + core flow (nav, home hero/CTAs,
  intake wizard chrome, general-intake questions, results dashboard/sections, common
  buttons, footer). Program record content stays English this round — the toggle says so
  honestly. `lang` attribute updates for a11y/screen readers.
- Delegated: string extraction + es translations (Sonnet). Mine: system design, layout
  survival with longer Spanish strings, review.

## W12 — Cohesive visual + motion pass (mine, not delegated)
- One motion language across orbit / count-up / disclosure / palette / dashboard: shared
  tokens (durations, eases), consistent stagger rhythm, richer use of the scope palette
  (tier rules, ring gradients), micro-interactions (hover states, focus rings, press
  weight) everywhere new surfaces landed. Reduced-motion audit of every new animation.

## W13 — Self-verification + report (mine)
- Dev server + real Playwright browser: orbit click → intake → dashboard count-up →
  card expand/collapse → search → scholarships list → tax guide → add deadline to
  calendar → stacking → cliff simulator (fixed math verified against hand arithmetic) →
  Spanish toggle → packet. Every click + landed state recorded. Fix what fails.
- `docs/v4_report.md`: built/delegated ledger, walkthrough results, corrected cliff math +
  tests, judgment calls.

## Status log
- [x] W1 (`e74fc23`) — collapse system: Disclosure primitive (grid-rows + delayed visibility +
  inert), one-line ResultCards (ARIA accordion), merged verify+source row, expand/collapse-all
  broadcasts, persisted density, InfoBox for the big boxes. Gate caught clipped-but-"visible"
  collapsed content — fixed in CSS, not the test.
- [x] W2 (`aae5b65`) — dashboard: count-up hero (rAF/easeOutExpo, glides between values,
  reduced-motion instant — e2e asserts the headline IS the midpoint of its own printed range),
  self-drawing progress ring, stat column. ValueEstimate retired.
- [x] W9 (`cb28c4b`, built early — correctness first) — AUDIT: the screenshot's arithmetic was
  internally consistent (32,400−5,500=26,900); the real defects were possible-confidence programs
  counted at full value (net-basis ones can never drop out on gross income → cliffs muted) and
  waitlist-capped programs in the totals. Fix: likely-only basis, lost/gained programs NAMED and
  priced from their records, net-basis exits labeled "may survive deductions", basis stated
  on-page; latent engine min-combination bug fixed. vitest infra + 36 unit tests. Stacking view
  with rule-derived unlock notes.
- [x] W3 (`0f80b8d`) — orbit: two counter-rotating rings, labels always upright (4 transforms
  cancel), hover/focus pauses, click flies in, reduced-motion static, mobile tile fallback, real
  links. Gate caught zero-width link boxes — real fix, not a workaround.
- [x] W4 (`f736f89`) — search: ctrl-K palette + header button, hand-rolled scorer, index from
  state programs + scopes + pages + 92 delegated synonym tags (unit test pins every id; "solar"
  honestly maps to the energy room — no clean-energy program exists in the catalog to point at).
- [x] W5 (`6ec535e`) — scholarships: 13 verified merit/non-income awards (QuestBridge/Gates/
  Cooke excluded as income-gated, WITH the reason on-page), collapsed bullet list in education/
  students rooms + /scholarships; two URLs independently re-verified.
- [x] W6 (`8442850`) — tax guide: data-driven walkthrough (Free File $89k cap re-verified,
  Direct File honestly reported dead for 2026, FTC/Intuit with the vacatur nuance), printable
  IRS-mirrored checklist, shared print system in globals.css.
- [x] W7 (`7ed1f04`) — deadlines: verified windows only (GetCoveredNJ/CoveredCA Nov 1–Jan 31,
  HealthCare.gov Nov 1–Jan 15, FAFSA Oct 1/Jun 30, NJ LIHEAP Oct 1–Jun 30; varies-by-state
  entries get NO invented date — unit-enforced), supersedes composition, on-device .ics.
- [x] W8 (`100bc8f`) — snapshot: on-device save/diff announcing ONLY likely-line crossings;
  state changes invalidate honestly; delete really deletes.
- [x] W10 (`53e7863`) — packet: print-clean program list + ONE deduped documents checklist
  (generic-but-true, hedge printed on the sheet).
- [x] W11 (`451a967`) — español: dictionary i18n (~75 keys), pre-paint lang attr, EN/ES toggle,
  core-flow chrome translated, honesty note that program content stays English this round.
  Delegation attempt killed by session limit before touching a file — done by hand.
- [x] W12 (`ef2659d`) — semi-vibrant pass (owner-directed): accent-2 cyan→violet so gradients
  travel, indigo-tinted backgrounds, 13 doors in 13 distinct hues (pure data edit), Badge/tier
  text mixed toward foreground (light-mode legibility fix), cliff adopts the count-up voice,
  orbit core breathes. Reduced-motion audit clean.
- [x] W13 — walkthrough spec (12 stations, animations ENABLED, permanent) + docs/v4_report.md.
  Final: 51 e2e + 58 unit, production build.
