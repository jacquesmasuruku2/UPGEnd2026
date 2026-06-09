import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Si l'utilisateur admin clique un lien magic/OTP, Supabase peut rediriger sur la
 * page d'accueil (sans /admin) selon la config.
 * On redirige alors automatiquement vers `/admin` une seule fois après un callback
 * (présence de tokens dans `hash`/`search`), quand l'utilisateur a le rôle admin.
 */
export default function AdminAuthRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  const lastRedirectUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const wantsAdminRedirect =
      location.hash.includes("access_token=") ||
      location.hash.includes("provider_token=") ||
      location.search.includes("access_token=") ||
      location.search.includes("provider_token=");

    if (!wantsAdminRedirect) return;

    let isCancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) return;

      // Evite les boucles si React refresh / navigation.
      if (lastRedirectUserIdRef.current === userId) return;

      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (isCancelled) return;

      if (!error && isAdmin === true) {
        lastRedirectUserIdRef.current = userId;
        // Si on n'est pas déjà sur /admin, on y va.
        if (!location.pathname.startsWith("/admin")) {
          navigate("/admin", { replace: true });
        }
      }
    })().catch(() => {
      // On ne casse pas l'app si la vérification RPC échoue.
    });

    return () => {
      isCancelled = true;
    };
  }, [location.hash, location.search, location.pathname, navigate]);

  return null;
}

