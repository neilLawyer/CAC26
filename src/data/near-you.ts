import type { NearYouKind } from "@/lib/near-you-types";

// "Help near you" — per-scope configuration, as data. A scope with an entry
// here gets the address-driven local-results panel on its /intake/[scope]
// page; the copy (including the privacy disclosure and every honesty note)
// lives here, not in components.
//
// Food deliberately has NO entry: no public API exists for food-bank
// locations, so its "near you" answer is the existing Feeding America
// localPointer card (their site takes your ZIP directly) — an honest pointer
// beats a fake pipeline.

export interface NearYouConfig {
  kind: NearYouKind;
  heading: string;
  intro: string;
  /** Shown at the address input BEFORE anything is sent — the privacy contract. */
  consent: string;
  /** Honesty notes rendered with the results — truths the data can't carry. */
  honestyNotes: string[];
}

export const NEAR_YOU: Partial<Record<string, NearYouConfig>> = {
  housing: {
    kind: "housing",
    heading: "Real housing help near you",
    intro:
      "Enter your address and we'll look up your county's actual rent benchmarks, HUD income limits, and real affordable-housing properties nearby — the same federal data housing agencies use.",
    consent:
      "Your address is sent once to the U.S. Census Bureau's public geocoder to find your county, and never stored, logged, or saved — not even in this browser.",
    honestyNotes: [
      "“Rent-stabilized” status is set by cities and towns, not the federal government — no federal dataset carries it, so we won't pretend to know it. Your local housing authority (linked above) is the right place to ask.",
      "Affordable-housing properties come from HUD's LIHTC database. We only place a property on the map when HUD's own records are address-accurate; anything less precise is listed without a pin instead of guessed.",
    ],
  },
  health: {
    kind: "health",
    heading: "Care near you, regardless of coverage",
    intro:
      "HRSA-funded health centers treat you even without insurance, on a sliding fee scale. Enter your address to see the ones near you — real locations with real phone numbers.",
    consent:
      "Your address is sent once to the U.S. Census Bureau's public geocoder to find where you are, and never stored, logged, or saved — not even in this browser.",
    honestyNotes: [
      "Locations come from HRSA's live facility registry. Call before you go — hours and walk-in policies vary by site.",
    ],
  },
};
