/**
 * localStorage peut lever (Safari privé, certains navigateurs durcis) → crash synchrone avant React.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__upg_ls_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/** Stockage mémoire compatible interface Storage pour Supabase Auth si localStorage est bloqué */
function memoryStorage(): Storage {
  const mem: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(mem).length;
    },
    clear() {
      for (const k of Object.keys(mem)) delete mem[k];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
    },
    key(index: number) {
      const keys = Object.keys(mem);
      return index >= 0 && index < keys.length ? keys[index] : null;
    },
    removeItem(key: string) {
      delete mem[key];
    },
    setItem(key: string, value: string) {
      mem[key] = value;
    },
  };
}

export function getStorageForSupabase(): Storage {
  if (isLocalStorageAvailable()) {
    return window.localStorage;
  }
  console.warn("[UPG] localStorage indisponible — la session Supabase ne sera pas conservée après fermeture de l’onglet.");
  return memoryStorage();
}
