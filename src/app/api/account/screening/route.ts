import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { savedScreenings } from "@/db/schema";
import type { Confidence, Household } from "@/lib/types";

// The one real access gate in the accounts feature — every handler requires
// a signed-in Clerk session. Guest use of the rest of the app never touches
// this route at all.

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await getDb()
    .select()
    .from(savedScreenings)
    .where(eq(savedScreenings.userId, userId));

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

interface SavePayload {
  household: Household;
  confidences: Record<string, Confidence>;
}

function isValidPayload(body: unknown): body is SavePayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    !!b.household &&
    typeof b.household === "object" &&
    typeof (b.household as Household).state === "string" &&
    !!b.confidences &&
    typeof b.confidences === "object"
  );
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  await getDb()
    .insert(savedScreenings)
    .values({ userId, household: body.household, confidences: body.confidences })
    .onConflictDoUpdate({
      target: savedScreenings.userId,
      set: { household: body.household, confidences: body.confidences, savedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await getDb().delete(savedScreenings).where(eq(savedScreenings.userId, userId));
  return NextResponse.json({ ok: true });
}
