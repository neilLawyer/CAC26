// Merit and non-income scholarships — real awards only, each verified against
// its official page. Rules-as-data: adding a scholarship = adding an entry here.
//
// Scope note: this track is explicitly NOT gated on income (the app's main
// program library already covers need-based aid). A few well-known "merit"
// names were checked and turned out to require a family-income ceiling to
// even apply (QuestBridge, The Gates Scholarship, Jack Kent Cooke Foundation
// College Scholarship Program) or to be pure need-based state aid (NY
// Excelsior/TAP) — those are intentionally left out of this file rather than
// misfiled as non-income.

export interface Scholarship {
  id: string; // kebab-case, e.g. "national-merit"
  name: string; // official program name
  sponsor: string; // sponsoring org
  officialUrl: string; // the official program page (verify it's the org's own domain)
  kind: "academic-merit" | "essay-contest" | "state-merit" | "competition" | "service-leadership";
  blurb: string; // ONE plain-language sentence, ~6th-grade level, no figures unless verified
  eligibilityNote: string; // who can enter (grade level, residency, PSAT requirement, etc.) — from the official page
  awardNote?: string; // award amount/range ONLY if stated on the official page; otherwise OMIT the field
  deadlineWindow?: string; // hedged window from the official page, e.g. "Applications typically due in October" — no invented precise dates
  states?: string[]; // two-letter codes, ONLY for kind "state-merit"
  lastVerified: string; // today's date, ISO — you actually checked the page today
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "national-merit",
    name: "National Merit Scholarship Program",
    sponsor: "National Merit Scholarship Corporation",
    officialUrl: "https://www.nationalmerit.org/",
    kind: "academic-merit",
    blurb: "A yearly academic contest that starts with the PSAT/NMSQT and can lead to college scholarship money.",
    eligibilityNote:
      "Entered by taking the PSAT/NMSQT in 11th grade; top scorers in each state become Semifinalists, then compete to become Finalists. Not income-based.",
    awardNote: "About 6,930 National Merit Scholarships worth nearly $26 million were offered in the 2026 competition; NMSC scholarships are $2,500, with separate college-sponsored awards of $500-$2,000 per year.",
    deadlineWindow: "No separate application — eligibility starts by taking the PSAT/NMSQT in the fall of 11th grade; the Semifinalist application is typically due in early-to-mid October of senior year.",
    lastVerified: "2026-07-07",
  },
  {
    id: "coca-cola-scholars",
    name: "Coca-Cola Scholars Program",
    sponsor: "Coca-Cola Scholars Foundation",
    officialUrl: "https://www.coca-colascholarsfoundation.org/apply/",
    kind: "academic-merit",
    blurb: "An achievement scholarship for graduating seniors who show leadership and service, not financial need.",
    eligibilityNote:
      "Open to high school seniors graduating in the current academic year with at least a 3.0 GPA; must be a U.S. citizen, permanent resident, or in another eligible immigration category. Judged on leadership and service, not income.",
    awardNote: "$20,000 scholarship, awarded to 150 students each year.",
    deadlineWindow: "Applications typically open in early August and close at the end of September.",
    lastVerified: "2026-07-07",
  },
  {
    id: "vfw-voice-of-democracy",
    name: "Voice of Democracy",
    sponsor: "Veterans of Foreign Wars (VFW) and its Auxiliary",
    officialUrl: "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    kind: "essay-contest",
    blurb: "An audio-essay contest on a patriotic theme, open to any high schooler, with no income requirement.",
    eligibilityNote:
      "Open to students in grades 9-12 in a public, private, parochial, or home school in the U.S. or its territories. U.S. citizenship isn't required, but non-citizens must be lawful permanent residents (or have a pending application) intending to become citizens. Foreign exchange students and students 20 or older are not eligible.",
    awardNote: "More than $1.6 million in scholarships and incentives are awarded nationally each year; the top national prize is $35,000, with other national awards up to $21,000 and at least $1,000 for each state's first-place winner.",
    deadlineWindow: "Entries are due to a local VFW Post by midnight on October 31.",
    lastVerified: "2026-07-07",
  },
  {
    id: "vfw-patriots-pen",
    name: "Patriot's Pen",
    sponsor: "Veterans of Foreign Wars (VFW) and its Auxiliary",
    officialUrl: "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    kind: "essay-contest",
    blurb: "A short written-essay contest on a patriotic theme for middle schoolers, with no income requirement.",
    eligibilityNote:
      "Open to students in grades 6-8 in a public, private, parochial, or home school in the U.S. Foreign exchange students and adults are not eligible. U.S. citizenship isn't required, but non-citizens must be lawful permanent residents (or have a pending application) intending to become citizens.",
    awardNote: "Awards at all levels of the competition total $1.2 million each year; the national first-place award is currently $5,000, with all national winners receiving at least $500.",
    deadlineWindow: "Entries are due to a local VFW Post by midnight on October 31.",
    lastVerified: "2026-07-07",
  },
  {
    id: "nhs-scholarship",
    name: "NHS Scholarship",
    sponsor: "National Association of Secondary School Principals (NASSP) / National Honor Society",
    officialUrl: "https://www.nationalhonorsociety.org/advisers/the-nhs-scholarship/",
    kind: "academic-merit",
    blurb: "A scholarship for graduating seniors who are active National Honor Society members in good standing.",
    eligibilityNote:
      "Open to high school seniors who are active, verified members in good standing of a National Honor Society chapter and plan to attend an accredited U.S. college, military institute, or trade school. Judged on NHS's four pillars — scholarship, service, leadership, and character — not income.",
    awardNote: "$2 million is awarded annually to 600 students, with individual awards ranging from $3,200 to $25,000.",
    deadlineWindow: "Applications typically open in September and close in late November.",
    lastVerified: "2026-07-07",
  },
  {
    id: "american-legion-oratorical",
    name: "National High School Oratorical Contest",
    sponsor: "The American Legion",
    officialUrl: "https://www.legion.org/get-involved/youth-programs/oratorical-contest",
    kind: "essay-contest",
    blurb: "A public-speaking contest about the U.S. Constitution, judged on speaking skill, not family income.",
    eligibilityNote:
      "Open to students under 20 enrolled in grades 9-12 (public, parochial, military, private, or home school) who are U.S. citizens or lawful permanent residents. Contestants compete through the American Legion department where they live or attend school.",
    awardNote: "The national contest is set to award more than $203,500 in scholarships in 2026 across quarterfinalists, semifinalists, and finalists; the national first-place award is $25,000.",
    deadlineWindow: "Entry timing is set locally by each American Legion post/department; national finals are held in the spring.",
    lastVerified: "2026-07-07",
  },
  {
    id: "jfk-profile-in-courage",
    name: "Profile in Courage Essay Contest",
    sponsor: "John F. Kennedy Presidential Library and Museum",
    officialUrl: "https://www.jfklibrary.org/learn/education/profile-in-courage-essay-contest",
    kind: "essay-contest",
    blurb: "A national essay contest about a political leader who showed courage, open to any high schooler.",
    eligibilityNote:
      "Open to U.S. high school students in grades 9-12 (public, private, parochial, or home school), students under 20 in a GED/correspondence program, and U.S. citizens attending school overseas. Not income-based; requires a nominating teacher.",
    awardNote: "First place receives $10,000; second place $3,000; three finalists receive $1,000 each.",
    deadlineWindow: "Entries are typically due in early-to-mid January.",
    lastVerified: "2026-07-07",
  },
  {
    id: "elks-most-valuable-student",
    name: "Most Valuable Student Scholarship",
    sponsor: "Elks National Foundation",
    officialUrl: "https://www.elks.org/scholars/scholarships/mvs.cfm",
    kind: "service-leadership",
    blurb: "A leadership scholarship for graduating seniors, open to everyone regardless of Elks membership.",
    eligibilityNote:
      "Open to U.S. citizen high school seniors planning full-time enrollment in a four-year undergraduate program; no family connection to the Elks is required. Judging weighs scholarship and leadership alongside financial need as one of three factors, so unlike a pure merit award, financial circumstances do affect scoring — there is no income cutoff to apply.",
    awardNote: "500 four-year scholarships are awarded, ranging from $1,000 to $7,500 per year; the top 20 winners receive $30,000 total and the other 480 finalists receive $4,000 each.",
    deadlineWindow: "Applications typically open August 1 and are due in November.",
    lastVerified: "2026-07-07",
  },
  {
    id: "regeneron-sts",
    name: "Regeneron Science Talent Search",
    sponsor: "Society for Science",
    officialUrl: "https://www.societyforscience.org/regeneron-sts/",
    kind: "competition",
    blurb: "The country's oldest science and math competition for seniors who complete an original research project.",
    eligibilityNote:
      "Open only to high school seniors who complete an original, independent research project; requires U.S. citizenship or permanent residency (or attendance at a U.S.-accredited school abroad). Judged on research and a holistic application, not family income.",
    deadlineWindow: "The application typically opens in the spring and closes in early November.",
    lastVerified: "2026-07-07",
  },
  {
    id: "scholastic-art-writing-awards",
    name: "Scholastic Art & Writing Awards",
    sponsor: "Alliance for Young Artists & Writers",
    officialUrl: "https://www.artandwriting.org/",
    kind: "competition",
    blurb: "A national contest recognizing teen artists and writers across 29 categories, with fee waivers available.",
    eligibilityNote:
      "Open to students in grades 7-12, age 13 or older, in the U.S., U.S. territories, military bases abroad, or Canada; homeschooled students are welcome. Work must be original; entry fees can be waived for students who need it, so cost isn't a barrier to entry.",
    awardNote: "National Medalists are eligible for scholarships of up to $12,500.",
    deadlineWindow: "Regional deadlines vary by affiliate, generally in the fall and winter.",
    lastVerified: "2026-07-07",
  },
  {
    id: "ga-hope-zell-miller",
    name: "HOPE Scholarship & Zell Miller Scholarship",
    sponsor: "Georgia Student Finance Commission",
    officialUrl: "https://www.gafutures.org/hope-state-aid-programs/hope-zell-miller-scholarships/",
    kind: "state-merit",
    blurb: "Georgia's state scholarships that pay toward college tuition for residents with strong grades, funded by the state lottery.",
    eligibilityNote:
      "Georgia residents attending an eligible Georgia college; HOPE requires a 3.0 HOPE GPA, while Zell Miller (the higher award) requires a 3.7 high school GPA plus a qualifying SAT (1200 combined math and reading/writing) or ACT (26) score. No income or financial-need test.",
    awardNote: "HOPE pays a per-credit-hour amount toward tuition; Zell Miller pays the full standard undergraduate tuition rate.",
    deadlineWindow: "Eligibility is set through the FAFSA/GSFAPP process tied to high school graduation and college enrollment each year.",
    states: ["GA"],
    lastVerified: "2026-07-07",
  },
  {
    id: "fl-bright-futures",
    name: "Florida Bright Futures Scholarship Program",
    sponsor: "Florida Department of Education",
    officialUrl: "https://www.floridabrightfutures.gov/",
    kind: "state-merit",
    blurb: "Florida's merit scholarship program that helps pay college costs for residents based on grades, test scores, and volunteer hours.",
    eligibilityNote:
      "Florida residents and U.S. citizens/eligible non-citizens graduating from an eligible Florida high school (or equivalent); requirements vary by award tier and include minimum GPA, standardized test scores, required course credits, and volunteer or paid work hours. No income or financial-need test.",
    awardNote: "The top tier (Florida Academic Scholars) pays 100% of tuition and applicable fees; lower tiers pay a partial amount.",
    deadlineWindow: "The Florida Financial Aid Application is typically due by August 31 of the year of high school graduation.",
    states: ["FL"],
    lastVerified: "2026-07-07",
  },
  {
    id: "sc-life-scholarship",
    name: "LIFE Scholarship",
    sponsor: "South Carolina Commission on Higher Education",
    officialUrl: "https://www.che.sc.gov/students-families-and-military/scholarships-and-grants-sc-residents",
    kind: "state-merit",
    blurb: "A South Carolina merit scholarship for residents who meet at least two of three academic benchmarks.",
    eligibilityNote:
      "South Carolina residents and U.S. citizens/eligible non-citizens who are full-time undergraduates seeking a first degree; must meet at least two of: 3.0 cumulative GPA, 1100 combined SAT (or 22 ACT), or top 30% of graduating class. No income or financial-need test.",
    awardNote: "Up to $5,000 per year ($4,700 toward tuition plus $300 for textbooks); an Enhancement adds $2,500 more for eligible math/science majors.",
    states: ["SC"],
    lastVerified: "2026-07-07",
  },
];
