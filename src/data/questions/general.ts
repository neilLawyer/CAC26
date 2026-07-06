import type { ScreeningQuestion } from "@/lib/types";

// The general (Track A) question catalog. These are the questions every scope
// can draw on: a deep-dive form automatically pulls in any general question
// whose answer its programs still need (see lib/question-engine.ts), so no
// category ever has to send the user back to the general intake.
//
// Questions marked `optional` are the sensitive ones — they may only ADD
// matches, are individually skippable, and carry a one-line "why we ask".
export const GENERAL_QUESTIONS: ScreeningQuestion[] = [
  {
    id: "general.size",
    scope: "general",
    order: 10,
    prompt: "How many people are in your household?",
    input: { kind: "count", field: "householdSize", min: 1, max: 8 },
  },
  {
    id: "general.income",
    scope: "general",
    order: 20,
    prompt: "About how much does your household bring in before taxes, per month?",
    help: "A range is fine — exact numbers aren't needed.",
    input: { kind: "bucket", minField: "monthlyIncomeMin", maxField: "monthlyIncomeMax" },
  },
  {
    id: "general.assets",
    scope: "general",
    order: 30,
    prompt: "About how much does your household have in savings and other resources?",
    help: "Think checking, savings, and cash — a home and usually one car don't count.",
    input: { kind: "bucket", minField: "liquidAssetsMin", maxField: "liquidAssetsMax" },
  },
  {
    id: "general.kids-under-17",
    scope: "general",
    order: 40,
    prompt: "How many children under 17 live with you?",
    help: "Tax credits like the Child Tax Credit and EITC scale with this number. 0 is a fine answer.",
    input: { kind: "count", field: "kidsUnder17Count", min: 0, max: 8 },
  },
  {
    id: "general.employment",
    scope: "general",
    order: 50,
    prompt: "Which best describes your work situation right now?",
    input: {
      kind: "select",
      field: "employmentStatus",
      options: [
        { value: "working", label: "Working (full or part time)" },
        { value: "selfEmployed", label: "Self-employed" },
        { value: "unemployed", label: "Unemployed and looking" },
        { value: "retired", label: "Retired" },
        { value: "unableToWork", label: "Unable to work right now" },
      ],
    },
  },
  {
    id: "general.tenure",
    scope: "general",
    order: 60,
    prompt: "Do you own or rent your home?",
    input: {
      kind: "select",
      field: "housingTenure",
      options: [
        { value: "own", label: "Own" },
        { value: "rent", label: "Rent" },
        { value: "other", label: "Other (staying with family, shelter, …)" },
      ],
    },
  },
  {
    id: "general.files-taxes",
    scope: "general",
    order: 70,
    input: { kind: "flag", flag: "filesTaxes" },
  },
  {
    id: "general.filing-status",
    scope: "general",
    order: 80,
    prompt: "How do you file?",
    showIf: [{ flag: "filesTaxes", equals: true }],
    input: {
      kind: "select",
      field: "filingStatus",
      options: [
        { value: "single", label: "Single" },
        { value: "joint", label: "Married, filing together" },
        { value: "headOfHousehold", label: "Head of household" },
      ],
    },
  },
  {
    id: "general.school-age-child",
    scope: "general",
    order: 90,
    input: { kind: "flag", flag: "schoolAgeChild" },
  },
  {
    id: "general.benefits-received",
    scope: "general",
    order: 100,
    prompt: "Does your household already receive any of these?",
    help: "Already receiving one program often auto-qualifies you for others — this can only add matches.",
    input: {
      kind: "flagGroup",
      options: [
        { flag: "receivesSnap", label: "SNAP (food stamps)" },
        { flag: "receivesMedicaid", label: "Medicaid" },
        { flag: "receivesTanf", label: "TANF cash assistance" },
        { flag: "receivesSsi", label: "SSI" },
      ],
      noneLabel: "None of these",
    },
  },
  // --- optional / sensitive self-identification ----------------------------
  {
    id: "general.pregnant-or-under-5",
    scope: "general",
    order: 110,
    optional: {
      whyWeAsk:
        "Programs like WIC and pregnancy Medicaid are built for exactly this — answering can only add matches.",
    },
    input: { kind: "flag", flag: "pregnantOrChildUnder5" },
  },
  {
    id: "general.age65",
    scope: "general",
    order: 120,
    optional: {
      whyWeAsk: "Several programs (SSI, prescription help, property-tax relief) are built for 65+.",
    },
    input: { kind: "flag", flag: "age65Plus" },
  },
  {
    id: "general.disabled",
    scope: "general",
    order: 130,
    optional: {
      whyWeAsk: "Disability opens dedicated pathways like SSI, SSDI, and Medicaid — it never closes any.",
    },
    input: { kind: "flag", flag: "disabled" },
  },
  {
    id: "general.veteran",
    scope: "general",
    order: 140,
    optional: {
      whyWeAsk: "Veterans and their families may qualify for VA benefits on top of everything else.",
    },
    input: { kind: "flag", flag: "veteran" },
  },
  {
    id: "general.student",
    scope: "general",
    order: 150,
    optional: {
      whyWeAsk: "Students often qualify for education aid like Pell Grants — answering only adds options.",
    },
    input: { kind: "flag", flag: "student" },
  },
  {
    id: "general.immigrant",
    scope: "general",
    order: 160,
    optional: {
      whyWeAsk:
        "Some programs are open regardless of status, and a few are built specifically for immigrants. We never ask for documents and never share answers.",
    },
    input: { kind: "flag", flag: "immigrant" },
  },
];
