// Synonym/tag index for universal search. Every target id MUST exist in the
// program catalog (src/data/**/programs.ts) or the scope registry — the
// palette drops anything it can't resolve, so a typo here is a silent miss.

export interface SearchTag {
  /** What a user might type — lowercase, natural phrasing. */
  phrase: string;
  targets: (
    | { kind: "program"; id: string }
    | { kind: "scope"; id: string }   // category or persona id
    | { kind: "page"; path: "/cliff-simulator" | "/tax-guide" | "/deadlines" | "/scholarships" | "/packet" }
  )[];
}

export const SEARCH_TAGS: SearchTag[] = [
  // --- colloquial program names: food ----------------------------------------
  {
    phrase: "food stamps",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "program", id: "nj-snap" },
      { kind: "program", id: "ca-calfresh" },
    ],
  },
  {
    phrase: "ebt",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "program", id: "nj-snap" },
      { kind: "program", id: "ca-calfresh" },
    ],
  },
  {
    phrase: "snap",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "program", id: "nj-snap" },
      { kind: "program", id: "ca-calfresh" },
    ],
  },
  {
    phrase: "calfresh",
    targets: [{ kind: "program", id: "ca-calfresh" }],
  },
  {
    phrase: "grocery money",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "scope", id: "food" },
    ],
  },
  {
    phrase: "food bank",
    targets: [{ kind: "program", id: "us-tefap" }, { kind: "scope", id: "food" }],
  },
  {
    phrase: "wic",
    targets: [
      { kind: "program", id: "us-wic" },
      { kind: "program", id: "nj-wic" },
      { kind: "program", id: "ca-wic" },
    ],
  },
  {
    phrase: "free school lunch",
    targets: [
      { kind: "program", id: "us-nslp" },
      { kind: "program", id: "nj-school-meals" },
      { kind: "program", id: "ca-school-meals" },
    ],
  },
  // --- colloquial program names: health ---------------------------------------
  {
    phrase: "obamacare",
    targets: [
      { kind: "program", id: "nj-get-covered-nj" },
      { kind: "program", id: "ca-covered-ca" },
      { kind: "scope", id: "health" },
    ],
  },
  {
    phrase: "marketplace insurance",
    targets: [
      { kind: "program", id: "nj-get-covered-nj" },
      { kind: "program", id: "ca-covered-ca" },
    ],
  },
  {
    phrase: "no health insurance",
    targets: [
      { kind: "program", id: "us-medicaid" },
      { kind: "program", id: "nj-get-covered-nj" },
      { kind: "program", id: "ca-covered-ca" },
      { kind: "scope", id: "health" },
    ],
  },
  {
    phrase: "medicaid",
    targets: [
      { kind: "program", id: "us-medicaid" },
      { kind: "program", id: "nj-familycare" },
      { kind: "program", id: "ca-medi-cal" },
    ],
  },
  {
    phrase: "medi-cal",
    targets: [{ kind: "program", id: "ca-medi-cal" }],
  },
  {
    phrase: "familycare",
    targets: [{ kind: "program", id: "nj-familycare" }],
  },
  {
    phrase: "chip",
    targets: [{ kind: "program", id: "us-chip" }],
  },
  {
    phrase: "kids health insurance",
    targets: [{ kind: "program", id: "us-chip" }, { kind: "scope", id: "health" }],
  },
  {
    phrase: "prescription help",
    targets: [{ kind: "program", id: "nj-paad" }, { kind: "program", id: "us-extra-help" }],
  },
  {
    phrase: "medicare",
    targets: [
      { kind: "program", id: "us-msp" },
      { kind: "program", id: "us-extra-help" },
      { kind: "scope", id: "health" },
    ],
  },
  // --- colloquial program names: housing --------------------------------------
  {
    phrase: "section 8",
    targets: [{ kind: "program", id: "us-section8" }],
  },
  {
    phrase: "housing voucher",
    targets: [{ kind: "program", id: "us-section8" }],
  },
  {
    phrase: "rental assistance",
    targets: [{ kind: "program", id: "us-era" }],
  },
  {
    phrase: "property tax relief",
    targets: [
      { kind: "program", id: "nj-senior-freeze" },
      { kind: "program", id: "ca-ptp" },
      { kind: "scope", id: "housing" },
    ],
  },
  // --- colloquial program names: cash -----------------------------------------
  {
    phrase: "welfare",
    targets: [
      { kind: "scope", id: "cash" },
      { kind: "program", id: "nj-wfnj" },
      { kind: "program", id: "ca-calworks" },
    ],
  },
  {
    phrase: "tanf",
    targets: [{ kind: "program", id: "nj-wfnj" }, { kind: "program", id: "ca-calworks" }],
  },
  {
    phrase: "cash assistance",
    targets: [{ kind: "scope", id: "cash" }],
  },
  {
    phrase: "general assistance",
    targets: [{ kind: "program", id: "nj-county-ga" }, { kind: "program", id: "ca-county-ga" }],
  },
  {
    phrase: "ssi",
    targets: [{ kind: "program", id: "nj-ssi" }, { kind: "program", id: "ca-ssi-ssp" }],
  },
  {
    phrase: "ssdi",
    targets: [{ kind: "program", id: "us-ssdi" }],
  },
  {
    phrase: "social security disability",
    targets: [{ kind: "program", id: "us-ssdi" }],
  },
  {
    phrase: "disabled",
    targets: [
      { kind: "program", id: "us-ssdi" },
      { kind: "program", id: "nj-ssi" },
      { kind: "program", id: "ca-ssi-ssp" },
      { kind: "scope", id: "cash" },
    ],
  },
  {
    phrase: "capi",
    targets: [{ kind: "program", id: "ca-capi" }],
  },
  {
    phrase: "small business loan",
    targets: [{ kind: "program", id: "us-sba" }],
  },
  // --- colloquial program names: energy / phone -------------------------------
  {
    phrase: "liheap",
    targets: [
      { kind: "program", id: "us-liheap" },
      { kind: "program", id: "nj-liheap" },
      { kind: "program", id: "ca-liheap" },
    ],
  },
  {
    phrase: "lifeline phone",
    targets: [
      { kind: "program", id: "us-lifeline" },
      { kind: "program", id: "nj-usf" },
      { kind: "program", id: "ca-lifeline" },
    ],
  },
  {
    phrase: "phone bill",
    targets: [
      { kind: "scope", id: "phone-internet" },
      { kind: "program", id: "us-lifeline" },
    ],
  },
  {
    phrase: "internet discount",
    targets: [
      { kind: "scope", id: "phone-internet" },
      { kind: "program", id: "us-lifeline" },
    ],
  },
  // --- colloquial program names: tax ------------------------------------------
  {
    phrase: "eitc",
    targets: [
      { kind: "program", id: "us-eitc" },
      { kind: "program", id: "nj-eitc" },
      { kind: "program", id: "ca-eitc" },
    ],
  },
  {
    phrase: "earned income tax credit",
    targets: [
      { kind: "program", id: "us-eitc" },
      { kind: "program", id: "nj-eitc" },
      { kind: "program", id: "ca-eitc" },
    ],
  },
  {
    phrase: "child tax credit",
    targets: [{ kind: "program", id: "us-ctc" }],
  },
  {
    phrase: "tax refund",
    targets: [
      { kind: "page", path: "/tax-guide" },
      { kind: "program", id: "us-eitc" },
      { kind: "program", id: "us-ctc" },
    ],
  },
  {
    phrase: "file taxes",
    targets: [{ kind: "page", path: "/tax-guide" }],
  },
  {
    phrase: "free tax prep",
    targets: [{ kind: "page", path: "/tax-guide" }, { kind: "scope", id: "tax" }],
  },
  // --- colloquial program names: education / veterans -------------------------
  {
    phrase: "pell grant",
    targets: [{ kind: "program", id: "us-pell" }],
  },
  {
    phrase: "fafsa",
    targets: [{ kind: "program", id: "us-pell" }, { kind: "scope", id: "education" }],
  },
  {
    phrase: "scholarship",
    targets: [{ kind: "page", path: "/scholarships" }, { kind: "program", id: "us-scholarships" }, { kind: "scope", id: "education" }],
  },
  {
    phrase: "job training",
    targets: [{ kind: "program", id: "us-job-training" }],
  },
  {
    phrase: "resume help",
    targets: [{ kind: "program", id: "us-job-training" }],
  },
  {
    phrase: "gi bill",
    targets: [{ kind: "program", id: "us-gi-bill" }],
  },
  {
    phrase: "va disability",
    targets: [{ kind: "program", id: "us-va-disability" }],
  },
  {
    phrase: "va pension",
    targets: [{ kind: "program", id: "us-va-pension" }],
  },
  {
    phrase: "va home loan",
    targets: [{ kind: "program", id: "us-va-home-loan" }],
  },
  {
    phrase: "va health care",
    targets: [{ kind: "program", id: "us-va-healthcare" }],
  },
  // --- life situations: pregnancy / new baby ----------------------------------
  {
    phrase: "pregnant",
    targets: [
      { kind: "program", id: "us-wic" },
      { kind: "program", id: "nj-wic" },
      { kind: "program", id: "ca-wic" },
      // Medicaid in all three shapes — the state packs SUPERSEDE us-medicaid,
      // so a NJ/CA household never resolves the federal id.
      { kind: "program", id: "us-medicaid" },
      { kind: "program", id: "nj-familycare" },
      { kind: "program", id: "ca-medi-cal" },
      { kind: "scope", id: "families" },
    ],
  },
  {
    phrase: "new baby",
    targets: [
      { kind: "program", id: "nj-wic" },
      { kind: "program", id: "ca-wic" },
      { kind: "scope", id: "families" },
    ],
  },
  {
    phrase: "having a baby",
    targets: [
      { kind: "program", id: "us-wic" },
      { kind: "scope", id: "families" },
    ],
  },
  // --- life situations: job loss ------------------------------------------------
  {
    phrase: "laid off",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "lost my job",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "unemployed",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  // --- life situations: housing ------------------------------------------------
  {
    phrase: "can't pay rent",
    targets: [{ kind: "program", id: "us-era" }, { kind: "scope", id: "housing" }],
  },
  {
    phrase: "behind on rent",
    targets: [{ kind: "program", id: "us-era" }],
  },
  {
    phrase: "eviction",
    targets: [{ kind: "program", id: "us-era" }, { kind: "program", id: "us-section8" }],
  },
  // --- life situations: energy bills --------------------------------------------
  {
    phrase: "heat bill",
    targets: [
      { kind: "program", id: "nj-liheap" },
      { kind: "program", id: "ca-liheap" },
      { kind: "program", id: "us-liheap" },
      { kind: "scope", id: "energy" },
    ],
  },
  {
    phrase: "electric bill",
    targets: [
      { kind: "program", id: "nj-liheap" },
      { kind: "program", id: "ca-liheap" },
      { kind: "program", id: "us-liheap" },
      { kind: "scope", id: "energy" },
    ],
  },
  {
    phrase: "can't afford heat",
    targets: [{ kind: "program", id: "nj-liheap" }, { kind: "program", id: "ca-liheap" }],
  },
  {
    phrase: "utility assistance",
    targets: [{ kind: "scope", id: "energy" }, { kind: "program", id: "us-liheap" }],
  },
  // NOTE: no solar/clean-energy or rooftop-panel program exists anywhere in the
  // catalog (federal, NJ, or CA) — only heating/cooling bill help (LIHEAP) and
  // utility discounts (Lifeline/USF). "solar" and "clean energy" resolve to the
  // energy category only, honestly, rather than a program that doesn't exist.
  {
    phrase: "solar",
    targets: [{ kind: "scope", id: "energy" }],
  },
  {
    phrase: "clean energy",
    targets: [{ kind: "scope", id: "energy" }],
  },
  // --- demographics --------------------------------------------------------------
  {
    phrase: "senior",
    targets: [{ kind: "scope", id: "seniors" }],
  },
  {
    phrase: "over 65",
    targets: [{ kind: "scope", id: "seniors" }],
  },
  {
    phrase: "veteran",
    targets: [{ kind: "scope", id: "veterans" }],
  },
  {
    phrase: "served in the military",
    targets: [{ kind: "scope", id: "veterans" }],
  },
  {
    phrase: "student",
    targets: [{ kind: "scope", id: "students" }, { kind: "program", id: "us-pell" }],
  },
  {
    phrase: "immigrant",
    targets: [{ kind: "scope", id: "immigrants" }, { kind: "program", id: "ca-capi" }],
  },
  {
    phrase: "family with kids",
    targets: [{ kind: "scope", id: "families" }],
  },
  // --- money / tax tools -----------------------------------------------------------
  {
    phrase: "raise",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "benefits cliff",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "will a raise hurt my benefits",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "deadlines",
    targets: [{ kind: "page", path: "/deadlines" }],
  },
  {
    phrase: "when is the deadline",
    targets: [{ kind: "page", path: "/deadlines" }],
  },
  {
    phrase: "document checklist",
    targets: [{ kind: "page", path: "/packet" }],
  },
  {
    phrase: "application packet",
    targets: [{ kind: "page", path: "/packet" }],
  },
  {
    phrase: "print my documents",
    targets: [{ kind: "page", path: "/packet" }],
  },
  // --- Spanish -----------------------------------------------------------------------
  {
    phrase: "estampillas de comida",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "program", id: "nj-snap" },
      { kind: "program", id: "ca-calfresh" },
    ],
  },
  {
    phrase: "cupones de alimentos",
    targets: [{ kind: "program", id: "us-snap" }],
  },
  {
    phrase: "seguro médico",
    targets: [{ kind: "scope", id: "health" }, { kind: "program", id: "us-medicaid" }],
  },
  {
    phrase: "asistencia médica",
    targets: [{ kind: "scope", id: "health" }],
  },
  {
    phrase: "ayuda con la renta",
    targets: [{ kind: "program", id: "us-era" }, { kind: "scope", id: "housing" }],
  },
  {
    phrase: "desempleo",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "embarazada",
    targets: [
      { kind: "program", id: "us-wic" },
      { kind: "program", id: "nj-wic" },
      { kind: "program", id: "ca-wic" },
    ],
  },
  {
    phrase: "factura de luz",
    targets: [
      { kind: "program", id: "nj-liheap" },
      { kind: "program", id: "ca-liheap" },
      { kind: "program", id: "us-liheap" },
    ],
  },
  {
    phrase: "impuestos",
    targets: [{ kind: "page", path: "/tax-guide" }],
  },
];
