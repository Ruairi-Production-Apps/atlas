-- Add long_description to adventure_teams
ALTER TABLE adventure_teams ADD COLUMN IF NOT EXISTS long_description TEXT;
