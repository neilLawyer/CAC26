import { SCHOLARSHIPS, type Scholarship } from "@/data/scholarships";

// The merit/non-income scholarship list: tidy bullets, not giant cards. Each
// name links out to the OFFICIAL page; the native <details> underneath is the
// short in-app explainer (eligibility, award, deadline — all from the record,
// which was verified against the official page on its lastVerified date).

const KIND_LABEL: Record<Scholarship["kind"], string> = {
  "academic-merit": "Academic merit",
  "essay-contest": "Essay & speech contests",
  competition: "National competitions",
  "service-leadership": "Service & leadership",
  "state-merit": "State merit programs",
};

const KIND_ORDER: Scholarship["kind"][] = [
  "academic-merit",
  "essay-contest",
  "competition",
  "service-leadership",
  "state-merit",
];

export function ScholarshipList() {
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    items: SCHOLARSHIPS.filter((s) => s.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.kind} className="space-y-2">
          <h3 className="label-mono text-[10px] text-muted">{KIND_LABEL[g.kind]}</h3>
          <ul className="space-y-2.5 text-sm">
            {g.items.map((s) => (
              <li key={s.id} className="pl-4 relative">
                <span aria-hidden className="absolute left-0 top-[0.55em] w-1.5 h-1.5 rounded-full bg-accent/60" />
                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  {s.name}
                </a>{" "}
                <span className="text-muted">— {s.sponsor}.</span> {s.blurb}
                {s.states && (
                  <span className="text-muted"> ({s.states.join(", ")} residents)</span>
                )}
                <details className="scholarship-details mt-1">
                  <summary className="text-xs text-accent cursor-pointer select-none">
                    details
                  </summary>
                  <div className="mt-1.5 space-y-1 text-xs text-muted border-l-2 border-card-border pl-3">
                    <p>
                      <span className="label-mono text-[9px] mr-1.5">who</span>
                      {s.eligibilityNote}
                    </p>
                    {s.awardNote && (
                      <p>
                        <span className="label-mono text-[9px] mr-1.5">award</span>
                        {s.awardNote}
                      </p>
                    )}
                    {s.deadlineWindow && (
                      <p>
                        <span className="label-mono text-[9px] mr-1.5">when</span>
                        {s.deadlineWindow}
                      </p>
                    )}
                    <p>
                      <span className="label-mono text-[9px] mr-1.5">checked</span>
                      Verified against the official page {s.lastVerified} — confirm details
                      there before planning around them.
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
