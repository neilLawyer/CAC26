// Core data shapes for the OpenDoor eligibility engine.
// Every household field is optional because intake is adaptive —
// "undefined" means "not answered yet," not "no."

export type CategoricalFlag =
  | "age65Plus"
  | "disabled"
  | "veteran"
  | "pregnantOrChildUnder5"
  | "schoolAgeChild"
  | "utilityHardship"
  | "student"
  | "unemployed";

export interface Household {
  state: string; // e.g. "CA"
  householdSize?: number;
  monthlyIncomeMin?: number; // lower bound of selected income range
  monthlyIncomeMax?: number; // upper bound of selected income range
  flags: Partial<Record<CategoricalFlag, boolean>>;
}

export interface CategoricalRequirement {
  type: CategoricalFlag;
}

export type IncomeBasis = "gross" | "net";
export type IncomePeriod = "monthly" | "annual";

export interface ProgramRules {
  incomeBasis: IncomeBasis;
  incomePeriod: IncomePeriod;
  /** Max household income, expressed as % of Federal Poverty Level (e.g. 130 = 130% FPL). */
  maxIncomePctFPL?: number;
  /** Min household income as % of FPL, for programs with a floor (e.g. marketplace subsidies). */
  minIncomePctFPL?: number;
  /** Flat dollar income ceiling instead of / in addition to FPL, e.g. some flat-rate programs. */
  maxIncomeFlatDollar?: number;
  /** Asset/resource limit in dollars, only some programs test this. */
  assetLimitDollar?: number;
  /** Categorical requirements (age, disability, veteran, etc). Empty array = income-only test. */
  categoricalRequirements: CategoricalRequirement[];
  /** true = must meet ALL categorical requirements; false = ANY one qualifies. */
  requireAllCategorical: boolean;
}

export interface StateMeta {
  code: string; // e.g. "NJ"
  name: string; // e.g. "New Jersey"
  available: boolean; // true = has a data pack; false = "coming soon"
}

export interface Program {
  id: string;
  name: string;
  shortName: string;
  state: string; // "CA" (state-administered) or "US" (federal, nationwide rules)
  category:
    | "food"
    | "health"
    | "energy"
    | "cash"
    | "education"
    | "housing"
    | "tax"
    | "phone-internet";
  summary: string; // plain language, ~6th grade reading level
  agencyName: string;
  applyUrl: string;
  sourceUrl: string;
  lastVerified: string; // ISO date the rule data was last checked against the source
  rules: ProgramRules;
  estimatedAnnualValueMin?: number;
  estimatedAnnualValueMax?: number;
  estimatedTimeToBenefitWeeksMin?: number;
  estimatedTimeToBenefitWeeksMax?: number;
  cascadeHints?: string[]; // ids of programs commonly also worth checking
}

export type Confidence = "likely" | "possible" | "needsInfo" | "unlikely";

export interface EligibilityResult {
  program: Program;
  confidence: Confidence;
  reasons: string[]; // plain-language reason trace
  counterfactual?: string; // what would change the outcome, for near misses
}
