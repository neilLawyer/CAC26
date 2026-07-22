"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { getThemeServerSnapshot, getThemeSnapshot, subscribeTheme } from "@/lib/theme-store";
import { getClerkAppearance } from "@/lib/clerk-appearance";

// Clerk's theme variables need literal colors (see clerk-appearance.ts) and
// can't just read the CSS custom properties, so this re-picks the palette
// whenever the app's own dark/light toggle (theme-store.ts) changes.
export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  return <ClerkProvider appearance={getClerkAppearance(isDark)}>{children}</ClerkProvider>;
}
