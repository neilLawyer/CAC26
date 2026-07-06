// The progress bar, made alive: the fill moves on a spring (meter-fill), a
// sheen sweeps it continuously (meter-sheen), and the leading edge carries a
// soft glow — all removed cleanly under prefers-reduced-motion, where it
// degrades to a plain filled bar. `pct` is 0–100.
type MeterProps = {
  pct: number;
  className?: string;
};

export function Meter({ pct, className = "" }: MeterProps) {
  return (
    <div className={`h-1.5 rounded-full bg-card-border overflow-hidden ${className}`}>
      <div
        className="meter-fill relative h-full rounded-full bg-gradient-to-r from-accent to-accent-2 overflow-hidden"
        style={{
          width: `${pct}%`,
          boxShadow: "0 0 8px 0 color-mix(in srgb, var(--accent-2) 55%, transparent)",
        }}
      >
        <div
          className="meter-sheen absolute inset-y-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />
      </div>
    </div>
  );
}
