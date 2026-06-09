# Worker UPG (Cloudflare)

## Démarrage rapide

```bash
cp wrangler.toml.example wrangler.toml
# Éditer database_id après : wrangler d1 create upg-d1-preview

npm install
npm run d1:apply:local
npm run dev
```

- `GET /health` — statut service.
- `GET /api/v1/health/db` — ping SQLite D1 (échoue si binding `DB` absent).

## Déploiement

```bash
npm run deploy
npm run d1:apply:remote
```

Secrets (ex. clés email, JWT) : `wrangler secret put NOM`.

## Fichiers SQL

`migrations/*.sql` s’appliquent **uniquement** à la base D1 nommée dans `wrangler.toml`, jamais à Supabase.
