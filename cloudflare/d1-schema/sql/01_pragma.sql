-- SQLite local / wrangler — optionnel.
-- Console D1 : souvent inutile ou source d’erreurs (ex. journal_mode → SQLITE_AUTH).
-- Sur D1, les clés étrangères sont appliquées par défaut (voir doc Cloudflare D1).

PRAGMA foreign_keys = ON;

-- Déconseillé dans la console D1 ; OK en général en local.
PRAGMA journal_mode = WAL;
