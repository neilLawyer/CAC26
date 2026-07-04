import { moneyRange } from "@/lib/format";

// "Money left on the table" — the estimated annual value across programs the
// household may qualify for. Renders nothing when there's no value to show.
export function ValueEstimate({ min, max }: { min: number; max: number }) {
  if (min <= 0 && max <= 0) return null;
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
      <p className="label-mono text-[10px] text-accent">est. value you may be leaving unclaimed</p>
      <p className="text-2xl font-bold mt-1">{moneyRange(min, max)} / year</p>
      <p className="text-xs text-muted mt-1">
        A rough estimate across programs you may qualify for — not a guarantee.
      </p>
    </div>
  );
}
