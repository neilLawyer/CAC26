# OpenDoor v4 — Build Report

Thirteen workstreams, planned → built → committed in sequence (`docs/v4_plan.md` is the
living plan with the per-workstream status log). Every claim below was verified by
executing the thing — clicks in a real browser, downloads inspected byte-level, arithmetic
checked by hand against the screen.

## What was built

**W1 — The collapse system** (`e74fc23`). One primitive (`ui/Disclosure`: CSS
grid-rows 0fr↔1fr, visibility delayed past the closing animation, `inert` when shut) drives
the whole app. Result cards collapse to ONE line — name + est. $/yr + confidence badge —
via the ARIA accordion pattern (headings survive for screen readers); expanded state holds
the reason trace, advisory, the AI explainer, and one merged verify+source row. Expand
all / Collapse all broadcast through a group context; Comfortable/Compact density is a
persisted `<html data-density>` attribute applied before paint. Big info boxes everywhere
(local-pointer, coverage note, cliff explainer) became one-line InfoBoxes. Writing the gate
caught a real bug: collapsed content was clipped to zero height but still hit-testable —
fixed in the CSS, not the test.

**W2 — Dashboard + count-up** (`aae5b65`). A large rAF/easeOutExpo count-up of estimated
$/yr left unclaimed, gradient-inked, gliding from the last shown value when answers change;
an SVG progress ring that draws itself in; a likely/open/screened stat column. Honesty is
in the layout: the min–max range and "an estimate, not a guarantee" sit directly beside the
big number, and an e2e test parses the on-page range and asserts the headline IS its
midpoint. Reduced motion: the final number, instantly.

**W9 — The cliff audit** (`cb28c4b`, deliberately built early). **Audit verdict on the
reported screenshot: the displayed arithmetic was never broken** — $32,400 − $5,500 =
$26,900 exactly. The real defects were in what got counted: (1) every "possible" program
sat in the totals at full midpoint value, and net-basis programs (WFNJ/SSI/CAPI/GA) can
never fall below "possible" on gross income *by design* — so the simulator never counted
them as lost and systematically muted cliffs; (2) waitlist/formula programs
(confidenceCap) counted as if qualifying meant receiving; (3) a latent engine bug where
`maxIncomePctFPL` overwrote a kid-tier ceiling instead of taking the minimum (no current
program triggers it; fixed and test-locked anyway). The rebuilt model (`lib/cliff.ts`)
counts LIKELY programs only, names every program that appears/disappears with its record's
own midpoint, labels net-basis exits "may survive deductions" instead of flatly lost,
states the basis on-page, and documents the safe-raise scan as stopping at the FIRST dip.
Hand-verified at +$2,700/mo with real NJ data: itemized deltas (−$2,400 NJ SNAP − $111
Lifeline + $3,500 Get Covered NJ = +$989) reconcile with the stated change and the net
($32,400 + $989 = $33,389). Locked by unit tests (vitest infra added; 36 tests at landing,
58 by the end). Plus the stacking view on /results: likely programs as one summed range,
"programs that unlock each other" derived from `incomeWaivedByFlags`, cliff pointer.

**W3 — The orbit** (`0f80b8d`). Homepage showpiece: OpenDoor at the core (a real door to
/intake), five personas on the inner ring, eight categories on the outer, drifting in
opposite directions. Four nested transforms per node cancel exactly so chips orbit while
labels stay level — transform-only, zero per-frame JS. Entering the orbit (pointer OR
keyboard focus) pauses the sky; hover enlarges a node in its key color; click flies into
the room. Reduced motion: static rings, instant navigation. Small screens: compact tiles.
Every node is a real `<Link>`; modified clicks keep native behavior. The gate caught
zero-width link boxes (invisible to hit-testing and the a11y tree despite painting fine) —
fixed with real geometry.

**W4 — Universal search** (`f736f89`). Ctrl/⌘-K palette + a visible header Search button on
every page. Hand-rolled AND-over-tokens scoring over a data-driven index: the household's
own state programs, the 13 rooms, app pages, enriched by 92 delegated synonym tags
("pregnant" → WIC/Medicaid/families; "food stamps"/"ebt" → SNAP; ~10 Spanish phrases).
Full keyboard model, honest zero-state. A unit test pins every tag id to a real
program/scope/page.

