import { describe, expect, it } from "vitest";
import { compareCliff, safeRaiseMonthly, withExactIncome, likelyValue } from "@/lib/cliff";
import { evaluateAll } from "@/lib/engine";
import { monthlyFPL } from "@/data/fpl";
import type { Household, Program, ProgramRules } from "@/lib/types";

// Locks the cliff-simulator arithmetic found suspect in the v4 audit.
// Synthetic programs with flat-dollar limits wherever possible, so the tests
// don't silently drift when FPL data updates.

function prog(
  id: string,
  rules: Partial<ProgramRules>,
  value?: { min: number; max: number },
  extra?: Partial<Program>
): Program {
  return {
    id,
    name: id,
    shortName: id,
    state: "US",
    category: "food",
    summary: "synthetic test program",
    agencyName: "Test Agency",
    applyUrl: "https://example.gov/apply",
    sourceUrl: "https://example.gov",
    lastVerified: "2026-01-01",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
      ...rules,
    },
    estimatedAnnualValueMin: value?.min,
    estimatedAnnualValueMax: value?.max,
    ...extra,
  };
}

const HOUSEHOLD: Household = { state: "US", householdSize: 2, flags: {} };

// A gross-basis program with a hard cliff at $2,000/mo, worth $1,000–$2,000/yr
// (midpoint $1,500).
const cliffAt2000 = prog("cliff-2000", { maxIncomeFlatDollar: 2000 }, { min: 1000, max: 2000 });

describe("compareCliff — the displayed identity", () => {
  it("netEffect ≡ extraPay + benefitChange, at every increase", () => {
    const programs = [
      cliffAt2000,
      prog("cliff-2500", { maxIncomeFlatDollar: 2500 }, { min: 3000, max: 5000 }),
    ];
    for (const inc of [0, 100, 300, 500, 900, 2700]) {
      const c = compareCliff(programs, HOUSEHOLD, 1800, inc);
      expect(c.netEffectAnnual).toBe(c.extraPayAnnual + c.benefitChangeAnnual);
      expect(c.extraPayAnnual).toBe(inc * 12);
    }
  });

  it("a crossed limit loses the program, at its record midpoint", () => {
    // $1,800 → $2,300 crosses the $2,000 line: A is lost, worth −$1,500.
    const c = compareCliff([cliffAt2000], HOUSEHOLD, 1800, 500);
    expect(c.lost.map((d) => d.program.id)).toEqual(["cliff-2000"]);
    expect(c.lost[0].midpoint).toBe(1500);
    expect(c.lost[0].to).toBe("unlikely");
    expect(c.baselineLikelyValue).toBe(1500);
    expect(c.hypotheticalLikelyValue).toBe(0);
    expect(c.benefitChangeAnnual).toBe(-1500);
    // $500/mo more = $6,000/yr, minus $1,500 lost = +$4,500.
    expect(c.netEffectAnnual).toBe(4500);
  });

  it("an uncrossed limit changes nothing", () => {
    const c = compareCliff([cliffAt2000], HOUSEHOLD, 1500, 300); // 1800 ≤ 2000
    expect(c.lost).toEqual([]);
    expect(c.gained).toEqual([]);
    expect(c.benefitChangeAnnual).toBe(0);
    expect(c.netEffectAnnual).toBe(3600);
  });

  it("net-basis programs: counted while likely, and marked 'possible' (not flatly lost) once gross passes the line", () => {
    const netBasis = prog(
      "net-2000",
      { incomeBasis: "net", maxIncomeFlatDollar: 2000 },
      { min: 5000, max: 5000 }
    );
    const c = compareCliff([netBasis], HOUSEHOLD, 1800, 500);
    // It leaves the likely totals (we can no longer promise it)…
    expect(c.baselineLikelyValue).toBe(5000);
    expect(c.hypotheticalLikelyValue).toBe(0);
    // …but the delta says WHERE it landed: possible, because deductions may
    // still qualify the household — the UI words this as "at risk", not "lost".
    expect(c.lost[0].to).toBe("possible");
  });

  it("waitlist/formula programs (confidenceCap) never enter the totals at any income", () => {
    const capped = prog("waitlist", { maxIncomeFlatDollar: 10000 }, { min: 9000, max: 9000 }, {
      confidenceCap: "possible",
    });
    const c = compareCliff([capped], HOUSEHOLD, 1800, 500);
    expect(c.baselineLikelyValue).toBe(0);
    expect(c.hypotheticalLikelyValue).toBe(0);
    expect(c.lost).toEqual([]);
    expect(c.uncountedPossible).toBe(1);
  });

  it("income floors can be GAINED by a raise", () => {
    // Floor at 100% FPL for a household of 2.
    const floor = monthlyFPL(2);
    const floored = prog("floor-100fpl", { minIncomePctFPL: 100 }, { min: 2400, max: 2400 });
    const below = Math.round(floor * 0.8);
    const crossing = Math.round(floor * 0.4) + 100; // below + this > floor
    const c = compareCliff([floored], HOUSEHOLD, below, crossing);
    expect(c.gained.map((d) => d.program.id)).toEqual(["floor-100fpl"]);
    expect(c.benefitChangeAnnual).toBe(2400);
  });

  it("adjunctive (income-waived) programs survive any raise — rules-as-data honesty", () => {
    const wicLike = prog(
      "wic-like",
      { maxIncomeFlatDollar: 2000, incomeWaivedByFlags: ["receivesMedicaid"] },
      { min: 600, max: 600 }
    );
    const withMedicaid: Household = { ...HOUSEHOLD, flags: { receivesMedicaid: true } };
    const c = compareCliff([wicLike], withMedicaid, 1800, 3000);
    expect(c.lost).toEqual([]);
    expect(c.benefitChangeAnnual).toBe(0);
  });
});

