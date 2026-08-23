// Configuration API - permet de basculer entre Supabase et API Laravel
export const API_CONFIG = {
  // 'supabase' ou 'laravel' - par défaut: laravel pour ne plus utiliser Supabase
  provider: import.meta.env.VITE_API_PROVIDER || 'laravel',
  
  // Configuration Laravel
  laravel: {
    baseURL: import.meta.env.VITE_LARAVEL_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
  },
  
  // Configuration Supabase (désactivé par défaut)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
};

export const USE_LARAVEL_API = API_CONFIG.provider === 'laravel';
export const USE_SUPABASE = API_CONFIG.provider === 'supabase';
