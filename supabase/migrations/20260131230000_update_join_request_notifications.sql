-- Update notify_group_admin_on_join_request function to include sysadmins
CREATE OR REPLACE FUNCTION notify_group_admin_on_join_request()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
  v_user_name TEXT;
  v_group_name TEXT;
BEGIN
  -- Get user's name
  SELECT first_name || ' ' || last_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Get group name
  SELECT name INTO v_group_name
  FROM groups
  WHERE id = NEW.group_id;

  -- Notify all group admins AND global sysadmins
  FOR v_admin_id IN
    (
      -- Group admins and leaders
      SELECT DISTINCT user_id
      FROM user_roles
      WHERE scope_type = 'group'
        AND scope_id = NEW.group_id
        AND role IN ('group_leader', 'sysadmin')
      
      UNION
      
      -- Global sysadmins (those with no scope or specifically sysadmin role globally)
      SELECT DISTINCT user_id
      FROM user_roles
      WHERE role = 'sysadmin'
    )
  LOOP
    PERFORM create_notification(
      v_admin_id,
      'group_join_request',
      'New Join Request',
      v_user_name || ' has requested to join ' || v_group_name || ' as a ' || 
        CASE NEW.requested_role
          WHEN 'both' THEN 'Scouter and Parent'
          WHEN 'parent' THEN 'Parent/Guardian'
          WHEN 'scouter' THEN 'Scouter'
          ELSE NEW.requested_role
        END,
      '/scouter/organizations/' || NEW.group_id || '/join-requests',
      jsonb_build_object(
        'request_id', NEW.id,
        'group_id', NEW.group_id,
        'requester_id', NEW.user_id,
        'requester_name', v_user_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
