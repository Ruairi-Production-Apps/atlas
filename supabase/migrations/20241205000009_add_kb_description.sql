-- Add description column to knowledgebase_articles table

ALTER TABLE knowledgebase_articles
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN knowledgebase_articles.description IS 'Short description/summary of the article shown in lists';
