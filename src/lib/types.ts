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
  | "unemployed"
  | "immigrant";

export interface Household {
  state: string; // e.g. "CA"
  householdSize?: number;
  monthlyIncomeMin?: number; // lower bound of selected income range
  monthlyIncomeMax?: number; // upper bound of selected income range
  liquidAssetsMin?: number; // lower bound of selected savings/resources range
  liquidAssetsMax?: number; // upper bound of selected savings/resources range
  flags: Partial<Record<CategoricalFlag, boolean>>;
}

export interface CategoricalRequirement {
  type: CategoricalFlag;
}

/**
 * One screening dimension, defined once as data. `label` feeds the engine's
 * plain-language reason traces; `question` is the intake prompt; `help` is an
 * optional "why we ask" note. Adding a dimension = one entry in
 * `src/data/questions.ts` (+ one member of `CategoricalFlag` above).
 */
export interface FlagQuestion {
  flag: CategoricalFlag;
  label: string;
  question: string;
  help?: string;
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
  /**
   * Some programs (WFNJ/TANF, LIHEAP, CalWORKs) don't use a % of FPL at all — they publish a
   * fixed monthly dollar ceiling per household size (often SMI-based or a frozen needs table).
   * Keyed by household size 1-8; sizes beyond the table extend via `sizeTableExtraPerPerson`.
   */
  maxIncomeSizeTable?: Record<number, number>;
  /** Dollar amount to add per person beyond the largest size in `maxIncomeSizeTable`. */
  sizeTableExtraPerPerson?: number;
  /**
   * Some programs have a materially higher ceiling for a subpopulation (e.g. NJ FamilyCare/Medi-Cal
   * cover kids and pregnant applicants at a much higher % of FPL than childless adults; EITC-style
   * credits scale up with qualifying children). If the household has ANY flag in
   * `raisedIncomeLimitFlags`, use `raisedMaxIncomePctFPL` / `raisedMaxIncomeFlatDollar` in place of
   * the base ceiling above, instead of screening them out at the adult/childless rate.
   */
  raisedIncomeLimitFlags?: CategoricalFlag[];
  raisedMaxIncomePctFPL?: number;
  raisedMaxIncomeFlatDollar?: number;
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
