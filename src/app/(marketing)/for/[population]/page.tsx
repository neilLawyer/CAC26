import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/layout/Footer";
import { POPULATIONS } from "@/data/populations";
import { getProgramById } from "@/data/states";

// Only the known populations are valid; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return POPULATIONS.map((p) => ({ population: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ population: string }>;
}): Promise<Metadata> {
  const { population } = await params;
  const pop = POPULATIONS.find((p) => p.id === population);
  if (!pop) return {};
  return { title: `${pop.landing.headline} — OpenDoor`, description: pop.landing.body };
}

export default async function PopulationLandingPage({
  params,
}: {
  params: Promise<{ population: string }>;
}) {
  const { population } = await params;
  const pop = POPULATIONS.find((p) => p.id === population);
  if (!pop) notFound();

  const highlighted = pop.highlightProgramIds
    .map((id) => getProgramById(id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 space-y-10">
        <div className="space-y-4">
          <span
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pop.color}1f` }}
          >
            <Icon size={30} stroke={pop.color}>
              {ICON_PATHS[pop.iconKey]}
            </Icon>
          </span>
          <h1 className="text-4xl font-bold tracking-tight">{pop.landing.headline}</h1>
          <p className="text-lg text-muted">{pop.landing.body}</p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <ButtonLink href={`/intake/${pop.id}`} className="px-7 py-3">
              See what fits your situation
            </ButtonLink>
            <ButtonLink href="/intake" className="px-5 py-2.5 text-sm">
              Full eligibility check
            </ButtonLink>
          </div>
        </div>

        {highlighted.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Programs to look at first</h2>
            <div className="grid gap-3">
              {highlighted.map((p) => (
                <Card key={p.id} className="p-5 space-y-2 border-l-[3px]" style={{ borderLeftColor: pop.color }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-sm text-muted">{p.agencyName}</p>
                    </div>
                  </div>
                  <p className="text-sm">{p.summary}</p>
                  <a
                    href={p.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    Apply with {p.agencyName} →
                  </a>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted">
              Eligibility depends on your household. Run the screener for a personalized result — this
              is general information, not an official decision.
            </p>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
