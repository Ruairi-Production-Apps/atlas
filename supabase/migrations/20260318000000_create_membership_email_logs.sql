-- Email logs for membership reminder communications
CREATE TABLE IF NOT EXISTS membership_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID REFERENCES membership_reminders(id) ON DELETE SET NULL,
    config_id UUID NOT NULL REFERENCES membership_configs(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'recurring')),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying logs by config (group)
CREATE INDEX idx_membership_email_logs_config_id ON membership_email_logs(config_id);
CREATE INDEX idx_membership_email_logs_reminder_id ON membership_email_logs(reminder_id);
CREATE INDEX idx_membership_email_logs_created_at ON membership_email_logs(created_at DESC);

-- RLS
ALTER TABLE membership_email_logs ENABLE ROW LEVEL SECURITY;

-- Group leaders and scouters can view logs for their group's configs
CREATE POLICY "Group leaders can view email logs"
    ON membership_email_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM membership_configs mc
            JOIN user_roles ur ON ur.scope_id = mc.group_id
                AND ur.scope_type = 'group'
                AND ur.role IN ('group_leader', 'scouter')
                AND ur.user_id = auth.uid()
            WHERE mc.id = membership_email_logs.config_id
        )
    );

-- Sysadmins can view all logs
CREATE POLICY "Sysadmins can view all email logs"
    ON membership_email_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
                AND role = 'sysadmin'
        )
    );

-- Service role inserts (no INSERT policy needed — service role bypasses RLS)
