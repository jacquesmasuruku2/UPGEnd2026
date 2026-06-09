/** Bindings Wrangler — étendu par `wrangler types` une fois wrangler.toml en place. */
export interface Env {
  DB?: D1Database;
  IMAGES?: R2Bucket;
  ALLOWED_ORIGIN?: string;
}
