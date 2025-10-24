
# Supabase Database Setup Guide

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Environment Variables Setup
Add these environment variables in Replit's Secrets tool:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Setup
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dharma_name TEXT,
    email TEXT UNIQUE NOT NULL,
    location TEXT,
    practice_years INTEGER DEFAULT 0,
    class_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create themes table
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('foundation', 'puja', 'meditation', 'practice')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practices table
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('count', 'time')) NOT NULL,
    unit TEXT CHECK (unit IN ('次', '分钟')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_practice_projects table
CREATE TABLE user_practice_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id),
    practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
    target_count INTEGER NOT NULL,
    start_date DATE,
    target_end_date DATE,
    current_count INTEGER DEFAULT 0,
    daily_target INTEGER NOT NULL,
    status TEXT CHECK (status IN ('not_started', 'active', 'completed')) DEFAULT 'not_started',
    source_type TEXT CHECK (source_type IN ('class_required', 'user_created')) DEFAULT 'class_required' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_records table
CREATE TABLE daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    practice_project_id UUID REFERENCES user_practice_projects(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    count INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mindfulness_records table
CREATE TABLE mindfulness_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_time TIME NOT NULL,
    mind_type TEXT CHECK (mind_type IN ('good', 'bad')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample practices
INSERT INTO practices (name, type, unit, description) VALUES
('念佛', 'count', '次', '念诵佛号'),
('拜佛', 'count', '次', '礼拜诸佛'),
('诵经', 'time', '分钟', '诵读经典'),
('禅修', 'time', '分钟', '坐禅冥想');

-- Insert sample themes
INSERT INTO themes (name, type, description) VALUES
('每日功课', 'foundation', '基础修行功课'),
('供佛仪轨', 'puja', '供养诸佛菩萨'),
('禅修体验', 'meditation', '禅修冥想练习');
```

## Testing Connection
The app includes a connection test that will automatically check if Supabase is properly configured. You'll see:
- 🟢 Green status: Database connected successfully
- 🔴 Red status: Database connection failed
- 🟡 Yellow status: Using mock data (fallback mode)

## Class Curriculum Migration (NEW)

After completing the basic setup above, run the class curriculum migration to enable the class-based system:

1. Open the file `docs/CLASS_CURRICULUM_MIGRATION.sql`
2. Copy the entire SQL script
3. Paste and run it in your Supabase SQL editor
4. This will create tables and seed data for 加行 and 净土 classes

The migration adds:
- Class curriculum structure (class_curricula, class_required_courses, class_required_practices)
- User enrollment tracking (user_enrolled_classes, user_class_progress)
- Course and lesson tables with study type tracking
- Pre-configured data for 加行 (146 lessons, 7 practices) and 净土 (161 lessons, 1 practice)

## Practice Deletion Migration (2025-10-24)

After completing the class curriculum migration, apply the source_type field migration:

1. Open the file `docs/ADD_SOURCE_TYPE_MIGRATION.sql`
2. Copy the entire SQL script
3. Paste and run it in your Supabase SQL editor
4. This adds tracking for user-created vs class-required practices, enabling safe deletion of user-created duplicates

## Next Steps
1. Add your environment variables
2. Run the SQL schema setup
3. Run the class curriculum migration
4. Run the practice deletion migration (ADD_SOURCE_TYPE_MIGRATION.sql)
5. Restart your Expo development server
6. Check the connection status in the app
7. Start tracking your Buddhist practice!
