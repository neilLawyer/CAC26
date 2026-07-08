import { describe, expect, it } from "vitest";
import { diffSnapshot, makeSnapshot, type Snapshot } from "@/lib/snapshot";
import type { Confidence, EligibilityResult, Program } from "@/lib/types";

function result(id: string, confidence: Confidence): EligibilityResult {
  return {
    program: { id, shortName: id } as Program,
    confidence,
    reasons: [],
  };
}

function snap(confidences: Record<string, Confidence>): Snapshot {
  return { savedAt: "2026-01-01", state: "NJ", confidences };
}

describe("diffSnapshot — only likely-line crossings are announced", () => {
  it("unlikely → likely is 'now likely'", () => {
    const d = diffSnapshot(snap({ a: "unlikely" }), [result("a", "likely")]);
    expect(d.nowLikely.map((r) => r.program.id)).toEqual(["a"]);
    expect(d.noLongerLikely).toEqual([]);
  });

  it("likely → possible is 'no longer likely'", () => {
    const d = diffSnapshot(snap({ a: "likely" }), [result("a", "possible")]);
    expect(d.nowLikely).toEqual([]);
    expect(d.noLongerLikely.map((x) => x.result.program.id)).toEqual(["a"]);
  });

  it("a program NEW to the library that lands likely counts as newly available", () => {
    const d = diffSnapshot(snap({}), [result("brand-new", "likely")]);
    expect(d.nowLikely.map((r) => r.program.id)).toEqual(["brand-new"]);
  });

  it("softer movements (possible ↔ needsInfo, unlikely ↔ possible) stay quiet", () => {
    const d = diffSnapshot(snap({ a: "possible", b: "needsInfo", c: "unlikely" }), [
      result("a", "needsInfo"),
      result("b", "possible"),
      result("c", "possible"),
    ]);
    expect(d.nowLikely).toEqual([]);
    expect(d.noLongerLikely).toEqual([]);
  });

  it("steady likely programs are not re-announced", () => {
    const d = diffSnapshot(snap({ a: "likely" }), [result("a", "likely")]);
    expect(d.nowLikely).toEqual([]);
    expect(d.noLongerLikely).toEqual([]);
  });
});

describe("makeSnapshot", () => {
  it("captures every result's confidence keyed by program id", () => {
    const s = makeSnapshot("NJ", [result("a", "likely"), result("b", "unlikely")]);
    expect(s.state).toBe("NJ");
    expect(s.confidences).toEqual({ a: "likely", b: "unlikely" });
    expect(s.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
