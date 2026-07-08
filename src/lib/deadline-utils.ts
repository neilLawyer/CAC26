import { DEADLINE_RULES, type DeadlineRule } from "@/data/deadlines";
import { buildCalendar, type IcsEvent } from "@/lib/ics";
import type { EligibilityResult, Household } from "@/lib/types";

// Pure helpers for the personal deadline timeline: which rules apply to this
// household, when each next occurs, and the .ics payload for a rule. All
// on-device — nothing here talks to a network.

/** Next calendar occurrence of an annual month/day, on or after `from`. */
export function nextOccurrence(
  month: number,
  day: number,
  from: Date
): { year: number; month: number; day: number } {
  const thisYear = from.getFullYear();
  const candidate = new Date(thisYear, month - 1, day);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return candidate >= today
    ? { year: thisYear, month, day }
    : { year: thisYear + 1, month, day };
}

export interface MatchedDeadline {
  rule: DeadlineRule;
  /** The next dated moment (open or close, whichever comes first), if any. */
  next?: { year: number; month: number; day: number; label: string };
}

/** Rules that apply to this household's results, superseded entries removed. */
export function matchedDeadlines(
  results: EligibilityResult[],
  household: Household,
  now: Date
): { personal: MatchedDeadline[]; scholarships: MatchedDeadline[] } {
  const openIds = new Set(
    results.filter((r) => r.confidence !== "unlikely").map((r) => r.program.id)
  );

  const applies = (rule: DeadlineRule): boolean => {
    if (rule.scholarship) return true;
    if (rule.always) return true;
    if (rule.flag && household.flags[rule.flag] === true) return true;
    return (rule.programIds ?? []).some((id) => openIds.has(id));
  };

  const matchedIds = new Set(DEADLINE_RULES.filter(applies).map((r) => r.id));
  const active = DEADLINE_RULES.filter(
    (r) => matchedIds.has(r.id) && !(r.supersededBy ?? []).some((s) => matchedIds.has(s))
  );

  const withNext = (rule: DeadlineRule): MatchedDeadline => {
    const moments = [rule.opens, rule.closes]
      .filter((m): m is NonNullable<typeof m> => m !== undefined)
      .map((m) => ({ ...nextOccurrence(m.month, m.day, now), label: m.label }));
    moments.sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month !== b.month ? a.month - b.month : a.day - b.day
    );
    return { rule, next: moments[0] };
  };

  const all = active.map(withNext).sort((a, b) => {
    if (!a.next) return 1;
    if (!b.next) return -1;
    return (
      a.next.year - b.next.year || a.next.month - b.next.month || a.next.day - b.next.day
    );
  });

  return {
    personal: all.filter((m) => !m.rule.scholarship),
    scholarships: all.filter((m) => m.rule.scholarship),
  };
}

/** All dated moments of a rule as calendar events (open + close where present). */
export function icsForRule(rule: DeadlineRule, now: Date): string {
  const events: IcsEvent[] = [rule.opens, rule.closes]
    .filter((m): m is NonNullable<typeof m> => m !== undefined)
    .map((m) => {
      const d = nextOccurrence(m.month, m.day, now);
      return {
        uid: `${rule.id}-${m.month}-${m.day}`,
        title: `${rule.title} — ${m.label}`,
        description: `${rule.detail}\nOfficial source: ${rule.sourceUrl}\n(Recurring yearly — verify the exact date on the official page.)`,
        url: rule.sourceUrl,
        start: d,
      };
    });
  return buildCalendar(events);
}
