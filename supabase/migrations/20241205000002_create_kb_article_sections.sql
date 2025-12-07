-- Create knowledgebase_article_sections junction table
CREATE TABLE knowledgebase_article_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES knowledgebase_articles(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, section_id)
);

-- Indexes
CREATE INDEX idx_kb_sections_article ON knowledgebase_article_sections(article_id);
CREATE INDEX idx_kb_sections_section ON knowledgebase_article_sections(section_id);

-- Enable RLS
ALTER TABLE knowledgebase_article_sections ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read
CREATE POLICY "Public Read Access"
ON knowledgebase_article_sections FOR SELECT
USING (true);

-- Authenticated users can insert/delete (matching article permissions roughly)
CREATE POLICY "Authenticated Insert"
ON knowledgebase_article_sections FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated Delete"
ON knowledgebase_article_sections FOR DELETE
TO authenticated
USING (true);
