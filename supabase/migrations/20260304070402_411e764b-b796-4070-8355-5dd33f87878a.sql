
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty TEXT NOT NULL,
  cycle TEXT NOT NULL DEFAULT 'Licence',
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fees publicly readable" ON public.fees FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage fees" ON public.fees FOR ALL TO authenticated USING (true) WITH CHECK (true);
