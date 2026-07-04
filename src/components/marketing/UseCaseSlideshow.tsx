"use client";

import { useEffect, useRef, useState } from "react";

const SCENARIOS = [
  {
    prompt: "Just had a baby?",
    outcome: "WIC, NJ FamilyCare for your baby, and NJ Free School Meals down the road can all line up.",
  },
  {
    prompt: "Lost your job?",
    outcome: "NJ SNAP, NJ FamilyCare, and Work First New Jersey often kick in together.",
  },
  {
    prompt: "Turning 65?",
    outcome: "PAAD, SSI, and Senior Freeze — three programs built specifically around this milestone.",
  },
  {
    prompt: "Behind on utility bills?",
    outcome: "LIHEAP and the Universal Service Fund exist for exactly this situation.",
  },
  {
    prompt: "Filing taxes this year?",
    outcome: "The NJEITC could mean extra cash back you didn't know you qualified for.",
  },
];

const INTERVAL_MS = 4500;

export function UseCaseSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = setInterval(() => setActive((i) => (i + 1) % SCENARIOS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="rounded-2xl border border-card-border bg-card p-8 sm:p-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="min-h-[104px]">
        {SCENARIOS.map((s, i) => (
          <div
            key={s.prompt}
            className="transition-opacity duration-500"
            style={{
              display: i === active ? "block" : "none",
              opacity: i === active ? 1 : 0,
            }}
            aria-hidden={i !== active}
          >
            <p className="text-2xl sm:text-3xl font-semibold">{s.prompt}</p>
            <p className="text-muted mt-3 max-w-lg">{s.outcome}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-6" role="tablist" aria-label="Example scenarios">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.prompt}
            role="tab"
            aria-selected={i === active}
            aria-label={s.prompt}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-accent" : "w-1.5 bg-card-border hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
