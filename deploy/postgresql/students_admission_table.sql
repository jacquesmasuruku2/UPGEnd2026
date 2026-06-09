-- =============================================================================
-- UPG — Table d'inscriptions admission (alignée sur AdmissionRegistrationForm.tsx
-- et public.students côté Supabase : src/integrations/supabase/types.ts)
-- =============================================================================
-- Usage : psql -U upg_admin -d site_upg_db -f students_admission_table.sql
-- Prérequis : PostgreSQL 14+ (gen_random_uuid via pgcrypto)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Étape Identité (formulaire)
  nom text NOT NULL,
  postnom text NOT NULL,
  prenom text NOT NULL,
  sexe text NOT NULL,
  date_naissance date NOT NULL,
  lieu_naissance text NOT NULL,
  nationalite text,
  telephone text NOT NULL,
  email text NOT NULL,
  adresse text NOT NULL,

  -- Étape Parcours (domaine = libellé faculté, pas le slug)
  domaine text NOT NULL,
  filiere text NOT NULL,
  promotion text NOT NULL,
  annee_academique text NOT NULL DEFAULT '2025-2026',

  -- Workflow (insert côté app : status = 'pending')
  status text NOT NULL DEFAULT 'pending',

  -- Étape Documents — URLs après upload Supabase Storage (bucket course-documents)
  photo_url text,
  diplome_url text,
  bulletin_url text,
  attestation_url text,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT students_sexe_check CHECK (sexe IN ('M', 'F')),
  CONSTRAINT students_promotion_check CHECK (promotion IN ('L1', 'L2', 'L3', 'M1', 'M2'))
);

COMMENT ON TABLE public.students IS
  'Inscriptions admission en ligne ; colonnes synchrones avec AdmissionRegistrationForm.tsx (insert Supabase).';

CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students (status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON public.students (created_at DESC);

-- Droits applicatifs (adapter le nom de rôle)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO upg_admin;
