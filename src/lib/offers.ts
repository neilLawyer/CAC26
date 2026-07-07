import { OFFER_RULES } from "@/data/offers";
import { getScope, type ScopeMeta } from "@/data/scopes";
import { conditionHolds, questionsForScope } from "@/lib/question-engine";
import type { EligibilityResult, Household, OfferRule } from "@/lib/types";

// Adaptive branching: which deeper forms to OFFER this household, ranked.
// The menu is computed, never fixed — a rule fires only when its conditions
// hold, and its rank blends three signals:
//   base weight        (the rule's own urgency, from data)
//   open results       (how much is already live in that scope)
//   unanswered count   (how much that scope's form can still CHANGE)
// One offer per destination scope (the strongest rule wins), so the list
// reads as distinct doors, not repeated nags.

export interface RankedOffer {
  rule: OfferRule;
  scope: ScopeMeta;
  score: number;
  openResults: number;
  unanswered: number;
}

export function rankOffers(
  household: Household,
  allResults: EligibilityResult[]
): RankedOffer[] {
  const byScope = new Map<string, RankedOffer>();

  for (const rule of OFFER_RULES) {
    if (!rule.when.every((cond) => conditionHolds(cond, household))) continue;

    const scope = getScope(rule.scope);
    if (!scope) continue;

    const scopeResults = scope.filterResults(allResults);
    const openResults = scopeResults.filter((r) => r.confidence !== "unlikely").length;
    const unanswered = questionsForScope(scope.id, scopeResults, household).length;

    // A door with nothing behind it isn't an offer — skip scopes where no
    // program is live AND no question could change that.
    if (openResults === 0 && unanswered === 0) continue;

    const score = rule.weight + openResults * 2 + unanswered;
    const existing = byScope.get(scope.id);
    if (!existing || score > existing.score) {
      byScope.set(scope.id, { rule, scope, score, openResults, unanswered });
    }
  }

  return [...byScope.values()].sort((a, b) => b.score - a.score);
}
