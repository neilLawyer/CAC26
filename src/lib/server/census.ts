// Server-only: calls the U.S. Census Bureau's public geocoder. The address is
// sent to census.gov and never stored or logged by this app.

import type { GeocodeResult, Leg } from "@/lib/near-you-types";

interface CensusGeography {
  GEOID?: string;
  NAME?: string;
}

interface CensusAddressMatch {
  matchedAddress?: string;
  coordinates?: { x?: number; y?: number };
  geographies?: {
    Counties?: CensusGeography[];
    "Census Tracts"?: CensusGeography[];
  };
}

interface CensusGeocodeResponse {
  result?: {
    addressMatches?: CensusAddressMatch[];
  };
}

const GEOCODER_URL =
  "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";

const UNAVAILABLE_NO_MATCH: Leg<GeocodeResult> = {
  status: "unavailable",
  reason:
    "The Census geocoder couldn't match that address — try adding city and state.",
};

const UNAVAILABLE_NO_RESPONSE: Leg<GeocodeResult> = {
  status: "unavailable",
  reason: "The Census geocoder isn't responding right now — try again in a minute.",
};

export async function geocodeAddress(address: string): Promise<Leg<GeocodeResult>> {
  const params = new URLSearchParams({
    address,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    format: "json",
  });

  let response: Response;
  try {
    response = await fetch(`${GEOCODER_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return UNAVAILABLE_NO_RESPONSE;
  }

  if (!response.ok) {
    return UNAVAILABLE_NO_RESPONSE;
  }

  let body: CensusGeocodeResponse;
  try {
    body = (await response.json()) as CensusGeocodeResponse;
  } catch {
    return UNAVAILABLE_NO_RESPONSE;
  }

  const match = body.result?.addressMatches?.[0];
  if (!match) {
    return UNAVAILABLE_NO_MATCH;
  }

  const lon = match.coordinates?.x;
  const lat = match.coordinates?.y;
  const county = match.geographies?.["Counties"]?.[0];
  const tract = match.geographies?.["Census Tracts"]?.[0];

  if (
    !match.matchedAddress ||
    lat === undefined ||
    lon === undefined ||
    !county?.GEOID ||
    !county?.NAME ||
    !tract?.GEOID
  ) {
    return UNAVAILABLE_NO_MATCH;
  }

  const data: GeocodeResult = {
    matchedAddress: match.matchedAddress,
    lat,
    lon,
    countyFips: county.GEOID,
    countyName: county.NAME,
    tractGeoid: tract.GEOID,
  };

  return { status: "ok", data };
}
