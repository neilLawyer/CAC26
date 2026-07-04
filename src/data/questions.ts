import type { FlagQuestion } from "@/lib/types";

// The intake question catalog — the single source of truth for every screening
// dimension. The engine reads `label` for its reason traces; the intake wizard
// reads `question` (and, later, `help`). Adding a dimension means adding one
// entry here (+ one member of the `CategoricalFlag` union in lib/types.ts) —
// no changes to the engine or the wizard.
//
// The wizard shows a question when a not-yet-ruled-out program requires that
// flag, or when it's a population trigger / active-population extra question
// (see src/data/populations.ts). Dimensions that are neither (e.g. unemployed,
// utilityHardship) stay in the catalog but simply don't render yet.
export const FLAG_QUESTIONS: FlagQuestion[] = [
  {
    flag: "age65Plus",
    label: "someone in the household is 65 or older",
    question: "Is anyone in your household 65 or older?",
  },
  {
    flag: "disabled",
    label: "someone in the household has a disability",
    question: "Does anyone in your household have a disability?",
  },
  {
    flag: "veteran",
    label: "someone in the household is a veteran",
    question: "Is anyone in your household a veteran?",
  },
  {
    flag: "pregnantOrChildUnder5",
    label: "someone is pregnant or there's a child under 5",
    question: "Is anyone pregnant, or is there a child under 5?",
  },
  {
    flag: "schoolAgeChild",
    label: "there's a school-age child in the household",
    question: "Is there a school-age child in the household?",
  },
  {
    flag: "utilityHardship",
    label: "the household is behind on utility bills",
    question: "Is the household behind on utility bills?",
  },
  {
    flag: "student",
    label: "someone in the household is a student",
    question: "Is anyone in your household a student?",
  },
  {
    flag: "unemployed",
    label: "someone in the household is unemployed",
    question: "Is anyone in your household unemployed?",
  },
  {
    flag: "immigrant",
    label: "someone in the household is an immigrant or non-citizen",
    question: "Is anyone in your household an immigrant or non-citizen?",
  },
];

export interface IncomeBucket {
  label: string;
  min: number;
  max: number;
}

// Income entered as ranges, not exact numbers (fewer errors, less drop-off).
export const INCOME_BUCKETS: IncomeBucket[] = [
  { label: "Under $1,000/mo", min: 0, max: 1000 },
  { label: "$1,000 – $1,500/mo", min: 1000, max: 1500 },
  { label: "$1,500 – $2,000/mo", min: 1500, max: 2000 },
  { label: "$2,000 – $2,500/mo", min: 2000, max: 2500 },
  { label: "$2,500 – $3,000/mo", min: 2500, max: 3000 },
  { label: "$3,000 – $4,000/mo", min: 3000, max: 4000 },
  { label: "$4,000 – $5,000/mo", min: 4000, max: 5000 },
  { label: "$5,000 – $7,000/mo", min: 5000, max: 7000 },
  { label: "$7,000+/mo", min: 7000, max: 999999 },
];

// The intake wizard's step order and their short labels.
export const STEP_LABELS = ["State", "Household", "Income", "A few more things", "Review"];

// The "why we ask this" note shown in the intake sidebar, keyed by step id.
export const STEP_NOTES: Record<string, string> = {
  state:
    "Program rules — income limits, age requirements — are set state by state, so we start here to tailor every question after this.",
  size: "Household size changes the income limit for almost every program. A family of four qualifies at a higher income than someone living alone.",
  income:
    "Most programs use a percentage of the federal poverty level based on household size. A range is all we need — nothing exact.",
  flags:
    "Some programs, like PAAD or Senior Freeze, are restricted to specific groups. We only ask about the ones that could still apply to you.",
  review:
    "That's everything we need. Your answers stay in this browser and are never sent anywhere.",
};
