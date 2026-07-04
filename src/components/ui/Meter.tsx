// A thin progress bar with the accent gradient fill. `pct` is 0–100.
type MeterProps = {
  pct: number;
  className?: string;
};

export function Meter({ pct, className = "" }: MeterProps) {
  return (
    <div className={`h-1.5 rounded-full bg-card-border overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
