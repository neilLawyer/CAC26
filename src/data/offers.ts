import type { OfferRule } from "@/lib/types";

// Adaptive branching rules — pure data, no components.
//
// After the general intake, each rule below is checked against the household.
// ALL conditions in `when` must hold for the offer to surface; `weight` is
// just the BASE priority score — the runtime ranker adds signals on top
// (e.g. how much the destination scope's results can still move, how many
// of its questions are still unanswered) before deciding what to show and in
// what order. A new life situation the household tells us about should
// become a new rule here, never a new component or scope-specific branch.
export const OFFER_RULES: OfferRule[] = [
  {
    id: "disability-health",
    scope: "health",
    when: [{ flag: "disabled", equals: true }],
    reason:
      "You told us someone has a disability — a few health questions can unlock SSI, SSDI, and Medicaid pathways.",
    weight: 30,
  },
  {
    id: "senior",
    scope: "seniors",
    when: [{ flag: "age65Plus", equals: true }],
    reason:
      "You told us someone in your household is 65 or older — a few more questions can surface senior-specific benefits built just for that.",
    weight: 30,
  },
  {
    id: "renter-pressure",
    scope: "housing",
    when: [{ field: "housingTenure", equals: "rent" }],
    reason:
      "You told us you rent — we can pull real local rent data and show affordable properties near your address.",
    weight: 22,
  },
  {
    id: "renter-crisis",
    scope: "housing",
    when: [{ flag: "behindOnRent", equals: true }],
    reason:
      "You told us you're behind on rent — this is urgent, and a few housing questions can connect you to rental assistance right away.",
    weight: 40,
  },
  {
    id: "kids",
    scope: "families",
    when: [{ flag: "schoolAgeChild", equals: true }],
    reason:
      "You told us you have a school-age child — a few more questions can surface family benefits built around that.",
    weight: 26,
  },
  {
    id: "young-kids",
    scope: "families",
    when: [{ flag: "pregnantOrChildUnder5", equals: true }],
    reason:
      "You told us someone is pregnant or has a child under 5 — a few more questions can check your eligibility for WIC and similar early-childhood support.",
    weight: 28,
  },
  {
    id: "student",
    scope: "education",
    when: [{ flag: "student", equals: true }],
    reason:
      "You told us someone is a student — a few more questions can check your eligibility for Pell Grants and other education aid.",
    weight: 24,
  },
  {
    id: "planning-college",
    scope: "education",
    when: [{ flag: "planningCollege", equals: true }],
    reason:
      "You told us someone is planning to start college or training soon — a few more questions can help you plan ahead for aid.",
    weight: 20,
  },
  {
    id: "unemployed",
    scope: "cash",
    when: [{ field: "employmentStatus", equals: "unemployed" }],
    reason:
      "You told us you're unemployed and looking — a few more questions can check your eligibility for cash aid and free job training.",
    weight: 26,
  },
  {
    id: "veteran",
    scope: "veterans",
    when: [{ flag: "veteran", equals: true }],
    reason:
      "You told us someone served in the military — a few more questions can surface VA benefits earned through that service.",
    weight: 28,
  },
  {
    id: "immigrant",
    scope: "immigrants",
    when: [{ flag: "immigrant", equals: true }],
    reason:
      "You told us someone in your household is an immigrant — a few more questions can point you to programs open regardless of status.",
    weight: 22,
  },
  {
    id: "medicare",
    scope: "health",
    when: [{ flag: "medicareEnrolled", equals: true }],
    reason:
      "You told us someone is enrolled in Medicare — a few more questions can check for premium and prescription help many enrollees never claim.",
    weight: 24,
  },
  {
    id: "tax-filer",
    scope: "tax",
    when: [{ flag: "filesTaxes", equals: true }],
    reason:
      "You told us you file taxes — a few more questions can check your eligibility for the EITC, which goes unclaimed by about 1 in 5 people who qualify.",
    weight: 18,
  },
  {
    id: "homeowner-senior",
    scope: "housing",
    when: [
      { field: "housingTenure", equals: "own" },
      { flag: "age65Plus", equals: true },
    ],
    reason:
      "You told us you own your home and someone is 65 or older — a few more questions can check your eligibility for property-tax relief.",
    weight: 24,
  },
];
