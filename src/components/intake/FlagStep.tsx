import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/intake/BackLink";
import type { CategoricalFlag, FlagQuestion, Household } from "@/lib/types";

// The adaptive "a few more questions" step: renders one Yes/No/Skip row per
// catalog question that a still-possible program actually requires.
interface FlagStepProps {
  questions: FlagQuestion[];
  flags: Household["flags"];
  onAnswer: (flag: CategoricalFlag, value: boolean | undefined) => void;
  onBack: () => void;
  onNext: () => void;
}

export function FlagStep({ questions, flags, onAnswer, onBack, onNext }: FlagStepProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">A few more questions</h2>
      <p className="text-sm text-muted">
        We only ask what still matters based on your answers so far. Skip any you&apos;re not
        sure about.
      </p>
      <div className="space-y-3">
        {questions.length === 0 && (
          <p className="text-sm text-muted">Nothing else we need — you&apos;re all set.</p>
        )}
        {questions.map((q) => (
          <div
            key={q.flag}
            className="flex items-center justify-between gap-4 rounded-xl border border-card-border bg-card px-4 py-3"
          >
            <span className="text-sm">{q.question}</span>
            <div className="flex gap-2 shrink-0">
              {(["Yes", "No", "Skip"] as const).map((opt) => {
                const val = opt === "Yes" ? true : opt === "No" ? false : undefined;
                const active = flags[q.flag] === val;
                return (
                  <button
                    key={opt}
                    onClick={() => onAnswer(q.flag, val)}
                    className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-card-border hover:border-accent/60"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <BackLink onClick={onBack} />
        <Button onClick={onNext} className="px-6 py-2">
          Continue
        </Button>
      </div>
    </section>
  );
}
