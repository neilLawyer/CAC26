import type { CSSProperties, ReactNode } from "react";

// A rounded pill. Pass `color` to tint it (text in the color, background at a
// low-alpha of the same color) — used by confidence labels and status chips.
type BadgeProps = {
  color?: string;
  /** Hex alpha suffix for the background tint, e.g. "1f" or "22". Defaults to "1f". */
  bgAlpha?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Badge({ color, bgAlpha = "1f", className = "", style, children }: BadgeProps) {
  const tint: CSSProperties = color
    ? { color, backgroundColor: `${color}${bgAlpha}`, ...style }
    : style ?? {};
  return (
    <span className={`rounded-full ${className}`} style={tint}>
      {children}
    </span>
  );
}
