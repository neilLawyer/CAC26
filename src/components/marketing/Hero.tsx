import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { ButtonLink } from "@/components/ui/Button";
import { deepStates, totalProgramCount } from "@/data/states";

const TRUST_PILLS = ["No login, ever", "Not a government site", "Free forever", "Open data only"];

// Illustrative preview shown in the hero mockup (not live data).
const MOCKUP_ROWS = [
  { name: "NJ SNAP", conf: "Likely eligible", color: "#2dd4bf" },
  { name: "NJ FamilyCare", conf: "Likely eligible", color: "#2dd4bf" },
  { name: "PAAD", conf: "Possibly eligible", color: "#f9d34c" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-card-border">
      <div className="grid-bg" />
      <div className="corner-glow teal w-[420px] h-[420px] -top-32 -left-32" />
      <div className="corner-glow cyan w-[380px] h-[380px] top-40 -right-24" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          {/* Derived from the state registry — no hardcoded state claims. */}
          <Badge className="label-mono text-[11px] text-accent border border-accent/30 px-3 py-1">
            {totalProgramCount()} programs · every state · full coverage in{" "}
            {deepStates()
              .map((s) => s.code)
              .join(" & ")}
          </Badge>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
            Open every door<br />
            you already <span className="text-accent">qualify for.</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-md">
            Food, health, energy, and cash assistance — explained in plain language, with a real
            application link for every result. No login. No guesswork.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/intake" className="px-7 py-3">
              Check my eligibility
            </ButtonLink>
            <Link href="#how-it-works" className="text-sm text-foreground/80 hover:text-accent transition-colors">
              See how it works →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {TRUST_PILLS.map((p) => (
              <Badge
                key={p}
                className="label-mono text-[10px] text-muted border border-card-border px-3 py-1.5"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>

        {/* Product mockup card */}
        <div className="relative">
          <BrowserFrame
            label="your results"
            className="hover-lift shadow-2xl shadow-black/40 rotate-1 hover:rotate-0"
          >
            <div className="p-5 space-y-3">
              {MOCKUP_ROWS.map((r) => (
                <div key={r.name} className="rounded-lg border border-card-border bg-background/60 p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{r.name}</span>
                  <Badge color={r.color} bgAlpha="22" className="label-mono text-[9px] px-2 py-1">
                    {r.conf}
                  </Badge>
                </div>
              ))}
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
                <p className="label-mono text-[9px] text-accent">est. value you may be missing</p>
                <p className="text-xl font-bold mt-1">$4,200 – $9,600 / yr</p>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
}
