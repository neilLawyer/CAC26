import type { Confidence } from "@/lib/types";

// Presentation for each confidence level, shared by the result cards and the
// grouped section headers.
export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  likely: "Likely eligible",
  possible: "Possibly eligible",
  needsInfo: "Need more info",
  unlikely: "Not likely",
};

export const CONFIDENCE_COLOR: Record<Confidence, string> = {
  likely: "#2dd4bf",
  possible: "#f9d34c",
  needsInfo: "#8b9bb0",
  unlikely: "#f87171",
};

// Order the result groups are shown in, best first.
export const CONFIDENCE_ORDER: Confidence[] = ["likely", "possible", "needsInfo", "unlikely"];
