import type { Program } from "@/lib/types";

// Rules-as-data: the federal pack. These programs have nationwide rules and are
// composed into EVERY state's program list (src/data/states/index.ts). State
// packs keep their state-administered versions of SNAP/Medicaid/LIHEAP/WIC —
// nothing here duplicates them.
//
// Sourcing discipline (docs/sources.md + the project ground rules):
// - Every entry's sourceUrl comes from docs/sources.md. No program without a source.
// - Dollar figures appear ONLY where verified against the official source on the
//   lastVerified date (EITC/CTC tables: irs.gov; Lifeline: lifelinesupport.org).
// - Programs decided by a formula, rating, or waitlist we can't model carry
//   `confidenceCap: "possible"` so we never overpromise — most prominently
//   Section 8, which is lottery/waitlist almost everywhere.
// - ACP and federal LIHWAP are deliberately absent (discontinued / excluded by
//   project ground rule).

export const FEDERAL_PROGRAMS: Program[] = [
  // --- tax credits (the biggest "unclaimed money" category) -----------------
  {
    id: "us-eitc",
    name: "Earned Income Tax Credit",
    shortName: "EITC",
    state: "US",
    category: "tax",
    summary:
      "A refundable credit worth up to about $8,000 for working households — the IRS itself says about 1 in 5 eligible people never claim it. You must file a tax return to get it, even if you owe nothing.",
    agencyName: "Internal Revenue Service",
    applyUrl: "https://www.getyourrefund.org/",
    sourceUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
    lastVerified: "2026-07-05",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Tax year 2025 AGI ceilings from the IRS EITC tables, by qualifying children.
      kidCountIncomeTiers: [
        { atLeastKids: 0, maxAnnualSingle: 19104, maxAnnualJoint: 26214 },
        { atLeastKids: 1, maxAnnualSingle: 50434, maxAnnualJoint: 57554 },
        { atLeastKids: 2, maxAnnualSingle: 57310, maxAnnualJoint: 64430 },
        { atLeastKids: 3, maxAnnualSingle: 61555, maxAnnualJoint: 68675 },
      ],
      categoricalRequirements: [{ type: "filesTaxes" }],
      requireAllCategorical: true,
      fieldRequirements: [
        {
          field: "employmentStatus",
          oneOf: ["working", "selfEmployed"],
          label: "you have earnings from a job or self-employment",
        },
      ],
      // Tax year 2025 investment-income cap ($11,950), per the IRS EITC tables.
      disqualifyingFlags: ["investmentIncomeOverCap"],
    },
    // 2025 credit range per IRS: $649 (no kids) to $8,046 (3+ kids).
    estimatedAnnualValueMin: 649,
    estimatedAnnualValueMax: 8046,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["us-ctc"],
  },
  {
    id: "us-ctc",
    name: "Child Tax Credit",
    shortName: "CTC",
    state: "US",
    category: "tax",
    summary:
      "Up to $2,200 per child under 17 on your federal tax return (tax year 2025). Partially refundable — you can get up to $1,700 per child back even if you owe no tax, once you have about $2,500 in earnings.",
    agencyName: "Internal Revenue Service",
    applyUrl: "https://www.getyourrefund.org/",
    sourceUrl: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
    lastVerified: "2026-07-05",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Full credit up to $200k single / $400k joint (2025), then it phases down.
      kidCountIncomeTiers: [{ atLeastKids: 0, maxAnnualSingle: 200000, maxAnnualJoint: 400000 }],
      requireKidsUnder17: true,
      categoricalRequirements: [{ type: "filesTaxes" }],
      requireAllCategorical: true,
    },
    // $2,200/child (2025, verified): one child to four children.
    estimatedAnnualValueMin: 2200,
    estimatedAnnualValueMax: 8800,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["us-eitc"],
  },
  // --- phone & internet -------------------------------------------------------
  {
    id: "us-lifeline",
    name: "Lifeline Phone & Internet Discount",
    shortName: "Lifeline",
    state: "US",
    category: "phone-internet",
    summary:
      "A $9.25/month federal discount on phone or internet service. You qualify by income, or automatically if anyone in the household is on SNAP, Medicaid, SSI, federal public housing assistance, or a Veterans Pension.",
    agencyName: "FCC / Universal Service Administrative Co.",
    applyUrl: "https://www.lifelinesupport.org/",
    sourceUrl: "https://www.lifelinesupport.org/",
    lastVerified: "2026-07-05",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 135% of the federal poverty guidelines (verified at lifelinesupport.org, 2026).
      maxIncomePctFPL: 135,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesSnap", "receivesMedicaid", "receivesSsi"],
    },
    // $9.25/month, per lifelinesupport.org.
    estimatedAnnualValueMin: 111,
    estimatedAnnualValueMax: 111,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    cascadeHints: [],
  },
  // --- health: the Medicare-side pathways --------------------------------------
  {
    id: "us-msp",
    name: "Medicare Savings Programs",
    shortName: "MSP",
    state: "US",
    category: "health",
    summary:
      "State-run programs (QMB, SLMB, QI) that pay Medicare premiums — and sometimes deductibles and copays — for Medicare enrollees with lower income. Income tiers reach up to 135% of the poverty level; your state Medicaid office decides which tier fits.",
    agencyName: "State Medicaid agency / CMS",
    applyUrl: "https://www.medicaid.gov/about-us/beneficiary-resources/index.html",
    sourceUrl: "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
    lastVerified: "2026-07-05",
    // The statutory income tiers are modeled; the resource test varies and isn't,
    // so we never show better than "possible".
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // QI, the highest MSP tier, is set by statute at 135% FPL.
      maxIncomePctFPL: 135,
      categoricalRequirements: [{ type: "medicareEnrolled" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["us-extra-help"],
  },
  {
    id: "us-extra-help",
    name: "Extra Help with Medicare Part D",
    shortName: "Extra Help",
    state: "US",
    category: "health",
    summary:
      "Lowers prescription drug costs for Medicare enrollees with income up to 150% of the poverty level — many people who qualify never apply. A resource test also applies; Social Security makes the call.",
    agencyName: "Social Security Administration",
    applyUrl: "https://www.ssa.gov/medicare/part-d-extra-help",
    sourceUrl: "https://www.ssa.gov/medicare/part-d-extra-help",
    lastVerified: "2026-07-05",
    // Income threshold is statutory (150% FPL since 2024); the resource test isn't modeled.
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 150,
      categoricalRequirements: [{ type: "medicareEnrolled" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["us-msp"],
  },
  // --- cash & disability --------------------------------------------------------
  {
    id: "us-ssdi",
    name: "Social Security Disability Insurance",
    shortName: "SSDI",
    state: "US",
    category: "cash",
    summary:
      "Monthly payments if a disability keeps you from working and you've paid into Social Security — roughly 5 of the last 10 years of work. Unlike SSI, there's no savings limit; the benefit is based on your work record.",
    agencyName: "Social Security Administration",
    applyUrl: "https://www.ssa.gov/disability",
    sourceUrl: "https://www.ssa.gov/disability",
    lastVerified: "2026-07-05",
    // SSA's medical determination decides — we only screen the structural basics.
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "disabled" }, { type: "workedFiveOfLastTenYears" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 12,
    estimatedTimeToBenefitWeeksMax: 40,
    cascadeHints: ["us-msp"],
  },
  {
    id: "us-sba",
    name: "SBA Small Business Programs",
    shortName: "SBA",
    state: "US",
    category: "cash",
    summary:
      "Loans, disaster loans, and some grants for the self-employed and small-business owners. Competitive and capped — a pointer worth knowing about, not a guarantee.",
    agencyName: "U.S. Small Business Administration",
    applyUrl: "https://www.sba.gov/funding-programs",
    sourceUrl: "https://www.sba.gov/funding-programs",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
      fieldRequirements: [
        { field: "employmentStatus", oneOf: ["selfEmployed"], label: "you're self-employed" },
      ],
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 26,
    cascadeHints: [],
  },
  // --- veterans (unlocked by the optional service questions) ---------------------
  {
    id: "us-va-disability",
    name: "VA Disability Compensation",
    shortName: "VA Disability",
    state: "US",
    category: "cash",
    summary:
      "Tax-free monthly payments for conditions that started or got worse during military service. The amount depends on the disability rating the VA assigns.",
    agencyName: "U.S. Department of Veterans Affairs",
    applyUrl: "https://www.va.gov/disability",
    sourceUrl: "https://www.va.gov/disability",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [
        { type: "veteran" },
        { type: "servedActiveDuty" },
        { type: "serviceConnectedCondition" },
      ],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 8,
    estimatedTimeToBenefitWeeksMax: 26,
    cascadeHints: ["us-va-pension", "us-gi-bill"],
  },
  {
    id: "us-va-pension",
    name: "VA Pension",
    shortName: "VA Pension",
    state: "US",
    category: "cash",
    summary:
      "Monthly payments for wartime veterans who are 65+ or disabled and have limited income and assets. The VA applies its own income and asset test — worth checking if you served.",
    agencyName: "U.S. Department of Veterans Affairs",
    applyUrl: "https://www.va.gov/pension",
    sourceUrl: "https://www.va.gov/benefits",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "veteran" }, { type: "servedActiveDuty" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 8,
    estimatedTimeToBenefitWeeksMax: 26,
    cascadeHints: ["us-va-disability"],
  },
  {
    id: "us-gi-bill",
    name: "GI Bill Education Benefits",
    shortName: "GI Bill",
    state: "US",
    category: "education",
    summary:
      "Tuition, a housing allowance, and book money for veterans — and sometimes their spouse or kids. How much depends on your length of service.",
    agencyName: "U.S. Department of Veterans Affairs",
    applyUrl: "https://www.va.gov/education",
    sourceUrl: "https://www.va.gov/education",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "veteran" }, { type: "servedActiveDuty" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["us-va-home-loan"],
  },
  {
    id: "us-va-home-loan",
    name: "VA Home Loan Guarantee",
    shortName: "VA Home Loan",
    state: "US",
    category: "housing",
    summary:
      "Lets veterans buy a home with no down payment and no private mortgage insurance. Service-length requirements apply — the VA issues a Certificate of Eligibility.",
    agencyName: "U.S. Department of Veterans Affairs",
    applyUrl: "https://www.va.gov/housing-assistance",
    sourceUrl: "https://www.va.gov/housing-assistance",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "veteran" }, { type: "servedActiveDuty" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: [],
  },
  // --- education -------------------------------------------------------------------
  {
    id: "us-pell",
    name: "Federal Pell Grant (via FAFSA)",
    shortName: "Pell Grant",
    state: "US",
    category: "education",
    summary:
      "The largest federal grant for college and career training — money you don't pay back. There's no single income cutoff; filing the FAFSA runs the real formula, and it's free.",
    agencyName: "Federal Student Aid, U.S. Dept. of Education",
    applyUrl: "https://studentaid.gov/",
    sourceUrl: "https://studentaid.gov/understand-aid/types/grants/pell",
    lastVerified: "2026-07-05",
    // Pell is decided by the FAFSA's Student Aid Index formula — no threshold to model.
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      categoricalRequirements: [{ type: "student" }, { type: "planningCollege" }],
      requireAllCategorical: false,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["us-scholarships"],
  },
  {
    id: "us-scholarships",
    name: "CareerOneStop Scholarship Finder",
    shortName: "Scholarship Finder",
    state: "US",
    category: "education",
    summary:
      "The Department of Labor's free scholarship search — the reputable, no-ads way to find scholarships. Individual awards are competitive, so cast a wide net.",
    agencyName: "U.S. Department of Labor",
    applyUrl: "https://www.careeronestop.org/toolkit/training/find-scholarships.aspx",
    sourceUrl: "https://www.careeronestop.org/toolkit/training/find-scholarships.aspx",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      categoricalRequirements: [{ type: "student" }, { type: "planningCollege" }],
      requireAllCategorical: false,
    },
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 26,
    cascadeHints: ["us-pell"],
  },
  {
    id: "us-job-training",
    name: "American Job Centers & Job Training",
    shortName: "Job Training",
    state: "US",
    category: "education",
    summary:
      "Free help from your local American Job Center: job training, apprenticeships, résumé and interview coaching. Run by the Department of Labor and open at no cost.",
    agencyName: "U.S. Department of Labor",
    applyUrl:
      "https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx",
    sourceUrl: "https://www.careeronestop.org/",
    lastVerified: "2026-07-05",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
      fieldRequirements: [
        {
          field: "employmentStatus",
          oneOf: ["unemployed"],
          label: "you're unemployed and looking for work",
        },
      ],
    },
    estimatedTimeToBenefitWeeksMin: 0,
    estimatedTimeToBenefitWeeksMax: 2,
    cascadeHints: [],
  },
  // --- housing --------------------------------------------------------------------------
  {
    id: "us-section8",
    name: "Housing Choice Voucher (Section 8)",
    shortName: "Section 8",
    state: "US",
    category: "housing",
    summary:
      "Pays part of your rent through your local housing authority. Honest truth: demand far exceeds vouchers — most waitlists are lottery-based and can take years. Qualifying means you can enter the list, not that you'll get a voucher soon. Income limits are set county by county (around 50% of local median income).",
    agencyName: "Local Public Housing Agency / HUD",
    applyUrl: "https://www.hud.gov/program_offices/public_indian_housing/pha/contacts",
    sourceUrl: "https://www.hud.gov/helping-americans/housing-choice-vouchers-tenants",
    lastVerified: "2026-07-05",
    // Lottery/waitlist + county-level AMI limits we don't yet model: never above "possible".
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
      fieldRequirements: [
        {
          field: "housingTenure",
          oneOf: ["rent", "other"],
          label: "you rent or don't have stable housing",
        },
      ],
    },
    estimatedTimeToBenefitWeeksMin: 52,
    estimatedTimeToBenefitWeeksMax: 520,
    cascadeHints: ["us-era"],
  },
  {
    id: "us-era",
    name: "Emergency Rental Assistance",
    shortName: "Rental Assistance",
    state: "US",
    category: "housing",
    summary:
      "Local programs that help with back rent and sometimes utilities when you've fallen behind. Funding is limited and varies by county — the national tracker shows what's open near you.",
    agencyName: "Local housing agencies (NLIHC tracker)",
    applyUrl: "https://nlihc.org/era-dashboard",
    sourceUrl: "https://nlihc.org/era-dashboard",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "behindOnRent" }, { type: "atRiskHomelessness" }],
      requireAllCategorical: false,
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["rent", "other"], label: "you rent your home" },
      ],
    },
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["us-section8"],
  },
  {
    id: "us-fema",
    name: "FEMA Individual Assistance",
    shortName: "FEMA IA",
    state: "US",
    category: "housing",
    summary:
      "Temporary housing, home repair grants, and emergency aid — but only after a federally declared disaster in your area, and funds are capped. DisasterAssistance.gov screens across every agency at once.",
    agencyName: "FEMA",
    applyUrl: "https://www.disasterassistance.gov/",
    sourceUrl: "https://www.fema.gov/assistance/individual",
    lastVerified: "2026-07-05",
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "disasterAffected" }],
      requireAllCategorical: true,
    },
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: [],
  },
  // --- food ------------------------------------------------------------------------------
  {
    id: "us-tefap",
    name: "Food Banks & TEFAP",
    shortName: "Food Banks",
    state: "US",
    category: "food",
    summary:
      "Free groceries through local food banks and pantries, partly stocked by the USDA. Requirements are minimal and vary by state — if money for food is tight this week, this is the fastest door.",
    agencyName: "USDA / Feeding America network",
    applyUrl: "https://www.feedingamerica.org/find-your-local-foodbank",
    sourceUrl: "https://www.fns.usda.gov/tefap",
    lastVerified: "2026-07-05",
    // State-by-state self-attestation rules we don't model — stay at "possible".
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedTimeToBenefitWeeksMin: 0,
    estimatedTimeToBenefitWeeksMax: 1,
    cascadeHints: [],
  },
];
