-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'group_join_request', 'event_invitation', 'ticket_reply', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Optional link to related resource
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data (e.g., requester_name, group_id, etc.)
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_viewed BOOLEAN NOT NULL DEFAULT FALSE, -- Viewed = opened the dropdown/saw it listed
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_archived ON notifications(user_id, is_archived);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read/archived)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- We'll control this via service role

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as viewed
CREATE OR REPLACE FUNCTION mark_notification_viewed(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_viewed = TRUE, viewed_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create notification when group join request is created
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

  -- Notify all group admins
  FOR v_admin_id IN
    SELECT DISTINCT user_id
    FROM user_roles
    WHERE scope_type = 'group'
      AND scope_id = NEW.group_id
      AND role IN ('group_leader', 'sysadmin')
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

-- Create trigger for group join requests
CREATE TRIGGER on_group_join_request_created
  AFTER INSERT ON group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_group_admin_on_join_request();
