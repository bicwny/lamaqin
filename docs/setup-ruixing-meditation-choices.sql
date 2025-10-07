-- ========================================
-- 预科：入行 班级观修选择完整设置
-- Complete Setup for 预科：入行 Meditation Choices
-- ========================================

-- 步骤1: 创建两个观修项目（如果不存在）
-- Step 1: Create the two meditation practices (if they don't exist)

INSERT INTO practices (id, name, type, unit, description)
VALUES 
  (gen_random_uuid(), '《入行论广释》201观修', 'time', '座', '入行论观修 - 第1课至第201课的系统观修'),
  (gen_random_uuid(), '《前行实修法》第59-92修法', 'time', '座', '前行实修 - 第59至92修法的系统观修')
ON CONFLICT (name) DO NOTHING;

-- 步骤2: 获取班级ID和修法ID
-- Step 2: Get class ID and practice IDs

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
  type,
  description
FROM practices 
WHERE name IN (
  '《入行论广释》201观修',
  '《前行实修法》第59-92修法'
);

-- 步骤3: 将修法添加到班级必修列表并标记为可选
-- Step 3: Add practices to class and mark as optional choices
-- 
-- ⚠️ 重要：请将下面的 <CLASS_ID>, <PRACTICE_ID_1>, <PRACTICE_ID_2> 替换为步骤2查询得到的实际ID
-- IMPORTANT: Replace <CLASS_ID>, <PRACTICE_ID_1>, <PRACTICE_ID_2> with actual IDs from Step 2

/*
-- 添加《入行论广释》201观修为可选修法
INSERT INTO class_required_practices (
  id, class_id, practice_id, choice_group, is_optional, 
  target_count, daily_target, practice_category
)
VALUES (
  gen_random_uuid(),
  '<CLASS_ID>',
  '<PRACTICE_ID_1>',
  '观修选择',
  TRUE,
  NULL,  -- time类型的观修不需要target_count
  NULL,  -- time类型的观修不需要daily_target
  'time'
)
ON CONFLICT DO NOTHING;

-- 添加《前行实修法》第59-92修法为可选修法
INSERT INTO class_required_practices (
  id, class_id, practice_id, choice_group, is_optional,
  target_count, daily_target, practice_category
)
VALUES (
  gen_random_uuid(),
  '<CLASS_ID>',
  '<PRACTICE_ID_2>',
  '观修选择',
  TRUE,
  NULL,
  NULL,
  'time'
)
ON CONFLICT DO NOTHING;
*/

-- 步骤4: 验证配置
-- Step 4: Verify configuration

SELECT 
  crp.id,
  cc.class_name,
  p.name as practice_name,
  crp.choice_group,
  crp.is_optional,
  crp.practice_category
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE cc.class_name = '预科：入行'
  AND crp.is_optional = TRUE;

-- ========================================
-- 使用说明 (Instructions)
-- ========================================
/*
执行顺序 (Execution Order):

1. 运行步骤1 - 创建两个观修项目
   Run Step 1 - Create the two meditation practices

2. 运行步骤2 - 获取ID（记录下来）
   Run Step 2 - Get IDs (write them down)

3. 将步骤2得到的ID填入步骤3的INSERT语句中，取消注释并运行
   Fill Step 2 IDs into Step 3 INSERT statements, uncomment and run

4. 运行步骤4 - 验证配置成功
   Run Step 4 - Verify configuration success

完成后，用户在注册"预科：入行"班级时将看到观修选择界面！
After completion, users will see meditation choice UI when enrolling in 预科：入行!
*/
