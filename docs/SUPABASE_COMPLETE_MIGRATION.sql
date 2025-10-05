-- ============================================
-- COMPLETE SUPABASE DATABASE MIGRATION
-- For Buddhist Practice Tracking App (三殊胜)
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. BASE TABLES
-- ============================================

-- Users table
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

-- Practices table
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('count', 'time', 'session')),
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User practice projects
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

-- Daily records
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

-- Practice records
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

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  total_lessons INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

-- Meditation records
CREATE TABLE IF NOT EXISTS meditation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study records
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

-- User courses (enrollment)
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

-- Mindfulness records
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
-- 2. CLASS CURRICULUM TABLES
-- ============================================

-- Class curricula
CREATE TABLE IF NOT EXISTS class_curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class required courses
CREATE TABLE IF NOT EXISTS class_required_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  required_study_types TEXT[] NOT NULL DEFAULT ARRAY['听上师传承', '看法本'],
  optional_status_fields TEXT[] NOT NULL DEFAULT ARRAY['共修', '讲考'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, course_id)
);

-- Class required practices
CREATE TABLE IF NOT EXISTS class_required_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  target_count INTEGER,
  daily_target INTEGER,
  total_sessions INTEGER,
  weekly_sessions INTEGER,
  min_duration_minutes INTEGER,
  practice_category TEXT CHECK (practice_category IN ('count', 'session')) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, practice_id)
);

-- User enrolled classes
CREATE TABLE IF NOT EXISTS user_enrolled_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- User class progress
CREATE TABLE IF NOT EXISTS user_class_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  courses_completed INTEGER DEFAULT 0,
  practices_completed INTEGER DEFAULT 0,
  overall_progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- ============================================
-- 3. SEED DATA - CLASS CURRICULA
-- ============================================

INSERT INTO class_curricula (class_name, display_order, description) VALUES
('加行', 1, '前行阶段 - 基础修行与积累资粮'),
('净土', 4, '净土班 - 念佛求生西方极乐世界')
ON CONFLICT (class_name) DO NOTHING;

-- ============================================
-- 4. SEED DATA - COURSES
-- ============================================

INSERT INTO courses (name, total_lessons, description) VALUES
('前行广释', 146, '加行 - 前行广释完整课程'),
('佛说阿弥陀经释', 4, '净土 - 阿弥陀经注释'),
('普贤行愿品释', 12, '净土 - 普贤菩萨行愿品注释'),
('亲友书讲记', 20, '净土 - 龙树菩萨亲友书'),
('藏传净土法', 104, '净土 - 藏传净土修行方法'),
('修心利刃轮释', 20, '净土 - 修心法门注释'),
('愿海精髓讲记', 1, '净土 - 普贤愿海精髓')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. SEED DATA - PRACTICES
-- ============================================

INSERT INTO practices (name, type, unit, description) VALUES
('顶礼', 'count', '次', '加行 - 顶礼诸佛菩萨'),
('皈依', 'count', '次', '加行 - 皈依三宝'),
('发心', 'count', '次', '加行 - 发菩提心'),
('百字明', 'count', '次', '加行 - 念诵百字明咒'),
('供曼茶', 'count', '次', '加行 - 供养曼茶罗'),
('莲师上师瑜伽', 'count', '次', '加行 - 莲师上师相应法'),
('前行实修法', 'time', '分钟', '加行 - 前行禅修实践'),
('南无阿弥陀佛', 'count', '次', '净土 - 念诵阿弥陀佛圣号')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. LINK CLASSES TO COURSES
-- ============================================

-- Link 加行 to 前行广释
INSERT INTO class_required_courses (class_id, course_id, required_study_types, optional_status_fields)
SELECT 
  cc.id,
  c.id,
  ARRAY['听上师传承', '看法本'],
  ARRAY['共修', '讲考']
FROM class_curricula cc
CROSS JOIN courses c
WHERE cc.class_name = '加行' AND c.name = '前行广释'
ON CONFLICT (class_id, course_id) DO NOTHING;

-- Link 净土 to all 6 courses
INSERT INTO class_required_courses (class_id, course_id, required_study_types, optional_status_fields)
SELECT 
  cc.id,
  c.id,
  ARRAY['听上师传承', '看法本'],
  ARRAY['共修', '讲考']
FROM class_curricula cc
CROSS JOIN courses c
WHERE cc.class_name = '净土' AND c.name IN (
  '佛说阿弥陀经释',
  '普贤行愿品释',
  '亲友书讲记',
  '藏传净土法',
  '修心利刃轮释',
  '愿海精髓讲记'
)
ON CONFLICT (class_id, course_id) DO NOTHING;

-- ============================================
-- 7. LINK CLASSES TO PRACTICES
-- ============================================

-- 加行 count-based practices (6 practices, all 100,000 count)
INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 200, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '顶礼'
ON CONFLICT (class_id, practice_id) DO NOTHING;

INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 500, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '皈依'
ON CONFLICT (class_id, practice_id) DO NOTHING;

INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 500, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '发心'
ON CONFLICT (class_id, practice_id) DO NOTHING;

INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 300, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '百字明'
ON CONFLICT (class_id, practice_id) DO NOTHING;

INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 500, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '供曼茶'
ON CONFLICT (class_id, practice_id) DO NOTHING;

INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 100000, 1000, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '莲师上师瑜伽'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 加行 session-based practice (368 sessions: 92座 × 4 sessions/座, 4/week, 92 weeks, 30min minimum)
INSERT INTO class_required_practices (class_id, practice_id, total_sessions, weekly_sessions, min_duration_minutes, practice_category)
SELECT cc.id, p.id, 368, 4, 30, 'session'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '前行实修法'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 净土 count-based practice (南无阿弥陀佛 - 6,000,000 total, 5000/day)
INSERT INTO class_required_practices (class_id, practice_id, target_count, daily_target, practice_category)
SELECT cc.id, p.id, 6000000, 5000, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '净土' AND p.name = '南无阿弥陀佛'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- ============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_practice_projects_user_id ON user_practice_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_projects_status ON user_practice_projects(status);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_practice_records_user_project ON practice_records(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_meditation_records_user_date ON meditation_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_study_records_user_course ON study_records(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_study_records_user_lesson ON study_records(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_study_records_study_type ON study_records(study_type);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_mindfulness_records_user_date ON mindfulness_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_user_enrolled_classes_user_id ON user_enrolled_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrolled_classes_status ON user_enrolled_classes(status);
CREATE INDEX IF NOT EXISTS idx_user_class_progress_user_id ON user_class_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_class_required_courses_class_id ON class_required_courses(class_id);
CREATE INDEX IF NOT EXISTS idx_class_required_practices_class_id ON class_required_practices(class_id);

-- ============================================
-- 9. VERIFICATION
-- ============================================

SELECT '✅ Migration Complete!' as status;

SELECT 
  'Class Curricula' as table_name,
  COUNT(*) as record_count
FROM class_curricula
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Practices', COUNT(*) FROM practices
UNION ALL
SELECT 'Class-Course Links', COUNT(*) FROM class_required_courses
UNION ALL
SELECT 'Class-Practice Links', COUNT(*) FROM class_required_practices;
