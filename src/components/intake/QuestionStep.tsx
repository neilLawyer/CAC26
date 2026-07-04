import type { ReactNode } from "react";
import { Choice } from "@/components/ui/Choice";
import { BackLink } from "@/components/intake/BackLink";

// A single-select intake step: a heading, an optional subtitle, and a grid of
// Choice options that each advance the wizard. Drives the household-size and
// income steps (any "pick one" question).
export interface StepOption {
  key: string;
  label: ReactNode;
  active?: boolean;
  className?: string;
  onSelect: () => void;
}

interface QuestionStepProps {
  title: string;
  subtitle?: ReactNode;
  gridClassName: string;
  options: StepOption[];
  onBack?: () => void;
}

export function QuestionStep({ title, subtitle, gridClassName, options, onBack }: QuestionStepProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      <div className={gridClassName}>
        {options.map((o) => (
          <Choice key={o.key} active={o.active} onClick={o.onSelect} className={o.className}>
            {o.label}
          </Choice>
        ))}
      </div>
      {onBack && <BackLink onClick={onBack} />}
    </section>
  );
}
