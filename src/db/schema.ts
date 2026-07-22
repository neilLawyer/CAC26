import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One saved screening per account — mirrors the shape of the local-only
// Snapshot (src/lib/snapshot.ts) so the same household/results data an
// anonymous user keeps on-device is what a signed-in user keeps in sync
// across devices. Single slot per user: no history, no named screenings.
export const savedScreenings = pgTable("saved_screenings", {
  userId: text("user_id").primaryKey(), // Clerk user id
  household: jsonb("household").notNull(),
  confidences: jsonb("confidences").notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});
