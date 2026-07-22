import { jsPDF } from "jspdf";
import { documentsForCategories } from "@/data/documents";
import { estimatedAnnualValue } from "@/lib/engine";
import { money } from "@/lib/format";
import type { Confidence, EligibilityResult, Household, Program } from "@/lib/types";

// The guest-mode equivalent of an account: someone with no login has nothing
// synced anywhere, so "save my results" has to mean a real file landing on
// their computer, right now. Laid out like an actual document a caseworker
// or family member would want to read — one big number up front, a clear
// "do these first" vs "worth checking" split, and short scannable cards
// instead of a wall of text — not just a screenshot of the app.

const PAGE_WIDTH = 612; // US letter, pt
const PAGE_HEIGHT = 792;
const MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const INK = "#1a2033";
const SUBINK = "#5b6379";
const FAINT = "#98a1b8";
const TEAL = "#0d9488";
const TEAL_TINT = "#e3f4f2";
const AMBER = "#b45309";
const AMBER_TINT = "#faf0dd";

const CONFIDENCE_STYLE: Record<"likely" | "possible", { heading: string; sub: string; color: string; tint: string }> = {
  likely: {
    heading: "Apply for these first",
    sub: "You likely qualify based on what you told us.",
    color: TEAL,
    tint: TEAL_TINT,
  },
  possible: {
    heading: "Worth checking",
    sub: "You may qualify — the agency makes the final call.",
    color: AMBER,
    tint: AMBER_TINT,
  },
};

function worth(r: EligibilityResult): string | null {
  const min = r.program.estimatedAnnualValueMin;
  const max = r.program.estimatedAnnualValueMax;
  if (min === undefined || max === undefined) return null;
  return min === max ? `~${money(min)}/yr` : `${money(min)}-${money(max)}/yr`;
}

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function drawLogoMark(doc: jsPDF, x: number, y: number, scale: number) {
  doc.setDrawColor(TEAL);
  doc.setLineWidth(1.1 * scale);
  doc.roundedRect(x + 5 * scale, y + 3 * scale, 11 * scale, 18 * scale, 1.5 * scale, 1.5 * scale, "S");
  doc.setFillColor(TEAL);
  doc.circle(x + 13.2 * scale, y + 12 * scale, 1 * scale, "F");
  doc.setDrawColor("#7c3aed");
  doc.line(x + 16 * scale, y + 5.5 * scale, x + 20 * scale, y + 7 * scale);
  doc.line(x + 20 * scale, y + 7 * scale, x + 20 * scale, y + 20 * scale);
  doc.line(x + 20 * scale, y + 20 * scale, x + 16 * scale, y + 18.8 * scale);
}

