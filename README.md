# OpenDoor

A free, informational tool that helps people find public benefit and assistance
programs they may qualify for (food, energy, school aid, utility help, healthcare,
and local programs), explains them in plain language, and points them to the
official place to apply.

Built for the Congressional App Challenge 2026. Full feature plan and ground rules
in [`OpenDoor_feature_plan.md`](./OpenDoor_feature_plan.md).

## Ground rules

- **Informational only, never official.** OpenDoor never makes an official
  eligibility decision — every result says "you may qualify" and links to the
  real agency to confirm.
- **No login, nothing stored on a server.** Your answers live in your browser's
  local storage only.
- **Open data and open-source only.** No paid or license-restricted data feeds.

## How it works

- `src/lib/types.ts` — core data shapes (`Household`, `Program`, `EligibilityResult`).
- `src/data/states/<STATE>/programs.ts` — rules-as-data. Adding a new program or
  state means adding a data file here, never touching the engine.
- `src/lib/engine.ts` — evaluates a household against program rules and produces
  a confidence label + plain-language reason trace per program.
- `src/app/intake` — adaptive intake wizard with a live "eligibility so far" meter.
- `src/app/results` — results dashboard: confidence, reasons, source citations,
  "money left on the table" estimate, cascade suggestions.
- `src/app/cliff-simulator` — the benefits-cliff simulator (flagship feature):
  models the net effect of a hypothetical income change on pay vs. lost benefits.

Currently ships with one fully-built state (California, ~13 programs) per the
suggested build order in the feature plan.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Collaborating

This repo is shared between contributors as collaborators — clone it, create a
branch or work on `main` directly, and `git pull` / `git push` to stay in sync.
For live pair-programming, use the CodeTogether extension alongside git.
