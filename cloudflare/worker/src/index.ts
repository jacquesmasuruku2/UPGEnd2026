/**
 * Point d’entrée Worker — squelette API pour migration future.
 * Routes : santé générale, santé D1 (si binding présent).
 * Le site Vite ne pointe pas ici tant que vous ne configurez pas le front.
 */
import type { Env } from "./env";
import { d1HealthCheck, getDb } from "./lib/db";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGIN?.trim();
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (allowed && origin === allowed) {
    h["Access-Control-Allow-Origin"] = allowed;
  }
  return h;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/health") {
      return json(
        {
          ok: true,
          service: "upg-cloudflare-worker",
          hint: "Couche API parallèle — Supabase inchangé côté site actuel.",
        },
        200
      );
    }

    if (path === "/api/v1/health/db") {
      const db = getDb(env);
      if (!db) {
        return json({ ok: false, error: "D1 binding DB absent (configurer wrangler.toml)" }, 503);
      }
      const check = await d1HealthCheck(db);
      return json({ ok: check.ok, sqliteVersion: check.sqliteVersion });
    }

    return new Response("Not Found", { status: 404 });
  },
};
