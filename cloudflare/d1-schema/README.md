# Schéma SQL pour Cloudflare D1 (projet parallèle)

Ce dossier contient des scripts **SQLite / D1** dérivés de l’analyse des migrations **Supabase** (`supabase/migrations/`).  
Ils sont conçus pour être exécutés dans **l’interface SQL D1** (dashboard Cloudflare) ou via `wrangler d1 execute`.

## Important

- **Ne pas exécuter sur PostgreSQL / Supabase** : syntaxe et types diffèrent.
- **Ne remplace pas** la base actuelle : base **nouvelle** (D1) pour tests ou migration future.
- Les **politiques RLS**, **auth.users**, **storage.buckets** n’existent pas en D1 : à remplacer par la logique du **Worker** + **R2** (voir `STORAGE_AND_RELATIONS.md`).

## Console Cloudflare D1 (recommandé : 3 exécutions)

Un seul gros copier-coller (PRAGMA + tables + triggers + index) peut échouer partiellement sur D1 (dernière table absente, erreur sur un index, etc.).

Exécuter **dans l’ordre**, chaque fichier en entier :

| Étape | Fichier |
|------|---------|
| 1 | **`EXECUTE_ON_CLOUDFLARE_D1.sql`** (tables uniquement — même contenu que `sql/d1_console_01_tables.sql`) |
| 2 | **`sql/d1_console_02_triggers.sql`** |
| 3 | **`sql/d1_console_03_indexes.sql`** |

Ne pas préfixer par `PRAGMA` dans la console si vous voyez `SQLITE_AUTH` ou un comportement bizarre : ce n’est pas nécessaire pour les FK sur D1.

Vérification : `SELECT name FROM sqlite_schema WHERE type='table' ORDER BY 1;` → 12 noms dont `user_roles`.

Le seed des services reste séparé : `sql/05_seed_services.sql`. L’inventaire des colonnes : **`COLUMNS.md`**.

## Ordre d’exécution (fichiers modulaires)

| Ordre | Fichier | Contenu |
|------|---------|---------|
| 1 | `sql/01_pragma.sql` | `foreign_keys`, mode strict |
| 2 | `sql/02_create_tables.sql` | Toutes les tables + FK explicites |
| 3 | `sql/03_triggers_updated_at.sql` | Mise à jour automatique `updated_at` |
| 4 | `sql/04_indexes.sql` | Index de lecture / unicité |
| 5 | `sql/05_seed_services.sql` | Données initiales `services` (optionnel) |

## Console / wrangler (rappel)

1. Dashboard : Workers & Pages → D1 → **Console**.
2. Pour D1, préférer la séquence **`d1_console_01` → `02` → `03`** (ou `EXECUTE_ON_CLOUDFLARE_D1.sql` puis `02` / `03`).
3. En CLI, enchaîner les mêmes fichiers :  
   `wrangler d1 execute <NOM_BASE> --remote --file=sql/d1_console_01_tables.sql`  
   puis `--file=sql/d1_console_02_triggers.sql`, puis `--file=sql/d1_console_03_indexes.sql`.

## Identifiants (UUID)

D1/SQLite n’a pas `gen_random_uuid()` comme Postgres. Options :

- Générer les UUID côté **Worker** (recommandé) à l’insertion.
- Ou utiliser un identifiant texte hex (non standard UUID v4).

Les scripts utilisent **`TEXT`** pour les clés ; les `DEFAULT` pour `id` sont omis ou utilisent une expression simple selon compatibilité D1 — **prévoir génération côté app**.

## Fichiers d’architecture

- `STORAGE_AND_RELATIONS.md` — diagramme des relations + équivalent **R2** pour les fichiers.
