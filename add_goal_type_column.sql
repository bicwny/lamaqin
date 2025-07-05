ALTER TABLE user_practice_projects ADD COLUMN IF NOT EXISTS goal_type VARCHAR(50) DEFAULT 'fixed_duration';
