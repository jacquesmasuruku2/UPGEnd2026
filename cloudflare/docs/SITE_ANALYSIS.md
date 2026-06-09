# Analyse du site — usage backend actuel (Supabase)

## Stack front

- **Vite + React**, déploiement type **Vercel** (statique + SPA).
- Client unique : `@supabase/supabase-js` via `src/integrations/supabase/client.ts`.
- Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (clé **anon** / publishable).

## Données : tables PostgreSQL utilisées dans le code

D’après `useSupabaseData.ts`, pages admin et pages publiques :

| Table | Usage principal |
|-------|------------------|
| `personnel` | CRUD admin, lecture site |
| `blog_articles` | CRUD admin, liste / détail blog |
| `blog_comments` | Lecture + insertion commentaires |
| `gallery` | CRUD admin, galerie |
| `college_posts` | CRUD admin, page Collège des étudiants |
| `calendar_events` | CRUD admin, calendrier |
| `fees` | CRUD admin, page `/frais` |
| `faculty_content` | CRUD admin, facultés + pages `/faculte/:slug` |
| `library_books` | CRUD admin, bibliothèque |
| `services` | CRUD admin, pages services + footer |
| `newsletter_subscribers` | Confirmation newsletter (`ConfirmNewsletter`) |
| `user_roles` | Rôles (lié à l’auth admin, RPC `has_role`) |

Migrations sources : `supabase/migrations/*.sql`.

## Stockage fichiers

- **Supabase Storage** : bucket `images` — upload + URL publique (`uploadImage` dans `useSupabaseData.ts`).
- Fichiers PDF frais : URLs stockées en base (`fees.pdf_url`), hébergement selon ce que vous uploadez (souvent même bucket ou URL externe).

## Auth & sécurité

- **Supabase Auth** : email/mot de passe, session navigateur (`AdminPage.tsx`).
- **RPC** : `has_role` pour l’admin.
- **RLS** : politiques définies en SQL sur Supabase (le client utilise la clé anon ; les politiques filtrent les accès).

Toute migration Workers devra **reproduire** ces règles côté API (ou conserver Supabase Auth et valider le JWT dans le Worker).

## Edge / Functions

- **`newsletter-subscribe`** : `supabase.functions.invoke` depuis `FooterSection.tsx` — logique métier côté Supabase Edge.

## Fichiers clés à connaître pour une migration API

- `src/hooks/useSupabaseData.ts` — quasi-tout le data layer.
- `src/integrations/supabase/types.ts` — types générés / schéma.
- `src/pages/AdminPage.tsx` — auth.
- `supabase/functions/newsletter-subscribe/index.ts` — modèle de function à porter sur Worker.

## Résumé charge migration

- **Lecture publique** : nombreuses tables en `SELECT` avec filtres `published` — adaptables à routes `GET` Worker + D1.
- **Écriture admin** : nécessite auth forte + validation + anti-abus (rate limit Workers, Turnstile, etc.).
- **Commentaires / newsletter** : risque spam ; à protéger (CAPTCHA, modération, D1 + queue).

Ce document reflète l’état du dépôt au moment de la création du dossier `cloudflare/` ; à mettre à jour si de nouvelles tables ou fonctions apparaissent.
