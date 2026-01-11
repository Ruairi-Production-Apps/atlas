-- Create pending_invitations table
CREATE TABLE IF NOT EXISTS pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    organization_type TEXT NOT NULL CHECK (organization_type IN ('province', 'county', 'group', 'team')),
    organization_id UUID NOT NULL,
    role TEXT NOT NULL,
    section_ids TEXT[],
    is_section_lead BOOLEAN DEFAULT FALSE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(email, organization_id, role)
);

-- Create invitation_links table
CREATE TABLE IF NOT EXISTS invitation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_type TEXT NOT NULL CHECK (organization_type IN ('province', 'county', 'group', 'team')),
    organization_id UUID NOT NULL,
    role TEXT NOT NULL,
    section_ids TEXT[],
    is_section_lead BOOLEAN DEFAULT FALSE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON pending_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_organization ON pending_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitation_links_token ON invitation_links(token);
CREATE INDEX IF NOT EXISTS idx_invitation_links_expires ON invitation_links(expires_at);

-- Enable RLS
ALTER TABLE pending_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_invitations
-- Allow authenticated users to view invitations for organizations they have access to
CREATE POLICY "Users can view pending invitations for their organizations"
    ON pending_invitations
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- User is a sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- User has permissions in the organization
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = organization_type::scope_type
                AND scope_id = organization_id
            )
        )
    );

-- Allow authenticated users to create invitations for organizations they manage
CREATE POLICY "Users can create pending invitations for their organizations"
    ON pending_invitations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- User is a sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- User has admin permission in the organization
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = organization_type::scope_type
                AND scope_id = organization_id
                AND (permissions->>'admin')::boolean = true
            )
        )
    );

-- RLS Policies for invitation_links
-- Allow authenticated users to view invitation links for their organizations
CREATE POLICY "Users can view invitation links for their organizations"
    ON invitation_links
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- User is a sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- User has permissions in the organization
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = organization_type::scope_type
                AND scope_id = organization_id
            )
        )
    );

-- Allow authenticated users to create invitation links for organizations they manage
CREATE POLICY "Users can create invitation links for their organizations"
    ON invitation_links
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- User is a sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- User has admin permission in the organization
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = organization_type::scope_type
                AND scope_id = organization_id
                AND (permissions->>'admin')::boolean = true
            )
        )
    );

-- Allow authenticated users to update invitation links (mark as used)
CREATE POLICY "Users can update invitation links"
    ON invitation_links
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
