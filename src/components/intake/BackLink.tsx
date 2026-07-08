"use client";

import { useT } from "@/lib/i18n";

// The "← Back" link shared by the intake steps.
type BackLinkProps = { onClick: () => void };

export function BackLink({ onClick }: BackLinkProps) {
  const t = useT();
  return (
    <button onClick={onClick} className="text-sm text-muted hover:text-accent transition-colors">
      {t("intake.back")}
    </button>
  );
}
