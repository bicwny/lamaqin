-- ========================================
-- 正科班级完整设置
-- Complete Setup for 正科 (Main Curriculum) Class
-- ========================================

-- 步骤1: 创建正科班级
-- Step 1: Create the 正科 class
INSERT INTO class_curricula (id, class_name, display_order, description)
VALUES (
  gen_random_uuid(),
  '正科',
  3,
  '正科阶段 - 正式修学核心佛法'
)
ON CONFLICT (class_name) DO NOTHING;

-- 步骤2: 创建新的修法项目（如果不存在）
-- Step 2: Create new practices (if they don't exist)

-- 莲师心咒 (新增)
INSERT INTO practices (id, name, type, unit, description)
VALUES (
  '31f9dd0c-119e-4ca0-b81d-b9beefb79829',
  '莲师心咒',
  'count',
  '遍',
  '正科 - 莲花生大士心咒'
)
ON CONFLICT (id) DO NOTHING;

-- 百字明 (使用新ID，因为需要不同配置)
INSERT INTO practices (id, name, type, unit, description)
VALUES (
  '498841c0-7daa-45aa-9a75-efd5c7bb4374',
  '百字明（正科）',
  'count',
  '遍',
  '正科 - 念诵百字明咒'
)
ON CONFLICT (id) DO NOTHING;

-- 《上师瑜伽速赐加持仪轨》观修上师瑜伽 (新增)
INSERT INTO practices (id, name, type, unit, description)
VALUES (
  gen_random_uuid(),
  '《上师瑜伽速赐加持仪轨》观修上师瑜伽',
  'time',
  '座',
  '正科 - 上师瑜伽速赐加持仪轨观修'
)
ON CONFLICT (name) DO NOTHING;

-- 观修密法班实修法 (新增)
INSERT INTO practices (id, name, type, unit, description)
VALUES (
  gen_random_uuid(),
  '观修密法班实修法',
  'time',
  '座',
  '正科 - 密法班实修观修'
)
ON CONFLICT (name) DO NOTHING;

-- 步骤3: 获取班级ID和修法ID（用于验证）
-- Step 3: Get class ID and practice IDs (for verification)
SELECT 
  '正科班级 (Class)' as type,
  id, 
  class_name,
  display_order,
  description
FROM class_curricula 
WHERE class_name = '正科';

SELECT 
  '修法列表 (Practices)' as type,
  id,
  name,
  type,
  unit,
  description
FROM practices 
WHERE name IN (
  '莲师心咒',
  '百字明（正科）',
  '《上师瑜伽速赐加持仪轨》观修上师瑜伽',
  '前行实修法',
  '观修密法班实修法'
);

-- 步骤4: 添加计数类修法到正科班级（持续修行，无总数限制）
-- Step 4: Add count-based practices to 正科 (ongoing, no total target)

-- 莲师心咒：每天1000遍，持续修行
INSERT INTO class_required_practices (
  id, 
  class_id, 
  practice_id, 
  target_count,
  daily_target, 
  practice_category,
  is_required,
  is_optional,
  choice_group
)
SELECT 
  gen_random_uuid(),
  cc.id,
  '31f9dd0c-119e-4ca0-b81d-b9beefb79829',
  NULL,  -- 持续修行，无总数限制
  1000,  -- 每天1000遍
  'count',
  TRUE,
  FALSE,
  NULL
FROM class_curricula cc
WHERE cc.class_name = '正科'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 百字明：每天100遍，持续修行
INSERT INTO class_required_practices (
  id, 
  class_id, 
  practice_id, 
  target_count,
  daily_target, 
  practice_category,
  is_required,
  is_optional,
  choice_group
)
SELECT 
  gen_random_uuid(),
  cc.id,
  '498841c0-7daa-45aa-9a75-efd5c7bb4374',
  NULL,  -- 持续修行，无总数限制
  100,   -- 每天100遍
  'count',
  TRUE,
  FALSE,
  NULL
FROM class_curricula cc
WHERE cc.class_name = '正科'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 步骤5: 添加观修选择（三选一，每天一座）
-- Step 5: Add meditation choices (choose one, one session per day)

-- 《上师瑜伽速赐加持仪轨》观修上师瑜伽
INSERT INTO class_required_practices (
  id, 
  class_id, 
  practice_id, 
  target_count,
  daily_target, 
  total_sessions,
  weekly_sessions,
  min_duration_minutes,
  practice_category,
  is_required,
  is_optional,
  choice_group
)
SELECT 
  gen_random_uuid(),
  cc.id,
  p.id,
  NULL,
  NULL,
  NULL,     -- 持续修行，无总座数限制
  7,        -- 每周7次（每天一座）
  NULL,     -- 时间不限
  'session',
  TRUE,
  TRUE,     -- 可选（三选一）
  '观修选择'
FROM class_curricula cc
CROSS JOIN practices p
WHERE cc.class_name = '正科' 
  AND p.name = '《上师瑜伽速赐加持仪轨》观修上师瑜伽'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 《前行实修法》
INSERT INTO class_required_practices (
  id, 
  class_id, 
  practice_id, 
  target_count,
  daily_target, 
  total_sessions,
  weekly_sessions,
  min_duration_minutes,
  practice_category,
  is_required,
  is_optional,
  choice_group
)
SELECT 
  gen_random_uuid(),
  cc.id,
  p.id,
  NULL,
  NULL,
  NULL,     -- 持续修行，无总座数限制
  7,        -- 每周7次（每天一座）
  NULL,     -- 时间不限
  'session',
  TRUE,
  TRUE,     -- 可选（三选一）
  '观修选择'
FROM class_curricula cc
CROSS JOIN practices p
WHERE cc.class_name = '正科' 
  AND p.name = '前行实修法'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 观修密法班实修法
INSERT INTO class_required_practices (
  id, 
  class_id, 
  practice_id, 
  target_count,
  daily_target, 
  total_sessions,
  weekly_sessions,
  min_duration_minutes,
  practice_category,
  is_required,
  is_optional,
  choice_group
)
SELECT 
  gen_random_uuid(),
  cc.id,
  p.id,
  NULL,
  NULL,
  NULL,     -- 持续修行，无总座数限制
  7,        -- 每周7次（每天一座）
  NULL,     -- 时间不限
  'session',
  TRUE,
  TRUE,     -- 可选（三选一）
  '观修选择'
FROM class_curricula cc
CROSS JOIN practices p
WHERE cc.class_name = '正科' 
  AND p.name = '观修密法班实修法'
ON CONFLICT (class_id, practice_id) DO NOTHING;

-- 步骤6: 验证配置
-- Step 6: Verify configuration

SELECT 
  '✅ 正科班级修法配置' as status,
  cc.class_name,
  p.name as practice_name,
  crp.practice_category,
  CASE 
    WHEN crp.choice_group IS NOT NULL THEN crp.choice_group
    ELSE '必修'
  END as requirement_type,
  CASE 
    WHEN crp.practice_category = 'count' THEN CONCAT(COALESCE(crp.daily_target::text, '无'), '遍/天')
    WHEN crp.practice_category = 'time' THEN CONCAT(COALESCE(crp.weekly_sessions::text, '无'), '座/周')
  END as daily_requirement,
  CASE
    WHEN crp.target_count IS NULL THEN '持续修行'
    ELSE CONCAT(crp.target_count, '遍')
  END as total_target
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE cc.class_name = '正科'
ORDER BY crp.practice_category, crp.choice_group NULLS FIRST, p.name;

-- ========================================
-- 配置说明 (Configuration Summary)
-- ========================================
/*
正科班级要求：

【计数类修法 - 持续修行】
1. 莲师心咒：每天1000遍，无总数限制
2. 百字明：每天100遍，无总数限制

【观修类修法 - 三选一，持续修行】
用户从以下三个修法中选择一个：
1. 《上师瑜伽速赐加持仪轨》观修上师瑜伽
2. 《前行实修法》
3. 观修密法班实修法

每天一座，时间不限

完成后，用户在注册"正科"班级时将看到：
- 两个必修的计数类修法自动添加
- 观修选择界面，让用户选择三个观修法之一
*/
