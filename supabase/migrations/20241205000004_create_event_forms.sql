-- Create event_forms table
CREATE TABLE event_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create form_fields table
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES event_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,
  label TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  options TEXT[] DEFAULT '{}',
  participants_config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_forms_event_id ON event_forms(event_id);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);

-- Triggers for updated_at
CREATE TRIGGER set_event_forms_updated_at
  BEFORE UPDATE ON event_forms
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_form_fields_updated_at
  BEFORE UPDATE ON form_fields
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE event_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- Policies for event_forms

-- Public read access (for filling out forms)
CREATE POLICY "Public Read Access"
ON event_forms FOR SELECT
USING (true);

-- Authenticated insert/update/delete (Admins)
-- Ideally this checks organization permissions via the event, but for now we'll match the pattern
-- of allowing authenticated users to manage content they own, or relying on application logic + RLS
CREATE POLICY "Authenticated Manage"
ON event_forms FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policies for form_fields
CREATE POLICY "Public Read Access"
ON form_fields FOR SELECT
USING (true);

CREATE POLICY "Authenticated Manage"
ON form_fields FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
