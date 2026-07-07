import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const NJ_META: StateMeta = {
  code: "NJ",
  name: "New Jersey",
  available: true,
  tier: "deep",
  // NJHelps is NJ DHS's own screening/application portal (already the
  // applyUrl for several NJ programs — a verified, official destination).
  aggregator: { name: "NJHelps", url: "https://njhelps.org/" },
};
