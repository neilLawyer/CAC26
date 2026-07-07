import { deepStates, type StateEntry } from "@/data/states";

// The honest coverage indicator for federal-tier states: what we DO cover
// (the full federal baseline + the national address-based local features),
// what we don't yet (that state's own programs), and the real official place
// to check those. Derived entirely from the state registry — no state names
// in code.

export function CoverageNote({ stateEntry }: { stateEntry: StateEntry }) {
  if (stateEntry.tier === "deep") return null;

  const deep = deepStates()
    .map((s) => s.name)
    .join(" & ");

  return (
    <div className="rounded-xl border border-card-border bg-card/60 p-4 space-y-1.5">
      <p className="label-mono text-[10px] text-muted">coverage in {stateEntry.name}</p>
      <p className="text-sm">
        You&apos;re seeing every federal program — and the address-based local results (rent
        benchmarks, income limits, affordable properties, health centers) are national data, so
        they work here too. {stateEntry.name} also runs its own state programs we haven&apos;t
        hand-verified yet ({deep} have full state packs so far).
      </p>
      <a
        href={stateEntry.aggregator.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-accent underline hover:no-underline"
      >
        Check {stateEntry.name}&apos;s programs on {stateEntry.aggregator.name} →
      </a>
    </div>
  );
}
