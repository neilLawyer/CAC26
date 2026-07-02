"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CategoricalFlag, Household } from "@/lib/types";

const STORAGE_KEY = "opendoor-household";

const EMPTY_HOUSEHOLD: Household = { state: "CA", flags: {} };

interface HouseholdContextValue {
  household: Household;
  setState: (state: string) => void;
  setHouseholdSize: (size: number) => void;
  setIncomeRange: (min: number, max: number | undefined) => void;
  setFlag: (flag: CategoricalFlag, value: boolean | undefined) => void;
  reset: () => void;
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

function loadStoredHousehold(): Household {
  if (typeof window === "undefined") return EMPTY_HOUSEHOLD;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_HOUSEHOLD;
  } catch {
    return EMPTY_HOUSEHOLD;
  }
}

export function HouseholdProvider({ children }: { children: ReactNode }) {
  // Everything here stays in the browser — nothing is sent to a server.
  const [household, setHousehold] = useState<Household>(loadStoredHousehold);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(household));
  }, [household]);

  const value: HouseholdContextValue = {
    household,
    setState: (state) => setHousehold((h) => ({ ...h, state })),
    setHouseholdSize: (size) => setHousehold((h) => ({ ...h, householdSize: size })),
    setIncomeRange: (min, max) =>
      setHousehold((h) => ({ ...h, monthlyIncomeMin: min, monthlyIncomeMax: max })),
    setFlag: (flag, val) =>
      setHousehold((h) => ({ ...h, flags: { ...h.flags, [flag]: val } })),
    reset: () => setHousehold(EMPTY_HOUSEHOLD),
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold must be used within HouseholdProvider");
  return ctx;
}
