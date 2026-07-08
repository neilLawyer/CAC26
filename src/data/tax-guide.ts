// "Claim your tax credits" walkthrough — guidance only. OpenDoor never files
// taxes on anyone's behalf and never collects financial data; this page just
// explains free, legitimate ways to file and the credits worth checking for.
// Every fact and link below was checked live against the source during
// authoring. Re-verify before the next filing season — figures like the Free
// File income cap and credit amounts change most years.

export interface TaxGuideLink {
  label: string;
  url: string;
  note?: string;
}

export interface TaxGuideSection {
  id: string;
  title: string;
  body: string[]; // paragraphs, plain language, ~6th-grade level
  links?: TaxGuideLink[];
  warnings?: string[]; // "watch out" callouts
}

export interface ChecklistItem {
  item: string;
  detail?: string;
  appliesWhen?: string;
}

export const TAX_GUIDE_SECTIONS: TaxGuideSection[] = [
  {
    id: "what-filing-is",
    title: "What a tax return actually does for you",
    body: [
      "A tax return is a form you send the IRS once a year. It reports your income and figures out whether you owe more tax or the government owes you money back.",
      "If your income is low, you may not be required to file at all. But filing anyway can put real money in your pocket. Credits like the Earned Income Tax Credit (EITC) and Child Tax Credit are \"refundable\" — if the credit is worth more than what you owe, the IRS pays you the difference. That money only shows up if you file a return and claim it.",
      "The IRS itself estimates that about one in five workers who qualify for the EITC don't claim it — often because they didn't know they were eligible, or didn't realize filing was worth it when they owed no tax. That's money left on the table every year.",
    ],
    links: [
      {
        label: "IRS: Earned Income Tax Credit (EITC)",
        url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc",
        note: "What the credit is and the basic rules for who can get it.",
      },
      {
        label: "IRS: EITC — a valuable credit that supports millions of families",
        url: "https://www.irs.gov/newsroom/earned-income-tax-credit-a-valuable-credit-that-supports-millions-of-families",
        note: "Source for the \"about one in five eligible workers don't claim it\" estimate.",
      },
    ],
  },
  {
    id: "free-ways-to-file",
    title: "Real free ways to file",
    body: [
      "You should never have to pay just to claim credits you're owed. Here are the legitimate free options.",
      "IRS Free File gives you name-brand guided tax software at no cost if your 2025 adjusted gross income was $89,000 or less. If you earned more than that, or you're comfortable filling out the forms yourself, Free File Fillable Forms are open to anyone regardless of income — though they skip state returns and don't do the math for you the way guided software does.",
      "VITA (Volunteer Income Tax Assistance) is free, IRS-certified help from trained volunteers, generally for people who make $69,000 or less, plus people with disabilities and people with limited English. TCE (Tax Counseling for the Elderly) is a related free program focused on filers 60 and older, often run through AARP.",
      "GetYourRefund.org, built by the nonprofit Code for America with IRS-certified VITA partners, is a free online option designed specifically to help lower-income households claim the EITC and Child Tax Credit, with real people available to help.",
      "If you or a family member is active duty, a recent veteran (within about a year of separating), or a military survivor, MilTax offers free tax software and one-on-one consultants with no income limit — built for military situations like deployments and PCS moves.",
    ],
    warnings: [
      "IRS Direct File — the government's own free e-filing tool — is not available for the 2026 filing season. The IRS told the states it had partnered with in November 2025 that it would not return, with no relaunch date set, citing low use and high per-return cost. Don't rely on instructions elsewhere that assume it's still running.",
    ],
    links: [
      {
        label: "IRS Free File",
        url: "https://www.irs.gov/filing/free-file-do-your-federal-taxes-for-free",
        note: "Current income cap ($89,000 AGI) and the guided-software partners.",
      },
      {
        label: "IRS: Free tax return preparation for qualifying taxpayers",
        url: "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers",
        note: "VITA and TCE eligibility, straight from the IRS.",
      },
      {
        label: "VITA/TCE site locator",
        url: "https://irs.treasury.gov/freetaxprep/",
        note: "Find a free, IRS-certified tax prep site near you by ZIP code.",
      },
      {
        label: "GetYourRefund.org",
        url: "https://www.getyourrefund.org/en",
        note: "Code for America's free virtual filing service.",
      },
      {
        label: "MilTax (Military OneSource)",
        url: "https://www.militaryonesource.mil/financial-legal/taxes/miltax-military-tax-services/",
        note: "Free federal and up to five state returns for the military community.",
      },
      {
        label: "IRS Direct File will not be available in 2026 (reporting)",
        url: "https://federalnewsnetwork.com/it-modernization/2025/11/irs-direct-file-will-not-be-available-in-2026-agency-tells-states/",
        note: "The IRS's own Direct File page is gone; this is the reporting that confirms why.",
      },
    ],
  },
  {
    id: "watch-out",
    title: "Practices to watch out for",
    body: [
      "Filing shouldn't cost you money if you qualify for one of the free options above. Be cautious of anything that asks for payment before it will show you your refund amount, or that keeps pushing you toward a paid upgrade partway through.",
      "In January 2024, the Federal Trade Commission found that Intuit (maker of TurboTax) had run deceptive \"free\" ads for years — most people who started the \"free\" product were later told they had to pay once their tax situation didn't qualify. The FTC ordered Intuit to stop unless it clearly discloses what share of filers actually qualify for free.",
      "\"Refund anticipation\" loans or checks promise your refund faster for a fee, but that fee comes out of money that would otherwise be entirely yours. A free e-filed return with direct deposit is often nearly as fast, at no cost.",
    ],
    warnings: [
      "Update: a federal appeals court (the Fifth Circuit) vacated the FTC's order against Intuit in March 2026 — but only on a procedural, separation-of-powers question about which venue gets to hear the case, not on whether the ads were actually deceptive. The FTC can still pursue the claim in federal court. Read this as unresolved, not as Intuit being cleared.",
      "If a paid preparer wants to charge you a fee, ask up front what it costs and whether you'd qualify for VITA or Free File instead — you may be paying for something available at no cost nearby.",
    ],
    links: [
      {
        label: "FTC: Opinion finding TurboTax maker Intuit engaged in deceptive practices",
        url: "https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-issues-opinion-finding-turbotax-maker-intuit-inc-engaged-deceptive-practices",
        note: "The FTC's January 2024 opinion and final order.",
      },
      {
        label: "Intuit wins on appeal (reporting on the March 2026 vacatur)",
        url: "https://www.forbes.com/sites/kellyphillipserb/2026/03/27/intuit-wins-big-in-ftc-fight-over-turbotax-free-ads/",
        note: "Explains the Fifth Circuit's procedural ruling and what it does and doesn't decide.",
      },
    ],
  },
  {
    id: "help-for-filers",
    title: "Credits worth checking for",
    body: [
      "Filing correctly can unlock more than one credit at once. Here are the big ones for lower-income households.",
      "The Earned Income Tax Credit (EITC) is for workers with low to moderate income — the exact amount depends on income, filing status, and number of children, and it can be worth thousands of dollars.",
      "The Child Tax Credit (CTC) is worth up to $2,200 per qualifying child under 17 on a 2025 return. Even if you owe no tax, up to $1,700 per child can come back to you as a refund through the Additional Child Tax Credit.",
      "The Saver's Credit rewards putting money into an IRA or a workplace retirement plan like a 401(k). For 2025 returns, the full 50% credit is available up to about $23,750 income (single), $35,625 (head of household), or $47,500 (married filing jointly) — worth up to $1,000 ($2,000 married) depending on income and how much you contributed.",
      "If anyone on your return had ACA Marketplace health coverage in 2025, you'll get a Form 1095-A and need to \"reconcile\" your advance premium tax credit on Form 8962 when you file. Skipping this step is a common reason refunds get delayed.",
      "Many states and some cities run their own EITC on top of the federal one — worth checking if yours is one of them.",
    ],
    links: [
      {
        label: "IRS: Child Tax Credit",
        url: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
        note: "Current per-child amount and the refundable portion.",
      },
      {
        label: "IRS: Saver's Credit",
        url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-credit-savers-credit",
        note: "Income tiers and how the credit percentage works.",
      },
      {
        label: "IRS: Premium Tax Credit — claiming and reconciling",
        url: "https://www.irs.gov/affordable-care-act/individuals-and-families/premium-tax-credit-claiming-the-credit-and-reconciling-advance-credit-payments",
        note: "What Form 1095-A and Form 8962 reconciliation mean.",
      },
      {
        label: "IRS: States and local governments with an Earned Income Tax Credit",
        url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/states-and-local-governments-with-earned-income-tax-credit",
        note: "Official list of which states/localities have their own EITC.",
      },
    ],
  },
];

