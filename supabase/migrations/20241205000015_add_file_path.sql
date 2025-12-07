-- Add file_path column to knowledgebase_files for better storage management
ALTER TABLE knowledgebase_files 
ADD COLUMN IF NOT EXISTS file_path TEXT;
