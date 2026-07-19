import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const NY_META: StateMeta = {
  code: "NY",
  name: "New York",
  available: true,
  tier: "deep",
  // myBenefits is OTDA's own screening/application portal — SNAP, HEAP, and
  // Temporary Assistance all apply through it (a verified, official destination).
  aggregator: { name: "myBenefits NY", url: "https://mybenefits.ny.gov/" },
};
