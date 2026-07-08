import type { Program } from "@/lib/types";

export interface CategoryMeta {
  /** Matches Program.category — also the /intake/[scope] URL slug. */
  id: Program["category"];
  label: string;
  color: string;
  iconKey: string;
  /** Plain-language intro for the category's deep-dive page. */
  intro: string;
  /**
   * Honest interim pointer for categories whose real answers are LOCAL and we
   * don't carry county-level data yet: show what we do have, say so, and link
   * the official local finder. Same pattern as the state-coverage model —
   * never blank, never invented.
   */
  localPointer?: {
    finderName: string;
    finderUrl: string;
    note: string;
  };
}

// Display + deep-dive metadata for the eight program categories. Used by the
// home "One engine, every kind of help" grid and the /intake/[scope] pages.
// Icons are referenced by key (see components/ui/icons.tsx).
export const CATEGORIES: CategoryMeta[] = [
  {
    id: "food",
    label: "Food",
    color: "#34d399",
    iconKey: "food",
    intro:
      "Help buying groceries — from monthly SNAP benefits to WIC for young families, free school meals, and food banks that can help this week.",
    localPointer: {
      finderName: "Feeding America's food bank locator",
      finderUrl: "https://www.feedingamerica.org/find-your-local-foodbank",
      note: "Need food this week, not next month? Food banks don't require an application or income proof — just show up. Enter your ZIP to find the nearest one.",
    },
  },
  {
    id: "health",
    label: "Health",
    color: "#22d3ee",
    iconKey: "health",
    intro:
      "Health coverage and cost help: Medicaid, kids' coverage, marketplace subsidies, and — for Medicare enrollees — premium and prescription help many people never claim.",
    localPointer: {
      finderName: "Medicaid.gov's state agency directory",
      finderUrl: "https://www.medicaid.gov/about-us/beneficiary-resources/index.html",
      note: "Some states run 'medically needy' Medicaid for people with high medical costs, even above the usual income line — we can't calculate that one precisely yet, since the thresholds vary by state. Your state Medicaid office can tell you if it applies.",
    },
  },
  {
    id: "energy",
    label: "Energy",
    color: "#fbbf24",
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
    color: "#60a5fa",
    iconKey: "education",
    intro:
      "Free school meals, Pell Grants and FAFSA for college or training, scholarship finders, and free job-training help.",
    localPointer: {
      finderName: "studentaid.gov's state-by-state FAFSA deadlines",
      finderUrl: "https://studentaid.gov/apply-for-aid/fafsa/filling-out/state-deadlines",
      note: "The federal FAFSA deadline is generous, but many state grants have much earlier cutoffs — worth checking your state's date before you wait.",
    },
  },
  {
    id: "housing",
    label: "Housing",
    color: "#fb923c",
    iconKey: "housing",
    intro:
      "Rent help and housing programs — honestly framed: vouchers are real but waitlisted, while rental assistance and property-tax relief can move faster.",
    localPointer: {
      finderName: "HUD's official housing authority directory",
      // Verified live 2026-07-05 (docs/sources.md §3).
      finderUrl: "https://www.hud.gov/program_offices/public_indian_housing/pha/contacts",
      note: "Housing aid is run by your LOCAL housing authority, and deeper county-level data is coming to OpenDoor. Until then, this is the official directory for finding yours — it covers every county in the country.",
    },
  },
  {
    id: "tax",
    label: "Tax",
    color: "#e879f9",
    iconKey: "tax",
    intro:
      "Tax credits are the single biggest pile of unclaimed money — the EITC alone goes unclaimed by about 1 in 5 eligible workers. Filing is how you collect.",
    localPointer: {
      finderName: "IRS free tax prep locator (VITA/TCE)",
      finderUrl: "https://irs.treasury.gov/freetaxprep/",
      note: "Since these credits are claimed by filing, free IRS-certified help can prepare your return for you at no cost — even if you've never filed before. GetYourRefund.org (from Code for America) is another free option built specifically for claiming the EITC and Child Tax Credit.",
    },
  },
  {
    id: "phone-internet",
    label: "Phone & internet",
    color: "#38bdf8",
    iconKey: "phoneInternet",
    intro:
      "A monthly discount on phone or internet service — automatic if you're already on SNAP, Medicaid, or SSI.",
  },
];
