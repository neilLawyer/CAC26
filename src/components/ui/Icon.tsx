import type { ReactNode } from "react";

// Standardizes the repeated <svg> boilerplate (24x24 viewBox, rounded caps).
// Pass the path(s) as children; override size/stroke/fill as needed.
type IconProps = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  children: ReactNode;
};

export function Icon({
  size = 24,
  stroke = "currentColor",
  strokeWidth = 1.6,
  fill = "none",
  className,
  children,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}
