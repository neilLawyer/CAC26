import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { CATEGORIES } from "@/data/categories";

// "One engine, every kind of help" — one tile per category, each a REAL link
// to that category's /intake/[scope] deep-dive page. These tiles were the
// last surviving looks-clickable-does-nothing controls (the reported
// "clicking Health goes nowhere" bug) — hover-lift now signals a real door.
export function CategoryGrid() {
  return (
    <section className="border-y border-card-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">One engine, every kind of help</h2>
        <p className="text-center text-muted mt-2 max-w-xl mx-auto">
          The same rules-as-data engine covers every category below — adding a new program or a
          new state never touches the code, just the data.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/intake/${c.id}`} className="block">
              <Card className="hover-lift press-weight p-4 flex flex-col gap-3 h-full">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${c.color}1f` }}
                >
                  <Icon size={18} stroke={c.color}>
                    {ICON_PATHS[c.iconKey]}
                  </Icon>
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
