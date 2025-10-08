-- ============================================
-- 让 total_target 可选，支持无期限持续修行
-- ============================================
-- 执行说明：
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 2. 该脚本会：
--    - 将 user_practice_projects.total_target 改为可选
--    - 将 class_required_practices.total_target 改为可选
-- ============================================

-- Step 1: 修改 user_practice_projects 表
ALTER TABLE user_practice_projects 
ALTER COLUMN total_target DROP NOT NULL;

-- Step 2: 修改 class_required_practices 表
ALTER TABLE class_required_practices 
ALTER COLUMN total_target DROP NOT NULL;

-- Step 3: 验证修改
SELECT 
  table_name,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name IN ('user_practice_projects', 'class_required_practices')
  AND column_name = 'total_target';
