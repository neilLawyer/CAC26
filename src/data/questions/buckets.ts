export interface IncomeBucket {
  label: string;
  min: number;
  max: number;
}

// Income entered as ranges, not exact numbers (fewer errors, less drop-off).
export const INCOME_BUCKETS: IncomeBucket[] = [
  { label: "Under $1,000/mo", min: 0, max: 1000 },
  { label: "$1,000 – $1,500/mo", min: 1000, max: 1500 },
  { label: "$1,500 – $2,000/mo", min: 1500, max: 2000 },
  { label: "$2,000 – $2,500/mo", min: 2000, max: 2500 },
  { label: "$2,500 – $3,000/mo", min: 2500, max: 3000 },
  { label: "$3,000 – $4,000/mo", min: 3000, max: 4000 },
  { label: "$4,000 – $5,000/mo", min: 4000, max: 5000 },
  { label: "$5,000 – $7,000/mo", min: 5000, max: 7000 },
  { label: "$7,000+/mo", min: 7000, max: 999999 },
];

// Rough savings/resources ranges, for the programs that test countable assets
// (e.g. SSI, CAPI). Only shown when such a program is still in play.
export const ASSET_BUCKETS: IncomeBucket[] = [
  { label: "Under $2,000", min: 0, max: 2000 },
  { label: "$2,000 – $5,000", min: 2000, max: 5000 },
  { label: "$5,000 – $10,000", min: 5000, max: 10000 },
  { label: "More than $10,000", min: 10000, max: 9999999 },
];
