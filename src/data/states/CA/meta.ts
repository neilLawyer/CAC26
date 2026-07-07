import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const CA_META: StateMeta = {
  code: "CA",
  name: "California",
  available: true,
  tier: "deep",
  // BenefitsCal is California's own cross-program application portal
  // (already the applyUrl for CalWORKs — a verified, official destination).
  aggregator: { name: "BenefitsCal", url: "https://benefitscal.com/" },
};
