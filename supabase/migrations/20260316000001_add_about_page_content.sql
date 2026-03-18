-- Add about_page_content column to site_settings for Instance "About" page
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_page_content TEXT;
