-- =============================================================================
-- 1) Créer le type ENUM utilisé par user_roles / has_role (si absent)
--    Erreur "type app_role does not exist" → exécuter ce bloc d’abord.
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- =============================================================================
-- 2) Si la table user_roles existe mais que role est en TEXT/VARCHAR au lieu
--    de app_role, décommentez les 2 lignes suivantes puis exécutez une fois :
-- =============================================================================
-- ALTER TABLE public.user_roles
--   ALTER COLUMN role TYPE public.app_role USING (role::public.app_role);

-- =============================================================================
-- 3) Donner le rôle admin (après une connexion Auth réussie avec cet email)
--    Idempotent sans ON CONFLICT : fonctionne même si UNIQUE(user_id, role) manque.
-- =============================================================================

INSERT INTO public.user_roles (id, user_id, role)
SELECT gen_random_uuid(), u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(trim(u.email)) = lower(trim('jacquesmasuruku2@gmail.com'))
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role::text = 'admin'
  );

INSERT INTO public.user_roles (id, user_id, role)
SELECT gen_random_uuid(), u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(trim(u.email)) = lower(trim('fsamvura@gmail.com'))
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role::text = 'admin'
  );