export function downloadBenefitsPdf(
  household: Household,
  results: EligibilityResult[],
  stateName: string
): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let y = 0;
  const today = new Date().toISOString().slice(0, 10);

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - 54) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function wrap(text: string, size: number): string[] {
    doc.setFontSize(size);
    return doc.splitTextToSize(text, CONTENT_WIDTH - 24);
  }

  // ---- Header band ------------------------------------------------------
  doc.setFillColor(INK);
  doc.rect(0, 0, PAGE_WIDTH, 92, "F");
  drawLogoMark(doc, MARGIN, 22, 1.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor("#ffffff");
  doc.text("OpenDoor", MARGIN + 42, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor("#aab0c4");
  doc.text("My Benefits Packet", MARGIN + 42, 57);
  doc.setFontSize(8.5);
  doc.setTextColor("#7d8399");
  doc.text(
    `Household of ${household.householdSize ?? "?"} - ${stateName} - prepared ${today}`,
    MARGIN,
    78
  );
  y = 118;

  // ---- Hero: total estimated value ---------------------------------------
  const included = results.filter((r) => r.confidence === "likely" || r.confidence === "possible");
  const likely = included.filter((r) => r.confidence === "likely");
  const possible = included.filter((r) => r.confidence === "possible");
  const { min: valueMin, max: valueMax } = estimatedAnnualValue(results);

  const heroHeight = 74;
  doc.setFillColor(TEAL_TINT);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, heroHeight, 10, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(TEAL);
  doc.text("ESTIMATED VALUE YOU MAY BE MISSING", MARGIN + 20, y + 24);
  doc.setFontSize(26);
  doc.setTextColor(INK);
  doc.text(`${money(valueMin)} - ${money(valueMax)}/yr`, MARGIN + 20, y + 52);

  const statX = MARGIN + CONTENT_WIDTH - 150;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(TEAL);
  doc.text(`${likely.length} likely`, statX, y + 30);
  doc.setTextColor(AMBER);
  doc.text(`${possible.length} worth checking`, statX, y + 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(SUBINK);
  doc.text(`${results.length} programs screened`, statX, y + 60);
  y += heroHeight + 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(FAINT);
  for (const line of wrap(
    "General information, not an official decision — every program below names the real agency that decides, and where to apply.",
    8.5
  )) {
    doc.text(line, MARGIN, y);
    y += 11;
  }
  y += 10;

  // ---- Program section (shared renderer for likely + possible) ----------
  // Program names run up to ~60 characters in this dataset ("California
  // Earned Income Tax Credit + Young Child Tax Credit"), so the name gets
  // its own full-width row(s) — the value goes on its own line right below
  // rather than squeezed beside a title that might wrap.
  const cardTextWidth = CONTENT_WIDTH - 32;

  function layoutCard(r: EligibilityResult) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    const nameLines: string[] = doc.splitTextToSize(r.program.name, cardTextWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const summaryLines: string[] = doc.splitTextToSize(r.program.summary, cardTextWidth);
    const applyLines: string[] = doc.splitTextToSize(
      `Apply with ${r.program.agencyName} -> ${domain(r.program.applyUrl)}`,
      cardTextWidth
    );
    const value = worth(r);
    const height =
      18 + // top padding to first baseline
      nameLines.length * 14 +
      (value ? 14 : 0) +
      5 +
      summaryLines.length * 12.5 +
      5 +
      applyLines.length * 12.5 +
      12; // bottom padding
    return { nameLines, summaryLines, applyLines, value, height };
  }

  function drawCard(r: EligibilityResult, style: (typeof CONFIDENCE_STYLE)["likely"]) {
    const { nameLines, summaryLines, applyLines, value, height: h } = layoutCard(r);
    ensureSpace(h + 10);
    const top = y;

    doc.setFillColor("#fbfbfd");
    doc.setDrawColor("#e6e8f0");
    doc.setLineWidth(0.75);
    doc.roundedRect(MARGIN, top, CONTENT_WIDTH, h, 8, 8, "FD");
    // left accent bar signals priority at a glance without re-reading labels
    doc.setFillColor(style.color);
    doc.roundedRect(MARGIN, top, 4, h, 2, 2, "F");

    let cy = top + 18;
    const cx = MARGIN + 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(INK);
    for (const line of nameLines) {
      doc.text(line, cx, cy);
      cy += 14;
    }
    if (value) {
      doc.setFontSize(10);
      doc.setTextColor(style.color);
      doc.text(value, cx, cy);
      cy += 14;
    }
    cy += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(SUBINK);
    for (const line of summaryLines) {
      doc.text(line, cx, cy);
      cy += 12.5;
    }
    cy += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(INK);
    for (const line of applyLines) {
      doc.text(line, cx, cy);
      cy += 12.5;
    }

    y = top + h + 10;
  }

  function drawSection(items: EligibilityResult[], key: "likely" | "possible") {
    if (items.length === 0) return;
    const style = CONFIDENCE_STYLE[key];
    ensureSpace(46);
    doc.setFillColor(style.color);
    doc.circle(MARGIN + 4, y - 3, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(INK);
    doc.text(style.heading, MARGIN + 16, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(SUBINK);
    doc.text(style.sub, MARGIN + 16, y + 14);
    y += 30;
    for (const r of items) drawCard(r, style);
    y += 6;
  }

  drawSection(likely, "likely");
  drawSection(possible, "possible");

  // ---- Documents checklist ------------------------------------------------
  const categories = new Set<Program["category"]>(included.map((r) => r.program.category));
  const documents = documentsForCategories(categories);

  ensureSpace(40);
  doc.setFillColor(INK);
  doc.circle(MARGIN + 4, y - 3, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(INK);
  doc.text("Documents to gather", MARGIN + 16, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(SUBINK);
  doc.text("One pile covers everything above.", MARGIN + 16, y + 14);
  y += 34;

  for (const d of documents) {
    const detailLines = d.detail ? wrap(d.detail, 8.5) : [];
    const needed = 15 + detailLines.length * 11 + 8;
    ensureSpace(needed);
    doc.setDrawColor(FAINT);
    doc.setLineWidth(1);
    doc.roundedRect(MARGIN, y - 8, 9, 9, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(INK);
    doc.text(d.label, MARGIN + 16, y);
    y += 12;
    if (d.detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(SUBINK);
      for (const line of detailLines) {
        doc.text(line, MARGIN + 16, y);
        y += 11;
      }
    }
    y += 8;
  }

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(FAINT);
  for (const line of wrap(
    "These are the documents agencies commonly ask for — each agency confirms the exact list when you apply, and missing one is a reason to ask, not a reason to skip applying.",
    8.5
  )) {
    ensureSpace(11);
    doc.text(line, MARGIN, y);
    y += 11;
  }

  // ---- Footer on every page ----------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor("#e6e8f0");
    doc.setLineWidth(0.75);
    doc.line(MARGIN, PAGE_HEIGHT - 40, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(FAINT);
    doc.text("opendoor-nj.vercel.app - informational only, not a government decision", MARGIN, PAGE_HEIGHT - 26);
    doc.text(`${i} / ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 26, { align: "right" });
  }

  doc.save(`opendoor-benefits-${household.state}-${today}.pdf`);
}
