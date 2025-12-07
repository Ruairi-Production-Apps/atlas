-- Add section_types column to knowledgebase_articles
ALTER TABLE knowledgebase_articles 
ADD COLUMN section_types TEXT[] DEFAULT '{}';

-- Index for faster filtering by section type
CREATE INDEX idx_kb_articles_section_types ON knowledgebase_articles USING GIN(section_types);
