import type { ReactNode } from "react";

// The little "browser window" chrome (three traffic-light dots + a label bar)
// used to frame product mockups and the demo video on the home page.
type BrowserFrameProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

export function BrowserFrame({ label, className = "", children }: BrowserFrameProps) {
  return (
    <div className={`rounded-2xl border border-card-border bg-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-card-border">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
        <span className="label-mono text-[10px] text-muted ml-3">{label}</span>
      </div>
      {children}
    </div>
  );
}
