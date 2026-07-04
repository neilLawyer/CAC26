import type { ReactNode } from "react";

// Keyed SVG-path registry. Data files reference icons by key (a string) so they
// stay free of JSX; render one with <Icon>{ICON_PATHS[key]}</Icon>.
export const ICON_PATHS: Record<string, ReactNode> = {
  // categories
  food: <path d="M6 3v7a3 3 0 003 3v8M6 3v7M9 3v7M12 3v18M18 3c-2 0-3 2-3 5s1 4 3 4v9" />,
  health: <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.65-9.5 9-9.5 9z" />,
  energy: <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />,
  cash: <path d="M3 7h18v10H3V7zm9 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM5 7v10M19 7v10" />,
  education: <path d="M12 3l10 5-10 5L2 8l10-5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />,
  housing: <path d="M3 11l9-7 9 7M5 10v10h14V10" />,
  tax: <path d="M6 3h9l3 3v15H6V3zM9 3v18M9 8h6M9 13h6" />,
  phoneInternet: <path d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM11 18h2" />,
  // accessibility
  plainLanguage: <path d="M4 6h16M4 12h10M4 18h7" />,
  screenReader: <path d="M12 3a4 4 0 100 8 4 4 0 000-8zM5 21a7 7 0 0114 0" />,
  keyboard: <path d="M4 6h16v12H4V6zm3 3h.01M11 9h.01M15 9h.01M7 14h10" />,
  theme: <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z" />,
  // populations
  families: <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 11a3 3 0 100-6M21 20a6 6 0 00-4-5.2" />,
  seniors: <path d="M12 3a4 4 0 100 8 4 4 0 000-8zM5 21a7 7 0 0114 0" />,
  everyone: <path d="M9 11a4 4 0 100-8 4 4 0 000 8zM1 21a8 8 0 0116 0M17 3a4 4 0 010 8M23 21a8 8 0 00-4-6.93" />,
  veteran: <path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3zM9 12l2 2 4-4" />,
  globe: <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />,
};