// Mirrors the IRS's own "what to bring" checklist for VITA/TCE and other free
// tax prep — see https://www.irs.gov/individuals/checklist-for-free-tax-return-preparation
export const WHAT_TO_BRING: ChecklistItem[] = [
  {
    item: "Photo ID",
    detail: "Original, government-issued photo identification.",
    appliesWhen: "For you, and for your spouse too if you're filing jointly.",
  },
  {
    item: "Social Security cards or ITIN letters",
    detail: "For everyone who will be listed on the return.",
    appliesWhen: "You, your spouse, and every dependent you're claiming.",
  },
  {
    item: "Proof of foreign status for ITIN applicants",
    appliesWhen: "If anyone on the return uses an ITIN instead of a Social Security number.",
  },
  {
    item: "Birth dates",
    detail: "For yourself, your spouse, and any dependents.",
  },
  {
    item: "Wage and income statements",
    detail: "W-2s, and any 1099s (1099-NEC, 1099-MISC, 1099-R, 1099-G, etc.) from every employer or payer.",
  },
  {
    item: "Interest and dividend statements",
    detail: "1099-INT or 1099-DIV forms from banks or investment accounts.",
    appliesWhen: "If a bank or investment account paid you interest or dividends during the year.",
  },
  {
    item: "Social Security benefit statement (SSA-1099)",
    appliesWhen: "If you or anyone on the return received Social Security benefits.",
  },
  {
    item: "Childcare provider's info",
    detail: "Name, address, and tax ID number of the provider, plus the total amount you paid.",
    appliesWhen: "If you paid for child or dependent care so you (and your spouse, if married) could work.",
  },
  {
    item: "Form 1095-A",
    detail: "Health Insurance Marketplace Statement.",
    appliesWhen: "If anyone on the return had ACA Marketplace health coverage during the year.",
  },
  {
    item: "Bank routing and account number",
    detail: "A blank check or bank document works. Gets your refund to you fastest, by direct deposit.",
  },
  {
    item: "Last year's tax return",
    detail: "A copy of last year's federal and state return, if you have one — speeds things up and helps catch mistakes.",
  },
  {
    item: "Both spouses present",
    detail: "To e-file a married-filing-jointly return, both spouses need to be there to sign.",
    appliesWhen: "If you're married and filing jointly.",
  },
];

export const TAX_GUIDE_LAST_VERIFIED = "2026-07-07";
