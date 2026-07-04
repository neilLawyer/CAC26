import { Card } from "@/components/ui/Card";
import type { Program } from "@/lib/types";

// Cascade / domino chaining: because you may qualify for one program, these
// others are commonly worth checking too. Renders nothing when empty.
type Cascade = { from: Program; suggested: Program };

export function CascadePanel({ cascades }: { cascades: Cascade[] }) {
  if (cascades.length === 0) return null;
  const unique = [...new Map(cascades.map((c) => [c.suggested.id, c])).values()];
  return (
    <Card className="p-5 space-y-1">
      <p className="text-sm font-medium">Because you may qualify for one program, also check:</p>
      <ul className="text-sm text-muted list-disc list-inside">
        {unique.map((c) => (
          <li key={c.suggested.id}>
            {c.suggested.name}{" "}
            <span className="text-muted/70">(often paired with {c.from.shortName})</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
