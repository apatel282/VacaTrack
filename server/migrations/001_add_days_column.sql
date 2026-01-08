-- Migration: Add days column to pto_entries table
-- Date: 2026-01-07
-- Description: Adds optional 'days' column to store manual PTO day overrides

-- Add the days column (nullable integer)
ALTER TABLE pto_entries
ADD COLUMN IF NOT EXISTS days INTEGER;

-- Add a comment to document the purpose
COMMENT ON COLUMN pto_entries.days IS 'Manual override for PTO days count. If NULL, calculate from start_date and end_date.';
