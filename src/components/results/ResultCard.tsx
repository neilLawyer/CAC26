import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/components/results/confidence";
import type { EligibilityResult } from "@/lib/types";

// One program result: name, confidence badge, plain-language reasons, an
// optional counterfactual, the source stamp, and the official apply link.
export function ResultCard({ result }: { result: EligibilityResult }) {
  const { program, confidence, reasons, counterfactual } = result;
  const color = CONFIDENCE_COLOR[confidence];
  return (
    <Card className="hover-lift p-5 space-y-3 border-l-[3px]" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{program.name}</h3>
          <p className="text-sm text-muted">{program.agencyName}</p>
        </div>
        <Badge color={color} className="label-mono shrink-0 px-3 py-1 text-[10px]">
          {CONFIDENCE_LABEL[confidence]}
        </Badge>
      </div>
      <p className="text-sm">{program.summary}</p>
      <ul className="text-sm text-muted list-disc list-inside space-y-1">
        {reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      {counterfactual && <p className="text-sm italic text-foreground/70">{counterfactual}</p>}
      <div className="flex items-center justify-between pt-2 text-xs text-muted">
        <span>Checked against source: {program.lastVerified}</span>
        <a
          href={program.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Source
        </a>
      </div>
      <ButtonLink href={program.applyUrl} external className="inline-block text-sm px-4 py-2">
        Verify &amp; apply with {program.agencyName} →
      </ButtonLink>
    </Card>
  );
}
