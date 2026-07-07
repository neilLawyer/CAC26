"use client";

import dynamic from "next/dynamic";
import { useState, type CSSProperties, type FormEvent } from "react";
import { NEAR_YOU } from "@/data/near-you";
import { useHousehold } from "@/lib/household-store";
import { money } from "@/lib/format";
import type { MapPoint } from "@/components/near-you/LocalMap";
import type { Leg, NearYouResponse } from "@/lib/near-you-types";

// "Help near you" — the address-driven local-results module. Everything the
// user sees (headings, the privacy consent line, every honesty note) comes
// from src/data/near-you.ts; every number and location comes from a federal
// API response; every failed source says so honestly. Nothing here invents
// anything.

const LocalMap = dynamic(() => import("@/components/near-you/LocalMap").then((m) => m.LocalMap), {
  ssr: false,
  loading: () => (
    <div className="h-72 rounded-xl border border-card-border bg-card animate-pulse" />
  ),
});

function UnavailableNote({ leg, label }: { leg: { reason: string }; label: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card/60 p-4">
      <p className="label-mono text-[10px] text-muted">{label}</p>
      <p className="text-sm text-muted mt-1">{leg.reason}</p>
    </div>
  );
}

function legOk<T>(leg: Leg<T> | undefined): leg is { status: "ok"; data: T } {
  return leg?.status === "ok";
}

