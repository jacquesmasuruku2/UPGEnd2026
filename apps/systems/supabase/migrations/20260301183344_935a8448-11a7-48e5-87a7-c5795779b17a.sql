
-- Allow anonymous users to upload to course-documents bucket
CREATE POLICY "Allow anonymous uploads to course-documents"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'course-documents');
