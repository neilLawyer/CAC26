import type { StateMeta } from "@/lib/types";

// The 49 federal-tier jurisdictions (50 states + DC, minus deep-tier NJ/CA):
// every one gets the full federal baseline plus a REAL, official aggregator
// pointer. Benefits.gov is the U.S. government's own cross-program finder
// (docs/sources.md §1) — we never invent a state-specific URL we haven't
// verified. Promoting a state to "deep" = writing its pack + moving it to
// the deep list in src/data/states/index.ts.

const BENEFITS_GOV = { name: "Benefits.gov", url: "https://www.benefits.gov" };

function federalTier(code: string, name: string): StateMeta {
  return { code, name, available: true, tier: "federal", aggregator: BENEFITS_GOV };
}

export const FEDERAL_TIER_STATES: StateMeta[] = [
  federalTier("AL", "Alabama"),
  federalTier("AK", "Alaska"),
  federalTier("AZ", "Arizona"),
  federalTier("AR", "Arkansas"),
  federalTier("CO", "Colorado"),
  federalTier("CT", "Connecticut"),
  federalTier("DE", "Delaware"),
  federalTier("DC", "District of Columbia"),
  federalTier("FL", "Florida"),
  federalTier("GA", "Georgia"),
  federalTier("HI", "Hawaii"),
  federalTier("ID", "Idaho"),
  federalTier("IL", "Illinois"),
  federalTier("IN", "Indiana"),
  federalTier("IA", "Iowa"),
  federalTier("KS", "Kansas"),
  federalTier("KY", "Kentucky"),
  federalTier("LA", "Louisiana"),
  federalTier("ME", "Maine"),
  federalTier("MD", "Maryland"),
  federalTier("MA", "Massachusetts"),
  federalTier("MI", "Michigan"),
  federalTier("MN", "Minnesota"),
  federalTier("MS", "Mississippi"),
  federalTier("MO", "Missouri"),
  federalTier("MT", "Montana"),
  federalTier("NE", "Nebraska"),
  federalTier("NV", "Nevada"),
  federalTier("NH", "New Hampshire"),
  federalTier("NM", "New Mexico"),
  federalTier("NY", "New York"),
  federalTier("NC", "North Carolina"),
  federalTier("ND", "North Dakota"),
  federalTier("OH", "Ohio"),
  federalTier("OK", "Oklahoma"),
  federalTier("OR", "Oregon"),
  federalTier("PA", "Pennsylvania"),
  federalTier("RI", "Rhode Island"),
  federalTier("SC", "South Carolina"),
  federalTier("SD", "South Dakota"),
  federalTier("TN", "Tennessee"),
  federalTier("TX", "Texas"),
  federalTier("UT", "Utah"),
  federalTier("VT", "Vermont"),
  federalTier("VA", "Virginia"),
  federalTier("WA", "Washington"),
  federalTier("WV", "West Virginia"),
  federalTier("WI", "Wisconsin"),
  federalTier("WY", "Wyoming"),
];
