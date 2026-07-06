// Short label for each step, keyed by step id (steps are assembled dynamically
// in the wizard — the "savings" step only appears when a program needs it).
export const STEP_LABELS: Record<string, string> = {
  state: "State",
  size: "Household",
  income: "Income",
  flags: "A few more things",
  assets: "Savings",
  review: "Review",
};

// The "why we ask this" note shown in the intake sidebar, keyed by step id.
export const STEP_NOTES: Record<string, string> = {
  state:
    "Program rules — income limits, age requirements — are set state by state, so we start here to tailor every question after this.",
  size: "Household size changes the income limit for almost every program. A family of four qualifies at a higher income than someone living alone.",
  income:
    "Most programs use a percentage of the federal poverty level based on household size. A range is all we need — nothing exact.",
  flags:
    "Some programs, like PAAD or Senior Freeze, are restricted to specific groups. We only ask about the ones that could still apply to you.",
  assets:
    "A few programs, like SSI, also cap how much you can have in savings and resources. A home and usually one car don't count.",
  review:
    "That's everything we need. Your answers stay in this browser and are never sent anywhere.",
};
