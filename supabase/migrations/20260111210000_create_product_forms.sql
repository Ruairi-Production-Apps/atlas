-- Create product forms tables
-- This enables organizations to create forms for products (courses, workshops, etc.)
-- that can be booked on-demand with participant tracking and pricing

-- 1. Product Forms Table
CREATE TABLE IF NOT EXISTS product_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('interest', 'booking', 'custom')) DEFAULT 'custom',
  
  -- Capacity limits
  capacity_mode TEXT CHECK (capacity_mode IN ('unlimited', 'total', 'per_type')),
  capacity_total INTEGER, -- For 'total' mode
  capacity_scouters INTEGER, -- For 'per_type' mode
  capacity_youth INTEGER, -- For 'per_type' mode
  
  -- Date/time selection
  enable_date_selection BOOLEAN DEFAULT false,
  available_dates JSONB DEFAULT '[]'::JSONB, -- Array of date options
  
  -- Pricing override (if null, uses product default)
  pricing_mode TEXT CHECK (pricing_mode IN ('product_default', 'per_youth', 'per_scouter', 'per_person', 'custom')),
  price_base NUMERIC(10,2), -- Flat base price
  price_per_youth NUMERIC(10,2),
  price_per_scouter NUMERIC(10,2),
  price_per_adult NUMERIC(10,2),
  
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Product Form Fields Table
CREATE TABLE IF NOT EXISTS product_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES product_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox',
    'date', 'number', 'participants', 'content'
  )),
  label TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  options TEXT[] DEFAULT '{}',
  
  -- For participant fields
  participants_config JSONB DEFAULT '{}'::JSONB,
  
  -- For validation
  validation_rules JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Product Form Submissions Table
CREATE TABLE IF NOT EXISTS product_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES product_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  submission_data JSONB NOT NULL, -- Form field responses
  
  -- Selected date/time (if applicable)
  selected_date TIMESTAMPTZ,
  
  -- Participant counts
  participant_count_youth INTEGER DEFAULT 0,
  participant_count_scouters INTEGER DEFAULT 0,
  participant_count_adults INTEGER DEFAULT 0,
  
  -- Payment
  payment_intent_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'none')) DEFAULT 'none',
  stripe_checkout_session_id TEXT,
  total_amount NUMERIC(10,2),
  
  -- Metadata
  submission_status TEXT CHECK (submission_status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_forms_product_id ON product_forms(product_id);
CREATE INDEX IF NOT EXISTS idx_product_forms_published ON product_forms(published);
CREATE INDEX IF NOT EXISTS idx_product_form_fields_form_id ON product_form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_product_form_fields_display_order ON product_form_fields(form_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_form_submissions_form_id ON product_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_product_form_submissions_user_id ON product_form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_form_submissions_payment_status ON product_form_submissions(payment_status);

-- Triggers for updated_at
CREATE TRIGGER set_product_forms_updated_at
  BEFORE UPDATE ON product_forms
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_product_form_fields_updated_at
  BEFORE UPDATE ON product_form_fields
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_product_form_submissions_updated_at
  BEFORE UPDATE ON product_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE product_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_forms

-- Public can view published forms
CREATE POLICY "Public can view published product forms"
ON product_forms FOR SELECT
USING (published = true);

-- Authenticated users can view all forms (for admin interfaces)
CREATE POLICY "Authenticated users can view all product forms"
ON product_forms FOR SELECT
TO authenticated
USING (true);

-- Admins can manage forms for their scope
CREATE POLICY "Admins can manage product forms"
ON product_forms FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM store_products sp
    INNER JOIN user_roles ur ON (
      ur.user_id = auth.uid()
      AND ur.scope_type::text = sp.scope_type
      AND ur.scope_id = sp.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
    WHERE sp.id = product_forms.product_id
  )
);

-- RLS Policies for product_form_fields

-- Public can view fields for published forms
CREATE POLICY "Public can view published form fields"
ON product_form_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM product_forms pf
    WHERE pf.id = product_form_fields.form_id
    AND pf.published = true
  )
);

-- Authenticated users can view all fields
CREATE POLICY "Authenticated users can view all form fields"
ON product_form_fields FOR SELECT
TO authenticated
USING (true);

-- Admins can manage fields
CREATE POLICY "Admins can manage form fields"
ON product_form_fields FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM product_forms pf
    INNER JOIN store_products sp ON sp.id = pf.product_id
    INNER JOIN user_roles ur ON (
      ur.user_id = auth.uid()
      AND ur.scope_type::text = sp.scope_type
      AND ur.scope_id = sp.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
    WHERE pf.id = product_form_fields.form_id
  )
);

-- RLS Policies for product_form_submissions

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON product_form_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all submissions for their scope
CREATE POLICY "Admins can view submissions"
ON product_form_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM product_forms pf
    INNER JOIN store_products sp ON sp.id = pf.product_id
    INNER JOIN user_roles ur ON (
      ur.user_id = auth.uid()
      AND ur.scope_type::text = sp.scope_type
      AND ur.scope_id = sp.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
    WHERE pf.id = product_form_submissions.form_id
  )
);

-- Authenticated users can submit forms
CREATE POLICY "Authenticated users can submit forms"
ON product_form_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
ON product_form_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND submission_status = 'pending');

-- Admins can update submissions
CREATE POLICY "Admins can update submissions"
ON product_form_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM product_forms pf
    INNER JOIN store_products sp ON sp.id = pf.product_id
    INNER JOIN user_roles ur ON (
      ur.user_id = auth.uid()
      AND ur.scope_type::text = sp.scope_type
      AND ur.scope_id = sp.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
    WHERE pf.id = product_form_submissions.form_id
  )
);
