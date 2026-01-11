-- Robust migration to ensure group_join_requests exists and has correct FKs

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Corrected FK to profiles
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('scouter', 'parent', 'both')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id, status)
);

-- 2. Validate/Fix FK if table already existed but had wrong FK
DO $$ 
BEGIN
  -- If the constraint to auth.users exists, drop it
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'group_join_requests_user_id_fkey_1') THEN
     -- Note: Default naming might vary, checking standard name
     ALTER TABLE group_join_requests DROP CONSTRAINT group_join_requests_user_id_fkey_1;
  END IF;
  
  -- We want to ensure 'group_join_requests_user_id_fkey' points to profiles
  -- But simpler approach: Use a specific name for our good constraint
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'group_join_requests_user_id_profiles_fkey') THEN
      -- Drop old one if it conflicts by name
      IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'group_join_requests_user_id_fkey') THEN
        ALTER TABLE group_join_requests DROP CONSTRAINT group_join_requests_user_id_fkey;
      END IF;

      ALTER TABLE group_join_requests 
        ADD CONSTRAINT group_join_requests_user_id_profiles_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Indexes (IF NOT EXISTS is not standard for CREATE INDEX in standard Postgres < 9.5 but Supabase is newer)
CREATE INDEX IF NOT EXISTS idx_group_join_requests_user_id ON group_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_id ON group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON group_join_requests(status);

-- 5. Trigger
CREATE OR REPLACE TRIGGER set_group_join_requests_updated_at
  BEFORE UPDATE ON group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- 6. Policies (Drop first to be safe)
DROP POLICY IF EXISTS "Users can view own join requests" ON group_join_requests;
CREATE POLICY "Users can view own join requests"
  ON group_join_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own join requests" ON group_join_requests;
CREATE POLICY "Users can create own join requests"
  ON group_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Group admins can view group requests" ON group_join_requests;
CREATE POLICY "Group admins can view group requests"
  ON group_join_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.scope_type = 'group'
      AND user_roles.scope_id = group_join_requests.group_id
      AND user_roles.role IN ('group_leader', 'sysadmin')
    )
  );

DROP POLICY IF EXISTS "Group admins can update group requests" ON group_join_requests;
CREATE POLICY "Group admins can update group requests"
  ON group_join_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.scope_type = 'group'
      AND user_roles.scope_id = group_join_requests.group_id
      AND user_roles.role IN ('group_leader', 'sysadmin')
    )
  );

-- 7. Grant Permissions (Crucial fix)
GRANT SELECT, INSERT, UPDATE, DELETE ON group_join_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_join_requests TO service_role;
