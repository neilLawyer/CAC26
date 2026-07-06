import type { FlagQuestion } from "@/lib/types";

// The flag registry — one entry per screening dimension. `label` feeds the
// engine's plain-language reason traces; `question` is the prompt shown by any
// form that asks the flag (wizard or deep form). Adding a dimension = one entry
// here (+ one member of the `CategoricalFlag` union in lib/types.ts) — no
// changes to the engine or any component.
//
// A flag only ever *renders* somewhere if a program's rules read it (coverage-
// driven) or a population uses it as a trigger. Dimensions nothing reads (e.g.
// unemployed, utilityHardship) stay in the catalog but don't render.
export const FLAG_QUESTIONS: FlagQuestion[] = [
  // --- population / self-identification -----------------------------------
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
  // --- income & taxes ------------------------------------------------------
  {
    flag: "filesTaxes",
    label: "you file (or plan to file) a federal tax return",
    question: "Did you file — or will you file — a federal tax return this year?",
    help: "Credits like the EITC and Child Tax Credit are paid through a tax return, even if you owe nothing.",
  },
  {
    flag: "investmentIncomeOverCap",
    label: "investment income is above the EITC cap (about $11,950 for tax year 2025)",
    question:
      "Did your household have more than about $11,950 in investment income this year (interest, dividends, capital gains)?",
    help: "The EITC has a cap on investment income — most working households are well under it.",
  },
  // --- benefits already received (adjunctive eligibility for others) --------
  {
    flag: "receivesSnap",
    label: "the household already receives SNAP",
    question: "Does your household currently receive SNAP (food stamps)?",
  },
  {
    flag: "receivesMedicaid",
    label: "the household already receives Medicaid",
    question: "Is anyone in your household currently on Medicaid?",
  },
  {
    flag: "receivesTanf",
    label: "the household already receives TANF cash assistance",
    question: "Does your household currently receive TANF cash assistance?",
  },
  {
    flag: "receivesSsi",
    label: "someone in the household already receives SSI",
    question: "Does anyone in your household currently receive SSI?",
  },
  // --- housing & energy -----------------------------------------------------
  {
    flag: "paysHomeEnergy",
    label: "the household pays home heating, cooling, or electric bills",
    question: "Does your household pay heating, cooling, or electric bills (even as part of rent)?",
  },
  {
    flag: "behindOnRent",
    label: "the household is behind on rent",
    question: "Are you behind on rent, or worried about falling behind soon?",
  },
  {
    flag: "atRiskHomelessness",
    label: "the household is at risk of losing its housing",
    question: "Are you at risk of losing your housing, or currently without stable housing?",
  },
  {
    flag: "disasterAffected",
    label: "your area was part of a federally declared disaster",
    question: "Was your area recently part of a federally declared disaster (flood, fire, storm)?",
  },
  // --- health ----------------------------------------------------------------
  {
    flag: "medicareEnrolled",
    label: "someone in the household is enrolled in Medicare",
    question: "Is anyone in your household enrolled in Medicare?",
  },
  // --- work history & military service ---------------------------------------
  {
    flag: "workedFiveOfLastTenYears",
    label: "you've worked about 5 of the last 10 years paying Social Security taxes",
    question: "Have you worked — paying Social Security taxes — for about 5 of the last 10 years?",
    help: "This is roughly the work history SSDI looks for. SSI has no work-history requirement.",
  },
  {
    flag: "servedActiveDuty",
    label: "you (or your spouse) served on active duty",
    question: "Did you (or your spouse) serve on active duty in the U.S. armed forces?",
  },
  {
    flag: "serviceConnectedCondition",
    label: "you have a condition connected to your military service",
    question: "Do you have an illness or injury that started — or got worse — during your military service?",
  },
  // --- education ---------------------------------------------------------------
  {
    flag: "planningCollege",
    label: "someone is enrolled in or planning college or career training",
    question: "Is anyone enrolled in — or planning to start — college or career training?",
  },
];

export const FLAG_QUESTION_MAP: Record<string, FlagQuestion> = Object.fromEntries(
  FLAG_QUESTIONS.map((q) => [q.flag, q])
);
