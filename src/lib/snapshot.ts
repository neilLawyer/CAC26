import type { Confidence, EligibilityResult } from "@/lib/types";

// "What changed?" — an on-device snapshot of where every program stood, so a
// returning household sees only the delta ("since last time: you now likely
// qualify for WIC"). localStorage only: no accounts, no server, no timestamps
// leaving the device. Deleting it is one click and it's actually gone.

const KEY = "opendoor-snapshot";

export interface Snapshot {
  savedAt: string; // ISO date
  state: string;
  confidences: Record<string, Confidence>;
}

export interface SnapshotDiff {
  savedAt: string;
  /** Crossed INTO "likely" since the snapshot (or brand-new to the library and likely). */
  nowLikely: EligibilityResult[];
  /** Was "likely" at the snapshot, isn't anymore. */
  noLongerLikely: { result: EligibilityResult; was: Confidence }[];
}

export function makeSnapshot(state: string, results: EligibilityResult[]): Snapshot {
  return {
    savedAt: new Date().toISOString().slice(0, 10),
    state,
    confidences: Object.fromEntries(results.map((r) => [r.program.id, r.confidence])),
  };
}

export function saveSnapshot(snapshot: Snapshot): void {
  window.localStorage.setItem(KEY, JSON.stringify(snapshot));
}

export function loadSnapshot(): Snapshot | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    if (!parsed || typeof parsed.savedAt !== "string" || !parsed.confidences) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSnapshot(): void {
  window.localStorage.removeItem(KEY);
}

/**
 * The delta across the "likely" line — the one boundary we can state plainly.
 * Softer movements (possible ↔ needsInfo) are deliberately not announced;
 * "since last time" must never overpromise.
 */
export function diffSnapshot(snapshot: Snapshot, current: EligibilityResult[]): SnapshotDiff {
  const nowLikely = current.filter(
    (r) => r.confidence === "likely" && snapshot.confidences[r.program.id] !== "likely"
  );
  const noLongerLikely = current
    .filter(
      (r) => r.confidence !== "likely" && snapshot.confidences[r.program.id] === "likely"
    )
    .map((r) => ({ result: r, was: "likely" as Confidence }));
  return { savedAt: snapshot.savedAt, nowLikely, noLongerLikely };
}
