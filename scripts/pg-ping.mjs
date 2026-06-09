/**
 * Vérifie DATABASE_URL (PostgreSQL). Même commande en local et sur le serveur :
 *   DATABASE_URL=... npm run db:ping
 * ou un fichier `.env` à la racine avec DATABASE_URL=...
 */
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("[db:ping] Définissez DATABASE_URL (fichier .env ou variable d’environnement).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  const { rows } = await client.query(
    "SELECT current_database() AS database, current_user AS role, inet_server_addr()::text AS server_addr",
  );
  console.log("[db:ping] Connexion OK", rows[0]);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[db:ping] Échec :", msg);
  process.exit(1);
} finally {
  await client.end();
}
