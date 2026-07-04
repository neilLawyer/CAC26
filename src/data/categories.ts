export interface CategoryMeta {
  label: string;
  color: string;
  iconKey: string;
}

// Marketing display categories for the home "One engine, every kind of help"
// grid. Icons are referenced by key (see components/ui/icons.tsx).
export const CATEGORIES: CategoryMeta[] = [
  { label: "Food", color: "#2dd4bf", iconKey: "food" },
  { label: "Health", color: "#22d3ee", iconKey: "health" },
  { label: "Energy", color: "#f97316", iconKey: "energy" },
  { label: "Cash", color: "#a78bfa", iconKey: "cash" },
  { label: "Education", color: "#2dd4bf", iconKey: "education" },
  { label: "Housing", color: "#22d3ee", iconKey: "housing" },
  { label: "Tax", color: "#f97316", iconKey: "tax" },
  { label: "Phone & internet", color: "#a78bfa", iconKey: "phoneInternet" },
];
