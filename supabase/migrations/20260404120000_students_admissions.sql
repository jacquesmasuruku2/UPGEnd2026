-- Inscriptions étudiants (formulaire public /admission)
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  domaine text NOT NULL,
  filiere text NOT NULL,
  promotion text NOT NULL,
  annee_academique text NOT NULL DEFAULT '2025-2026',
  status text NOT NULL DEFAULT 'pending',
  photo_url text,
  diplome_url text,
  bulletin_url text,
  attestation_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students (status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON public.students (created_at DESC);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Soumission publique du formulaire (clés anon / authentifié)
CREATE POLICY "Public can submit student applications"
  ON public.students
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Lecture réservée aux admins applicatifs
CREATE POLICY "Admins can read students"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update students"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Bucket documents d’admission (photos + PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-documents', 'course-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "course-documents public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'course-documents');

CREATE POLICY "course-documents public upload"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'course-documents');
