"use client";

import { useSyncExternalStore } from "react";
import { getThemeServerSnapshot, getThemeSnapshot, subscribeTheme, toggleTheme } from "@/lib/theme-store";
import { Icon } from "@/components/ui/Icon";

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="w-7 h-7 rounded-full border border-card-border flex items-center justify-center hover:border-accent/60 transition-colors"
    >
      {isDark ? (
        <Icon size={13} strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </Icon>
      ) : (
        <Icon size={13} strokeWidth={2}>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </Icon>
      )}
    </button>
  );
}
