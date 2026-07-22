import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy init: DATABASE_URL isn't set until Neon is provisioned, and Next.js
// evaluates top-level module code at build time — a top-level neon() call
// would crash `next build` before that. A plain function (not a Proxy —
// Proxies break libraries that introspect the client object) defers the
// read until the first real request.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
