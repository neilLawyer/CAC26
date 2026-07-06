import { FEDERAL_PROGRAMS } from "@/data/federal/programs";
import { NJ_META } from "@/data/states/NJ/meta";
import { NJ_PROGRAMS } from "@/data/states/NJ/programs";
import { CA_META } from "@/data/states/CA/meta";
import { CA_PROGRAMS } from "@/data/states/CA/programs";
import type { Program, StateMeta } from "@/lib/types";

// State registry: composes each entry from its own meta + program pack.
// Adding a fully-built state = drop in `<CODE>/meta.ts` + `<CODE>/programs.ts`
// and register it here; the engine and UI never hardcode state rules.
export interface StateEntry extends StateMeta {
  programs: Program[];
}

export const DEFAULT_STATE = "NJ";

// States we surface as "coming soon" — metadata only, no data pack yet.
const UPCOMING: StateMeta[] = [
  { code: "TX", name: "Texas", available: false },
  { code: "NY", name: "New York", available: false },
  { code: "FL", name: "Florida", available: false },
  { code: "PA", name: "Pennsylvania", available: false },
];

// Every available state's list = its own pack + the federal pack (nationwide
// rules — EITC, CTC, Lifeline, VA benefits, Pell, Section 8, …). State packs
// keep their state-administered SNAP/Medicaid/LIHEAP/WIC versions; the federal
// pack holds only programs no state pack duplicates.
export const STATES: StateEntry[] = [
  { ...NJ_META, programs: [...NJ_PROGRAMS, ...FEDERAL_PROGRAMS] },
  { ...CA_META, programs: [...CA_PROGRAMS, ...FEDERAL_PROGRAMS] },
  ...UPCOMING.map((m) => ({ ...m, programs: [] as Program[] })),
];

export function getState(code: string): StateEntry | undefined {
  return STATES.find((s) => s.code === code);
}

/** Find a program by id across every state (used by the per-population landings). */
export function getProgramById(id: string): Program | undefined {
  for (const s of STATES) {
    const found = s.programs.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Stable reference so callers doing `getState(x)?.programs ?? EMPTY_PROGRAMS` don't
 * create a new array identity every render (which would defeat useMemo/useEffect deps). */
export const EMPTY_PROGRAMS: Program[] = [];
