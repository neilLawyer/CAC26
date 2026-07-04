import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { STEPS } from "@/data/marketing";

export function HowItWorksSteps() {
  return (
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
  );
}
