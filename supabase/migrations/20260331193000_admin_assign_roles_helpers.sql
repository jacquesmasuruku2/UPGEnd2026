-- Helpers pour attribuer des rôles depuis l'admin panel via email ou ID personnel.
-- Sécurisé: uniquement accessible aux admins applicatifs (has_role(auth.uid(), 'admin')).

CREATE OR REPLACE FUNCTION public.assign_user_role_by_email(
  p_email text,
  p_role public.app_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_actor uuid;
  v_target_user_id uuid;
  v_existing_role_id uuid;
  v_new_role_id uuid;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL OR NOT public.has_role(v_actor, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT id
  INTO v_target_user_id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(p_email))
  LIMIT 1;

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur auth.users trouvé pour cet email';
  END IF;

  SELECT id
  INTO v_existing_role_id
  FROM public.user_roles
  WHERE user_id = v_target_user_id
    AND role::text = p_role::text
  LIMIT 1;

  IF v_existing_role_id IS NOT NULL THEN
    RETURN v_existing_role_id;
  END IF;

  INSERT INTO public.user_roles (id, user_id, role)
  VALUES (gen_random_uuid(), v_target_user_id, p_role)
  RETURNING id INTO v_new_role_id;

  RETURN v_new_role_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_user_role_by_personnel_id(
  p_personnel_id uuid,
  p_role public.app_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email
  INTO v_email
  FROM public.personnel
  WHERE id = p_personnel_id
  LIMIT 1;

  IF v_email IS NULL OR length(trim(v_email)) = 0 THEN
    RAISE EXCEPTION 'Cet ID personnel n''a pas d''email exploitable';
  END IF;

  RETURN public.assign_user_role_by_email(v_email, p_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_user_role_by_email(text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role_by_personnel_id(uuid, public.app_role) TO authenticated;
