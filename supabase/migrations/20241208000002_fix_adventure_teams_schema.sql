-- Add deleted_at to adventure_teams
ALTER TABLE adventure_teams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
