-- ============================================================
-- Fix: Add essential RLS policies that were missing from the
-- instance bootstrap schema. Without these, authenticated users
-- cannot read their own user_roles, causing isSysadmin to always
-- return false and the Manage button to never appear.
--
-- Safe to run multiple times (uses DROP POLICY IF EXISTS + IF NOT EXISTS).
-- ============================================================

-- ---------------------------------------------------------------
-- user_roles: Allow users to read their own roles
-- (This is CRITICAL - without it, isSysadmin always = false)
-- ---------------------------------------------------------------
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role full access (needed for setup wizard to assign roles)
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
CREATE POLICY "Service role can manage all roles"
  ON user_roles FOR ALL
  USING (true);

-- ---------------------------------------------------------------
-- profiles: Allow users to read/update their own profile
-- ---------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------
-- site_settings: Public read (already exists but safe to re-add)
-- ---------------------------------------------------------------
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to site settings" ON site_settings;
CREATE POLICY "Allow public read access to site settings"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Sysadmins can manage site settings" ON site_settings;
CREATE POLICY "Sysadmins can manage site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'sysadmin'
    )
  );

-- ---------------------------------------------------------------
-- groups: Public read (already exists but safe to re-add)
-- ---------------------------------------------------------------
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to groups" ON groups;
CREATE POLICY "Allow public read access to groups"
  ON groups FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Sysadmins can manage groups" ON groups;
CREATE POLICY "Sysadmins can manage groups"
  ON groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'sysadmin'
    )
  );

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
