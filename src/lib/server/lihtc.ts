// Server-only: queries HUD's LIHTC (Low-Income Housing Tax Credit) property
// feature layer for properties in the given county.

import type { Leg, LihtcProperty } from "@/lib/near-you-types";

const QUERY_URL =
  "https://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/LIHTC/FeatureServer/0/query";

const OUT_FIELDS =
  "PROJECT,PROJ_ADD,PROJ_CTY,PROJ_ST,PROJ_ZIP,LI_UNITS,N_UNITS,LVL2KX,CNTY2KX";

const UNAVAILABLE: Leg<LihtcProperty[]> = {
  status: "unavailable",
  reason: "HUD's affordable-housing property data isn't responding right now.",
};

interface LihtcAttributes {
  PROJECT?: string;
  PROJ_ADD?: string;
  PROJ_CTY?: string;
  PROJ_ST?: string;
  PROJ_ZIP?: string;
  LI_UNITS?: number;
  N_UNITS?: number;
  LVL2KX?: string;
  CNTY2KX?: string;
}

interface LihtcFeature {
  attributes: LihtcAttributes;
  geometry?: { x?: number; y?: number };
}

interface LihtcQueryResponse {
  features?: LihtcFeature[];
  error?: { code?: number; message?: string };
}

async function runQuery(whereClause: string): Promise<LihtcQueryResponse | undefined> {
  const params = new URLSearchParams({
    where: whereClause,
    outFields: OUT_FIELDS,
    returnGeometry: "true",
    outSR: "4326",
    resultRecordCount: "100",
    f: "json",
  });

  const response = await fetch(`${QUERY_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    return undefined;
  }

  const body = (await response.json()) as LihtcQueryResponse;
  if (body.error) {
    return undefined;
  }
  return body;
}

function mapFeature(feature: LihtcFeature): LihtcProperty | undefined {
  const attrs = feature.attributes;
  if (!attrs.PROJECT || attrs.PROJECT.trim() === "") {
    return undefined;
  }

  const includeCoords = attrs.LVL2KX === "R" || attrs.LVL2KX === "4";

  return {
    name: attrs.PROJECT,
    address: attrs.PROJ_ADD ?? "",
    city: attrs.PROJ_CTY ?? "",
    state: attrs.PROJ_ST ?? "",
    zip: attrs.PROJ_ZIP,
    liUnits: attrs.LI_UNITS,
    totalUnits: attrs.N_UNITS,
    lat: includeCoords ? feature.geometry?.y : undefined,
    lon: includeCoords ? feature.geometry?.x : undefined,
  };
}

export async function nearbyLihtc(countyFips: string): Promise<Leg<LihtcProperty[]>> {
  const stateCode = countyFips.slice(0, 2);
  const countyCode = countyFips.slice(2, 5);
  // VERIFIED live quirk: CNTY2KX is a 3-char string field but HUD stores the
  // values UNPADDED ('13' for Essex County's '013') — query both spellings.
  const countyUnpadded = String(parseInt(countyCode, 10));

  try {
    let result = await runQuery(
      `STATE2KX='${stateCode}' AND CNTY2KX IN ('${countyCode}','${countyUnpadded}')`
    );
    let features: LihtcFeature[];

    if (result?.features) {
      features = result.features;
    } else {
      result = await runQuery(`STATE2KX='${stateCode}'`);
      if (!result?.features) {
        return UNAVAILABLE;
      }
      features = result.features.filter(
        (f) => f.attributes.CNTY2KX === countyCode || f.attributes.CNTY2KX === countyUnpadded
      );
    }

    const properties = features
      .map(mapFeature)
      .filter((p): p is LihtcProperty => p !== undefined);

    properties.sort((a, b) => {
      const aMapped = a.lat !== undefined && a.lon !== undefined;
      const bMapped = b.lat !== undefined && b.lon !== undefined;
      if (aMapped !== bMapped) return aMapped ? -1 : 1;
      return (b.liUnits ?? 0) - (a.liUnits ?? 0);
    });

    return { status: "ok", data: properties.slice(0, 40) };
  } catch {
    return UNAVAILABLE;
  }
}
