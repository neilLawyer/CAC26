import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { POPULATIONS } from "@/data/populations";

// "Built for real people" — one card per population module, data-driven. Each
// links to that population's /for/[id] landing page.
export function PopulationGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center">Built for the moments life throws at you</h2>
      <p className="text-center text-muted mt-2 max-w-xl mx-auto">
        Whoever you are, start with the programs built around your situation.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
        {POPULATIONS.map((p) => (
          <Link
            key={p.id}
            href={`/for/${p.id}`}
            className="hover-lift block rounded-2xl border border-card-border bg-card overflow-hidden"
          >
            <div
              className="h-24 flex items-center justify-center"
              style={{ backgroundColor: `${p.color}1f` }}
            >
              <Icon size={32} stroke={p.color}>
                {ICON_PATHS[p.iconKey]}
              </Icon>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm">{p.label}</h3>
              <p className="text-xs text-muted mt-1">{p.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
