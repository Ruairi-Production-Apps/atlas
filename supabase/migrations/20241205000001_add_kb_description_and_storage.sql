-- Add description column to knowledgebase_articles
ALTER TABLE knowledgebase_articles 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable storage extension if not already enabled (usually enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create storage bucket for knowledgebase files
INSERT INTO storage.buckets (id, name) 
VALUES ('knowledgebase-files', 'knowledgebase-files')
ON CONFLICT (id) DO NOTHING;

-- Try to set public if the column exists (safely)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'public') THEN
        UPDATE storage.buckets SET public = true WHERE id = 'knowledgebase-files';
    END IF;
END $$;

-- RLS Policies for Storage
-- Allow anyone to read public files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'knowledgebase-files' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'knowledgebase-files' );

-- Allow users to update their own files (or files they uploaded)
-- Note: 'owner' in storage.objects is usually the user ID
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'knowledgebase-files' AND owner = auth.uid() );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'knowledgebase-files' AND owner = auth.uid() );
