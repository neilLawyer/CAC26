"use client";

import { useEffect, useRef, useState } from "react";

// The signature count-up: rAF + easeOutExpo, animating from whatever value is
// currently shown toward the new target (so a changed answer glides rather
// than restarting at zero). prefers-reduced-motion → the final number
// instantly, every time. Returns whole numbers, rounded per frame.

export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const shownRef = useRef(0); // last value actually rendered — the next animation's start

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || durationMs <= 0) {
      shownRef.current = target;
      setValue(target);
      return;
    }
    const from = shownRef.current;
    const delta = target - from;
    if (delta === 0) return;

    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(2, -10 * p); // easeOutExpo
      const v = p >= 1 ? target : Math.round(from + delta * eased);
      shownRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
