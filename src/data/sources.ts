import type { Confidence } from "@/lib/types";

// Distilled from docs/sources.md — the official, open data the eligibility rules
// are paraphrased from. Powers the "How it works" page. Keep links to primary
// .gov sources; paraphrase rules in plain language (never copy official text).

export interface MethodologyPrinciple {
  title: string;
  body: string;
}

export const METHODOLOGY: MethodologyPrinciple[] = [
  {
    title: "Official sources first",
    body: "Rules come from federal and state government data — SNAP and WIC from the USDA, Medicaid from CMS, poverty guidelines from HHS. We prefer published APIs and datasets over anything second-hand.",
  },
  {
    title: "Paraphrased, not copied",
    body: "Program rules are restated in plain language around a 6th-grade reading level. We don't reproduce official rule text word-for-word, and we link to the real rules for the details.",
  },
  {
    title: "An estimate, never a decision",
    body: "OpenDoor is informational only. Every result says you may qualify and links to the official application — the agency makes the actual determination, not us.",
  },
  {
    title: "Freshness you can see",
    body: "Every program carries a last-checked date. When a figure is stamped, you can see how current it is and follow the source link to verify.",
  },
  {
    title: "Private by default",
    body: "Screening runs in your browser. Your answers are kept in local storage on your device — never sent to a server, stored, sold, or shared.",
  },
];

export const CONFIDENCE_NOTES: Record<Confidence, string> = {
  likely: "Your answers meet the program's main rules. Still worth confirming with the agency.",
  possible: "You're close on income, or we're missing a detail — worth applying or asking.",
  needsInfo: "We need another answer before we can say. Finishing the questions will settle it.",
  unlikely: "Based on what you told us, this one probably isn't a fit right now.",
};

export interface SourceGroup {
  category: string;
  sources: { name: string; url: string; note: string }[];
}

export const SOURCE_GROUPS: SourceGroup[] = [
  {
    category: "Foundations (the math behind income limits)",
    sources: [
      {
        name: "HHS Federal Poverty Guidelines",
        url: "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines",
        note: "The annual poverty numbers almost every income cutoff is based on.",
      },
      {
        name: "HUD Income Limits (Area Median Income)",
        url: "https://www.huduser.gov/portal/datasets/il.html",
        note: "AMI limits by county and household size — the basis for housing and utility math.",
      },
      {
        name: "U.S. Census Bureau API",
        url: "https://www.census.gov/data/developers/data-sets.html",
        note: "Income, poverty, and household data by area.",
      },
    ],
  },
  {
    category: "Food",
    sources: [
      {
        name: "SNAP — USDA Food & Nutrition Service",
        url: "https://www.fns.usda.gov/snap/recipient/eligibility",
        note: "Official income and household rules for food benefits.",
      },
      {
        name: "WIC — USDA",
        url: "https://www.fns.usda.gov/wic",
        note: "Nutrition help for pregnant people, new parents, and kids under 5.",
      },
      {
        name: "National School Lunch Program",
        url: "https://www.fns.usda.gov/nslp",
        note: "Free/reduced-price school meal eligibility thresholds.",
      },
    ],
  },
  {
    category: "Health",
    sources: [
      {
        name: "Medicaid",
        url: "https://www.medicaid.gov",
        note: "Income-based coverage; rules vary by state expansion status.",
      },
      {
        name: "CHIP",
        url: "https://www.medicaid.gov/chip",
        note: "Coverage for kids in families earning too much for Medicaid.",
      },
      {
        name: "Healthcare.gov",
        url: "https://www.healthcare.gov",
        note: "ACA Marketplace plans and premium subsidies.",
      },
    ],
  },
  {
    category: "Cash & disability",
    sources: [
      {
        name: "SSI — Social Security Administration",
        url: "https://www.ssa.gov/ssi",
        note: "Cash aid for people who are 65+, blind, or disabled with limited income.",
      },
      {
        name: "TANF — HHS Office of Family Assistance",
        url: "https://www.acf.hhs.gov/ofa/programs/temporary-assistance-needy-families-tanf",
        note: "Time-limited cash assistance for families with children.",
      },
    ],
  },
  {
    category: "Energy & utilities",
    sources: [
      {
        name: "LIHEAP — HHS",
        url: "https://www.acf.hhs.gov/ocs/programs/liheap",
        note: "Home heating and cooling assistance, run through states.",
      },
      {
        name: "Lifeline — FCC",
        url: "https://www.lifelinesupport.org",
        note: "Monthly discount on phone or internet for low-income households.",
      },
    ],
  },
  {
    category: "Tax credits & education",
    sources: [
      {
        name: "Earned Income Tax Credit — IRS",
        url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
        note: "Refundable credit for lower-income workers — often unclaimed.",
      },
      {
        name: "Federal Pell Grant — Federal Student Aid",
        url: "https://studentaid.gov/understand-aid/types/grants/pell",
        note: "Need-based grant for college, determined by the FAFSA.",
      },
    ],
  },
];
