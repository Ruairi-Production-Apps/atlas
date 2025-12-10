-- Add status, payment_status, total_amount columns to form_submissions
ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
