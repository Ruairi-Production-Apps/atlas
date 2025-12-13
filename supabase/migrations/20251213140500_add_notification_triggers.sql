-- Add ticket_comments table for replies
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);

-- Add updated_at trigger for comments
CREATE TRIGGER set_ticket_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- RLS for ticket_comments
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on their own tickets
CREATE POLICY "Users can view own ticket comments"
    ON ticket_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_comments.ticket_id
            AND tickets.user_id = auth.uid()
        )
    );

-- Admins can view all comments
CREATE POLICY "Admins can view all ticket comments"
    ON ticket_comments FOR SELECT
    USING (is_sysadmin(auth.uid()));

-- Users can create comments on their own tickets
CREATE POLICY "Users can comment on own tickets"
    ON ticket_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_comments.ticket_id
            AND tickets.user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Admins can create comments on any ticket
CREATE POLICY "Admins can comment on any ticket"
    ON ticket_comments FOR INSERT
    WITH CHECK (is_sysadmin(auth.uid()) AND user_id = auth.uid());

-- Update ticket status enum to include 'closed' and 'in_progress'
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'closed';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'in_progress';

-- Add policy for users and admins to update ticket status
DROP POLICY IF EXISTS "Users can update own ticket status" ON tickets;
CREATE POLICY "Users can update own ticket status"
    ON tickets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any ticket status" ON tickets;
