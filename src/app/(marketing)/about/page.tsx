import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About — OpenDoor",
  description:
    "OpenDoor is a free, informational tool that helps people find public benefit programs they may qualify for. Here's what it is, and the ground rules it's built on.",
};

const GROUND_RULES = [
  {
    title: "Informational only, never official",
    body: "OpenDoor gives estimates and general information. It's not a government site and doesn't make official eligibility decisions.",
  },
  {
    title: "Always “you may qualify” + a way to apply",
    body: "No result is a guarantee. Every one links to the real, official application so the agency makes the actual determination.",
  },
  {
    title: "General information, not personal advice",
    body: "Nothing here is personalized financial, legal, or tax advice. The cliff simulator is an educational estimate, not a recommendation.",
  },
  {
    title: "Open data and open-source",
    body: "Rules are paraphrased from public government data and built with openly licensed tools. No paid or license-restricted data feeds.",
  },
  {
    title: "Private by default",
    body: "No account, no server. Your answers stay in your browser's local storage — never stored, sold, or shared.",
  },
  {
    title: "Humans and agencies decide",
    body: "For anything urgent, OpenDoor points you to 211 and official agency contacts. It guides; people and agencies decide.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 space-y-10">
        <div className="space-y-3">
          <p className="label-mono text-[10px] text-accent">about</p>
          <h1 className="text-4xl font-bold tracking-tight">
            Every year, billions in benefits go unclaimed.
          </h1>
          <p className="text-lg text-muted">
            Not because people don&apos;t qualify — because the programs are scattered across dozens
            of agencies, written in dense rule-speak, and hard to even find. OpenDoor is a free tool
            that screens for the food, health, energy, cash, and tax programs you may be eligible
            for, explains each one in plain language, and points you to the official place to apply.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">The ground rules it&apos;s built on</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GROUND_RULES.map((r) => (
              <Card key={r.title} className="p-5">
                <h3 className="font-semibold text-sm">{r.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{r.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <ButtonLink href="/intake" className="px-7 py-3">
            Check my eligibility
          </ButtonLink>
          <a href="/how-it-works" className="text-sm text-accent hover:underline">
            See how it works →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
