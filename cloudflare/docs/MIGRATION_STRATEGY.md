# Stratégie de migration vers Cloudflare Workers (recommandation senior)

## Objectif

Remplacer **progressivement** l’accès direct du navigateur à PostgREST Supabase par une **API HTTP** hébergée sur **Workers**, avec **D1** (SQL) et **R2** (objets), **sans casser** la prod actuelle tant que le front pointe encore vers Supabase.

## Phase 0 — Actuel (inchangé)

- Front → Supabase (URL + anon key).
- Migrations dans `supabase/migrations/`.
- Storage `images` sur Supabase.

## Phase 1 — API parallèle « read-only »

1. Déployer un Worker avec binding **D1** (base de **préproduction** ou réplica logique).
2. Exporter un sous-ensemble de données depuis Postgres (one-shot ou CDC hors scope ici) vers D1, **ou** laisser D1 vide et ne servir que `/health` + requêtes de démo.
3. Ajouter des routes `GET /api/v1/...` qui **dupliquent** les réponses attendues par le front (contrats JSON identiques).
4. **Ne pas** changer les variables Vercel du site.

Verdict : valide l’infra Cloudflare, zéro risque pour les utilisateurs.

## Phase 2 — Écriture admin derrière Worker

1. Introduire **JWT** (ou validation du JWT Supabase si vous gardez le même fournisseur d’identité).
2. Porter `has_role` en requête D1 sur table `user_roles` (schéma à aligner).
3. Routes `POST/PATCH/DELETE` protégées ; rate limiting (`rateLimiter` binding ou Durable Object).
4. Faire pointer **uniquement l’admin** (build séparé ou `VITE_API_URL`) vers le Worker.

## Phase 3 — R2 + bascule lecture publique

1. Nouveaux uploads via Worker → **R2** ; stocker la clé objet en D1 (ou URL Worker `/media/...`).
2. Migrer les images existantes (script batch Supabase → R2).
3. Basculer le front : `useSupabaseData` → `fetch(apiBase + '/api/v1/...')` (couche `apiClient`).

## Phase 4 — Décommission partielle Supabase

- Garder Supabase uniquement pour Auth si besoin, ou migrer auth vers **Clerk / Auth.js / custom**.
- Couper RLS côté client : le client ne parle plus jamais à PostgREST en direct.

## Pièges à anticiper

| Sujet | Postgres / Supabase | Cloudflare |
|--------|---------------------|------------|
| Types | `uuid`, `timestamptz`, `text[]` | D1/SQLite : `TEXT`, `INTEGER`, JSON pour tableaux |
| RLS | Déclaratif en SQL | Code impératif dans le Worker |
| Realtime | Channels Supabase | WebSockets DO, SSE, ou polling |
| Jointures complexes | SQL riche | OK en D1 mais profiler (latence, taille réponse) |
| Géo utilisateurs RDC | Latence vers région Supabase | Choisir région D1 / mettre CDN devant Worker |

## Stockage Cloudflare (R2)

- **Binding** `IMAGES` (exemple dans `wrangler.toml.example`).
- Pattern : `PUT` multipart vers Worker → `env.IMAGES.put(key, body)` → enregistrer `key` en D1.
- Lecture : route `GET /media/:key` avec `env.IMAGES.get(key)` ou domaine public R2 + contrôle d’accès.

## SQL dans Workers

- Utiliser **`env.DB.prepare(sql).bind(...).all()`** (D1).
- Préparer des **requêtes nommées** dans `worker/src/lib/queries/` pour éviter l’injection et centraliser le SQL.
- Migrations D1 : `wrangler d1 migrations apply` sur la base dédiée — **jamais** sur Supabase.

## Checklist avant bascule prod

- [ ] Secrets Workers (pas de clés en repo) : `wrangler secret put ...`
- [ ] CORS : autoriser uniquement `https://www.upgoma.online` (et preview Vercel si besoin).
- [ ] Logs / observabilité : Workers Logs, optional Axiom/Datadog.
- [ ] Sauvegardes D1 : export automatique documenté Cloudflare.
- [ ] Plan de rollback : variable `VITE_API_URL` vide → retour Supabase.