CREATE POLICY "Admins can update any ticket status"
    ON tickets FOR UPDATE
    USING (is_sysadmin(auth.uid()))
    WITH CHECK (is_sysadmin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
CREATE POLICY "Admins can view all tickets"
    ON tickets FOR SELECT
    USING (is_sysadmin(auth.uid()));

-- ======================
-- NOTIFICATION TRIGGERS
-- ======================

-- 1. Notify sysadmins of new tickets
CREATE OR REPLACE FUNCTION notify_admins_new_ticket()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_user_name TEXT;
BEGIN
    -- Get user's name
    SELECT COALESCE(first_name || ' ' || last_name, email) INTO v_user_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- Notify all sysadmins
    FOR v_admin_id IN
        SELECT DISTINCT user_id
        FROM user_roles
        WHERE role = 'sysadmin'
    LOOP
        PERFORM create_notification(
            v_admin_id,
            'new_ticket',
            'New Support Ticket',
            v_user_name || ' created a new ' || NEW.type || ' ticket: ' || NEW.subject,
            '/admin/tickets/' || NEW.id,
            jsonb_build_object(
                'ticket_id', NEW.id,
                'user_id', NEW.user_id,
                'user_name', v_user_name,
                'ticket_type', NEW.type
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_created
    AFTER INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_ticket();

-- 2. Notify on ticket comments
CREATE OR REPLACE FUNCTION notify_on_ticket_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_ticket_owner_id UUID;
    v_commenter_name TEXT;
    v_ticket_subject TEXT;
    v_admin_id UUID;
    v_is_commenter_admin BOOLEAN;
BEGIN
    -- Get commenter name
    SELECT COALESCE(first_name || ' ' || last_name, email) INTO v_commenter_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- Get ticket owner and subject
    SELECT user_id, subject INTO v_ticket_owner_id, v_ticket_subject
    FROM tickets
    WHERE id = NEW.ticket_id;

    -- Check if commenter is admin
    v_is_commenter_admin := is_sysadmin(NEW.user_id);

    -- If admin commented, notify ticket owner
    IF v_is_commenter_admin AND NEW.user_id != v_ticket_owner_id THEN
        PERFORM create_notification(
            v_ticket_owner_id,
            'ticket_reply_admin',
            'Admin Reply to Your Ticket',
            'An admin responded to your ticket: ' || v_ticket_subject,
            '/tickets/' || NEW.ticket_id,
            jsonb_build_object(
                'ticket_id', NEW.ticket_id,
                'comment_id', NEW.id,
                'admin_name', v_commenter_name
            )
        );
    END IF;

    -- If user commented, notify all admins (except the commenter if they're admin)
    IF NOT v_is_commenter_admin THEN
        FOR v_admin_id IN
            SELECT DISTINCT user_id
            FROM user_roles
            WHERE role = 'sysadmin'
            AND user_id != NEW.user_id
        LOOP
            PERFORM create_notification(
                v_admin_id,
                'ticket_reply_user',
                'New Reply on Ticket',
                v_commenter_name || ' replied to ticket: ' || v_ticket_subject,
                '/admin/tickets/' || NEW.ticket_id,
                jsonb_build_object(
                    'ticket_id', NEW.ticket_id,
                    'comment_id', NEW.id,
                    'user_id', NEW.user_id,
                    'user_name', v_commenter_name
                )
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_comment_created
    AFTER INSERT ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_ticket_comment();

-- 3. Notify on ticket status change
CREATE OR REPLACE FUNCTION notify_on_ticket_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_ticket_owner_id UUID;
    v_changer_name TEXT;
    v_ticket_subject TEXT;
    v_admin_id UUID;
    v_is_changer_admin BOOLEAN;
BEGIN
    -- Only notify if status actually changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get ticket owner and subject
    v_ticket_owner_id := NEW.user_id;
    v_ticket_subject := NEW.subject;

    -- Get who changed it (from current auth context)
    SELECT COALESCE(first_name || ' ' || last_name, email) INTO v_changer_name
    FROM profiles
    WHERE id = auth.uid();

    -- Check if changer is admin
    v_is_changer_admin := is_sysadmin(auth.uid());

    -- Notify ticket owner if admin changed status
    IF v_is_changer_admin AND auth.uid() != v_ticket_owner_id THEN
        PERFORM create_notification(
            v_ticket_owner_id,
            'ticket_status_changed',
            'Ticket Status Updated',
            'Your ticket "' || v_ticket_subject || '" status changed to: ' || NEW.status,
            '/tickets/' || NEW.id,
            jsonb_build_object(
                'ticket_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'changed_by', v_changer_name
            )
        );
    END IF;

    -- Notify admins if user changed status
    IF NOT v_is_changer_admin THEN
        FOR v_admin_id IN
            SELECT DISTINCT user_id
            FROM user_roles
            WHERE role = 'sysadmin'
        LOOP
            PERFORM create_notification(
                v_admin_id,
                'ticket_status_changed',
                'Ticket Status Updated',
                v_changer_name || ' changed ticket "' || v_ticket_subject || '" to: ' || NEW.status,
                '/admin/tickets/' || NEW.id,
                jsonb_build_object(
                    'ticket_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'changed_by_user_id', auth.uid()
                )
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_status_changed
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_ticket_status_change();

-- 4. Notify applicant when join request is approved/rejected
CREATE OR REPLACE FUNCTION notify_on_join_request_decision()
RETURNS TRIGGER AS $$
DECLARE
    v_group_name TEXT;
    v_reviewer_name TEXT;
BEGIN
    -- Only notify if status changed to approved or rejected
    IF OLD.status = NEW.status OR NEW.status NOT IN ('approved', 'rejected') THEN
        RETURN NEW;
    END IF;

    -- Get group name
    SELECT name INTO v_group_name
    FROM groups
    WHERE id = NEW.group_id;

    -- Get reviewer name if available
    IF NEW.reviewed_by IS NOT NULL THEN
        SELECT COALESCE(first_name || ' ' || last_name, 'A group admin') INTO v_reviewer_name
        FROM profiles
        WHERE id = NEW.reviewed_by;
    ELSE
        v_reviewer_name := 'A group admin';
    END IF;

    -- Notify the applicant
    IF NEW.status = 'approved' THEN
        PERFORM create_notification(
            NEW.user_id,
            'join_request_approved',
            'Group Join Request Approved! 🎉',
            'Your request to join ' || v_group_name || ' as a ' || 
                CASE NEW.requested_role
                    WHEN 'both' THEN 'Scouter and Parent'
                    WHEN 'parent' THEN 'Parent/Guardian'
                    WHEN 'scouter' THEN 'Scouter'
                    ELSE NEW.requested_role
                END || ' has been approved by ' || v_reviewer_name,
            '/dashboard',
            jsonb_build_object(
                'request_id', NEW.id,
                'group_id', NEW.group_id,
                'group_name', v_group_name,
                'requested_role', NEW.requested_role
            )
        );
    ELSE
        PERFORM create_notification(
            NEW.user_id,
            'join_request_rejected',
            'Group Join Request Update',
            'Your request to join ' || v_group_name || ' was not approved. You can reach out to the group administrators for more information.',
            '/dashboard',
            jsonb_build_object(
                'request_id', NEW.id,
                'group_id', NEW.group_id,
                'group_name', v_group_name
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_join_request_decision
    AFTER UPDATE ON group_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_join_request_decision();
