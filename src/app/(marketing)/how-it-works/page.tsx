import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/layout/Footer";
import { CONFIDENCE_LABEL, CONFIDENCE_COLOR, CONFIDENCE_ORDER } from "@/components/results/confidence";
import { CONFIDENCE_NOTES, METHODOLOGY, SOURCE_GROUPS } from "@/data/sources";

export const metadata: Metadata = {
  title: "How it works — OpenDoor",
  description:
    "How OpenDoor decides what you may qualify for: a rules-as-data engine, plain-language confidence labels, and the official government sources behind every rule.",
};

export default function HowItWorksPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 space-y-12">
        <div className="space-y-3">
          <p className="label-mono text-[10px] text-accent">how it works</p>
          <h1 className="text-4xl font-bold tracking-tight">One engine, many programs.</h1>
          <p className="text-lg text-muted">
            Every program&apos;s rules — income limits, household size, age or disability factors —
            live as structured data, not code. You answer a few questions once, and the same engine
            checks your household against every program at once, showing plain-language reasons for
            each result. Adding a new program or a new state means adding data, never rewriting the
            app.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What the labels mean</h2>
          <div className="space-y-3">
            {CONFIDENCE_ORDER.map((c) => (
              <div key={c} className="flex items-start gap-3">
                <span
                  className="label-mono text-[10px] rounded-full px-3 py-1 shrink-0 mt-0.5"
                  style={{ color: CONFIDENCE_COLOR[c], backgroundColor: `${CONFIDENCE_COLOR[c]}1f` }}
                >
                  {CONFIDENCE_LABEL[c]}
                </span>
                <p className="text-sm text-muted">{CONFIDENCE_NOTES[c]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How we build the data</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {METHODOLOGY.map((m) => (
              <Card key={m.title} className="p-5">
                <h3 className="font-semibold text-sm">{m.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{m.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Where the data comes from</h2>
          <p className="text-sm text-muted">
            Rules are paraphrased from primary, open government sources. Every program in your
            results also links to its own official source and application.
          </p>
          <div className="space-y-5">
            {SOURCE_GROUPS.map((g) => (
              <div key={g.category}>
                <h3 className="label-mono text-[10px] text-muted mb-2">{g.category}</h3>
                <Card className="divide-y divide-card-border">
                  {g.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 hover:bg-accent/5 transition-colors"
                    >
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="block text-xs text-muted mt-0.5">{s.note}</span>
                    </a>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <ButtonLink href="/intake" className="px-7 py-3">
            Check my eligibility
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
