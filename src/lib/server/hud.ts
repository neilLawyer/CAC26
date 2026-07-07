// Server-only: calls HUD's PD&R API for Fair Market Rents and income limits.
// Requires a free HUD_TOKEN (see .env.example / README).

import type { FmrData, IncomeLimitsData, Leg } from "@/lib/near-you-types";

const BASE_URL = "https://www.huduser.gov/hudapi/public";

const NO_TOKEN_REASON =
  "Local rent and income-limit data needs a free HUD API token — see the README to enable it.";
const FMR_UNAVAILABLE_REASON =
  "HUD's income-limit service didn't respond (or the token is invalid) — rent benchmarks are temporarily unavailable.";
const IL_UNAVAILABLE_REASON =
  "HUD's income-limit service didn't respond (or the token is invalid) — rent benchmarks are temporarily unavailable.";

interface HudFmrBasicData {
  "Efficiency"?: number;
  "One-Bedroom"?: number;
  "Two-Bedroom"?: number;
  "Three-Bedroom"?: number;
  "Four-Bedroom"?: number;
  year?: number | string;
  smallarea_status?: string;
}

interface HudFmrResponse {
  data?: {
    basicdata?: HudFmrBasicData | HudFmrBasicData[];
    area_name?: string;
    year?: number | string;
  };
}

interface HudIncomeLimitBand {
  [key: string]: number | undefined;
}

interface HudIlResponse {
  data?: {
    median_income?: number | string;
    year?: number | string;
    area_name?: string;
    county_name?: string;
    very_low?: HudIncomeLimitBand;
    extremely_low?: HudIncomeLimitBand;
    low?: HudIncomeLimitBand;
  };
}

function toEntityId(countyFips: string): string {
  return `${countyFips}99999`;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export async function getFmr(countyFips: string): Promise<Leg<FmrData>> {
  const token = process.env.HUD_TOKEN;
  if (!token) {
    return { status: "unavailable", reason: NO_TOKEN_REASON };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/fmr/data/${toEntityId(countyFips)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { status: "unavailable", reason: FMR_UNAVAILABLE_REASON };
  }

  if (!response.ok) {
    return { status: "unavailable", reason: FMR_UNAVAILABLE_REASON };
  }

  let body: HudFmrResponse;
  try {
    body = (await response.json()) as HudFmrResponse;
  } catch {
    return { status: "unavailable", reason: FMR_UNAVAILABLE_REASON };
  }

  const basicdata = body.data?.basicdata;
  let entry: HudFmrBasicData | undefined;
  if (Array.isArray(basicdata)) {
    entry = basicdata.find((item) => item.smallarea_status === "0") ?? basicdata[0];
  } else {
    entry = basicdata;
  }

  if (!entry) {
    return { status: "unavailable", reason: FMR_UNAVAILABLE_REASON };
  }

  const data: FmrData = {
    year: toNumber(entry.year ?? body.data?.year) ?? new Date().getFullYear(),
    areaName: body.data?.area_name ?? "",
    rents: {
      efficiency: toNumber(entry["Efficiency"]),
      oneBr: toNumber(entry["One-Bedroom"]),
      twoBr: toNumber(entry["Two-Bedroom"]),
      threeBr: toNumber(entry["Three-Bedroom"]),
      fourBr: toNumber(entry["Four-Bedroom"]),
    },
  };

  return { status: "ok", data };
}

export async function getIncomeLimits(
  countyFips: string,
  householdSize?: number
): Promise<Leg<IncomeLimitsData>> {
  const token = process.env.HUD_TOKEN;
  if (!token) {
    return { status: "unavailable", reason: NO_TOKEN_REASON };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/il/data/${toEntityId(countyFips)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { status: "unavailable", reason: IL_UNAVAILABLE_REASON };
  }

  if (!response.ok) {
    return { status: "unavailable", reason: IL_UNAVAILABLE_REASON };
  }

  let body: HudIlResponse;
  try {
    body = (await response.json()) as HudIlResponse;
  } catch {
    return { status: "unavailable", reason: IL_UNAVAILABLE_REASON };
  }

  const size = Math.min(householdSize ?? 4, 8);
  const d = body.data;
  if (!d) {
    return { status: "unavailable", reason: IL_UNAVAILABLE_REASON };
  }

  const data: IncomeLimitsData = {
    year: toNumber(d.year) ?? new Date().getFullYear(),
    areaName: d.area_name ?? d.county_name ?? "",
    byHouseholdSize: {
      extremelyLow: toNumber(d.extremely_low?.[`il30_p${size}`]),
      veryLow: toNumber(d.very_low?.[`il50_p${size}`]),
      low: toNumber(d.low?.[`il80_p${size}`]),
    },
    medianIncome: toNumber(d.median_income),
  };

  return { status: "ok", data };
}
