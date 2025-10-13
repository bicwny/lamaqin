-- ============================================
-- ADD ENTRY YEAR TO USER ENROLLED CLASSES
-- Migration to add entry_year field for cohort tracking
-- ============================================

-- Add entry_year column to user_enrolled_classes table
ALTER TABLE user_enrolled_classes 
ADD COLUMN IF NOT EXISTS entry_year TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_enrolled_classes.entry_year IS 'Entry year cohort (e.g., "18入行", "20入行", "24入行")';
