# Cloudflare Workers — couche backend (projet parallèle)

Ce dossier est **indépendant** du site Vite/React et de **Supabase en production**.  
Il sert de **socle technique** pour une migration éventuelle : API sur Workers, SQL sur **D1**, fichiers sur **R2**.  
**Aucune modification** n’est faite à la base PostgreSQL Supabase ni aux variables Vercel existantes tant que vous n’activez pas une bascule volontaire.

## Contenu

| Élément | Rôle |
|--------|------|
| `docs/SITE_ANALYSIS.md` | Inventaire détaillé de l’usage actuel Supabase dans le repo |
| `docs/MIGRATION_STRATEGY.md` | Phases, risques, équivalences Cloudflare |
| `worker/` | Worker TypeScript minimal (`/health`, test D1 optionnel) |
| `worker/migrations/` | SQL **SQLite / D1** de **référence** minimal (stub) |
| **`d1-schema/sql/`** | **Scripts SQL complets** (tables, FK, triggers, index, seed) pour console D1 / `wrangler d1 execute` |

## Prérequis (quand vous voudrez tester le Worker)

1. Compte Cloudflare, Wrangler v3+ : `npm i -g wrangler`
2. Créer une base **D1** de préproduction (dashboard ou `wrangler d1 create upg-d1-preview`)
3. Copier `worker/wrangler.toml.example` → `worker/wrangler.toml`, renseigner `database_id`
4. Dans `worker/` : `npm install` puis `npm run dev`

## Principes (niveau senior)

- **D1** ≈ SQLite à la périphérie : excellent pour lecture/écriture faible latence depuis le Worker ; pas un remplacement drop-in de Postgres (pas de `uuid` natif identique, pas de RLS, types différents).
- **R2** remplace **Supabase Storage** (`bucket images`) : URLs signées ou publiques via Worker ou `r2.dev` / custom domain.
- **Auth** : aujourd’hui `supabase.auth` + RPC `has_role`. Sur Workers il faudra **JWT** (émetteur maison, Clerk, ou tokens Supabase validés côté Worker si vous gardez Supabase Auth en parallèle) + table des rôles en D1.
- **RLS PostgreSQL** : à **réimplémenter** en logique applicative (middleware par route) dans le Worker.
- **Edge Functions** existantes (`newsletter-subscribe`) : migrer vers route Worker + même logique métier + secrets (`RESEND`, etc.) en `wrangler secret`.

## Non-objectifs (pour l’instant)

- Ne pas brancher le front (`VITE_*`) sur ce Worker.
- Ne pas exécuter les SQL de ce dossier contre Supabase.
- Ne pas supprimer ni renommer `supabase/`.

Pour la suite : faire évoluer `worker/src/routes/` par domaine métier (faculty, fees, blog, …) en reprenant les contrats JSON actuels du client.
