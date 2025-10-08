-- ============================================
-- 更新 class_required_practices 表的字段名
-- ============================================
-- 执行说明：
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 2. 该脚本会更新 class_required_practices 表：
--    - target_count -> total_target
--    - weekly_sessions -> weekly_target
--    - 删除 total_sessions（已废弃）
-- ============================================

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

-- Step 3: 将 daily_target 改为可选（如果它现在是 NOT NULL）
ALTER TABLE class_required_practices 
ALTER COLUMN daily_target DROP NOT NULL;

-- Step 4: 删除旧字段
ALTER TABLE class_required_practices 
DROP COLUMN IF EXISTS target_count,
DROP COLUMN IF EXISTS weekly_sessions,
DROP COLUMN IF EXISTS total_sessions;

-- Step 5: 验证数据
SELECT 
  id,
  practice_id,
  total_target,
  weekly_target,
  daily_target,
  choice_group
FROM class_required_practices
ORDER BY created_at DESC
LIMIT 10;
