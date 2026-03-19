-- Add per_child_discounts JSONB column to membership_configs
-- Stores an array of discount amounts for each additional child: [child2_discount, child3_discount, ...]
-- Example: [30, 60, 60, 60, 60] means child 2 gets €30 off, children 3-6 get €60 off
ALTER TABLE membership_configs
ADD COLUMN IF NOT EXISTS per_child_discounts JSONB DEFAULT '[]'::jsonb;

-- Update discount_type check constraint to allow 'per_child'
ALTER TABLE membership_configs DROP CONSTRAINT IF EXISTS membership_configs_discount_type_check;
ALTER TABLE membership_configs ADD CONSTRAINT membership_configs_discount_type_check
  CHECK (discount_type IN ('fixed', 'percentage', 'per_child'));
