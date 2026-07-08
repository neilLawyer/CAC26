import type { Program } from "@/lib/types";

// "Documents to bring" — generic, universally-true items keyed by program
// category, deduplicated across everything the household matched. Deliberate
// honesty constraint: these are the documents agencies COMMONLY ask for; the
// packet says in print that the agency confirms the exact list. Nothing here
// claims a specific agency's requirements. Tax programs point at the
// IRS-mirrored checklist on /tax-guide instead of duplicating it.

export interface DocumentItem {
  id: string;
  label: string;
  detail?: string;
  categories: Program["category"][];
}

export const DOCUMENT_ITEMS: DocumentItem[] = [
  {
    id: "photo-id",
    label: "Photo ID for the person applying",
    detail: "Driver's license, state ID, or passport.",
    categories: ["food", "health", "energy", "cash", "housing", "education", "phone-internet"],
  },
  {
    id: "identity-household",
    label: "Identity documents for household members",
    detail: "Birth certificates or IDs for people on the application, including children.",
    categories: ["food", "health", "cash", "housing"],
  },
  {
    id: "ssn",
    label: "Social Security numbers (where you have them)",
    detail:
      "Cards or numbers for household members. Many programs can still help some members without one — ask instead of skipping the application.",
    categories: ["food", "health", "cash", "housing", "phone-internet"],
  },
  {
    id: "proof-address",
    label: "Proof of where you live",
    detail: "A lease, a utility bill, or mail with your name and address.",
    categories: ["food", "health", "energy", "cash", "housing", "phone-internet"],
  },
  {
    id: "proof-income",
    label: "Proof of income",
    detail:
      "Recent pay stubs (about the last 30 days), or award letters for benefits like Social Security or unemployment.",
    categories: ["food", "health", "energy", "cash", "housing", "education", "phone-internet"],
  },
  {
    id: "expenses",
    label: "Proof of big monthly expenses",
    detail:
      "Rent or mortgage, child care receipts, medical bills — deductions like these can INCREASE some benefits.",
    categories: ["food", "cash"],
  },
  {
    id: "utility-bills",
    label: "Recent utility bills",
    detail: "Gas, electric, or heating fuel bills — plus any shutoff notice, which can speed things up.",
    categories: ["energy"],
  },
  {
    id: "lease-landlord",
    label: "Lease and landlord contact information",
    detail: "For rental help: your lease, the landlord's name and contact, and any past-due or eviction notice.",
    categories: ["housing"],
  },
  {
    id: "insurance-cards",
    label: "Current health insurance cards, if any",
    detail: "Including Medicare cards — some programs coordinate with coverage you already have.",
    categories: ["health"],
  },
  {
    id: "immigration-docs",
    label: "Immigration documents, where they apply",
    detail:
      "Only for members applying for themselves. Many programs cover eligible children regardless of a parent's status — ask the agency or a local navigator.",
    categories: ["food", "health", "cash"],
  },
  {
    id: "benefit-award-letters",
    label: "Award letters for benefits you already get",
    detail:
      "A SNAP, Medicaid, or SSI letter often auto-qualifies you for other programs (like Lifeline) with no income paperwork.",
    categories: ["phone-internet", "food", "energy"],
  },
  {
    id: "school-enrollment",
    label: "School enrollment info for students",
    detail: "For school meals and student aid: which school each child attends; for FAFSA, your FSA ID and last year's tax info.",
    categories: ["education"],
  },
  {
    id: "bank-account",
    label: "Bank routing and account numbers",
    detail: "Payments and refunds arrive fastest by direct deposit. A blank check works.",
    categories: ["cash", "tax", "education"],
  },
];

/** Deduplicated checklist for the categories the household actually matched. */
export function documentsForCategories(categories: Set<Program["category"]>): DocumentItem[] {
  return DOCUMENT_ITEMS.filter((d) => d.categories.some((c) => categories.has(c)));
}
