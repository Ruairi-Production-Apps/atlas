-- Fix RLS policies for group_join_requests and user_roles to support hierarchical permissions

-- 1. Updates for group_join_requests
DROP POLICY IF EXISTS "Group admins can view group requests" ON group_join_requests;
CREATE POLICY "Admins can view group requests"
  ON group_join_requests FOR SELECT
  USING (
    is_sysadmin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('group_leader', 'sysadmin')
      AND (
        (user_roles.scope_type = 'group' AND user_roles.scope_id = group_join_requests.group_id) OR
        (user_roles.scope_type = 'county' AND EXISTS (SELECT 1 FROM groups g WHERE g.id = group_join_requests.group_id AND g.county_id = user_roles.scope_id)) OR
        (user_roles.scope_type = 'province' AND EXISTS (SELECT 1 FROM groups g JOIN counties c ON g.county_id = c.id WHERE g.id = group_join_requests.group_id AND c.province_id = user_roles.scope_id))
      )
    )
  );

DROP POLICY IF EXISTS "Group admins can update group requests" ON group_join_requests;
CREATE POLICY "Admins can update group requests"
  ON group_join_requests FOR UPDATE
  USING (
    is_sysadmin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('group_leader', 'sysadmin')
      AND (
        (user_roles.scope_type = 'group' AND user_roles.scope_id = group_join_requests.group_id) OR
        (user_roles.scope_type = 'county' AND EXISTS (SELECT 1 FROM groups g WHERE g.id = group_join_requests.group_id AND g.county_id = user_roles.scope_id)) OR
        (user_roles.scope_type = 'province' AND EXISTS (SELECT 1 FROM groups g JOIN counties c ON g.county_id = c.id WHERE g.id = group_join_requests.group_id AND c.province_id = user_roles.scope_id))
      )
    )
  );

-- 2. Updates for user_roles
-- Allow hierarchical admins to manage roles within their scope
DROP POLICY IF EXISTS "User roles are insertable by sysadmin" ON user_roles;
CREATE POLICY "User roles are insertable by authorized admins"
  ON user_roles FOR INSERT
  WITH CHECK (
    is_sysadmin(auth.uid()) OR
    can_manage_scope(auth.uid(), scope_type, scope_id)
  );

DROP POLICY IF EXISTS "User roles are updatable by sysadmin" ON user_roles;
CREATE POLICY "User roles are updatable by authorized admins"
  ON user_roles FOR UPDATE
  USING (
    is_sysadmin(auth.uid()) OR
    can_manage_scope(auth.uid(), scope_type, scope_id)
  )
  WITH CHECK (
    is_sysadmin(auth.uid()) OR
    can_manage_scope(auth.uid(), scope_type, scope_id)
  );

DROP POLICY IF EXISTS "User roles are deletable by sysadmin" ON user_roles;
CREATE POLICY "User roles are deletable by authorized admins"
  ON user_roles FOR DELETE
  USING (
    is_sysadmin(auth.uid()) OR
    can_manage_scope(auth.uid(), scope_type, scope_id)
  );
