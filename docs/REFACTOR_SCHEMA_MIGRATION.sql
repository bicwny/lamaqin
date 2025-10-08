-- ============================================
-- 数据结构重构：添加 weekly_target，重命名 target_count
-- ============================================
-- 执行说明：
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 2. 该脚本会：
--    - 添加 total_target 和 weekly_target 字段
--    - 复制 target_count 数据到 total_target
--    - 将 daily_target 改为可选（nullable）
--    - 删除旧的 target_count 字段
-- ============================================

-- Step 1: 添加新字段
ALTER TABLE user_practice_projects 
ADD COLUMN IF NOT EXISTS total_target INTEGER,
ADD COLUMN IF NOT EXISTS weekly_target INTEGER;

-- Step 2: 复制现有数据到新字段
UPDATE user_practice_projects 
SET total_target = target_count
WHERE total_target IS NULL;

-- Step 3: 对于weekly类型的项目，设置weekly_target
-- 假设：如果target_period = 'weekly'，则daily_target实际存储的是weekly_target
UPDATE user_practice_projects 
SET weekly_target = daily_target,
    daily_target = NULL
WHERE target_period = 'weekly' AND weekly_target IS NULL;

-- Step 4: 将 daily_target 改为可选（如果它现在是 NOT NULL）
ALTER TABLE user_practice_projects 
ALTER COLUMN daily_target DROP NOT NULL;

-- Step 5: 删除旧字段 target_count
ALTER TABLE user_practice_projects 
DROP COLUMN IF EXISTS target_count;

-- Step 6: 验证数据
SELECT 
  id,
  practice_id,
  target_period,
  total_target,
  weekly_target,
  daily_target,
  current_count
FROM user_practice_projects
ORDER BY created_at DESC
LIMIT 10;
