"use client";

import { useSyncExternalStore } from "react";
import { useDisclosureGroup } from "@/components/ui/Disclosure";
import {
  getDensitySnapshot,
  getDensityServerSnapshot,
  setDensity,
  subscribeDensity,
  type Density,
} from "@/lib/ui-prefs-store";

// The result list's global controls: expand/collapse every card at once, and
// the Comfortable/Compact density switch (persisted; CSS reads it from the
// <html data-density> attribute, so it applies app-wide).

export function useDensity(): Density {
  return useSyncExternalStore(subscribeDensity, getDensitySnapshot, getDensityServerSnapshot);
}

function chipClass(active = false): string {
  return `press-weight rounded-full border px-3 py-1 text-xs transition-colors ${
    active
      ? "border-accent/60 bg-accent/10 text-accent"
      : "border-card-border text-muted hover:text-foreground"
  }`;
}

export function ResultsControls() {
  const group = useDisclosureGroup();
  const density = useDensity();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {group && (
        <>
          <button type="button" onClick={group.expandAll} className={chipClass()}>
            Expand all
          </button>
          <button type="button" onClick={group.collapseAll} className={chipClass()}>
            Collapse all
          </button>
        </>
      )}
      <div
        className="ml-auto flex items-center gap-1.5"
        role="group"
        aria-label="Display density"
      >
        <button
          type="button"
          onClick={() => setDensity("comfortable")}
          aria-pressed={density === "comfortable"}
          className={chipClass(density === "comfortable")}
        >
          Comfortable
        </button>
        <button
          type="button"
          onClick={() => setDensity("compact")}
          aria-pressed={density === "compact"}
          className={chipClass(density === "compact")}
        >
          Compact
        </button>
      </div>
    </div>
  );
}
