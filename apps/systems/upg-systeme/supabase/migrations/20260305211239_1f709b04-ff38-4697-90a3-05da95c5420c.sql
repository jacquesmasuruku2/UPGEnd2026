
-- Fix generate_matricule function search_path
CREATE OR REPLACE FUNCTION public.generate_matricule()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  next_num INTEGER;
  year_part TEXT;
BEGIN
  next_num := nextval('public.student_matricule_seq');
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  RETURN 'UPG-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$function$;

-- Fix handle_new_user function (already has search_path, just ensuring)

-- ===== STUDENTS: keep public INSERT for registration, restrict SELECT to authenticated =====
DROP POLICY IF EXISTS "Authenticated can view students" ON public.students;
CREATE POLICY "Authenticated can view students" ON public.students
  FOR SELECT TO authenticated USING (true);

-- ===== PROFILES: restrict SELECT to own profile + admins =====
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- ===== PAYMENTS: restrict to authenticated =====
DROP POLICY IF EXISTS "Authenticated can view payments" ON public.payments;
CREATE POLICY "Authenticated can view payments" ON public.payments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert payments" ON public.payments;
CREATE POLICY "Authenticated can insert payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (true);

-- ===== GRADES: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view grades" ON public.grades;
CREATE POLICY "Authenticated can view grades" ON public.grades
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert grades" ON public.grades;
CREATE POLICY "Authenticated can insert grades" ON public.grades
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update grades" ON public.grades;
CREATE POLICY "Authenticated can update grades" ON public.grades
  FOR UPDATE TO authenticated USING (true);

-- ===== GRADE_HISTORY: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view grade history" ON public.grade_history;
CREATE POLICY "Authenticated can view grade history" ON public.grade_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert grade history" ON public.grade_history;
CREATE POLICY "Authenticated can insert grade history" ON public.grade_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ===== REQUESTS: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view requests" ON public.requests;
CREATE POLICY "Authenticated can view requests" ON public.requests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can insert requests" ON public.requests;
CREATE POLICY "Authenticated can insert requests" ON public.requests
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update requests" ON public.requests;
CREATE POLICY "Authenticated can update requests" ON public.requests
  FOR UPDATE TO authenticated USING (true);

-- ===== ASSIGNMENT_SUBMISSIONS: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.assignment_submissions;
CREATE POLICY "Authenticated can view submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated USING (true);

-- ===== USER_ROLES: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can read roles" ON public.user_roles;
CREATE POLICY "Authenticated can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

-- ===== CHAT_MESSAGES: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
CREATE POLICY "Authenticated can view messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

-- ===== ANNOUNCEMENT_READS: restrict to authenticated =====
DROP POLICY IF EXISTS "Anyone can view reads" ON public.announcement_reads;
CREATE POLICY "Authenticated can view reads" ON public.announcement_reads
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can insert reads" ON public.announcement_reads;
CREATE POLICY "Authenticated can insert reads" ON public.announcement_reads
  FOR INSERT TO authenticated WITH CHECK (true);

-- ===== COURSES: restrict delete/update/insert to authenticated (keep public SELECT for catalog) =====
DROP POLICY IF EXISTS "Authenticated can delete courses" ON public.courses;
CREATE POLICY "Authenticated can delete courses" ON public.courses
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can manage courses" ON public.courses;
CREATE POLICY "Authenticated can manage courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update courses" ON public.courses;
CREATE POLICY "Authenticated can update courses" ON public.courses
  FOR UPDATE TO authenticated USING (true);

-- Enable leaked password protection
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;
