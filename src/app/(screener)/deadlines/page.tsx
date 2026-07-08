"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { icsForRule, matchedDeadlines, type MatchedDeadline } from "@/lib/deadline-utils";
import { downloadIcs } from "@/lib/ics";
import { Card } from "@/components/ui/Card";

// The personal deadline timeline: deadline-bearing programs from YOUR matches
// (plus contest deadlines anyone can enter), each downloadable as an .ics —
// built in the browser from a Blob. No email, no SMS, no server storage: the
// privacy-safe version by design.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function DeadlineCard({ m, now }: { m: MatchedDeadline; now: Date }) {
  const { rule, next } = m;
  return (
    <Card className="p-4 flex flex-wrap items-start gap-4">
      <div className="w-14 shrink-0 text-center rounded-lg border border-accent/30 bg-accent/8 py-1.5">
        {next ? (
          <>
            <p className="label-mono text-[9px] text-accent">{MONTHS[next.month - 1]}</p>
            <p className="text-xl font-bold leading-tight tabular-nums">{next.day}</p>
            <p className="label-mono text-[8px] text-muted">{next.year}</p>
          </>
        ) : (
          <p className="label-mono text-[9px] text-muted py-2">varies</p>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="font-semibold text-sm">{rule.title}</h3>
        {next && <p className="label-mono text-[9px] text-accent">{next.label}</p>}
        <p className="text-xs text-muted">{rule.detail}</p>
        {rule.varies && <p className="text-xs text-muted italic">{rule.varies}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
          {next && (
            <button
              type="button"
              onClick={() => downloadIcs(`opendoor-${rule.id}.ics`, icsForRule(rule, now))}
              className="press-weight rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-xs text-accent"
            >
              Add to calendar (.ics)
            </button>
          )}
          <a
            href={rule.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted underline hover:text-foreground"
          >
            Official page · checked {rule.lastVerified}
          </a>
        </div>
      </div>
    </Card>
  );
}

export default function DeadlinesPage() {
  const { household } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const now = useMemo(() => new Date(), []);

  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const { personal, scholarships } = useMemo(
    () => matchedDeadlines(results, household, now),
    [results, household, now]
  );

  const answered = household.householdSize !== undefined;

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="space-y-2">
          <p className="label-mono text-[10px] text-accent">your deadline timeline</p>
          <h1 className="text-3xl font-bold">Don&apos;t miss the window</h1>
          <p className="text-sm text-muted max-w-lg">
            Some of the most valuable help is seasonal — enrollment windows and funding that
            runs out. These are the dated moments for programs that matched{" "}
            <em>your</em> answers. Each one downloads straight into your phone or computer
            calendar — no email, no reminders from us, nothing stored anywhere but your
            device.
          </p>
        </div>

        {!answered && (
          <Card className="p-4 text-sm text-muted">
            Answer the quick questionnaire first and this page becomes personal.{" "}
            <Link href="/intake" className="text-accent underline hover:no-underline">
              Three minutes →
            </Link>
          </Card>
        )}

        {personal.length > 0 && (
          <section className="space-y-3">
            <h2 className="tier-rule text-lg font-semibold">From your matches</h2>
            <div className="card-stack">
              {personal.map((m) => (
                <DeadlineCard key={m.rule.id} m={m} now={now} />
              ))}
            </div>
          </section>
        )}

        {scholarships.length > 0 && (
          <section className="space-y-3">
            <h2 className="tier-rule text-lg font-semibold">Contest &amp; scholarship dates</h2>
            <p className="text-xs text-muted">
              Not income-gated — anyone in the right grade can enter.{" "}
              <Link href="/scholarships" className="text-accent underline hover:no-underline">
                The full merit list →
              </Link>
            </p>
            <div className="card-stack">
              {scholarships.map((m) => (
                <DeadlineCard key={m.rule.id} m={m} now={now} />
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-muted">
          Dates are the officially published recurring windows as of each entry&apos;s
          &ldquo;checked&rdquo; stamp — agencies occasionally move them, so the official page
          linked on every card is the final word.
        </p>

        <Link href="/results" className="text-sm text-accent hover:underline block">
          ← Back to my results
        </Link>
      </div>
    </main>
  );
}
