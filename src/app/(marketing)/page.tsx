import { UseCaseSlideshow } from "@/components/marketing/UseCaseSlideshow";
import { Hero } from "@/components/marketing/Hero";
import { AudienceGrid } from "@/components/marketing/AudienceGrid";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { AccessibilityGrid } from "@/components/marketing/AccessibilityGrid";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { ButtonLink } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      {/* Rotating use-case scenarios */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-center text-sm text-muted mb-4">What&apos;s this actually for?</p>
        <UseCaseSlideshow />
      </section>

      <AudienceGrid />
      <CategoryGrid />
      <AccessibilityGrid />
      <HowItWorksSteps />

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
