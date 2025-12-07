-- Ensure the storage bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'knowledgebase-files';

-- Ensure the public has access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'knowledgebase-files' );
