-- Migration to add 'paused' status to user_practice_projects
-- This enables pausing practice projects when a user pauses their class enrollment

-- Step 1: Drop the existing constraint and add a new one with 'paused' status
ALTER TABLE user_practice_projects 
DROP CONSTRAINT IF EXISTS user_practice_projects_status_check;

ALTER TABLE user_practice_projects 
ADD CONSTRAINT user_practice_projects_status_check 
CHECK (status IN ('not_started', 'active', 'completed', 'paused'));

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_practice_projects' AND column_name = 'status';
