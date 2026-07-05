// 2026 HHS Federal Poverty Guidelines (48 contiguous states + DC), annual dollars.
// Source: https://aspe.hhs.gov/poverty-guidelines — verify against the current
// year before relying on this for a real determination (ground rule: data-freshness).
export const FPL_LAST_VERIFIED = "2026-01-15";

const FPL_BASE_1_PERSON = 15960;
const FPL_PER_ADDITIONAL_PERSON = 5680;

export function annualFPL(householdSize: number): number {
  const size = Math.max(1, Math.round(householdSize));
  return FPL_BASE_1_PERSON + (size - 1) * FPL_PER_ADDITIONAL_PERSON;
}

export function monthlyFPL(householdSize: number): number {
  return annualFPL(householdSize) / 12;
}

/** Given a monthly income, what % of the FPL (monthly) does it represent? */
export function pctOfMonthlyFPL(monthlyIncome: number, householdSize: number): number {
  const fpl = monthlyFPL(householdSize);
  if (fpl <= 0) return Infinity;
  return (monthlyIncome / fpl) * 100;
}
