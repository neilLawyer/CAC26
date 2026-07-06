import type { ScreeningQuestion } from "@/lib/types";

// Scope-specific refinement questions. Most of a deep-dive form is assembled
// automatically (general questions whose answers the scope's programs still
// need — see lib/question-engine.ts); the entries here are the questions that
// only make sense inside their scope. Categories with no entry are fully
// covered by pulled general questions — that's the coverage system working,
// not an omission.
export const SCOPE_QUESTIONS: ScreeningQuestion[] = [
  // --- energy ---------------------------------------------------------------
  {
    id: "energy.pays-home-energy",
    scope: "energy",
    order: 10,
    input: { kind: "flag", flag: "paysHomeEnergy" },
  },
  // --- health ----------------------------------------------------------------
  {
    id: "health.medicare",
    scope: "health",
    order: 10,
    help: "Medicare enrollees with lower income can get help with premiums (Medicare Savings Programs) and drug costs (Extra Help).",
    input: { kind: "flag", flag: "medicareEnrolled" },
  },
  // --- housing -----------------------------------------------------------------
  {
    id: "housing.behind-on-rent",
    scope: "housing",
    order: 10,
    input: { kind: "flag", flag: "behindOnRent" },
  },
  {
    id: "housing.at-risk",
    scope: "housing",
    order: 20,
    input: { kind: "flag", flag: "atRiskHomelessness" },
  },
  {
    id: "housing.disaster",
    scope: "housing",
    order: 30,
    input: { kind: "flag", flag: "disasterAffected" },
  },
  // --- tax ------------------------------------------------------------------------
  {
    id: "tax.investment-cap",
    scope: "tax",
    order: 10,
    input: { kind: "flag", flag: "investmentIncomeOverCap" },
  },
  // --- cash --------------------------------------------------------------------------
  {
    id: "cash.work-history",
    scope: "cash",
    order: 10,
    showIf: [{ flag: "disabled", equals: true }],
    input: { kind: "flag", flag: "workedFiveOfLastTenYears" },
  },
  // --- education ------------------------------------------------------------------------
  {
    id: "education.planning-college",
    scope: "education",
    order: 10,
    input: { kind: "flag", flag: "planningCollege" },
  },
  // --- personas ----------------------------------------------------------------------------
  {
    id: "veterans.served",
    scope: "veterans",
    order: 10,
    optional: {
      whyWeAsk: "Active-duty service is what unlocks VA healthcare, disability, education, and home-loan benefits.",
    },
    input: { kind: "flag", flag: "servedActiveDuty" },
  },
  {
    id: "veterans.service-connected",
    scope: "veterans",
    order: 20,
    optional: {
      whyWeAsk: "A service-connected condition is the basis for VA disability compensation — answering only adds options.",
    },
    input: { kind: "flag", flag: "serviceConnectedCondition" },
  },
];
