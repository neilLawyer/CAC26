"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// The one collapse primitive for the whole app. Height animates via the CSS
// grid-template-rows 0fr↔1fr trick (see .disclosure in globals.css): no JS
// measuring, GPU-cheap, and reduced-motion collapses instantly. Closed content
// is `inert` so links inside can't be tabbed into while invisible.

interface DisclosureGroupValue {
  version: number;
  open: boolean;
  expandAll: () => void;
  collapseAll: () => void;
}

const GroupCtx = createContext<DisclosureGroupValue | undefined>(undefined);

/** Wraps a page section so "Expand all / Collapse all" can broadcast to every card inside. */
export function DisclosureGroup({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState({ version: 0, open: false });
  const value: DisclosureGroupValue = {
    ...signal,
    expandAll: () => setSignal((s) => ({ version: s.version + 1, open: true })),
    collapseAll: () => setSignal((s) => ({ version: s.version + 1, open: false })),
  };
  return <GroupCtx.Provider value={value}>{children}</GroupCtx.Provider>;
}

export function useDisclosureGroup(): DisclosureGroupValue | undefined {
  return useContext(GroupCtx);
}

/**
 * Local open/closed state that also obeys the group's broadcasts. Reading the
 * signal version during render (instead of an effect) applies a broadcast in
 * the same pass with no flicker.
 */
export function useDisclosureState(defaultOpen = false): [boolean, (open: boolean) => void] {
  const group = useContext(GroupCtx);
  const [open, setOpen] = useState(defaultOpen);
  const [seenVersion, setSeenVersion] = useState(group?.version ?? 0);
  if (group && group.version !== seenVersion) {
    setSeenVersion(group.version);
    if (open !== group.open) setOpen(group.open);
  }
  return [open, setOpen];
}

export function Disclosure({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="disclosure" data-open={open || undefined} inert={!open}>
      <div className="disclosure-inner">{children}</div>
    </div>
  );
}

/** The shared chevron — rotates when open, sized for one-line headers. */
export function Chevron({ open, color }: { open: boolean; color?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`rc-chevron shrink-0 ${open ? "rc-chevron-open" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke={color ?? "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
