-- ========================================
-- 正科新增课程 SQL 脚本
-- Add 5 New Courses to 正科 Class
-- ========================================
-- 在 Supabase SQL Editor 中运行此脚本
-- Run this script in Supabase SQL Editor
--
-- 新增课程 (New Courses):
-- 1. 三戒要解(上) - 22课
-- 2. 缘起赞 - 8课
-- 3. 中观四百论 - 72课
-- 4. 中观根本慧论 - 114课
-- 5. 中观庄严论释 - 128课
-- ========================================

BEGIN;

-- ========================================
-- 步骤1: 确保 display_order 列存在
-- Step 1: Ensure display_order column exists
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'class_required_courses'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE class_required_courses
    ADD COLUMN display_order INTEGER;
    
    RAISE NOTICE '✅ Added display_order column to class_required_courses';
  ELSE
    RAISE NOTICE '✓ display_order column already exists';
  END IF;
END $$;

-- ========================================
-- 步骤2: 插入新课程到 courses 表
-- Step 2: Insert new courses into courses table
-- ========================================

INSERT INTO courses (name, total_lessons, description) VALUES
('三戒要解(上)', 22, '正科 - 别解脱戒、菩萨戒、密乘戒三戒要解（上）'),
('缘起赞', 8, '正科 - 龙树菩萨缘起赞颂'),
('中观四百论', 72, '正科 - 圣天菩萨中观四百论'),
('中观根本慧论', 114, '正科 - 龙树菩萨中观根本慧论'),
('中观庄严论释', 128, '正科 - 静命论师中观庄严论释')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 步骤3: 获取 正科 班级ID（用于验证）
-- Step 3: Get 正科 class ID (for verification)
-- ========================================

DO $$
DECLARE
  zhengke_class_id UUID;
  class_count INTEGER;
BEGIN
  SELECT id INTO zhengke_class_id
  FROM class_curricula
  WHERE class_name = '正科';
  
  IF zhengke_class_id IS NULL THEN
    RAISE EXCEPTION '❌ 错误: 正科 class not found. Please ensure 正科 class exists before running this script.';
  ELSE
    RAISE NOTICE '✓ Found 正科 class with ID: %', zhengke_class_id;
  END IF;
END $$;

-- ========================================
-- 步骤4: 链接新课程到 正科 班级
-- Step 4: Link new courses to 正科 class
-- ========================================

-- 获取正科现有课程的最大 display_order
-- Get max display_order for existing 正科 courses
WITH max_order AS (
  SELECT COALESCE(MAX(crc.display_order), 0) as max_order
  FROM class_required_courses crc
  JOIN class_curricula cc ON crc.class_id = cc.id
  WHERE cc.class_name = '正科'
),
-- 插入新课程链接，自动递增 display_order
-- Insert new course links with auto-incrementing display_order
new_courses AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY 
      CASE name
        WHEN '三戒要解(上)' THEN 1
        WHEN '缘起赞' THEN 2
        WHEN '中观四百论' THEN 3
        WHEN '中观根本慧论' THEN 4
        WHEN '中观庄严论释' THEN 5
      END
    ) as seq
  FROM courses
  WHERE name IN (
    '三戒要解(上)',
    '缘起赞',
    '中观四百论',
    '中观根本慧论',
    '中观庄严论释'
  )
)
INSERT INTO class_required_courses (
  class_id,
  course_id,
  required_study_types,
  optional_status_fields,
  display_order
)
SELECT
  cc.id as class_id,
  nc.id as course_id,
  ARRAY['听上师传承', '看法本'] as required_study_types,
  ARRAY['共修', '讲考'] as optional_status_fields,
  mo.max_order + nc.seq as display_order
FROM class_curricula cc
CROSS JOIN new_courses nc
CROSS JOIN max_order mo
WHERE cc.class_name = '正科'
ON CONFLICT (class_id, course_id) DO NOTHING;

-- ========================================
-- 步骤5: 验证插入结果
-- Step 5: Verify insertions
-- ========================================

-- 显示新增的课程
-- Display newly added courses
SELECT 
  '✅ 新增课程列表' as status,
  name as course_name,
  total_lessons,
  description
FROM courses
WHERE name IN (
  '三戒要解(上)',
  '缘起赞',
  '中观四百论',
  '中观根本慧论',
  '中观庄严论释'
)
ORDER BY 
  CASE name
    WHEN '三戒要解(上)' THEN 1
    WHEN '缘起赞' THEN 2
    WHEN '中观四百论' THEN 3
    WHEN '中观根本慧论' THEN 4
    WHEN '中观庄严论释' THEN 5
  END;

-- 显示正科所有课程及其顺序
-- Display all 正科 courses with their order
SELECT 
  '✅ 正科所有课程（按顺序）' as status,
  COALESCE(crc.display_order, 999) as display_order,
  c.name as course_name,
  c.total_lessons,
  crc.required_study_types,
  crc.optional_status_fields
FROM class_required_courses crc
JOIN class_curricula cc ON crc.class_id = cc.id
JOIN courses c ON crc.course_id = c.id
WHERE cc.class_name = '正科'
ORDER BY COALESCE(crc.display_order, 999), c.name;

-- 统计信息
-- Statistics
SELECT 
  '✅ 统计摘要' as status,
  COUNT(*) as total_courses,
  SUM(c.total_lessons) as total_lessons
FROM class_required_courses crc
JOIN class_curricula cc ON crc.class_id = cc.id
JOIN courses c ON crc.course_id = c.id
WHERE cc.class_name = '正科';

COMMIT;

-- ========================================
-- 执行完成提示
-- Completion Message
-- ========================================
SELECT '🎉 脚本执行完成！正科已成功添加5门新课程' as message;

-- ========================================
-- 脚本说明
-- Script Notes
-- ========================================
/*
执行结果 (Expected Results):
- 5门新课程已添加到 courses 表
- 5门课程已链接到正科班级
- display_order 自动分配（在现有课程之后）
- 默认学习类型：听上师传承、看法本
- 默认可选项：共修、讲考

新增课程总课数 (Total Lessons): 344课
1. 三戒要解(上) - 22课
2. 缘起赞 - 8课
3. 中观四百论 - 72课
4. 中观根本慧论 - 114课
5. 中观庄严论释 - 128课

后续步骤 (Next Steps):
1. 在 Supabase SQL Editor 中执行此脚本
2. 检查验证查询的输出
3. 已注册正科的学生将自动看到这些新课程
4. 新学生注册正科时也会包含这些课程
*/
