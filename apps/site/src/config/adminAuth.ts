/**
 * Emails autorisés à recevoir un code OTP sur `/admin`.
 * Compléter avec `VITE_ADMIN_ALLOWED_EMAILS` (séparateur virgule), ex. :
 * `VITE_ADMIN_ALLOWED_EMAILS=autre@domaine.com`
 */
const DEFAULT_ADMIN_EMAILS = ["jacquesmasuruku2@gmail.com", "fsamvura@gmail.com"];

export function getAdminAllowedEmails(): string[] {
  const extra = import.meta.env.VITE_ADMIN_ALLOWED_EMAILS as string | undefined;
  const fromEnv =
    extra
      ?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? [];
  return [...new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv])];
}

export function isEmailAllowedForAdminPortal(email: string): boolean {
  const n = email.trim().toLowerCase();
  return getAdminAllowedEmails().includes(n);
}
