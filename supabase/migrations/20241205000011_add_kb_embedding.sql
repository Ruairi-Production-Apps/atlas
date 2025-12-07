-- Add is_embedded column to knowledgebase_files
ALTER TABLE knowledgebase_files 
ADD COLUMN IF NOT EXISTS is_embedded BOOLEAN DEFAULT false;