export function NearYouPanel({ scopeId }: { scopeId: string }) {
  const config = NEAR_YOU[scopeId];
  const { household } = useHousehold();
  const [address, setAddress] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<NearYouResponse | null>(null);

  if (!config) return null;

  async function lookUp(e: FormEvent) {
    e.preventDefault();
    if (!config || address.trim().length < 4) return;
    setState("loading");
    try {
      const res = await fetch("/api/near-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          kind: config.kind,
          householdSize: household.householdSize,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult((await res.json()) as NearYouResponse);
      setState("done");
    } catch {
      setState("error");
    }
  }

  const geocode = result?.geocode;
  const mapCenter = legOk(geocode) ? { lat: geocode.data.lat, lon: geocode.data.lon } : null;

  const mapPoints: MapPoint[] = [];
  if (legOk(result?.lihtc)) {
    for (const p of result.lihtc.data) {
      if (p.lat !== undefined && p.lon !== undefined) {
        mapPoints.push({
          lat: p.lat,
          lon: p.lon,
          title: p.name,
          subtitle: `${p.address}, ${p.city}${p.liUnits ? ` · ${p.liUnits} affordable units` : ""}`,
        });
      }
    }
  }
  if (legOk(result?.healthCenters)) {
    for (const c of result.healthCenters.data) {
      if (c.lat !== undefined && c.lon !== undefined) {
        mapPoints.push({
          lat: c.lat,
          lon: c.lon,
          title: c.name,
          subtitle: `${c.address}, ${c.city}${c.phone ? ` · ${c.phone}` : ""}`,
        });
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{config.heading}</h2>
        <p className="text-sm text-muted">{config.intro}</p>
      </div>

      <form onSubmit={lookUp} className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, state"
            aria-label="Your address"
            className="flex-1 min-w-56 rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm focus:border-accent/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === "loading" || address.trim().length < 4}
            className={`press-weight rounded-full bg-accent text-[#04201c] text-sm font-semibold px-5 py-2.5 disabled:opacity-50 ${
              state === "loading" ? "locating" : ""
            }`}
            style={{ backgroundColor: "var(--scope-accent, var(--accent))" }}
          >
            {state === "loading" ? "Locating…" : "Look up my area"}
          </button>
        </div>
        <p className="text-xs text-muted italic">{config.consent}</p>
      </form>

      {state === "error" && (
        <p className="text-sm text-muted">
          Something went wrong on our end — nothing was saved. Try again in a moment.
        </p>
      )}

      {state === "done" && result && (
        <div className="space-y-4">
          {legOk(geocode) ? (
            <p className="rise-in text-sm" style={{ "--stagger": 0 } as CSSProperties}>
              <span className="scope-ink font-medium">Found:</span> {geocode.data.matchedAddress}{" "}
              <span className="text-muted">· {geocode.data.countyName}</span>
            </p>
          ) : (
            geocode && <UnavailableNote leg={geocode} label="address lookup" />
          )}

          {/* Housing: county rent benchmarks + income limits */}
          {result.fmr &&
            (legOk(result.fmr) ? (
              <div className="rise-in rounded-xl border border-card-border bg-card p-4 space-y-2" style={{ "--stagger": 1 } as CSSProperties}>
                <p className="label-mono text-[10px] scope-ink">
                  what rent actually costs here · HUD fair market rent {result.fmr.data.year}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {(
                    [
                      ["Studio", result.fmr.data.rents.efficiency],
                      ["1 bed", result.fmr.data.rents.oneBr],
                      ["2 bed", result.fmr.data.rents.twoBr],
                      ["3 bed", result.fmr.data.rents.threeBr],
                      ["4 bed", result.fmr.data.rents.fourBr],
                    ] as const
                  ).map(
                    ([label, v]) =>
                      v !== undefined && (
                        <span key={label}>
                          <span className="text-muted">{label}</span>{" "}
                          <strong>{money(v)}/mo</strong>
                        </span>
                      )
                  )}
                </div>
                <p className="text-xs text-muted">{result.fmr.data.areaName}</p>
              </div>
            ) : (
              <UnavailableNote leg={result.fmr} label="local rent benchmarks" />
            ))}

          {result.incomeLimits &&
            (legOk(result.incomeLimits) ? (
              <div className="rise-in rounded-xl border border-card-border bg-card p-4 space-y-2" style={{ "--stagger": 2 } as CSSProperties}>
                <p className="label-mono text-[10px] scope-ink">
                  HUD income limits for your county · {result.incomeLimits.data.year}
                  {household.householdSize ? ` · household of ${household.householdSize}` : ""}
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {result.incomeLimits.data.byHouseholdSize.veryLow !== undefined && (
                    <span>
                      <span className="text-muted">50% of area median</span>{" "}
                      <strong>{money(result.incomeLimits.data.byHouseholdSize.veryLow)}/yr</strong>
                    </span>
                  )}
                  {result.incomeLimits.data.byHouseholdSize.low !== undefined && (
                    <span>
                      <span className="text-muted">80%</span>{" "}
                      <strong>{money(result.incomeLimits.data.byHouseholdSize.low)}/yr</strong>
                    </span>
                  )}
                  {result.incomeLimits.data.byHouseholdSize.extremelyLow !== undefined && (
                    <span>
                      <span className="text-muted">30%</span>{" "}
                      <strong>
                        {money(result.incomeLimits.data.byHouseholdSize.extremelyLow)}/yr
                      </strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  Being under the 50% line is the priority band at most housing authorities —
                  these are the real numbers Section 8 uses in {result.incomeLimits.data.areaName}.
                </p>
              </div>
            ) : (
              <UnavailableNote leg={result.incomeLimits} label="income limits" />
            ))}

          {/* Map + list of real places */}
          {mapCenter && mapPoints.length > 0 && (
            <div className="rise-in" style={{ "--stagger": 3 } as CSSProperties}>
            <LocalMap
              center={mapCenter}
              points={mapPoints}
              accent="var(--scope-accent, var(--accent))"
            />
            </div>
          )}

          {result.lihtc &&
            (legOk(result.lihtc) ? (
              result.lihtc.data.length > 0 ? (
                <div className="space-y-2">
                  <p className="label-mono text-[10px] scope-ink">
                    affordable properties in your county · {result.lihtc.data.length} found
                  </p>
                  <ul className="grid gap-2">
                    {result.lihtc.data.slice(0, 12).map((p, i) => (
                      <li
                        key={`${p.name}-${i}`}
                        className="rise-in rounded-xl border border-card-border bg-card px-4 py-3 text-sm flex items-baseline justify-between gap-3"
                        style={{ "--stagger": i } as CSSProperties}
                      >
                        <span>
                          <span className="font-medium">{p.name}</span>{" "}
                          <span className="text-muted">
                            — {p.address}, {p.city}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted">
                          {p.liUnits ? `${p.liUnits} affordable units` : ""}
                          {p.lat === undefined ? " · not mapped (address imprecise)" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  HUD&apos;s database lists no LIHTC properties in this county — the housing authority
                  linked above is still the right next call.
                </p>
              )
            ) : (
              <UnavailableNote leg={result.lihtc} label="affordable properties" />
            ))}

          {result.healthCenters &&
            (legOk(result.healthCenters) ? (
              result.healthCenters.data.length > 0 ? (
                <div className="space-y-2">
                  <p className="label-mono text-[10px] scope-ink">
                    health centers within ~5 miles · {result.healthCenters.data.length} found
                  </p>
                  <ul className="grid gap-2">
                    {result.healthCenters.data.slice(0, 12).map((c, i) => (
                      <li
                        key={`${c.name}-${i}`}
                        className="rise-in rounded-xl border border-card-border bg-card px-4 py-3 text-sm"
                        style={{ "--stagger": i } as CSSProperties}
                      >
                        <span className="font-medium">{c.name}</span>{" "}
                        <span className="text-muted">
                          — {c.address}, {c.city}
                          {c.phone ? ` · ${c.phone}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  No HRSA health centers within about five miles of that address — HRSA&apos;s own
                  locator at findahealthcenter.hrsa.gov covers wider searches.
                </p>
              )
            ) : (
              <UnavailableNote leg={result.healthCenters} label="health centers" />
            ))}

          {config.honestyNotes.map((note) => (
            <p key={note.slice(0, 24)} className="text-xs text-muted">
              {note}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
