-- Add target_period column to user_practice_projects table
ALTER TABLE user_practice_projects 
ADD COLUMN target_period VARCHAR(10) DEFAULT 'daily' 
CHECK (target_period IN ('daily', 'weekly'));

-- Update existing records to have default 'daily' period
UPDATE user_practice_projects 
SET target_period = 'daily' 
WHERE target_period IS NULL;
