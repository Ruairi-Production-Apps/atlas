-- Add featured_image_url to Knowledgebase Articles
-- Use DO block for safe alteration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'knowledgebase_articles'
        AND column_name = 'featured_image_url'
    ) THEN
        ALTER TABLE knowledgebase_articles
        ADD COLUMN featured_image_url TEXT;
    END IF;
END $$;

-- Drop existing tags trigger for KB if it exists (it shouldn't, but for safety)
DROP TRIGGER IF EXISTS trigger_extract_tags_kb ON knowledgebase_articles;

-- Add trigger to extract tags from knowledgebase_articles to tags table
CREATE TRIGGER trigger_extract_tags_kb
  AFTER INSERT OR UPDATE OF tags ON knowledgebase_articles
  FOR EACH ROW
  EXECUTE FUNCTION extract_tags_from_content();

-- Backfill existing tags from knowledgebase_articles
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM knowledgebase_articles
ON CONFLICT (name) DO NOTHING;
