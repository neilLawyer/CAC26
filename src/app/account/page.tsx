"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Show } from "@clerk/nextjs";
import { useHousehold } from "@/lib/household-store";
import { getState } from "@/data/states";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL, CONFIDENCE_ORDER } from "@/components/results/confidence";
import type { Confidence, Household } from "@/lib/types";

interface SavedScreening {
  household: Household;
  confidences: Record<string, Confidence>;
  savedAt: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "loaded"; data: SavedScreening }
  | { kind: "error" };

export default function AccountPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-6">
      <Show when="signed-out">
        <div className="rounded-2xl border border-card-border bg-card p-8 text-center space-y-3">
          <h1 className="text-2xl font-bold">Sign in to see your saved results</h1>
          <p className="text-sm text-muted">
            This page shows the screening you saved to your account, if any.
          </p>
          <Link href="/sign-in" className="inline-block text-accent hover:underline text-sm">
            Sign in →
          </Link>
        </div>
      </Show>
      <Show when="signed-in">
        <AccountContent />
      </Show>
    </main>
  );
}

function AccountContent() {
  const { patch, setFlag } = useHousehold();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/account/screening")
      .then(async (res) => {
        if (res.status === 404) return setState({ kind: "none" });
        if (!res.ok) return setState({ kind: "error" });
        const data = (await res.json()) as SavedScreening;
        setState({ kind: "loaded", data });
      })
      .catch(() => setState({ kind: "error" }));
  }, []);

  function loadIntoSession(data: SavedScreening) {
    const { flags, ...rest } = data.household;
    patch(rest);
    for (const [flag, value] of Object.entries(flags)) {
      setFlag(flag as keyof typeof flags, value);
    }
  }

  async function deleteSaved() {
    setDeleting(true);
    await fetch("/api/account/screening", { method: "DELETE" });
    setState({ kind: "none" });
    setDeleting(false);
  }

  if (state.kind === "loading") {
    return <p className="text-sm text-muted">Loading your saved results…</p>;
  }

  if (state.kind === "error") {
    return <p className="text-sm text-muted">Couldn&apos;t load your saved results. Try again shortly.</p>;
  }

  if (state.kind === "none") {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8 space-y-3">
        <h1 className="text-2xl font-bold">No saved results yet</h1>
        <p className="text-sm text-muted">
          Fill out the screener, then save your results from the results page — they&apos;ll
          show up here and sync to any device you sign into.
        </p>
        <Link href="/intake" className="inline-block text-accent hover:underline text-sm">
          Go to the questionnaire →
        </Link>
      </div>
    );
  }

  const { data } = state;
  const stateEntry = getState(data.household.state);
  const counts = CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    count: Object.values(data.confidences).filter((v) => v === c).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="rounded-2xl border border-card-border bg-card p-8 space-y-6">
      <div className="space-y-1">
        <p className="label-mono text-[10px] text-accent">saved results</p>
        <h1 className="text-2xl font-bold">
          {stateEntry?.name ?? data.household.state}, household of {data.household.householdSize ?? "?"}
        </h1>
        <p className="text-sm text-muted">Last saved {new Date(data.savedAt).toLocaleDateString()}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {counts.map((c) => (
          <span
            key={c.confidence}
            className="label-mono text-[10px] rounded-full px-3 py-1 border"
            style={{
              borderColor: `color-mix(in srgb, ${CONFIDENCE_COLOR[c.confidence]} 45%, var(--card-border))`,
              color: CONFIDENCE_COLOR[c.confidence],
            }}
          >
            {c.count} {CONFIDENCE_LABEL[c.confidence]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
        <Link
          href="/results"
          onClick={() => loadIntoSession(data)}
          className="press-weight rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm text-accent"
        >
          Load into this session →
        </Link>
        <button
          type="button"
          onClick={deleteSaved}
          disabled={deleting}
          className="text-sm text-muted hover:underline ml-auto disabled:opacity-50"
        >
          Delete my saved data
        </button>
      </div>
    </div>
  );
}
