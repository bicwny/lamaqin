
-- Simple version to create the missing table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_practice_topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  practice_project_id uuid,
  topic_number integer NOT NULL,
  weekly_target_sessions integer NOT NULL DEFAULT 3,
  current_week_sessions integer DEFAULT 0,
  current_week_start_date date DEFAULT CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer,
  total_completed_weeks integer DEFAULT 0,
  is_current_week_complete boolean DEFAULT false,
  last_session_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_practice_topic_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own topic progress" 
ON user_practice_topic_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON user_practice_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_project_id ON user_practice_topic_progress(practice_project_id);
