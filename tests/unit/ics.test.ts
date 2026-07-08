import { describe, it, expect } from "vitest";
import { buildCalendar, downloadIcs, type IcsEvent } from "../../src/lib/ics";

/** Byte length of a string as UTF-8, used to assert the 75-octet fold limit (RFC 5545 §3.1). */
function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

describe("buildCalendar — TEXT escaping (RFC 5545 §3.3.11)", () => {
  it("escapes commas, semicolons, and backslashes in SUMMARY", () => {
    const events: IcsEvent[] = [
      {
        uid: "escape-1",
        title: "Comma, semicolon; backslash\\ end",
        start: { year: 2026, month: 3, day: 1 },
      },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("SUMMARY:Comma\\, semicolon\\; backslash\\\\ end");
  });

  it("escapes newlines in DESCRIPTION as literal \\n, both LF and CRLF input", () => {
    const events: IcsEvent[] = [
      {
        uid: "escape-2",
        title: "Newlines",
        description: "Line one\nLine two\r\nLine three",
        start: { year: 2026, month: 3, day: 1 },
      },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two\\nLine three");
    // Escaping must not introduce real CR/LF bytes of its own.
    expect(ics).not.toMatch(/DESCRIPTION:[^\r]*\n/);
  });

  it("escapes backslashes before other characters, so nothing double-escapes", () => {
    const events: IcsEvent[] = [
      { uid: "escape-3", title: "a\\,b", start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);
    // "\," should become "\\\;" style: backslash escaped first, then comma escaped independently.
    expect(ics).toContain("SUMMARY:a\\\\\\,b");
  });
});

describe("buildCalendar — line folding (RFC 5545 §3.1)", () => {
  it("folds a long all-ASCII line at exactly the 75-octet boundary with CRLF + single space", () => {
    const longTitle = "A".repeat(100);
    const events: IcsEvent[] = [
      { uid: "fold-1", title: longTitle, start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);

    // "SUMMARY:" (8 octets) + 67 'A's = 75 octets exactly on the first physical line;
    // the remaining 33 'A's continue on a folded line prefixed with a single space.
    const expectedFirstLine = "SUMMARY:" + "A".repeat(67);
    const expectedSecondLine = " " + "A".repeat(33);
    expect(ics).toContain(expectedFirstLine + "\r\n" + expectedSecondLine);
  });

  it("never splits a multi-byte character across a fold boundary", () => {
    // Engineered so the naive (character-oblivious) 75th *byte* would land
    // inside the 4-byte emoji's UTF-8 encoding: "DESCRIPTION:" (12) + 61 'D's
    // = 73 octets, then the emoji (4 octets) would span bytes 73-76, straddling
    // the 75-octet cut point if folding were byte-naive.
    const description = "D".repeat(61) + "\u{1F600}" + "END";
    const events: IcsEvent[] = [
      { uid: "fold-2", title: "Emoji fold", description, start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);

    const expectedFirstLine = "DESCRIPTION:" + "D".repeat(61);
    const expectedSecondLine = " \u{1F600}END";
    expect(ics).toContain(expectedFirstLine + "\r\n" + expectedSecondLine);
    // The emoji must appear intact (not as split/mangled bytes) somewhere in the output.
    expect(ics).toContain("\u{1F600}");
  });

  it("never produces a physical line longer than 75 octets", () => {
    const events: IcsEvent[] = [
      {
        uid: "fold-3",
        title: "X".repeat(300),
        description: "Y".repeat(300) + " \u{1F600} " + "Z".repeat(300),
        url: "https://example.com/" + "q".repeat(200),
        start: { year: 2026, month: 6, day: 15 },
        end: { year: 2026, month: 6, day: 20 },
      },
    ];
    const ics = buildCalendar(events);
    // Drop the trailing empty segment produced by the final CRLF.
    const physicalLines = ics.split("\r\n").slice(0, -1);
    for (const line of physicalLines) {
      expect(byteLength(line)).toBeLessThanOrEqual(75);
    }
  });

  it("does not fold short lines", () => {
    const events: IcsEvent[] = [
      { uid: "fold-4", title: "Short title", start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("SUMMARY:Short title\r\n");
  });
});

describe("buildCalendar — all-day DTSTART/DTEND formatting", () => {
  it("zero-pads single-digit months and days", () => {
    const events: IcsEvent[] = [
      { uid: "date-1", title: "Pad test", start: { year: 2026, month: 1, day: 5 } },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("DTSTART;VALUE=DATE:20260105");
  });

  it("includes DTEND (exclusive) when end is given, formatted the same way", () => {
    const events: IcsEvent[] = [
      {
        uid: "date-2",
        title: "Range test",
        start: { year: 2026, month: 3, day: 9 },
        end: { year: 2026, month: 12, day: 31 },
      },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("DTSTART;VALUE=DATE:20260309");
    expect(ics).toContain("DTEND;VALUE=DATE:20261231");
  });

  it("omits DTEND entirely for single-day events", () => {
    const events: IcsEvent[] = [
      { uid: "date-3", title: "Single day", start: { year: 2026, month: 7, day: 4 } },
    ];
    const ics = buildCalendar(events);
    expect(ics).not.toContain("DTEND");
  });

  it("includes a DTSTAMP in YYYYMMDDTHHMMSSZ form", () => {
    const events: IcsEvent[] = [
      { uid: "date-4", title: "Stamp test", start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z\r\n/);
  });
});

describe("buildCalendar — UID normalization", () => {
  it("appends @opendoor when the uid has no domain", () => {
    const events: IcsEvent[] = [
      { uid: "deadline-42", title: "No domain", start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("UID:deadline-42@opendoor\r\n");
  });

  it("leaves a uid that already contains an @ untouched", () => {
    const events: IcsEvent[] = [
      {
        uid: "deadline-43@example.com",
        title: "Has domain",
        start: { year: 2026, month: 1, day: 1 },
      },
    ];
    const ics = buildCalendar(events);
    expect(ics).toContain("UID:deadline-43@example.com\r\n");
    expect(ics).not.toContain("deadline-43@example.com@opendoor");
  });
});

describe("buildCalendar — CRLF line endings", () => {
  it("uses CRLF throughout, including the final line", () => {
    const events: IcsEvent[] = [
      { uid: "crlf-1", title: "CRLF check", start: { year: 2026, month: 1, day: 1 } },
    ];
    const ics = buildCalendar(events);
    expect(ics.endsWith("\r\n")).toBe(true);
    // No bare LF that isn't immediately preceded by a CR.
    expect(ics).not.toMatch(/(?<!\r)\n/);
  });
});

describe("buildCalendar — full structural assertion of a small calendar", () => {
  it("produces the expected wrapper and a single well-formed VEVENT", () => {
    const events: IcsEvent[] = [
      {
        uid: "app-deadline",
        title: "FAFSA deadline",
        description: "Submit your FAFSA before the state deadline.",
        url: "https://example.com/fafsa",
        start: { year: 2026, month: 4, day: 1 },
      },
    ];
    const ics = buildCalendar(events);
    const lines = ics.split("\r\n");

    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines[1]).toBe("VERSION:2.0");
    expect(lines[2]).toBe("PRODID:-//OpenDoor//Deadlines//EN");
    expect(lines[3]).toBe("CALSCALE:GREGORIAN");
    expect(lines[4]).toBe("METHOD:PUBLISH");
    expect(lines[5]).toBe("BEGIN:VEVENT");
    expect(lines[6]).toBe("UID:app-deadline@opendoor");
    expect(lines[7]).toMatch(/^DTSTAMP:\d{8}T\d{6}Z$/);
    expect(lines[8]).toBe("DTSTART;VALUE=DATE:20260401");
    expect(lines[9]).toBe("SUMMARY:FAFSA deadline");
    expect(lines[10]).toBe("DESCRIPTION:Submit your FAFSA before the state deadline.");
    expect(lines[11]).toBe("URL:https://example.com/fafsa");
    expect(lines[12]).toBe("END:VEVENT");
    expect(lines[13]).toBe("END:VCALENDAR");
    // Trailing empty string from the final CRLF split.
    expect(lines[14]).toBe("");
    expect(lines.length).toBe(15);
  });

  it("emits one VEVENT per input event, in order", () => {
    const events: IcsEvent[] = [
      { uid: "e1", title: "First", start: { year: 2026, month: 1, day: 1 } },
      { uid: "e2", title: "Second", start: { year: 2026, month: 2, day: 1 } },
    ];
    const ics = buildCalendar(events);
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(ics.match(/END:VEVENT/g)?.length).toBe(2);
    expect(ics.indexOf("SUMMARY:First")).toBeLessThan(ics.indexOf("SUMMARY:Second"));
  });

  it("handles an empty event list", () => {
    const ics = buildCalendar([]);
    expect(ics).toBe(
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//OpenDoor//Deadlines//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n",
    );
  });
});

describe("downloadIcs — browser guard", () => {
  it("throws a clear error outside a browser environment", () => {
    // This test suite runs under vitest's default node environment, where
    // `document` is undefined, so downloadIcs must fail fast and clearly
    // rather than throwing a cryptic ReferenceError.
    expect(() => downloadIcs("deadlines.ics", "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n")).toThrow(
      /browser/i,
    );
  });
});
