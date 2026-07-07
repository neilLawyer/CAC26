import { geocodeAddress } from "@/lib/server/census";
import { getFmr, getIncomeLimits } from "@/lib/server/hud";
import { nearbyLihtc } from "@/lib/server/lihtc";
import { nearbyHealthCenters } from "@/lib/server/hrsa";
import type { NearYouKind, NearYouRequest, NearYouResponse } from "@/lib/near-you-types";

// Never cache: every response is specific to the address the visitor typed,
// and the address is never stored — it must be re-geocoded on every request.
export const dynamic = "force-dynamic";

interface RawNearYouRequest {
  address?: unknown;
  kind?: unknown;
  householdSize?: unknown;
}

function isValidKind(kind: unknown): kind is NearYouKind {
  return kind === "housing" || kind === "health";
}

export async function POST(request: Request) {
  let body: RawNearYouRequest;
  try {
    body = (await request.json()) as RawNearYouRequest;
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (!address) {
    return Response.json({ error: "An address is required." }, { status: 400 });
  }

  if (!isValidKind(body.kind)) {
    return Response.json(
      { error: "kind must be 'housing' or 'health'." },
      { status: 400 }
    );
  }

  const householdSize =
    typeof body.householdSize === "number" && Number.isFinite(body.householdSize)
      ? body.householdSize
      : undefined;

  const parsed: NearYouRequest = { address, kind: body.kind, householdSize };

  const geocode = await geocodeAddress(parsed.address);

  if (geocode.status === "unavailable") {
    const response: NearYouResponse = { geocode };
    return Response.json(response);
  }

  const { countyFips, lat, lon } = geocode.data;

  if (parsed.kind === "housing") {
    const [fmr, incomeLimits, lihtc] = await Promise.all([
      getFmr(countyFips),
      getIncomeLimits(countyFips, parsed.householdSize),
      nearbyLihtc(countyFips),
    ]);

    const response: NearYouResponse = { geocode, fmr, incomeLimits, lihtc };
    return Response.json(response);
  }

  const healthCenters = await nearbyHealthCenters(lat, lon);
  const response: NearYouResponse = { geocode, healthCenters };
  return Response.json(response);
}
