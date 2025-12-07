-- Enable RLS on all tables
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledgebase_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledgebase_files ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is sysadmin
CREATE OR REPLACE FUNCTION is_sysadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND role = 'sysadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has role for scope
CREATE OR REPLACE FUNCTION has_role_for_scope(
  user_id UUID,
  required_role user_role,
  check_scope_type scope_type,
  check_scope_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role = $2
    AND user_roles.scope_type = $3
    AND user_roles.scope_id = $4
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can manage content in scope
CREATE OR REPLACE FUNCTION can_manage_scope(
  user_id UUID,
  check_scope_type scope_type,
  check_scope_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  province_id UUID;
  county_id UUID;
  group_id UUID;
BEGIN
  -- SysAdmin has access to everything
  IF is_sysadmin(user_id) THEN
    RETURN true;
  END IF;

  -- Check direct scope match
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.scope_type = $2
    AND user_roles.scope_id = $3
  ) THEN
    RETURN true;
  END IF;

  -- Check hierarchical permissions
  CASE check_scope_type
    WHEN 'section' THEN
      -- Get group_id from section
      SELECT s.group_id INTO group_id FROM sections s WHERE s.id = check_scope_id;
      IF has_role_for_scope(user_id, 'group_leader', 'group', group_id) THEN
        RETURN true;
      END IF;
      -- Continue to check county and province
      SELECT g.county_id INTO county_id FROM groups g WHERE g.id = group_id;
      IF has_role_for_scope(user_id, 'county_admin', 'county', county_id) THEN
        RETURN true;
      END IF;
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = county_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    WHEN 'group' THEN
      SELECT g.county_id INTO county_id FROM groups g WHERE g.id = check_scope_id;
      IF has_role_for_scope(user_id, 'county_admin', 'county', county_id) THEN
        RETURN true;
      END IF;
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = county_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    WHEN 'county' THEN
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = check_scope_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    ELSE
      -- Province level - only provincial admin or sysadmin
      NULL;
  END CASE;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ORGANIZATIONAL TABLES RLS POLICIES
-- ==========================================

-- Provinces: Public read, sysadmin write
CREATE POLICY "Provinces are viewable by everyone"
  ON provinces FOR SELECT
  USING (true);

CREATE POLICY "Provinces are insertable by sysadmin"
  ON provinces FOR INSERT
  WITH CHECK (is_sysadmin(auth.uid()));

CREATE POLICY "Provinces are updatable by sysadmin"
  ON provinces FOR UPDATE
  USING (is_sysadmin(auth.uid()))
  WITH CHECK (is_sysadmin(auth.uid()));

CREATE POLICY "Provinces are deletable by sysadmin"
  ON provinces FOR DELETE
  USING (is_sysadmin(auth.uid()));

-- Counties: Public read, hierarchical write
CREATE POLICY "Counties are viewable by everyone"
  ON counties FOR SELECT
  USING (true);

CREATE POLICY "Counties are insertable by sysadmin"
  ON counties FOR INSERT
  WITH CHECK (is_sysadmin(auth.uid()));

CREATE POLICY "Counties are updatable by admins"
  ON counties FOR UPDATE
  USING (can_manage_scope(auth.uid(), 'county', id))
  WITH CHECK (can_manage_scope(auth.uid(), 'county', id));

CREATE POLICY "Counties are deletable by sysadmin"
  ON counties FOR DELETE
  USING (is_sysadmin(auth.uid()));

-- Groups: Public read, hierarchical write
CREATE POLICY "Groups are viewable by everyone"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Groups are insertable by county admins"
  ON groups FOR INSERT
  WITH CHECK (can_manage_scope(auth.uid(), 'county', county_id));

CREATE POLICY "Groups are updatable by admins"
  ON groups FOR UPDATE
  USING (can_manage_scope(auth.uid(), 'group', id))
  WITH CHECK (can_manage_scope(auth.uid(), 'group', id));

CREATE POLICY "Groups are deletable by county admins"
  ON groups FOR DELETE
  USING (can_manage_scope(auth.uid(), 'county', county_id));

-- Sections: Public read, hierarchical write
CREATE POLICY "Sections are viewable by everyone"
  ON sections FOR SELECT
  USING (true);

CREATE POLICY "Sections are insertable by group leaders"
  ON sections FOR INSERT
  WITH CHECK (can_manage_scope(auth.uid(), 'group', group_id));

CREATE POLICY "Sections are updatable by admins"
  ON sections FOR UPDATE
  USING (can_manage_scope(auth.uid(), 'section', id))
  WITH CHECK (can_manage_scope(auth.uid(), 'section', id));

CREATE POLICY "Sections are deletable by group leaders"
  ON sections FOR DELETE
  USING (can_manage_scope(auth.uid(), 'group', group_id));

-- ==========================================
-- USER TABLES RLS POLICIES
-- ==========================================

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User Roles: Viewable by authenticated, manageable by admins
CREATE POLICY "User roles are viewable by authenticated users"
  ON user_roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "User roles are insertable by sysadmin"
  ON user_roles FOR INSERT
  WITH CHECK (is_sysadmin(auth.uid()));

CREATE POLICY "User roles are updatable by sysadmin"
  ON user_roles FOR UPDATE
  USING (is_sysadmin(auth.uid()))
  WITH CHECK (is_sysadmin(auth.uid()));

CREATE POLICY "User roles are deletable by sysadmin"
  ON user_roles FOR DELETE
  USING (is_sysadmin(auth.uid()));

-- ==========================================
-- CONTENT TABLES RLS POLICIES
-- ==========================================

-- News Posts
CREATE POLICY "Published news posts are viewable by everyone"
  ON news_posts FOR SELECT
  USING (published = true OR can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "News posts are insertable by authorized users"
  ON news_posts FOR INSERT
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "News posts are updatable by authorized users"
  ON news_posts FOR UPDATE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id))
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "News posts are deletable by authorized users"
  ON news_posts FOR DELETE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id));

