import { describe, expect, it } from "vitest";
import { SEARCH_TAGS } from "@/data/search-tags";
import { STATES } from "@/data/states";
import { SCOPES } from "@/data/scopes";
import { SEARCH_PAGES, buildSearchIndex, searchIndex } from "@/lib/search";

// Keeps the delegated tag data honest: every target must resolve to a real
// program (in SOME state's composed pack), a real scope, or a real page —
// a typo'd id would otherwise be a silent search miss forever.

const KNOWN_PAGES = new Set([
  ...SEARCH_PAGES.map((p) => p.href),
  // v4 pages that land after W4 — listed here the day they ship a route.
  "/tax-guide",
  "/deadlines",
  "/scholarships",
  "/packet",
]);

describe("search-tags data invariant", () => {
  const allProgramIds = new Set(STATES.flatMap((s) => s.programs.map((p) => p.id)));
  const allScopeIds = new Set(SCOPES.map((s) => s.id as string));

  it("every tag target resolves to a real program, scope, or page", () => {
    const misses: string[] = [];
    for (const tag of SEARCH_TAGS) {
      for (const t of tag.targets) {
        const ok =
          t.kind === "program"
            ? allProgramIds.has(t.id)
            : t.kind === "scope"
              ? allScopeIds.has(t.id)
              : KNOWN_PAGES.has(t.path);
        if (!ok) misses.push(`${tag.phrase} → ${JSON.stringify(t)}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("phrases are lowercase and non-empty", () => {
    for (const tag of SEARCH_TAGS) {
      expect(tag.phrase.trim().length).toBeGreaterThan(0);
      expect(tag.phrase).toBe(tag.phrase.toLowerCase());
      expect(tag.targets.length).toBeGreaterThan(0);
    }
  });
});

describe("search behavior on the real NJ index", () => {
  const nj = STATES.find((s) => s.code === "NJ")!;
  const index = buildSearchIndex(nj.programs);

  it('"pregnant" surfaces the WIC pathway', () => {
    const hits = searchIndex(index, "pregnant").map((e) => e.title.toLowerCase());
    expect(hits.some((t) => t.includes("wic") || t.includes("women"))).toBe(true);
  });

  it('"food stamps" surfaces SNAP by its street name', () => {
    const hits = searchIndex(index, "food stamps").map((e) => e.title.toLowerCase());
    expect(hits.some((t) => t.includes("snap"))).toBe(true);
  });

  it('"raise" finds the cliff simulator page', () => {
    const hits = searchIndex(index, "raise");
    expect(hits.some((e) => e.href === "/cliff-simulator")).toBe(true);
  });

  it("empty and garbage queries return nothing (no fabricated matches)", () => {
    expect(searchIndex(index, "  ")).toEqual([]);
    expect(searchIndex(index, "xyzzyplugh")).toEqual([]);
  });
});
