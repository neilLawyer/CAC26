"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { buildSearchIndex, searchIndex, type SearchEntry } from "@/lib/search";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";

// The command palette: ⌘/Ctrl-K anywhere (or the header button), type a life
// phrase, land in the right room. Fuzzy over the data-driven index in
// lib/search.ts — programs for YOUR state, the scope rooms, and app pages.

const KIND_LABEL: Record<SearchEntry["kind"], string> = {
  program: "program",
  scope: "room",
  page: "page",
};

const SUGGESTIONS = ["pregnant", "food stamps", "rent help", "laid off", "tax refund"];

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { household } = useHousehold();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const index = useMemo(() => {
    const programs = getState(household.state)?.programs ?? EMPTY_PROGRAMS;
    return buildSearchIndex(programs);
  }, [household.state]);

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  // Reset per open; focus the input once mounted.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // Focus after paint so the dialog exists.
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  function pick(entry: SearchEntry) {
    onClose();
    router.push(entry.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      pick(results[cursor]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search programs and pages"
    >
      <button
        aria-label="Close search"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className="palette-panel relative w-full max-w-lg rounded-2xl border border-card-border bg-card shadow-2xl overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-card-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try a life phrase — &ldquo;pregnant&rdquo;, &ldquo;food stamps&rdquo;, &ldquo;can't pay rent&rdquo;…"
            aria-label="Search programs, rooms, and pages"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted/70"
          />
          <kbd className="label-mono hidden sm:block text-[9px] text-muted border border-card-border rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        {query.trim() === "" ? (
          <div className="px-4 py-4">
            <p className="label-mono text-[9px] text-muted">try one of these</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="press-weight rounded-full border border-card-border px-3 py-1 text-xs text-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="px-4 py-5 text-sm text-muted">
            Nothing matched that — but the full questionnaire checks everything we screen.{" "}
            <button
              onClick={() => pick({ href: "/intake" } as SearchEntry)}
              className="text-accent underline hover:no-underline"
            >
              Start there →
            </button>
          </p>
        ) : (
          <ul ref={listRef} role="listbox" aria-label="Search results" className="max-h-[46vh] overflow-y-auto py-1.5">
            {results.map((r, i) => (
              <li key={r.key} role="option" aria-selected={i === cursor}>
                <button
                  onClick={() => pick(r)}
                  onMouseMove={() => setCursor(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${
                    i === cursor ? "bg-accent/10" : ""
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={
                      {
                        backgroundColor: `color-mix(in srgb, ${r.color ?? "var(--accent)"} 13%, transparent)`,
                      } as CSSProperties
                    }
                  >
                    <Icon size={15} stroke={r.color ?? "var(--accent)"}>
                      {(r.iconKey && ICON_PATHS[r.iconKey]) || ICON_PATHS.globe}
                    </Icon>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{r.title}</span>
                    <span className="block text-xs text-muted truncate">{r.subtitle}</span>
                  </span>
                  <span className="label-mono text-[8px] text-muted shrink-0 border border-card-border rounded-full px-2 py-0.5">
                    {KIND_LABEL[r.kind]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="px-4 py-2 border-t border-card-border text-[10px] text-muted label-mono">
          ↑↓ choose · enter to open · searches only this device
        </p>
      </div>
    </div>
  );
}

/** Global open-state + the ⌘/Ctrl-K binding, shared by NavHeader. */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
