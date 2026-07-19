import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const IL_META: StateMeta = {
  code: "IL",
  name: "Illinois",
  available: true,
  tier: "deep",
  // ABE (Application for Benefits Eligibility) is Illinois' own portal —
  // SNAP, Medicaid, and cash assistance all apply through it.
  aggregator: { name: "ABE Illinois", url: "https://abe.illinois.gov/" },
};