describe("safeRaiseMonthly", () => {
  it("stops at the last increase before the first negative net effect", () => {
    // Worth $10,000/yr with a cliff at $2,000/mo: +$200 keeps it ($2,000 is
    // still within the limit), +$300 crosses and 3,600 − 10,000 < 0.
    const big = prog("big-cliff", { maxIncomeFlatDollar: 2000 }, { min: 10000, max: 10000 });
    expect(safeRaiseMonthly([big], HOUSEHOLD, 1800)).toBe(200);
  });

  it("is deliberately conservative: an interior dip caps it even if net recovers later", () => {
    const big = prog("big-cliff", { maxIncomeFlatDollar: 2000 }, { min: 10000, max: 10000 });
    // At +$1,000/mo the net is 12,000 − 10,000 = +2,000 — positive again.
    const recovered = compareCliff([big], HOUSEHOLD, 1800, 1000);
    expect(recovered.netEffectAnnual).toBeGreaterThan(0);
    // The scan still reports the pre-dip maximum, never skating over the dip.
    expect(safeRaiseMonthly([big], HOUSEHOLD, 1800)).toBe(200);
  });

  it("reports the scan ceiling when no cliff exists in range", () => {
    const gentle = prog("no-cliff", {}, { min: 500, max: 500 });
    expect(safeRaiseMonthly([gentle], HOUSEHOLD, 1800, 100, 1000)).toBe(1000);
  });
});

describe("likelyValue basis", () => {
  it("counts only LIKELY results — possible/needsInfo/unlikely all excluded", () => {
    const likely = prog("a", { maxIncomeFlatDollar: 5000 }, { min: 1000, max: 1000 });
    const possible = prog("b", { maxIncomeFlatDollar: 5000 }, { min: 1000, max: 1000 }, {
      confidenceCap: "possible",
    });
    const results = evaluateAll([likely, possible], withExactIncome(HOUSEHOLD, 2000));
    expect(results.map((r) => r.confidence).sort()).toEqual(["likely", "possible"]);
    expect(likelyValue(results)).toBe(1000);
  });
});
