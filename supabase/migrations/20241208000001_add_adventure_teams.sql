-- Add new values to enums
ALTER TYPE scope_type ADD VALUE IF NOT EXISTS 'adventure_team';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'team_admin';

-- Create adventure_teams table
CREATE TABLE IF NOT EXISTS adventure_teams (
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_adventure_teams_slug ON adventure_teams(slug);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS set_adventure_teams_updated_at ON adventure_teams;
CREATE TRIGGER set_adventure_teams_updated_at
  BEFORE UPDATE ON adventure_teams
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Create slug trigger
DROP TRIGGER IF EXISTS set_adventure_team_slug ON adventure_teams;
CREATE TRIGGER set_adventure_team_slug
  BEFORE INSERT OR UPDATE ON adventure_teams
  FOR EACH ROW
  EXECUTE FUNCTION set_slug_from_name();
