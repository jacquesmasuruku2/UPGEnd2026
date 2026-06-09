
-- Table to track grade modification history
CREATE TABLE public.grade_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_id uuid NOT NULL,
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  previous_note numeric,
  new_note numeric,
  modified_by uuid,
  modified_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text
);

ALTER TABLE public.grade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view grade history" ON public.grade_history FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert grade history" ON public.grade_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
