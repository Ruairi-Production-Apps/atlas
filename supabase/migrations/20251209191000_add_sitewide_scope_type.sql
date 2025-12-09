-- Add 'sitewide' to the scope_type enum
ALTER TYPE scope_type ADD VALUE IF NOT EXISTS 'sitewide';

-- Allow system admins to manage sitewide scope
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
  -- SysAdmin has access to everything, including sitewide
  IF is_sysadmin(user_id) THEN
    RETURN true;
  END IF;

  -- Sitewide content can only be managed by sysadmins (covered above) or explicit checking if we want others later
  IF check_scope_type = 'sitewide' THEN
    RETURN is_sysadmin(user_id);
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
