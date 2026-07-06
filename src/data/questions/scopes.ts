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
  {
    id: "health.other-coverage",
    scope: "health",
    order: 20,
    input: { kind: "flag", flag: "hasOtherHealthCoverage" },
  },
  {
    id: "health.chronic-condition",
    scope: "health",
    order: 90,
    optional: {
      whyWeAsk:
        "This can point you toward pathways some states offer for high medical costs — it never counts against you.",
    },
    input: { kind: "flag", flag: "chronicCondition" },
  },
  // --- housing -----------------------------------------------------------------
  {
    id: "housing.zip",
    scope: "housing",
    order: 5,
    prompt: "What ZIP code do you live in?",
    help: "Housing help is run by LOCAL housing authorities, so where you live matters more here than anywhere else. Your ZIP stays in this browser — we only use it to point you at the right local office.",
    input: { kind: "zip" },
  },
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
    prompt: "Is anyone planning to start college or career training — not enrolled yet?",
    help: "This is separate from already being a student — answer yes here if you're still planning ahead.",
    input: { kind: "flag", flag: "planningCollege" },
  },
  // --- personas ----------------------------------------------------------------------------
  {
    id: "immigrants.status",
    scope: "immigrants",
    order: 10,
    prompt: "Is anyone in your household an immigrant or non-citizen?",
    optional: {
      whyWeAsk:
        "Several programs on this page — WIC, school meals, food banks — are open no matter what you answer here. A few, like California's CAPI, exist specifically for people this question describes. We never ask for documents and never share your answer.",
    },
    input: { kind: "flag", flag: "immigrant" },
  },
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
    id: "veterans.discharge",
    scope: "veterans",
    order: 15,
    input: { kind: "flag", flag: "otherThanDishonorableDischarge" },
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
