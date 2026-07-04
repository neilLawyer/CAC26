import { Meter } from "@/components/ui/Meter";

interface EligibilityMeterProps {
  possible: number;
  total: number;
}

export function EligibilityMeter({ possible, total }: EligibilityMeterProps) {
  const pct = total === 0 ? 0 : Math.round((possible / total) * 100);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="label-mono text-[10px] text-accent">eligibility so far</span>
        <span className="text-sm text-muted">
          {possible} of {total} still possible
        </span>
      </div>
      <Meter pct={pct} />
    </div>
  );
}
