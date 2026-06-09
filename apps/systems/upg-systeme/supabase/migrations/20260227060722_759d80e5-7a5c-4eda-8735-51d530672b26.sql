
-- 1. Add multi-filière support and document URL to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS filieres text[] DEFAULT '{}';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS document_url text;

-- Migrate existing filiere data to filieres array
UPDATE public.courses SET filieres = ARRAY[filiere] WHERE filiere IS NOT NULL AND filiere != '' AND (filieres IS NULL OR filieres = '{}');

-- 2. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('course-documents', 'course-documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-files', 'assignment-files', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('submission-files', 'submission-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies for course-documents
CREATE POLICY "Anyone can view course documents" ON storage.objects FOR SELECT USING (bucket_id = 'course-documents');
CREATE POLICY "Authenticated can upload course documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete course documents" ON storage.objects FOR DELETE USING (bucket_id = 'course-documents' AND auth.uid() IS NOT NULL);

-- Storage policies for assignment-files
CREATE POLICY "Anyone can view assignment files" ON storage.objects FOR SELECT USING (bucket_id = 'assignment-files');
CREATE POLICY "Authenticated can upload assignment files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assignment-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete assignment files" ON storage.objects FOR DELETE USING (bucket_id = 'assignment-files' AND auth.uid() IS NOT NULL);

-- Storage policies for submission-files
CREATE POLICY "Students can view own submissions" ON storage.objects FOR SELECT USING (bucket_id = 'submission-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Students can upload submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submission-files' AND auth.uid() IS NOT NULL);

-- 3. Assignments table
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  deadline timestamptz NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert assignments" ON public.assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can update assignments" ON public.assignments FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete assignments" ON public.assignments FOR DELETE USING (auth.uid() = created_by);

-- 4. Assignment submissions table
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  file_url text,
  description text,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view submissions" ON public.assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Students can submit" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Students can update own" ON public.assignment_submissions FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Enable realtime for assignments
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_submissions;
