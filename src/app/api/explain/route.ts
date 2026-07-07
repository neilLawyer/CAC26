import { getProgramById } from "@/data/states/index";

// Every response is generated fresh per household summary — never cache.
export const dynamic = "force-dynamic";

// SAFETY CONTRACT — do not edit without re-reviewing against the eligibility
// engine's guarantees. The model may use ONLY facts in the JSON it's given;
// it must never invent numbers, dates, program names, or eligibility claims,
// and must defer to "verify with the official source" for anything missing.
const EXPLAIN_SYSTEM_PROMPT =
  "You explain ONE benefit-program match to the household it matched, in plain warm language " +
  "at a 6th-grade reading level. HARD RULES: Use ONLY facts present in the provided programRecord " +
  "JSON and household summary. Never introduce any number, dollar amount, percentage, date, program " +
  "name, or requirement that is not literally present in that JSON. If a detail the household would " +
  "want is missing from the record, write exactly: 'verify with the official source'. Do not " +
  "speculate about eligibility — the record's status is already decided elsewhere. Do not give " +
  "financial, legal, or medical advice. Output 2–3 sentences: (1) why this program fits what they " +
  "told us, (2) the single concrete next step using the record's applyUrl agency, (3) if the record " +
  "has estimatedAnnualValue fields, what it may be worth, using only those numbers. No preamble, " +
  "no markdown.";

interface RawHouseholdSummary {
  size?: unknown;
  incomeBand?: unknown;
  kids?: unknown;
  state?: unknown;
  situations?: unknown;
}

interface RawExplainRequest {
  programId?: unknown;
  household?: unknown;
}

interface HouseholdSummary {
  size?: number;
  incomeBand?: string;
  kids?: number;
  state?: string;
  situations?: string[];
}

function parseHouseholdSummary(raw: unknown): HouseholdSummary {
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as RawHouseholdSummary;
  const summary: HouseholdSummary = {};
  if (typeof r.size === "number" && Number.isFinite(r.size)) summary.size = r.size;
  if (typeof r.incomeBand === "string") summary.incomeBand = r.incomeBand;
  if (typeof r.kids === "number" && Number.isFinite(r.kids)) summary.kids = r.kids;
  if (typeof r.state === "string") summary.state = r.state;
  if (Array.isArray(r.situations) && r.situations.every((s) => typeof s === "string")) {
    summary.situations = r.situations as string[];
  }
  return summary;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ disabled: true });
  }

  let body: RawExplainRequest;
  try {
    body = (await request.json()) as RawExplainRequest;
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (typeof body.programId !== "string") {
    return Response.json({ error: "programId is required." }, { status: 400 });
  }

  const program = getProgramById(body.programId);
  if (!program) {
    return Response.json({ error: "Unknown program." }, { status: 404 });
  }

  const household = parseHouseholdSummary(body.household);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: EXPLAIN_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify({ programRecord: program, household }),
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return Response.json({ error: "unavailable" });
    }

    const data = (await res.json()) as { content?: { text?: string }[] };
    const summary = data.content?.[0]?.text;
    if (typeof summary !== "string" || !summary) {
      return Response.json({ error: "unavailable" });
    }

    return Response.json({ summary });
  } catch {
    return Response.json({ error: "unavailable" });
  }
}
