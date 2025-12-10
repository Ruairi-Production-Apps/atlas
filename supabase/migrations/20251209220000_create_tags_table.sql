-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tags" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically extract tags
CREATE OR REPLACE FUNCTION extract_tags_from_content()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  IF NEW.tags IS NOT NULL THEN
    FOREACH tag IN ARRAY NEW.tags
    LOOP
      INSERT INTO tags (name) VALUES (tag)
      ON CONFLICT (name) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to events and news_posts
DROP TRIGGER IF EXISTS trigger_extract_tags_events ON events;
CREATE TRIGGER trigger_extract_tags_events
  AFTER INSERT OR UPDATE OF tags ON events
  FOR EACH ROW
  EXECUTE FUNCTION extract_tags_from_content();

DROP TRIGGER IF EXISTS trigger_extract_tags_news ON news_posts;
CREATE TRIGGER trigger_extract_tags_news
  AFTER INSERT OR UPDATE OF tags ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION extract_tags_from_content();

-- Backfill existing tags
INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM events
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name)
SELECT DISTINCT unnest(tags)
FROM news_posts
ON CONFLICT (name) DO NOTHING;
