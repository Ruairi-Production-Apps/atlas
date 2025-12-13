-- Create group_join_requests table to track user requests to join groups
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('scouter', 'parent', 'both')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id, status) -- Prevent duplicate pending requests
);

-- Create indexes for better query performance
CREATE INDEX idx_group_join_requests_user_id ON group_join_requests(user_id);
CREATE INDEX idx_group_join_requests_group_id ON group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_status ON group_join_requests(status);

-- Add updated_at trigger
CREATE TRIGGER set_group_join_requests_updated_at
  BEFORE UPDATE ON group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own join requests"
  ON group_join_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own join requests
CREATE POLICY "Users can create own join requests"
  ON group_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Group admins can view requests for their groups
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

-- Group admins can update requests (approve/reject)
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
