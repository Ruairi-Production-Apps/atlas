-- Create news_posts table
CREATE TABLE news_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  featured_image_url TEXT,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  featured_image_url TEXT,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  price DECIMAL(10, 2),
  capacity_groups INTEGER,
  capacity_scouters INTEGER,
  capacity_youth INTEGER,
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  visibility event_visibility NOT NULL DEFAULT 'open_to_all',
  pricing_mode event_pricing_mode DEFAULT 'per_scout',
  price_scouter DECIMAL(10, 2),
  price_youth DECIMAL(10, 2),
  require_participant_info BOOLEAN NOT NULL DEFAULT false,
  require_payment BOOLEAN NOT NULL DEFAULT false,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event_sections junction table
CREATE TABLE event_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, section_id)
);

-- Create knowledgebase_articles table
CREATE TABLE knowledgebase_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create knowledgebase_files table
CREATE TABLE knowledgebase_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES knowledgebase_articles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_news_posts_scope ON news_posts(scope_type, scope_id);
CREATE INDEX idx_news_posts_published ON news_posts(published, published_at DESC);
CREATE INDEX idx_news_posts_slug ON news_posts(slug);
CREATE INDEX idx_news_posts_author ON news_posts(author_id);

CREATE INDEX idx_events_scope ON events(scope_type, scope_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_published ON events(published, published_at DESC);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_author ON events(author_id);

CREATE INDEX idx_event_sections_event_id ON event_sections(event_id);
CREATE INDEX idx_event_sections_section_id ON event_sections(section_id);

CREATE INDEX idx_kb_articles_scope ON knowledgebase_articles(scope_type, scope_id);
CREATE INDEX idx_kb_articles_published ON knowledgebase_articles(published, published_at DESC);
CREATE INDEX idx_kb_articles_slug ON knowledgebase_articles(slug);
CREATE INDEX idx_kb_articles_author ON knowledgebase_articles(author_id);

CREATE INDEX idx_kb_files_article_id ON knowledgebase_files(article_id);

-- Create updated_at triggers
CREATE TRIGGER set_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_knowledgebase_articles_updated_at
  BEFORE UPDATE ON knowledgebase_articles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Create auto-slug triggers for content
CREATE OR REPLACE FUNCTION set_content_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title || '-' || substring(NEW.id::text from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_news_post_slug
  BEFORE INSERT ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_content_slug_from_title();

CREATE TRIGGER set_event_slug
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_content_slug_from_title();

CREATE TRIGGER set_kb_article_slug
  BEFORE INSERT ON knowledgebase_articles
  FOR EACH ROW
  EXECUTE FUNCTION set_content_slug_from_title();

-- Set published_at when published becomes true
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_news_published_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

CREATE TRIGGER set_event_published_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

CREATE TRIGGER set_kb_published_at
  BEFORE UPDATE ON knowledgebase_articles
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();
