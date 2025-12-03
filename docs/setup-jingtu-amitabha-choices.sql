-- ========================================
-- 预科：净土 班级念诵选择完整设置
-- Complete Setup for 预科：净土 Amitabha Recitation Choices
-- ========================================
-- 用户报名预科：净土时需要选择以下三个念诵之一（至少选一个）
-- Users enrolling in 预科：净土 must choose at least one of these three recitations

-- ========================================
-- 步骤1: 创建三个阿弥陀佛念诵修法（如果不存在）
-- Step 1: Create the three Amitabha recitation practices (if they don't exist)
-- ========================================

INSERT INTO practices (id, name, type, unit, description)
VALUES 
  (gen_random_uuid(), '阿弥陀佛名号（汉）', 'count', '遍', '汉语念诵阿弥陀佛名号 - 每日5000遍，总目标6350000遍'),
  (gen_random_uuid(), '阿弥陀佛圣号（藏）', 'count', '遍', '藏语念诵阿弥陀佛圣号 - 每日900遍，总目标1143000遍'),
  (gen_random_uuid(), '阿弥陀佛（汉）', 'count', '遍', '简短汉语念诵阿弥陀佛 - 每日7500遍，总目标9525000遍')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 步骤2: 获取班级ID和修法ID
-- Step 2: Get class ID and practice IDs
-- ========================================

SELECT 
  '班级 (Class)' as type,
  id, 
  class_name 
FROM class_curricula 
WHERE class_name = '预科：净土';

SELECT 
  '修法 (Practices)' as type,
  id,
  name,
  type,
  unit,
  description
FROM practices 
WHERE name IN (
  '阿弥陀佛名号（汉）',
  '阿弥陀佛圣号（藏）',
  '阿弥陀佛（汉）'
);

-- ========================================
-- 步骤3: 将修法添加到班级必修列表并标记为可选
-- Step 3: Add practices to class and mark as optional choices
-- ========================================
-- ⚠️ 重要：请将下面的 <CLASS_ID>, <PRACTICE_ID_1>, <PRACTICE_ID_2>, <PRACTICE_ID_3> 替换为步骤2查询得到的实际ID
-- IMPORTANT: Replace placeholders with actual IDs from Step 2

/*
-- 阿弥陀佛名号（汉）- 每日5000遍，总目标6350000遍
INSERT INTO class_required_practices (
  id, class_id, practice_id, choice_group, is_optional, 
  target_count, daily_target, practice_category, display_order
)
VALUES (
  gen_random_uuid(),
  '<CLASS_ID>',
  '<PRACTICE_ID_1>',
  'amitabha_recitation',
  TRUE,
  6350000,
  5000,
  'count',
  1
)
ON CONFLICT DO NOTHING;

-- 阿弥陀佛圣号（藏）- 每日900遍，总目标1143000遍
INSERT INTO class_required_practices (
  id, class_id, practice_id, choice_group, is_optional, 
  target_count, daily_target, practice_category, display_order
)
VALUES (
  gen_random_uuid(),
  '<CLASS_ID>',
  '<PRACTICE_ID_2>',
  'amitabha_recitation',
  TRUE,
  1143000,
  900,
  'count',
  2
)
ON CONFLICT DO NOTHING;

-- 阿弥陀佛（汉）- 每日7500遍，总目标9525000遍
INSERT INTO class_required_practices (
  id, class_id, practice_id, choice_group, is_optional, 
  target_count, daily_target, practice_category, display_order
)
VALUES (
  gen_random_uuid(),
  '<CLASS_ID>',
  '<PRACTICE_ID_3>',
  'amitabha_recitation',
  TRUE,
  9525000,
  7500,
  'count',
  3
)
ON CONFLICT DO NOTHING;
*/

-- ========================================
-- 步骤4: 验证配置
-- Step 4: Verify configuration
-- ========================================

SELECT 
  crp.id,
  cc.class_name,
  p.name as practice_name,
  crp.choice_group,
  crp.is_optional,
  crp.daily_target,
  crp.target_count as total_target,
  crp.practice_category
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE cc.class_name = '预科：净土'
  AND crp.is_optional = TRUE
ORDER BY crp.display_order;

-- ========================================
-- 使用说明 (Instructions)
-- ========================================
/*
执行顺序 (Execution Order):

1. 运行步骤1 - 创建三个阿弥陀佛念诵修法
   Run Step 1 - Create the three Amitabha recitation practices

2. 运行步骤2 - 获取ID（记录下来）
   Run Step 2 - Get IDs (write them down)

3. 将步骤2得到的ID填入步骤3的INSERT语句中，取消注释并运行
   Fill Step 2 IDs into Step 3 INSERT statements, uncomment and run

4. 运行步骤4 - 验证配置成功
   Run Step 4 - Verify configuration success

完成后，用户在注册"预科：净土"班级时将看到念诵选择界面！
After completion, users will see recitation choice UI when enrolling in 预科：净土!

三个选项及目标：
- 阿弥陀佛名号（汉）: 每日5000遍, 总目标6,350,000遍
- 阿弥陀佛圣号（藏）: 每日900遍, 总目标1,143,000遍  
- 阿弥陀佛（汉）: 每日7500遍, 总目标9,525,000遍
*/
