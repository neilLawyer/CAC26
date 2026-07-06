import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allScopeIds, getScope } from "@/data/scopes";
import { ScopeScreen } from "@/components/intake/ScopeScreen";

// One dynamic route serves every deep-dive page: the eight categories and the
// five personas are values of the same [scope] param, rendered by the same
// ScopeScreen template. Adding a scope is a data edit — this file never changes.

export const dynamicParams = false;

export function generateStaticParams() {
  return allScopeIds().map((scope) => ({ scope }));
}

export async function generateMetadata({
  params,
}: PageProps<"/intake/[scope]">): Promise<Metadata> {
  const { scope } = await params;
  const meta = getScope(scope);
  return { title: meta ? `OpenDoor — ${meta.label}` : "OpenDoor" };
}

export default async function ScopePage({ params }: PageProps<"/intake/[scope]">) {
  const { scope } = await params;
  if (!getScope(scope)) notFound();
  return <ScopeScreen scopeId={scope} />;
}
