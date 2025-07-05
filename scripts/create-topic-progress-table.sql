
-- Create user_practice_topic_progress table for tracking individual topic progress
-- This enables "每个修法每周至少x座" functionality

CREATE TABLE IF NOT EXISTS user_practice_topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  practice_project_id uuid REFERENCES user_practice_projects(id) ON DELETE CASCADE,
  topic_number integer NOT NULL,
  weekly_target_sessions integer NOT NULL,
  current_week_sessions integer DEFAULT 0,
  current_week_start_date date DEFAULT CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer,
  total_completed_weeks integer DEFAULT 0,
  is_current_week_complete boolean DEFAULT false,
  last_session_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT unique_project_topic UNIQUE(practice_project_id, topic_number),
  CONSTRAINT valid_topic_number CHECK (topic_number >= 1 AND topic_number <= 92)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON user_practice_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_project_id ON user_practice_topic_progress(practice_project_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_current_week ON user_practice_topic_progress(current_week_start_date);

-- Enable RLS
ALTER TABLE user_practice_topic_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own topic progress" 
ON user_practice_topic_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Add new columns to meditation_records for topic tracking
ALTER TABLE meditation_records 
ADD COLUMN IF NOT EXISTS topic_number integer,
ADD COLUMN IF NOT EXISTS week_start_date date DEFAULT CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer;

-- Add new column to user_practice_projects for goal type
ALTER TABLE user_practice_projects 
ADD COLUMN IF NOT EXISTS goal_type varchar(20) DEFAULT 'fixed_duration';

-- Add index for topic-based queries
CREATE INDEX IF NOT EXISTS idx_meditation_records_topic_week 
ON meditation_records(practice_id, topic_number, week_start_date);
