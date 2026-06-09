/**
 * Ambiance types pour l’éditeur (VS Code / Cursor) sur les Edge Functions Deno.
 * Le runtime réel est Deno côté Supabase ; ce fichier évite « Cannot find name 'Deno' ».
 */
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get(key: string): string | undefined;
  };
};
