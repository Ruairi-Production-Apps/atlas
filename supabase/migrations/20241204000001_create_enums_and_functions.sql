-- Create custom types/enums
CREATE TYPE section_type AS ENUM ('beavers', 'cubs', 'scouts', 'ventures', 'rovers');
CREATE TYPE scope_type AS ENUM ('system', 'province', 'county', 'group', 'section');
CREATE TYPE user_role AS ENUM ('sysadmin', 'provincial_admin', 'county_admin', 'group_leader', 'section_leader');
CREATE TYPE event_visibility AS ENUM ('open_to_all', 'sections_only', 'scouters_only');
CREATE TYPE event_pricing_mode AS ENUM ('per_group', 'per_scout', 'per_person_type');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create slug generation function
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
