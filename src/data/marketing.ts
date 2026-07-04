// Home-page marketing content, kept as data. Icons are referenced by key
// (see components/ui/icons.tsx). The "Built for real people" section is now
// driven by src/data/populations.ts (see components/marketing/PopulationGrid).

export interface AccessibilityItem {
  title: string;
  body: string;
  iconKey: string;
}

export const ACCESSIBILITY_ITEMS: AccessibilityItem[] = [
  {
    title: "Plain language",
    body: "Every program is explained around a 6th-grade reading level — no agency jargon.",
    iconKey: "plainLanguage",
  },
  {
    title: "Screen-reader friendly",
    body: "Semantic HTML, labeled controls, and visible keyboard focus throughout.",
    iconKey: "screenReader",
  },
  {
    title: "Full keyboard navigation",
    body: "Every question, button, and result is reachable and operable without a mouse.",
    iconKey: "keyboard",
  },
  {
    title: "Light or dark, your call",
    body: "Toggle the theme from the top nav — your choice is remembered on this device.",
    iconKey: "theme",
  },
];

export interface HowItWorksStep {
  n: string;
  title: string;
  body: string;
}

export const STEPS: HowItWorksStep[] = [
  {
    n: "1",
    title: "Answer a few questions",
    body: "Household size, an income range, and a couple yes/no questions. We only ask what still matters.",
  },
  {
    n: "2",
    title: "See what you may qualify for",
    body: "Plain-language results with a confidence label and the reason behind every answer.",
  },
  {
    n: "3",
    title: "Apply with the real agency",
    body: "Every result links straight to the official application — OpenDoor never decides, they do.",
  },
];
