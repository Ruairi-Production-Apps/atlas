-- Migration: Create Membership System Tables
-- Date: 2026-02-07

-- 1. Membership Configs
CREATE TABLE IF NOT EXISTS membership_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  
  -- Registration Setup
  intro_text TEXT,
  registration_deadline TIMESTAMPTZ,
  published BOOLEAN NOT NULL DEFAULT false,
  
  -- Multi-Child Discount
  enable_multi_child_discount BOOLEAN DEFAULT false,
  discount_value NUMERIC(10, 2), -- Amount or percentage
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')) DEFAULT 'fixed',
  
  -- Payment Methods Enabled
  enable_weekly_payments BOOLEAN DEFAULT false,
  enable_monthly_payments BOOLEAN DEFAULT false,
  enable_tiered_payments BOOLEAN DEFAULT false,
  
  -- Schedule Logic
  schedule_start_date DATE,
  schedule_end_date DATE,
  rounding_mode TEXT CHECK (rounding_mode IN ('final_payment', 'distribute')) DEFAULT 'final_payment',
  missed_payment_handling TEXT CHECK (missed_payment_handling IN ('accumulate', 'spread')) DEFAULT 'accumulate',
  
  -- Tiered Logic
  tiered_initial_amount NUMERIC(10, 2),
  tiered_final_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id) -- Only one active config per group
);

-- 2. Membership Fee Items
CREATE TABLE IF NOT EXISTS membership_fee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES membership_configs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  
  -- Discount can be applied to specific items (Group fee vs SI fee)
  apply_discount BOOLEAN DEFAULT true,
  
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Membership Forms (Integration with Form Builder)
CREATE TABLE IF NOT EXISTS membership_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Youth Member Registration',
  description TEXT,
  button_text TEXT DEFAULT 'Submit & Pay',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES membership_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,
  label TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  options TEXT[] DEFAULT '{}',
  participants_config JSONB DEFAULT '{}'::JSONB,
  validation_rules JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Membership Registrations
CREATE TABLE IF NOT EXISTS membership_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES membership_configs(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id),
  form_id UUID NOT NULL REFERENCES membership_forms(id),
  
  -- Submission Data (linked to form)
  submission_data JSONB NOT NULL,
  
  -- Pricing Snapshot
  total_fee NUMERIC(10, 2) NOT NULL,
  discount_applied NUMERIC(10, 2) DEFAULT 0,
  net_fee NUMERIC(10, 2) NOT NULL,
  
  -- Payment Status
  payment_method TEXT CHECK (payment_method IN ('full', 'weekly', 'monthly', 'tiered')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'active', 'paid', 'cancelled')) DEFAULT 'pending',
  
  -- Stripe Integration
  stripe_subscription_id TEXT, -- For auto-recurring
  stripe_customer_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Membership Payment Schedules
CREATE TABLE IF NOT EXISTS membership_payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES membership_registrations(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'missed', 'cancelled')) DEFAULT 'pending',
  
  -- Payment Reference
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  payment_method_type TEXT, -- 'stripe', 'cash', 'cheque'
  notes TEXT, -- For manual adjustments
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Membership Reminders
CREATE TABLE IF NOT EXISTS membership_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES membership_configs(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  
  -- Receiver
  send_to_both_parents BOOLEAN DEFAULT false,
  
  -- Frequency
  frequency_rules JSONB NOT NULL, -- Supports time-based frequency as per PRD
  
  active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Indexes
CREATE INDEX idx_membership_configs_group_id ON membership_configs(group_id);
CREATE INDEX idx_membership_registrations_parent_id ON membership_registrations(parent_id);
CREATE INDEX idx_membership_payment_schedules_reg_id ON membership_payment_schedules(registration_id);
CREATE INDEX idx_membership_payment_schedules_due_date ON membership_payment_schedules(due_date);

-- 8. Triggers for updated_at
CREATE TRIGGER set_membership_configs_updated_at BEFORE UPDATE ON membership_configs FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_fee_items_updated_at BEFORE UPDATE ON membership_fee_items FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_forms_updated_at BEFORE UPDATE ON membership_forms FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_form_fields_updated_at BEFORE UPDATE ON membership_form_fields FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_registrations_updated_at BEFORE UPDATE ON membership_registrations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_payment_schedules_updated_at BEFORE UPDATE ON membership_payment_schedules FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_membership_reminders_updated_at BEFORE UPDATE ON membership_reminders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- 9. RLS Policies
ALTER TABLE membership_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_fee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_reminders ENABLE ROW LEVEL SECURITY;

-- Group Leaders can manage membership configs for their group
CREATE POLICY "GL manage membership_configs" ON membership_configs
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND scope_type = 'group'
    AND scope_id = membership_configs.group_id
    AND role = 'group_leader'
  )
);

-- Public/Parents can view published configs
CREATE POLICY "Public view published membership_configs" ON membership_configs
FOR SELECT USING (published = true);

-- Same for fee items (linked to configs)
CREATE POLICY "GL manage fee items" ON membership_fee_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_configs mc
    INNER JOIN user_roles ur ON ur.scope_id = mc.group_id
    WHERE mc.id = membership_fee_items.config_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'group_leader'
  )
);

-- Parents can view registrations they own
CREATE POLICY "Parent view own registrations" ON membership_registrations
FOR SELECT TO authenticated
USING (parent_id = auth.uid());

-- GL can view all registrations for their group
CREATE POLICY "GL view all registrations" ON membership_registrations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_configs mc
    INNER JOIN user_roles ur ON ur.scope_id = mc.group_id
    WHERE mc.id = membership_registrations.config_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'group_leader'
  )
);

-- Similar policies for payment schedules
CREATE POLICY "Parent view own schedules" ON membership_payment_schedules
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_registrations mr
    WHERE mr.id = membership_payment_schedules.registration_id
    AND mr.parent_id = auth.uid()
  )
);

CREATE POLICY "GL manage schedules" ON membership_payment_schedules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_registrations mr
    INNER JOIN membership_configs mc ON mc.id = mr.config_id
    INNER JOIN user_roles ur ON ur.scope_id = mc.group_id
    WHERE mr.id = membership_payment_schedules.registration_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'group_leader'
  )
);
