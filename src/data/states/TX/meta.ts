import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const TX_META: StateMeta = {
  code: "TX",
  name: "Texas",
  available: true,
  tier: "deep",
  // Your Texas Benefits is HHSC's own application portal — SNAP, Medicaid,
  // CHIP, TANF, and more all apply through it (a verified, official destination).
  aggregator: { name: "Your Texas Benefits", url: "https://www.yourtexasbenefits.com/" },
};
