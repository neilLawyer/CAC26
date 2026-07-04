import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { CATEGORIES } from "@/data/categories";

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
            <Card key={c.label} className="hover-lift p-4 flex flex-col gap-3">
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
          ))}
        </div>
      </div>
    </section>
  );
}
