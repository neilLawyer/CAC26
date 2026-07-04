import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { AUDIENCES } from "@/data/marketing";

// "Built for real people." Each card leads with an on-brand tinted panel and a
// decorative icon (no external images), then the audience's title and blurb.
export function AudienceGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center">Built for the moments life throws at you</h2>
      <div className="grid sm:grid-cols-3 gap-5 mt-10">
        {AUDIENCES.map((a) => (
          <div
            key={a.title}
            className="hover-lift rounded-2xl border border-card-border bg-card overflow-hidden"
          >
            <div
              className="h-44 flex items-center justify-center"
              style={{ backgroundColor: `${a.color}1f` }}
            >
              <Icon size={40} stroke={a.color}>
                {ICON_PATHS[a.iconKey]}
              </Icon>
            </div>
            <div className="p-5">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-muted mt-1">{a.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
