import Link from "next/link";
import type { CSSProperties } from "react";
import { CATEGORIES } from "@/data/categories";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import type { EligibilityResult } from "@/lib/types";

// The hub's category tabs: one per category that has programs in this state,
// each a real link to its /intake/[scope] deep-dive page. Ordered by how much
// is still on the table there (open-result count) — computed from results
// data, never hardcoded. Each tab carries its category's key color and sigil,
// previewing the identity of the page it opens.
export function CategoryTabs({ results }: { results: EligibilityResult[] }) {
  const tabs = CATEGORIES.map((c) => {
    const items = results.filter((r) => r.program.category === c.id);
    const open = items.filter((r) => r.confidence !== "unlikely").length;
    return { meta: c, total: items.length, open };
  })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.open - a.open);

  if (tabs.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Dig deeper by category</h2>
      <p className="text-sm text-muted">
        Each area has its own short set of questions that can sharpen — and often add — results.
      </p>
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ meta, open }, i) => (
          <Link
            key={meta.id}
            href={`/intake/${meta.id}`}
            className="press-weight rise-in inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            style={
              {
                "--stagger": i,
                borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${meta.color} 7%, transparent)`,
                color: `color-mix(in srgb, ${meta.color} 62%, var(--foreground))`,
              } as CSSProperties
            }
          >
            <Icon size={14} stroke={meta.color}>
              {ICON_PATHS[meta.iconKey]}
            </Icon>
            {meta.label}
            <span className="text-muted">· {open} open</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
