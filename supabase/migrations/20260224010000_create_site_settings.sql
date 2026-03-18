-- Create site_settings table to support Hub/Instance separation and customization across all org types
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  site_title TEXT,
  primary_color TEXT DEFAULT '#006d2c',
  logo_url TEXT,
  homepage_config JSONB DEFAULT '{
    "sections": {
      "slider": { "enabled": true, "slides": [] },
      "about": { "enabled": true, "content": "Welcome to our Atlas instance." },
      "news": { "enabled": true },
      "events": { "enabled": true }
    }
  }'::jsonb,
  sync_enabled BOOLEAN DEFAULT FALSE,
  is_initialized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(scope_type, scope_id)
);

-- Add comment
COMMENT ON TABLE site_settings IS 'Stores branding and ecosystem settings for Atlas instances and Hub directory listings.';

-- Create updated_at trigger
DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Migrate existing group customization data (if any)
INSERT INTO site_settings (scope_type, scope_id, site_title, primary_color, homepage_config, is_initialized)
SELECT 'group', id, site_title, primary_color, homepage_config, TRUE
FROM groups
WHERE site_title IS NOT NULL OR primary_color != '#006d2c'
ON CONFLICT (scope_type, scope_id) DO NOTHING;
