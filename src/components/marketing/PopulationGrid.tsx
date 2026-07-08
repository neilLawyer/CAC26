import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { POPULATIONS } from "@/data/populations";

// The persona tiles, bare (no section chrome) — the home page uses them as
// the small-screen fallback for the orbit menu, which needs room to breathe.
// Each routes straight to that population's /intake/[scope] deep-dive form
// (its marketing landing stays reachable at /for/[id]).
export function PopulationTiles() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {POPULATIONS.map((p) => (
        <Link
          key={p.id}
          href={`/intake/${p.id}`}
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
  );
}
