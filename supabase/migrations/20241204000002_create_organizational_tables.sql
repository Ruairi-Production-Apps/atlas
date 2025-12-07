-- Create provinces table
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create counties table
CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section_type section_type NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_counties_province_id ON counties(province_id);
CREATE INDEX idx_groups_county_id ON groups(county_id);
CREATE INDEX idx_sections_group_id ON sections(group_id);
CREATE INDEX idx_provinces_slug ON provinces(slug);
CREATE INDEX idx_counties_slug ON counties(slug);
CREATE INDEX idx_groups_slug ON groups(slug);

-- Create updated_at triggers
CREATE TRIGGER set_provinces_updated_at
  BEFORE UPDATE ON provinces
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_counties_updated_at
  BEFORE UPDATE ON counties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Create auto-slug triggers
CREATE OR REPLACE FUNCTION set_slug_from_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_province_slug
  BEFORE INSERT OR UPDATE ON provinces
  FOR EACH ROW
  EXECUTE FUNCTION set_slug_from_name();

CREATE TRIGGER set_county_slug
  BEFORE INSERT OR UPDATE ON counties
  FOR EACH ROW
  EXECUTE FUNCTION set_slug_from_name();

CREATE TRIGGER set_group_slug
  BEFORE INSERT OR UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_slug_from_name();
