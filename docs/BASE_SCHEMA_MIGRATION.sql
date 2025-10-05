-- Base Schema Migration for Buddhist Practice Tracking App
-- Creates all fundamental tables required by the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  dharma_name TEXT,
  lay_name TEXT,
  class_name TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PRACTICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('count', 'time', 'session')),
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER PRACTICE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_practice_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  target_count INTEGER,
  daily_target INTEGER,
  start_date DATE NOT NULL,
  target_end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, practice_id, start_date)
);

-- ============================================
-- DAILY RECORDS TABLE  
-- ============================================
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_practice_projects(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  record_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, practice_id, project_id, record_date)
);

-- ============================================
-- PRACTICE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS practice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_practice_projects(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDITATION RECORDS TABLE (session-based)
-- ============================================
CREATE TABLE IF NOT EXISTS meditation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDY RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  study_time TIME,
  study_type TEXT,
  study_count_for_lesson INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('参加', '缺席', '回顾', '串讲', '讲考', '提问')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER COURSES TABLE (enrollment)
-- ============================================
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- MINDFULNESS RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mindfulness_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER,
  reflection TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_practice_projects_user_id ON user_practice_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_projects_status ON user_practice_projects(status);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_practice_records_user_project ON practice_records(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_meditation_records_user_date ON meditation_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_study_records_user_course ON study_records(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_mindfulness_records_user_date ON mindfulness_records(user_id, record_date);

-- Verification
SELECT 'Base schema migration complete!' as status;
SELECT 'Tables created:' as info, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'practices', 'user_practice_projects', 'daily_records', 'practice_records', 'meditation_records', 'study_records', 'user_courses', 'mindfulness_records');
