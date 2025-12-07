-- Add status, payment_status, total_amount columns to form_submissions
ALTER TABLE form_submissions
  ADD COLUMN status text DEFAULT 'pending',
  ADD COLUMN payment_status text DEFAULT 'unpaid',
  ADD COLUMN total_amount numeric DEFAULT 0;
