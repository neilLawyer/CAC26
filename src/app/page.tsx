import Image from "next/image";
import Link from "next/link";

const TRUST_PILLS = ["No login, ever", "Not a government site", "Free forever", "Open data only"];

const CATEGORIES: { label: string; color: string; icon: React.ReactNode }[] = [
  {
    label: "Food",
    color: "#2dd4bf",
    icon: (
      <path d="M6 3v7a3 3 0 003 3v8M6 3v7M9 3v7M12 3v18M18 3c-2 0-3 2-3 5s1 4 3 4v9" />
    ),
  },
  {
    label: "Health",
    color: "#22d3ee",
    icon: <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.65-9.5 9-9.5 9z" />,
  },
  {
    label: "Energy",
    color: "#f97316",
    icon: <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />,
  },
  {
    label: "Cash",
    color: "#a78bfa",
    icon: <path d="M3 7h18v10H3V7zm9 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM5 7v10M19 7v10" />,
  },
  {
    label: "Education",
    color: "#2dd4bf",
    icon: <path d="M12 3l10 5-10 5L2 8l10-5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />,
  },
  {
    label: "Housing",
    color: "#22d3ee",
    icon: <path d="M3 11l9-7 9 7M5 10v10h14V10" />,
  },
  {
    label: "Tax",
    color: "#f97316",
    icon: <path d="M6 3h9l3 3v15H6V3zM9 3v18M9 8h6M9 13h6" />,
  },
  {
    label: "Phone & internet",
    color: "#a78bfa",
    icon: <path d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM11 18h2" />,
  },
];

const STEPS = [
  {
    n: "1",
    title: "Answer a few questions",
    body: "Household size, an income range, and a couple yes/no questions. We only ask what still matters.",
  },
  {
    n: "2",
    title: "See what you may qualify for",
    body: "Plain-language results with a confidence label and the reason behind every answer.",
  },
  {
    n: "3",
    title: "Apply with the real agency",
    body: "Every result links straight to the official application — OpenDoor never decides, they do.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-card-border">
        <div className="grid-bg" />
        <div className="corner-glow teal w-[420px] h-[420px] -top-32 -left-32" />
        <div className="corner-glow cyan w-[380px] h-[380px] top-40 -right-24" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="label-mono text-[11px] text-accent border border-accent/30 rounded-full px-3 py-1">
              Now open in New Jersey
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
              Open every door<br />
              you already{" "}
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                qualify for.
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-md">
              Food, health, energy, and cash assistance — explained in plain language, with a real
              application link for every result. No login. No guesswork.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/intake"
                className="rounded-full bg-accent text-[#04201c] font-semibold px-7 py-3 hover:brightness-110 transition-all"
              >
                Check my eligibility
              </Link>
              <Link href="#how-it-works" className="text-sm text-foreground/80 hover:text-accent transition-colors">
                See how it works →
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {TRUST_PILLS.map((p) => (
                <span
                  key={p}
                  className="label-mono text-[10px] text-muted border border-card-border rounded-full px-3 py-1.5"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Product mockup card */}
          <div className="relative">
            <div className="rounded-2xl border border-card-border bg-card shadow-2xl shadow-black/40 overflow-hidden rotate-1">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-card-border">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent/70" />
                <span className="label-mono text-[10px] text-muted ml-3">your results</span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: "NJ SNAP", conf: "Likely eligible", color: "#2dd4bf" },
                  { name: "NJ FamilyCare", conf: "Likely eligible", color: "#2dd4bf" },
                  { name: "PAAD", conf: "Possibly eligible", color: "#f9d34c" },
                ].map((r) => (
                  <div key={r.name} className="rounded-lg border border-card-border bg-background/60 p-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span
                      className="label-mono text-[9px] rounded-full px-2 py-1"
                      style={{ color: r.color, backgroundColor: `${r.color}22` }}
                    >
                      {r.conf}
                    </span>
                  </div>
                ))}
                <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
                  <p className="label-mono text-[9px] text-accent">est. value you may be missing</p>
                  <p className="text-xl font-bold mt-1">$4,200 – $9,600 / yr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for real people */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="label-mono text-[11px] text-accent text-center">who this is for</p>
        <h2 className="text-3xl font-bold text-center mt-2">Built for the moments life throws at you</h2>
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {[
            {
              src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop",
              alt: "A parent carrying two young children outside their home",
              title: "Families",
              body: "New baby, lost a job, or just stretched thin — see what's there for your household.",
            },
            {
              src: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=800&auto=format&fit=crop",
              alt: "A healthcare worker",
              title: "Seniors & people with disabilities",
              body: "PAAD, SSI, Senior Freeze — the programs built specifically around these needs.",
            },
            {
              src: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?q=80&w=800&auto=format&fit=crop",
              alt: "A diverse group of friends laughing together",
              title: "Everyone in between",
              body: "Students, workers between jobs, anyone unsure what they qualify for.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-card-border bg-card overflow-hidden">
              <div className="relative h-44">
                <Image src={c.src} alt={c.alt} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted mt-1">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-card-border bg-card/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="label-mono text-[11px] text-accent text-center">what&apos;s covered</p>
          <h2 className="text-3xl font-bold text-center mt-2">One engine, every kind of help</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {CATEGORIES.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-card-border bg-card p-4 flex flex-col gap-3"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${c.color}1f` }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <p className="label-mono text-[11px] text-accent text-center">how it works</p>
        <h2 className="text-3xl font-bold text-center mt-2">Three steps, a few minutes</h2>
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-card-border bg-card p-6 relative overflow-hidden">
              <span className="absolute -right-2 -top-4 text-7xl font-bold text-card-border select-none">
                {s.n}
              </span>
              <h3 className="font-semibold text-lg relative">{s.title}</h3>
              <p className="text-sm text-muted mt-2 relative">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-card-border">
        <div className="grid-bg" />
        <div className="corner-glow teal w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            You may be leaving money on the table.
          </h2>
          <p className="mt-4 text-muted">Takes about three minutes. No account needed.</p>
          <Link
            href="/intake"
            className="inline-block mt-8 rounded-full bg-accent text-[#04201c] font-semibold px-8 py-3.5 hover:brightness-110 transition-all"
          >
            Check my eligibility
          </Link>
        </div>
      </section>

      <footer className="border-t border-card-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
          <span>OpenDoor is informational only — not affiliated with any government agency.</span>
          <span>Built for the Congressional App Challenge 2026.</span>
        </div>
      </footer>
    </main>
  );
}
