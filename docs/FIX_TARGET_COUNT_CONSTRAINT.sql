-- Fix target_count NOT NULL constraint issue
-- Run this in Supabase SQL Editor to allow NULL values for session-based practices

-- Remove NOT NULL constraint from target_count and daily_target
-- These fields should be NULL for session-based practices
ALTER TABLE user_practice_projects 
  ALTER COLUMN target_count DROP NOT NULL;

ALTER TABLE user_practice_projects 
  ALTER COLUMN daily_target DROP NOT NULL;

-- Verify the fix
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'user_practice_projects' 
  AND column_name IN ('target_count', 'daily_target');
