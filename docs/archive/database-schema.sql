
-- MVP Database Schema for Buddhist Practice Tracker
-- Execute this in Supabase SQL Editor

-- Enable RLS
ALTER DATABASE postgres SET row_level_security = on;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dharma_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  location VARCHAR(100),
  practice_years INTEGER,
  class_name VARCHAR(100),
  main_practices JSONB,
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- foundation, puja, meditation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practices table  
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- count or time
  unit VARCHAR(20) NOT NULL, -- 次 or 分钟
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theme-Practice relationships
CREATE TABLE IF NOT EXISTS theme_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  target_count INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  total_lessons INTEGER NOT NULL,
  teacher VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User practice projects
CREATE TABLE IF NOT EXISTS user_practice_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id),
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  target_count INTEGER NOT NULL,
  start_date DATE,
  target_end_date DATE,
  current_count INTEGER DEFAULT 0,
  daily_target INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'not_started', -- not_started, active, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily practice records
CREATE TABLE IF NOT EXISTS daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practice_project_id UUID REFERENCES user_practice_projects(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  count INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meditation records (92-session system)
CREATE TABLE IF NOT EXISTS meditation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  session_number INTEGER NOT NULL, -- 1-92
  duration_minutes INTEGER NOT NULL,
  session_attempt INTEGER DEFAULT 1, -- 1-3+
  method VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study records
CREATE TABLE IF NOT EXISTS study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  study_type VARCHAR(20) NOT NULL DEFAULT '听传承', -- '听传承' or '看法本'
  study_count_for_lesson INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mindfulness records (good/bad heart tracking)
CREATE TABLE IF NOT EXISTS mindfulness_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_time TIME NOT NULL,
  mind_type VARCHAR(10) NOT NULL, -- 'good' or 'bad'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- One-time practice records
CREATE TABLE IF NOT EXISTS one_time_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  practice_type VARCHAR(50) NOT NULL,
  practice_name VARCHAR(100) NOT NULL,
  count_or_duration VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Precept records
CREATE TABLE IF NOT EXISTS precept_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  precept_type VARCHAR(50) NOT NULL, -- 八关斋戒, 菩萨戒, etc.
  record_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert base data
INSERT INTO themes (name, description, type) VALUES
('五加行', '五加行修法主题，包含顶礼、发心、百字明、供曼达、上师瑜伽', 'foundation'),
('金刚萨埵法会', '金刚萨埵净障法会专项修法', 'puja'),
('前行实修法', '大圆满前行92座观修系统', 'meditation');

INSERT INTO practices (name, type, unit) VALUES
('顶礼', 'count', '次'),
('发心', 'count', '次'), 
('百字明', 'count', '次'),
('供曼达', 'count', '次'),
('上师瑜伽', 'count', '次'),
('金刚萨埵心咒', 'count', '次'),
('前行观修', 'time', '分钟');

INSERT INTO courses (name, total_lessons, teacher) VALUES
('《入菩萨行论》', 201, '索达吉堪布'),
('《大圆满前行》', 92, '索达吉堪布');

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE precept_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own practice projects" ON user_practice_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily records" ON daily_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meditation records" ON meditation_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study records" ON study_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mindfulness records" ON mindfulness_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own one-time records" ON one_time_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own precept records" ON precept_records FOR ALL USING (auth.uid() = user_id);

-- Allow read access to reference tables
CREATE POLICY "Allow read access to themes" ON themes FOR SELECT USING (true);
CREATE POLICY "Allow read access to practices" ON practices FOR SELECT USING (true);
CREATE POLICY "Allow read access to courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow read access to course_lessons" ON course_lessons FOR SELECT USING (true);