-- Events
CREATE POLICY "Published events are viewable by everyone"
  ON events FOR SELECT
  USING (published = true OR can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "Events are insertable by authorized users"
  ON events FOR INSERT
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "Events are updatable by authorized users"
  ON events FOR UPDATE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id))
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "Events are deletable by authorized users"
  ON events FOR DELETE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id));

-- Event Sections
CREATE POLICY "Event sections are viewable by everyone"
  ON event_sections FOR SELECT
  USING (true);

CREATE POLICY "Event sections are manageable by event managers"
  ON event_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sections.event_id
      AND can_manage_scope(auth.uid(), events.scope_type, events.scope_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sections.event_id
      AND can_manage_scope(auth.uid(), events.scope_type, events.scope_id)
    )
  );

-- Knowledgebase Articles
CREATE POLICY "Published KB articles are viewable by everyone"
  ON knowledgebase_articles FOR SELECT
  USING (published = true OR can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "KB articles are insertable by authorized users"
  ON knowledgebase_articles FOR INSERT
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "KB articles are updatable by authorized users"
  ON knowledgebase_articles FOR UPDATE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id))
  WITH CHECK (can_manage_scope(auth.uid(), scope_type, scope_id));

CREATE POLICY "KB articles are deletable by authorized users"
  ON knowledgebase_articles FOR DELETE
  USING (can_manage_scope(auth.uid(), scope_type, scope_id));

-- Knowledgebase Files
CREATE POLICY "KB files are viewable by everyone"
  ON knowledgebase_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledgebase_articles
      WHERE knowledgebase_articles.id = knowledgebase_files.article_id
      AND knowledgebase_articles.published = true
    )
    OR
    EXISTS (
      SELECT 1 FROM knowledgebase_articles
      WHERE knowledgebase_articles.id = knowledgebase_files.article_id
      AND can_manage_scope(auth.uid(), knowledgebase_articles.scope_type, knowledgebase_articles.scope_id)
    )
  );

CREATE POLICY "KB files are manageable by article managers"
  ON knowledgebase_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM knowledgebase_articles
      WHERE knowledgebase_articles.id = knowledgebase_files.article_id
      AND can_manage_scope(auth.uid(), knowledgebase_articles.scope_type, knowledgebase_articles.scope_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledgebase_articles
      WHERE knowledgebase_articles.id = knowledgebase_files.article_id
      AND can_manage_scope(auth.uid(), knowledgebase_articles.scope_type, knowledgebase_articles.scope_id)
    )
  );
