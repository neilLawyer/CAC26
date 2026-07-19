import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const FL_META: StateMeta = {
  code: "FL",
  name: "Florida",
  available: true,
  tier: "deep",
  // MyACCESS is Florida DCF's own application portal — SNAP, Medicaid, and
  // cash assistance all apply through it (a verified, official destination).
  aggregator: { name: "MyACCESS Florida", url: "https://myaccess.myflfamilies.com/" },
};
