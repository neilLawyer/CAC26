import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const CA_META: StateMeta = {
  code: "CA",
  name: "California",
  available: true,
};
