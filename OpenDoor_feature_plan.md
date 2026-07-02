# OpenDoor — Master Feature Plan

A single, deduplicated feature list merged from two idea sets. Organized so a Claude Code build plan reads cleanly with no conflicting or repeated features.

**What OpenDoor is:** a free, informational tool that helps people find public benefit and assistance programs they may qualify for (food, energy, school aid, utility help, healthcare, and local programs), explains them in plain language, and points them to the official place to apply. Pick your state, answer a few simple questions, see what you may be eligible for.

---

## Ground rules (build these in from day one — they keep the project safe and simple)

These are non-negotiable framing rules. Every feature below must respect them.

1. **Informational only, never official.** OpenDoor gives estimates and general information. It is not a government site, not affiliated with any agency, and does not make official eligibility decisions. Say this clearly and often.
2. **Always "you *may* qualify" + a link to apply.** Never present a result as a guarantee or a final determination. Every result links to the real, official application so the agency makes the actual decision.
3. **No personalized financial, legal, tax, or investment advice.** Everything is general information and educational estimates. The cliff calculator is an "educational estimate," not financial advice. The appeal helper "helps you draft and organize," it is not legal representation.
4. **Open data and open-source only.** Use public-domain government data and openly licensed libraries (MIT / Apache). Paraphrase program rules in plain language — do not copy official rule text word-for-word. No paid or license-restricted data feeds.
5. **Privacy by default.** No account required. Compute locally where possible. Don't store, sell, or share personal answers. Make this a loud, visible promise, not fine print.
6. **Human backstop.** For anything real or urgent, hand off to 211 / official agency contacts. OpenDoor guides; humans and agencies decide.

---

## Layer 1 — Intake and access

- **Adaptive conversational intake** — asks the fewest questions needed and prunes the question tree as answers come in.
- **Income entered as ranges, not exact numbers** — fewer errors, less drop-off.
- **Live "eligibility so far" meter** — updates in real time as the user answers.
- **State selector** — user picks their state (or state → county); the app loads that location's data pack and every feature runs off it. One engine, many data packs.
- **SMS / text-only screening path** — for people without a smartphone or broadband.
- **Offline-capable, low-bandwidth mode (PWA)** — works on old phones and weak connections.
- **Accessibility-first and multilingual** — screen-reader clean, ~6th-grade reading level, multiple languages (e.g. Spanish and others common to the region).

## Layer 2 — Eligibility engine (the core)

- **Rules-as-data engine** — each program's rules (income basis, asset limits, AMI % by county and household size, age / disability / veteran / status factors) live as structured data files, never hardcoded. Adding a program = adding a data file.
- **Plain-language reason traces** — every "you may qualify / you may not" comes with a simple explanation of why.
- **Cascade / domino chaining** ⭐ — shows how one benefit unlocks others ("because you may qualify for SNAP, you're likely also eligible for these 4 things").
- **"What would make you eligible" counterfactuals** — for near-misses, shows what would change the outcome.
- **Confidence labels** — definitely / likely / need to verify, per result.
- **Effective-dated rule versioning** — past results stay reproducible when rules change later.
- **Household composition modeling** — handles larger or mixed households sensibly.

## Layer 3 — Money and planning (educational estimates only)

- **"Money left on the table" dashboard** ⭐ — a running total of estimated annual dollars the user may be leaving unclaimed; tracks applied-for vs. still-waiting.
- **Benefits-cliff simulator** ⭐ — user enters a possible income change and sees the estimated net effect (what they'd gain in pay vs. lose in benefits). Labeled as an educational estimate.
- **"Safe raise" estimate** — roughly how much more someone could earn before hitting a net loss.
- **Benefit-stacking view** — highest-estimated-value set of programs vs. fastest-to-get set.
- **Time-to-benefit estimate** — rough weeks until money typically arrives, per program.

## Layer 4 — Paperwork and application help

- **"Explain this letter" tool** ⭐ — user pastes or photographs a confusing government letter / notice / form field, and it explains what it means and what to do next in plain language.
- **Document-once, apply-many profile** — one saved profile maps onto many program applications (kept locally / privately).
- **Per-program document checklist + missing-document detector** — flags what's needed and what's missing before starting.
- **Application status tracker** — track each submission in one place.
- **Deadline and appointment reminders** — so nothing important is missed.
- **Denial decoder + appeal drafting assistant** — explains a denial reason in plain language and helps draft an appeal letter. (Drafting help only — not legal advice or representation.)

## Layer 5 — Lifecycle and proactive

- **Life-event re-scan** ⭐ — one tap for "new baby / lost job / turned 65 / kid started college" instantly re-runs eligibility.
- **Recertification / renewal guardian** — reminds users before renewal deadlines so they don't lose benefits they already have.
- **Auto re-screening** — when rules change or new programs launch, alert users who may now qualify.
- **New-program alerts.**

## Layer 6 — Hyperlocal programs

- **County / town-level program surfacing** ⭐ — beyond the big federal programs, surface the small local ones people never hear about (county diaper bank, local utility hardship fund, senior property-tax freeze, school-district laptop program). This is the "I've never seen this anywhere else" feature.

## Layer 7 — Trust, accuracy, and privacy

- **Privacy-first / no-login** — loud, front-and-center promise (see Ground Rule 5).
- **Data-freshness stamps + source citations** — every rule and listing shows when it was last checked and links to its official source.
- **"Verify with agency" fallback** — every result links to the official application / agency.
- **False-negative-averse design** — err toward "you may qualify, go check" rather than wrongly telling someone no.
- **Accuracy checks (eval harness)** — test the engine against a set of known-answer example households and track accuracy.

## Layer 8 — Civic infrastructure (stretch goals, do last)

- **Caseworker / navigator mode** — a helper (counselor, librarian, volunteer) can run screenings for others and share a read-only summary.
- **Warm handoff to humans** — connect to 211 / open referral directories.
- **Anonymized demand dashboard** — aggregate, non-personal data showing where need is highest, for policymakers.
- **Gap reporting** — flag programs eligible people can't find or access.
- **Open API / open data output** — let nonprofits and other apps build on OpenDoor's data.

---

## Parked for later (intentionally out of scope for v1)

- **Housing waitlist / lottery intelligence** (reopen prediction, wait-time estimates, lottery-odds estimator, batch-apply). Powerful, but housing-specific and dependent on data that's rarely published. Keep it out of the first build so the "all benefits" scope stays clean; revisit as a housing-focused add-on.

---

## Suggested build order for the App Challenge (so the demo is strong and finishable)

**Build first (the demo core):**
1. State selector + rules-as-data engine (Layer 2 basics) — even with just one fully-built state and ~10–15 programs.
2. Adaptive intake + income ranges + live eligibility meter (Layer 1).
3. Results dashboard with plain-language reason traces and "verify with agency" links (Layers 2 + 7).
4. One flagship "wow" feature — the **benefits-cliff simulator** ⭐ (Layer 3).

**Add if time allows:**
5. Cascade / domino view ⭐ and "money left on the table" counter ⭐ (Layers 2 + 3).
6. "Explain this letter" tool ⭐ (Layer 4).

**Mention as roadmap in your writeup (don't have to build):** hyperlocal programs, life-event re-scan, recert guardian, caseworker mode, SMS path.

This ordering means even a partial build demos as a complete, working product with one standout feature — which is exactly what wins.
