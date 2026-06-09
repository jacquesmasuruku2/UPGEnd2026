/**
 * Secrets (Dashboard Supabase → Edge Functions → newsletter-subscribe → Secrets) :
 *   RESEND_API_KEY     — clé API Resend (ne pas commiter)
 * Optionnel :
 *   RESEND_FROM "UPG Newsletter <noreply@upgoma.org>" (domaine vérifié Resend)
 *   PUBLIC_SITE_URL https://www.upgoma.org (lien de confirmation newsletter)
 */
// Import distant : TypeScript (IDE) ne le résout pas ; Deno le charge au déploiement.
// @ts-expect-error — module https résolu par le runtime Deno Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Nom et email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Configuration Supabase manquante (SUPABASE_URL / SERVICE_ROLE)." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey?.trim()) {
      return new Response(JSON.stringify({ error: "Configuration email manquante (RESEND_API_KEY)." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendFrom =
      Deno.env.get("RESEND_FROM")?.trim() ||
      "UPG Newsletter <noreply@upgoma.org>";
    const publicSiteUrl = (Deno.env.get("PUBLIC_SITE_URL")?.trim() || "https://www.upgoma.org").replace(
      /\/$/,
      "",
    );

    const normalizedName = String(name).trim().slice(0, 200);
    const normalizedEmail = String(email).trim().toLowerCase();
    const safeName = escapeHtml(normalizedName);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, confirmed")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          error:
            "Cette adresse email existe déjà dans notre base de données. Veuillez utiliser une autre adresse email.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Single opt-in : l'inscription est confirmée immédiatement.
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        name: normalizedName,
        email: normalizedEmail,
        confirmation_token: token,
        confirmed: true,
        confirmed_at: new Date().toISOString(),
      });

    if (error) throw error;

    const logoUrl = `${publicSiteUrl}/logo-upg.jpg`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [normalizedEmail],
        subject: "UPG Newsletter — Inscription confirmée",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscription Newsletter UPG</title>
  <style>
    @media only screen and (max-width: 640px) {
      .mail-shell { width: 100% !important; }
      .mail-card { border-radius: 12px !important; }
      .mail-header { padding: 16px !important; }
      .mail-header td { display: block !important; width: 100% !important; text-align: center !important; }
      .mail-header .mail-logo { margin: 0 auto 10px auto !important; }
      .mail-header .mail-title { padding-left: 0 !important; }
      .mail-title h1 { font-size: 19px !important; }
      .mail-content { padding: 20px 16px !important; }
      .mail-content p, .mail-content li { font-size: 14px !important; line-height: 1.7 !important; }
      .mail-cta { width: 100% !important; text-align: center !important; box-sizing: border-box; }
      .mail-footer { padding: 14px 14px 16px 14px !important; }
      .mail-social { border-spacing: 6px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:14px;background:#f7fbff;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>
      <td align="center">
        <table class="mail-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 8px 14px 8px;text-align:center;">
              <span style="display:inline-block;background:#edf7ff;color:#0369a1;border:1px solid #d6ecff;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.02em;">
                Newsletter officielle UPG
              </span>
            </td>
          </tr>
          <tr>
            <td class="mail-card" style="background:#ffffff;border:1px solid #e2eef9;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(15,23,42,.08);">
              <div class="mail-header" style="background:#0ea5e9;padding:22px 24px;">
                <table class="mail-header" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img class="mail-logo" src="${logoUrl}" alt="Logo UPG" width="52" height="52" style="display:block;border-radius:12px;border:2px solid rgba(15,23,42,.12);object-fit:cover;background:#fff;">
                    </td>
                    <td class="mail-title" style="padding-left:14px;vertical-align:middle;">
                      <h1 style="margin:0;color:#fff;font-size:22px;line-height:1.2;font-weight:800;">Université Polytechnique de Goma</h1>
                      <p style="margin:6px 0 0 0;color:#bae6fd;font-size:13px;">Bienvenue dans la newsletter officielle</p>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="mail-content" style="padding:24px 22px 22px 22px;">
                <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#0b1220;">Bonjour <strong>${safeName}</strong>,</p>
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#1f2937;">
                  Votre inscription à la newsletter de l'UPG est bien confirmée.
                  Merci de nous rejoindre !
                </p>
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:#1f2937;">
                  Vous recevrez désormais, selon nos publications :
                </p>
                <ul style="margin:0 0 0 16px;padding:0;color:#1f2937;font-size:13px;line-height:1.8;">
                  <li>annonces officielles de l'université ;</li>
                  <li>actualités académiques et événements ;</li>
                  <li>informations utiles pour étudiants, partenaires et communauté.</li>
                </ul>
                <div style="margin:22px 0 4px 0;">
                  <a class="mail-cta" href="${publicSiteUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:11px 22px;border-radius:10px;">
                    Visiter le site de l'UPG
                  </a>
                </div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
                  Si vous n'êtes pas à l'origine de cette inscription, contactez-nous via le site officiel.
                </p>
              </div>
              <div class="mail-footer" style="padding:16px 20px;background:#0f172a;border-top:1px solid #0b1220;text-align:center;">
                <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;">
                  <a href="mailto:jacquesmasuruku2@gmail.com" style="color:#bae6fd;text-decoration:none;">
                    Service Informatique UPG
                  </a>
                </p>
                <p style="margin:0 0 12px 0;font-size:11px;color:#dbeafe;">
                  Goma, Quartier Lac Vert, Avenue Nyarutsiru, Avant entrée Buhimba
                </p>
                <table class="mail-social" role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 12px auto;border-collapse:separate;border-spacing:10px 0;">
                  <tr>
                    <td>
                      <a href="https://www.facebook.com/upgoma/?locale=fr_FR" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:#0ea5e9;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:999px;">f</a>
                    </td>
                    <td>
                      <a href="https://cd.linkedin.com/company/universit%C3%A9-polytechnique-de-goma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:#0ea5e9;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:999px;">in</a>
                    </td>
                    <td>
                      <a href="https://x.com/UP_Goma" target="_blank" rel="noopener noreferrer" aria-label="X" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:#0ea5e9;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:999px;">X</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:10px;color:#94a3b8;">
                  © ${new Date().getFullYear()} Université Polytechnique de Goma — Tous droits réservés.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Inscription confirmée à la newsletter UPG.</div>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend API error:", {
        status: emailRes.status,
        body: errBody,
        email: normalizedEmail,
      });

      // L'inscription est bien enregistrée en base; on évite un faux échec côté utilisateur.
      return new Response(
        JSON.stringify({
          message:
            "Inscription confirmée. Un email de bienvenue peut prendre un peu de temps. Vérifiez votre boîte de réception/spam.",
          email_sent: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    await emailRes.json();

    return new Response(
      JSON.stringify({
        message: "Inscription confirmée. Un email de bienvenue vous a été envoyé.",
        email_sent: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
