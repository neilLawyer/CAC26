// Server-only: queries HRSA's Primary Health Care Facilities layer for
// federally-funded health centers within ~5 miles of a point.

import type { HealthCenterSite, Leg } from "@/lib/near-you-types";

const QUERY_URL =
  "https://gisportal.hrsa.gov/server/rest/services/HealthCareFacilities/PrimaryHealthCareFacilities_FS/MapServer/0/query";

const OUT_FIELDS =
  "SITE_NM,SITE_ADDRESS,SITE_CITY,SITE_STATE_ABBR,SITE_PHONE_NUM,SITE_URL";

const UNAVAILABLE: Leg<HealthCenterSite[]> = {
  status: "unavailable",
  reason: "HRSA's health-center locator isn't responding right now.",
};

interface HrsaAttributes {
  SITE_NM?: string;
  SITE_ADDRESS?: string;
  SITE_CITY?: string;
  SITE_STATE_ABBR?: string;
  SITE_PHONE_NUM?: string;
  SITE_URL?: string;
}

interface HrsaFeature {
  attributes: HrsaAttributes;
  geometry?: { x?: number; y?: number };
}

interface HrsaQueryResponse {
  features?: HrsaFeature[];
  error?: { code?: number; message?: string };
}

export async function nearbyHealthCenters(
  lat: number,
  lon: number
): Promise<Leg<HealthCenterSite[]>> {
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    distance: "8000",
    units: "esriSRUnit_Meter",
    spatialRel: "esriSpatialRelIntersects",
    outFields: OUT_FIELDS,
    returnGeometry: "true",
    outSR: "4326",
    resultRecordCount: "25",
    f: "json",
  });

  let response: Response;
  try {
    response = await fetch(`${QUERY_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return UNAVAILABLE;
  }

  if (!response.ok) {
    return UNAVAILABLE;
  }

  let body: HrsaQueryResponse;
  try {
    body = (await response.json()) as HrsaQueryResponse;
  } catch {
    return UNAVAILABLE;
  }

  if (body.error || !body.features) {
    return UNAVAILABLE;
  }

  const sites: HealthCenterSite[] = body.features
    .filter((f) => f.attributes.SITE_NM && f.attributes.SITE_NM.trim() !== "")
    .map((f) => ({
      name: f.attributes.SITE_NM!,
      address: f.attributes.SITE_ADDRESS ?? "",
      city: f.attributes.SITE_CITY ?? "",
      state: f.attributes.SITE_STATE_ABBR ?? "",
      phone: f.attributes.SITE_PHONE_NUM,
      url: f.attributes.SITE_URL,
      lat: f.geometry?.y,
      lon: f.geometry?.x,
    }));

  return { status: "ok", data: sites };
}
