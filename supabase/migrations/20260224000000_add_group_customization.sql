-- Add customization fields to groups table
ALTER TABLE IF EXISTS groups 
ADD COLUMN IF NOT EXISTS site_title TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#006d2c',
ADD COLUMN IF NOT EXISTS homepage_config JSONB DEFAULT '{
  "sections": {
    "slider": { "enabled": true, "slides": [] },
    "about": { "enabled": true, "content": "Welcome to our Atlas instance." },
    "news": { "enabled": true },
    "events": { "enabled": true }
  }
}'::jsonb;

-- Comment on columns
COMMENT ON COLUMN groups.site_title IS 'Custom site title for the Atlas instance browser tab and header.';
COMMENT ON COLUMN groups.primary_color IS 'Hex code for the primary brand color.';
COMMENT ON COLUMN groups.homepage_config IS 'JSON configuration for the dynamic landing page sections.';
