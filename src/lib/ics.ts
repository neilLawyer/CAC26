// Minimal, dependency-free RFC 5545 (iCalendar) builder for ALL-DAY events,
// plus a browser-only helper to trigger a client-side .ics download.
//
// Scope is deliberately narrow: this only knows how to emit all-day VEVENTs
// (DTSTART/DTEND with VALUE=DATE). No recurrence, no timed events, no
// timezone math — deadlines in this app are calendar dates, not instants.

/** An all-day calendar date. `month` is 1-12 (not the 0-indexed JS convention). */
export interface IcsDate {
  year: number;
  month: number;
  day: number;
}

export interface IcsEvent {
  /** Caller-provided stable id; a "@opendoor" domain is appended if the uid has none. */
  uid: string;
  /** SUMMARY */
  title: string;
  /** DESCRIPTION */
  description?: string;
  /** URL */
  url?: string;
  /** All-day event date (local calendar date, no time zone math). */
  start: IcsDate;
  /** Optional exclusive end date for multi-day windows; omit for single-day. */
  end?: IcsDate;
}

const CRLF = "\r\n";
// RFC 5545 §3.1 "Content Lines": lines SHOULD be folded at 75 octets so that,
// with the leading space added back after unfolding, each physical line is
// at most 76 octets. We fold strictly *before* 75 octets of content.
const FOLD_LIMIT = 75;

/**
 * Escape TEXT values per RFC 5545 §3.3.11:
 * backslash, semicolon, and comma are escaped with a leading backslash;
 * newlines become the literal two-character sequence "\n".
 * Order matters: backslashes must be escaped first, or we'd double-escape
 * the backslashes we just inserted for the other characters.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Fold a single logical content line into RFC 5545 §3.1 physical lines.
 * Folding is defined in terms of octets (UTF-8 bytes), not UTF-16 code
 * units or characters, so we walk the UTF-8 encoding and never split a
 * multi-byte character across a fold boundary.
 */
function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= FOLD_LIMIT) {
    return line;
  }

  const decoder = new TextDecoder("utf-8");
  const chunks: string[] = [];
  let chunkStart = 0;
  // Budget starts at FOLD_LIMIT for the first physical line; continuation
  // lines carry one extra leading space (itself an octet), so their content
  // budget is FOLD_LIMIT - 1.
  let budget = FOLD_LIMIT;
  let i = 0;

  while (i < bytes.length) {
    const byte = bytes[i];
    // Determine how many octets this UTF-8 sequence occupies so we only ever
    // cut on a character boundary.
    let seqLen = 1;
    if ((byte & 0b1110_0000) === 0b1100_0000) seqLen = 2;
    else if ((byte & 0b1111_0000) === 0b1110_0000) seqLen = 3;
    else if ((byte & 0b1111_1000) === 0b1111_0000) seqLen = 4;

    if (i - chunkStart + seqLen > budget) {
      chunks.push(decoder.decode(bytes.slice(chunkStart, i)));
      chunkStart = i;
      budget = FOLD_LIMIT - 1; // account for the folding whitespace
    }
    i += seqLen;
  }
  chunks.push(decoder.decode(bytes.slice(chunkStart)));

  return chunks.join(CRLF + " ");
}

/** Zero-pad a date part; `YYYYMMDD` requires 4-digit years and 2-digit month/day. */
function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** `YYYYMMDD` for a DTSTART/DTEND ...;VALUE=DATE line (§3.3.4). */
function formatDate(d: IcsDate): string {
  return `${pad(d.year, 4)}${pad(d.month, 2)}${pad(d.day, 2)}`;
}

/** `YYYYMMDDTHHMMSSZ` UTC timestamp for DTSTAMP (§3.8.7.2), using the current time. */
function formatUtcStamp(date: Date): string {
  return (
    `${pad(date.getUTCFullYear(), 4)}${pad(date.getUTCMonth() + 1, 2)}${pad(date.getUTCDate(), 2)}` +
    `T${pad(date.getUTCHours(), 2)}${pad(date.getUTCMinutes(), 2)}${pad(date.getUTCSeconds(), 2)}Z`
  );
}

/** Ensure a UID has a domain-like suffix, per §3.8.4.7's recommendation that UIDs be globally unique. */
function normalizeUid(uid: string): string {
  return uid.includes("@") ? uid : `${uid}@opendoor`;
}

/** Build one "PROP:value" (or "PROP;PARAM=x:value") content line, escaping and folding it. */
function contentLine(prefix: string, value: string): string {
  return foldLine(`${prefix}:${escapeText(value)}`);
}

/** Build one VEVENT block (as an array of already-folded content lines, no CRLF joins yet). */
function buildEvent(event: IcsEvent, now: Date): string[] {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(contentLine("UID", normalizeUid(event.uid)));
  // DTSTAMP is required on every VEVENT (§3.8.7.2) and is not escaped: it's a fixed-format value, not free text.
  lines.push(foldLine(`DTSTAMP:${formatUtcStamp(now)}`));
  // All-day dates use VALUE=DATE (§3.6.1); also not free text, so not escaped.
  lines.push(foldLine(`DTSTART;VALUE=DATE:${formatDate(event.start)}`));
  if (event.end) {
    // DTEND is exclusive per §3.6.1 ("the non-inclusive end of the event");
    // callers must pass the day *after* the last included day.
    lines.push(foldLine(`DTEND;VALUE=DATE:${formatDate(event.end)}`));
  }
  lines.push(contentLine("SUMMARY", event.title));
  if (event.description) {
    lines.push(contentLine("DESCRIPTION", event.description));
  }
  if (event.url) {
    // URL values are not TEXT-escaped in the RFC's grammar, but escaping is
    // harmless here (URLs rarely contain ; , or raw newlines) and keeps this
    // codepath uniform with the other properties.
    lines.push(contentLine("URL", event.url));
  }
  lines.push("END:VEVENT");
  return lines;
}

/**
 * Build a full VCALENDAR document containing one VEVENT per input event.
 * Output uses CRLF line endings throughout, per §3.1, including the final line.
 */
export function buildCalendar(events: IcsEvent[]): string {
  const now = new Date();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpenDoor//Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    lines.push(...buildEvent(event, now));
  }

  lines.push("END:VCALENDAR");

  return lines.join(CRLF) + CRLF;
}

/**
 * Browser-only: trigger a client-side download of `icsContent` as `filename`
 * via a Blob object URL and a temporary, programmatically-clicked <a> tag.
 * No network requests are made. Throws if called outside a browser (e.g.
 * during server-side rendering).
 */
export function downloadIcs(filename: string, icsContent: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined" || typeof Blob === "undefined") {
    throw new Error("downloadIcs() can only be called in a browser environment.");
  }

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
