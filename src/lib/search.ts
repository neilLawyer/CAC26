import { SCOPES } from "@/data/scopes";
import { SEARCH_TAGS } from "@/data/search-tags";
import type { Program } from "@/lib/types";

// Universal search: a data-driven index (programs for the household's state +
// scope rooms + app pages, enriched with the synonym tags in
// src/data/search-tags.ts) and a small hand-rolled scorer. No dependency, no
// network — the index is built from the same records the results render.

export interface SearchEntry {
  key: string;
  kind: "program" | "scope" | "page";
  title: string;
  subtitle: string;
  href: string;
  /** Key color for the row (scope/program category color). */
  color?: string;
  iconKey?: string;
  keywords: string[];
}

/** App pages the palette can jump to. Grows as v4 surfaces land. */
export const SEARCH_PAGES: Omit<SearchEntry, "kind" | "key">[] = [
  {
    title: "Check my eligibility",
    subtitle: "The three-minute questionnaire — everything starts here",
    href: "/intake",
    keywords: ["intake", "questionnaire", "start", "screening", "check"],
  },
  {
    title: "My results",
    subtitle: "Everything you may qualify for, in one place",
    href: "/results",
    keywords: ["results", "matches", "dashboard", "programs"],
  },
  {
    title: "Benefits-cliff simulator",
    subtitle: "What a raise really nets you once benefit limits move",
    href: "/cliff-simulator",
    keywords: ["raise", "cliff", "promotion", "extra hours", "overtime", "net effect"],
  },
  {
    title: "Merit scholarships & contests",
    subtitle: "Real awards with NO income test — verified official links",
    href: "/scholarships",
    keywords: [
      "scholarship",
      "merit",
      "psat",
      "national merit",
      "essay contest",
      "coca-cola",
      "college money",
    ],
  },
];

function scopeHref(id: string): string {
  return `/intake/${id}`;
}

/** Build the searchable index for one state's program set. */
export function buildSearchIndex(programs: Program[]): SearchEntry[] {
  const scopeByCategory = new Map(SCOPES.map((s) => [s.id as string, s]));

  const entries: SearchEntry[] = [
    ...programs.map((p): SearchEntry => {
      const scope = scopeByCategory.get(p.category);
      return {
        key: `program:${p.id}`,
        kind: "program",
        title: p.name,
        subtitle: p.summary.length > 90 ? `${p.summary.slice(0, 87)}…` : p.summary,
        href: scopeHref(p.category),
        color: scope?.color,
        iconKey: scope?.iconKey,
        keywords: [p.shortName.toLowerCase(), p.agencyName.toLowerCase(), p.category],
      };
    }),
    ...SCOPES.map(
      (s): SearchEntry => ({
        key: `scope:${s.id}`,
        kind: "scope",
        title: s.label,
        subtitle:
          s.kind === "category"
            ? `The ${s.label.toLowerCase()} room — programs + questions that sharpen them`
            : `Made for ${s.label.toLowerCase()} — a guided deep dive`,
        href: scopeHref(s.id),
        color: s.color,
        iconKey: s.iconKey,
        keywords: [s.kind === "category" ? "category" : "persona"],
      })
    ),
    ...SEARCH_PAGES.map(
      (p): SearchEntry => ({ ...p, key: `page:${p.href}`, kind: "page" })
    ),
  ];

  // Fold in the synonym tags: each phrase becomes a keyword on its targets.
  // Unresolvable targets are DROPPED (state packs differ) — a unit test keeps
  // the tag file honest against the full catalog.
  const byKey = new Map(entries.map((e) => [e.key, e]));
  for (const tag of SEARCH_TAGS) {
    for (const t of tag.targets) {
      const key =
        t.kind === "program"
          ? `program:${t.id}`
          : t.kind === "scope"
            ? `scope:${t.id}`
            : `page:${t.path}`;
      byKey.get(key)?.keywords.push(tag.phrase);
    }
  }
  return entries;
}

/** AND-over-tokens scoring: every query token must land somewhere. */
function scoreToken(entry: SearchEntry, token: string): number {
  const title = entry.title.toLowerCase();
  let best = 0;
  if (title.startsWith(token)) best = Math.max(best, 30);
  else if (title.split(/[\s/&-]+/).some((w) => w.startsWith(token))) best = Math.max(best, 20);
  else if (title.includes(token)) best = Math.max(best, 12);
  for (const k of entry.keywords) {
    if (k === token) best = Math.max(best, 24);
    else if (k.startsWith(token)) best = Math.max(best, 15);
    else if (k.split(/\s+/).some((w) => w.startsWith(token))) best = Math.max(best, 12);
    else if (k.includes(token)) best = Math.max(best, 7);
  }
  if (entry.subtitle.toLowerCase().includes(token)) best = Math.max(best, 4);
  return best;
}

export function searchIndex(
  index: SearchEntry[],
  query: string,
  limit = 8
): SearchEntry[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored = index
    .map((entry) => {
      let total = 0;
      for (const token of tokens) {
        const s = scoreToken(entry, token);
        if (s === 0) return null; // AND semantics
        total += s;
      }
      // Rooms edge out single programs on ties — they contain the programs.
      if (entry.kind === "scope") total += 3;
      return { entry, total };
    })
    .filter((x): x is { entry: SearchEntry; total: number } => x !== null)
    .sort((a, b) => b.total - a.total);

  return scored.slice(0, limit).map((s) => s.entry);
}
