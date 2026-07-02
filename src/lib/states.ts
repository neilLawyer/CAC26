import { NJ_PROGRAMS } from "@/data/states/NJ/programs";
import { CA_PROGRAMS } from "@/data/states/CA/programs";
import type { Program } from "@/lib/types";

export interface StateEntry {
  code: string;
  name: string;
  available: boolean;
  programs: Program[];
}

export const DEFAULT_STATE = "NJ";

export const STATES: StateEntry[] = [
  { code: "NJ", name: "New Jersey", available: true, programs: NJ_PROGRAMS },
  { code: "CA", name: "California", available: true, programs: CA_PROGRAMS },
  { code: "TX", name: "Texas", available: false, programs: [] },
  { code: "NY", name: "New York", available: false, programs: [] },
  { code: "FL", name: "Florida", available: false, programs: [] },
  { code: "PA", name: "Pennsylvania", available: false, programs: [] },
];

export function getState(code: string): StateEntry | undefined {
  return STATES.find((s) => s.code === code);
}

/** Stable reference so callers doing `getState(x)?.programs ?? EMPTY_PROGRAMS` don't
 * create a new array identity every render (which would defeat useMemo/useEffect deps). */
export const EMPTY_PROGRAMS: Program[] = [];
