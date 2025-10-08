-- ============================================
-- 数据结构重构：添加 weekly_target，重命名 target_count
-- ============================================
-- 执行说明：
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 2. 该脚本会：
--    - 更新 user_practice_projects 表
--    - 更新 class_required_practices 表
--    - 添加 total_target 和 weekly_target 字段
--    - 删除旧的字段（target_count, weekly_sessions, total_sessions）
-- ============================================

-- ========================================
-- Part 1: 更新 user_practice_projects 表
-- ========================================

-- Step 1: 添加新字段
ALTER TABLE user_practice_projects 
ADD COLUMN IF NOT EXISTS total_target INTEGER,
ADD COLUMN IF NOT EXISTS weekly_target INTEGER;

-- Step 2: 复制现有数据到新字段
UPDATE user_practice_projects 
SET total_target = target_count
WHERE total_target IS NULL;

-- Step 3: 对于weekly类型的项目，设置weekly_target
UPDATE user_practice_projects 
SET weekly_target = daily_target,
    daily_target = NULL
WHERE target_period = 'weekly' AND weekly_target IS NULL;

-- Step 4: 将 daily_target 改为可选
ALTER TABLE user_practice_projects 
ALTER COLUMN daily_target DROP NOT NULL;

-- Step 5: 删除旧字段 target_count
ALTER TABLE user_practice_projects 
DROP COLUMN IF EXISTS target_count;

-- ========================================
-- Part 2: 更新 class_required_practices 表
-- ========================================

-- Step 1: 添加新字段
ALTER TABLE class_required_practices 
ADD COLUMN IF NOT EXISTS total_target INTEGER,
ADD COLUMN IF NOT EXISTS weekly_target INTEGER;

-- Step 2: 复制现有数据到新字段
-- target_count -> total_target
UPDATE class_required_practices 
SET total_target = target_count
WHERE total_target IS NULL AND target_count IS NOT NULL;

-- weekly_sessions -> weekly_target
UPDATE class_required_practices 
SET weekly_target = weekly_sessions
WHERE weekly_target IS NULL AND weekly_sessions IS NOT NULL;

-- Step 3: 将 daily_target 改为可选
ALTER TABLE class_required_practices 
ALTER COLUMN daily_target DROP NOT NULL;

-- Step 4: 删除旧字段
ALTER TABLE class_required_practices 
DROP COLUMN IF EXISTS target_count,
DROP COLUMN IF EXISTS weekly_sessions,
DROP COLUMN IF EXISTS total_sessions;

-- ========================================
-- 验证数据
-- ========================================

-- 验证 user_practice_projects
SELECT 
  'user_practice_projects' as table_name,
  id,
  practice_id,
  target_period,
  total_target,
  weekly_target,
  daily_target
FROM user_practice_projects
ORDER BY created_at DESC
LIMIT 5;

-- 验证 class_required_practices
SELECT 
  'class_required_practices' as table_name,
  id,
  practice_id,
  total_target,
  weekly_target,
  daily_target
FROM class_required_practices
ORDER BY created_at DESC
LIMIT 5;
