// Shared contract for the "help near you" pipeline. The server route
// (src/app/api/near-you/route.ts) produces NearYouResponse; the client panel
// renders it. Every leg fails independently and honestly: a failed source is
// reported as unavailable with a reason — never blank, never invented.

/** One leg of the pipeline either produced data or says exactly why not. */
export type Leg<T> =
  | { status: "ok"; data: T }
  | { status: "unavailable"; reason: string };

export interface GeocodeResult {
  /** The address as the Census Bureau matched it — shown back to the user. */
  matchedAddress: string;
  lat: number;
  lon: number;
  /** 5-digit county FIPS (state + county). */
  countyFips: string;
  countyName: string;
  /** 11-digit census tract GEOID. */
  tractGeoid: string;
}

export interface FmrData {
  year: number;
  /** Metro/county area name as HUD labels it. */
  areaName: string;
  /** Fair Market Rent by bedroom count, dollars/month. */
  rents: { efficiency?: number; oneBr?: number; twoBr?: number; threeBr?: number; fourBr?: number };
}

export interface IncomeLimitsData {
  year: number;
  areaName: string;
  /** HUD income limits for the household's size, dollars/year. */
  byHouseholdSize: {
    extremelyLow?: number; // 30% AMI
    veryLow?: number; // 50% AMI — the Section 8 priority band
    low?: number; // 80% AMI
  };
  medianIncome?: number;
}

export interface LihtcProperty {
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  /** Low-income units / total units, when HUD has them. */
  liUnits?: number;
  totalUnits?: number;
  /** Only present when HUD's geocode accuracy (LVL2KX) is 'R' or '4'. */
  lat?: number;
  lon?: number;
}

export interface HealthCenterSite {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  url?: string;
  lat?: number;
  lon?: number;
}

export interface NearYouResponse {
  geocode: Leg<GeocodeResult>;
  /** Housing legs — only populated when requested with kind: "housing". */
  fmr?: Leg<FmrData>;
  incomeLimits?: Leg<IncomeLimitsData>;
  lihtc?: Leg<LihtcProperty[]>;
  /** Health leg — only populated when requested with kind: "health". */
  healthCenters?: Leg<HealthCenterSite[]>;
}

export type NearYouKind = "housing" | "health";

export interface NearYouRequest {
  address: string;
  kind: NearYouKind;
  /** Household size, for picking the right income-limit row. */
  householdSize?: number;
}
