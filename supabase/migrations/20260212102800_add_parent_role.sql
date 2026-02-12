-- Migration: Add 'parent' to user_role enum
-- Date: 2026-02-12
-- Note: Users can have multiple roles (e.g. both 'parent' and 'scouter')
-- via separate rows in user_roles table.

ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'parent';
