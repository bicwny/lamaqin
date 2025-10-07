-- ========================================
-- 观修选择系统完整设置脚本
-- Complete Meditation Choice System Setup
-- ========================================
-- 请在Supabase SQL Editor中运行此文件
-- Run this file in Supabase SQL Editor

-- ========================================
-- 1. 数据库结构更新 (Schema Updates)
-- ========================================

-- 为 class_required_practices 表添加新字段
-- Add new fields to class_required_practices table
ALTER TABLE class_required_practices 
ADD COLUMN IF NOT EXISTS choice_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_optional BOOLEAN DEFAULT FALSE;

-- 创建用户修法选择表
-- Create user practice choices table
CREATE TABLE IF NOT EXISTS user_practice_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES class_curricula(id) ON DELETE CASCADE,
  choice_group VARCHAR(100) NOT NULL,
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保同一用户在同一班级的同一选择组中不会有重复的修法
  -- Ensure no duplicate practice selections per user/class/group
  UNIQUE(user_id, class_id, choice_group, practice_id)
);

-- 创建索引以提高查询性能
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_practice_choices_user_class 
  ON user_practice_choices(user_id, class_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_choices_practice 
  ON user_practice_choices(practice_id);

-- ========================================
-- 2. 预科：入行 班级观修选择配置
-- Configure practice choices for 预科：入行 class
-- ========================================

-- 步骤1: 获取预科：入行班级ID和两个修法的ID
-- Step 1: Get class ID and practice IDs
-- (运行后查看结果，确认ID正确)
SELECT 
  '班级 (Class)' as type,
  id, 
  class_name 
FROM class_curricula 
WHERE class_name = '预科：入行';

SELECT 
  '修法 (Practices)' as type,
  id,
  name,
  category
FROM practices 
WHERE name IN (
  '《入行论广释》201观修',
  '《前行实修法》第59-92修法'
);

-- 步骤2: 更新 class_required_practices，标记两个修法为可选择的
-- Step 2: Update class_required_practices to mark the two practices as optional choices
-- 
-- ⚠️ 重要：请将下面的 <CLASS_ID>, <PRACTICE_ID_1>, <PRACTICE_ID_2> 替换为步骤1查询得到的实际ID
-- IMPORTANT: Replace <CLASS_ID>, <PRACTICE_ID_1>, <PRACTICE_ID_2> with actual IDs from Step 1

-- 示例（请替换为实际ID）:
-- Example (replace with actual IDs):
/*
UPDATE class_required_practices
SET 
  choice_group = '观修选择',
  is_optional = TRUE
WHERE class_id = '<CLASS_ID>' 
  AND practice_id IN ('<PRACTICE_ID_1>', '<PRACTICE_ID_2>');
*/

-- 步骤3: 验证配置是否正确
-- Step 3: Verify the configuration
-- (运行此查询以确认两个修法已正确标记为可选)
SELECT 
  crp.id,
  cc.class_name,
  p.name as practice_name,
  crp.choice_group,
  crp.is_optional
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE cc.class_name = '预科：入行'
  AND crp.is_optional = TRUE;

-- ========================================
-- 3. 测试查询 (Test Queries)
-- ========================================

-- 查看某个班级的所有可选修法组
-- View all optional practice groups for a class
SELECT 
  cc.class_name,
  crp.choice_group,
  p.name as practice_name,
  p.description
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE crp.is_optional = TRUE
ORDER BY cc.class_name, crp.choice_group, p.name;

-- 查看某个用户的修法选择
-- View a user's practice choices
-- (将 <USER_ID> 替换为实际用户ID)
/*
SELECT 
  u.dharma_name,
  cc.class_name,
  upc.choice_group,
  p.name as selected_practice
FROM user_practice_choices upc
JOIN users u ON upc.user_id = u.id
JOIN class_curricula cc ON upc.class_id = cc.id
JOIN practices p ON upc.practice_id = p.id
WHERE upc.user_id = '<USER_ID>'
ORDER BY cc.class_name, upc.choice_group;
*/

-- ========================================
-- 使用说明 (Instructions)
-- ========================================
/*
1. 在Supabase SQL Editor中运行步骤1的查询，获取班级和修法的ID
   Run Step 1 queries in Supabase SQL Editor to get class and practice IDs

2. 将获取的ID填入步骤2的UPDATE语句中，然后运行
   Fill the IDs into Step 2 UPDATE statement and execute it

3. 运行步骤3的验证查询，确认配置成功
   Run Step 3 verification query to confirm configuration

4. 在应用中测试：
   Test in the app:
   - 新用户注册时，在profile-setup页面会看到观修选择选项
   - 已注册用户在edit-profile页面可以修改观修选择
   - New users will see practice choices during profile-setup
   - Existing users can modify choices in edit-profile

5. 系统会自动：
   The system will automatically:
   - 要求用户在每个选择组中至少选择一项
   - 根据用户的选择创建对应的practice项目
   - 允许用户选择多项（支持同时学习多个观修）
   - Require at least one selection per choice group
   - Create practice items based on user selections
   - Allow multiple selections (support concurrent study)
*/
