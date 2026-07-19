import type { CategoricalFlag, Household } from "@/lib/types";

// Population modules — data-defined. Each record tailors the app to a group of
// people: which questions to surface in intake, which programs to spotlight on
// results, and the copy for the home grid and the /for/[id] landing page.
// Adding a population is a data edit here — no engine or component changes.
export interface Population {
  id: string; // URL slug for /for/[id]
  label: string; // card title, e.g. "Seniors"
  tagline: string; // one-line blurb for the home grid
  iconKey: string; // key into components/ui/icons.tsx
  color: string; // accent tint for the card/spotlight
  /** Household is "in" this population if it has answered yes to ANY of these. */
  triggerFlags: CategoricalFlag[];
  /** Program ids to feature in the spotlight/landing (only current-state ones resolve). */
  highlightProgramIds: string[];
  /**
   * Every program relevant to this population's /intake/[scope] deep-dive page
   * (superset of the highlights; only ids present in the user's state resolve).
   */
  programIds: string[];
  /** Extra intake questions to surface once the population is active. */
  extraQuestions: CategoricalFlag[];
  /** Copy for the /for/[id] landing page (Phase 8). */
  landing: { headline: string; body: string };
}

export const POPULATIONS: Population[] = [
  {
    id: "seniors",
    label: "Seniors",
    tagline: "Programs built around later-in-life needs — prescriptions, cash, property tax.",
    iconKey: "seniors",
    color: "#fb7185",
    triggerFlags: ["age65Plus"],
    highlightProgramIds: [
      "nj-ssi",
      "nj-paad",
      "nj-senior-freeze",
      "ca-ssi-ssp",
      "ca-ptp",
      "tx-ssi",
      "tx-homestead",
      "fl-ssi",
      "fl-senior-homestead",
      "ny-ssi-ssp",
      "ny-enhanced-star",
      "pa-ssi-ssp",
      "pa-ptrr",
      "pa-pace",
      "il-ssi",
      "il-benefit-access",
      "il-senior-freeze",
    ],
    programIds: [
      "nj-ssi",
      "nj-paad",
      "nj-senior-freeze",
      "ca-ssi-ssp",
      "ca-ptp",
      "tx-ssi",
      "tx-homestead",
      "fl-ssi",
      "fl-senior-homestead",
      "ny-ssi-ssp",
      "ny-enhanced-star",
      "pa-ssi-ssp",
      "pa-ptrr",
      "pa-pace",
      "il-ssi",
      "il-benefit-access",
      "il-senior-freeze",
      "us-msp",
      "us-extra-help",
      "us-ssdi",
    ],
    extraQuestions: ["disabled"],
    landing: {
      headline: "OpenDoor for seniors",
      body: "If you or someone you care for is 65 or older, there are programs built specifically for this stage of life — help with prescriptions, monthly cash, and property taxes. Answer a few questions to see what may apply.",
    },
  },
  {
    id: "families",
    label: "Families",
    tagline: "New baby, school-age kids, or a tight month — support for your household.",
    iconKey: "families",
    color: "#2dd4bf",
    triggerFlags: ["pregnantOrChildUnder5", "schoolAgeChild"],
    highlightProgramIds: [
      "nj-wic",
      "nj-wfnj",
      "nj-school-meals",
      "nj-familycare",
      "ca-wic",
      "ca-calworks",
      "ca-school-meals",
      "ca-medi-cal",
      "tx-wic",
      "tx-tanf",
      "tx-medicaid-kids-chip",
      "fl-wic",
      "fl-tca",
      "fl-kidcare",
      "ny-wic",
      "ny-family-assistance",
      "ny-school-meals",
      "ny-child-health-plus",
      "pa-wic",
      "pa-tanf",
      "pa-school-meals",
      "pa-chip",
      "il-wic",
      "il-tanf",
      "il-all-kids",
    ],
    programIds: [
      "nj-wic",
      "nj-wfnj",
      "nj-school-meals",
      "nj-familycare",
      "ca-wic",
      "ca-calworks",
      "ca-school-meals",
      "ca-medi-cal",
      "tx-wic",
      "tx-tanf",
      "tx-medicaid-kids-chip",
      "tx-pregnancy-medicaid",
      "fl-wic",
      "fl-tca",
      "fl-kidcare",
      "fl-pregnancy-medicaid",
      "ny-wic",
      "ny-family-assistance",
      "ny-school-meals",
      "ny-child-health-plus",
      "pa-wic",
      "pa-tanf",
      "pa-school-meals",
      "pa-chip",
      "il-wic",
      "il-tanf",
      "il-all-kids",
      "us-ctc",
      "us-eitc",
    ],
    extraQuestions: [],
    landing: {
      headline: "OpenDoor for families",
      body: "Whether you're expecting, raising young kids, or just stretched thin this month, several programs are built to help families with food, health coverage, and cash. See what your household may qualify for.",
    },
  },
  {
    id: "veterans",
    label: "Veterans",
    tagline: "Served in the armed forces? Start with the benefits you earned.",
    iconKey: "veteran",
    color: "#818cf8",
    triggerFlags: ["veteran"],
    highlightProgramIds: ["us-va-disability", "us-va-pension", "us-gi-bill", "us-va-home-loan"],
    programIds: ["us-va-disability", "us-va-pension", "us-gi-bill", "us-va-home-loan"],
    extraQuestions: [],
    landing: {
      headline: "OpenDoor for veterans",
      body: "Veterans and their families may qualify for the same food, health, and cash programs as everyone else — plus dedicated VA benefits for healthcare, disability, education, and home loans. We point you to the official VA resources alongside your screening.",
    },
  },
  {
    id: "students",
    label: "Students",
    tagline: "In school or training? There's aid for food, health, and tuition.",
    iconKey: "education",
    color: "#a3e635",
    triggerFlags: ["student"],
    highlightProgramIds: ["us-pell", "us-scholarships"],
    programIds: ["us-pell", "us-scholarships", "us-job-training"],
    extraQuestions: [],
    landing: {
      headline: "OpenDoor for students",
      body: "Students often qualify for more than they realize — food assistance, health coverage, and education aid like Pell Grants. Answer a few questions to see what may apply while you're studying.",
    },
  },
  {
    id: "immigrants",
    label: "Immigrants",
    tagline: "Some programs are open regardless of immigration status.",
    iconKey: "globe",
    color: "#f472b6",
    triggerFlags: ["immigrant"],
    highlightProgramIds: ["ca-capi", "il-all-kids", "tx-pregnancy-medicaid"],
    // The open-regardless-of-status set: WIC, universal school meals, food banks —
    // plus CAPI (built for immigrants excluded from SSI), IL All Kids (every
    // child regardless of status), and TX CHIP Perinatal (no status requirement).
    programIds: [
      "ca-capi",
      "nj-wic",
      "ca-wic",
      "tx-wic",
      "fl-wic",
      "ny-wic",
      "pa-wic",
      "il-wic",
      "nj-school-meals",
      "ca-school-meals",
      "ny-school-meals",
      "il-all-kids",
      "tx-pregnancy-medicaid",
      "us-tefap",
    ],
    extraQuestions: [],
    landing: {
      headline: "OpenDoor for immigrants",
      body: "Eligibility can depend on immigration status, but many programs — and some built specifically for immigrants, like California's CAPI — are open to non-citizens. OpenDoor never asks for documentation and never shares your answers; every result links to the official agency to confirm.",
    },
  },
];

/** Populations the household currently falls into (answered yes to any trigger flag). */
export function activePopulations(flags: Household["flags"]): Population[] {
  return POPULATIONS.filter((p) => p.triggerFlags.some((f) => flags[f] === true));
}

/** Every flag used as a population trigger — surfaced in intake so users can self-identify. */
export const POPULATION_TRIGGER_FLAGS: CategoricalFlag[] = [
  ...new Set(POPULATIONS.flatMap((p) => p.triggerFlags)),
];
