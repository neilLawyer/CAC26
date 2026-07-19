import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const PA_META: StateMeta = {
  code: "PA",
  name: "Pennsylvania",
  available: true,
  tier: "deep",
  // COMPASS is PA DHS's own screening/application portal — SNAP, Medical
  // Assistance, CHIP, TANF, and LIHEAP all apply through it.
  aggregator: { name: "COMPASS", url: "https://www.compass.state.pa.us/" },
};
