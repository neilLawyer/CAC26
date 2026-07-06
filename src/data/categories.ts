import type { Program } from "@/lib/types";

export interface CategoryMeta {
  /** Matches Program.category — also the /intake/[scope] URL slug. */
  id: Program["category"];
  label: string;
  color: string;
  iconKey: string;
  /** Plain-language intro for the category's deep-dive page. */
  intro: string;
}

// Display + deep-dive metadata for the eight program categories. Used by the
// home "One engine, every kind of help" grid and the /intake/[scope] pages.
// Icons are referenced by key (see components/ui/icons.tsx).
export const CATEGORIES: CategoryMeta[] = [
  {
    id: "food",
    label: "Food",
    color: "#2dd4bf",
    iconKey: "food",
    intro:
      "Help buying groceries — from monthly SNAP benefits to WIC for young families, free school meals, and food banks that can help this week.",
  },
  {
    id: "health",
    label: "Health",
    color: "#22d3ee",
    iconKey: "health",
    intro:
      "Health coverage and cost help: Medicaid, kids' coverage, marketplace subsidies, and — for Medicare enrollees — premium and prescription help many people never claim.",
  },
  {
    id: "energy",
    label: "Energy",
    color: "#f97316",
    iconKey: "energy",
    intro:
      "Help with heating, cooling, and electric bills. Seasonal funding means applying early matters.",
  },
  {
    id: "cash",
    label: "Cash",
    color: "#a78bfa",
    iconKey: "cash",
    intro:
      "Monthly cash support — from TANF for families and SSI/SSDI for people with disabilities to county safety-net aid and veterans' payments.",
  },
  {
    id: "education",
    label: "Education",
    color: "#2dd4bf",
    iconKey: "education",
    intro:
      "Free school meals, Pell Grants and FAFSA for college or training, scholarship finders, and free job-training help.",
  },
  {
    id: "housing",
    label: "Housing",
    color: "#22d3ee",
    iconKey: "housing",
    intro:
      "Rent help and housing programs — honestly framed: vouchers are real but waitlisted, while rental assistance and property-tax relief can move faster.",
  },
  {
    id: "tax",
    label: "Tax",
    color: "#f97316",
    iconKey: "tax",
    intro:
      "Tax credits are the single biggest pile of unclaimed money — the EITC alone goes unclaimed by about 1 in 5 eligible workers. Filing is how you collect.",
  },
  {
    id: "phone-internet",
    label: "Phone & internet",
    color: "#a78bfa",
    iconKey: "phoneInternet",
    intro:
      "A monthly discount on phone or internet service — automatic if you're already on SNAP, Medicaid, or SSI.",
  },
];
