import { SITE_URL } from "@/config/seo";

/** URL absolue pour og:image / Twitter (crawlers exigent souvent https + domaine). */
export function toAbsoluteOgImage(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const path = u.startsWith("/") ? u : `/${u}`;
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${path}`;
}