**W5 — The merit track** (`6ec535e`). 13 verified merit/non-income scholarships as data,
rendered as a collapsed one-liner in the education and students rooms and a full
/scholarships page — tidy bullets linking to official pages, native `<details>` as the
in-app explainer. QuestBridge, the Gates Scholarship, and Jack Kent Cooke were checked and
turned out income-gated: excluded, with the reason stated on-page. Elks MVS says plainly
that financial need is one of its three judging factors. I independently re-verified the
two URLs I trusted least (floridabrightfutures.gov — real, FDOE/Lottery-run — and
Coca-Cola's apply page, matching the recorded $20,000 × 150).

**W6 — Tax guide** (`8442850`). /tax-guide, content entirely as data: what filing does,
the real free routes (Free File with its **$89,000 AGI cap re-verified by me against
irs.gov**, VITA/TCE + locator, GetYourRefund, MilTax), an honest note that **IRS Direct
File is dead for the 2026 season**, a watch-out section grounded in the FTC's 2024 Intuit
order — including the March 2026 Fifth Circuit vacatur framed precisely (procedural, not a
merits ruling) — credits worth checking, and a printable what-to-bring checklist mirroring
the IRS's own. The print system built here (chrome hidden, ink palette, `.print-area`)
serves the packet too.

**W7 — Deadlines** (`7ed1f04`). A personal timeline from the household's matches: verified
windows only (GetCoveredNJ and Covered California Nov 1 – Jan 31, HealthCare.gov Nov 1 –
Jan 15 with supersedes composition so a NJ household never sees the federal window; FAFSA
opens Oct 1 / federal close June 30 with "state deadlines come first"; NJ LIHEAP Oct 1 –
Jun 30 first-come-first-served; VFW contests Oct 31; Coca-Cola end-of-September) — every
date checked against its official source that day and stamped. Windows that vary by state
say so and deliberately offer **no** downloadable date; a unit test enforces "a stated date
or an honest varies, never neither." Each card downloads an .ics built in the browser.
No email, no SMS, no server storage.

**W8 — "What changed?"** (`100bc8f`). On-device snapshot (one localStorage key, deletable
in one click). Returning re-runs eligibility and announces ONLY likely-line crossings;
softer movements stay quiet because "since last time" must never overpromise; a state
change invalidates the comparison instead of diffing two different program sets. New
programs added to the library that land likely surface themselves to returning users.

**W10 — The packet** (`53e7863`). /packet: every likely/possible program with confidence,
worth, agency, apply domain (paper-friendly), and rules-checked stamp, plus ONE
deduplicated documents checklist — generic-but-true items with the hedge printed on the
sheet ("the agency confirms the exact list; missing one is a reason to ask, not to skip
applying"). Rows never split across page breaks.

**W11 — Español** (`451a967`). Dictionary i18n, no library: locale store + `<html lang>`
applied pre-paint, ~75 keys, EN/ES header toggle. Translated: nav, hero, orbit intro,
footer, the full intake chrome (Sí/No/Saltar/Continuar…), results heading/links, dashboard,
expand/collapse/density, search palette. Spanish mode states plainly that questions and
program details remain English for now — they're verified source data, and translating
them is future work (below), not something to half-do silently.

**W12 — The semi-vibrant pass** (`ef2659d`, per the owner's direction). Accent-2 shifted
cyan→violet so every accent gradient (hero ink, count-up, ring) actually travels;
backgrounds picked up a whisper of indigo; and the big lever — **13 doors now wear 13
distinct hues** (emerald food, amber energy, blue education, orange housing, fuchsia tax,
sky phone, rose seniors, indigo veterans, lime students, pink immigrants…), a pure data
edit that recolors the orbit, rooms, tabs, and offers at once. Shipped with a real
legibility fix: Badge text and confidence headings now mix toward the foreground, ending
yellow-on-white "possibly eligible" in light mode. The cliff's net-effect headline adopts
the dashboard's count-up voice; the orbit core breathes on a compositor-cheap pulse.
Reduced-motion audit: every animation added in v4 sits behind the no-preference guard.

## W13 — The walkthrough (real browser, animations ENABLED, permanent spec)

`tests/e2e/v4-walkthrough.spec.ts` — one continuous journey, every station logged:

1. Orbit: hover paused the sky, Families node → /intake/families. PASS
2. Intake clicked like a person: NJ → 4 → $2–2.5k/mo → pregnant + school-age → /results. PASS
3. Dashboard count-up settled on **$37,611 — exactly the midpoint of its own displayed
   range** (asserted from the DOM, not from code). PASS
4. WIC card: one line → full detail with the merged verify+source row → collapsed;
   expand-all/collapse-all broadcast to every card. PASS
5. Ctrl-K → "food stamps" → SNAP → landed /intake/food. PASS
6. Education room → scholarship list → National Merit links to nationalmerit.org. PASS
7. Tax room pointer → /tax-guide → IRS Free File link + printable checklist. PASS
8. Deadlines → downloaded `opendoor-fafsa.ics` (a real file; the suite elsewhere inspects
   VCALENDAR contents byte-level). PASS
9. Stacking: combined range + rule-derived unlock notes. PASS
10. Cliff at +$2,700/mo: extra pay $32,400, change +$3,389, net $35,789 — **identity holds
    in the rendered DOM**, counting basis stated on-page. PASS
11. Español: chrome + `lang` flipped, honesty note shown, toggled back. PASS
12. Packet: programs + ONE deduped checklist; print emulation drops the chrome. PASS

Final suite: **51 e2e + 58 unit**, production build, lint clean.

## Delegation ledger

| Work | Who | Outcome |
|---|---|---|
| Architecture, all UX/visual/motion design, collapse/dashboard/orbit/search/palette code, cliff audit + model, stacking, snapshot, deadlines data + verification, packet, i18n system + translations, semi-vibrant pass, all verification | Fable (me) | — |
| Search synonym tags (92, `src/data/search-tags.ts`) | Sonnet | Landed complete; every id verified against the catalog; honestly flagged that no solar program exists to map to |
| RFC 5545 .ics builder + unit tests | Sonnet | Landed complete; tests passed first run |
| Scholarship data (13 entries, web-verified) | Sonnet | Landed complete; correctly dropped income-gated "merit" awards with reasons |
| Tax-guide content (web-verified) | Sonnet | Landed complete; found Direct File's 2026 shutdown and the FTC vacatur nuance on its own |
| i18n string extraction + Spanish | Sonnet | **Killed by session limit before touching a single file** — done by me |
| Packet print boilerplate | not delegated | Absorbed by W6's shared print system; nothing mechanical remained |

## Honesty inventory (zero fabricated numbers, programs, locations, scholarships, or dates)

- Every scholarship, deadline date, and tax figure traces to an official page checked on
  its `lastVerified` stamp; I independently re-verified the highest-risk claims (Free File
  cap, Florida Bright Futures domain, Coca-Cola figures, all five deadline windows).
- Deadline entries that vary by state carry NO downloadable date — unit-test-enforced.
- The cliff simulator states its counting basis on the page and labels net-basis exits as
  "may still qualify after deductions," never flatly lost.
- Search invents no matches (honest zero-state); "solar" maps to the energy room because
  no clean-energy program exists in the catalog to point at.
- Spanish mode says out loud what is still English.
- Privacy: calendar and snapshot are on-device only (Blob download / localStorage); no
  email, SMS, accounts, or server storage anywhere in v4; the packet prints locally.

## Needs your judgment

1. **Program-content translation.** The question catalog (~40 prompts) and program
   summaries are verified data; translating them is a data project with review needs
   (ideally a native speaker). The chrome is done; this is the natural next i18n step.
2. **Sub-agent session limits, third occurrence.** v3 lost two agents mid-flight; v4 lost
   the i18n agent the same way (the four launched EARLY all landed). For future runs:
   batch every delegation at session start, or budget for doing late ones by hand.
3. **`lastVerified` refresh** (CLAUDE.md TODO) remains open — v4 deliberately did not bump
   program-figure dates without re-checking sources; the new v4 data files carry fresh
   stamps because they WERE checked.
4. **Net-basis "possible" breadth on /results** (carried from v3): the cliff simulator now
   handles it correctly, but high-income households still see net-basis programs as
   "possible" in results — the approved over-inclusion trade; a data-level cap is the
   remedy if it reads as clutter.
5. **HUD_TOKEN / ANTHROPIC_API_KEY** (carried from v3): both registration-gated paths
   remain structurally complete with live-tested honest fallbacks.
6. **Persona/category recolor** is data-only and instantly reversible in
   `categories.ts`/`populations.ts` if any hue reads wrong to you — the orbit screenshot
   set (dark + light) is in the session record.
