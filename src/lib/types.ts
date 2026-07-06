// Core data shapes for the OpenDoor eligibility engine.
// Every household field is optional because intake is adaptive —
// "undefined" means "not answered yet," not "no."

export type CategoricalFlag =
  // population / self-identification
  | "age65Plus"
  | "disabled"
  | "veteran"
  | "pregnantOrChildUnder5"
  | "schoolAgeChild"
  | "utilityHardship"
  | "student"
  | "unemployed"
  | "immigrant"
  // income & taxes (earned income derives from employmentStatus, not a flag)
  | "filesTaxes"
  | "investmentIncomeOverCap"
  // benefits already received (adjunctive/categorical eligibility for others)
  | "receivesSnap"
  | "receivesMedicaid"
  | "receivesTanf"
  | "receivesSsi"
  // housing & energy
  | "paysHomeEnergy"
  | "behindOnRent"
  | "atRiskHomelessness"
  | "disasterAffected"
  // health
  | "medicareEnrolled"
  // work history & service
  | "workedFiveOfLastTenYears"
  | "servedActiveDuty"
  | "serviceConnectedCondition"
  // education
  | "planningCollege";

/** Single-choice household fields set by "select"-style questions. */
export type EmploymentStatus = "working" | "selfEmployed" | "unemployed" | "retired" | "unableToWork";
export type HousingTenure = "own" | "rent" | "other";
export type FilingStatus = "single" | "joint" | "headOfHousehold";

export interface Household {
  state: string; // e.g. "CA"
  householdSize?: number;
  monthlyIncomeMin?: number; // lower bound of selected income range
  monthlyIncomeMax?: number; // upper bound of selected income range
  liquidAssetsMin?: number; // lower bound of selected savings/resources range
  liquidAssetsMax?: number; // upper bound of selected savings/resources range
  kidsUnder17Count?: number; // qualifying children for CTC/EITC-style tiered credits
  employmentStatus?: EmploymentStatus;
  housingTenure?: HousingTenure;
  filingStatus?: FilingStatus;
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
  /**
   * Adjunctive/categorical eligibility: if the household already receives ANY of these
   * (e.g. WIC auto-income-qualifies via SNAP/Medicaid/TANF; Lifeline via SNAP/Medicaid/SSI),
   * the income test is waived entirely. Can only ADD matches, never remove them.
   */
  incomeWaivedByFlags?: CategoricalFlag[];
  /**
   * Hard disqualifiers, e.g. EITC's investment-income cap. Any of these flags being true
   * fails the program. Must never reference a sensitive/optional flag — optional questions
   * may only add matches.
   */
  disqualifyingFlags?: CategoricalFlag[];
  /**
   * Requirements on single-choice household fields, e.g. Senior Freeze requires
   * housingTenure === "own"; ERA requires housingTenure === "rent"; SBA paths require
   * employmentStatus === "selfEmployed". Unanswered → unknown (needsInfo), never fail.
   */
  fieldRequirements?: FieldRequirement[];
  /**
   * Annual income ceilings that scale with the number of qualifying children
   * (federal/state EITC, CTC). The engine picks the highest tier whose `atLeastKids`
   * the household meets; `maxAnnualJoint` applies when filingStatus === "joint".
   * If kid count is unanswered, the income test is unknown (needsInfo), never fail.
   */
  kidCountIncomeTiers?: KidCountIncomeTier[];
  /** Requires at least one qualifying child under 17 (CTC). Unanswered → unknown, never fail. */
  requireKidsUnder17?: boolean;
}

export interface FieldRequirement {
  field: "employmentStatus" | "housingTenure" | "filingStatus";
  /** The answer must be one of these values (e.g. EITC: employmentStatus in [working, selfEmployed]). */
  oneOf: string[];
  /** Plain-language label for reason traces, e.g. "you own your home". */
  label: string;
}

export interface KidCountIncomeTier {
  atLeastKids: number;
  maxAnnualSingle: number;
  maxAnnualJoint?: number;
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
  /**
   * Ceiling on the confidence we'll ever show. For programs where qualifying is decided
   * by a formula, rating, or lottery we can't model (Pell's SAI, VA disability ratings,
   * Section 8 waitlists, capped funds), "likely" would overpromise — cap at "possible".
   */
  confidenceCap?: "possible";
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

// ---------------------------------------------------------------------------
// Screening questions — the coverage-driven form layer.
// Every question is DATA: the DeepForm generator renders any scope's form from
// these records with zero scope-specific branching. A question exists only
// because some program's rules read the answer (coverage-driven), and the
// sensitive ones are optional and may only ADD matches.
// ---------------------------------------------------------------------------

/** Where a question can appear: the general intake, a category page, or a persona page. */
export type QuestionScope =
  | "general"
  | Program["category"]
  | "seniors"
  | "families"
  | "veterans"
  | "students"
  | "immigrants";

/** What answering the question writes into the household. */
export type QuestionInput =
  | { kind: "flag"; flag: CategoricalFlag } // Yes / No / Skip
  | {
      kind: "flagGroup"; // multi-select chips, each toggling one flag
      options: { flag: CategoricalFlag; label: string }[];
      noneLabel?: string; // explicit "none of these" choice → sets all listed flags false
    }
  | {
      kind: "select"; // single choice writing one household field
      field: FieldRequirement["field"];
      options: { value: string; label: string }[];
    }
  | { kind: "count"; field: "kidsUnder17Count" | "householdSize"; min: number; max: number }
  | {
      kind: "bucket"; // range choice writing a min/max pair
      minField: "monthlyIncomeMin" | "liquidAssetsMin";
      maxField: "monthlyIncomeMax" | "liquidAssetsMax";
    };

export type QuestionCondition =
  | { flag: CategoricalFlag; equals: boolean }
  | { field: FieldRequirement["field"] | "kidsUnder17Count"; answered: true };

export interface ScreeningQuestion {
  id: string; // stable, e.g. "general.employment", "housing.behind-on-rent"
  scope: QuestionScope;
  order: number;
  /** Prompt shown to the user. For kind:"flag" this may be omitted to reuse the flag registry's question. */
  prompt?: string;
  help?: string;
  /**
   * Present = optional/sensitive. Rendered under "Optional — answering can only unlock
   * more options", individually skippable, with this one-line "why we ask".
   */
  optional?: { whyWeAsk: string };
  /** ALL conditions must hold for the question to render. */
  showIf?: QuestionCondition[];
  input: QuestionInput;
}
