import type { Metadata } from "next";
import Link from "next/link";
import {
  TAX_GUIDE_SECTIONS,
  WHAT_TO_BRING,
  TAX_GUIDE_LAST_VERIFIED,
} from "@/data/tax-guide";
import { PrintButton } from "@/components/PrintButton";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Claim your tax credits — OpenDoor",
  description:
    "What filing actually is, the real free ways to do it, and a printable what-to-bring checklist. Guidance only — OpenDoor never files taxes or collects financial data.",
};

// "Claim your tax credits" — a walkthrough, not a filing tool. Content lives
// in src/data/tax-guide.ts (verified against sources on its stamp date).
// Printing this page prints ONLY the what-to-bring checklist.
export default function TaxGuidePage() {
  return (
    <>
      <main className="flex-1">
        <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-10">
          <div className="space-y-3 no-print">
            <p className="label-mono text-[10px] text-accent">guidance only — we never file</p>
            <h1 className="text-3xl font-bold">Claim your tax credits</h1>
            <p className="text-sm text-muted max-w-lg">
              Tax credits are the single biggest pile of unclaimed money for working
              households — and claiming them just means filing a return, which you can do
              for free. This page explains how. OpenDoor never files anything for you and
              never asks for financial information: every step below happens with the IRS
              or an IRS-certified free service.
            </p>
          </div>

          {TAX_GUIDE_SECTIONS.map((section, si) => (
            <section key={section.id} className="space-y-3 no-print">
              <h2 className="text-xl font-semibold">
                <span className="label-mono text-[10px] text-accent align-middle mr-2.5">
                  {String(si + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h2>
              {section.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  {p}
                </p>
              ))}
              {section.warnings?.map((w, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#f9d34c]/40 bg-[#f9d34c]/8 px-4 py-3 text-sm"
                >
                  <span className="label-mono text-[9px] text-[#b98b00] dark:text-[#f9d34c] mr-2">
                    watch out
                  </span>
                  {w}
                </div>
              ))}
              {section.links && (
                <ul className="space-y-1.5 pt-1">
                  {section.links.map((l) => (
                    <li key={l.url} className="text-sm">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                      >
                        {l.label} →
                      </a>
                      {l.note && <span className="text-muted"> {l.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* The printable checklist — the ONLY thing the printer receives. */}
          <section className="print-area rounded-2xl border border-accent/30 bg-card p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-mono text-[10px] text-accent">printable</p>
                <h2 className="text-xl font-semibold mt-1">What to bring to free tax prep</h2>
                <p className="text-xs text-muted mt-1">
                  Mirrors the IRS&apos;s own checklist for VITA/TCE visits. Verified{" "}
                  {TAX_GUIDE_LAST_VERIFIED}.
                </p>
              </div>
              <PrintButton label="Print this checklist" />
            </div>
            <ul className="space-y-2.5">
              {WHAT_TO_BRING.map((c) => (
                <li key={c.item} className="flex gap-3 text-sm">
                  <span
                    aria-hidden
                    className="checkbox-square mt-0.5 w-4 h-4 shrink-0 rounded border-2 border-muted/60"
                  />
                  <span>
                    <span className="font-medium">{c.item}</span>
                    {c.detail && <span className="text-muted"> — {c.detail}</span>}
                    {c.appliesWhen && (
                      <span className="block text-xs text-muted italic">{c.appliesWhen}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              Find a free site: irs.treasury.gov/freetaxprep — or getyourrefund.org from home.
            </p>
          </section>

          <div className="no-print rounded-xl border border-card-border bg-card/60 p-4 text-sm text-muted">
            Want to know which credits you&apos;d likely qualify for first?{" "}
            <Link href="/intake/tax" className="text-accent underline hover:no-underline">
              The tax room screens the EITC and CTC against your answers →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
