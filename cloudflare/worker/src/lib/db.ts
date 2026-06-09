/**
 * Couche mince D1 — à étendre par domaine (fees, blog, …).
 * Aucun lien avec Supabase : SQL SQLite uniquement.
 */
import type { Env } from "../env";

export function getDb(env: Env): D1Database | null {
  return env.DB ?? null;
}

export async function d1HealthCheck(db: D1Database): Promise<{ ok: boolean; sqliteVersion?: string }> {
  try {
    const row = await db.prepare("select sqlite_version() as v").first<{ v: string }>();
    return { ok: true, sqliteVersion: row?.v };
  } catch {
    return { ok: false };
  }
}
