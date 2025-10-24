-- Migration: Add source_type field to user_practice_projects table
-- This field tracks whether a practice was created from class enrollment or by the user
-- Date: October 24, 2025

-- Add source_type column
ALTER TABLE user_practice_projects
ADD COLUMN source_type TEXT CHECK (source_type IN ('class_required', 'user_created')) DEFAULT 'class_required';

-- Update existing records to be class_required (default for backwards compatibility)
UPDATE user_practice_projects
SET source_type = 'class_required'
WHERE source_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE user_practice_projects
ALTER COLUMN source_type SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_practice_projects.source_type IS 
'Tracks the origin of the practice project: class_required (from class enrollment) or user_created (manually added by user). Only user_created practices can be deleted.';
