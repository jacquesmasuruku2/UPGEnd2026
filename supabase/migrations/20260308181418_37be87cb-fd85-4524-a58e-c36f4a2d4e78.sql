
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services publicly readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default services
INSERT INTO public.services (name, slug, description, display_order) VALUES
  ('Enseignement et Formation de cadres', 'enseignement-formation', 'Formation académique et professionnelle de haut niveau.', 1),
  ('Recherche académique & Innovation', 'recherche-innovation', 'Recherche scientifique et innovation technologique.', 2),
  ('Rectorat', 'rectorat', 'Direction et administration de l''université.', 3),
  ('SGAc', 'sgac', 'Secrétariat Général Académique.', 4),
  ('LABO INFO', 'labo-info', 'Laboratoire informatique de l''université.', 5),
  ('APPARITORAT', 'apparitorat', 'Service de l''apparitorat.', 6);
