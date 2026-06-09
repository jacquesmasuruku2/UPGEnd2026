
-- Allow public read access on course-documents bucket
CREATE POLICY "Allow public read access to course-documents"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-documents');
