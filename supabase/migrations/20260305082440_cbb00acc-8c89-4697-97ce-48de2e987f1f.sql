
CREATE TABLE public.faculty_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  full_name text NOT NULL,
  description text,
  long_description text,
  departments text[] DEFAULT '{}',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faculty_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty content publicly readable" ON public.faculty_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage faculty content" ON public.faculty_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
