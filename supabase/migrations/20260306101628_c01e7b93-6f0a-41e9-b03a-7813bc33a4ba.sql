
-- Library books table
CREATE TABLE public.library_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  category TEXT,
  pdf_url TEXT,
  cover_url TEXT,
  published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Library books publicly readable" ON public.library_books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage library books" ON public.library_books FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add email and linkedin_url to personnel
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add comments table for blog
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.blog_articles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog comments publicly readable" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can manage comments" ON public.blog_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
