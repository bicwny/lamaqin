-- Class-Based Curriculum System Migration
-- Date: October 4, 2025
-- Description: Adds tables for class curriculum structure (加行, 净土)

-- ============================================
-- 1. CREATE NEW TABLES
-- ============================================

-- Table: class_curricula
-- Defines available class levels
CREATE TABLE IF NOT EXISTS class_curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: class_required_courses
-- Links classes to required courses with study type specifications
CREATE TABLE IF NOT EXISTS class_required_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  required_study_types TEXT[] NOT NULL DEFAULT ARRAY['听上师传承', '看法本'],
  optional_status_fields TEXT[] NOT NULL DEFAULT ARRAY['共修', '讲考'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, course_id)
);

-- Table: class_required_practices
-- Defines practice requirements for each class
CREATE TABLE IF NOT EXISTS class_required_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  
  -- For count-based practices
  target_count INTEGER,
  daily_target INTEGER,
  
  -- For session-based practices  
  total_sessions INTEGER,
  weekly_sessions INTEGER,
  min_duration_minutes INTEGER,
  
  practice_category TEXT CHECK (practice_category IN ('count', 'session')) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, practice_id)
);

-- Table: user_enrolled_classes
-- Tracks which classes users are enrolled in (supports concurrent enrollment)
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

-- Table: user_class_progress
-- Tracks user progress through class requirements
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

-- Table: courses
-- Stores course information (if not exists)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  total_lessons INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: course_lessons
-- Stores individual lessons (if not exists)
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

-- Table: study_records
-- Note: This table may already exist. We're adding new columns if needed.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_records') THEN
    CREATE TABLE study_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
      study_date DATE NOT NULL,
      study_time TIME,
      study_type TEXT,
      study_count_for_lesson INTEGER DEFAULT 1,
      completed BOOLEAN DEFAULT false,
      status TEXT CHECK (status IN ('参加', '缺席')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_records' AND column_name = 'completed') THEN
      ALTER TABLE study_records ADD COLUMN completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_records' AND column_name = 'status') THEN
      ALTER TABLE study_records ADD COLUMN status TEXT CHECK (status IN ('参加', '缺席'));
    END IF;
  END IF;
END $$;

-- Table: meditation_records (session-based practices)
-- Update to support class curriculum sessions
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
-- 2. SEED CLASS CURRICULA
-- ============================================

INSERT INTO class_curricula (class_name, display_order, description) VALUES
('加行', 1, '前行阶段 - 基础修行与积累资粮'),
('净土', 4, '净土班 - 念佛求生西方极乐世界')
ON CONFLICT (class_name) DO NOTHING;

-- ============================================
-- 3. SEED COURSES
-- ============================================

-- First, ensure courses table has unique constraint on name
DO $$ 
BEGIN
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'courses_name_key'
  ) THEN
    ALTER TABLE courses ADD CONSTRAINT courses_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert courses if they don't exist (using unique name constraint)
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
-- 4. SEED PRACTICES
-- ============================================

-- First, ensure practices table has unique constraint on name
DO $$ 
BEGIN
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'practices_name_key'
  ) THEN
    ALTER TABLE practices ADD CONSTRAINT practices_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert practices for 加行 and 净土
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
-- 5. LINK CLASSES TO COURSES
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
-- 6. LINK CLASSES TO PRACTICES
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

-- 加行 session-based practice (92 sessions, 4/week, 30min minimum)
INSERT INTO class_required_practices (class_id, practice_id, total_sessions, weekly_sessions, min_duration_minutes, practice_category)
SELECT cc.id, p.id, 92, 4, 30, 'session'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '加行' AND p.name = '前行实修法'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 净土 count-based practice (南无阿弥陀佛 - 5000/day, no total limit)
INSERT INTO class_required_practices (class_id, practice_id, daily_target, practice_category)
SELECT cc.id, p.id, 5000, 'count'
FROM class_curricula cc CROSS JOIN practices p
WHERE cc.class_name = '净土' AND p.name = '南无阿弥陀佛'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_enrolled_classes_user_id ON user_enrolled_classes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrolled_classes_status ON user_enrolled_classes(status);
CREATE INDEX IF NOT EXISTS idx_user_class_progress_user_id ON user_class_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_class_required_courses_class_id ON class_required_courses(class_id);
CREATE INDEX IF NOT EXISTS idx_class_required_practices_class_id ON class_required_practices(class_id);
CREATE INDEX IF NOT EXISTS idx_study_records_user_lesson ON study_records(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_study_records_study_type ON study_records(study_type);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify setup
SELECT 'Class Curricula Count:' as info, COUNT(*) as count FROM class_curricula
UNION ALL
SELECT 'Courses Count:', COUNT(*) FROM courses
UNION ALL
SELECT 'Practices Count:', COUNT(*) FROM practices
UNION ALL
SELECT 'Class-Course Links:', COUNT(*) FROM class_required_courses
UNION ALL
SELECT 'Class-Practice Links:', COUNT(*) FROM class_required_practices;
