/// <reference types="vite/client" />

/** Variables exposées au client (préfixe `VITE_` obligatoire). Définir dans `.env` à la racine. */
interface ImportMetaEnv {
  /** Identifiant projet Supabase (réf. URL). Utilisé si `VITE_SUPABASE_URL` est absent. */
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  /** URL du projet, ex. `https://xxxxx.supabase.co` — prioritaire sur l’URL dérivée du project id. */
  readonly VITE_SUPABASE_URL?: string;
  /** Clé publique (anon) — requise pour le client Supabase. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ADMIN_ALLOWED_EMAILS?: string;
  /** URL de base de l’API admission (PostgreSQL). Vide en dev → proxy Vite `/api`. */
  readonly VITE_ADMISSION_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
