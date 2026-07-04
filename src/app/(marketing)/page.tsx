import Image from "next/image";
import Link from "next/link";
import { UseCaseSlideshow } from "@/components/UseCaseSlideshow";
import { Badge } from "@/components/ui/Badge";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

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

const ACCESSIBILITY_ITEMS = [
  {
    title: "Plain language",
    body: "Every program is explained around a 6th-grade reading level — no agency jargon.",
    icon: <path d="M4 6h16M4 12h10M4 18h7" />,
  },
  {
    title: "Screen-reader friendly",
    body: "Semantic HTML, labeled controls, and visible keyboard focus throughout.",
    icon: <path d="M12 3a4 4 0 100 8 4 4 0 000-8zM5 21a7 7 0 0114 0" />,
  },
  {
    title: "Full keyboard navigation",
    body: "Every question, button, and result is reachable and operable without a mouse.",
    icon: <path d="M4 6h16v12H4V6zm3 3h.01M11 9h.01M15 9h.01M7 14h10" />,
  },
  {
    title: "Light or dark, your call",
    body: "Toggle the theme from the top nav — your choice is remembered on this device.",
    icon: <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z" />,
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
            <Badge className="label-mono text-[11px] text-accent border border-accent/30 px-3 py-1">
              Now open in New Jersey
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
                {[
                  { name: "NJ SNAP", conf: "Likely eligible", color: "#2dd4bf" },
                  { name: "NJ FamilyCare", conf: "Likely eligible", color: "#2dd4bf" },
                  { name: "PAAD", conf: "Possibly eligible", color: "#f9d34c" },
                ].map((r) => (
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

      {/* Rotating use-case scenarios */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-center text-sm text-muted mb-4">What&apos;s this actually for?</p>
        <UseCaseSlideshow />
      </section>

      {/* Built for real people */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Built for the moments life throws at you</h2>
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
            <div
              key={c.title}
              className="hover-lift rounded-2xl border border-card-border bg-card overflow-hidden"
            >
              <div className="relative h-44">
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
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
          <h2 className="text-3xl font-bold text-center">One engine, every kind of help</h2>
          <p className="text-center text-muted mt-2 max-w-xl mx-auto">
            The same rules-as-data engine covers every category below — adding a new program or a
            new state never touches the code, just the data.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {CATEGORIES.map((c) => (
              <Card key={c.label} className="hover-lift p-4 flex flex-col gap-3">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${c.color}1f` }}
                >
                  <Icon size={18} stroke={c.color}>
                    {c.icon}
                  </Icon>
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Built to be usable by everyone</h2>
        <p className="text-center text-muted mt-2 max-w-xl mx-auto">
          Benefits programs are hard enough to parse. OpenDoor shouldn&apos;t be.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {ACCESSIBILITY_ITEMS.map((a) => (
            <Card key={a.title} className="hover-lift p-5">
              <Icon size={20} stroke="var(--accent)">
                {a.icon}
              </Icon>
              <h3 className="font-semibold text-sm mt-3">{a.title}</h3>
              <p className="text-sm text-muted mt-1">{a.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Three steps, a few minutes</h2>
        <p className="text-center text-muted mt-2 max-w-xl mx-auto">
          Here&apos;s the actual app — not a mockup.
        </p>

        <BrowserFrame
          label="opendoor-nj.vercel.app"
          className="mt-8 max-w-2xl mx-auto shadow-2xl shadow-black/30"
        >
          <video
            src="/demo.webm"
            autoPlay
            loop
            muted
            playsInline
            aria-label="Demo of filling out the OpenDoor questionnaire and viewing results"
            className="w-full block"
          />
        </BrowserFrame>

        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="hover-lift rounded-2xl border border-card-border bg-card p-6 relative overflow-hidden"
            >
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
      <section className="border-t border-card-border bg-card/40">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            You may be leaving money on the table.
          </h2>
          <p className="mt-4 text-muted">Takes about three minutes. No account needed.</p>
          <ButtonLink href="/intake" className="inline-block mt-8 px-8 py-3.5">
            Check my eligibility
          </ButtonLink>
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
